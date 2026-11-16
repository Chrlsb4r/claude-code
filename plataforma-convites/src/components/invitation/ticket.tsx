import { useId, type ReactNode } from "react";
import { Character, type CharacterKind } from "@/components/characters/characters";

/**
 * Tema "Cartão de Embarque": céu de fim de tarde, avião voando numa rota tracejada,
 * malas ilustradas com adesivos e um bilhete com picote, carimbo, faixa holográfica e código de barras.
 * Todo o texto vem do conteúdo do cliente (texto puro); a estrutura é fixa.
 */

const INK = "#2a1a4a";

export const TICKET_ACCENTS: Record<string, { main: string; soft: string }> = {
  rosa: { main: "#d61f63", soft: "#ffe1ec" },
  azul: { main: "#1769b3", soft: "#dff1ff" },
  roxo: { main: "#5a2fd6", soft: "#ece4ff" },
  verde: { main: "#16774a", soft: "#d9f7e6" },
  laranja: { main: "#b8430b", soft: "#ffe6d5" },
};

function Suitcases() {
  return (
    <svg viewBox="0 0 240 190" className="w-full" aria-hidden overflow="visible">
      <defs>
        <linearGradient id="tk-big" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#13a89e" />
          <stop offset=".55" stopColor="#1fc4b8" />
          <stop offset="1" stopColor="#0e7f77" />
        </linearGradient>
        <linearGradient id="tk-small" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#ff7a59" />
          <stop offset=".55" stopColor="#ff9b6a" />
          <stop offset="1" stopColor="#e2553a" />
        </linearGradient>
        <linearGradient id="tk-bag" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffd25c" />
          <stop offset="1" stopColor="#f2a921" />
        </linearGradient>
      </defs>
      <ellipse cx="120" cy="182" rx="108" ry="8" fill={INK} opacity=".18" />

      {/* Mala grande */}
      <g className="anim-bob" style={{ transformBox: "fill-box", transformOrigin: "bottom center", animationDuration: "3.2s" }}>
        <path d="M66 30 V18 Q66 10 74 10 H98 Q106 10 106 18 V30" fill="none" stroke={INK} strokeWidth="6" strokeLinecap="round" />
        <rect x="36" y="30" width="100" height="140" rx="16" fill="url(#tk-big)" stroke={INK} strokeWidth="3.5" />
        {[58, 86, 114].map((x) => <path key={x} d={`M${x} 38 V162`} stroke="#0b6a63" strokeWidth="3" opacity=".55" />)}
        <rect x="40" y="36" width="10" height="124" rx="5" fill="#fff" opacity=".22" />
        <circle cx="56" cy="178" r="7" fill={INK} /><circle cx="116" cy="178" r="7" fill={INK} />
        {/* adesivos */}
        <g transform="rotate(-14 70 78)">
          <circle cx="70" cy="78" r="17" fill="#ffd25c" stroke={INK} strokeWidth="2.5" />
          <path d="M70 66 L73.5 74 L82 74.5 L75.5 80 L77.5 88.5 L70 84 L62.5 88.5 L64.5 80 L58 74.5 L66.5 74 Z" fill="#e5266e" />
        </g>
        <g transform="rotate(10 108 124)">
          <rect x="88" y="112" width="40" height="24" rx="6" fill="#fff" stroke={INK} strokeWidth="2.5" />
          <path d="M96 124 h24" stroke="#5a2fd6" strokeWidth="4" strokeLinecap="round" />
          <circle cx="94" cy="118" r="2.5" fill="#e5266e" />
        </g>
        <g transform="rotate(-8 96 60)">
          <path d="M96 48 C 88 40 78 48 86 58 L96 66 L106 58 C 114 48 104 40 96 48 Z" fill="#ff5c8a" stroke={INK} strokeWidth="2.5" />
        </g>
      </g>

      {/* Mala de mão */}
      <g className="anim-bob" style={{ transformBox: "fill-box", transformOrigin: "bottom center", animationDelay: ".5s", animationDuration: "2.8s" }}>
        <path d="M160 82 V40 M186 82 V40 M160 40 H186" stroke="#9aa3b5" strokeWidth="5" strokeLinecap="round" fill="none" />
        <rect x="146" y="80" width="56" height="90" rx="12" fill="url(#tk-small)" stroke={INK} strokeWidth="3.5" />
        <path d="M146 112 H202 M146 140 H202" stroke="#c4432b" strokeWidth="3" opacity=".6" />
        <rect x="150" y="86" width="7" height="78" rx="3.5" fill="#fff" opacity=".25" />
        <circle cx="158" cy="178" r="6" fill={INK} /><circle cx="190" cy="178" r="6" fill={INK} />
        <circle cx="186" cy="98" r="8" fill="#2f9bef" stroke={INK} strokeWidth="2" />
      </g>

      {/* Bolsa */}
      <g className="anim-bob" style={{ transformBox: "fill-box", transformOrigin: "bottom center", animationDelay: "1s" }}>
        <path d="M14 132 Q22 104 34 132" fill="none" stroke={INK} strokeWidth="4" />
        <rect x="4" y="130" width="40" height="44" rx="10" fill="url(#tk-bag)" stroke={INK} strokeWidth="3" />
        <path d="M4 146 H44" stroke="#c98100" strokeWidth="2.5" />
      </g>
    </svg>
  );
}

