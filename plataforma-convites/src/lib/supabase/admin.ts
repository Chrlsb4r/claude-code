import "server-only";
import { createClient } from "@supabase/supabase-js";
import { publicEnv } from "@/lib/env";
import { serverEnv } from "@/lib/env.server";

/**
 * Cliente com a chave secreta (ignora RLS). Usado SOMENTE para chamar as funções
 * privilegiadas (create_order, apply_payment_update, submit_rsvp...), sempre
 * passando o ID do usuário obtido de requireUser(), nunca do corpo da requisição.
 */
export function createAdminClient() {
  return createClient(publicEnv().NEXT_PUBLIC_SUPABASE_URL, serverEnv().SUPABASE_SECRET_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
