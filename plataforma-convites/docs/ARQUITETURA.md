# Arquitetura — Plataforma de convites digitais

## 1. Inspeção do ambiente (Fase 1)

- Diretório de trabalho: o repositório `chrlsb4r/claude-code`, que já contém outros conteúdos (fork do Claude Code, `criativos-convites/`).
- Para não afetar nada existente, a plataforma foi criada em uma pasta própria e isolada, **`plataforma-convites/`**, com `package.json`, lockfile, `.gitignore` e configurações independentes. Nenhum arquivo fora dela foi alterado.
- **Recomendação:** mover a pasta para um repositório dedicado antes do deploy (o histórico da pasta pode ser extraído com `git subtree split`).
- Disponível no ambiente: Node 22, npm 10, PostgreSQL 16, Chromium + Playwright. **Docker não roda** neste contêiner, então o `supabase start` (stack local completa) não está disponível. As migrations são testadas em um Postgres puro com um shim mínimo do Supabase (`supabase/local/00_supabase_shim.sql`: papéis `anon`/`authenticated`/`service_role`, `auth.uid()`, `auth.jwt()`).

## 2. Visão geral

```
Navegador ──► Next.js (Netlify)
               ├─ Páginas públicas (catálogo, modelo, convite /c/[slug])  → cache de CDN só para conteúdo público
               ├─ Área do cliente / admin                                  → dinâmicas, nunca cacheadas
               ├─ Route Handlers / Server Actions                          → validação Zod + autorização
               │     ├─ cliente "usuário" (cookie httpOnly) ─► Postgres com RLS (leituras)
               │     └─ cliente "secreto" (somente servidor) ─► funções SECURITY DEFINER (escritas críticas)
               └─ Webhook Mercado Pago ─► consulta o pagamento na API ─► apply_payment_update()
Supabase: Postgres + Auth (MFA p/ admin) + Storage (uploads privados) + Realtime (RSVP no painel)
```

### Princípios
1. **O banco é a última linha de defesa.** Toda tabela tem RLS habilitado e forçado (`force row level security`); `anon` não lê nenhuma tabela privada.
2. **Escritas críticas só por funções do banco**, executáveis apenas por `service_role`: `create_order`, `apply_payment_update`, `submit_rsvp`, `owner_*`. O servidor chama essas funções passando o ID do usuário obtido de `supabase.auth.getUser()` (sessão verificada), nunca de um campo do navegador.
3. **Preço nunca vem do cliente**: `create_order` lê o preço da versão publicada do template e aplica cupom no banco.
4. **Pagamento só é aceito após confirmação no servidor**: o webhook usa a notificação apenas como gatilho, consulta o pagamento na API do Mercado Pago com o token secreto e só então chama `apply_payment_update` (valida valor, moeda e pedido; idempotente por `event_key` e por estado; trava o pedido com `FOR UPDATE`).
5. **Validade calculada no servidor e verificada em cada acesso**: `events.expires_at = starts_at + 24h` (trigger). `get_public_invitation` e `submit_rsvp` comparam com `now()` a cada chamada; nenhuma tarefa agendada é necessária para bloquear.
6. **Sem HTML do cliente**: o conteúdo do convite é um JSON validado por um esquema derivado de `template_fields` (Zod, `strict`) e renderizado por componentes React do próprio sistema (texto escapado). Cores e fontes só a partir de listas autorizadas; links apenas `https:`.

## 3. Dependências (versões estáveis com ≥ 2 semanas de publicação)

| Pacote | Versão | Licença | Uso |
|---|---|---|---|
| next | 16.4.3 | MIT | Framework (App Router, Cache Components, `proxy.ts`) |
| react / react-dom | 19.3.0 | MIT | UI |
| tailwindcss | 4.x | MIT | Estilos / tokens |
| @supabase/supabase-js | 2.118.0 | MIT | Cliente Supabase |
| @supabase/ssr | 0.12.7 | MIT | Sessão via cookies no servidor |
| zod | 4.6.7 | MIT | Validação (cliente e servidor) |
| react-hook-form / @hookform/resolvers | 7.92 / 7.x | MIT | Formulários do editor |
| mercadopago | 3.6.2 | MIT | SDK oficial (Pix e cartão) |
| date-fns / @date-fns/tz | 4.x / 1.x | MIT | Fusos e datas |
| server-only | 0.0.1 | MIT | Impede importar segredos no navegador |
| vitest | 4.1.12 | MIT | Testes unitários e de banco |
| @playwright/test | 1.63.0 | Apache-2.0 | E2E (mesma versão do Chromium instalado) |
| @axe-core/playwright | 4.11.0 | MPL-2.0 | Auditoria automática de acessibilidade nos E2E (só desenvolvimento, sem modificações) |
| pg | 8.x | MIT | Testes de integração do banco |

