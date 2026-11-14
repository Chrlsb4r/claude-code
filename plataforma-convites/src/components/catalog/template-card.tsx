import Link from "next/link";
import { InvitationView } from "@/components/invitation/invitation-view";
import { Badge } from "@/components/ui/card";
import { demoContent } from "@/lib/catalog/demo-content";
import type { TemplateCard as Card } from "@/lib/catalog/types";
import { featureLabel, formatPrice } from "@/lib/format";

/** Cartão do catálogo: capa = o próprio convite renderizado com dados fictícios. */
export function TemplateCard({ t, headingLevel = 3 }: { t: Card; headingLevel?: 2 | 3 }) {
  const H = headingLevel === 2 ? "h2" : "h3";
  return (
    <article className="group relative flex min-w-0 flex-col gap-4">
      <div className="relative overflow-hidden rounded-lg border border-line bg-paper-raised p-3 shadow-soft transition-shadow duration-300 ease-premium group-hover:shadow-lift">
        <div className="aspect-[4/5] overflow-hidden rounded-md">
          <InvitationView
            content={demoContent(t.category.slug)}
            variant={t.layout.variant}
            inert
            className="h-full transition-transform duration-500 ease-premium group-hover:scale-[1.02] motion-reduce:transform-none"
            label={`Prévia do modelo ${t.name}`}
          />
        </div>
        {t.is_featured && <Badge tone="rose" className="absolute left-5 top-5">Mais procurado</Badge>}
      </div>
      <div className="flex items-start justify-between gap-4 px-1">
        <div className="min-w-0">
          <p className="text-xs uppercase tracking-[0.22em] text-champagne-ink">{t.category.name}</p>
          <H className="mt-1 font-serif text-2xl leading-tight">
            <Link href={`/modelos/${t.slug}`} className="after:absolute after:inset-0 focus-visible:outline-none">
              {t.name}
            </Link>
          </H>
          <p className="mt-1 truncate text-sm text-graphite-soft">
            {t.features.slice(0, 2).map(featureLabel).join(" · ")}
          </p>
        </div>
        <p className="shrink-0 pt-5 text-sm font-medium">{formatPrice(t.price_cents)}</p>
      </div>
      <span className="pointer-events-none absolute inset-0 rounded-lg ring-champagne-ink ring-offset-4 ring-offset-paper group-has-[a:focus-visible]:ring-2" aria-hidden />
    </article>
  );
}
