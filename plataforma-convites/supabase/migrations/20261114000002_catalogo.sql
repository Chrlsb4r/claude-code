-- =====================================================================
-- Catálogo público: funções de leitura (SECURITY INVOKER => RLS de anon vale).
-- Só retornam modelos publicados, porque as políticas já filtram.
-- =====================================================================

grant execute on function public.normalize_name(text) to anon, authenticated;

-- Escapa curingas do LIKE para que a busca trate % e _ como texto.
create function public.like_escape(p text) returns text
language sql immutable set search_path = '' as $$
  select replace(replace(replace(coalesce(p, ''), '\', '\\'), '%', '\%'), '_', '\_')
$$;
grant execute on function public.like_escape(text) to anon, authenticated;

create function public.template_card(t public.templates) returns jsonb
language sql stable set search_path = '' as $$
  select jsonb_build_object(
    'slug', t.slug, 'name', t.name, 'description', t.description, 'style', t.style,
    'is_featured', t.is_featured,
    'category', jsonb_build_object('slug', c.slug, 'name', c.name),
    'theme', case when th.id is null then null else jsonb_build_object('slug', th.slug, 'name', th.name) end,
    'price_cents', v.price_cents, 'currency', v.currency, 'features', to_jsonb(v.features),
    'layout', v.layout)
  from public.categories c
  join public.template_versions v on v.id = t.current_version_id
  left join public.themes th on th.id = t.theme_id
  where c.id = t.category_id
$$;

create function public.catalog_categories() returns jsonb
language sql stable set search_path = '' as $$
  select coalesce(jsonb_agg(jsonb_build_object('slug', c.slug, 'name', c.name, 'description', c.description,
                                               'template_count', (select count(*) from public.templates t
                                                                   where t.category_id = c.id and t.status = 'published'))
                            order by c.sort_order), '[]'::jsonb)
  from public.categories c where c.is_active
$$;

create function public.catalog_facets() returns jsonb
language sql stable set search_path = '' as $$
  select jsonb_build_object(
    'themes', (select coalesce(jsonb_agg(distinct jsonb_build_object('slug', th.slug, 'name', th.name)), '[]')
                 from public.templates t join public.themes th on th.id = t.theme_id where t.status = 'published'),
    'styles', (select coalesce(jsonb_agg(distinct t.style), '[]') from public.templates t
                where t.status = 'published' and t.style is not null),
    'features', (select coalesce(jsonb_agg(distinct f), '[]') from public.templates t
                   join public.template_versions v on v.id = t.current_version_id, unnest(v.features) f
                  where t.status = 'published'),
    'price', (select jsonb_build_object('min', min(v.price_cents), 'max', max(v.price_cents))
                from public.templates t join public.template_versions v on v.id = t.current_version_id
               where t.status = 'published'))
$$;

create function public.catalog_search(
  p_q text default null,
  p_category text default null,
  p_theme text default null,
  p_style text default null,
  p_feature text default null,
  p_min_price int default null,
  p_max_price int default null,
  p_featured boolean default null,
  p_sort text default 'relevancia',
  p_limit int default 12,
  p_offset int default 0
) returns jsonb
language sql stable set search_path = '' as $$
  with base as (
    select t.*, v.price_cents, c.sort_order as cat_order
      from public.templates t
      join public.template_versions v on v.id = t.current_version_id
      join public.categories c on c.id = t.category_id
      left join public.themes th on th.id = t.theme_id
     where t.status = 'published'
       and (p_category is null or c.slug = p_category)
       and (p_theme is null or th.slug = p_theme)
       and (p_style is null or t.style = p_style)
       and (p_feature is null or p_feature = any (v.features))
       and (p_min_price is null or v.price_cents >= p_min_price)
       and (p_max_price is null or v.price_cents <= p_max_price)
       and (p_featured is null or t.is_featured = p_featured)
       and (nullif(trim(p_q), '') is null
            or public.normalize_name(t.name || ' ' || coalesce(t.description, '') || ' ' || c.name || ' ' || coalesce(th.name, '') || ' ' || coalesce(t.style, ''))
               like '%' || public.like_escape(public.normalize_name(left(p_q, 80))) || '%' escape '\')
  ), page as (
    select id, row_number() over (order by
       case when p_sort = 'menor_preco' then price_cents end asc,
       case when p_sort = 'maior_preco' then price_cents end desc,
       case when p_sort = 'novidades' then created_at end desc,
       is_featured desc, cat_order, name) as rn
      from base
     order by rn
     limit least(greatest(coalesce(p_limit, 12), 1), 48)
     offset greatest(coalesce(p_offset, 0), 0)
  )
  select jsonb_build_object(
    'total', (select count(*) from base),
    'items', coalesce((select jsonb_agg(public.template_card(t) order by p.rn)
                         from page p join public.templates t on t.id = p.id), '[]'::jsonb))
$$;

create function public.catalog_template(p_slug text) returns jsonb
language sql stable set search_path = '' as $$
  select public.template_card(t) || jsonb_build_object(
    'version', v.version,
    'style_options', v.style_options,
    'fields', (select coalesce(jsonb_agg(jsonb_build_object(
                 'key', f.key, 'type', f.type, 'label', f.label, 'step', f.step, 'required', f.required,
                 'max_length', f.max_length, 'options', f.options, 'sort_order', f.sort_order) order by f.sort_order), '[]')
               from public.template_fields f where f.template_version_id = v.id))
  from public.templates t
  join public.template_versions v on v.id = t.current_version_id
  where t.slug = p_slug and t.status = 'published'
$$;

grant execute on function public.template_card(public.templates), public.catalog_categories(), public.catalog_facets(),
  public.catalog_search(text, text, text, text, text, int, int, boolean, text, int, int), public.catalog_template(text)
  to anon, authenticated;
