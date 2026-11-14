import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

async function noHorizontalScroll(page: Page) {
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
}

async function noA11yViolations(page: Page) {
  const r = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"]).analyze();
  expect(r.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(" ")).slice(0, 3).join(" | ")}`)).toEqual([]);
}

test("home apresenta seções principais e categorias reais do banco", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Um convite à altura");
  for (const h of ["Para cada ocasião", "Mais procurados", "Novidades do ateliê", "Do modelo ao link em quatro passos", "Perguntas frequentes"]) {
    await expect(page.getByRole("heading", { name: h })).toBeVisible();
  }
  await expect(page.getByRole("link", { name: /Chá revelação/ })).toBeVisible();
  await noHorizontalScroll(page);
  await noA11yViolations(page);
});

test("demonstração do editor atualiza a prévia em tempo real", async ({ page }) => {
  await page.goto("/");
  await page.getByLabel("Nome do homenageado").fill("Joaquim");
  await expect(page.getByRole("article", { name: "Prévia da demonstração" })).toContainText("Joaquim");
});

test("busca sem acento encontra o modelo e leva à página do modelo", async ({ page, isMobile }) => {
  await page.goto("/");
  const search = isMobile ? page.locator("#busca-hero") : page.locator("#busca-topo");
  await search.fill("cha de bebe");
  await search.press("Enter");
  await expect(page).toHaveURL(/\/convites\?q=cha/);
  await page.getByRole("link", { name: "Lua de Algodão" }).click();
  await expect(page).toHaveURL(/\/modelos\/lua-de-algodao$/);
  await expect(page.getByRole("heading", { level: 1, name: "Lua de Algodão" })).toBeVisible();
  await expect(page.getByRole("complementary").getByText("R$ 59,00")).toBeVisible();
  await expect(page.getByRole("link", { name: "Personalizar agora" })).toBeVisible();
});

test("filtros do catálogo funcionam e podem ser removidos", async ({ page, isMobile }) => {
  await page.goto("/convites");
  if (isMobile) await page.getByText("Filtrar e ordenar").click();
  const form = page.getByRole("form", { name: "Filtros do catálogo" }).filter({ visible: true });
  await form.getByLabel("Ocasião").selectOption("casamento");
  await form.getByLabel("Ordenar por").selectOption("maior_preco");
  await form.getByRole("button", { name: "Aplicar filtros" }).click();
  await expect(page.getByRole("status")).toHaveText("2 convites encontrados");
  const names = await page.getByRole("heading", { level: 2 }).filter({ hasText: /Papel Fino|Linho/ }).allTextContents();
  expect(names).toEqual(["Linho & Sálvia", "Papel Fino"]);
  await page.getByRole("link", { name: "Remover filtro Casamento" }).click();
  await expect(page.getByRole("status")).toHaveText(/12 convites encontrados/);
  await noHorizontalScroll(page);
  await noA11yViolations(page);
});

test("estado vazio e parâmetros inválidos não quebram a página", async ({ page }) => {
  const r = await page.goto("/convites?q=zzzzzz&ordem=hack&pagina=-1&ocasiao=%27%3B");
  expect(r?.status()).toBe(200);
  await expect(page.getByText("Não encontramos convites com esses filtros.")).toBeVisible();
});

test("página do modelo mostra demo, recursos e campos", async ({ page }) => {
  await page.goto("/modelos/papel-fino");
  await expect(page.getByRole("article", { name: /no celular/ })).toContainText("Clara & Rafael");
  await expect(page.getByText("Demonstração com dados fictícios")).toBeVisible();
  await expect(page.getByText("Links individuais")).toBeVisible();
  await page.getByText(/Campos personalizáveis/).click();
  await expect(page.getByText("Data-limite para confirmação")).toBeVisible();
  await noHorizontalScroll(page);
  await noA11yViolations(page);
});

test("página de ocasião e 404 elegante", async ({ page }) => {
  await page.goto("/ocasioes/cha-revelacao");
  await expect(page.getByRole("heading", { level: 1, name: "Chá revelação" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Caixa Surpresa" })).toBeVisible();
  // Com streaming, o Next responde 200 + meta robots noindex (documentado em loading.md > Status codes).
  // Primeira renderização sob demanda: 200 + noindex (streaming). Depois de salva: 404 real.
  const r = await page.goto("/modelos/nao-existe");
  await expect(page.getByText("Não encontramos o que você procurava.")).toBeVisible();
  if (r?.status() !== 404) await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
});

test("cabeçalhos de segurança presentes", async ({ request }) => {
  const r = await request.get("/");
  expect(r.headers()["x-frame-options"]).toBe("DENY");
  expect(r.headers()["x-content-type-options"]).toBe("nosniff");
  expect(r.headers()["strict-transport-security"]).toContain("max-age");
  expect(r.headers()["x-powered-by"]).toBeUndefined();
});
