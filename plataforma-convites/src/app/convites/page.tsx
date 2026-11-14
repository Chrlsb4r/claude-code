import type { Metadata } from "next";
import { Suspense } from "react";
import { CatalogBrowser, CatalogSkeleton } from "@/components/catalog/catalog-browser";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { Container } from "@/components/ui/card";
import { parseCatalogQuery } from "@/lib/catalog/search-params";

export const metadata: Metadata = {
  title: "Catálogo de convites",
  description: "Convites digitais para casamento, aniversário, chá de bebê, chá revelação, 15 anos e mais.",
};

async function Results({ searchParams }: { searchParams: PageProps<"/convites">["searchParams"] }) {
  const q = parseCatalogQuery(await searchParams);
  return <CatalogBrowser q={q} />;
}

async function HeaderWithQuery({ searchParams }: { searchParams: PageProps<"/convites">["searchParams"] }) {
  const q = parseCatalogQuery(await searchParams);
  return <SiteHeader query={q.q} />;
}

export default function CatalogPage({ searchParams }: PageProps<"/convites">) {
  return (
    <>
      <Suspense fallback={<SiteHeader />}>
        <HeaderWithQuery searchParams={searchParams} />
      </Suspense>
      <main id="conteudo" className="flex-1">
        <Container className="flex flex-col gap-10 py-12 sm:py-16">
          <header className="flex max-w-2xl flex-col gap-3">
            <p className="text-xs uppercase tracking-[0.3em] text-champagne-ink">Catálogo</p>
            <h1 className="font-serif text-5xl leading-tight">Todos os convites</h1>
            <p className="text-graphite-soft">Cada modelo é uma página web interativa, com confirmação de presença e link exclusivo.</p>
          </header>
          <Suspense fallback={<CatalogSkeleton />}>
            <Results searchParams={searchParams} />
          </Suspense>
        </Container>
      </main>
      <SiteFooter />
    </>
  );
}
