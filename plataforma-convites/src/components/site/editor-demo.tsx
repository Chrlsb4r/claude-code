"use client";

import { useState } from "react";
import { InvitationView, type InvitationContent } from "@/components/invitation/invitation-view";
import { PhoneFrame } from "@/components/invitation/phone-frame";
import { Field, Input } from "@/components/ui/field";
import { cn } from "@/lib/cn";

const STYLES = [
  { key: "botanico", label: "Botânico" },
  { key: "editorial", label: "Editorial" },
  { key: "gala", label: "Gala" },
] as const;

/** Demonstração do editor na home: dados fictícios, nada é salvo. */
export function EditorDemo() {
  const [variant, setVariant] = useState<string>("botanico");
  const [c, setC] = useState<InvitationContent>({
    title: "Aniversário",
    honoree_name: "Helena",
    age: "5",
    event_date: "2027-04-17",
    event_time: "16:00",
    venue_name: "Casa Jardim",
    address: "Rua das Acácias, 120",
  });
  const set = (k: keyof InvitationContent) => (e: React.ChangeEvent<HTMLInputElement>) => setC((p) => ({ ...p, [k]: e.target.value }));

  return (
    <div className="grid items-center gap-10 lg:grid-cols-2">
      <div className="order-2 flex flex-col gap-5 lg:order-1">
        <Field label="Nome do homenageado">{({ id }) => <Input id={id} value={c.honoree_name} onChange={set("honoree_name")} maxLength={40} />}</Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Data">{({ id }) => <Input id={id} type="date" value={c.event_date} onChange={set("event_date")} />}</Field>
          <Field label="Horário">{({ id }) => <Input id={id} type="time" value={c.event_time} onChange={set("event_time")} />}</Field>
        </div>
        <fieldset className="flex flex-col gap-2">
          <legend className="text-sm font-medium">Estilo</legend>
          <div className="flex flex-wrap gap-2">
            {STYLES.map((s) => (
              <button
                key={s.key}
                type="button"
                aria-pressed={variant === s.key}
                onClick={() => setVariant(s.key)}
                className={cn(
                  "h-10 rounded-full border px-4 text-sm transition-colors",
                  variant === s.key ? "border-graphite bg-graphite text-paper" : "border-line bg-paper-raised hover:border-champagne",
                )}
              >
                {s.label}
              </button>
            ))}
          </div>
        </fieldset>
        <p className="text-sm text-graphite-soft">A prévia atualiza enquanto você digita. No editor completo, cada modelo traz seus próprios campos.</p>
      </div>
      <div className="order-1 lg:order-2" aria-live="polite">
        <PhoneFrame>
          <InvitationView content={c} variant={variant} preview label="Prévia da demonstração" className="min-h-full" />
        </PhoneFrame>
      </div>
    </div>
  );
}
