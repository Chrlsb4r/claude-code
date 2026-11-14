import { afterAll, beforeAll, describe, expect, it } from "vitest";
import type { Client } from "pg";
import { asService, asUser, buyInvitation, connect, createUser, futureDate, skipDb } from "./helpers";

describe.skipIf(skipDb())("convite público, validade e RSVP", () => {
  let c: Client;
  let owner: string;
  beforeAll(async () => {
    c = await connect();
    owner = await createUser(c);
  });
  afterAll(() => c?.end());

  const pub = (slug: string) => asService(c, () => c.query(`select get_public_invitation($1) as j`, [slug])).then((r) => r.rows[0].j);
  const rsvp = (slug: string, o: { name?: string; attending?: boolean; companions?: number; names?: string[]; client?: string; guestToken?: string | null; editToken?: string | null } = {}) =>
    asService(c, () =>
      c.query(`select submit_rsvp($1,$2,$3,$4,$5,$6,$7,$8,$9) as r`, [
        slug, o.name ?? "Convidado", o.attending ?? true, o.companions ?? 0, o.names ?? [], "", o.client ?? "cli", o.guestToken ?? null, o.editToken ?? null,
      ]),
    ).then((r) => r.rows[0].r);

  it("link é único, não sequencial e exibe apenas dados destinados aos convidados", async () => {
    const a = await buyInvitation(c, owner);
    const b = await buyInvitation(c, owner);
    expect(a.slug).toMatch(/^helena-[a-z2-9]{8}$/);
    expect(a.slug).not.toBe(b.slug);
    const j = await pub(a.slug);
    expect(j.state).toBe("active");
    const text = JSON.stringify(j);
    for (const secret of [owner, a.order.id, a.order.external_reference, "user_id", "owner_id", "total_cents", "@teste.local"]) {
      expect(text).not.toContain(secret);
    }
    expect(j.content.venue_name).toBe("Salão Jardim");
  });

  it("validade = início + 24h, calculada no servidor", async () => {
    const { eventId } = await buyInvitation(c, owner, { event_date: "2027-01-20", event_time: "15:00" });
    const r = await c.query(`select starts_at, expires_at from events where id = $1`, [eventId]);
    expect(r.rows[0].starts_at.toISOString()).toBe("2027-01-20T18:00:00.000Z");
    expect(r.rows[0].expires_at.toISOString()).toBe("2027-01-21T18:00:00.000Z");
  });

  it("após expirar: página de encerrado e RSVP bloqueado (sem depender de agendador)", async () => {
    const { slug, eventId } = await buyInvitation(c, owner);
    // Simula a passagem do tempo movendo o evento para 24h atrás.
    await c.query(`update events set starts_at = now() - interval '24 hours', rsvp_deadline = null where id = $1`, [eventId]);
    const j = await pub(slug);
    expect(j).toEqual({ slug, state: "expired" });
    await expect(rsvp(slug)).rejects.toThrow(/convite_expirado/);
  });

  it("convidado confirma e o painel diferencia respostas de pessoas", async () => {
    const { slug, eventId } = await buyInvitation(c, owner);
    await rsvp(slug, { name: "Ana", companions: 2, client: "a" });
    await rsvp(slug, { name: "Bruno", attending: false, client: "b" });
    const s = await asUser(c, owner, () => c.query(`select * from event_rsvp_summary where event_id = $1`, [eventId]));
    expect(s.rows[0]).toMatchObject({ responses: "2", attending_responses: "1", declined_responses: "1", people_confirmed: "3", companions_total: "2" });
  });

  it("bloqueia acompanhantes acima do limite e manipulação de quantidade", async () => {
    const { slug } = await buyInvitation(c, owner);
    await expect(rsvp(slug, { companions: 3 })).rejects.toThrow(/acompanhantes_excedidos/);
    await expect(rsvp(slug, { companions: -1 })).rejects.toThrow(/acompanhantes_excedidos/);
  });

  it("convidado altera a resposta com o token de edição; sem permissão, não altera", async () => {
    const { slug, eventId } = await buyInvitation(c, owner);
    const first = await rsvp(slug, { name: "Carla", companions: 1 });
    expect(first.edit_token).toHaveLength(32);
    const upd = await rsvp(slug, { name: "Carla", attending: false, editToken: first.edit_token });
    expect(upd.updated).toBe(true);
    const r = await c.query(`select attending, companions from rsvp_responses where id = $1`, [first.response_id]);
    expect(r.rows[0]).toEqual({ attending: false, companions: 0 });
    const hist = await asUser(c, owner, () => c.query(`select action from audit_logs where entity_id = $1`, [first.response_id]));
    expect(hist.rows.map((x) => x.action)).toContain("rsvp.updated");
    await c.query(`update events set allow_response_edit = false where id = $1`, [eventId]);
    await expect(rsvp(slug, { name: "Carla", editToken: first.edit_token })).rejects.toThrow(/edicao_nao_permitida/);
  });

  it("detecta possível duplicidade por nome normalizado", async () => {
    const { slug } = await buyInvitation(c, owner);
    await rsvp(slug, { name: "José Silva", client: "x1" });
    const dup = await rsvp(slug, { name: "  jose   silva ", client: "x2" });
    expect(dup.possible_duplicate).toBe(true);
  });

  it("modo restrito exige link individual com token seguro", async () => {
    const { slug, eventId } = await buyInvitation(c, owner);
    await c.query(`update events set rsvp_mode = 'restricted' where id = $1`, [eventId]);
    await expect(rsvp(slug)).rejects.toThrow(/convite_restrito/);
    const g = await asService(c, () => c.query(`select owner_create_guest($1,$2,'Tia Rosa',1) as g`, [owner, eventId]));
    const token = g.rows[0].g.token;
    expect(token).toHaveLength(32);
    await rsvp(slug, { name: "Tia Rosa", companions: 1, guestToken: token });
    await expect(rsvp(slug, { name: "Tia Rosa", companions: 2, guestToken: token })).rejects.toThrow(/acompanhantes_excedidos/);
    await expect(rsvp(slug, { guestToken: "x".repeat(32) })).rejects.toThrow(/link_individual_invalido/);
  });

  it("rate limiting por cliente", async () => {
    const { slug } = await buyInvitation(c, owner);
    for (let i = 0; i < 20; i++) await rsvp(slug, { name: `P${i}`, client: "spam" });
    await expect(rsvp(slug, { name: "P21", client: "spam" })).rejects.toThrow(/muitas_tentativas/);
  });

  it("confirmações simultâneas não se perdem", async () => {
    const { slug, eventId } = await buyInvitation(c, owner);
    const clients = await Promise.all(Array.from({ length: 8 }, () => connect()));
    await Promise.all(
      clients.map((cl, i) =>
        asService(cl, () => cl.query(`select submit_rsvp($1,$2,true,1,'{}','', $3)`, [slug, `Pessoa ${i}`, `c${i}`])),
      ),
    );
    await Promise.all(clients.map((cl) => cl.end()));
    const s = await asUser(c, owner, () => c.query(`select people_confirmed from event_rsvp_summary where event_id = $1`, [eventId]));
    expect(s.rows[0].people_confirmed).toBe("16");
  });

  it("encerramento antecipado do RSVP pelo dono", async () => {
    const { slug, eventId } = await buyInvitation(c, owner);
    await asService(c, () => c.query(`select owner_close_rsvp($1,$2)`, [owner, eventId]));
    await expect(rsvp(slug)).rejects.toThrow(/rsvp_encerrado/);
  });

  it("remarcação: recalcula validade, no máximo 2 vezes e dentro do limite", async () => {
    const { eventId } = await buyInvitation(c, owner);
    const resched = (d: string) => asService(c, () => c.query(`select owner_reschedule_event($1,$2,$3,'20:00') as e`, [owner, eventId, d]));
    const r1 = await resched(futureDate(20));
    expect(r1.rows[0].e).toBeInstanceOf(Date);
    await expect(resched(futureDate(400))).rejects.toThrow(/data_alem_do_limite/);
    await resched(futureDate(30));
    await expect(resched(futureDate(40))).rejects.toThrow(/limite_remarcacoes/);
    const e = await c.query(`select extract(epoch from expires_at - starts_at)::int as s from events where id = $1`, [eventId]);
    expect(e.rows[0].s).toBe(86400);
  });
});
