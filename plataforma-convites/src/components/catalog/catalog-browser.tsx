import Link from "next/link";
import { TemplateCard } from "@/components/catalog/template-card";
import { buttonClasses } from "@/components/ui/button";
import { getCategories, getFacets, searchTemplates } from "@/lib/catalog/data";
import { catalogHref, PAGE_SIZE, SORT_LABELS, SORTS, type CatalogQuery } from "@/lib/catalog/search-params";
import type { Category, Facets } from "@/lib/catalog/types";
import { featureLabel } from "@/lib/format";

const select =
  "h-11 w-full rounded-md border-2 border-line bg-white font-semibold px-3 text-sm transition-colors hover:border-brand-soft focus:border-brand-ink focus:outline-none";

function Filters({ q, categories, facets, lockCategory }: { q: CatalogQuery; categories: Category[]; facets: Facets; lockCategory?: string }) {
  return (
    <form action="/convites" className="flex flex-col gap-5" aria-label="Filtros do catálogo">
      {q.q && <input type="hidden" name="q" value={q.q} />}
      {lockCategory ? (
        <input type="hidden" name="ocasiao" value={lockCategory} />
      ) : (
        <label className="flex flex-col gap-1.5 text-sm font-medium">
          Ocasião
          <select name="ocasiao" defaultValue={q.ocasiao ?? ""} className={select}>
            <option value="">Todas</option>
            {categories.filter((c) => c.template_count > 0).map((c) => (
              <option key={c.slug} value={c.slug}>{c.name}</option>
            ))}
          </select>
        </label>
      )}
      <label className="flex flex-col gap-1.5 text-sm font-medium">
        Tema
        <select name="tema" defaultValue={q.tema ?? ""} className={select}>
          <option value="">Todos</option>
          {facets.themes.map((t) => <option key={t.slug} value={t.slug}>{t.name}</option>)}
        </select>
      </label>
      <label className="flex flex-col gap-1.5 text-sm font-medium">
        Estilo
        <select name="estilo" defaultValue={q.estilo ?? ""} className={select}>
          <option value="">Todos</option>
          {facets.styles.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </label>
      <label className="flex flex-col gap-1.5 text-sm font-medium">
        Recurso
        <select name="recurso" defaultValue={q.recurso ?? ""} className={select}>
          <option value="">Todos</option>
          {facets.features.map((f) => <option key={f} value={f}>{featureLabel(f)}</option>)}
        </select>
      </label>
      <fieldset className="flex flex-col gap-1.5">
        <legend className="mb-1.5 text-sm font-medium">Preço (R$)</legend>
        <div className="grid grid-cols-2 gap-2">
          <label className="sr-only" htmlFor="preco-min">Preço mínimo</label>
          <input id="preco-min" name="min" type="number" inputMode="numeric" min={0} defaultValue={q.min} placeholder={`${Math.floor(facets.price.min / 100)}`} className={select} />
          <label className="sr-only" htmlFor="preco-max">Preço máximo</label>
          <input id="preco-max" name="max" type="number" inputMode="numeric" min={0} defaultValue={q.max} placeholder={`${Math.ceil(facets.price.max / 100)}`} className={select} />
        </div>
      </fieldset>
      <label className="flex flex-col gap-1.5 text-sm font-medium">
        Ordenar por
        <select name="ordem" defaultValue={q.ordem ?? "relevancia"} className={select}>
          {SORTS.map((s) => <option key={s} value={s}>{SORT_LABELS[s]}</option>)}
        </select>
      </label>
      <button type="submit" className={buttonClasses("primary", "md", "w-full")}>Aplicar filtros</button>
    </form>
  );
}

function ActiveFilters({ q, categories, facets }: { q: CatalogQuery; categories: Category[]; facets: Facets }) {
  const chips: { key: keyof CatalogQuery; label: string }[] = [];
  if (q.q) chips.push({ key: "q", label: `“${q.q}”` });
  if (q.ocasiao) chips.push({ key: "ocasiao", label: categories.find((c) => c.slug === q.ocasiao)?.name ?? q.ocasiao });
  if (q.tema) chips.push({ key: "tema", label: facets.themes.find((t) => t.slug === q.tema)?.name ?? q.tema });
  if (q.estilo) chips.push({ key: "estilo", label: q.estilo });
  if (q.recurso) chips.push({ key: "recurso", label: featureLabel(q.recurso) });
  if (q.min !== undefined) chips.push({ key: "min", label: `A partir de R$ ${q.min}` });
  if (q.max !== undefined) chips.push({ key: "max", label: `Até R$ ${q.max}` });
  if (!chips.length) return null;
  return (
    <ul className="flex flex-wrap gap-2" aria-label="Filtros ativos">
      {chips.map((c) => (
        <li key={c.key}>
          <Link
            href={catalogHref(q, { [c.key]: undefined, pagina: undefined })}
            className="inline-flex h-8 items-center gap-2 rounded-full border border-line bg-card px-3 text-xs hover:border-brand-soft"
            aria-label={`Remover filtro ${c.label}`}
          >
            {c.label} <span aria-hidden>×</span>
          </Link>
        </li>
      ))}
      <li>
        <Link href="/convites" className="inline-flex h-8 items-center px-2 text-xs underline underline-offset-4">Limpar tudo</Link>
      </li>
    </ul>
  );
}

export async function CatalogBrowser({ q, lockCategory }: { q: CatalogQuery; lockCategory?: string }) {
  const query = lockCategory ? { ...q, ocasiao: lockCategory } : q;
  const [result, categories, facets] = await Promise.all([searchTemplates(query), getCategories(), getFacets()]);
  const page = query.pagina ?? 1;
  const pages = Math.max(1, Math.ceil(result.total / PAGE_SIZE));

  return (
    <div className="grid grid-cols-1 gap-10 lg:grid-cols-[260px_minmax(0,1fr)]">
      <aside className="min-w-0 lg:sticky lg:top-24 lg:self-start">
        <details className="group rounded-lg border border-line bg-card p-4 lg:hidden">
          <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-medium [&::-webkit-details-marker]:hidden">
            Filtrar e ordenar <span aria-hidden className="transition-transform group-open:rotate-180">⌄</span>
          </summary>
          <div className="mt-4">
            <Filters q={query} categories={categories} facets={facets} lockCategory={lockCategory} />
          </div>
        </details>
        <div className="hidden lg:block">
          <Filters q={query} categories={categories} facets={facets} lockCategory={lockCategory} />
        </div>
      </aside>

      <section aria-labelledby="resultados-t" className="flex min-w-0 flex-col gap-8">
        <div className="flex flex-col gap-3">
          <p id="resultados-t" className="text-sm text-ink-soft" role="status">
            {result.total === 0 ? "Nenhum convite encontrado" : `${result.total} ${result.total === 1 ? "convite encontrado" : "convites encontrados"}`}
          </p>
          {!lockCategory && <ActiveFilters q={query} categories={categories} facets={facets} />}
        </div>

        {result.total === 0 ? (
          <div className="flex flex-col items-start gap-4 rounded-lg border border-dashed border-line p-10">
            <p className="font-display text-2xl font-bold">Não encontramos convites com esses filtros.</p>
            <p className="text-sm text-ink-soft">Tente remover algum filtro ou buscar por outra palavra.</p>
            <Link href="/convites" className={buttonClasses("secondary")}>Ver todos os convites</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-x-6 gap-y-12 sm:grid-cols-2 xl:grid-cols-3">
            {result.items.map((t) => <TemplateCard key={t.slug} t={t} headingLevel={2} />)}
          </div>
        )}

        {pages > 1 && (
          <nav aria-label="Paginação" className="flex items-center justify-center gap-2 pt-4">
            {Array.from({ length: pages }, (_, i) => i + 1).map((n) => (
              <Link
                key={n}
                href={catalogHref(query, { pagina: n === 1 ? undefined : n })}
                aria-current={n === page ? "page" : undefined}
                className={`grid h-10 w-10 place-items-center rounded-full text-sm ${n === page ? "bg-ink text-cream" : "border border-line hover:border-brand-soft"}`}
              >
                {n}
              </Link>
            ))}
          </nav>
        )}
      </section>
    </div>
  );
}

export function CatalogSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-x-6 gap-y-12 sm:grid-cols-2 lg:ml-[300px] xl:grid-cols-3" aria-busy="true" aria-label="Carregando convites">
      {Array.from({ length: 6 }, (_, i) => (
        <div key={i} className="flex flex-col gap-4">
          <div className="aspect-[4/5] animate-pulse rounded-lg bg-line/60 motion-reduce:animate-none" />
          <div className="h-5 w-2/3 animate-pulse rounded bg-line/60 motion-reduce:animate-none" />
        </div>
      ))}
    </div>
  );
}
