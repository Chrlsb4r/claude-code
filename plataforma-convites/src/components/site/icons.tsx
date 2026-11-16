/** Ícones simples e coloridos (decorativos). */
type IconKind = "coracao" | "capelo" | "coroa" | "maleta" | "estrela" | "presente" | "check" | "cadeado" | "raio" | "link" | "celular" | "grafico";

const P = { stroke: "#2a1a4a", strokeWidth: 2.4, strokeLinejoin: "round" as const, strokeLinecap: "round" as const };

export function Icon({ kind, className }: { kind: IconKind; className?: string }) {
  const body = {
    coracao: <path d="M24 40 C10 30 4 22 8 14 C12 7 21 8 24 15 C27 8 36 7 40 14 C44 22 38 30 24 40Z" fill="#ff5c8a" {...P} />,
    capelo: (
      <>
        <path d="M4 18 L24 9 L44 18 L24 27 Z" fill="#7b4dff" {...P} />
        <path d="M12 22 V32 Q24 39 36 32 V22" fill="#a58bff" {...P} />
        <path d="M40 20 V31" {...P} fill="none" />
        <circle cx="40" cy="33" r="2.5" fill="#ffc93c" {...P} />
      </>
    ),
    coroa: <path d="M6 36 L8 14 L17 23 L24 10 L31 23 L40 14 L42 36 Z" fill="#ffc93c" {...P} />,
    maleta: (
      <>
        <rect x="6" y="15" width="36" height="24" rx="5" fill="#2f9bef" {...P} />
        <path d="M17 15 V11 Q17 8 20 8 H28 Q31 8 31 11 V15" fill="none" {...P} />
        <path d="M6 25 H42" {...P} />
      </>
    ),
    estrela: <path d="M24 6 L29 18 L42 19 L32 27 L35 40 L24 33 L13 40 L16 27 L6 19 L19 18 Z" fill="#ffc93c" {...P} />,
    presente: (
      <>
        <rect x="7" y="20" width="34" height="20" rx="3" fill="#2dbe6c" {...P} />
        <rect x="5" y="14" width="38" height="8" rx="3" fill="#45d07a" {...P} />
        <path d="M24 14 V40" stroke="#ffc93c" strokeWidth="5" />
        <path d="M24 14 C18 4 10 8 14 14 M24 14 C30 4 38 8 34 14" fill="none" {...P} />
      </>
    ),
    check: (
      <>
        <circle cx="24" cy="24" r="18" fill="#2dbe6c" {...P} />
        <path d="M16 24 L22 30 L33 18" fill="none" stroke="#fff" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
      </>
    ),
    cadeado: (
      <>
        <rect x="10" y="21" width="28" height="20" rx="5" fill="#7b4dff" {...P} />
        <path d="M16 21 V15 Q16 7 24 7 Q32 7 32 15 V21" fill="none" {...P} />
        <circle cx="24" cy="31" r="3" fill="#fff" />
      </>
    ),
    raio: <path d="M27 4 L10 27 H22 L19 44 L38 19 H26 Z" fill="#ffc93c" {...P} />,
    link: (
      <>
        <rect x="5" y="17" width="22" height="14" rx="7" fill="#ff8a3d" {...P} />
        <rect x="21" y="17" width="22" height="14" rx="7" fill="#ffc93c" {...P} />
      </>
    ),
    celular: (
      <>
        <rect x="13" y="5" width="22" height="38" rx="5" fill="#2f9bef" {...P} />
        <rect x="17" y="10" width="14" height="24" rx="2" fill="#dff1ff" />
        <circle cx="24" cy="38" r="1.8" fill="#fff" />
      </>
    ),
    grafico: (
      <>
        <rect x="7" y="26" width="8" height="14" rx="2" fill="#ff5c8a" {...P} />
        <rect x="20" y="16" width="8" height="24" rx="2" fill="#ffc93c" {...P} />
        <rect x="33" y="8" width="8" height="32" rx="2" fill="#2dbe6c" {...P} />
      </>
    ),
  }[kind];
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden>
      {body}
    </svg>
  );
}
export type { IconKind };
