import Link from "next/link";
import { TemplateCard } from "@/components/catalog/template-card";
import { InvitationView } from "@/components/invitation/invitation-view";
import { PhoneFrame } from "@/components/invitation/phone-frame";
import { EditorDemo } from "@/components/site/editor-demo";
import { SiteFooter } from "@/components/site/site-footer";
import { SearchForm, SiteHeader } from "@/components/site/site-header";
import { buttonClasses } from "@/components/ui/button";
import { Container } from "@/components/ui/card";
import { getCategories, getFeatured, searchTemplates } from "@/lib/catalog/data";
import { demoContent } from "@/lib/catalog/demo-content";

const STEPS = [
  { n: "01", t: "Escolha o modelo", d: "Navegue pelas ocasiões e veja cada convite funcionando antes de decidir." },
  { n: "02", t: "Personalize", d: "Preencha os dados do evento e acompanhe a prévia em tempo real. Seu rascunho é salvo automaticamente." },
  { n: "03", t: "Pague com segurança", d: "Pix ou cartão pelo Mercado Pago. O convite é publicado assim que o pagamento é confirmado." },
  { n: "04", t: "Compartilhe e acompanhe", d: "Envie o link exclusivo e veja as confirmações chegando no seu painel." },
];

const BENEFITS = [
  { t: "Link exclusivo", d: "Um endereço único e difícil de adivinhar para cada convite." },
  { t: "Confirmação de presença", d: "Respostas, acompanhantes e observações organizados para você." },
  { t: "Painel em tempo real", d: "Contagem de pessoas confirmadas, filtros e exportação em CSV." },
  { t: "Links individuais", d: "Gere convites nominais para controlar quem pode confirmar." },
  { t: "Feito para o celular", d: "Leve, rápido e bonito na tela onde seus convidados vão abrir." },
  { t: "Privacidade", d: "Os dados dos convidados ficam visíveis só para você." },
];

const FAQ = [
  { q: "O convite é um arquivo para baixar?", a: "Não. Você recebe um link para uma página web personalizada e interativa, que pode ser enviada pelo WhatsApp, Instagram, e-mail ou qualquer outro meio." },
  { q: "Meus convidados precisam criar conta?", a: "Não. Eles abrem o link e confirmam a presença diretamente na página do convite." },
  { q: "Por quanto tempo o convite fica no ar?", a: "Até 24 horas depois do horário de início do evento. Depois disso, a página mostra que o evento foi encerrado e as confirmações são bloqueadas. O histórico continua disponível no seu painel." },
  { q: "Posso alterar as informações depois de pagar?", a: "Sim, os campos autorizados pelo modelo podem ser editados no painel. A data do evento pode ser remarcada até duas vezes." },
  { q: "Quais formas de pagamento são aceitas?", a: "Pix e cartão de crédito, processados pelo Mercado Pago. Não armazenamos dados de cartão." },
  { q: "Consigo limitar o número de acompanhantes?", a: "Sim. Você define o máximo de acompanhantes, a data-limite e se aceita respostas negativas." },
];

