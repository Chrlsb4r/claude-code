import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { CatalogBrowser, CatalogSkeleton } from "@/components/catalog/catalog-browser";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { Container } from "@/components/ui/card";
import { getCategories } from "@/lib/catalog/data";
import { parseCatalogQuery } from "@/lib/catalog/search-params";

export async function generateStaticParams() {
  const cats = await getCategories();
  return cats.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: PageProps<"/ocasioes/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const cat = (await getCategories()).find((c) => c.slug === slug);
  return cat ? { title: `Convites de ${cat.name.toLowerCase()}`, description: `Modelos de convite digital para ${cat.name.toLowerCase()}.` } : {};
}

async function Results({ slug, searchParams }: { slug: string; searchParams: PageProps<"/ocasioes/[slug]">["searchParams"] }) {
  const q = parseCatalogQuery(await searchParams);
  return <CatalogBrowser q={q} lockCategory={slug} />;
}

export default async function OccasionPage({ params, searchParams }: PageProps<"/ocasioes/[slug]">) {
  const { slug } = await params;
  const cat = (await getCategories()).find((c) => c.slug === slug);
  if (!cat) notFound();

  return (
    <>
      <SiteHeader />
      <main id="conteudo" className="flex-1">
        <Container className="flex flex-col gap-10 py-12 sm:py-16">
          <header className="flex max-w-2xl flex-col gap-3">
            <p className="text-xs uppercase tracking-[0.3em] text-champagne-ink">Ocasião</p>
            <h1 className="font-serif text-5xl leading-tight">{cat.name}</h1>
            <p className="text-graphite-soft">{cat.description ?? `Convites digitais para ${cat.name.toLowerCase()}, com confirmação de presença online.`}</p>
          </header>
          <Suspense fallback={<CatalogSkeleton />}>
            <Results slug={slug} searchParams={searchParams} />
          </Suspense>
        </Container>
      </main>
      <SiteFooter />
    </>
  );
}