function SkyScene() {
  return (
    <svg viewBox="0 0 200 150" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 h-full w-full" aria-hidden>
      <defs>
        <linearGradient id="tk-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#3b2a8a" />
          <stop offset=".45" stopColor="#c2489b" />
          <stop offset=".8" stopColor="#ff9a6b" />
          <stop offset="1" stopColor="#ffd38a" />
        </linearGradient>
        <radialGradient id="tk-sun" cx="50%" cy="50%" r="50%">
          <stop offset="0" stopColor="#fff6c9" />
          <stop offset=".4" stopColor="#ffd25c" stopOpacity=".9" />
          <stop offset="1" stopColor="#ffd25c" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="200" height="150" fill="url(#tk-sky)" />
      {[[14, 12], [40, 26], [74, 8], [120, 18], [160, 10], [186, 30], [96, 34]].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="0.9" fill="#fff" className="anim-twinkle" style={{ animationDelay: `${i * 0.4}s` }} />
      ))}
      <circle cx="150" cy="104" r="40" fill="url(#tk-sun)" />
      <circle cx="150" cy="104" r="14" fill="#fff1b8" />
      <g fill="#fff" opacity=".85">
        <g className="anim-drift"><ellipse cx="34" cy="70" rx="22" ry="6" /><ellipse cx="44" cy="66" rx="12" ry="6" /></g>
        <g className="anim-drift" style={{ animationDelay: "-4s" }}><ellipse cx="150" cy="56" rx="26" ry="6" /><ellipse cx="140" cy="52" rx="12" ry="6" /></g>
        <g className="anim-drift" style={{ animationDelay: "-2s", opacity: 0.6 }}><ellipse cx="92" cy="96" rx="30" ry="5" /></g>
      </g>
      {/* rota tracejada */}
      <path d="M-10 120 C 50 40, 130 30, 214 70" fill="none" stroke="#fff" strokeWidth="1" strokeDasharray="3 3" opacity=".7" />
    </svg>
  );
}

function Plane() {
  // Trajetória em unidades do container (cqw): escala junto com o convite.
  return (
    <svg viewBox="-14 -10 28 20" className="anim-fly pointer-events-none absolute left-0 top-0 h-[6cqw] w-[8cqw]" aria-hidden>
      <path d="M-13 -1.5 L9 -1.8 Q14 0 9 1.8 L-13 1.5 Z" fill="#fff" />
      <path d="M4 -1 L-3 -10 L-6.5 -10 L-2 -1 Z M4 1 L-3 10 L-6.5 10 L-2 1 Z M-8 -1 L-12 -6 L-14 -6 L-12 0 Z" fill="#fff" />
    </svg>
  );
}

function Barcode({ seed }: { seed: string }) {
  let h = 7;
  for (const ch of seed) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  const bars: number[] = [];
  for (let i = 0; i < 46; i++) {
    h = (h * 1103515245 + 12345) >>> 0;
    bars.push(1 + (h % 3));
  }
  let x = 0;
  return (
    <svg viewBox="0 0 140 30" preserveAspectRatio="none" className="h-[9cqw] w-full" aria-hidden>
      {bars.map((w, i) => {
        const r = i % 2 === 0 ? <rect key={i} x={x} y="0" width={w} height="30" fill={INK} /> : null;
        x += w + (i % 2 === 0 ? 0 : 1);
        return r;
      })}
    </svg>
  );
}