export default async function Home() {
  const [categories, featured, latest] = await Promise.all([getCategories(), getFeatured(3), searchTemplates({ ordem: "novidades" })]);
  const gallery = latest.items.filter((t) => !featured.items.some((f) => f.slug === t.slug)).slice(0, 6);
  const hero = featured.items[0];

  return (
    <>
      <SiteHeader />
      <main id="conteudo" className="flex-1">
        {/* Banner */}
        <section className="relative overflow-hidden">
          <Container className="grid gap-14 py-14 sm:py-20 lg:grid-cols-[1.15fr_0.85fr] lg:items-center lg:py-28">
            <div className="flex flex-col gap-7">
              <p className="text-xs uppercase tracking-[0.35em] text-champagne-ink">Convites digitais interativos</p>
              <h1 className="font-serif text-[2.9rem] leading-[1.02] tracking-tight text-balance sm:text-6xl lg:text-7xl">
                Um convite à altura do seu momento.
              </h1>
              <p className="max-w-xl text-lg leading-relaxed text-graphite-soft">
                Escolha um modelo, personalize em minutos e compartilhe um link exclusivo. Seus convidados confirmam presença e você acompanha tudo em tempo real.
              </p>
              <div className="max-w-md md:hidden">
                <SearchForm id="busca-hero" />
              </div>
              <div className="flex flex-wrap gap-3">
                <Link href="/convites" className={buttonClasses("primary", "lg")}>Ver convites</Link>
                <Link href="#como-funciona" className={buttonClasses("secondary", "lg")}>Como funciona</Link>
              </div>
            </div>
            {hero && (
              <div className="relative">
                <div aria-hidden className="absolute inset-x-6 bottom-6 top-10 -z-10 rounded-[48px] bg-rose/50 blur-2xl" />
                <PhoneFrame className="rotate-[2deg] motion-reduce:rotate-0">
                  <InvitationView content={demoContent(hero.category.slug)} variant={hero.layout.variant} inert className="min-h-full" label={`Demonstração do modelo ${hero.name}`} />
                </PhoneFrame>
                <p className="mt-5 text-center text-xs text-graphite-soft">Modelo {hero.name} · demonstração com dados fictícios</p>
              </div>
            )}
          </Container>
        </section>

        {/* Categorias */}
        <section id="ocasioes" aria-labelledby="ocasioes-t" className="scroll-mt-20 border-t border-line/70 py-16 sm:py-20">
          <Container className="flex flex-col gap-10">
            <div className="flex items-end justify-between gap-6">
              <h2 id="ocasioes-t" className="font-serif text-4xl">Para cada ocasião</h2>
              <Link href="/convites" className="hidden text-sm underline-offset-4 hover:underline sm:inline">Ver catálogo completo</Link>
            </div>
            <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {categories.filter((c) => c.template_count > 0).map((c) => (
                <li key={c.slug}>
                  <Link href={`/ocasioes/${c.slug}`} className="group flex h-full flex-col justify-between gap-6 rounded-lg border border-line bg-paper-raised p-5 transition-[border-color,box-shadow] duration-300 hover:border-champagne hover:shadow-soft">
                    <span className="font-serif text-xl leading-tight sm:text-2xl">{c.name}</span>
                    <span className="text-xs text-graphite-soft">
                      {c.template_count} {c.template_count === 1 ? "modelo" : "modelos"}
                      <span aria-hidden className="ml-1 inline-block transition-transform group-hover:translate-x-1">→</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </Container>
        </section>

        {/* Mais procurados */}
        <section aria-labelledby="destaques-t" className="py-16 sm:py-20">
          <Container className="flex flex-col gap-10">
            <div className="flex flex-col gap-3">
              <p className="text-xs uppercase tracking-[0.3em] text-champagne-ink">Destaques</p>
              <h2 id="destaques-t" className="font-serif text-4xl">Mais procurados</h2>
            </div>
            <div className="grid grid-cols-1 gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
              {featured.items.map((t) => (
                <TemplateCard key={t.slug} t={t} />
              ))}
            </div>
          </Container>
        </section>

        {/* Galeria */}
        <section aria-labelledby="galeria-t" className="border-t border-line/70 py-16 sm:py-20">
          <Container className="flex flex-col gap-10">
            <div className="flex items-end justify-between gap-6">
              <div className="flex flex-col gap-3">
                <p className="text-xs uppercase tracking-[0.3em] text-champagne-ink">Galeria</p>
                <h2 id="galeria-t" className="font-serif text-4xl">Novidades do ateliê</h2>
              </div>
              <Link href="/convites?ordem=novidades" className="hidden text-sm underline-offset-4 hover:underline sm:inline">Ver todos</Link>
            </div>
            <div className="grid grid-cols-1 gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
              {gallery.map((t) => (
                <TemplateCard key={t.slug} t={t} />
              ))}
            </div>
          </Container>
        </section>

        {/* Como funciona */}
        <section id="como-funciona" aria-labelledby="como-t" className="scroll-mt-20 border-y border-line/70 bg-paper-raised py-16 sm:py-24">
          <Container className="flex flex-col gap-12">
            <h2 id="como-t" className="max-w-xl font-serif text-4xl">Do modelo ao link em quatro passos</h2>
            <ol className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
              {STEPS.map((s) => (
                <li key={s.n} className="flex flex-col gap-3 border-t border-champagne pt-5">
                  <span className="font-serif text-3xl text-champagne-ink">{s.n}</span>
                  <h3 className="text-base font-medium">{s.t}</h3>
                  <p className="text-sm leading-relaxed text-graphite-soft">{s.d}</p>
                </li>
              ))}
            </ol>
          </Container>
        </section>

        {/* Demonstração do editor */}
        <section aria-labelledby="demo-t" className="py-16 sm:py-24">
          <Container className="flex flex-col gap-10">
            <div className="flex max-w-xl flex-col gap-3">
              <p className="text-xs uppercase tracking-[0.3em] text-champagne-ink">Experimente</p>
              <h2 id="demo-t" className="font-serif text-4xl">Veja a prévia mudar enquanto você digita</h2>
            </div>
            <EditorDemo />
          </Container>
        </section>

        {/* Benefícios */}
        <section aria-labelledby="beneficios-t" className="border-t border-line/70 py-16 sm:py-24">
          <Container className="flex flex-col gap-12">
            <h2 id="beneficios-t" className="max-w-xl font-serif text-4xl">Pensado para anfitriões e convidados</h2>
            <ul className="grid gap-x-10 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
              {BENEFITS.map((b) => (
                <li key={b.t} className="flex gap-4">
                  <span aria-hidden className="mt-2 h-2 w-2 shrink-0 rounded-full bg-sage" />
                  <div>
                    <h3 className="font-medium">{b.t}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-graphite-soft">{b.d}</p>
                  </div>
                </li>
              ))}
            </ul>
          </Container>
        </section>

        {/* Perguntas frequentes */}
        <section id="perguntas" aria-labelledby="faq-t" className="scroll-mt-20 border-t border-line/70 bg-paper-raised py-16 sm:py-24">
          <Container className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
            <h2 id="faq-t" className="font-serif text-4xl">Perguntas frequentes</h2>
            <div className="divide-y divide-line border-y border-line">
              {FAQ.map((f) => (
                <details key={f.q} className="group py-5">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-6 text-base font-medium [&::-webkit-details-marker]:hidden">
                    {f.q}
                    <span aria-hidden className="text-xl text-champagne-ink transition-transform duration-200 group-open:rotate-45">+</span>
                  </summary>
                  <p className="mt-3 max-w-2xl text-sm leading-relaxed text-graphite-soft">{f.a}</p>
                </details>
              ))}
            </div>
          </Container>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
