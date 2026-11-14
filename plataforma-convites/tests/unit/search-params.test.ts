import { describe, expect, it } from "vitest";
import { catalogHref, parseCatalogQuery, toRpcArgs } from "@/lib/catalog/search-params";

describe("parâmetros do catálogo", () => {
  it("valida e converte filtros; preço em reais vira centavos", () => {
    const q = parseCatalogQuery({ q: " chá ", ocasiao: "casamento", min: "50", max: "90", ordem: "menor_preco", pagina: "2" });
    expect(q).toEqual({ q: "chá", ocasiao: "casamento", min: 50, max: 90, ordem: "menor_preco", pagina: 2 });
    expect(toRpcArgs(q)).toMatchObject({ p_min_price: 5000, p_max_price: 9000, p_offset: 12, p_limit: 12 });
  });

  it("ignora valores inválidos ou maliciosos em vez de falhar", () => {
    const q = parseCatalogQuery({ ocasiao: "'; drop table x;--", ordem: "hack", pagina: "-3", min: "abc", recurso: "<script>" });
    expect(q).toEqual({});
  });

  it("limita o tamanho da busca e usa só o primeiro valor repetido", () => {
    expect(parseCatalogQuery({ q: "x".repeat(200) }).q).toBeUndefined();
    expect(parseCatalogQuery({ ocasiao: ["casamento", "batizado"] }).ocasiao).toBe("casamento");
  });

  it("monta URLs preservando filtros e removendo vazios", () => {
    expect(catalogHref({ ocasiao: "casamento", pagina: 3 }, { pagina: undefined })).toBe("/convites?ocasiao=casamento");
    expect(catalogHref({})).toBe("/convites");
  });
});
