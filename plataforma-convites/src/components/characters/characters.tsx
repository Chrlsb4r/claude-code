import type { CSSProperties, ReactNode } from "react";

/**
 * Personagens ORIGINAIS da loja (não são personagens licenciados de terceiros).
 * Cada um acena em loop (.anim-wave, girando a partir do "ombro"), pisca e balança.
 * Animações só com transform; desligadas por prefers-reduced-motion.
 */
export type CharacterKind = "urso" | "dino" | "coelha" | "astronauta" | "leao" | "baleia" | "baloes";

export const CHARACTER_NAMES: Record<CharacterKind, string> = {
  urso: "Ursinho",
  dino: "Dinossauro",
  coelha: "Coelhinha",
  astronauta: "Astronauta",
  leao: "Leãozinho",
  baleia: "Baleia",
  baloes: "Balões",
};

const INK = "#2a1a4a";
const line = { stroke: INK, strokeWidth: 3.5, strokeLinejoin: "round" as const, strokeLinecap: "round" as const };

/** Grupo que acena: gira em torno do ponto (ox, oy) do viewBox. */
function Wave({ ox, oy, children, delay = 0 }: { ox: number; oy: number; children: ReactNode; delay?: number }) {
  const style: CSSProperties = { transformOrigin: `${ox}px ${oy}px`, animationDelay: `${delay}s` };
  return <g className="anim-wave" style={style}>{children}</g>;
}

function Eyes({ lx, rx, y, r = 6 }: { lx: number; rx: number; y: number; r?: number }) {
  return (
    <g className="anim-blink">
      <ellipse cx={lx} cy={y} rx={r} ry={r * 1.3} fill={INK} />
      <ellipse cx={rx} cy={y} rx={r} ry={r * 1.3} fill={INK} />
      <circle cx={lx + r * 0.35} cy={y - r * 0.5} r={r * 0.38} fill="#fff" />
      <circle cx={rx + r * 0.35} cy={y - r * 0.5} r={r * 0.38} fill="#fff" />
    </g>
  );
}

function Cheeks({ lx, rx, y }: { lx: number; rx: number; y: number }) {
  return (
    <g fill="#ff7aa2" opacity=".55">
      <ellipse cx={lx} cy={y} rx="8" ry="5" />
      <ellipse cx={rx} cy={y} rx="8" ry="5" />
    </g>
  );
}

function PartyHat({ x, y, rot = -12 }: { x: number; y: number; rot?: number }) {
  return (
    <g transform={`rotate(${rot} ${x} ${y})`}>
      <path d={`M${x} ${y - 46} L${x - 20} ${y} L${x + 20} ${y} Z`} fill="#ffc93c" {...line} />
      <path d={`M${x - 10} ${y - 23} L${x + 10} ${y - 23} M${x - 15} ${y - 11} L${x + 15} ${y - 11}`} stroke="#e5266e" strokeWidth="4" strokeLinecap="round" />
      <circle cx={x} cy={y - 48} r="7" fill="#e5266e" {...line} />
    </g>
  );
}

function Urso({ hat }: { hat?: boolean }) {
  const fur = "#c9813f";
  const light = "#f6d6a8";
  return (
    <>
      <ellipse cx="74" cy="206" rx="22" ry="13" fill={fur} {...line} />
      <ellipse cx="126" cy="206" rx="22" ry="13" fill={fur} {...line} />
      <ellipse cx="54" cy="160" rx="14" ry="27" fill={fur} transform="rotate(18 54 160)" {...line} />
      <ellipse cx="100" cy="160" rx="50" ry="46" fill={fur} {...line} />
      <ellipse cx="100" cy="168" rx="29" ry="25" fill={light} />
      <Wave ox={142} oy={142}>
        <ellipse cx="160" cy="112" rx="14" ry="30" fill={fur} transform="rotate(32 160 112)" {...line} />
        <circle cx="172" cy="90" r="9" fill={light} />
      </Wave>
      <circle cx="62" cy="42" r="18" fill={fur} {...line} />
      <circle cx="138" cy="42" r="18" fill={fur} {...line} />
      <circle cx="62" cy="42" r="9" fill={light} />
      <circle cx="138" cy="42" r="9" fill={light} />
      <circle cx="100" cy="80" r="48" fill={fur} {...line} />
      <ellipse cx="100" cy="99" rx="23" ry="17" fill={light} />
      <ellipse cx="100" cy="91" rx="8" ry="6" fill={INK} />
      <path d="M90 102 Q100 112 110 102" fill="none" {...line} />
      <Eyes lx={82} rx={118} y={74} />
      <Cheeks lx={70} rx={130} y={96} />
      {hat && <PartyHat x={104} y={38} />}
    </>
  );
}

