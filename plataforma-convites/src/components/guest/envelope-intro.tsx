"use client";

import { useEffect, useState } from "react";
import { Character, type CharacterKind } from "@/components/characters/characters";

/**
 * Abertura do convite: envelope colorido que se abre ao toque, revelando o convite
 * com confete. Com "reduzir movimento", a transição é instantânea.
 */
export function EnvelopeIntro({
  honoree,
  character,
  color,
  onOpen,
}: {
  honoree: string;
  character: CharacterKind | null;
  color: string;
  onOpen: () => void;
}) {
  const [stage, setStage] = useState<"closed" | "opening" | "gone">("closed");

  useEffect(() => {
    if (stage !== "opening") return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const t = setTimeout(() => setStage("gone"), reduce ? 0 : 1100);
    return () => clearTimeout(t);
  }, [stage]);

  if (stage === "gone") return null;
  const opening = stage === "opening";

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Você recebeu um convite"
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center gap-8 bg-[radial-gradient(circle_at_50%_30%,#fff3c4,#ffd6e5_55%,#ece4ff)] px-6 transition-opacity duration-500 ${opening ? "opacity-0 delay-700" : "opacity-100"}`}
    >
      <p className="anim-pop text-center font-display text-3xl font-bold leading-tight text-ink sm:text-4xl">
        Você recebeu um convite!
      </p>

      <div className="relative h-[220px] w-[min(320px,86vw)] [perspective:900px]">
        {/* Cartinha que sobe */}
        <div
          className={`absolute inset-x-6 top-4 z-[5] flex h-[180px] flex-col items-center justify-center rounded-md bg-white shadow-soft transition-transform duration-700 ease-premium ${opening ? "-translate-y-28" : "translate-y-0"}`}
        >
          {character && <Character kind={character} className="h-24 w-24" />}
          <span className="font-display text-xl font-bold" style={{ color }}>{honoree}</span>
        </div>
        {/* Corpo do envelope */}
        <div className="absolute inset-x-0 bottom-0 z-10 h-[150px] overflow-hidden rounded-b-lg rounded-t-sm border-2 border-ink" style={{ background: color }}>
          <svg viewBox="0 0 320 150" preserveAspectRatio="none" className="absolute inset-0 h-full w-full" aria-hidden>
            <path d="M0 0 L160 90 L320 0 V150 H0Z" fill="rgba(255,255,255,0.18)" />
            <path d="M0 150 L130 70 M320 150 L190 70" stroke="rgba(42,26,74,0.35)" strokeWidth="2" />
          </svg>
          <span className="absolute bottom-3 left-1/2 grid h-12 w-12 -translate-x-1/2 place-items-center rounded-full border-2 border-ink bg-yellow font-display text-lg font-bold text-ink">
            {honoree.slice(0, 1).toUpperCase()}
          </span>
        </div>
        {/* Aba que vira */}
        <div
          className={`absolute inset-x-0 top-[70px] h-[90px] origin-top transition-transform duration-500 ease-premium [transform-style:preserve-3d] ${opening ? "z-0 [transform:rotateX(180deg)]" : "z-20"}`}
          aria-hidden
        >
          <svg viewBox="0 0 320 90" preserveAspectRatio="none" className="h-full w-full drop-shadow-[0_3px_0_rgba(42,26,74,0.25)]">
            <path d="M2 2 L160 88 L318 2 Z" fill={color} stroke="#2a1a4a" strokeWidth="3" strokeLinejoin="round" />
            <path d="M2 2 L160 88 L318 2 Z" fill="rgba(0,0,0,0.08)" />
          </svg>
        </div>
      </div>

      <button
        type="button"
        autoFocus
        onClick={() => {
          setStage("opening");
          onOpen();
        }}
        disabled={opening}
        className="anim-pop inline-flex h-14 items-center gap-2 rounded-full bg-brand px-8 font-display text-lg font-bold text-white shadow-[0_5px_0_var(--brand-dark)] transition-transform hover:-translate-y-0.5 active:translate-y-1 active:shadow-[0_1px_0_var(--brand-dark)]"
      >
        Abrir convite
      </button>
    </div>
  );
}