Planejadas para as próximas fases: `shadcn/ui` (componentes copiados para o projeto, MIT; Fase 2), `@sentry/nextjs` (MIT; Fase 7), `supabase` CLI (MIT; deploy das migrations).
Observação: `.npmrc` usa `legacy-peer-deps=true` porque o npm 10 falha ao resolver peers opcionais do Vite usados pelo Vitest 4 (erro interno `edgesOut`).

## 4. Banco de dados

Migration: `supabase/migrations/20261114000001_schema_base.sql`. Seed de desenvolvimento: `supabase/seed.sql` (11 categorias + 5 modelos de demonstração; sem dados de clientes).

| Entidade | Papel | Quem lê (RLS) | Quem escreve |
|---|---|---|---|
| profiles, notification_preferences | dados do usuário | o próprio usuário | o próprio usuário (colunas limitadas) |
| roles, user_roles | papéis `admin`, `support` | o próprio usuário | service_role (painel admin) |
| categories, themes, templates, template_versions, template_fields | catálogo versionado | público (somente publicados) | admin via servidor |
| drafts | rascunhos do editor | dono | dono (só versões publicadas) |
| coupons | cupons | ninguém (só servidor) | admin via servidor |
| orders, order_items | pedido com preço congelado e snapshot dos dados | dono / suporte | `create_order`, `apply_payment_update` |
| payments, payment_events | estado do pagamento; log idempotente de notificações | dono (payments) | `apply_payment_update` |
| events | dados privados do evento e configurações de RSVP | dono / suporte | `publish_order`, `owner_*` |
| invitations | conteúdo público + slug imprevisível | dono; público só via `get_public_invitation` | `publish_order` |
| guests | links individuais (token guardado como hash SHA-256) | dono (sem a coluna do hash) | `owner_create_guest` |
| rsvp_responses, rsvp_attendees | respostas | dono (sem o hash do token de edição) | `submit_rsvp` |
| invitation_views | visualizações (hash do visitante, 1 por dia) | dono | `record_invitation_view` |
| rate_limits | janelas de limite | ninguém | funções |
| audit_logs | auditoria; `owner_id` torna a linha visível ao comprador | admin / dono | funções |

Regras de negócio no banco:
- Versão publicada de template é **imutável** (trigger); pedidos antigos continuam válidos.
- Slug público: `nome-xxxxxxxx` (8 caracteres aleatórios de um alfabeto de 31 símbolos ≈ 8,5×10¹¹ combinações), gerado com `gen_random_bytes`.
- Remarcação: no máximo 2 vezes, sempre no futuro, até 180 dias após a data original (ou da publicação), e nunca depois de expirado. A validade é recalculada automaticamente.
- Pedido pendente expira em 24h. Estados de pagamento cobertos: `pending`, `in_process`, `authorized`, `approved`, `rejected`, `cancelled`, `refunded`, `charged_back`, `in_mediation`.
- Estorno ou chargeback desativam o convite. Contestação (`in_mediation`) marca o pedido como `disputed` e mantém o convite ativo até a decisão.
- Admin/suporte só têm efeito com sessão **MFA (`aal2`)**.
- Painel: a view `event_rsvp_summary` diferencia **respostas** de **pessoas confirmadas** (1 + acompanhantes).

## 5. Plano por fases

