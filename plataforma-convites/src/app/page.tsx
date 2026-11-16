import Link from "next/link";
import { TemplateCard } from "@/components/catalog/template-card";
import { Character, type CharacterKind } from "@/components/characters/characters";
import { InvitationView } from "@/components/invitation/invitation-view";
import { PhoneFrame } from "@/components/invitation/phone-frame";
import { EditorDemo } from "@/components/site/editor-demo";
import { Icon, type IconKind } from "@/components/site/icons";
import { SiteFooter } from "@/components/site/site-footer";
import { SearchForm, SiteHeader } from "@/components/site/site-header";
import { buttonClasses } from "@/components/ui/button";
import { Container } from "@/components/ui/card";
import { getCategories, getFacets, getFeatured, searchTemplates } from "@/lib/catalog/data";
import { demoContent } from "@/lib/catalog/demo-content";
import { formatPrice } from "@/lib/format";

/** Visual de cada ocasião: cor de fundo + personagem ou ícone. */
const OCCASION_LOOK: Record<string, { bg: string; character?: CharacterKind; icon?: IconKind }> = {
  "aniversario-infantil": { bg: "bg-lemon-soft", character: "urso" },
  "aniversario-adulto": { bg: "bg-pink-soft", character: "baloes" },
  casamento: { bg: "bg-pink-soft", icon: "coracao" },
  "cha-de-bebe": { bg: "bg-sky-soft", character: "baleia" },
  "cha-revelacao": { bg: "bg-lilac-soft", character: "baloes" },
  batizado: { bg: "bg-sky-soft", character: "coelha" },
  formatura: { bg: "bg-lilac-soft", icon: "capelo" },
  "15-anos": { bg: "bg-lemon-soft", icon: "coroa" },
  corporativo: { bg: "bg-sky-soft", icon: "maleta" },
  "datas-comemorativas": { bg: "bg-mint-soft", icon: "estrela" },
  outros: { bg: "bg-mint-soft", icon: "presente" },
};

const STEPS = [
  { t: "Escolha o tema", d: "Personagens animados, festas coloridas ou modelos elegantes.", c: "bg-brand", ch: "urso" as const },
  { t: "Personalize", d: "Nome, data, local e cor. A prévia muda na hora.", c: "bg-purple-ink", ch: "coelha" as const },
  { t: "Pague no Pix ou cartão", d: "Pagamento seguro pelo Mercado Pago. Publicação automática.", c: "bg-green-ink", ch: "dino" as const },
  { t: "Mande no WhatsApp", d: "Compartilhe o link e acompanhe quem confirmou.", c: "bg-[#1769b3]", ch: "astronauta" as const },
];

const BENEFITS: { t: string; d: string; i: IconKind; bg: string }[] = [
  { t: "Personagens que se mexem", d: "Acenam, piscam e balançam para encantar os convidados.", i: "raio", bg: "bg-lemon-soft" },
  { t: "Confirmação de presença", d: "Os convidados confirmam pelo link, sem baixar nada.", i: "check", bg: "bg-mint-soft" },
  { t: "Link exclusivo", d: "Um endereço só seu, fácil de mandar no WhatsApp.", i: "link", bg: "bg-pink-soft" },
  { t: "Painel em tempo real", d: "Veja quantas pessoas vêm, com acompanhantes.", i: "grafico", bg: "bg-sky-soft" },
  { t: "Feito para o celular", d: "Abre rapidinho e fica lindo na tela do convidado.", i: "celular", bg: "bg-lilac-soft" },
  { t: "Seguro e privado", d: "A lista de convidados só aparece para você.", i: "cadeado", bg: "bg-lemon-soft" },
];

const FAQ = [
  { q: "O convite é um arquivo para baixar?", a: "Não. Você recebe um link para uma página animada e interativa, que pode ser enviada pelo WhatsApp, Instagram, e-mail ou qualquer outro meio." },
  { q: "Meus convidados precisam criar conta?", a: "Não. Eles abrem o link e confirmam a presença direto na página do convite." },
  { q: "Por quanto tempo o convite fica no ar?", a: "Até 24 horas depois do horário de início da festa. Depois disso, a página avisa que o evento terminou e as confirmações são encerradas. O histórico continua no seu painel." },
  { q: "Posso mudar as informações depois de pagar?", a: "Sim. Os campos do modelo podem ser editados no painel, e a data da festa pode ser remarcada até duas vezes." },
  { q: "Quais formas de pagamento são aceitas?", a: "Pix e cartão de crédito, pelo Mercado Pago. Não guardamos dados de cartão." },
  { q: "Os personagens são de desenhos famosos?", a: "Não. Todos os personagens são criações originais da loja, então você pode usar sem preocupação." },
];

