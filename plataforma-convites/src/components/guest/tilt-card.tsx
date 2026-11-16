"use client";

import { useRef, type ReactNode } from "react";

/**
 * Inclina o convite em 3D seguindo o dedo/mouse, com um reflexo de luz.
 * Desligado com "reduzir movimento".
 */
export function TiltCard({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  const move = (x: number, y: number) => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const r = el.getBoundingClientRect();
    const px = (x - r.left) / r.width - 0.5;
    const py = (y - r.top) / r.height - 0.5;
    el.style.setProperty("--rx", `${(-py * 6).toFixed(2)}deg`);
    el.style.setProperty("--ry", `${(px * 8).toFixed(2)}deg`);
    el.style.setProperty("--gx", `${(px + 0.5) * 100}%`);
    el.style.setProperty("--gy", `${(py + 0.5) * 100}%`);
  };
  const reset = () => {
    const el = ref.current;
    if (!el) return;
    el.style.setProperty("--rx", "0deg");
    el.style.setProperty("--ry", "0deg");
  };

  return (
    <div className="[perspective:1200px]">
      <div
        ref={ref}
        onPointerMove={(e) => e.pointerType === "mouse" && move(e.clientX, e.clientY)}
        onPointerLeave={reset}
        className="relative overflow-hidden rounded-[32px] shadow-[0_40px_80px_-30px_rgba(42,26,74,0.6),0_0_0_1px_rgba(255,255,255,0.6)] transition-transform duration-300 ease-out [transform:rotateX(var(--rx,0deg))_rotateY(var(--ry,0deg))]"
      >
        {children}
        <div aria-hidden className="pointer-events-none absolute inset-0 z-30 opacity-60 mix-blend-soft-light [background:radial-gradient(circle_at_var(--gx,30%)_var(--gy,20%),rgba(255,255,255,0.9),transparent_45%)]" />
      </div>
    </div>
  );
}
