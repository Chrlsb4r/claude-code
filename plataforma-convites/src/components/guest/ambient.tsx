import type { CSSProperties } from "react";

/**
 * Fundo vivo da página do convite: manchas de luz em movimento, partículas de brilho
 * subindo e textura de granulado (dá acabamento "impresso", menos digital).
 */
export function Ambient({ colors }: { colors: [string, string, string] }) {
  const particles = Array.from({ length: 16 }, (_, i) => ({
    left: `${(i * 37) % 100}%`,
    size: 4 + ((i * 7) % 10),
    duration: 9 + ((i * 5) % 9),
    delay: -((i * 1.7) % 12),
    color: i % 3 === 0 ? "#ffffff" : i % 3 === 1 ? "#fff3c4" : colors[i % 3],
  }));
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-[#fff8ee]">
      <div className="anim-blob absolute -left-[20%] -top-[10%] h-[70vh] w-[70vh] rounded-full opacity-80 blur-[70px]" style={{ background: colors[0] }} />
      <div className="anim-blob absolute -right-[25%] top-[25%] h-[75vh] w-[75vh] rounded-full opacity-70 blur-[80px]" style={{ background: colors[1], animationDelay: "-5s" }} />
      <div className="anim-blob absolute -bottom-[20%] left-[10%] h-[65vh] w-[65vh] rounded-full opacity-70 blur-[70px]" style={{ background: colors[2], animationDelay: "-10s" }} />
      {particles.map((p, i) => (
        <span
          key={i}
          className="anim-bokeh absolute bottom-[-20px] rounded-full"
          style={{ left: p.left, width: p.size, height: p.size, background: p.color, boxShadow: `0 0 ${p.size * 2}px ${p.color}`, animationDuration: `${p.duration}s`, animationDelay: `${p.delay}s` } as CSSProperties}
        />
      ))}
      <svg className="absolute inset-0 h-full w-full opacity-[0.07] mix-blend-multiply">
        <filter id="grao">
          <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#grao)" />
      </svg>
    </div>
  );
}
