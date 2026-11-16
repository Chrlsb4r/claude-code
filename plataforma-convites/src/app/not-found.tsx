import Link from "next/link";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { buttonClasses } from "@/components/ui/button";
import { Container } from "@/components/ui/card";

export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main id="conteudo" className="flex flex-1 items-center">
        <Container className="flex flex-col items-start gap-5 py-24">
          <p className="text-xs uppercase tracking-[0.3em] text-brand-ink">Página não encontrada</p>
          <h1 className="max-w-xl font-display text-5xl font-bold leading-tight">Não encontramos o que você procurava.</h1>
          <p className="text-ink-soft">O endereço pode ter mudado ou não existir mais.</p>
          <Link href="/convites" className={buttonClasses("primary", "lg")}>Ver convites</Link>
        </Container>
      </main>
      <SiteFooter />
    </>
  );
}
