import Link from "next/link";
import { InvitationView } from "@/components/invitation/invitation-view";
import { Badge } from "@/components/ui/card";
import { demoContent } from "@/lib/catalog/demo-content";
import type { TemplateCard as Card } from "@/lib/catalog/types";
import { featureLabel, formatPrice } from "@/lib/format";

const TILT = ["hover:-rotate-1", "hover:rotate-1"];

/** Cartão do catálogo: capa = o próprio convite (animado) com dados fictícios. */
export function TemplateCard({ t, headingLevel = 3, index = 0 }: { t: Card; headingLevel?: 2 | 3; index?: number }) {
  const H = headingLevel === 2 ? "h2" : "h3";
  const animated = t.layout.variant === "animado";
  return (
    <article className={`group relative flex min-w-0 flex-col overflow-hidden rounded-lg border-2 border-ink bg-white shadow-[0_6px_0_var(--ink)] transition-transform duration-300 ease-premium hover:-translate-y-1.5 ${TILT[index % 2]} motion-reduce:transform-none`}>
      <div className="relative aspect-[4/5] overflow-hidden border-b-2 border-ink">
        <InvitationView content={demoContent(t.category.slug, t.slug)} layout={t.layout} inert className="h-full" label={`Prévia do modelo ${t.name}`} />
        <div className="absolute left-3 top-3 z-20 flex flex-wrap gap-2">
          {t.is_featured && <Badge tone="rose" className="border-ink">Mais vendido</Badge>}
          {animated && <Badge className="border-ink bg-yellow text-ink">Animado</Badge>}
        </div>
      </div>
      <div className="flex items-start justify-between gap-3 p-4">
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-wider text-brand-ink">{t.category.name}</p>
          <H className="mt-1 font-display text-xl font-bold leading-tight">
            <Link href={`/modelos/${t.slug}`} className="after:absolute after:inset-0 after:z-30 focus-visible:outline-none">
              {t.name}
            </Link>
          </H>
          <p className="mt-1 truncate text-sm text-ink-soft">{t.features.filter((f) => f !== "animacao").slice(0, 2).map(featureLabel).join(" · ")}</p>
        </div>
        <p className="shrink-0 rounded-full bg-mint-soft px-3 py-1 font-display text-base font-bold text-green-ink">{formatPrice(t.price_cents)}</p>
      </div>
      <span className="pointer-events-none absolute inset-0 rounded-lg ring-purple ring-offset-4 ring-offset-cream group-has-[a:focus-visible]:ring-4" aria-hidden />
    </article>
  );
}