function Stamp({ color }: { color: string }) {
  const arc = `arc-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
  return (
    <svg viewBox="0 0 100 100" className="absolute -right-[2cqw] top-[3cqw] w-[24cqw] rotate-[-16deg] opacity-80" aria-hidden>
      <circle cx="50" cy="50" r="44" fill="none" stroke={color} strokeWidth="3" />
      <circle cx="50" cy="50" r="36" fill="none" stroke={color} strokeWidth="1.5" strokeDasharray="3 3" />
      <path id={arc} d="M18 50 A32 32 0 0 1 82 50" fill="none" />
      <text fill={color} fontSize="11" fontWeight="800" letterSpacing="2">
        <textPath href={`#${arc}`} startOffset="50%" textAnchor="middle">CONVIDADO</textPath>
      </text>
      <text x="50" y="60" textAnchor="middle" fill={color} fontSize="18" fontWeight="900" letterSpacing="2">VIP</text>
      <path d="M30 70 L70 70" stroke={color} strokeWidth="2" />
    </svg>
  );
}

function Field({ label, value, wide }: { label: string; value: ReactNode; wide?: boolean }) {
  return (
    <div className={wide ? "col-span-2" : undefined}>
      <p className="text-[2.6cqw] font-extrabold uppercase tracking-[0.18em] text-[#6b5f86]">{label}</p>
      <p className="mt-[0.6cqw] font-display text-[4.6cqw] font-bold leading-tight text-[#2a1a4a]">{value}</p>
    </div>
  );
}

