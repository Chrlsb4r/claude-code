"use client";

import { useEffect, useState, type CSSProperties } from "react";

const COLORS = ["#d81b60", "#ffc93c", "#2f9bef", "#2dbe6c", "#7b4dff", "#ff8a3d", "#ffffff"];

type Piece = { id: number; style: CSSProperties; round: boolean };

function makePieces(n: number, seed: number): Piece[] {
  // Pseudoaleatório determinístico por disparo (evita Math.random durante a renderização).
  let s = seed;
  const rnd = () => ((s = (s * 16807) % 2147483647) - 1) / 2147483646;
  return Array.from({ length: n }, (_, i) => {
    const angle = rnd() * Math.PI * 2;
    const dist = 140 + rnd() * 260;
    return {
      id: i,
      round: rnd() < 0.35,
      style: {
        background: COLORS[i % COLORS.length],
        ["--dx" as string]: `${Math.cos(angle) * dist}px`,
        ["--dy" as string]: `${Math.sin(angle) * dist - 120}px`,
        ["--r" as string]: `${Math.round(rnd() * 720 - 360)}deg`,
        animationDelay: `${Math.round(rnd() * 120)}ms`,
        width: `${8 + rnd() * 8}px`,
        height: `${5 + rnd() * 5}px`,
      },
    };
  });
}

/** Explosão de confete a partir do centro. Muda `trigger` para disparar de novo. */
export function ConfettiBurst({ trigger, count = 70 }: { trigger: number; count?: number }) {
  const [pieces, setPieces] = useState<Piece[]>([]);

  useEffect(() => {
    if (!trigger) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const start = setTimeout(() => setPieces(makePieces(count, trigger * 7919 + 13)), 0);
    const end = setTimeout(() => setPieces([]), 2200);
    return () => {
      clearTimeout(start);
      clearTimeout(end);
    };
  }, [trigger, count]);

  if (!pieces.length) return null;
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[60] overflow-hidden">
      {pieces.map((p) => (
        <span key={p.id} className={`anim-burst absolute left-1/2 top-1/2 ${p.round ? "rounded-full" : "rounded-[2px]"}`} style={p.style} />
      ))}
    </div>
  );
}
