import { Client } from "pg";
import { randomUUID } from "node:crypto";

const URL = (process.env.TEST_DATABASE_ADMIN_URL ?? "postgres://postgres:postgres@127.0.0.1:5432/postgres").replace(
  /\/[^/]+$/,
  "/convites_test",
);

export const skipDb = () => process.env.SKIP_DB_TESTS === "1";

export async function connect() {
  const c = new Client({ connectionString: URL });
  await c.connect();
  return c;
}

type Role = "service_role" | "authenticated" | "anon";

/** Executa fn numa transação com o papel e as claims de JWT indicadas (como o PostgREST faz). */
export async function as<T>(c: Client, role: Role, claims: Record<string, unknown>, fn: () => Promise<T>): Promise<T> {
  await c.query("begin");
  try {
    await c.query(`select set_config('request.jwt.claims', $1, true)`, [JSON.stringify(claims)]);
    await c.query(`set local role ${role}`);
    const r = await fn();
    await c.query("commit");
    return r;
  } catch (e) {
    await c.query("rollback");
    throw e;
  }
}

export const asService = <T>(c: Client, fn: () => Promise<T>) => as(c, "service_role", { role: "service_role" }, fn);
export const asUser = <T>(c: Client, uid: string, fn: () => Promise<T>, aal = "aal1") =>
  as(c, "authenticated", { sub: uid, role: "authenticated", aal }, fn);
export const asAnon = <T>(c: Client, fn: () => Promise<T>) => as(c, "anon", { role: "anon" }, fn);

export async function createUser(c: Client, email = `${randomUUID()}@teste.local`) {
  const r = await c.query(`insert into auth.users (email, raw_user_meta_data) values ($1, '{"full_name":"Teste"}') returning id`, [email]);
  return r.rows[0].id as string;
}

/** Data local (America/Sao_Paulo) daqui a N dias, no formato do editor. */
export function futureDate(days: number) {
  const d = new Date(Date.now() + days * 86400000);
  return d.toISOString().slice(0, 10);
}

export async function publishedVersionId(c: Client, templateSlug = "ursinho-festeiro") {
  const r = await c.query(
    `select v.id from public.template_versions v join public.templates t on t.id = v.template_id where t.slug = $1 and v.published_at is not null`,
    [templateSlug],
  );
  return r.rows[0].id as string;
}

/** Cria rascunho + pedido + pagamento aprovado e devolve o slug publicado. */
export async function buyInvitation(c: Client, uid: string, overrides: Record<string, string> = {}) {
  const versionId = await publishedVersionId(c);
  const data = {
    honoree_name: "Helena",
    title: "Aniversário da Helena",
    event_date: futureDate(10),
    event_time: "15:00",
    timezone: "America/Sao_Paulo",
    venue_name: "Salão Jardim",
    address: "Rua das Flores, 100",
    max_companions: "2",
    ...overrides,
  };
  const draft = await asUser(c, uid, () =>
    c.query(`insert into public.drafts (user_id, template_version_id, data) values ($1, $2, $3) returning id`, [uid, versionId, data]),
  );
  const order = await asService(c, () => c.query(`select * from public.create_order($1, $2)`, [uid, draft.rows[0].id]));
  const o = order.rows[0];
  const pay = await asService(c, () =>
    c.query(`select public.apply_payment_update($1, $2, $3, 'approved', 'accredited', $4, 'BRL', 'pix') as r`, [
      `evt-${randomUUID()}`, `pay-${randomUUID()}`, o.external_reference, o.total_cents,
    ]),
  );
  const slug = await c.query(
    `select i.public_slug, e.id as event_id from public.invitations i join public.events e on e.id = i.event_id where e.order_id = $1`,
    [o.id],
  );
  return { order: o, payResult: pay.rows[0].r, slug: slug.rows[0].public_slug as string, eventId: slug.rows[0].event_id as string };
}
