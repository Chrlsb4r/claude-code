import Link from "next/link";
import { Container } from "@/components/ui/card";

export function Logo() {
  return (
    <Link href="/" className="flex items-baseline gap-2" aria-label="Atelier de Convites, página inicial">
      <span className="font-serif text-2xl tracking-tight">Atelier</span>
      <span className="hidden text-[11px] uppercase tracking-[0.35em] text-champagne-ink sm:inline">de convites</span>
    </Link>
  );
}

/** Busca funciona sem JavaScript (GET para /convites). */
export function SearchForm({ defaultValue, id = "busca" }: { defaultValue?: string; id?: string }) {
  return (
    <form action="/convites" role="search" className="relative w-full">
      <label htmlFor={id} className="sr-only">Buscar convites</label>
      <input
        id={id}
        name="q"
        type="search"
        defaultValue={defaultValue}
        maxLength={80}
        placeholder="Buscar por ocasião, estilo ou tema"
        className="h-11 w-full rounded-full border border-line bg-paper-raised pl-11 pr-4 text-sm placeholder:text-graphite-soft/80 transition-colors hover:border-champagne focus:border-champagne-ink focus:outline-none"
      />
      <svg aria-hidden viewBox="0 0 24 24" className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-graphite-soft" fill="none" stroke="currentColor" strokeWidth="1.8">
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-3.5-3.5" strokeLinecap="round" />
      </svg>
    </form>
  );
}

const NAV = [
  { href: "/convites", label: "Catálogo" },
  { href: "/#ocasioes", label: "Ocasiões" },
  { href: "/#como-funciona", label: "Como funciona" },
  { href: "/#perguntas", label: "Dúvidas" },
];

export function SiteHeader({ query }: { query?: string }) {
  return (
    <header className="sticky top-0 z-30 border-b border-line/70 bg-paper/90 backdrop-blur supports-[backdrop-filter]:bg-paper/75">
      <Container className="flex h-16 items-center gap-6">
        <Logo />
        <div className="hidden max-w-sm flex-1 md:block">
          <SearchForm defaultValue={query} id="busca-topo" />
        </div>
        <nav aria-label="Principal" className="ml-auto hidden items-center gap-7 text-sm text-graphite-soft lg:flex">
          {NAV.map((n) => (
            <Link key={n.href} href={n.href} className="transition-colors hover:text-graphite">
              {n.label}
            </Link>
          ))}
        </nav>
        <details className="group relative ml-auto lg:hidden">
          <summary className="flex h-10 w-10 cursor-pointer list-none items-center justify-center rounded-full border border-line [&::-webkit-details-marker]:hidden" aria-label="Abrir menu">
            <svg aria-hidden viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
              <path d="M4 7h16M4 12h16M4 17h16" />
            </svg>
          </summary>
          <div className="absolute right-0 top-12 w-72 rounded-lg border border-line bg-paper-raised p-4 shadow-lift">
            <SearchForm defaultValue={query} id="busca-menu" />
            <nav aria-label="Menu" className="mt-3 flex flex-col">
              {NAV.map((n) => (
                <Link key={n.href} href={n.href} className="rounded-md px-3 py-3 text-sm hover:bg-paper">
                  {n.label}
                </Link>
              ))}
            </nav>
          </div>
        </details>
      </Container>
    </header>
  );
}
