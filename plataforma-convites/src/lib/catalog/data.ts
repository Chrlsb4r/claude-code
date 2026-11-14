import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { publicRpc } from "@/lib/db/public-rpc";
import { toRpcArgs, type CatalogQuery } from "./search-params";
import type { Category, Facets, SearchResult, TemplateDetail } from "./types";

// Conteúdo público: pode ser cacheado. O painel admin invalida a tag "catalogo" ao publicar.
export async function getCategories() {
  "use cache";
  cacheLife("hours");
  cacheTag("catalogo");
  return publicRpc<Category[]>("catalog_categories");
}

export async function getFacets() {
  "use cache";
  cacheLife("hours");
  cacheTag("catalogo");
  return publicRpc<Facets>("catalog_facets");
}

export async function searchTemplates(q: CatalogQuery) {
  "use cache";
  cacheLife("minutes");
  cacheTag("catalogo");
  return publicRpc<SearchResult>("catalog_search", toRpcArgs(q));
}

export async function getFeatured(limit = 6) {
  "use cache";
  cacheLife("hours");
  cacheTag("catalogo");
  return publicRpc<SearchResult>("catalog_search", { p_featured: true, p_limit: limit });
}

export async function getTemplate(slug: string) {
  "use cache";
  cacheLife("hours");
  cacheTag("catalogo", `modelo:${slug}`);
  if (!/^[a-z0-9-]{2,80}$/.test(slug)) return null;
  return publicRpc<TemplateDetail | null>("catalog_template", { p_slug: slug });
}
