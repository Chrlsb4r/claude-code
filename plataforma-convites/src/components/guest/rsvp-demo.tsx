"use client";

import { useState } from "react";
import { Character, type CharacterKind } from "@/components/characters/characters";
import { cn } from "@/lib/cn";

/**
 * Confirmação de presença premium. Nesta página é DEMONSTRAÇÃO: nada é enviado.
 * Na Fase 5 o mesmo componente chamará a rota de RSVP (validação no servidor + submit_rsvp).
 */
export function RsvpDemo({
  character,
  accent,
  maxCompanions = 3,
  onCelebrate,
  onAddToCalendar,
}: {
  character: CharacterKind | null;
  accent: [string, string];
  maxCompanions?: number;
  onCelebrate: () => void;
  onAddToCalendar?: () => void;
}) {
  const [name, setName] = useState("");
  const [going, setGoing] = useState<boolean | null>(null);
  const [companions, setCompanions] = useState(0);
  const [done, setDone] = useState<null | "sim" | "nao">(null);
  const [error, setError] = useState<string | null>(null);
  const gradient = `linear-gradient(135deg, ${accent[0]}, ${accent[1]})`;
  const card = "relative overflow-hidden rounded-[28px] border border-white/70 bg-white/75 p-6 shadow-[0_30px_60px_-25px_rgba(42,26,74,0.55)] backdrop-blur-xl";

  if (done) {
    return (
      <div className={`${card} flex flex-col items-center gap-3 text-center`} role="status">
        <div className="relative grid h-24 w-24 place-items-center">
          <span className="anim-ring absolute inset-0 rounded-full" style={{ background: accent[0] }} aria-hidden />
          <svg viewBox="0 0 52 52" className="relative h-24 w-24" aria-hidden>
            <circle cx="26" cy="26" r="24" fill={done === "sim" ? accent[0] : "#5a4c78"} />
            <path d="M15 27 L23 34 L38 18" fill="none" stroke="#fff" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" pathLength={100} className="anim-draw" />
          </svg>
        </div>
        <p className="font-display text-3xl font-bold leading-tight text-ink">
          {done === "sim" ? `Oba, ${name.trim().split(" ")[0]}!` : "Que pena!"}
        </p>
        <p className="font-semibold text-ink-soft">
          {done === "sim"
            ? companions > 0
              ? `Presença confirmada para você e mais ${companions}. Te esperamos lá!`
              : "Sua presença foi confirmada. Te esperamos lá!"
            : "Obrigado por avisar. Sua resposta foi registrada."}
        </p>
        {done === "sim" && character && <Character kind={character} hat className="anim-heart -mb-2 h-28 w-28" />}
        {done === "sim" && onAddToCalendar && (
          <button type="button" onClick={onAddToCalendar} className="inline-flex h-12 items-center rounded-full px-6 font-display font-bold text-white shadow-[0_5px_0_rgba(42,26,74,0.4)]" style={{ background: gradient }}>
            Salvar na minha agenda
          </button>
        )}
        <p className="rounded-full bg-ink/5 px-3 py-1 text-xs font-bold text-ink-soft">Demonstração: nenhuma resposta foi enviada.</p>
        <button type="button" onClick={() => { setDone(null); setGoing(null); }} className="text-sm font-bold text-ink underline underline-offset-4">
          Alterar resposta
        </button>
      </div>
    );
  }

  return (
    <form
      className={`${card} flex flex-col gap-5`}
      onSubmit={(e) => {
        e.preventDefault();
        if (!name.trim()) return setError("Escreva seu nome para confirmar.");
        if (going === null) return setError("Conta pra gente: você vai?");
        setError(null);
        setDone(going ? "sim" : "nao");
        if (going) onCelebrate();
      }}
      aria-label="Confirmar presença"
    >
      <div className="pointer-events-none absolute -left-16 -top-16 h-48 w-48 rounded-full opacity-25 blur-3xl" style={{ background: gradient }} aria-hidden />
      <div className="relative text-center">
        <p className="text-xs font-extrabold uppercase tracking-[0.25em] text-ink-soft">Confirmação de presença</p>
        <p className="mt-1 font-display text-3xl font-bold text-ink">Você vai?</p>
      </div>
      <label className="relative flex flex-col gap-1.5 text-sm font-bold text-ink">
        Seu nome
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={120}
          autoComplete="name"
          placeholder="Como está no convite"
          className="h-14 rounded-2xl border-2 border-white bg-white/90 px-4 text-base font-semibold shadow-inner placeholder:font-normal placeholder:text-ink-soft focus:border-purple focus:outline-none"
        />
      </label>
      <div className="relative grid grid-cols-2 gap-3" role="group" aria-label="Resposta">
        {[
          { v: true, t: "Eu vou!", d: "Conte comigo", icon: "M5 13l4 4L19 7" },
          { v: false, t: "Não poderei", d: "Fica pra próxima", icon: "M6 6l12 12M18 6L6 18" },
        ].map((o) => {
          const active = going === o.v;
          return (
            <button
              key={o.t}
              type="button"
              aria-pressed={active}
              onClick={() => setGoing(o.v)}
              className={cn(
                "flex flex-col items-center gap-1 rounded-2xl border-2 px-3 py-4 transition-[transform,box-shadow] duration-200",
                active ? "-translate-y-1 border-transparent text-white shadow-[0_12px_24px_-10px_rgba(42,26,74,0.6)]" : "border-white bg-white/90 text-ink",
              )}
              style={active ? { background: o.v ? gradient : "linear-gradient(135deg,#6b5f86,#3d3159)" } : undefined}
            >
              <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d={o.icon} /></svg>
              <span className="font-display text-lg font-bold">{o.t}</span>
              <span className={cn("text-xs font-bold", active ? "text-white/90" : "text-ink-soft")}>{o.d}</span>
            </button>
          );
        })}
      </div>
      {going && maxCompanions > 0 && (
        <div className="relative flex items-center justify-between gap-3 rounded-2xl bg-white/90 px-4 py-3">
          <div>
            <p className="text-sm font-bold text-ink">Acompanhantes</p>
            <p className="text-xs font-semibold text-ink-soft">até {maxCompanions}</p>
          </div>
          <div className="flex items-center gap-3">
            <button type="button" aria-label="Menos um acompanhante" onClick={() => setCompanions((n) => Math.max(0, n - 1))} className="h-11 w-11 rounded-full border-2 border-ink/15 bg-white font-display text-2xl font-bold text-ink">−</button>
            <span className="w-7 text-center font-display text-2xl font-bold tabular-nums text-ink" aria-live="polite">{companions}</span>
            <button type="button" aria-label="Mais um acompanhante" onClick={() => setCompanions((n) => Math.min(maxCompanions, n + 1))} className="h-11 w-11 rounded-full font-display text-2xl font-bold text-white" style={{ background: gradient }}>+</button>
          </div>
        </div>
      )}
      {error && <p role="alert" className="relative text-center text-sm font-bold text-danger">{error}</p>}
      <button
        type="submit"
        className="relative h-14 overflow-hidden rounded-full font-display text-lg font-bold text-white shadow-[0_6px_0_rgba(42,26,74,0.85)] transition-transform active:translate-y-1"
        style={{ background: gradient }}
      >
        <span className="anim-sweep absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-transparent via-white/40 to-transparent" aria-hidden />
        <span className="relative">Confirmar resposta</span>
      </button>
    </form>
  );
}