export function TicketBody({
  honoree,
  title,
  age,
  date,
  time,
  venue,
  address,
  extraAddress,
  message,
  extra,
  palette,
  character,
  mapSlot,
  footer,
}: {
  honoree: string;
  title: string;
  age?: string;
  date: string | null;
  time: string | null;
  venue?: string;
  address?: string;
  extraAddress?: string;
  message?: string;
  extra?: string;
  palette?: string;
  character?: CharacterKind | null;
  mapSlot?: ReactNode;
  footer?: ReactNode;
}) {
  const accent = TICKET_ACCENTS[palette ?? ""] ?? TICKET_ACCENTS.roxo;
  const firstName = honoree.split(/\s|&/)[0] || honoree;
  const code = (s: string) => s.normalize("NFD").replace(/[^A-Za-z]/g, "").slice(0, 3).toUpperCase() || "FST";

  return (
    <>
      <div className="relative h-[86cqw] overflow-hidden">
        <SkyScene />
        <Plane />
        <div className="absolute inset-x-[6cqw] bottom-[2cqw] flex items-end justify-center gap-[2cqw]">
          {character && <Character kind={character} hat className="mb-[1cqw] w-[30cqw] shrink-0" />}
          <div className={character ? "w-[52cqw]" : "w-[70cqw]"}><Suitcases /></div>
        </div>
      </div>

      {/* Bilhete */}
      <div className="relative z-10 mx-[5cqw] -mt-[8cqw] mb-[7cqw] drop-shadow-[0_2.5cqw_2cqw_rgba(42,26,74,0.28)]">
        <div className="relative overflow-hidden rounded-t-[5cqw] bg-white">
          <div className="flex items-center justify-between px-[6cqw] py-[3cqw] text-white" style={{ background: accent.main }}>
            <span className="text-[3cqw] font-extrabold uppercase tracking-[0.22em]">Cartão de embarque</span>
            <svg viewBox="-14 -10 28 20" className="h-[5cqw] w-[7cqw]" aria-hidden>
              <path d="M-13 -1.5 L9 -1.8 Q14 0 9 1.8 L-13 1.5 Z M4 -1 L-3 -10 L-6.5 -10 L-2 -1 Z M4 1 L-3 10 L-6.5 10 L-2 1 Z M-8 -1 L-12 -6 L-14 -6 L-12 0 Z" fill="#fff" />
            </svg>
          </div>

          <div className="relative px-[6cqw] pb-[5cqw] pt-[5cqw]">
            <Stamp color={accent.main} />
            <p className="text-[3cqw] font-extrabold uppercase tracking-[0.2em]" style={{ color: accent.main }}>{title}</p>
            <h2 className="mt-[1.5cqw] max-w-[66cqw] font-display text-[10.5cqw] font-bold leading-[1.02] text-balance text-[#2a1a4a]">{honoree}</h2>
            {age && (
              <p className="mt-[2cqw] inline-flex items-baseline gap-[1.4cqw] rounded-full px-[3.5cqw] py-[0.8cqw] font-display text-[4.4cqw] font-semibold text-[#2a1a4a]" style={{ background: accent.soft }}>
                <span className="text-[7cqw] leading-none">{age}</span> {age === "1" ? "aninho" : "anos"}
              </p>
            )}

            <div className="mt-[5cqw] flex items-center justify-between gap-[3cqw]">
              <div>
                <p className="font-display text-[9cqw] font-bold leading-none text-[#2a1a4a]">VOC</p>
                <p className="text-[2.8cqw] font-bold uppercase tracking-wider text-[#6b5f86]">Você</p>
              </div>
              <div className="relative flex-1">
                <div className="h-0 border-t-[0.5cqw] border-dashed" style={{ borderColor: accent.main }} />
                <svg viewBox="-14 -10 28 20" className="absolute left-1/2 top-1/2 h-[6cqw] w-[8cqw] -translate-x-1/2 -translate-y-1/2" aria-hidden>
                  <path d="M-13 -1.5 L9 -1.8 Q14 0 9 1.8 L-13 1.5 Z M4 -1 L-3 -10 L-6.5 -10 L-2 -1 Z M4 1 L-3 10 L-6.5 10 L-2 1 Z M-8 -1 L-12 -6 L-14 -6 L-12 0 Z" fill={accent.main} />
                </svg>
              </div>
              <div className="text-right">
                <p className="font-display text-[9cqw] font-bold leading-none text-[#2a1a4a]">{code(firstName)}</p>
                <p className="max-w-[24cqw] truncate text-[2.8cqw] font-bold uppercase tracking-wider text-[#6b5f86]">Festa</p>
              </div>
            </div>

            <div className="mt-[5cqw] grid grid-cols-2 gap-x-[4cqw] gap-y-[3.5cqw]">
              {date && <Field label="Data" value={date} wide />}
              {time && <Field label="Embarque" value={time} />}
              <Field label="Assento" value="VIP" />
              {venue && <Field label="Portão" value={venue} wide />}
              {(address || extraAddress) && (
                <Field label="Destino" value={<span className="font-sans text-[3.8cqw] font-semibold text-[#5a4c78]">{[address, extraAddress].filter(Boolean).join(" · ")}</span>} wide />
              )}
            </div>
            {mapSlot && <div className="mt-[3cqw]">{mapSlot}</div>}
            {message && <p className="mt-[5cqw] whitespace-pre-line rounded-[3cqw] px-[4cqw] py-[3cqw] text-[4cqw] font-semibold leading-relaxed text-[#2a1a4a]" style={{ background: accent.soft }}>{message}</p>}
            {extra && <p className="mt-[3cqw] whitespace-pre-line text-[3.4cqw] leading-relaxed text-[#5a4c78]">{extra}</p>}
            {footer && <div className="mt-[6cqw]">{footer}</div>}
          </div>
        </div>

        {/* Picote */}
        <div className="relative h-[6cqw] bg-white">
          <div className="absolute inset-x-[5cqw] top-1/2 border-t-[0.5cqw] border-dashed border-[#d9d2e6]" />
          <span className="absolute -left-[3cqw] top-0 h-[6cqw] w-[6cqw] rounded-full" style={{ background: "var(--ticket-base)" }} />
          <span className="absolute -right-[3cqw] top-0 h-[6cqw] w-[6cqw] rounded-full" style={{ background: "var(--ticket-base)" }} />
        </div>

        {/* Canhoto */}
        <div className="rounded-b-[5cqw] bg-white px-[6cqw] pb-[5cqw] pt-[2cqw]">
          <div className="anim-holo mb-[3cqw] h-[2.2cqw] rounded-full bg-[linear-gradient(90deg,#ff9ad5,#9ad8ff,#b7ffd8,#fff59a,#ffb4e1,#9ad8ff,#ff9ad5)]" aria-hidden />
          <div className="flex items-end gap-[4cqw]">
            <div className="flex-1"><Barcode seed={honoree + (date ?? "")} /></div>
            <div className="text-right">
              <p className="text-[2.6cqw] font-extrabold uppercase tracking-[0.18em] text-[#6b5f86]">Passageiro</p>
              <p className="font-display text-[4.2cqw] font-bold text-[#2a1a4a]">Você + amigos</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
