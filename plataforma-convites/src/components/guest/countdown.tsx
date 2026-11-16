"use client";

import { useEffect, useState } from "react";
import { localToUtc } from "@/lib/domain/expiration";

const UNITS = [
  { key: "d", label: "dias", bg: "bg-pink-soft" },
  { key: "h", label: "horas", bg: "bg-lemon-soft" },
  { key: "m", label: "min", bg: "bg-sky-soft" },
  { key: "s", label: "seg", bg: "bg-mint-soft" },
] as const;

type Parts = { d: number; h: number; m: number; s: number; over: boolean };

function computeParts(date?: string, time?: string, timeZone?: string): Parts | null {
  if (!date || !time) return null;
  let target: number;
  try {
    target = localToUtc(date, time, timeZone || "America/Sao_Paulo").getTime();
  } catch {
    return null;
  }
  const diff = Math.max(0, target - Date.now());
  return {
    d: Math.floor(diff / 86400000),
    h: Math.floor((diff % 86400000) / 3600000),
    m: Math.floor((diff % 3600000) / 60000),
    s: Math.floor((diff % 60000) / 1000),
    over: diff === 0,
  };
}

/** Contagem regressiva até o início do evento (no fuso do evento). Calculada só no navegador. */
export function Countdown({ date, time, timeZone }: { date?: string; time?: string; timeZone?: string }) {
  const [parts, setParts] = useState<Parts | null>(null);

  useEffect(() => {
    const tick = () => setParts(computeParts(date, time, timeZone));
    const first = setTimeout(tick, 0);
    const id = setInterval(tick, 1000);
    return () => {
      clearTimeout(first);
      clearInterval(id);
    };
  }, [date, time, timeZone]);

  if (!date || !time) return null;

  return (
    <div className="flex flex-col items-center gap-2">
      <p className="font-display text-base font-semibold text-ink">{parts?.over ? "É hoje! 🎉" : "Falta pouco para a festa"}</p>
      <div className="grid grid-cols-4 gap-2" role="timer" aria-live="off">
        {UNITS.map((u) => (
          <div key={u.key} className={`flex min-w-14 flex-col items-center rounded-md px-2 py-2 ${u.bg}`}>
            <span className="font-display text-2xl font-bold tabular-nums text-ink">{parts ? String(parts[u.key]).padStart(2, "0") : "--"}</span>
            <span className="text-[11px] font-bold uppercase text-ink-soft">{u.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
