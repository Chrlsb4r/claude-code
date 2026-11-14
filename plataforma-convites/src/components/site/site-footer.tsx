import Link from "next/link";
import { Container } from "@/components/ui/card";
import { Logo } from "./site-header";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-line/70 bg-paper-raised">
      <Container className="grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div className="flex flex-col gap-3">
          <Logo />
          <p className="max-w-xs text-sm leading-relaxed text-graphite-soft">
            Convites digitais interativos, com link exclusivo e confirmação de presença online.
          </p>
        </div>
        <nav aria-label="Loja" className="flex flex-col gap-2 text-sm">
          <span className="mb-1 text-xs uppercase tracking-[0.25em] text-champagne-ink">Loja</span>
          <Link href="/convites" className="text-graphite-soft hover:text-graphite">Todos os convites</Link>
          <Link href="/ocasioes/casamento" className="text-graphite-soft hover:text-graphite">Casamento</Link>
          <Link href="/ocasioes/aniversario-infantil" className="text-graphite-soft hover:text-graphite">Aniversário infantil</Link>
          <Link href="/ocasioes/cha-de-bebe" className="text-graphite-soft hover:text-graphite">Chá de bebê</Link>
        </nav>
        <nav aria-label="Ajuda" className="flex flex-col gap-2 text-sm">
          <span className="mb-1 text-xs uppercase tracking-[0.25em] text-champagne-ink">Ajuda</span>
          <Link href="/#como-funciona" className="text-graphite-soft hover:text-graphite">Como funciona</Link>
          <Link href="/#perguntas" className="text-graphite-soft hover:text-graphite">Perguntas frequentes</Link>
        </nav>
        <div className="flex flex-col gap-2 text-sm text-graphite-soft">
          <span className="mb-1 text-xs uppercase tracking-[0.25em] text-champagne-ink">Pagamento seguro</span>
          <p>Pix e cartão de crédito processados pelo Mercado Pago. Não armazenamos dados de cartão.</p>
        </div>
      </Container>
      <div className="border-t border-line/70">
        <Container className="py-5 text-xs text-graphite-soft">Atelier de Convites</Container>
      </div>
    </footer>
  );
}
