import type { CSSProperties } from "react";

export type SceneKind = "ceu" | "espaco" | "selva" | "mar" | "festa" | "doce";

/** Cor de fundo abaixo do cenário (onde fica o cartão branco com as informações). */
export const SCENE_BASE: Record<SceneKind, string> = {
  ceu: "#cfeeff",
  espaco: "#3b2a8a",
  selva: "#c7f0a4",
  mar: "#9fe3fb",
  festa: "#ffd36b",
  doce: "#ffd9e8",
};

const d = (s: number): CSSProperties => ({ animationDelay: `${s}s` });

function Cloud({ x, y, s, delay }: { x: number; y: number; s: number; delay: number }) {
  return (
    <g className="anim-drift" style={d(delay)}>
      <g transform={`translate(${x} ${y}) scale(${s})`} fill="#fff">
        <circle cx="12" cy="10" r="10" />
        <circle cx="26" cy="6" r="12" />
        <circle cx="40" cy="11" r="9" />
        <rect x="4" y="10" width="44" height="10" rx="5" />
      </g>
    </g>
  );
}

const CONFETTI = ["#e5266e", "#2f9bef", "#7b4dff", "#2dbe6c", "#ffffff", "#ff8a3d"];

export function Scene({ kind }: { kind: SceneKind }) {
  const common = { viewBox: "0 0 200 160", preserveAspectRatio: "xMidYMid slice", className: "absolute inset-0 h-full w-full", "aria-hidden": true } as const;
  switch (kind) {
    case "ceu":
      return (
        <svg {...common}>
          <defs><linearGradient id="sc-ceu" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#6cc8ff" /><stop offset="1" stopColor="#cfeeff" /></linearGradient></defs>
          <rect width="200" height="160" fill="url(#sc-ceu)" />
          <circle cx="168" cy="28" r="16" fill="#ffd93d" className="anim-twinkle" style={{ animationDuration: "5s" }} />
          <Cloud x={10} y={22} s={0.9} delay={0} />
          <Cloud x={120} y={50} s={0.7} delay={2} />
          <Cloud x={60} y={8} s={0.55} delay={4} />
          <ellipse cx="40" cy="168" rx="80" ry="34" fill="#8ee08a" />
          <ellipse cx="170" cy="172" rx="90" ry="36" fill="#6fd17a" />
        </svg>
      );
    case "espaco":
      return (
        <svg {...common}>
          <defs><linearGradient id="sc-esp" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#1d1250" /><stop offset="1" stopColor="#3b2a8a" /></linearGradient></defs>
          <rect width="200" height="160" fill="url(#sc-esp)" />
          {[[14, 18], [44, 40], [70, 12], [102, 30], [130, 14], [186, 52], [24, 80], [176, 96], [150, 70], [60, 64], [90, 6], [118, 92]].map(([x, y], i) => (
            <path key={i} className="anim-twinkle" style={d(i * 0.35)} d={`M${x} ${y - 3} L${x + 1} ${y - 1} L${x + 3} ${y} L${x + 1} ${y + 1} L${x} ${y + 3} L${x - 1} ${y + 1} L${x - 3} ${y} L${x - 1} ${y - 1}Z`} fill={i % 3 ? "#fff" : "#ffd93d"} />
          ))}
          <g className="anim-float" style={{ transformBox: "fill-box", transformOrigin: "center" }}>
            <circle cx="166" cy="30" r="14" fill="#ff8a3d" />
            <ellipse cx="166" cy="30" rx="24" ry="6" fill="none" stroke="#ffd93d" strokeWidth="3" transform="rotate(-18 166 30)" />
          </g>
          <circle cx="30" cy="40" r="7" fill="#e5e0ff" />
          <ellipse cx="100" cy="176" rx="140" ry="40" fill="#7b4dff" />
          <circle cx="60" cy="150" r="6" fill="#5a2fd6" /><circle cx="140" cy="146" r="9" fill="#5a2fd6" />
        </svg>
      );
    case "selva":
      return (
        <svg {...common}>
          <defs><linearGradient id="sc-sel" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#8fe0ff" /><stop offset="1" stopColor="#e9fbd0" /></linearGradient></defs>
          <rect width="200" height="160" fill="url(#sc-sel)" />
          <circle cx="160" cy="30" r="15" fill="#ffd93d" />
          <g className="anim-wiggle" style={{ transformOrigin: "0px 160px" }}>
            <path d="M0 160 Q10 80 40 40 Q30 90 46 120 Q18 110 0 160Z" fill="#2dbe6c" />
            <path d="M0 160 Q30 100 70 80 Q44 120 50 150Z" fill="#45d07a" />
          </g>
          <g className="anim-wiggle" style={{ transformOrigin: "200px 160px", animationDelay: ".6s" }}>
            <path d="M200 160 Q190 80 160 44 Q172 92 154 122 Q184 110 200 160Z" fill="#2dbe6c" />
            <path d="M200 160 Q170 104 132 86 Q156 122 150 152Z" fill="#45d07a" />
          </g>
          <ellipse cx="100" cy="174" rx="130" ry="34" fill="#5bbf4f" />
        </svg>
      );
    case "mar":
      return (
        <svg {...common}>
          <defs><linearGradient id="sc-mar" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#2aa8ea" /><stop offset="1" stopColor="#9fe3fb" /></linearGradient></defs>
          <rect width="200" height="160" fill="url(#sc-mar)" />
          <path d="M0 18 Q25 10 50 18 T100 18 T150 18 T200 18 V0 H0Z" fill="#bdeeff" opacity=".6" className="anim-drift" />
          {[[20, 150, 4], [46, 156, 3], [150, 150, 5], [176, 158, 3], [120, 158, 2.5], [80, 154, 3.5]].map(([x, y, r], i) => (
            <circle key={i} cx={x} cy={y} r={r} fill="none" stroke="#fff" strokeWidth="1.5" className="anim-rise" style={d(i * 0.7)} />
          ))}
          <g className="anim-wiggle" style={{ transformOrigin: "24px 160px" }}>
            <path d="M24 160 Q14 130 26 110 Q34 130 24 160Z M34 160 Q44 128 36 104 Q28 130 34 160Z" fill="#2dbe6c" />
          </g>
          <g className="anim-wiggle" style={{ transformOrigin: "178px 160px", animationDelay: ".8s" }}>
            <path d="M178 160 Q168 126 182 100 Q190 128 178 160Z" fill="#45d07a" />
          </g>
          <ellipse cx="100" cy="176" rx="130" ry="30" fill="#ffe2a8" />
        </svg>
      );
    case "festa":
      return (
        <svg {...common}>
          <defs><radialGradient id="sc-fes" cx="50%" cy="20%" r="90%"><stop offset="0" stopColor="#fff2a8" /><stop offset="1" stopColor="#ffb347" /></radialGradient></defs>
          <rect width="200" height="160" fill="url(#sc-fes)" />
          {Array.from({ length: 18 }, (_, i) => {
            const x = (i * 37) % 196 + 2;
            return <rect key={i} x={x} y={(i * 13) % 50} width="5" height="2.4" rx="1" fill={CONFETTI[i % CONFETTI.length]} className="anim-fall" style={{ animationDelay: `${(i * 0.31) % 5}s`, animationDuration: `${4 + (i % 4)}s` }} />;
          })}
          <circle cx="20" cy="140" r="36" fill="#ff8a3d" opacity=".35" />
          <circle cx="186" cy="134" r="40" fill="#e5266e" opacity=".22" />
        </svg>
      );
    case "doce":
      return (
        <svg {...common}>
          <defs><linearGradient id="sc-doc" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#ffb3d1" /><stop offset="1" stopColor="#ffe8f2" /></linearGradient></defs>
          <rect width="200" height="160" fill="url(#sc-doc)" />
          {Array.from({ length: 14 }, (_, i) => (
            <rect key={i} x={(i * 29) % 190 + 4} y={(i * 17) % 110 + 6} width="7" height="2.6" rx="1.3" fill={["#fff", "#7b4dff", "#2f9bef", "#ffd93d"][i % 4]} transform={`rotate(${(i * 47) % 180} ${(i * 29) % 190 + 6} ${(i * 17) % 110 + 7})`} className="anim-twinkle" style={d(i * 0.3)} />
          ))}
          <Cloud x={14} y={30} s={0.7} delay={0} />
          <Cloud x={130} y={14} s={0.6} delay={3} />
          <ellipse cx="40" cy="170" rx="80" ry="32" fill="#ff8fb8" />
          <ellipse cx="170" cy="172" rx="86" ry="34" fill="#ffa6c8" />
        </svg>
      );
  }
}

export function Bunting() {
  const colors = ["#e5266e", "#ffc93c", "#2f9bef", "#2dbe6c", "#7b4dff"];
  return (
    <svg viewBox="0 0 200 24" preserveAspectRatio="none" className="absolute inset-x-0 top-0 h-[9cqw] w-full" aria-hidden>
      <path d="M0 2 Q100 16 200 2" fill="none" stroke="#2a1a4a" strokeWidth="1" opacity=".5" />
      {Array.from({ length: 11 }, (_, i) => {
        const x = 4 + i * 18;
        const y = 2 + Math.sin((i / 10) * Math.PI) * 7;
        return <path key={i} d={`M${x} ${y} L${x + 14} ${y + 0.6} L${x + 7} ${y + 13} Z`} fill={colors[i % colors.length]} />;
      })}
    </svg>
  );
}