function Dino({ hat }: { hat?: boolean }) {
  const skin = "#5bcb6e";
  const belly = "#d4f2a8";
  return (
    <>
      <path d="M60 170 Q20 175 8 140 Q30 160 62 150 Z" fill={skin} {...line} />
      {[[56, 66], [46, 96], [44, 128], [48, 158]].map(([x, y]) => (
        <path key={`${x}-${y}`} d={`M${x + 8} ${y - 12} L${x - 10} ${y} L${x + 8} ${y + 12} Z`} fill="#ff8a3d" {...line} />
      ))}
      <ellipse cx="80" cy="206" rx="20" ry="12" fill={skin} {...line} />
      <ellipse cx="124" cy="206" rx="20" ry="12" fill={skin} {...line} />
      <ellipse cx="100" cy="160" rx="48" ry="46" fill={skin} {...line} />
      <ellipse cx="104" cy="168" rx="28" ry="28" fill={belly} />
      <ellipse cx="66" cy="152" rx="10" ry="18" fill={skin} transform="rotate(25 66 152)" {...line} />
      <Wave ox={140} oy={146}>
        <ellipse cx="156" cy="124" rx="10" ry="22" fill={skin} transform="rotate(35 156 124)" {...line} />
      </Wave>
      <ellipse cx="110" cy="82" rx="54" ry="44" fill={skin} {...line} />
      <circle cx="140" cy="88" r="2.5" fill={INK} />
      <circle cx="150" cy="86" r="2.5" fill={INK} />
      <path d="M92 104 Q116 122 142 100" fill="none" {...line} />
      <Eyes lx={92} rx={126} y={72} />
      <Cheeks lx={80} rx={146} y={96} />
      {hat && <PartyHat x={104} y={42} />}
    </>
  );
}

function Coelha({ hat }: { hat?: boolean }) {
  const fur = "#ffffff";
  const pink = "#ffb3cb";
  return (
    <>
      <g>
        <ellipse cx="80" cy="34" rx="14" ry="40" fill={fur} transform="rotate(-10 80 34)" {...line} />
        <ellipse cx="80" cy="38" rx="6" ry="28" fill={pink} transform="rotate(-10 80 38)" />
      </g>
      <g className="anim-wiggle" style={{ transformOrigin: "118px 70px" }}>
        <ellipse cx="122" cy="34" rx="14" ry="40" fill={fur} transform="rotate(12 122 34)" {...line} />
        <ellipse cx="122" cy="38" rx="6" ry="28" fill={pink} transform="rotate(12 122 38)" />
      </g>
      <ellipse cx="76" cy="206" rx="20" ry="12" fill={fur} {...line} />
      <ellipse cx="124" cy="206" rx="20" ry="12" fill={fur} {...line} />
      <ellipse cx="56" cy="162" rx="12" ry="24" fill={fur} transform="rotate(18 56 162)" {...line} />
      <ellipse cx="100" cy="162" rx="46" ry="44" fill="#ff8fb8" {...line} />
      <path d="M70 140 Q100 160 130 140 L130 150 Q100 172 70 150 Z" fill="#fff" opacity=".6" />
      <Wave ox={140} oy={146}>
        <ellipse cx="156" cy="118" rx="12" ry="26" fill={fur} transform="rotate(32 156 118)" {...line} />
      </Wave>
      <circle cx="100" cy="96" r="44" fill={fur} {...line} />
      <ellipse cx="100" cy="110" rx="6" ry="4.5" fill="#ff7aa2" />
      <path d="M92 116 Q100 122 108 116" fill="none" {...line} />
      <Eyes lx={84} rx={116} y={92} />
      <Cheeks lx={72} rx={128} y={110} />
      <g transform="translate(118 60)">
        <path d="M0 0 L-18 -10 L-18 10 Z M0 0 L18 -10 L18 10 Z" fill="#e5266e" {...line} />
        <circle r="5" fill="#ffc93c" {...line} />
      </g>
      {hat && <PartyHat x={80} y={56} rot={-20} />}
    </>
  );
}