| Fase | Entregas | Estado |
|---|---|---|
| 1. Fundação | Inspeção, projeto isolado, arquitetura, schema + RLS + funções, design system, testes de banco | **Concluída** |
| 2. Loja | Home completa, catálogo com filtros (ocasião, tema, estilo, preço, recursos), busca, páginas de ocasião, página do modelo com demo fictícia | **Concluída** |
| 3. Personalização (próxima) | Auth (Supabase), editor mobile-first por etapas, prévia em tempo real com marca d'água, autosave de rascunho, uploads validados (Storage privado) | |
| 4. Comercialização | Checkout Mercado Pago (Pix + cartão), webhook com assinatura verificada + consulta à API, publicação automática, CSP com nonce | Requer credenciais de teste |
| 5. Eventos | Página `/c/[slug]`, RSVP público e individual, anti-bot (Turnstile ou equivalente), página de encerrado | |
| 6. Dashboards | Painel do comprador (Realtime, CSV, histórico), painel admin (templates versionados, pedidos, cupons, auditoria) | |
| 7. Qualidade | E2E Playwright (cenários 1–20, desktop e mobile), auditoria de dependências, acessibilidade WCAG 2.2 AA, Sentry, LGPD (documentos para revisão jurídica), backup/restauração testados | |

## 6. Decisões e pendências conhecidas

- **Identidade visual (revisada a pedido do cliente):** o público principal compra convites de ~R$ 29,90 e quer cores e movimento. A paleta "papelaria fina" do prompt inicial foi substituída por uma identidade colorida e lúdica (Fredoka + Nunito, botões 3D, confete). A serifada Cormorant fica reservada aos convites clássicos (casamento, 15 anos, corporativo). Tokens em `src/app/globals.css`; nome provisório da loja em `src/lib/brand.ts`.
- **Personagens animados próprios** (`src/components/characters/characters.tsx`): urso, dinossauro, coelhinha, astronauta, leão, baleia e balões, em SVG, acenando em loop, piscando e balançando (somente `transform`, desligado por `prefers-reduced-motion`). **Não usamos personagens licenciados (ex.: Disney):** vendê-los sem licença viola direitos autorais e de marca e expõe a loja a remoções, bloqueio no meio de pagamento e ações judiciais. Personagens licenciados só com contrato de licenciamento.
- **Convites animados** (`layout.variant = "animado"`, com `character` e `scene`): cenário animado (céu, espaço, selva, mar, festa, doce) com bandeirinhas, personagem acenando e um cartão branco com as informações, o que garante contraste AA independentemente do cenário. A cor de destaque que o cliente escolhe vem de uma lista fechada, toda com contraste AA para texto branco.

- **Leitura do catálogo por funções SQL** (`supabase/migrations/20261114000002_catalogo.sql`, `SECURITY INVOKER`): a lógica de busca/filtros fica no banco e roda com o papel `anon`, então as políticas RLS valem igualmente em produção e em desenvolvimento. O adaptador `src/lib/db/public-rpc.ts` chama a função via Supabase (`.rpc`) ou, em dev/E2E sem Supabase, via Postgres local (`LOCAL_PG_URL`, aceito só para localhost) com `set local role anon`.
- **Cache:** páginas públicas são pré-renderizadas (Cache Components) com `cacheLife('hours')` e a tag `catalogo`; o painel admin (Fase 6) chamará `revalidateTag('catalogo')` ao publicar modelos. Busca/filtros usam partial prerender: casca estática + resultados por requisição (também cacheados por combinação de filtros).
- **404 de modelo inexistente:** na primeira renderização sob demanda o Next responde `200` com `<meta name="robots" content="noindex">` (streaming; ver docs do Next em `loading.md > Status codes`); depois que a página é salva, responde `404`. Um 404 imediato exigiria consultar o banco no proxy a cada requisição, o que a documentação desaconselha.
- **Capas dos modelos** são o próprio convite renderizado com dados fictícios (sem imagens a carregar). A marca d'água "PRÉVIA" fica reservada para a prévia do conteúdo do cliente antes do pagamento.

- **Netlify:** compatível com Next 16 via adaptador OpenNext da Netlify. Validar na Fase 7 (Cache Components e `proxy.ts`) antes do primeiro deploy.
- **Rate limit** do RSVP está no banco (20 por hora por cliente e evento). O hash do cliente é calculado no servidor com segredo (`VISITOR_HASH_SECRET`), sem guardar IP. Na Fase 5 entra também um desafio anti-bot.
- **Realtime + privilégios por coluna:** validar no Supabase real que o canal de `rsvp_responses` respeita a restrição de colunas (o hash do token de edição nunca deve sair). Se não respeitar, publicar uma view/tabela espelho sem a coluna.
- Nada aqui foi testado contra um projeto Supabase real ou contra o Mercado Pago. Essas integrações só serão declaradas concluídas depois de testadas com credenciais de teste.
