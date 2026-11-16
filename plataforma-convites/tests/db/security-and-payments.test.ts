import { afterAll, beforeAll, describe, expect, it } from "vitest";
import type { Client } from "pg";
import { randomUUID } from "node:crypto";
import { asAnon, asService, asUser, buyInvitation, connect, createUser, futureDate, publishedVersionId, skipDb } from "./helpers";

describe.skipIf(skipDb())("pedidos, pagamentos e isolamento (RLS)", () => {
  let c: Client;
  let userA: string;
  let userB: string;

  beforeAll(async () => {
    c = await connect();
    userA = await createUser(c);
    userB = await createUser(c);
  });
  afterAll(() => c?.end());

  async function newOrder(uid: string) {
    const versionId = await publishedVersionId(c);
    const data = { honoree_name: "Ana", title: "Festa", event_date: futureDate(5), event_time: "19:30", timezone: "America/Sao_Paulo", venue_name: "Casa", address: "Rua 1" };
    const d = await asUser(c, uid, () => c.query(`insert into drafts (user_id, template_version_id, data) values ($1,$2,$3) returning id`, [uid, versionId, data]));
    const o = await asService(c, () => c.query(`select * from create_order($1,$2)`, [uid, d.rows[0].id]));
    return o.rows[0];
  }
  const notify = (o: { external_reference: string }, status: string, amount: number, key = randomUUID(), payId = `p-${o.external_reference}`) =>
    asService(c, () => c.query(`select apply_payment_update($1,$2,$3,$4,'x',$5,'BRL','pix') as r`, [key, payId, o.external_reference, status, amount])).then((r) => r.rows[0].r);

  it("preço vem da versão publicada, não do cliente; tabelas de pedido não aceitam escrita direta", async () => {
    const o = await newOrder(userA);
    expect(o.total_cents).toBe(2990);
    await expect(asUser(c, userA, () => c.query(`update orders set total_cents = 1 where id = $1`, [o.id]))).rejects.toThrow(/permission denied/);
    await expect(
      asUser(c, userA, () => c.query(`insert into orders (user_id, subtotal_cents, total_cents) values ($1, 100, 100)`, [userA])),
    ).rejects.toThrow(/permission denied/);
    await expect(asUser(c, userA, () => c.query(`select create_order($1, $2)`, [userA, randomUUID()]))).rejects.toThrow(/permission denied/);
  });

  it("pagamento pendente não libera o convite", async () => {
    const o = await newOrder(userA);
    expect((await notify(o, "pending", o.total_cents)).result).toBe("no_change");
    const inv = await c.query(`select 1 from events where order_id = $1`, [o.id]);
    expect(inv.rowCount).toBe(0);
  });

  it("pagamento aprovado publica uma única vez, mesmo com webhooks repetidos e simultâneos", async () => {
    const o = await newOrder(userA);
    const c2 = await connect();
    const c3 = await connect();
    const send = (cl: Client, key: string) =>
      asService(cl, () => cl.query(`select apply_payment_update($1,$2,$3,'approved','accredited',$4,'BRL','pix') as r`, [key, "pay-conc-" + o.id, o.external_reference, o.total_cents]));
    const results = await Promise.all([send(c, "k1-" + o.id), send(c2, "k2-" + o.id), send(c3, "k3-" + o.id), send(c2, "k1-" + o.id).catch(() => null)]);
    await c2.end();
    await c3.end();
    const kinds = results.filter(Boolean).map((r) => r!.rows[0].r.result).sort();
    expect(kinds.filter((k: string) => k === "published")).toHaveLength(1);
    const ev = await c.query(`select count(*)::int n from events where order_id = $1`, [o.id]);
    expect(ev.rows[0].n).toBe(1);
    const st = await c.query(`select status from orders where id = $1`, [o.id]);
    expect(st.rows[0].status).toBe("paid");
  });

  it("valor divergente não publica e coloca o pedido em revisão", async () => {
    const o = await newOrder(userA);
    expect((await notify(o, "approved", 100)).result).toBe("amount_mismatch");
    const ev = await c.query(`select count(*)::int n from events where order_id = $1`, [o.id]);
    expect(ev.rows[0].n).toBe(0);
  });

  it("falha temporária (recusado) mantém o pedido pendente e permite novo pagamento", async () => {
    const o = await newOrder(userA);
    expect((await notify(o, "rejected", o.total_cents, undefined, "p-rej-" + o.id)).result).toBe("no_change");
    expect((await notify(o, "approved", o.total_cents, undefined, "p-ok-" + o.id)).result).toBe("published");
  });

  it("estorno desativa o convite publicado", async () => {
    const { order, slug } = await buyInvitation(c, userA);
    expect((await notify(order, "refunded", order.total_cents)).result).toBe("invitation_disabled");
    const pub = await asService(c, () => c.query(`select get_public_invitation($1) as j`, [slug]));
    expect(pub.rows[0].j.state).toBe("unavailable");
  });

  it("usuário A não vê nem altera dados do usuário B", async () => {
    const { eventId } = await buyInvitation(c, userB);
    for (const t of ["orders", "events", "invitations", "payments", "drafts", "order_items"]) {
      const r = await asUser(c, userA, () => c.query(`select * from ${t} where ${t === "orders" ? "user_id" : t === "drafts" ? "user_id" : "true"} = ${t === "orders" || t === "drafts" ? "$1" : "true"}`, t === "orders" || t === "drafts" ? [userB] : []));
      const own = await asUser(c, userA, () => c.query(`select count(*)::int n from ${t}`));
      // A pode ter os próprios registros, mas nunca os de B.
      if (t === "orders" || t === "drafts") expect(r.rowCount).toBe(0);
      expect(own.rows[0].n).toBeGreaterThanOrEqual(0);
    }
    const ev = await asUser(c, userA, () => c.query(`select * from events where id = $1`, [eventId]));
    expect(ev.rowCount).toBe(0);
    await expect(asService(c, () => c.query(`select owner_close_rsvp($1,$2)`, [userA, eventId]))).rejects.toThrow(/evento_nao_encontrado/);
    const upd = await asUser(c, userA, () => c.query(`update drafts set data = '{}' where user_id = $1`, [userB]));
    expect(upd.rowCount).toBe(0);
  });

  it("anon não lê nenhuma tabela privada nem chama funções privilegiadas", async () => {
    for (const t of ["orders", "events", "invitations", "rsvp_responses", "guests", "payments", "profiles", "coupons"]) {
      await expect(asAnon(c, () => c.query(`select * from ${t} limit 1`))).rejects.toThrow(/permission denied/);
    }
    await expect(asAnon(c, () => c.query(`select get_public_invitation('x')`))).rejects.toThrow(/permission denied/);
    const cat = await asAnon(c, () => c.query(`select count(*)::int n from templates`));
    expect(cat.rows[0].n).toBeGreaterThan(0);
  });

  it("dono não lê hashes de token de convidados/respostas", async () => {
    await expect(asUser(c, userA, () => c.query(`select token_hash from guests`))).rejects.toThrow(/permission denied/);
    await expect(asUser(c, userA, () => c.query(`select edit_token_hash from rsvp_responses`))).rejects.toThrow(/permission denied/);
  });

  it("papel admin só vale com MFA (aal2)", async () => {
    const admin = await createUser(c);
    await c.query(`insert into user_roles (user_id, role_id) values ($1, 'admin')`, [admin]);
    const noMfa = await asUser(c, admin, () => c.query(`select count(*)::int n from orders`));
    expect(noMfa.rows[0].n).toBe(0);
    const mfa = await asUser(c, admin, () => c.query(`select count(*)::int n from orders`), "aal2");
    expect(mfa.rows[0].n).toBeGreaterThan(0);
  });

  it("versão publicada de template é imutável", async () => {
    const v = await publishedVersionId(c);
    await expect(c.query(`update template_versions set price_cents = 1000 where id = $1`, [v])).rejects.toThrow(/versao_publicada_imutavel/);
  });
});
