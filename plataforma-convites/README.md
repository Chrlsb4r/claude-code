# Plataforma de convites digitais

Loja de convites web interativos: catálogo → personalização → pagamento (Mercado Pago) → link exclusivo → RSVP → painel.

- Arquitetura, banco, segurança e plano por fases: [`docs/ARQUITETURA.md`](docs/ARQUITETURA.md)
- Stack: Next.js 16 (App Router) · TypeScript · Tailwind 4 · Supabase (Postgres/Auth/Storage/Realtime) · Zod · Vitest · Playwright

## Desenvolvimento local

```bash
npm install
cp .env.example .env.local      # preencha com um projeto Supabase de desenvolvimento
npm run dev
```

### Banco
As migrations ficam em `supabase/migrations` e são aplicadas no Supabase com `supabase db push`.
Sem Docker, dá para validá-las em um Postgres 16 local:

```bash
npm run db:reset     # cria convites_dev com shim do Supabase + migrations + seed
npm test             # unitários + integração do banco (cria convites_test descartável)
```

O shim (`supabase/local/00_supabase_shim.sql`) existe só para testes locais. Nunca o aplique em um projeto Supabase.

## Scripts
`dev` · `build` · `start` · `lint` · `typecheck` · `test` · `test:unit` · `db:reset`
