import { useId, type CSSProperties, type ReactNode } from "react";
import { Character, type CharacterKind } from "@/components/characters/characters";
import { Bunting, Scene, SCENE_BASE, type SceneKind } from "./scenes";
import { resolveVariant } from "./variants";

/** Conteúdo exibível do convite (chaves definidas pelos template_fields). Sempre texto puro. */
export type InvitationContent = Partial<Record<
  | "honoree_name" | "title" | "age" | "event_date" | "event_time" | "timezone" | "venue_name" | "address"
  | "address_extra" | "map_url" | "message" | "rsvp_deadline" | "extra_info" | "palette" | "font",
  string
>>;

/** Layout vem da versão do template (template_versions.layout), nunca do cliente. */
export type InvitationLayout = { variant?: string; character?: string; scene?: string };

const CHARACTERS = new Set(["urso", "dino", "coelha", "astronauta", "leao", "baleia", "baloes"]);
const SCENES = new Set(["ceu", "espaco", "selva", "mar", "festa", "doce"]);

/** Cor de destaque escolhida pelo cliente nos convites animados (texto branco ≥ 4,5:1). */
const FUN_ACCENTS: Record<string, string> = {
  rosa: "#d61f63",
  azul: "#1769b3",
  roxo: "#5a2fd6",
  verde: "#16774a",
  laranja: "#b8430b",
};

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
  layout?: InvitationLayout;
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

function Watermark({ color }: { color: string }) {
  const id = `marca-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
  return (
    <svg aria-hidden className="pointer-events-none absolute inset-0 z-20 h-full w-full" style={{ opacity: 0.1 }}>
      <defs>
        <pattern id={id} width="220" height="120" patternUnits="userSpaceOnUse" patternTransform="rotate(-30)">
          <text x="0" y="60" fill={color} fontSize="26" fontWeight="700" letterSpacing="8">PRÉVIA</text>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} />
    </svg>
  );
}

function MapLink({ url, off, color }: { url: string | null; off?: boolean; color: string }) {
  if (!url) return null;
  const cls = "mt-[2cqw] inline-block font-semibold underline underline-offset-4";
  return off ? (
    <span className={cls} style={{ color }}>Ver no mapa</span>
  ) : (
    <a href={url} target="_blank" rel="noopener noreferrer nofollow" className={cls} style={{ color }}>Ver no mapa</a>
  );
}

/**
 * Renderizador único do convite. Escala pelo container (unidades cqw), então a
 * mesma composição serve para capa do catálogo, demonstração, prévia do editor e página pública.
 */
export function InvitationView(props: Props) {
  const { layout } = props;
  if (layout?.variant === "animado") return <FunInvitation {...props} />;
  return <ClassicInvitation {...props} />;
}

/** Convite animado: cenário + personagem acenando + cartão branco com as informações. */
function FunInvitation({ content: c, layout, preview, inert, footer, className, label }: Props) {
  const scene = (SCENES.has(layout?.scene ?? "") ? layout!.scene : "festa") as SceneKind;
  const character = CHARACTERS.has(layout?.character ?? "") ? (layout!.character as CharacterKind) : null;
  const accent = FUN_ACCENTS[c.palette ?? ""] ?? FUN_ACCENTS.rosa;
  const date = formatLocalDate(c.event_date);
  const time = formatTime(c.event_time);
  const map = safeHttps(c.map_url);

  return (
    <article aria-label={label} className={`@container relative overflow-hidden ${className ?? ""}`} style={{ background: SCENE_BASE[scene] }}>
      <div className="relative h-[82cqw] overflow-hidden">
        <Scene kind={scene} />
        <Bunting />
        {character && (
          <div className="absolute inset-x-0 bottom-[4cqw] flex justify-center">
            <Character kind={character} hat={character !== "astronauta" && character !== "baleia"} className="w-[54cqw]" />
          </div>
        )}
      </div>

      <div className="relative z-10 mx-[5cqw] -mt-[10cqw] mb-[6cqw] rounded-[7cqw] bg-white px-[7cqw] pb-[8cqw] pt-[7cqw] text-center text-[#2a1a4a] shadow-[0_2cqw_0_rgba(42,26,74,0.12)]">
        <p className="mx-auto inline-block rounded-full px-[4cqw] py-[1.4cqw] text-[3.4cqw] font-bold uppercase tracking-[0.12em] text-white" style={{ background: accent }}>
          {c.title || "Você está convidado"}
        </p>
        <h2 className="mt-[4cqw] font-display text-[12cqw] font-bold leading-[1.02] text-balance" style={{ color: accent }}>
          {c.honoree_name || "Seu nome aqui"}
        </h2>
        {c.age && (
          <p className="mt-[3cqw] inline-flex items-baseline gap-[1.5cqw] rounded-full bg-[#fff3c4] px-[4cqw] py-[1cqw] font-display text-[5cqw] font-semibold">
            <span className="text-[8cqw] leading-none">{c.age}</span> {c.age === "1" ? "aninho" : "anos"}
          </p>
        )}

        {(date || time) && (
          <div className="mt-[6cqw] flex flex-col items-center gap-[2cqw]">
            {date && <p className="text-[4.2cqw] font-semibold">{date}</p>}
            {time && (
              <p className="rounded-[3cqw] border-[0.6cqw] border-dashed px-[4cqw] py-[1cqw] font-display text-[7cqw] font-semibold" style={{ borderColor: accent }}>
                {time}
              </p>
            )}
          </div>
        )}

        {(c.venue_name || c.address) && (
          <div className="mt-[6cqw] text-[3.8cqw] leading-relaxed text-[#5a4c78]">
            {c.venue_name && <p className="font-display text-[5cqw] font-semibold text-[#2a1a4a]">{c.venue_name}</p>}
            {c.address && <p>{c.address}</p>}
            {c.address_extra && <p>{c.address_extra}</p>}
            <MapLink url={map} off={preview || inert} color={accent} />
          </div>
        )}

        {c.message && <p className="mt-[6cqw] whitespace-pre-line text-[4.2cqw] font-semibold leading-relaxed">{c.message}</p>}
        {c.extra_info && <p className="mt-[4cqw] whitespace-pre-line text-[3.4cqw] leading-relaxed text-[#5a4c78]">{c.extra_info}</p>}
        {footer && <div className="mt-[7cqw] w-full text-left">{footer}</div>}
      </div>

      {preview && <Watermark color="#2a1a4a" />}
    </article>
  );
}

/** Convite clássico (casamento, 15 anos, corporativo...): tipografia serifada e ornamentos. */
function ClassicInvitation({ content: c, layout, preview, inert, footer, className, label }: Props) {
  const v = resolveVariant(layout?.variant, c.palette);
  const serif = c.font === "inter" ? "var(--font-nunito)" : "var(--font-elegant)";
  const date = formatLocalDate(c.event_date);
  const time = formatTime(c.event_time);
  const map = safeHttps(c.map_url);
  const style = { background: v.bg, color: v.ink } as CSSProperties;

  return (
    <article aria-label={label} className={`@container relative overflow-hidden ${className ?? ""}`} style={style}>
      <div className="flex min-h-full flex-col items-center px-[9cqw] py-[12cqw] text-center">
        <div className="anim-pop flex w-full justify-center">{v.ornament(v.accent)}</div>

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
            <MapLink url={map} off={preview || inert} color={v.accentText} />
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
      {preview && <Watermark color={v.ink} />}
    </article>
  );
}