/** Confete caindo. Com `sides`, fica só nas laterais para não atrapalhar a leitura. */
function Confetti({ sides }: { sides?: boolean }) {
  const colors = ["#e5266e", "#ffc93c", "#2f9bef", "#2dbe6c", "#7b4dff", "#ff8a3d"];
  const x = (i: number) => (sides ? (i % 2 ? 340 + ((i * 53) % 56) : (i * 53) % 56) : (i * 53) % 396);
  return (
    <svg aria-hidden className="pointer-events-none absolute inset-0 h-full w-full" preserveAspectRatio="none" viewBox="0 0 400 300">
      {Array.from({ length: 28 }, (_, i) => (
        <rect key={i} x={x(i)} y={(i * 31) % 120} width="7" height="3" rx="1.5" fill={colors[i % colors.length]} className="anim-fall" style={{ animationDelay: `${(i * 0.37) % 6}s`, animationDuration: `${6 + (i % 5)}s` }} />
      ))}
    </svg>
  );
}

function Wave({ fill, flip }: { fill: string; flip?: boolean }) {
  return (
    <svg aria-hidden viewBox="0 0 1440 60" preserveAspectRatio="none" className={`block h-10 w-full sm:h-14 ${flip ? "rotate-180" : ""}`}>
      <path d="M0 30 C 240 70 480 -10 720 30 C 960 70 1200 -10 1440 30 V60 H0 Z" fill={fill} />
    </svg>
  );
}

