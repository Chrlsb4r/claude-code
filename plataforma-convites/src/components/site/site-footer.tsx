import Link from "next/link";
import { Character } from "@/components/characters/characters";
import { Container } from "@/components/ui/card";
import { BRAND } from "@/lib/brand";

export function SiteFooter() {
  return (
    <footer className="mt-auto bg-ink text-white">
      <Container className="grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <Character kind="dino" className="h-12 w-12" bounce={false} />
            <span className="font-display text-2xl font-bold">{BRAND}</span>
          </div>
          <p className="max-w-xs text-sm leading-relaxed text-white/80">
            Convites animados com link exclusivo e confirmação de presença online.
          </p>
        </div>
        <nav aria-label="Loja" className="flex flex-col gap-2 text-sm">
          <span className="mb-1 font-display text-base font-semibold text-yellow">Loja</span>
          <Link href="/convites" className="text-white/80 hover:text-white">Todos os convites</Link>
          <Link href="/ocasioes/aniversario-infantil" className="text-white/80 hover:text-white">Aniversário infantil</Link>
          <Link href="/ocasioes/cha-de-bebe" className="text-white/80 hover:text-white">Chá de bebê</Link>
          <Link href="/ocasioes/casamento" className="text-white/80 hover:text-white">Casamento</Link>
        </nav>
        <nav aria-label="Ajuda" className="flex flex-col gap-2 text-sm">
          <span className="mb-1 font-display text-base font-semibold text-yellow">Ajuda</span>
          <Link href="/#como-funciona" className="text-white/80 hover:text-white">Como funciona</Link>
          <Link href="/#perguntas" className="text-white/80 hover:text-white">Perguntas frequentes</Link>
        </nav>
        <div className="flex flex-col gap-2 text-sm text-white/80">
          <span className="mb-1 font-display text-base font-semibold text-yellow">Pagamento seguro</span>
          <p>Pix e cartão de crédito pelo Mercado Pago. Não armazenamos dados de cartão.</p>
        </div>
      </Container>
      <div className="border-t border-white/15">
        <Container className="py-5 text-xs text-white/70">
          {BRAND} · Personagens originais da loja.
        </Container>
      </div>
    </footer>
  );
}
