import { useId, type CSSProperties, type ReactNode } from "react";
import { resolveVariant } from "./variants";

/** Conteúdo exibível do convite (chaves definidas pelos template_fields). Sempre texto puro. */
export type InvitationContent = Partial<Record<
  | "honoree_name" | "title" | "age" | "event_date" | "event_time" | "timezone" | "venue_name" | "address"
  | "address_extra" | "map_url" | "message" | "rsvp_deadline" | "extra_info" | "palette" | "font",
  string
>>;

function formatLocalDate(date?: string) {
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) return null;
  const [y, m, d] = date.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d, 12));
  if (dt.getUTCDate() !== d) return null;
  const txt = new Intl.DateTimeFormat("pt-BR", { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(dt);
  return txt.charAt(0).toUpperCase() + txt.slice(1);
}
function formatTime(time?: string) {
  if (!time || !/^\d{2}:\d{2}$/.test(time)) return null;
  const [h, m] = time.split(":");
  return m === "00" ? `${Number(h)}h` : `${Number(h)}h${m}`;
}
function safeHttps(url?: string) {
  if (!url) return null;
  try {
    const u = new URL(url);
    return u.protocol === "https:" ? u.toString() : null;
  } catch {
    return null;
  }
}

type Props = {
  content: InvitationContent;
  variant?: string;
  /** Prévia antes do pagamento: marca d'água e links desativados. */
  preview?: boolean;
  /** Demonstrações e capas: sem marca d'água, mas sem links clicáveis. */
  inert?: boolean;
  /** Área extra no rodapé (ex.: formulário de RSVP na página pública). */
  footer?: ReactNode;
  className?: string;
  /** Rótulo acessível (capas do catálogo usam "Prévia do modelo X"). */
  label?: string;
};

/**
 * Renderizador único do convite. Escala pelo container (unidades cqw), então a
 * mesma composição serve para capa do catálogo, demonstração, prévia do editor e página pública.
 */
export function InvitationView({ content: c, variant, preview, inert, footer, className, label }: Props) {
  const patternId = `marca-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const v = resolveVariant(variant, c.palette);
  const serif = c.font === "inter" ? "var(--font-body)" : "var(--font-display)";
  const date = formatLocalDate(c.event_date);
  const time = formatTime(c.event_time);
  const map = safeHttps(c.map_url);
  const linksOff = preview || inert;
  const style = { "--inv-accent": v.accent, background: v.bg, color: v.ink } as CSSProperties;

  return (
    <article aria-label={label} className={`@container relative overflow-hidden ${className ?? ""}`} style={style}>
      <div className="flex min-h-full flex-col items-center px-[9cqw] py-[12cqw] text-center">
        <div className="flex w-full justify-center">{v.ornament(v.accent)}</div>

        <p className="mt-[7cqw] text-[3.2cqw] uppercase tracking-[0.32em]" style={{ color: v.accentText }}>
          {c.title || "Você está convidado"}
        </p>
        <h2 className="mt-[4cqw] text-[13cqw] leading-[1.02] text-balance" style={{ fontFamily: serif, fontWeight: 500 }}>
          {c.honoree_name || "Seu nome aqui"}
        </h2>
        {c.age && (
          <p className="mt-[2cqw] text-[5cqw]" style={{ fontFamily: serif, color: v.muted }}>
            {c.age} {c.age === "1" ? "ano" : "anos"}
          </p>
        )}

        <span aria-hidden className="my-[7cqw] h-px w-[16cqw]" style={{ background: v.rule }} />

        {(date || time) && (
          <p className="text-[4.4cqw] leading-snug">
            {date && <span className="block">{date}</span>}
            {time && <span className="mt-[1cqw] block text-[6cqw]" style={{ fontFamily: serif }}>{time}</span>}
          </p>
        )}

        {(c.venue_name || c.address) && (
          <div className="mt-[6cqw] text-[3.8cqw] leading-relaxed" style={{ color: v.muted }}>
            {c.venue_name && <p className="text-[4.4cqw]" style={{ color: v.ink }}>{c.venue_name}</p>}
            {c.address && <p>{c.address}</p>}
            {c.address_extra && <p>{c.address_extra}</p>}
            {map && linksOff && (
              <span className="mt-[2cqw] inline-block underline underline-offset-4" style={{ color: v.accentText }}>Ver no mapa</span>
            )}
            {map && !linksOff && (
              <a href={map} target="_blank" rel="noopener noreferrer nofollow" className="mt-[2cqw] inline-block underline underline-offset-4" style={{ color: v.accentText }}>
                Ver no mapa
              </a>
            )}
          </div>
        )}

        {c.message && (
          <p className="mt-[8cqw] max-w-[80cqw] whitespace-pre-line text-[4cqw] italic leading-relaxed" style={{ fontFamily: serif }}>
            {c.message}
          </p>
        )}
        {c.extra_info && (
          <p className="mt-[5cqw] max-w-[80cqw] whitespace-pre-line text-[3.4cqw] leading-relaxed" style={{ color: v.muted }}>
            {c.extra_info}
          </p>
        )}
        {footer && <div className="mt-[8cqw] w-full">{footer}</div>}
      </div>

      {preview && (
        <svg aria-hidden className="pointer-events-none absolute inset-0 h-full w-full" style={{ opacity: 0.09 }}>
          <defs>
            <pattern id={patternId} width="220" height="120" patternUnits="userSpaceOnUse" patternTransform="rotate(-30)">
              <text x="0" y="60" fill={v.ink} fontSize="26" fontWeight="600" letterSpacing="8">PRÉVIA</text>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill={`url(#${patternId})`} />
        </svg>
      )}
    </article>
  );
}