export default async function Home() {
  const [categories, featured, latest, facets] = await Promise.all([
    getCategories(),
    getFeatured(6),
    searchTemplates({ ordem: "novidades" }),
    getFacets(),
  ]);
  const hero = featured.items.find((t) => t.layout.character === "urso") ?? featured.items[0];
  const gallery = latest.items.filter((t) => !featured.items.some((f) => f.slug === t.slug)).slice(0, 6);
  const priceFrom = formatPrice(facets.price.min);

  return (
    <>
      <SiteHeader />
      <main id="conteudo" className="flex-1 overflow-x-clip">
        {/* Banner */}
        <section className="relative overflow-hidden bg-[radial-gradient(circle_at_15%_20%,#ffe1ec_0,transparent_40%),radial-gradient(circle_at_85%_30%,#dff1ff_0,transparent_45%),radial-gradient(circle_at_60%_90%,#fff3c4_0,transparent_45%)]">
          <Confetti sides />
          <Container className="relative grid gap-12 py-12 sm:py-16 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:py-20">
            <div className="flex flex-col gap-6">
              <p className="inline-flex items-center gap-2 self-start rounded-full border-2 border-ink bg-yellow px-4 py-1.5 font-display text-sm font-semibold">
                <Icon kind="raio" className="h-5 w-5" /> Convites que se mexem!
              </p>
              <h1 className="font-display text-[2.6rem] font-bold leading-[1.02] tracking-tight text-balance sm:text-6xl lg:text-7xl">
                Convites <span className="text-brand">animados</span> que fazem a festa começar{" "}
                <span className="relative whitespace-nowrap text-purple-ink">
                  antes da festa
                  <svg aria-hidden viewBox="0 0 200 12" className="absolute -bottom-2 left-0 w-full"><path d="M2 8 Q50 0 100 7 T198 5" stroke="#ffc93c" strokeWidth="5" fill="none" strokeLinecap="round" /></svg>
                </span>
              </h1>
              <p className="max-w-xl text-lg font-semibold leading-relaxed text-ink-soft">
                Escolha um personagem, coloque os dados da festa e mande o link no WhatsApp. Seus convidados confirmam presença e você acompanha tudo pelo celular.
              </p>
              <div className="max-w-md md:hidden">
                <SearchForm id="busca-hero" />
              </div>
              <div className="flex flex-wrap items-center gap-4">
                <Link href="/convites" className={buttonClasses("primary", "lg")}>Ver convites</Link>
                <p className="font-display text-lg font-semibold">
                  a partir de <span className="rounded-full bg-mint-soft px-3 py-1 text-2xl text-green-ink">{priceFrom}</span>
                </p>
              </div>
              <ul className="flex flex-wrap gap-x-5 gap-y-2 text-sm font-bold text-ink-soft">
                {["Pix ou cartão", "Pronto em minutos", "Sem baixar nada"].map((t) => (
                  <li key={t} className="flex items-center gap-1.5"><Icon kind="check" className="h-5 w-5" />{t}</li>
                ))}
              </ul>
            </div>
            {hero && (
              <div className="relative mx-auto w-full max-w-[420px]">
                <Character kind="dino" className="anim-float absolute -left-4 bottom-6 z-10 w-28 sm:-left-14 sm:w-36" />
                <Character kind="coelha" className="anim-float absolute -right-2 top-10 z-10 w-24 sm:-right-12 sm:w-32" bounce={false} />
                <PhoneFrame className="relative z-[5] rotate-[3deg] motion-reduce:rotate-0">
                  <InvitationView content={demoContent(hero.category.slug, hero.slug)} layout={hero.layout} inert className="min-h-full" label={`Demonstração do modelo ${hero.name}`} />
                </PhoneFrame>
              </div>
            )}
          </Container>
        </section>

        {/* Ocasiões */}
        <Wave fill="#ffffff" />
        <section id="ocasioes" aria-labelledby="ocasioes-t" className="scroll-mt-24 bg-white py-12 sm:py-16">
          <Container className="flex flex-col gap-8">
            <div className="flex items-end justify-between gap-6">
              <h2 id="ocasioes-t" className="font-display text-4xl font-bold">Qual é a festa?</h2>
              <Link href="/convites" className="hidden font-display font-semibold text-brand-ink underline-offset-4 hover:underline sm:inline">Ver todos →</Link>
            </div>
            <ul className="grid grid-cols-1 gap-4 min-[420px]:grid-cols-2 lg:grid-cols-4">
              {categories.filter((c) => c.template_count > 0).map((c) => {
                const look = OCCASION_LOOK[c.slug] ?? { bg: "bg-mint-soft", icon: "presente" as const };
                return (
                  <li key={c.slug} className="min-w-0">
                    <Link href={`/ocasioes/${c.slug}`} className={`group flex h-full items-center gap-3 rounded-lg border-2 border-ink p-3 shadow-[0_4px_0_var(--ink)] transition-transform duration-200 ease-premium hover:-translate-y-1 sm:p-4 ${look.bg}`}>
                      <span className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-white sm:h-16 sm:w-16">
                        {look.character ? <Character kind={look.character} className="h-12 w-12 sm:h-14 sm:w-14" bounce={false} /> : <Icon kind={look.icon!} className="h-9 w-9" />}
                      </span>
                      <span className="flex min-w-0 flex-col">
                        <span className="font-display text-lg font-bold leading-tight">{c.name}</span>
                        <span className="text-xs font-bold text-ink-soft">{c.template_count} {c.template_count === 1 ? "modelo" : "modelos"}</span>
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </Container>
        </section>
        <Wave fill="#ffffff" flip />

        {/* Mais vendidos */}
        <section aria-labelledby="destaques-t" className="py-14 sm:py-20">
          <Container className="flex flex-col gap-10">
            <div className="flex flex-col items-center gap-3 text-center">
              <Character kind="leao" className="h-20 w-20" />
              <h2 id="destaques-t" className="font-display text-4xl font-bold sm:text-5xl">Os mais amados</h2>
              <p className="max-w-lg font-semibold text-ink-soft">Os convites que a turma mais escolhe. Toque para ver funcionando.</p>
            </div>
            <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
              {featured.items.map((t, i) => <TemplateCard key={t.slug} t={t} index={i} />)}
            </div>
          </Container>
        </section>

        {/* Como funciona */}
        <section id="como-funciona" aria-labelledby="como-t" className="scroll-mt-24 bg-purple-ink py-14 text-white sm:py-20">
          <Container className="flex flex-col gap-16">
            <h2 id="como-t" className="text-center font-display text-4xl font-bold sm:text-5xl">É fácil assim</h2>
            <ol className="grid gap-16 sm:grid-cols-2 sm:gap-x-6 lg:grid-cols-4">
              {STEPS.map((s, i) => (
                <li key={s.t} className="relative flex flex-col items-center gap-3 rounded-lg bg-white p-6 pt-14 text-center text-ink shadow-[0_6px_0_rgba(0,0,0,0.25)]">
                  <Character kind={s.ch} className="absolute -top-14 h-24 w-24" />
                  <span className={`mt-4 grid h-10 w-10 place-items-center rounded-full font-display text-xl font-bold text-white ${s.c}`}>{i + 1}</span>
                  <h3 className="font-display text-xl font-bold">{s.t}</h3>
                  <p className="text-sm font-semibold text-ink-soft">{s.d}</p>
                </li>
              ))}
            </ol>
          </Container>
        </section>

        {/* Demonstração do editor */}
        <section aria-labelledby="demo-t" className="bg-[linear-gradient(180deg,#fff3c4,transparent)] py-14 sm:py-20">
          <Container className="flex flex-col gap-10">
            <div className="flex max-w-xl flex-col gap-3">
              <p className="self-start rounded-full bg-brand px-4 py-1 font-display text-sm font-semibold text-white">Experimente agora</p>
              <h2 id="demo-t" className="font-display text-4xl font-bold sm:text-5xl">Monte um convite de mentirinha</h2>
              <p className="font-semibold text-ink-soft">Troque o personagem, o nome e a cor. A prévia muda na hora.</p>
            </div>
            <EditorDemo />
          </Container>
        </section>

        {/* Novidades */}
        {gallery.length > 0 && (
          <section aria-labelledby="galeria-t" className="py-14 sm:py-20">
            <Container className="flex flex-col gap-10">
              <div className="flex items-end justify-between gap-6">
                <h2 id="galeria-t" className="font-display text-4xl font-bold">Acabaram de chegar</h2>
                <Link href="/convites?ordem=novidades" className="hidden font-display font-semibold text-brand-ink underline-offset-4 hover:underline sm:inline">Ver todos →</Link>
              </div>
              <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
                {gallery.map((t, i) => <TemplateCard key={t.slug} t={t} index={i + 1} />)}
              </div>
            </Container>
          </section>
        )}

        {/* Benefícios */}
        <section aria-labelledby="beneficios-t" className="bg-white py-14 sm:py-20">
          <Container className="flex flex-col gap-10">
            <h2 id="beneficios-t" className="text-center font-display text-4xl font-bold sm:text-5xl">Tudo que sua festa precisa</h2>
            <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {BENEFITS.map((b) => (
                <li key={b.t} className={`flex gap-4 rounded-lg p-5 ${b.bg}`}>
                  <span className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-white"><Icon kind={b.i} className="h-9 w-9" /></span>
                  <div>
                    <h3 className="font-display text-lg font-bold">{b.t}</h3>
                    <p className="mt-1 text-sm font-semibold text-ink-soft">{b.d}</p>
                  </div>
                </li>
              ))}
            </ul>
          </Container>
        </section>

        {/* Perguntas frequentes */}
        <section id="perguntas" aria-labelledby="faq-t" className="scroll-mt-24 py-14 sm:py-20">
          <Container className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
            <div className="flex flex-col gap-4">
              <h2 id="faq-t" className="font-display text-4xl font-bold">Perguntas frequentes</h2>
              <Character kind="astronauta" className="hidden h-40 w-40 lg:block" />
            </div>
            <div className="flex flex-col gap-3">
              {FAQ.map((f) => (
                <details key={f.q} className="group rounded-lg border-2 border-ink bg-white px-5 py-4 open:shadow-[0_4px_0_var(--ink)]">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-6 font-display text-lg font-semibold [&::-webkit-details-marker]:hidden">
                    {f.q}
                    <span aria-hidden className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-yellow text-xl transition-transform duration-200 group-open:rotate-45">+</span>
                  </summary>
                  <p className="mt-3 max-w-2xl text-sm font-semibold leading-relaxed text-ink-soft">{f.a}</p>
                </details>
              ))}
            </div>
          </Container>
        </section>

        {/* Chamada final */}
        <section className="px-4 pb-16">
          <div className="relative mx-auto flex max-w-5xl flex-col items-center gap-5 overflow-hidden rounded-lg border-2 border-ink bg-brand px-6 py-12 text-center text-white shadow-[0_8px_0_var(--ink)]">
            <Confetti />
            <div className="relative flex items-end gap-2">
              <Character kind="urso" className="h-20 w-20 sm:h-24 sm:w-24" />
              <Character kind="dino" className="h-20 w-20 sm:h-24 sm:w-24" />
              <Character kind="coelha" className="h-20 w-20 sm:h-24 sm:w-24" />
            </div>
            <h2 className="relative font-display text-4xl font-bold sm:text-5xl">Bora fazer o convite da festa?</h2>
            <p className="relative max-w-lg text-lg font-semibold">Fica pronto em minutos e custa a partir de {priceFrom}.</p>
            <Link href="/convites" className="relative inline-flex h-14 items-center rounded-full border-2 border-ink bg-yellow px-8 font-display text-lg font-bold text-ink shadow-[0_5px_0_var(--ink)] transition-transform hover:-translate-y-0.5">
              Escolher meu convite
            </Link>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
