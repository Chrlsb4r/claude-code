import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { InvitationView } from "@/components/invitation/invitation-view";
import { PhoneFrame } from "@/components/invitation/phone-frame";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { buttonClasses } from "@/components/ui/button";
import { Badge, Container } from "@/components/ui/card";
import { getTemplate, searchTemplates } from "@/lib/catalog/data";
import { demoContent } from "@/lib/catalog/demo-content";
import { featureLabel, formatPrice } from "@/lib/format";

const STEP_LABELS: Record<string, string> = {
  basico: "Informações principais",
  quando: "Data e horário",
  onde: "Local",
  mensagem: "Mensagens",
  confirmacao: "Confirmação de presença",
  estilo: "Estilo",
};
const PALETTE_LABELS: Record<string, string> = { champagne: "Champagne", salvia: "Sálvia", rose: "Rosé", rosa: "Rosa", azul: "Azul", roxo: "Roxo", verde: "Verde", laranja: "Laranja" };

export async function generateStaticParams() {
  const all = await searchTemplates({ pagina: 1 });
  return all.items.map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({ params }: PageProps<"/modelos/[slug]">): Promise<Metadata> {
  const t = await getTemplate((await params).slug);
  return t ? { title: `${t.name} — convite de ${t.category.name.toLowerCase()}`, description: t.description ?? undefined } : {};
}

export default async function TemplatePage({ params }: PageProps<"/modelos/[slug]">) {
  const t = await getTemplate((await params).slug);
  if (!t) notFound();

  const demo = demoContent(t.category.slug, t.slug);
  const steps = Object.entries(
    t.fields.reduce<Record<string, typeof t.fields>>((acc, f) => {
      (acc[f.step] ??= []).push(f);
      return acc;
    }, {}),
  );
  const palettes = t.style_options.palettes ?? [];

  return (
    <>
      <SiteHeader />
      <main id="conteudo" className="flex-1">
        <Container className="py-8">
          <nav aria-label="Trilha de navegação" className="text-sm text-ink-soft">
            <ol className="flex flex-wrap items-center gap-2">
              <li><Link href="/convites" className="hover:text-ink">Catálogo</Link></li>
              <li aria-hidden>/</li>
              <li><Link href={`/ocasioes/${t.category.slug}`} className="hover:text-ink">{t.category.name}</Link></li>
              <li aria-hidden>/</li>
              <li aria-current="page" className="text-ink">{t.name}</li>
            </ol>
          </nav>
        </Container>

        <Container className="grid gap-12 pb-16 lg:grid-cols-[1fr_420px] lg:gap-16">
          {/* Demonstração */}
          <section aria-labelledby="demo-t" className="flex flex-col gap-8">
            <h2 id="demo-t" className="sr-only">Demonstração</h2>
            <div className="grid items-start gap-8 rounded-lg border border-line bg-card p-6 sm:grid-cols-[minmax(0,1fr)_minmax(0,1.25fr)] sm:p-10">
              <div className="flex flex-col items-center gap-3">
                <PhoneFrame>
                  <InvitationView content={demo} layout={t.layout} inert className="min-h-full" label={`Demonstração do modelo ${t.name} no celular`} />
                </PhoneFrame>
                <p className="text-xs text-ink-soft">Versão para celular</p>
              </div>
              <div className="hidden flex-col gap-3 sm:flex">
                <div className="overflow-hidden rounded-lg border border-line shadow-soft">
                  <div className="flex h-7 items-center gap-1.5 border-b border-line bg-cream px-3" aria-hidden>
                    <span className="h-2 w-2 rounded-full bg-line" /><span className="h-2 w-2 rounded-full bg-line" /><span className="h-2 w-2 rounded-full bg-line" />
                  </div>
                  <div className="max-h-[560px] overflow-hidden">
                    <InvitationView content={demo} layout={t.layout} inert label={`Demonstração do modelo ${t.name} no computador`} />
                  </div>
                </div>
                <p className="text-center text-xs text-ink-soft">Versão para computador</p>
              </div>
            </div>
            <p className="text-sm text-ink-soft">Demonstração com dados fictícios. O convite final mostra as informações do seu evento e o formulário de confirmação de presença.</p>

            {palettes.length > 1 && (
              <div className="flex flex-col gap-4">
                <h3 className="font-display text-2xl font-bold">Variações de cor</h3>
                <ul className="grid grid-cols-3 gap-4">
                  {palettes.map((p) => (
                    <li key={p} className="flex flex-col gap-2">
                      <div className="aspect-[4/5] overflow-hidden rounded-md border border-line">
                        <InvitationView content={{ ...demo, palette: p }} layout={t.layout} inert className="h-full" label={`Paleta ${PALETTE_LABELS[p] ?? p}`} />
                      </div>
                      <span className="text-center text-xs text-ink-soft">{PALETTE_LABELS[p] ?? p}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </section>

          {/* Informações e compra */}
          <aside className="flex flex-col gap-8 lg:sticky lg:top-24 lg:self-start">
            <div className="flex flex-col gap-4">
              <div className="flex flex-wrap gap-2">
                <Badge>{t.category.name}</Badge>
                {t.theme && <Badge tone="sage">{t.theme.name}</Badge>}
                {t.style && <Badge tone="rose">{t.style}</Badge>}
              </div>
              <h1 className="font-display text-5xl font-bold leading-tight">{t.name}</h1>
              {t.description && <p className="leading-relaxed text-ink-soft">{t.description}</p>}
            </div>

            <div className="flex items-end justify-between gap-4 border-y border-line py-5">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-ink-soft">Valor único</p>
                <p className="font-display text-4xl font-bold">{formatPrice(t.price_cents)}</p>
              </div>
              <p className="text-right text-xs text-ink-soft">Pix ou cartão<br />Válido até 24h após o evento</p>
            </div>

            <div className="flex flex-col gap-3">
              <Link href={`/personalizar/${t.slug}`} className={buttonClasses("primary", "lg", "w-full")}>Personalizar agora</Link>
              <Link href={`/modelos/${t.slug}/convidado`} className={buttonClasses("secondary", "lg", "w-full")}>Ver como o convidado recebe</Link>
            </div>

            <div className="flex flex-col gap-3">
              <h2 className="text-sm font-medium">Recursos incluídos</h2>
              <ul className="flex flex-col gap-2 text-sm text-ink-soft">
                {t.features.map((f) => (
                  <li key={f} className="flex items-center gap-3">
                    <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-green" />
                    {featureLabel(f)}
                  </li>
                ))}
              </ul>
            </div>

            <details className="group rounded-lg border border-line bg-card p-5">
              <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-medium [&::-webkit-details-marker]:hidden">
                Campos personalizáveis ({t.fields.length})
                <span aria-hidden className="transition-transform group-open:rotate-180">⌄</span>
              </summary>
              <div className="mt-4 flex flex-col gap-4">
                {steps.map(([step, fields]) => (
                  <div key={step}>
                    <p className="text-xs uppercase tracking-[0.2em] text-brand-ink">{STEP_LABELS[step] ?? step}</p>
                    <ul className="mt-2 flex flex-col gap-1 text-sm text-ink-soft">
                      {fields.map((f) => (
                        <li key={f.key}>
                          {f.label}
                          {f.required && <span className="text-pink-ink"> · obrigatório</span>}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </details>
          </aside>
        </Container>
      </main>
      <SiteFooter />
    </>
  );
}
