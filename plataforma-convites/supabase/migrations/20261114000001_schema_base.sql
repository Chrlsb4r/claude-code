-- =====================================================================
-- Plataforma de convites digitais — schema base
-- Convenções:
--   * Horários sempre em timestamptz (UTC); o fuso do evento fica em events.timezone.
--   * Leituras do comprador: RLS com o JWT do usuário.
--   * Escritas privilegiadas (pedido, pagamento, publicação, RSVP): funções
--     SECURITY DEFINER executáveis apenas por service_role, chamadas pelo servidor
--     depois de autenticar o usuário/validar a entrada. O ID do ator é derivado
--     da sessão verificada no servidor, nunca de um campo enviado pelo navegador.
--   * anon não lê nenhuma tabela diretamente.
-- =====================================================================

set check_function_bodies = off;

-- ---------- tipos ----------
create type public.template_status as enum ('draft', 'published', 'archived');
create type public.order_status as enum ('pending', 'paid', 'expired', 'canceled', 'refunded', 'charged_back', 'disputed', 'review');
create type public.payment_status as enum ('pending', 'in_process', 'authorized', 'approved', 'rejected', 'cancelled', 'refunded', 'charged_back', 'in_mediation');
create type public.invitation_status as enum ('active', 'disabled');
create type public.rsvp_mode as enum ('public', 'restricted');
create type public.field_type as enum ('text', 'textarea', 'date', 'time', 'timezone', 'number', 'url', 'select', 'color', 'font', 'image');
create type public.discount_kind as enum ('percent', 'fixed');

-- ---------- perfis e papéis ----------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text check (char_length(full_name) <= 120),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.roles (
  id text primary key check (id ~ '^[a-z_]{2,32}$'),
  description text not null
);
insert into public.roles (id, description) values
  ('admin', 'Acesso total ao painel administrativo (exige MFA)'),
  ('support', 'Atendimento: leitura de pedidos e convites (exige MFA)');

create table public.user_roles (
  user_id uuid not null references auth.users (id) on delete cascade,
  role_id text not null references public.roles (id),
  granted_at timestamptz not null default now(),
  granted_by uuid references auth.users (id),
  primary key (user_id, role_id)
);

create table public.notification_preferences (
  user_id uuid primary key references auth.users (id) on delete cascade,
  email_on_rsvp boolean not null default true,
  email_daily_summary boolean not null default false,
  updated_at timestamptz not null default now()
);

-- ---------- catálogo ----------
create table public.categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9-]{2,60}$'),
  name text not null check (char_length(name) between 2 and 80),
  description text check (char_length(description) <= 500),
  sort_order int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.themes (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9-]{2,60}$'),
  name text not null check (char_length(name) between 2 and 80),
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.templates (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9-]{2,80}$'),
  name text not null check (char_length(name) between 2 and 120),
  description text check (char_length(description) <= 2000),
  category_id uuid not null references public.categories (id),
  theme_id uuid references public.themes (id),
  style text check (char_length(style) <= 60),
  cover_path text check (char_length(cover_path) <= 300),
  status public.template_status not null default 'draft',
  current_version_id uuid,
  is_featured boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index templates_category_idx on public.templates (category_id) where status = 'published';
create index templates_theme_idx on public.templates (theme_id);

create table public.template_versions (
  id uuid primary key default gen_random_uuid(),
  template_id uuid not null references public.templates (id) on delete restrict,
  version int not null check (version > 0),
  price_cents int not null check (price_cents between 100 and 1000000),
  currency char(3) not null default 'BRL' check (currency = 'BRL'),
  layout jsonb not null default '{}'::jsonb check (jsonb_typeof(layout) = 'object'),
  style_options jsonb not null default '{}'::jsonb check (jsonb_typeof(style_options) = 'object'),
  features text[] not null default '{}',
  published_at timestamptz,
  created_at timestamptz not null default now(),
  unique (template_id, version)
);
alter table public.templates
  add constraint templates_current_version_fk foreign key (current_version_id) references public.template_versions (id);

create table public.template_fields (
  id uuid primary key default gen_random_uuid(),
  template_version_id uuid not null references public.template_versions (id) on delete cascade,
  key text not null check (key ~ '^[a-z][a-z0-9_]{1,40}$'),
  type public.field_type not null,
  label text not null check (char_length(label) between 1 and 80),
  step text not null default 'basico' check (step ~ '^[a-z_]{2,30}$'),
  required boolean not null default false,
  max_length int check (max_length between 1 and 2000),
  options jsonb not null default '{}'::jsonb check (jsonb_typeof(options) = 'object'),
  sort_order int not null default 0,
  unique (template_version_id, key)
);

-- Versões publicadas são imutáveis: pedidos antigos continuam apontando para elas.
create function public.forbid_published_version_change() returns trigger
language plpgsql set search_path = '' as $$
begin
  if tg_table_name = 'template_versions' then
    if old.published_at is not null and (
      new.price_cents, new.currency, new.layout, new.style_options, new.features, new.template_id, new.version
    ) is distinct from (
      old.price_cents, old.currency, old.layout, old.style_options, old.features, old.template_id, old.version
    ) then
      raise exception 'versao_publicada_imutavel' using errcode = 'P0001';
    end if;
    return new;
  else
    if exists (select 1 from public.template_versions v
               where v.id = coalesce(old.template_version_id, new.template_version_id) and v.published_at is not null) then
      raise exception 'versao_publicada_imutavel' using errcode = 'P0001';
    end if;
    return coalesce(new, old);
  end if;