function Astronauta() {
  const suit = "#f4f6fb";
  return (
    <>
      <rect x="54" y="118" width="92" height="70" rx="26" fill="#cfd6e6" {...line} />
      <ellipse cx="78" cy="206" rx="20" ry="12" fill={suit} {...line} />
      <ellipse cx="122" cy="206" rx="20" ry="12" fill={suit} {...line} />
      <ellipse cx="54" cy="160" rx="13" ry="26" fill={suit} transform="rotate(16 54 160)" {...line} />
      <rect x="58" y="120" width="84" height="80" rx="30" fill={suit} {...line} />
      <rect x="82" y="146" width="36" height="22" rx="6" fill="#2f9bef" {...line} />
      <circle cx="92" cy="157" r="3" fill="#ffc93c" />
      <circle cx="104" cy="157" r="3" fill="#e5266e" />
      <Wave ox={140} oy={140}>
        <ellipse cx="158" cy="110" rx="13" ry="28" fill={suit} transform="rotate(32 158 110)" {...line} />
        <circle cx="170" cy="86" r="11" fill="#e5266e" {...line} />
      </Wave>
      <circle cx="100" cy="74" r="52" fill={suit} {...line} />
      <defs>
        <linearGradient id="visor" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#7b4dff" />
          <stop offset="1" stopColor="#2a1a4a" />
        </linearGradient>
      </defs>
      <rect x="62" y="48" width="76" height="54" rx="26" fill="url(#visor)" {...line} />
      <path d="M74 62 Q84 54 98 56" stroke="#fff" strokeWidth="5" strokeLinecap="round" fill="none" opacity=".75" />
      <circle cx="122" cy="88" r="3" fill="#fff" opacity=".6" />
      <line x1="100" y1="22" x2="100" y2="8" {...line} />
      <circle cx="100" cy="6" r="6" fill="#ffc93c" className="anim-twinkle" {...line} />
    </>
  );
}

function Leao({ hat }: { hat?: boolean }) {
  const fur = "#f6b13d";
  const mane = "#e2762b";
  return (
    <>
      <path d="M140 186 Q182 190 178 150" fill="none" {...line} />
      <circle cx="178" cy="146" r="8" fill={mane} {...line} />
      <ellipse cx="76" cy="206" rx="20" ry="12" fill={fur} {...line} />
      <ellipse cx="124" cy="206" rx="20" ry="12" fill={fur} {...line} />
      <ellipse cx="56" cy="160" rx="13" ry="26" fill={fur} transform="rotate(18 56 160)" {...line} />
      <ellipse cx="100" cy="164" rx="46" ry="42" fill={fur} {...line} />
      <ellipse cx="100" cy="172" rx="26" ry="24" fill="#fbe0a6" />
      <Wave ox={140} oy={146}>
        <ellipse cx="158" cy="116" rx="13" ry="28" fill={fur} transform="rotate(32 158 116)" {...line} />
      </Wave>
      {Array.from({ length: 14 }, (_, i) => {
        const a = (i / 14) * Math.PI * 2;
        return <circle key={i} cx={100 + Math.cos(a) * 50} cy={80 + Math.sin(a) * 48} r="18" fill={mane} {...line} />;
      })}
      <circle cx="100" cy="80" r="44" fill={fur} {...line} />
      <ellipse cx="100" cy="98" rx="20" ry="15" fill="#fbe0a6" />
      <path d="M93 90 L107 90 L100 98 Z" fill={INK} {...line} />
      <path d="M100 98 L100 104 M90 106 Q100 114 110 106" fill="none" {...line} />
      <Eyes lx={84} rx={116} y={74} />
      <Cheeks lx={72} rx={128} y={96} />
      {hat && <PartyHat x={104} y={30} />}
    </>
  );
}

