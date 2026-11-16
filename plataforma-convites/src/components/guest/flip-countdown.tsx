"use client";

import { useEffect, useRef, useState } from "react";
import { localToUtc } from "@/lib/domain/expiration";

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

/** Um bloco estilo "painel de aeroporto": a metade de cima vira quando o número muda. */
function FlipUnit({ value, label }: { value: string; label: string }) {
  const prev = useRef(value);
  const [flip, setFlip] = useState<{ from: string; to: string; key: number } | null>(null);

  useEffect(() => {
    if (prev.current === value) return;
    const from = prev.current;
    prev.current = value;
    if (from === "--") return; // primeiro valor: aparece direto, sem virar
    const start = setTimeout(() => setFlip((f) => ({ from, to: value, key: (f?.key ?? 0) + 1 })), 0);
    const end = setTimeout(() => setFlip(null), 650); // remove a camada animada ao terminar
    return () => {
      clearTimeout(start);
      clearTimeout(end);
    };
  }, [value]);

  const half = "absolute inset-x-0 h-1/2 overflow-hidden";
  const face = "flex h-[200%] items-center justify-center font-display text-[2.3rem] font-bold tabular-nums text-white";
  const card = "bg-[linear-gradient(180deg,#3a2a66,#21153f)]";

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative h-[68px] min-w-[64px] rounded-[12px] px-1.5 shadow-[0_10px_20px_-6px_rgba(42,26,74,0.6),inset_0_1px_0_rgba(255,255,255,0.15)] [perspective:300px]">
        <div className={`${half} top-0 rounded-t-[12px] ${card}`}><div className={face}>{value}</div></div>
        <div className={`${half} bottom-0 rounded-b-[12px] ${card}`}><div className={`${face} -translate-y-1/2`}>{value}</div></div>
        {flip && (
          <>
            <div key={`t${flip.key}`} aria-hidden className={`${half} anim-flip-top top-0 z-10 rounded-t-[12px] ${card}`}><div className={face}>{flip.from}</div></div>
            <div key={`b${flip.key}`} aria-hidden className={`${half} anim-flip-bottom bottom-0 z-10 rounded-b-[12px] ${card}`}><div className={`${face} -translate-y-1/2`}>{flip.to}</div></div>
          </>
        )}
        <div className="absolute inset-x-0 top-1/2 z-20 h-px bg-black/50" aria-hidden />
        <span className="absolute -left-1 top-1/2 z-20 h-2 w-2 -translate-y-1/2 rounded-full bg-black/40" aria-hidden />
        <span className="absolute -right-1 top-1/2 z-20 h-2 w-2 -translate-y-1/2 rounded-full bg-black/40" aria-hidden />
      </div>
      <span className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-ink-soft">{label}</span>
    </div>
  );
}

/** Contagem regressiva estilo painel de embarque, calculada no fuso do evento (só no navegador). */
export function FlipCountdown({ date, time, timeZone }: { date?: string; time?: string; timeZone?: string }) {
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
  const v = (n?: number) => (n === undefined ? "--" : String(n).padStart(2, "0"));

  return (
    <div className="flex flex-col items-center gap-4">
      <p className="font-display text-lg font-bold text-ink">{parts?.over ? "É hoje!" : "Contagem regressiva"}</p>
      <div className="flex items-start gap-2.5" role="timer" aria-label={parts ? `Faltam ${parts.d} dias, ${parts.h} horas e ${parts.m} minutos` : "Calculando"}>
        <FlipUnit value={v(parts?.d)} label="dias" />
        <FlipUnit value={v(parts?.h)} label="horas" />
        <FlipUnit value={v(parts?.m)} label="min" />
        <FlipUnit value={v(parts?.s)} label="seg" />
      </div>
    </div>
  );
}