end $$;
create trigger template_versions_immutable before update on public.template_versions
  for each row execute function public.forbid_published_version_change();
create trigger template_fields_immutable before insert or update or delete on public.template_fields
  for each row execute function public.forbid_published_version_change();

-- ---------- rascunhos ----------
create table public.drafts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  template_version_id uuid not null references public.template_versions (id),
  data jsonb not null default '{}'::jsonb check (jsonb_typeof(data) = 'object' and pg_column_size(data) <= 65536),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index drafts_user_idx on public.drafts (user_id, updated_at desc);

-- ---------- cupons ----------
create table public.coupons (
  id uuid primary key default gen_random_uuid(),
  code extensions.citext not null unique check (code ~ '^[A-Za-z0-9_-]{3,30}$'),
  kind public.discount_kind not null,
  value int not null check (value > 0),
  max_redemptions int check (max_redemptions > 0),
  redeemed_count int not null default 0 check (redeemed_count >= 0),
  valid_from timestamptz,
  valid_until timestamptz,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  check (kind <> 'percent' or value <= 90)
);

-- ---------- pedidos e pagamentos ----------
create table public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete restrict,
  external_reference uuid not null unique default gen_random_uuid(),
  status public.order_status not null default 'pending',
  subtotal_cents int not null check (subtotal_cents > 0),
  discount_cents int not null default 0 check (discount_cents >= 0),
  total_cents int not null check (total_cents > 0),
  currency char(3) not null default 'BRL',
  coupon_id uuid references public.coupons (id),
  provider_preference_id text,
  expires_at timestamptz not null default (now() + interval '24 hours'),
  paid_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (total_cents = subtotal_cents - discount_cents)
);
create index orders_user_idx on public.orders (user_id, created_at desc);

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  template_version_id uuid not null references public.template_versions (id),
  unit_price_cents int not null check (unit_price_cents > 0),
  draft_id uuid references public.drafts (id) on delete set null,
  data_snapshot jsonb not null check (jsonb_typeof(data_snapshot) = 'object'),
  unique (order_id)  -- um convite por pedido na v1
);

create table public.payments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete restrict,
  provider text not null default 'mercadopago',
  provider_payment_id text not null,
  status public.payment_status not null,
  status_detail text,
  method text,
  amount_cents int not null check (amount_cents >= 0),
  currency char(3) not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (provider, provider_payment_id)
);
create index payments_order_idx on public.payments (order_id);

-- Registro idempotente das notificações recebidas (uma linha por evento do gateway).
create table public.payment_events (
  id bigint generated always as identity primary key,
  provider text not null default 'mercadopago',
  event_key text not null,
  provider_payment_id text,
  result text not null,
  received_at timestamptz not null default now(),
  unique (provider, event_key)
);

