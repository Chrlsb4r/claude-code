"use client";

import { useState } from "react";
import { Character, type CharacterKind } from "@/components/characters/characters";
import { cn } from "@/lib/cn";

/**
 * Formulário de confirmação de presença no estilo festivo.
 * Nesta página é DEMONSTRAÇÃO: nada é enviado. Na Fase 5 o mesmo componente
 * chamará a rota de RSVP (validação no servidor + submit_rsvp).
 */
export function RsvpDemo({
  character,
  accent,
  maxCompanions = 3,
  onCelebrate,
}: {
  character: CharacterKind | null;
  accent: string;
  maxCompanions?: number;
  onCelebrate: () => void;
}) {
  const [name, setName] = useState("");
  const [going, setGoing] = useState<boolean | null>(null);
  const [companions, setCompanions] = useState(0);
  const [done, setDone] = useState<null | "sim" | "nao">(null);
  const [error, setError] = useState<string | null>(null);

  if (done) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-lg bg-mint-soft p-5 text-center" role="status">
        {character && <Character kind={character} hat className="anim-heart h-28 w-28" />}
        <p className="font-display text-2xl font-bold text-ink">
          {done === "sim" ? `Oba, ${name.split(" ")[0]}! Te esperamos lá!` : "Que pena! Obrigado por avisar."}
        </p>
        <p className="text-sm font-semibold text-ink-soft">
          {done === "sim"
            ? companions > 0
              ? `Presença confirmada para você e mais ${companions}.`
              : "Sua presença foi confirmada."
            : "Sua resposta foi registrada."}
        </p>
        <p className="rounded-full bg-white px-3 py-1 text-xs font-bold text-ink-soft">Demonstração: nenhuma resposta foi enviada.</p>
        <button type="button" onClick={() => { setDone(null); setGoing(null); }} className="text-sm font-bold text-ink underline underline-offset-4">
          Alterar resposta
        </button>
      </div>
    );
  }

  return (
    <form
      className="flex flex-col gap-4 rounded-lg border-2 border-dashed p-5"
      style={{ borderColor: accent }}
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
      <p className="text-center font-display text-xl font-bold text-ink">Você vai?</p>
      <label className="flex flex-col gap-1.5 text-sm font-bold text-ink">
        Seu nome
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={120}
          autoComplete="name"
          className="h-12 rounded-md border-2 border-line bg-white px-4 text-base font-semibold focus:border-purple focus:outline-none"
        />
      </label>
      <div className="grid grid-cols-2 gap-3" role="group" aria-label="Resposta">
        {[{ v: true, t: "Eu vou!" }, { v: false, t: "Não poderei" }].map((o) => (
          <button
            key={o.t}
            type="button"
            aria-pressed={going === o.v}
            onClick={() => setGoing(o.v)}
            className={cn(
              "h-12 rounded-full border-2 font-display text-base font-bold transition-transform",
              going === o.v ? "-translate-y-0.5 border-ink text-white" : "border-line bg-white text-ink",
            )}
            style={going === o.v ? { background: o.v ? accent : "#5a4c78" } : undefined}
          >
            {o.t}
          </button>
        ))}
      </div>
      {going && maxCompanions > 0 && (
        <div className="flex items-center justify-between gap-3">
          <span className="text-sm font-bold text-ink">Acompanhantes</span>
          <div className="flex items-center gap-3">
            <button type="button" aria-label="Menos um acompanhante" onClick={() => setCompanions((c) => Math.max(0, c - 1))} className="h-10 w-10 rounded-full border-2 border-ink bg-white font-display text-xl font-bold">−</button>
            <span className="w-6 text-center font-display text-xl font-bold tabular-nums" aria-live="polite">{companions}</span>
            <button type="button" aria-label="Mais um acompanhante" onClick={() => setCompanions((c) => Math.min(maxCompanions, c + 1))} className="h-10 w-10 rounded-full border-2 border-ink bg-yellow font-display text-xl font-bold">+</button>
          </div>
        </div>
      )}
      {error && <p role="alert" className="text-sm font-bold text-danger">{error}</p>}
      <button type="submit" className="h-14 rounded-full bg-brand font-display text-lg font-bold text-white shadow-[0_5px_0_var(--brand-dark)] active:translate-y-1 active:shadow-[0_1px_0_var(--brand-dark)]">
        Confirmar resposta
      </button>
    </form>
  );
}