function Baleia() {
  const blue = "#4fb3f6";
  return (
    <>
      <g className="anim-spout" style={{ transformOrigin: "112px 70px" }}>
        <path d="M112 70 Q104 40 86 34 M112 70 Q112 34 112 24 M112 70 Q120 40 138 34" fill="none" stroke="#7fd3ff" strokeWidth="6" strokeLinecap="round" />
        <circle cx="86" cy="32" r="6" fill="#bfe9ff" />
        <circle cx="112" cy="22" r="6" fill="#bfe9ff" />
        <circle cx="138" cy="32" r="6" fill="#bfe9ff" />
      </g>
      <path d="M176 120 Q196 92 192 80 Q178 96 164 104 Q170 86 162 76 Q156 100 160 124 Z" fill={blue} {...line} />
      <path d="M20 140 Q20 76 100 74 Q170 74 172 138 Q170 196 96 198 Q22 198 20 140 Z" fill={blue} {...line} />
      <path d="M30 154 Q96 176 166 150 Q150 192 96 192 Q42 192 30 154 Z" fill="#d6f1ff" />
      <Wave ox={92} oy={160}>
        <path d="M92 160 Q74 186 54 186 Q66 166 86 152 Z" fill="#3a9fe6" {...line} />
      </Wave>
      <path d="M62 132 Q80 146 100 134" fill="none" {...line} />
      <Eyes lx={56} rx={104} y={116} r={5.5} />
      <Cheeks lx={46} rx={114} y={134} />
    </>
  );
}

function Baloes() {
  const b = (x: number, y: number, c: string, d: number) => (
    <g key={c} className="anim-float" style={{ animationDelay: `${d}s`, transformBox: "fill-box", transformOrigin: "bottom center" }}>
      <path d={`M${x} ${y + 38} Q${x - 8} ${y + 80} ${x + 4} ${y + 120}`} fill="none" stroke={INK} strokeWidth="2.5" />
      <ellipse cx={x} cy={y} rx="30" ry="36" fill={c} {...line} />
      <path d={`M${x - 6} ${y + 36} L${x + 6} ${y + 36} L${x} ${y + 44} Z`} fill={c} {...line} />
      <ellipse cx={x - 10} cy={y - 14} rx="7" ry="11" fill="#fff" opacity=".5" transform={`rotate(20 ${x - 10} ${y - 14})`} />
    </g>
  );
  return (
    <>
      {b(64, 74, "#e5266e", 0)}
      {b(136, 66, "#2f9bef", 0.6)}
      {b(100, 48, "#ffc93c", 1.2)}
    </>
  );
}

export function Character({
  kind,
  hat,
  className,
  label,
  bounce = true,
}: {
  kind: CharacterKind;
  hat?: boolean;
  className?: string;
  /** Sem label, o personagem é decorativo (aria-hidden). */
  label?: string;
  bounce?: boolean;
}) {
  const body = {
    urso: <Urso hat={hat} />,
    dino: <Dino hat={hat} />,
    coelha: <Coelha hat={hat} />,
    astronauta: <Astronauta />,
    leao: <Leao hat={hat} />,
    baleia: <Baleia />,
    baloes: <Baloes />,
  }[kind];
  return (
    <svg
      viewBox="0 -14 200 236"
      className={className}
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      overflow="visible"
    >
      <ellipse cx="100" cy="214" rx="62" ry="7" fill={INK} opacity=".12" />
      <g className={bounce ? "anim-bob" : undefined} style={{ transformBox: "view-box", transformOrigin: "100px 214px" }}>
        {body}
      </g>
    </svg>
  );
}
