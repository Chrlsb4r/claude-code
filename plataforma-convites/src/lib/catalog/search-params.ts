import { z } from "zod";

export const PAGE_SIZE = 12;
export const SORTS = ["relevancia", "menor_preco", "maior_preco", "novidades"] as const;
export const SORT_LABELS: Record<(typeof SORTS)[number], string> = {
  relevancia: "Relevância",
  menor_preco: "Menor preço",
  maior_preco: "Maior preço",
  novidades: "Novidades",
};

const slug = z.string().regex(/^[a-z0-9-]{2,60}$/).optional().catch(undefined);
const money = z.coerce.number().int().min(0).max(10000).optional().catch(undefined); // em reais

/** Converte a query string do catálogo em filtros validados; valores inválidos são ignorados. */
export const catalogQuerySchema = z.object({
  q: z.string().trim().max(80).optional().catch(undefined),
  ocasiao: slug,
  tema: slug,
  estilo: z.string().trim().max(60).optional().catch(undefined),
  recurso: z.string().regex(/^[a-z_]{2,40}$/).optional().catch(undefined),
  min: money,
  max: money,
  ordem: z.enum(SORTS).optional().catch(undefined),
  pagina: z.coerce.number().int().min(1).max(500).optional().catch(undefined),
});
export type CatalogQuery = z.infer<typeof catalogQuerySchema>;

export function parseCatalogQuery(raw: Record<string, string | string[] | undefined>): CatalogQuery {
  const flat = Object.fromEntries(
    Object.entries(raw).map(([k, v]) => [k, (Array.isArray(v) ? v[0] : v) || undefined]),
  );
  const parsed = catalogQuerySchema.parse(flat);
  // Remove chaves vazias para que a mesma busca gere a mesma chave de cache.
  return Object.fromEntries(Object.entries(parsed).filter(([, v]) => v !== undefined && v !== "")) as CatalogQuery;
}

export function toRpcArgs(q: CatalogQuery) {
  const page = q.pagina ?? 1;
  return {
    p_q: q.q || undefined,
    p_category: q.ocasiao,
    p_theme: q.tema,
    p_style: q.estilo || undefined,
    p_feature: q.recurso,
    p_min_price: q.min !== undefined ? q.min * 100 : undefined,
    p_max_price: q.max !== undefined ? q.max * 100 : undefined,
    p_sort: q.ordem ?? "relevancia",
    p_limit: PAGE_SIZE,
    p_offset: (page - 1) * PAGE_SIZE,
  };
}

/** URL do catálogo preservando filtros (paginação e remoção de filtros). */
export function catalogHref(q: CatalogQuery, patch: Partial<Record<keyof CatalogQuery, string | number | undefined>> = {}) {
  const merged: Record<string, string | number | undefined> = { ...q, ...patch };
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(merged)) if (v !== undefined && v !== "") sp.set(k, String(v));
  const s = sp.toString();
  return s ? `/convites?${s}` : "/convites";
}
