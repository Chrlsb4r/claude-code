import { buttonClasses } from "@/components/ui/button";
import { Badge, Card, Container } from "@/components/ui/card";

// Fase 1: vitrine do design system. A home completa (catálogo real do banco) é a Fase 2.
const categorias = ["Casamento", "Aniversário infantil", "Chá de bebê", "Chá revelação", "15 anos", "Corporativo"];

export default function Home() {
  return (
    <>
      <header className="border-b border-line/70">
        <Container className="flex h-16 items-center justify-between">
          <span className="font-serif text-2xl tracking-tight">Atelier de Convites</span>
          <nav aria-label="Principal" className="hidden gap-8 text-sm text-graphite-soft sm:flex">
            <a href="#categorias" className="hover:text-graphite">Catálogo</a>
            <a href="#como-funciona" className="hover:text-graphite">Como funciona</a>
          </nav>
        </Container>
      </header>
      <main id="conteudo" className="flex-1">
        <Container className="grid gap-12 py-16 sm:py-24 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div className="flex flex-col gap-6">
            <Badge tone="sage" className="self-start">Convites online com confirmação de presença</Badge>
            <h1 className="font-serif text-5xl leading-[1.05] tracking-tight text-balance sm:text-6xl">
              Um convite à altura do seu momento.
            </h1>
            <p className="max-w-xl text-lg leading-relaxed text-graphite-soft">
              Escolha um modelo, personalize em minutos e compartilhe um link exclusivo. Seus convidados confirmam presença e você acompanha tudo em tempo real.
            </p>
            <div className="flex flex-wrap gap-3">
              <a href="#categorias" className={buttonClasses("primary", "lg")}>Ver convites</a>
              <a href="#como-funciona" className={buttonClasses("secondary", "lg")}>Como funciona</a>
            </div>
          </div>
          <Card className="mx-auto aspect-[9/16] w-full max-w-xs overflow-hidden p-6">
            <div className="flex h-full flex-col items-center justify-center gap-4 rounded-md border border-champagne/60 bg-paper p-6 text-center">
              <span className="text-xs uppercase tracking-[0.3em] text-champagne-ink">Você está convidado</span>
              <span className="font-serif text-4xl">Helena</span>
              <span className="h-px w-12 bg-champagne" aria-hidden />
              <span className="text-sm text-graphite-soft">Demonstração com dados fictícios</span>
            </div>
          </Card>
        </Container>
        <section id="categorias" aria-labelledby="cat-title" className="border-t border-line/70 py-16">
          <Container className="flex flex-col gap-8">
            <h2 id="cat-title" className="font-serif text-3xl">Ocasiões</h2>
            <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              {categorias.map((c) => (
                <li key={c}>
                  <Card className="p-6 transition-shadow duration-300 hover:shadow-lift">
                    <span className="font-serif text-xl">{c}</span>
                  </Card>
                </li>
              ))}
            </ul>
          </Container>
        </section>
      </main>
    </>
  );
}
