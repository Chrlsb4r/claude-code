import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { GuestExperience } from "@/components/guest/guest-experience";
import { getTemplate, searchTemplates } from "@/lib/catalog/data";
import { demoContent } from "@/lib/catalog/demo-content";

export async function generateStaticParams() {
  const all = await searchTemplates({ pagina: 1 });
  return all.items.map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({ params }: PageProps<"/modelos/[slug]/convidado">): Promise<Metadata> {
  const t = await getTemplate((await params).slug);
  return t ? { title: `Como o convidado recebe: ${t.name}`, robots: { index: false } } : {};
}

/** Demonstração da experiência do convidado com dados fictícios (nada é salvo). */
export default async function GuestDemoPage({ params }: PageProps<"/modelos/[slug]/convidado">) {
  const t = await getTemplate((await params).slug);
  if (!t) notFound();
  const content = { ...demoContent(t.category.slug, t.slug), event_date: "2027-04-17" };

  return (
    <main id="conteudo" className="relative min-h-full flex-1 pb-24">
      <GuestExperience content={content} layout={t.layout} demo />
      <div className="fixed inset-x-0 bottom-0 z-40 border-t-2 border-ink bg-white/95 px-4 py-3 backdrop-blur">
        <div className="mx-auto flex max-w-[480px] items-center justify-between gap-3">
          <p className="text-xs font-bold text-ink-soft">Exemplo com dados fictícios · {t.name}</p>
          <Link href={`/modelos/${t.slug}`} className="shrink-0 rounded-full bg-brand px-4 py-2 font-display text-sm font-bold text-white">
            Quero este
          </Link>
        </div>
      </div>
    </main>
  );
}