-- ---------- eventos e convites ----------
create table public.events (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users (id) on delete restrict,
  order_id uuid not null unique references public.orders (id) on delete restrict,
  category_id uuid references public.categories (id),
  title text not null check (char_length(title) between 1 and 140),
  starts_at timestamptz not null,
  timezone text not null,
  expires_at timestamptz not null,              -- sempre starts_at + 24h (trigger)
  latest_allowed_start timestamptz not null,     -- limite comercial para remarcações
  date_change_count int not null default 0 check (date_change_count between 0 and 2),
  rsvp_deadline timestamptz,
  rsvp_closed_at timestamptz,
  rsvp_mode public.rsvp_mode not null default 'public',
  max_companions int not null default 0 check (max_companions between 0 and 20),
  accept_declines boolean not null default true,
  allow_response_edit boolean not null default true,
  require_companion_names boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index events_owner_idx on public.events (owner_id, starts_at desc);

create function public.events_set_expiry() returns trigger
language plpgsql set search_path = '' as $$
begin
  if not exists (select 1 from pg_catalog.pg_timezone_names where name = new.timezone) then
    raise exception 'fuso_invalido' using errcode = 'P0001';
  end if;
  -- Regra de negócio: o convite vale até exatamente 24h após o início do evento.
  new.expires_at := new.starts_at + interval '24 hours';
  return new;
end $$;
create trigger events_expiry before insert or update of starts_at, timezone on public.events
  for each row execute function public.events_set_expiry();

create table public.invitations (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null unique references public.events (id) on delete cascade,
  public_slug text not null unique check (public_slug ~ '^[a-z0-9-]{8,64}$'),
  template_version_id uuid not null references public.template_versions (id),
  content jsonb not null check (jsonb_typeof(content) = 'object' and pg_column_size(content) <= 65536),
  status public.invitation_status not null default 'active',
  published_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.guests (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events (id) on delete cascade,
  name text not null check (char_length(name) between 1 and 120),
  max_companions int check (max_companions between 0 and 20),
  token_hash bytea not null unique,
  created_at timestamptz not null default now()
);
create index guests_event_idx on public.guests (event_id);

create table public.rsvp_responses (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events (id) on delete cascade,
  guest_id uuid unique references public.guests (id) on delete set null,
  respondent_name text not null check (char_length(respondent_name) between 1 and 120),
  normalized_name text not null,
  attending boolean not null,
  companions int not null default 0 check (companions between 0 and 20),
  notes text check (char_length(notes) <= 500),
  source text not null check (source in ('public', 'guest_link', 'owner')),
  possible_duplicate boolean not null default false,
  edit_token_hash bytea unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (attending or companions = 0)
);
create index rsvp_responses_event_idx on public.rsvp_responses (event_id, created_at desc);
create index rsvp_responses_name_idx on public.rsvp_responses (event_id, normalized_name);

create table public.rsvp_attendees (
  id uuid primary key default gen_random_uuid(),
  response_id uuid not null references public.rsvp_responses (id) on delete cascade,
  name text not null check (char_length(name) between 1 and 120)
);
create index rsvp_attendees_response_idx on public.rsvp_attendees (response_id);

create table public.invitation_views (
  id bigint generated always as identity primary key,
  invitation_id uuid not null references public.invitations (id) on delete cascade,
  visitor_hash text not null check (char_length(visitor_hash) <= 128),
  viewed_on date not null default (now() at time zone 'utc')::date,
  unique (invitation_id, visitor_hash, viewed_on)
);

create table public.rate_limits (
  key text not null,
  window_start timestamptz not null,
  hits int not null default 0,
  primary key (key, window_start)
);

create table public.audit_logs (
  id bigint generated always as identity primary key,
  actor_id uuid,
  owner_id uuid,          -- quando preenchido, o comprador dono vê a linha (histórico do evento)
  action text not null,
  entity text not null,
  entity_id uuid,
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index audit_logs_owner_idx on public.audit_logs (owner_id, created_at desc) where owner_id is not null;
create index audit_logs_entity_idx on public.audit_logs (entity, entity_id);

-- =====================================================================
-- Funções auxiliares
-- =====================================================================

create function public.is_staff(p_role text default 'admin') returns boolean
language sql stable security definer set search_path = '' as $$
  -- MFA obrigatório: o papel só vale em sessões com nível de garantia aal2.
  select coalesce(auth.jwt() ->> 'aal', '') = 'aal2'
     and exists (select 1 from public.user_roles r
                 where r.user_id = auth.uid() and (r.role_id = p_role or r.role_id = 'admin'));
$$;

create function public.slugify(p text) returns text
language sql immutable set search_path = '' as $$
  select left(trim(both '-' from regexp_replace(
    translate(lower(coalesce(p, '')),
      'áàâãäåéèêëíìîïóòôõöúùûüçñý', 'aaaaaaeeeeiiiiooooouuuucny'),
    '[^a-z0-9]+', '-', 'g')), 32)
$$;

create function public.random_token(p_len int) returns text
language plpgsql volatile set search_path = '' as $$
declare
  alphabet constant text := 'abcdefghjkmnpqrstuvwxyz23456789';
  bytes bytea := extensions.gen_random_bytes(p_len);
  out text := '';
begin
  for i in 0 .. p_len - 1 loop
    out := out || substr(alphabet, (get_byte(bytes, i) % 31) + 1, 1);
  end loop;
  return out;
end $$;

create function public.secret_token() returns text
language sql volatile set search_path = '' as $$
  select translate(encode(extensions.gen_random_bytes(24), 'base64'), '+/=', '-_')
$$;

create function public.token_hash(p text) returns bytea
language sql immutable set search_path = '' as $$
  select extensions.digest(p, 'sha256')
$$;

create function public.normalize_name(p text) returns text
language sql immutable set search_path = '' as $$
  select regexp_replace(translate(lower(trim(p)), 'áàâãäéèêëíìîïóòôõöúùûüç', 'aaaaaeeeeiiiiooooouuuuc'), '\s+', ' ', 'g')
$$;

-- Converte data + hora locais + fuso IANA em instante UTC.
create function public.local_to_utc(p_date text, p_time text, p_tz text) returns timestamptz
language plpgsql stable set search_path = '' as $$
begin
  if p_date !~ '^\d{4}-\d{2}-\d{2}$' or p_time !~ '^\d{2}:\d{2}$' then
    raise exception 'data_ou_hora_invalida' using errcode = 'P0001';
  end if;
  if not exists (select 1 from pg_catalog.pg_timezone_names where name = p_tz) then
    raise exception 'fuso_invalido' using errcode = 'P0001';
  end if;
  return ((p_date || ' ' || p_time)::timestamp) at time zone p_tz;
end $$;

create function public.hit_rate_limit(p_key text, p_limit int, p_window interval) returns boolean
language plpgsql security definer set search_path = '' as $$
declare
  w timestamptz := to_timestamp(floor(extract(epoch from now()) / extract(epoch from p_window)) * extract(epoch from p_window));
  n int;
begin
  insert into public.rate_limits as r (key, window_start, hits) values (p_key, w, 1)
  on conflict (key, window_start) do update set hits = r.hits + 1
  returning hits into n;
  return n > p_limit;
end $$;

create function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, left(nullif(new.raw_user_meta_data ->> 'full_name', ''), 120))
  on conflict (id) do nothing;
  insert into public.notification_preferences (user_id) values (new.id) on conflict do nothing;
  return new;
end $$;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

create function public.touch_updated_at() returns trigger
language plpgsql set search_path = '' as $$ begin new.updated_at := now(); return new; end $$;
do $$ declare t text; begin
  foreach t in array array['profiles','templates','drafts','orders','payments','events','invitations','rsvp_responses'] loop
    execute format('create trigger %I_touch before update on public.%I for each row execute function public.touch_updated_at()', t, t);
  end loop;
end $$;

-- =====================================================================
-- Pedido: preço calculado SEMPRE no banco a partir da versão publicada.
-- =====================================================================
create function public.create_order(p_actor uuid, p_draft_id uuid, p_coupon_code text default null)
returns public.orders
language plpgsql security definer set search_path = '' as $$
declare
  d public.drafts;
  v public.template_versions;
  c public.coupons;
  o public.orders;
  disc int := 0;
  missing text;
begin
  select * into d from public.drafts where id = p_draft_id and user_id = p_actor;
  if not found then raise exception 'rascunho_nao_encontrado' using errcode = 'P0002'; end if;

  select v2.* into v from public.template_versions v2
    join public.templates t on t.id = v2.template_id
   where v2.id = d.template_version_id and v2.published_at is not null and t.status = 'published';
  if not found then raise exception 'modelo_indisponivel' using errcode = 'P0001'; end if;

  -- Campos obrigatórios da versão precisam estar preenchidos.
  select string_agg(f.key, ',') into missing from public.template_fields f
   where f.template_version_id = v.id and f.required
     and coalesce(nullif(trim(d.data ->> f.key), ''), null) is null;
  if missing is not null then raise exception 'campos_obrigatorios:%', missing using errcode = 'P0001'; end if;

  -- O evento precisa ser publicável (data/hora/fuso válidos e no futuro).
  if public.local_to_utc(d.data ->> 'event_date', d.data ->> 'event_time', d.data ->> 'timezone') <= now() then
    raise exception 'evento_no_passado' using errcode = 'P0001';
  end if;

  if p_coupon_code is not null and length(trim(p_coupon_code)) > 0 then
    select * into c from public.coupons
     where code = trim(p_coupon_code)::extensions.citext and is_active
       and (valid_from is null or valid_from <= now())
       and (valid_until is null or valid_until > now())
       and (max_redemptions is null or redeemed_count < max_redemptions);
    if not found then raise exception 'cupom_invalido' using errcode = 'P0001'; end if;
    disc := case c.kind when 'percent' then (v.price_cents * c.value) / 100 else least(c.value, v.price_cents - 100) end;
  end if;

  insert into public.orders (user_id, status, subtotal_cents, discount_cents, total_cents, currency, coupon_id)
  values (p_actor, 'pending', v.price_cents, disc, v.price_cents - disc, v.currency, c.id)
  returning * into o;

  insert into public.order_items (order_id, template_version_id, unit_price_cents, draft_id, data_snapshot)
  values (o.id, v.id, v.price_cents, d.id, d.data);

  insert into public.audit_logs (actor_id, owner_id, action, entity, entity_id, data)
  values (p_actor, p_actor, 'order.created', 'order', o.id, jsonb_build_object('total_cents', o.total_cents));
  return o;
end $$;

-- =====================================================================
-- Publicação (chamada apenas internamente por apply_payment_update).
-- =====================================================================
create function public.publish_order(p_order_id uuid) returns uuid
language plpgsql security definer set search_path = '' as $$
declare
  o public.orders;
  it public.order_items;
  t public.templates;
  ev_id uuid;
  inv_id uuid;
  starts timestamptz;
  base text;
  slug text;
  v_data jsonb;
begin
  select * into o from public.orders where id = p_order_id;
  select * into it from public.order_items where order_id = p_order_id;
  select t2.* into t from public.templates t2 join public.template_versions v on v.template_id = t2.id where v.id = it.template_version_id;
  v_data := it.data_snapshot;

  select id into inv_id from public.invitations i where i.event_id = (select id from public.events where order_id = o.id);
  if inv_id is not null then
    update public.invitations set status = 'active' where id = inv_id;  -- reativação idempotente
    return inv_id;
  end if;

  starts := public.local_to_utc(v_data ->> 'event_date', v_data ->> 'event_time', v_data ->> 'timezone');

  insert into public.events (owner_id, order_id, category_id, title, starts_at, timezone, expires_at,
                             latest_allowed_start, rsvp_deadline, max_companions)
  values (o.user_id, o.id, t.category_id,
          left(coalesce(nullif(v_data ->> 'title', ''), t.name), 140),
          starts, v_data ->> 'timezone', starts + interval '24 hours',
          greatest(starts, now()) + interval '180 days',
          case when coalesce(v_data ->> 'rsvp_deadline', '') ~ '^\d{4}-\d{2}-\d{2}$'
               then least(public.local_to_utc(v_data ->> 'rsvp_deadline', '23:59', v_data ->> 'timezone'), starts)
               else null end,
          least(greatest(coalesce(nullif(v_data ->> 'max_companions', '')::int, 0), 0), 20))
  returning id into ev_id;

  base := public.slugify(coalesce(nullif(v_data ->> 'honoree_name', ''), nullif(v_data ->> 'title', ''), 'convite'));
  if base = '' then base := 'convite'; end if;
  loop
    slug := base || '-' || public.random_token(8);
    exit when not exists (select 1 from public.invitations where public_slug = slug);
  end loop;

  insert into public.invitations (event_id, public_slug, template_version_id, content)
  values (ev_id, slug, it.template_version_id, v_data)
  returning id into inv_id;

  if o.coupon_id is not null then
    update public.coupons set redeemed_count = redeemed_count + 1 where id = o.coupon_id;
  end if;

  insert into public.audit_logs (owner_id, action, entity, entity_id, data)
  values (o.user_id, 'invitation.published', 'invitation', inv_id, jsonb_build_object('slug', slug));
  return inv_id;
end $$;

-- =====================================================================
-- Notificação de pagamento (dados JÁ confirmados pelo servidor na API do gateway).
-- Idempotente: event_key repetido não tem efeito; estado repetido também não.
-- =====================================================================
create function public.apply_payment_update(
  p_event_key text,
  p_provider_payment_id text,
  p_external_reference uuid,
  p_status public.payment_status,
  p_status_detail text,
  p_amount_cents int,
  p_currency text,
  p_method text
) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  o public.orders;
  existing public.payments;
  v_result text;
  inv uuid;
begin
  -- Serializa pelo pedido para que notificações simultâneas não publiquem duas vezes.
  select * into o from public.orders where external_reference = p_external_reference for update;
  if not found then
    insert into public.payment_events (event_key, provider_payment_id, result)
    values (p_event_key, p_provider_payment_id, 'unknown_order') on conflict do nothing;
    return jsonb_build_object('result', 'unknown_order');
  end if;

  insert into public.payment_events (event_key, provider_payment_id, result)
  values (p_event_key, p_provider_payment_id, 'processing')
  on conflict (provider, event_key) do nothing;
  if not found then
    return jsonb_build_object('result', 'duplicate_event', 'order_status', o.status);
  end if;

  select * into existing from public.payments where provider = 'mercadopago' and provider_payment_id = p_provider_payment_id;
  if found and existing.order_id <> o.id then
    raise exception 'pagamento_de_outro_pedido' using errcode = 'P0001';
  end if;

  insert into public.payments (order_id, provider_payment_id, status, status_detail, method, amount_cents, currency)
  values (o.id, p_provider_payment_id, p_status, left(p_status_detail, 120), left(p_method, 40), p_amount_cents, p_currency)
  on conflict (provider, provider_payment_id) do update
    set status = excluded.status, status_detail = excluded.status_detail,
        method = excluded.method, amount_cents = excluded.amount_cents, currency = excluded.currency;

  if p_status = 'approved' then
    if o.status = 'paid' then
      v_result := 'already_paid';
    elsif o.status not in ('pending', 'expired', 'review') then
      v_result := 'ignored_status_' || o.status;
    elsif p_amount_cents <> o.total_cents or p_currency <> o.currency then
      update public.orders set status = 'review' where id = o.id;
      v_result := 'amount_mismatch';
    else
      update public.orders set status = 'paid', paid_at = now() where id = o.id;
      inv := public.publish_order(o.id);
      v_result := 'published';
    end if;
  elsif p_status in ('refunded', 'charged_back') then
    update public.orders set status = p_status::text::public.order_status where id = o.id;
    update public.invitations i set status = 'disabled'
      from public.events e where e.id = i.event_id and e.order_id = o.id;
    v_result := 'invitation_disabled';
  elsif p_status = 'in_mediation' then
    if o.status = 'paid' then update public.orders set status = 'disputed' where id = o.id; end if;
    v_result := 'disputed';
  else
    v_result := 'no_change';  -- pending, in_process, authorized, rejected, cancelled
  end if;

  update public.payment_events set result = v_result
   where provider = 'mercadopago' and event_key = p_event_key;
  insert into public.audit_logs (owner_id, action, entity, entity_id, data)
  values (o.user_id, 'payment.' || p_status, 'order', o.id,
          jsonb_build_object('result', v_result, 'amount_cents', p_amount_cents, 'payment_id', p_provider_payment_id));
  return jsonb_build_object('result', v_result, 'invitation_id', inv);
end $$;

-- =====================================================================
-- Página pública do convite: devolve apenas o que o convidado deve ver.
-- =====================================================================
create function public.get_public_invitation(p_slug text) returns jsonb
language plpgsql stable security definer set search_path = '' as $$
declare
  r record;
  state text;
begin
  select i.id, i.public_slug, i.content, i.status, v.layout, v.style_options, v.version,
         e.starts_at, e.timezone, e.expires_at, e.rsvp_deadline, e.rsvp_closed_at, e.rsvp_mode,
         e.max_companions, e.accept_declines, e.allow_response_edit, e.require_companion_names, o.status as order_status
    into r
    from public.invitations i
    join public.events e on e.id = i.event_id
    join public.orders o on o.id = e.order_id
    join public.template_versions v on v.id = i.template_version_id
   where i.public_slug = p_slug;
  if not found then return null; end if;

  state := case
    when r.status <> 'active' or r.order_status not in ('paid', 'disputed') then 'unavailable'
    when now() >= r.expires_at then 'expired'
    else 'active' end;
  if state <> 'active' then
    return jsonb_build_object('slug', r.public_slug, 'state', state);
  end if;

  return jsonb_build_object(
    'slug', r.public_slug,
    'state', state,
    'content', r.content,
    'layout', r.layout,
    'style_options', r.style_options,
    'event', jsonb_build_object('starts_at', r.starts_at, 'timezone', r.timezone, 'expires_at', r.expires_at),
    'rsvp', jsonb_build_object(
      'open', r.rsvp_closed_at is null and (r.rsvp_deadline is null or now() <= r.rsvp_deadline),
      'deadline', r.rsvp_deadline,
      'mode', r.rsvp_mode,
      'max_companions', r.max_companions,
      'accept_declines', r.accept_declines,
      'allow_edit', r.allow_response_edit,
      'require_companion_names', r.require_companion_names));
end $$;

create function public.record_invitation_view(p_slug text, p_visitor_hash text) returns void
language sql security definer set search_path = '' as $$
  insert into public.invitation_views (invitation_id, visitor_hash)
  select i.id, left(p_visitor_hash, 128) from public.invitations i where i.public_slug = p_slug and i.status = 'active'
  on conflict do nothing;
$$;

-- =====================================================================
-- RSVP
-- =====================================================================
create function public.submit_rsvp(
  p_slug text,
  p_name text,
  p_attending boolean,
  p_companions int,
  p_companion_names text[],
  p_notes text,
  p_client_hash text,
  p_guest_token text default null,
  p_edit_token text default null
) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  inv public.invitations;
  e public.events;
  o public.orders;
  g public.guests;
  resp public.rsvp_responses;
  max_c int;
  new_edit_token text;
  norm text := public.normalize_name(p_name);
  dup boolean;
  v_companions int := coalesce(p_companions, 0);
  v_names text[] := coalesce(p_companion_names, '{}');
begin
  select * into inv from public.invitations where public_slug = p_slug;
  if not found then raise exception 'convite_nao_encontrado' using errcode = 'P0002'; end if;
  -- Trava o evento: confirmações simultâneas são processadas em série.
  select * into e from public.events where id = inv.event_id for update;
  select * into o from public.orders where id = e.order_id;

  if inv.status <> 'active' or o.status not in ('paid', 'disputed') then
    raise exception 'convite_indisponivel' using errcode = 'P0001'; end if;
  if now() >= e.expires_at then raise exception 'convite_expirado' using errcode = 'P0001'; end if;
  if e.rsvp_closed_at is not null or (e.rsvp_deadline is not null and now() > e.rsvp_deadline) then
    raise exception 'rsvp_encerrado' using errcode = 'P0001'; end if;
  if public.hit_rate_limit('rsvp:' || e.id || ':' || coalesce(p_client_hash, '-'), 20, interval '1 hour') then
    raise exception 'muitas_tentativas' using errcode = 'P0001'; end if;

  if char_length(trim(coalesce(p_name, ''))) not between 1 and 120 then
    raise exception 'nome_invalido' using errcode = 'P0001'; end if;
  if char_length(coalesce(p_notes, '')) > 500 then raise exception 'observacao_longa' using errcode = 'P0001'; end if;
  if not p_attending and not e.accept_declines then raise exception 'recusa_nao_aceita' using errcode = 'P0001'; end if;
  if not p_attending then v_companions := 0; v_names := '{}'; end if;

  if p_guest_token is not null then
    select * into g from public.guests where token_hash = public.token_hash(p_guest_token) and event_id = e.id;
    if not found then raise exception 'link_individual_invalido' using errcode = 'P0001'; end if;
  elsif e.rsvp_mode = 'restricted' then
    raise exception 'convite_restrito' using errcode = 'P0001';
  end if;

  max_c := coalesce(g.max_companions, e.max_companions);
  if v_companions < 0 or v_companions > max_c then raise exception 'acompanhantes_excedidos' using errcode = 'P0001'; end if;
  if e.require_companion_names and cardinality(v_names) <> v_companions then
    raise exception 'nomes_acompanhantes' using errcode = 'P0001'; end if;
  if cardinality(v_names) > v_companions or exists (select 1 from unnest(v_names) n where char_length(trim(n)) not between 1 and 120) then
    raise exception 'nomes_acompanhantes' using errcode = 'P0001'; end if;

  -- Localiza resposta existente (link individual ou token de edição).
  if g.id is not null then
    select * into resp from public.rsvp_responses where guest_id = g.id;
  elsif p_edit_token is not null then
    select * into resp from public.rsvp_responses
     where edit_token_hash = public.token_hash(p_edit_token) and event_id = e.id;
    if not found then raise exception 'token_edicao_invalido' using errcode = 'P0001'; end if;
  end if;

  if resp.id is not null then
    if not e.allow_response_edit then raise exception 'edicao_nao_permitida' using errcode = 'P0001'; end if;
    update public.rsvp_responses
       set respondent_name = trim(p_name), normalized_name = norm, attending = p_attending,
           companions = v_companions, notes = nullif(trim(p_notes), '')
     where id = resp.id;
    delete from public.rsvp_attendees where response_id = resp.id;
    insert into public.rsvp_attendees (response_id, name) select resp.id, trim(n) from unnest(v_names) n;
    insert into public.audit_logs (owner_id, action, entity, entity_id, data)
    values (e.owner_id, 'rsvp.updated', 'rsvp_response', resp.id,
            jsonb_build_object('before', jsonb_build_object('attending', resp.attending, 'companions', resp.companions),
                               'after', jsonb_build_object('attending', p_attending, 'companions', v_companions)));
    return jsonb_build_object('response_id', resp.id, 'updated', true);
  end if;

  select exists (select 1 from public.rsvp_responses where event_id = e.id and normalized_name = norm) into dup;
  new_edit_token := case when g.id is null then public.secret_token() end;

  insert into public.rsvp_responses (event_id, guest_id, respondent_name, normalized_name, attending, companions,
                                     notes, source, possible_duplicate, edit_token_hash)
  values (e.id, g.id, trim(p_name), norm, p_attending, v_companions, nullif(trim(p_notes), ''),
          case when g.id is null then 'public' else 'guest_link' end, dup,
          case when new_edit_token is not null then public.token_hash(new_edit_token) end)
  returning * into resp;
  insert into public.rsvp_attendees (response_id, name) select resp.id, trim(n) from unnest(v_names) n;

  return jsonb_build_object('response_id', resp.id, 'updated', false, 'edit_token', new_edit_token,
                            'possible_duplicate', dup);
end $$;

-- =====================================================================
-- Ações do comprador (o servidor passa o ID do usuário da sessão verificada).
-- =====================================================================
create function public.owner_create_guest(p_actor uuid, p_event_id uuid, p_name text, p_max_companions int default null)
returns jsonb
language plpgsql security definer set search_path = '' as $$
declare tok text := public.secret_token(); gid uuid;
begin
  if not exists (select 1 from public.events where id = p_event_id and owner_id = p_actor) then
    raise exception 'evento_nao_encontrado' using errcode = 'P0002'; end if;
  insert into public.guests (event_id, name, max_companions, token_hash)
  values (p_event_id, trim(p_name), p_max_companions, public.token_hash(tok)) returning id into gid;
  return jsonb_build_object('guest_id', gid, 'token', tok);  -- token bruto só existe nesta resposta
end $$;

create function public.owner_close_rsvp(p_actor uuid, p_event_id uuid) returns void
language plpgsql security definer set search_path = '' as $$
begin
  update public.events set rsvp_closed_at = coalesce(rsvp_closed_at, now())
   where id = p_event_id and owner_id = p_actor;
  if not found then raise exception 'evento_nao_encontrado' using errcode = 'P0002'; end if;
  insert into public.audit_logs (actor_id, owner_id, action, entity, entity_id)
  values (p_actor, p_actor, 'rsvp.closed', 'event', p_event_id);
end $$;

-- Remarcação: no máximo 2 vezes, sempre no futuro, nunca depois do limite comercial,
-- e nunca depois que o convite expirou (evita prolongar o serviço indefinidamente).
create function public.owner_reschedule_event(p_actor uuid, p_event_id uuid, p_date text, p_time text) returns timestamptz
language plpgsql security definer set search_path = '' as $$
declare e public.events; new_start timestamptz;
begin
  select * into e from public.events where id = p_event_id and owner_id = p_actor for update;
  if not found then raise exception 'evento_nao_encontrado' using errcode = 'P0002'; end if;
  if now() >= e.expires_at then raise exception 'convite_expirado' using errcode = 'P0001'; end if;
  if e.date_change_count >= 2 then raise exception 'limite_remarcacoes' using errcode = 'P0001'; end if;
  new_start := public.local_to_utc(p_date, p_time, e.timezone);
  if new_start <= now() then raise exception 'evento_no_passado' using errcode = 'P0001'; end if;
  if new_start > e.latest_allowed_start then raise exception 'data_alem_do_limite' using errcode = 'P0001'; end if;
  update public.events
     set starts_at = new_start, date_change_count = date_change_count + 1,
         rsvp_deadline = case when rsvp_deadline > new_start then new_start else rsvp_deadline end
   where id = e.id;
  update public.invitations
     set content = content || jsonb_build_object('event_date', p_date, 'event_time', p_time)
   where event_id = e.id;
  insert into public.audit_logs (actor_id, owner_id, action, entity, entity_id, data)
  values (p_actor, p_actor, 'event.rescheduled', 'event', e.id,
          jsonb_build_object('from', e.starts_at, 'to', new_start));
  return new_start + interval '24 hours';
end $$;

-- Painel: contagens no servidor (respostas ≠ pessoas).
create view public.event_rsvp_summary with (security_invoker = true) as
select e.id as event_id,
       count(r.id) as responses,
       count(r.id) filter (where r.attending) as attending_responses,
       count(r.id) filter (where not r.attending) as declined_responses,
       coalesce(sum(1 + r.companions) filter (where r.attending), 0) as people_confirmed,
       coalesce(sum(r.companions) filter (where r.attending), 0) as companions_total,
       (select count(distinct (v.visitor_hash, v.viewed_on)) from public.invitation_views v
          join public.invitations i on i.id = v.invitation_id where i.event_id = e.id) as views
  from public.events e
  left join public.rsvp_responses r on r.event_id = e.id
 group by e.id;

-- =====================================================================
-- Privilégios: nada por padrão; libera o mínimo.
-- =====================================================================
revoke all on all tables in schema public from anon, authenticated;
revoke all on all sequences in schema public from anon, authenticated;
revoke execute on all functions in schema public from public, anon, authenticated;
alter default privileges in schema public revoke all on tables from anon, authenticated;
alter default privileges in schema public revoke execute on functions from public, anon, authenticated;

grant select on public.categories, public.themes, public.templates, public.template_versions, public.template_fields to anon, authenticated;
grant select on public.profiles, public.user_roles, public.roles, public.notification_preferences,
  public.drafts, public.orders, public.order_items, public.payments, public.events, public.invitations,
  public.guests, public.rsvp_responses, public.rsvp_attendees, public.audit_logs, public.invitation_views, public.event_rsvp_summary to authenticated;
grant update (full_name) on public.profiles to authenticated;
grant update (email_on_rsvp, email_daily_summary) on public.notification_preferences to authenticated;
grant insert (template_version_id, data, user_id), update (data), delete on public.drafts to authenticated;
-- is_staff() devolve false para anon; precisa ser executável porque as políticas do catálogo a usam.
grant execute on function public.is_staff(text) to anon, authenticated;

grant all on all tables in schema public to service_role;
grant all on all sequences in schema public to service_role;
grant execute on all functions in schema public to service_role;

-- =====================================================================
-- Row Level Security
-- =====================================================================
do $$ declare t text; begin
  foreach t in array array['profiles','roles','user_roles','notification_preferences','categories','themes','templates',
    'template_versions','template_fields','drafts','coupons','orders','order_items','payments','payment_events','events',
    'invitations','guests','rsvp_responses','rsvp_attendees','invitation_views','rate_limits','audit_logs'] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('alter table public.%I force row level security', t);
  end loop;
end $$;

-- Catálogo público
create policy categories_read on public.categories for select to anon, authenticated using (is_active or public.is_staff('support'));
create policy themes_read on public.themes for select to anon, authenticated using (is_active or public.is_staff('support'));
create policy templates_read on public.templates for select to anon, authenticated using (status = 'published' or public.is_staff('support'));
create policy template_versions_read on public.template_versions for select to anon, authenticated using (
  (published_at is not null and exists (select 1 from public.templates t where t.id = template_id and t.status = 'published'))
  or public.is_staff('support'));
create policy template_fields_read on public.template_fields for select to anon, authenticated using (
  exists (select 1 from public.template_versions v join public.templates t on t.id = v.template_id
          where v.id = template_version_id and ((v.published_at is not null and t.status = 'published') or public.is_staff('support'))));

-- Dados do próprio usuário
create policy profiles_own on public.profiles for select to authenticated using (id = auth.uid() or public.is_staff('support'));
create policy profiles_update_own on public.profiles for update to authenticated using (id = auth.uid()) with check (id = auth.uid());
create policy roles_read on public.roles for select to authenticated using (true);
create policy user_roles_own on public.user_roles for select to authenticated using (user_id = auth.uid() or public.is_staff());
create policy notif_own on public.notification_preferences for select to authenticated using (user_id = auth.uid());
create policy notif_update_own on public.notification_preferences for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy drafts_select_own on public.drafts for select to authenticated using (user_id = auth.uid());
create policy drafts_insert_own on public.drafts for insert to authenticated with check (
  user_id = auth.uid() and exists (select 1 from public.template_versions v join public.templates t on t.id = v.template_id
                                   where v.id = template_version_id and v.published_at is not null and t.status = 'published'));
create policy drafts_update_own on public.drafts for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy drafts_delete_own on public.drafts for delete to authenticated using (user_id = auth.uid());

create policy orders_own on public.orders for select to authenticated using (user_id = auth.uid() or public.is_staff('support'));
create policy order_items_own on public.order_items for select to authenticated using (
  exists (select 1 from public.orders o where o.id = order_id and (o.user_id = auth.uid() or public.is_staff('support'))));
create policy payments_own on public.payments for select to authenticated using (
  exists (select 1 from public.orders o where o.id = order_id and (o.user_id = auth.uid() or public.is_staff('support'))));

create policy events_own on public.events for select to authenticated using (owner_id = auth.uid() or public.is_staff('support'));
create policy invitations_own on public.invitations for select to authenticated using (
  exists (select 1 from public.events e where e.id = event_id and (e.owner_id = auth.uid() or public.is_staff('support'))));
create policy guests_own on public.guests for select to authenticated using (
  exists (select 1 from public.events e where e.id = event_id and (e.owner_id = auth.uid() or public.is_staff('support'))));
create policy rsvp_own on public.rsvp_responses for select to authenticated using (
  exists (select 1 from public.events e where e.id = event_id and (e.owner_id = auth.uid() or public.is_staff('support'))));
create policy rsvp_attendees_own on public.rsvp_attendees for select to authenticated using (
  exists (select 1 from public.rsvp_responses r join public.events e on e.id = r.event_id
          where r.id = response_id and (e.owner_id = auth.uid() or public.is_staff('support'))));
create policy audit_owner on public.audit_logs for select to authenticated using (owner_id = auth.uid() or public.is_staff());
create policy invitation_views_own on public.invitation_views for select to authenticated using (
  exists (select 1 from public.invitations i join public.events e on e.id = i.event_id
          where i.id = invitation_id and (e.owner_id = auth.uid() or public.is_staff('support'))));
-- coupons, payment_events, rate_limits: sem políticas => apenas service_role.

-- Colunas sensíveis nunca saem para o navegador, nem para o dono.
revoke select on public.guests from authenticated;
grant select (id, event_id, name, max_companions, created_at) on public.guests to authenticated;
revoke select on public.rsvp_responses from authenticated;
grant select (id, event_id, guest_id, respondent_name, attending, companions, notes, source, possible_duplicate, created_at, updated_at)
  on public.rsvp_responses to authenticated;

-- Realtime do painel (respeita RLS)
alter publication supabase_realtime add table public.rsvp_responses;
