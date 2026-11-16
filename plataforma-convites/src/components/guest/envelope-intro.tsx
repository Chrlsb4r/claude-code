"use client";

import { useEffect, useState } from "react";
import { Character, type CharacterKind } from "@/components/characters/characters";

/**
 * Abertura premium: envelope com forro estampado, selo de cera dourado com brilho
 * passando, raios de luz girando ao fundo. Tocar no selo ou no botão abre o convite.
 */
export function EnvelopeIntro({
  honoree,
  character,
  color,
  colorDark,
  onOpen,
}: {
  honoree: string;
  character: CharacterKind | null;
  color: string;
  colorDark: string;
  onOpen: () => void;
}) {
  const [stage, setStage] = useState<"closed" | "opening" | "gone">("closed");

  useEffect(() => {
    if (stage !== "opening") return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const t = setTimeout(() => setStage("gone"), reduce ? 0 : 1500);
    return () => clearTimeout(t);
  }, [stage]);

  if (stage === "gone") return null;
  const opening = stage === "opening";
  const open = () => {
    if (opening) return;
    setStage("opening");
    onOpen();
  };
  const initial = honoree.trim().charAt(0).toUpperCase() || "♥";

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Você recebeu um convite"
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center gap-10 overflow-hidden px-6 transition-opacity duration-700 ${opening ? "opacity-0 delay-[800ms]" : "opacity-100"}`}
      style={{ background: `radial-gradient(circle at 50% 42%, #fffaf0 0%, ${color}33 45%, ${colorDark} 140%), #fff8ee` }}
    >
      {/* Raios de luz */}
      <div aria-hidden className="absolute left-1/2 top-[44%] h-[160vmax] w-[160vmax] -translate-x-1/2 -translate-y-1/2 animate-[spin_40s_linear_infinite] opacity-40 [background:repeating-conic-gradient(from_0deg,#fff_0deg_6deg,transparent_6deg_18deg)] [mask-image:radial-gradient(circle,black_0%,transparent_55%)]" />

      <div className="anim-rise-in relative text-center">
        <p className="text-sm font-extrabold uppercase tracking-[0.35em]" style={{ color: colorDark }}>Especial para você</p>
        <p className="mt-2 font-display text-4xl font-bold leading-tight text-ink sm:text-5xl">Você recebeu<br />um convite!</p>
      </div>

      <div className="anim-rise-in relative h-[230px] w-[min(340px,88vw)] [animation-delay:150ms] [perspective:1000px]">
        {/* Cartão que sobe */}
        <div className={`absolute inset-x-5 top-6 z-[5] flex h-[190px] flex-col items-center justify-center gap-1 rounded-lg bg-white shadow-[0_10px_30px_rgba(42,26,74,0.25)] transition-transform duration-[900ms] ease-premium ${opening ? "-translate-y-36 scale-105" : ""}`}>
          {character ? <Character kind={character} className="h-24 w-24" /> : <span className="font-display text-5xl" style={{ color }}>✦</span>}
          <span className="font-display text-xl font-bold" style={{ color: colorDark }}>{honoree}</span>
        </div>

        {/* Corpo */}
        <div className="absolute inset-x-0 bottom-0 z-10 h-[160px] overflow-hidden rounded-b-xl rounded-t-sm shadow-[0_18px_40px_-12px_rgba(42,26,74,0.55)]" style={{ background: `linear-gradient(160deg, ${color}, ${colorDark})` }}>
          <svg viewBox="0 0 340 160" preserveAspectRatio="none" className="absolute inset-0 h-full w-full" aria-hidden>
            <path d="M0 0 L170 96 L340 0 V160 H0Z" fill="rgba(255,255,255,0.14)" />
            <path d="M0 160 L140 76 M340 160 L200 76" stroke="rgba(0,0,0,0.18)" strokeWidth="2" />
          </svg>
          <div className="absolute inset-0 bg-[linear-gradient(115deg,transparent_30%,rgba(255,255,255,0.25)_45%,transparent_60%)]" />
        </div>

        {/* Aba com forro */}
        <div className={`absolute inset-x-0 top-[70px] z-20 h-[100px] origin-top transition-transform duration-700 ease-premium [transform-style:preserve-3d] ${opening ? "!z-0 [transform:rotateX(180deg)]" : ""}`} aria-hidden>
          <svg viewBox="0 0 340 100" preserveAspectRatio="none" className="h-full w-full drop-shadow-[0_6px_6px_rgba(42,26,74,0.25)]">
            <defs>
              <pattern id="forro" width="14" height="14" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                <rect width="14" height="14" fill={color} />
                <rect width="5" height="14" fill="rgba(255,255,255,0.22)" />
              </pattern>
              <linearGradient id="aba" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor={color} />
                <stop offset="1" stopColor={colorDark} />
              </linearGradient>
            </defs>
            <path d="M0 0 L170 98 L340 0 Z" fill="url(#aba)" />
            <path d="M18 0 L170 86 L322 0 Z" fill="url(#forro)" opacity=".55" />
          </svg>
        </div>

        {/* Selo de cera dourado */}
        <button
          type="button"
          onClick={open}
          aria-label="Abrir convite pelo selo"
          className={`absolute left-1/2 top-[134px] z-30 h-20 w-20 -translate-x-1/2 -translate-y-1/2 rounded-full transition-[transform,opacity] duration-500 ${opening ? "scale-150 opacity-0" : "hover:scale-105"}`}
        >
          <span className="anim-ring absolute inset-0 rounded-full border-4 border-[#ffd76a]" aria-hidden />
          <svg viewBox="0 0 100 100" className="relative h-full w-full drop-shadow-[0_4px_6px_rgba(0,0,0,0.35)]" aria-hidden>
            <defs>
              <radialGradient id="ouro" cx="35%" cy="30%" r="75%">
                <stop offset="0" stopColor="#fff2b0" />
                <stop offset=".45" stopColor="#e2b23f" />
                <stop offset="1" stopColor="#8a5a12" />
              </radialGradient>
            </defs>
            {Array.from({ length: 16 }, (_, i) => {
              const a = (i / 16) * Math.PI * 2;
              return <circle key={i} cx={50 + Math.cos(a) * 40} cy={50 + Math.sin(a) * 40} r="9" fill="url(#ouro)" />;
            })}
            <circle cx="50" cy="50" r="40" fill="url(#ouro)" />
            <circle cx="50" cy="50" r="30" fill="none" stroke="#8a5a12" strokeWidth="2" opacity=".6" />
            <text x="50" y="62" textAnchor="middle" fontSize="34" fontWeight="700" fill="#7a4d0c" fontFamily="var(--font-fredoka)">{initial}</text>
          </svg>
          <span className="absolute inset-0 overflow-hidden rounded-full" aria-hidden>
            <span className="anim-sweep absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-transparent via-white/80 to-transparent" />
          </span>
        </button>
      </div>

      <div className="relative flex flex-col items-center gap-3">
        <button
          type="button"
          autoFocus
          onClick={open}
          disabled={opening}
          className="relative inline-flex h-14 items-center gap-2 overflow-hidden rounded-full px-9 font-display text-lg font-bold text-white shadow-[0_6px_0_rgba(42,26,74,0.85)] transition-transform hover:-translate-y-0.5 active:translate-y-1"
          style={{ background: `linear-gradient(135deg, ${color}, ${colorDark})` }}
        >
          <span className="anim-sweep absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-transparent via-white/40 to-transparent" aria-hidden />
          <span className="relative">Abrir convite</span>
        </button>
        <p className="anim-hint text-xs font-bold text-ink-soft">Toque no selo ou no botão</p>
      </div>
    </div>
  );
}
