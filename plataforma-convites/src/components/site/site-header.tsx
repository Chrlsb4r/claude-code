import Link from "next/link";
import { Character } from "@/components/characters/characters";
import { Container } from "@/components/ui/card";
import { BRAND } from "@/lib/brand";

// Tons escurecidos o suficiente para contraste ≥ 3:1 (texto grande) sobre branco.
const LOGO_COLORS = ["#e5266e", "#d9480f", "#9a6b00", "#1e8a4c", "#1f7fd1", "#7b4dff"];

export function Logo() {
  const words = BRAND.split(" ");
  let i = 0;
  return (
    <Link href="/" className="group flex items-center gap-2" aria-label={`${BRAND}, página inicial`}>
      <Character kind="urso" className="h-10 w-10 transition-transform duration-300 ease-premium group-hover:-rotate-6" bounce={false} />
      <span className="font-display text-2xl font-bold tracking-tight">
        {words.map((w, wi) => (
          <span key={wi}>
            {wi > 0 && " "}
            {w.split("").map((ch) => (
              <span key={i} style={{ color: LOGO_COLORS[i++ % LOGO_COLORS.length] }}>{ch}</span>
            ))}
          </span>
        ))}
      </span>
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
        placeholder="Buscar tema: dinossauro, astronauta, chá de bebê..."
        className="h-12 w-full rounded-full border-2 border-line bg-white pl-12 pr-4 text-sm font-semibold placeholder:font-normal placeholder:text-ink-soft transition-colors hover:border-brand-soft focus:border-purple focus:outline-none"
      />
      <svg aria-hidden viewBox="0 0 24 24" className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-brand" fill="none" stroke="currentColor" strokeWidth="2.4">
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
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/85">
      <Container className="flex h-[72px] items-center gap-6">
        <Logo />
        <div className="hidden max-w-md flex-1 md:block">
          <SearchForm defaultValue={query} id="busca-topo" />
        </div>
        <nav aria-label="Principal" className="ml-auto hidden items-center gap-6 font-display text-base font-semibold lg:flex">
          {NAV.map((n) => (
            <Link key={n.href} href={n.href} className="rounded-full px-2 py-1 transition-colors hover:text-brand-ink">
              {n.label}
            </Link>
          ))}
        </nav>
        <details className="group relative ml-auto lg:hidden">
          <summary className="flex h-11 w-11 cursor-pointer list-none items-center justify-center rounded-full border-2 border-ink bg-yellow [&::-webkit-details-marker]:hidden" aria-label="Abrir menu">
            <svg aria-hidden viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
              <path d="M4 7h16M4 12h16M4 17h16" />
            </svg>
          </summary>
          <div className="absolute right-0 top-14 w-[min(20rem,calc(100vw-2rem))] rounded-lg border-2 border-ink bg-white p-4 shadow-lift">
            <SearchForm defaultValue={query} id="busca-menu" />
            <nav aria-label="Menu" className="mt-3 flex flex-col font-display font-semibold">
              {NAV.map((n) => (
                <Link key={n.href} href={n.href} className="rounded-md px-3 py-3 hover:bg-pink-soft">
                  {n.label}
                </Link>
              ))}
            </nav>
          </div>
        </details>
      </Container>
      <div aria-hidden className="h-1.5 bg-[linear-gradient(90deg,#e5266e_0_16.6%,#ff8a3d_0_33.3%,#ffc93c_0_50%,#2dbe6c_0_66.6%,#2f9bef_0_83.3%,#7b4dff_0)]" />
    </header>
  );
}
