"use client";

import { useState } from "react";
import { Character, CHARACTER_NAMES, type CharacterKind } from "@/components/characters/characters";
import { InvitationView, type InvitationContent } from "@/components/invitation/invitation-view";
import { PhoneFrame } from "@/components/invitation/phone-frame";
import { Field, Input } from "@/components/ui/field";
import { cn } from "@/lib/cn";

const THEMES: { character: CharacterKind; scene: string }[] = [
  { character: "urso", scene: "ceu" },
  { character: "dino", scene: "selva" },
  { character: "astronauta", scene: "espaco" },
  { character: "coelha", scene: "doce" },
  { character: "leao", scene: "selva" },
  { character: "baleia", scene: "mar" },
];
const COLORS = [
  { key: "rosa", label: "Rosa", hex: "#d61f63" },
  { key: "azul", label: "Azul", hex: "#1769b3" },
  { key: "roxo", label: "Roxo", hex: "#5a2fd6" },
  { key: "verde", label: "Verde", hex: "#16774a" },
  { key: "laranja", label: "Laranja", hex: "#b8430b" },
];

/** Demonstração do editor na home: dados fictícios, nada é salvo. */
export function EditorDemo() {
  const [theme, setTheme] = useState(THEMES[0]);
  const [c, setC] = useState<InvitationContent>({
    title: "Aniversário",
    honoree_name: "Helena",
    age: "5",
    event_date: "2027-04-17",
    event_time: "16:00",
    venue_name: "Casa de Festas Alegria",
    address: "Rua das Acácias, 120",
    palette: "rosa",
  });
  const set = (k: keyof InvitationContent) => (e: React.ChangeEvent<HTMLInputElement>) => setC((p) => ({ ...p, [k]: e.target.value }));

  return (
    <div className="grid items-center gap-10 lg:grid-cols-2">
      <div className="order-2 flex flex-col gap-6 rounded-lg border-2 border-ink bg-white p-6 shadow-[0_6px_0_var(--ink)] lg:order-1">
        <fieldset className="flex flex-col gap-3">
          <legend className="mb-3 text-sm font-bold">1. Escolha o personagem</legend>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
            {THEMES.map((t) => (
              <button
                key={t.character}
                type="button"
                aria-pressed={theme.character === t.character}
                onClick={() => setTheme(t)}
                className={cn(
                  "flex flex-col items-center gap-1 rounded-md border-2 p-2 text-xs font-bold transition-transform",
                  theme.character === t.character ? "-translate-y-1 border-ink bg-lemon-soft" : "border-line bg-white hover:border-brand-soft",
                )}
              >
                <Character kind={t.character} className="h-12 w-12" bounce={false} />
                {CHARACTER_NAMES[t.character]}
              </button>
            ))}
          </div>
        </fieldset>
        <Field label="2. Nome do aniversariante">{({ id }) => <Input id={id} value={c.honoree_name} onChange={set("honoree_name")} maxLength={40} />}</Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Idade">{({ id }) => <Input id={id} inputMode="numeric" value={c.age} onChange={set("age")} maxLength={3} />}</Field>
          <Field label="Horário">{({ id }) => <Input id={id} type="time" value={c.event_time} onChange={set("event_time")} />}</Field>
        </div>
        <fieldset>
          <legend className="mb-2 text-sm font-bold">3. Cor de destaque</legend>
          <div className="flex flex-wrap gap-3">
            {COLORS.map((col) => (
              <button
                key={col.key}
                type="button"
                aria-pressed={c.palette === col.key}
                aria-label={col.label}
                onClick={() => setC((p) => ({ ...p, palette: col.key }))}
                className={cn("h-10 w-10 rounded-full border-4 transition-transform", c.palette === col.key ? "scale-110 border-ink" : "border-white shadow-soft")}
                style={{ background: col.hex }}
              />
            ))}
          </div>
        </fieldset>
      </div>
      <div className="order-1 lg:order-2" aria-live="polite">
        <PhoneFrame>
          <InvitationView content={c} layout={{ variant: "animado", ...theme }} preview label="Prévia da demonstração" className="min-h-full" />
        </PhoneFrame>
      </div>
    </div>
  );
}
