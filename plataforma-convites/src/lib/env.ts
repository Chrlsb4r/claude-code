import { z } from "zod";

/** Variáveis públicas (podem ir ao navegador). */
const publicSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.url(),
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: z.string().min(20),
  NEXT_PUBLIC_SITE_URL: z.url(),
});

/** Segredos: só existem no servidor. */
const serverSchema = z.object({
  SUPABASE_SECRET_KEY: z.string().min(20),
  MERCADOPAGO_ACCESS_TOKEN: z.string().min(20),
  MERCADOPAGO_WEBHOOK_SECRET: z.string().min(16),
  VISITOR_HASH_SECRET: z.string().min(32),
});

export function publicEnv() {
  return publicSchema.parse({
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  });
}
export type ServerEnv = z.infer<typeof serverSchema>;
export const serverSchemaForTests = serverSchema;
