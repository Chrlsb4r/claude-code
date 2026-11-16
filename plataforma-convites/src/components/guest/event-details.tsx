"use client";

import { downloadIcs } from "./calendar";
import type { InvitationContent } from "@/components/invitation/invitation-view";

function formatDate(date?: string) {
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) return null;
  const [y, m, d] = date.split("-").map(Number);
  const txt = new Intl.DateTimeFormat("pt-BR", { weekday: "long", day: "numeric", month: "long", timeZone: "UTC" }).format(new Date(Date.UTC(y, m - 1, d, 12)));
  return txt.charAt(0).toUpperCase() + txt.slice(1);
}

function GlassCard({ icon, title, children, gradient }: { icon: React.ReactNode; title: string; children: React.ReactNode; gradient: string }) {
  return (
    <section className="anim-rise-in relative overflow-hidden rounded-[24px] border border-white/70 bg-white/65 p-5 shadow-[0_20px_40px_-20px_rgba(42,26,74,0.45)] backdrop-blur-xl">
      <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full opacity-30 blur-2xl" style={{ background: gradient }} aria-hidden />
      <div className="flex items-start gap-4">
        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl text-white shadow-[0_8px_16px_-6px_rgba(42,26,74,0.5)]" style={{ background: gradient }}>{icon}</span>
        <div className="min-w-0 flex-1">
          <h3 className="text-xs font-extrabold uppercase tracking-[0.2em] text-ink-soft">{title}</h3>
          <div className="mt-1">{children}</div>
        </div>
      </div>
    </section>
  );
}

const ic = { fill: "none", stroke: "currentColor", strokeWidth: 2.2, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };

/** Cartões de detalhes com ações reais: adicionar à agenda (.ics) e abrir o mapa. */
export function EventDetails({ content: c, demo, accent }: { content: InvitationContent; demo?: boolean; accent: [string, string] }) {
  const gradient = `linear-gradient(135deg, ${accent[0]}, ${accent[1]})`;
  const mapUrl = c.map_url && /^https:\/\//.test(c.map_url) ? c.map_url : null;

  const addToCalendar = () => downloadIcs(c);

  const btn = "mt-3 inline-flex h-10 items-center gap-2 rounded-full px-4 text-sm font-bold text-white shadow-[0_4px_0_rgba(42,26,74,0.35)] transition-transform active:translate-y-0.5";

  return (
    <div className="flex flex-col gap-4">
      {(c.event_date || c.event_time) && (
        <GlassCard
          title="Quando"
          gradient={gradient}
          icon={<svg viewBox="0 0 24 24" className="h-6 w-6" {...ic}><rect x="3" y="5" width="18" height="16" rx="3" /><path d="M3 10h18M8 3v4M16 3v4" /></svg>}
        >
          <p className="font-display text-xl font-bold leading-tight text-ink">{formatDate(c.event_date)}</p>
          {c.event_time && <p className="font-semibold text-ink-soft">às {c.event_time.endsWith(":00") ? `${Number(c.event_time.slice(0, 2))}h` : `${Number(c.event_time.slice(0, 2))}h${c.event_time.slice(3)}`}</p>}
          <button type="button" onClick={addToCalendar} className={btn} style={{ background: gradient }}>
            <svg viewBox="0 0 24 24" className="h-4 w-4" {...ic}><path d="M12 5v14M5 12h14" /></svg> Adicionar à agenda
          </button>
        </GlassCard>
      )}
      {(c.venue_name || c.address) && (
        <GlassCard
          title="Onde"
          gradient={gradient}
          icon={<svg viewBox="0 0 24 24" className="h-6 w-6" {...ic}><path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21z" /><circle cx="12" cy="9.5" r="2.5" /></svg>}
        >
          {c.venue_name && <p className="font-display text-xl font-bold leading-tight text-ink">{c.venue_name}</p>}
          {c.address && <p className="font-semibold text-ink-soft">{c.address}</p>}
          {c.address_extra && <p className="text-sm font-semibold text-ink-soft">{c.address_extra}</p>}
          {mapUrl && !demo && (
            <a href={mapUrl} target="_blank" rel="noopener noreferrer nofollow" className={btn} style={{ background: gradient }}>
              <svg viewBox="0 0 24 24" className="h-4 w-4" {...ic}><path d="M5 12h14M13 6l6 6-6 6" /></svg> Como chegar
            </a>
          )}
          {mapUrl && demo && <span className={`${btn} cursor-default opacity-80`} style={{ background: gradient }}>Como chegar (exemplo)</span>}
        </GlassCard>
      )}
    </div>
  );
}
