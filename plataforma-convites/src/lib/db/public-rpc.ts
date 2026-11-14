import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { Pool } from "pg";

/**
 * Chamada de funções PÚBLICAS do banco (catálogo), sempre com o papel `anon`:
 * as mesmas políticas RLS valem em qualquer ambiente.
 *
 * - Produção: Supabase (chave publicável) → PostgREST `.rpc()`.
 * - Desenvolvimento/E2E sem Supabase: LOCAL_PG_URL aponta para um Postgres local
 *   (somente localhost) e a função roda em transação com `set local role anon`.
 */
export type PublicRpc = "catalog_categories" | "catalog_facets" | "catalog_search" | "catalog_template";

let pool: Pool | null = null;
let supabase: SupabaseClient | null = null;

function localPool() {
  const url = process.env.LOCAL_PG_URL;
  if (!url) return null;
  const host = new URL(url).hostname;
  if (host !== "127.0.0.1" && host !== "localhost") throw new Error("LOCAL_PG_URL só pode apontar para localhost");
  pool ??= new Pool({ connectionString: url, max: 4 });
  return pool;
}

export async function publicRpc<T>(fn: PublicRpc, args: Record<string, unknown> = {}): Promise<T> {
  const entries = Object.entries(args).filter(([, v]) => v !== undefined);
  const p = localPool();
  if (p) {
    const named = entries.map(([k], i) => {
      if (!/^p_[a-z_]+$/.test(k)) throw new Error("argumento inválido");
      return `${k} => $${i + 1}`;
    });
    const client = await p.connect();
    try {
      await client.query("begin");
      await client.query(`select set_config('request.jwt.claims', '{"role":"anon"}', true)`);
      await client.query("set local role anon");
      const r = await client.query(`select public.${fn}(${named.join(", ")}) as v`, entries.map(([, v]) => v));
      await client.query("commit");
      return r.rows[0].v as T;
    } catch (e) {
      await client.query("rollback");
      throw e;
    } finally {
      client.release();
    }
  }
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) throw new Error("Banco não configurado: defina o Supabase ou LOCAL_PG_URL (dev)");
  supabase ??= createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
  const { data, error } = await supabase.rpc(fn, Object.fromEntries(entries));
  if (error) throw new Error(`rpc ${fn}: ${error.message}`);
  return data as T;
}
