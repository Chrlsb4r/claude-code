import type { ReactNode } from "react";

/**
 * Variantes visuais dos convites. Cada uma define cores e um ornamento em SVG.
 * O conteúdo do cliente nunca altera estrutura nem estilos fora destas opções.
 */
export type VariantKey = "botanico" | "editorial" | "celeste" | "confete" | "gala" | "minimal";
export type PaletteKey = "champagne" | "salvia" | "rose";

type Variant = {
  bg: string;
  surface: string;
  ink: string;
  muted: string;
  accent: string;
  /** Versão do acento para TEXTO (contraste AA ≥ 4,5:1 sobre bg). */
  accentText: string;
  rule: string;
  ornament: (accent: string) => ReactNode;
};

const sprig = (c: string, flip = false) => (
  <g transform={flip ? "scale(-1 1) translate(-200 0)" : undefined} fill="none" stroke={c} strokeWidth="1.4" strokeLinecap="round">
    <path d="M10 70 C 50 60, 80 40, 110 12" />
    {[22, 40, 58, 76, 94].map((x, i) => (
      <g key={x}>
        <path d={`M${x} ${66 - i * 11} q 8 -14 22 -12 q -6 12 -22 12z`} fill={c} fillOpacity=".18" />
        <path d={`M${x + 2} ${70 - i * 11} q -4 14 10 20 q 2 -12 -10 -20z`} fill={c} fillOpacity=".12" />
      </g>
    ))}
  </g>
);

export const VARIANTS: Record<VariantKey, Variant> = {
  botanico: {
    bg: "#f6f3ec", surface: "#fffdf8", ink: "#2c3a2e", muted: "#5f6b5e", accent: "#7d9178", accentText: "#4d6249", rule: "#c9d2c2",
    ornament: (c) => (
      <svg viewBox="0 0 200 80" aria-hidden className="w-[56%]">
        {sprig(c)}
        {sprig(c, true)}
      </svg>
    ),
  },
  editorial: {
    bg: "#f8f6f2", surface: "#fffefb", ink: "#252525", muted: "#5c5a56", accent: "#9a8160", accentText: "#74603f", rule: "#d6c4a8",
    ornament: (c) => (
      <svg viewBox="0 0 200 24" aria-hidden className="w-[46%]">
        <path d="M0 12 H80 M120 12 H200" stroke={c} strokeWidth="1" />
        <path d="M100 2 L110 12 L100 22 L90 12 Z" fill="none" stroke={c} strokeWidth="1.2" />
        <circle cx="100" cy="12" r="2" fill={c} />
      </svg>
    ),
  },
  celeste: {
    bg: "#eef3f4", surface: "#fbfdfd", ink: "#3c4a57", muted: "#56636f", accent: "#8fb3c9", accentText: "#46677d", rule: "#cfdfe6",
    ornament: (c) => (
      <svg viewBox="0 0 200 90" aria-hidden className="w-[44%]">
        <path d="M118 12 a34 34 0 1 0 28 56 a28 28 0 1 1 -28 -56z" fill={c} fillOpacity=".55" />
        {[[52, 22, 4], [70, 58, 3], [160, 24, 3.5], [40, 64, 2.5], [176, 70, 2.5]].map(([x, y, r]) => (
          <path key={`${x}-${y}`} d={`M${x} ${y - r * 2} L${x + r * .6} ${y - r * .6} L${x + r * 2} ${y} L${x + r * .6} ${y + r * .6} L${x} ${y + r * 2} L${x - r * .6} ${y + r * .6} L${x - r * 2} ${y} L${x - r * .6} ${y - r * .6}Z`} fill="#e9c98a" />
        ))}
      </svg>
    ),
  },
  confete: {
    bg: "#1f1a33", surface: "#2a2346", ink: "#fbf7ff", muted: "#c9c0dd", accent: "#ffd46b", accentText: "#ffd46b", rule: "#4a4170",
    ornament: () => (
      <svg viewBox="0 0 200 70" aria-hidden className="w-[60%]">
        {Array.from({ length: 26 }, (_, i) => {
          const x = (i * 37) % 196;
          const y = (i * 23) % 64;
          const fill = ["#ff6fae", "#5bb8ff", "#ffd46b", "#8de0c6", "#ffffff"][i % 5];
          return i % 3 === 0 ? (
            <circle key={i} cx={x + 2} cy={y + 3} r="2.6" fill={fill} />
          ) : (
            <rect key={i} x={x} y={y} width="8" height="3.4" rx="1.4" fill={fill} transform={`rotate(${(i * 47) % 180} ${x} ${y})`} />
          );
        })}
      </svg>
    ),
  },
  gala: {
    bg: "#141619", surface: "#1c1f24", ink: "#f4efe6", muted: "#b8b0a3", accent: "#d6c4a8", accentText: "#d6c4a8", rule: "#3a3a36",
    ornament: (c) => (
      <svg viewBox="0 0 200 40" aria-hidden className="w-[50%]">
        <path d="M10 20 H70 M130 20 H190" stroke={c} strokeWidth=".8" />
        <path d="M100 4 C 108 14, 116 18, 126 20 C 116 22, 108 26, 100 36 C 92 26, 84 22, 74 20 C 84 18, 92 14, 100 4Z" fill="none" stroke={c} strokeWidth="1" />
        <circle cx="100" cy="20" r="2.5" fill={c} />
      </svg>
    ),
  },
  minimal: {
    bg: "#f4f4f2", surface: "#ffffff", ink: "#1f2328", muted: "#5b616b", accent: "#a6b3a2", accentText: "#4f5e4c", rule: "#dcdedb",
    ornament: (c) => (
      <svg viewBox="0 0 200 20" aria-hidden className="w-[22%]">
        <rect x="0" y="8" width="200" height="4" rx="2" fill={c} />
      </svg>
    ),
  },
};

const PALETTE_ACCENT: Record<PaletteKey, { deco: string; text: string }> = {
  champagne: { deco: "#9a8160", text: "#74603f" },
  salvia: { deco: "#6f8569", text: "#4d6249" },
  rose: { deco: "#b07c7c", text: "#8a5555" },
};

export function resolveVariant(variant?: string, palette?: string) {
  const v = VARIANTS[(variant as VariantKey) in VARIANTS ? (variant as VariantKey) : "editorial"];
  const dark = v.bg.startsWith("#1");
  const p = !dark && palette && palette in PALETTE_ACCENT ? PALETTE_ACCENT[palette as PaletteKey] : null;
  return { ...v, accent: p?.deco ?? v.accent, accentText: p?.text ?? v.accentText };
}
