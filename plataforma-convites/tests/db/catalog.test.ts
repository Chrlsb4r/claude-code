import { afterAll, beforeAll, describe, expect, it } from "vitest";
import type { Client } from "pg";
import { asAnon, connect, skipDb } from "./helpers";

describe.skipIf(skipDb())("funções do catálogo (como anon)", () => {
  let c: Client;
  beforeAll(async () => {
    c = await connect();
  });
  afterAll(() => c?.end());

  const search = (args: string, params: unknown[] = []) =>
    asAnon(c, () => c.query(`select catalog_search(${args}) as r`, params)).then((r) => r.rows[0].r);

  it("lista apenas modelos publicados e esconde rascunhos/arquivados", async () => {
    const all = await search("");
    await c.query(`update templates set status = 'draft' where slug = 'encontro-livre'`);
    try {
      const after = await search("");
      expect(after.total).toBe(all.total - 1);
      const t = await asAnon(c, () => c.query(`select catalog_template('encontro-livre') as r`));
      expect(t.rows[0].r).toBeNull();
    } finally {
      await c.query(`update templates set status = 'published' where slug = 'encontro-livre'`);
    }
  });

  it("busca ignora acentos e maiúsculas", async () => {
    const a = await search("p_q => $1", ["CHÁ DE BEBE"]);
    expect(a.items.map((i: { slug: string }) => i.slug)).toContain("lua-de-algodao");
  });

  it("trata % e _ como texto (sem curinga)", async () => {
    expect((await search("p_q => $1", ["%"])).total).toBe(0);
    expect((await search("p_q => $1", ["_"])).total).toBe(0);
  });

  it("filtra por ocasião, tema, recurso e faixa de preço", async () => {
    const r = await search("p_category => 'casamento', p_feature => 'links_individuais', p_max_price => 5000");
    expect(r.items.map((i: { slug: string }) => i.slug)).toEqual(["papel-fino"]);
    const th = await search("p_theme => 'noturno'");
    expect(th.items.every((i: { theme: { slug: string } }) => i.theme.slug === "noturno")).toBe(true);
  });

  it("ordena por preço e pagina com limite máximo", async () => {
    const r = await search("p_sort => 'menor_preco', p_limit => 1000");
    const prices = r.items.map((i: { price_cents: number }) => i.price_cents);
    expect(prices).toEqual([...prices].sort((a, b) => a - b));
    expect(r.items.length).toBeLessThanOrEqual(48);
    const p2 = await search("p_limit => 5, p_offset => 5");
    expect(p2.items).toHaveLength(5);
  });

  it("detalhe do modelo traz campos, preço e nada de dados internos", async () => {
    const r = await asAnon(c, () => c.query(`select catalog_template('papel-fino') as r`));
    const t = r.rows[0].r;
    expect(t.price_cents).toBe(4990);
    expect(t.fields.length).toBeGreaterThan(10);
    expect(JSON.stringify(t)).not.toMatch(/"id"|template_id|created_at/);
  });
});
