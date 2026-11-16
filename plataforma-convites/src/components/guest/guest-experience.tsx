"use client";

import { useState } from "react";
import type { CharacterKind } from "@/components/characters/characters";
import { InvitationView, type InvitationContent, type InvitationLayout } from "@/components/invitation/invitation-view";
import { Ambient } from "./ambient";
import { downloadIcs } from "./calendar";
import { ConfettiBurst } from "./confetti-burst";
import { EnvelopeIntro } from "./envelope-intro";
import { EventDetails } from "./event-details";
import { FlipCountdown } from "./flip-countdown";
import { RsvpDemo } from "./rsvp-demo";
import { TiltCard } from "./tilt-card";

/** Pares de cores (início/fim do degradê) com texto branco ≥ 4,5:1, e tons suaves para o fundo. */
const ACCENTS: Record<string, { pair: [string, string]; soft: string }> = {
  rosa: { pair: ["#d61f63", "#8e0f45"], soft: "#ff9ec4" },
  azul: { pair: ["#1769b3", "#0d3f7a"], soft: "#8fc8ff" },
  roxo: { pair: ["#5a2fd6", "#33178f"], soft: "#c4a8ff" },
  verde: { pair: ["#16774a", "#0b4a2d"], soft: "#9ce6bd" },
  laranja: { pair: ["#b8430b", "#7a2a05"], soft: "#ffbe8f" },
};
const CLASSIC = { pair: ["#8a6d3b", "#5c4520"] as [string, string], soft: "#f1e4cc" };

function Section({ eyebrow, title, children }: { eyebrow: string; title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-5">
      <div className="text-center">
        <p className="text-xs font-extrabold uppercase tracking-[0.3em] text-ink-soft">{eyebrow}</p>
        <h2 className="mt-1 font-display text-3xl font-bold text-ink">{title}</h2>
      </div>
      {children}
    </section>
  );
}

/**
 * Experiência completa de quem recebe o convite:
 * envelope com selo → confete → convite em 3D → contagem estilo painel → detalhes com ações → RSVP.
 */
export function GuestExperience({ content, layout, demo = true }: { content: InvitationContent; layout: InvitationLayout; demo?: boolean }) {
  const [burst, setBurst] = useState(0);
  const character = (layout.character as CharacterKind | undefined) ?? null;
  const themed = layout.variant === "animado" || layout.variant === "ticket";
  const accent = themed ? ACCENTS[content.palette ?? ""] ?? ACCENTS[layout.variant === "ticket" ? "roxo" : "rosa"] : CLASSIC;
  const ambient: [string, string, string] = themed ? [accent.soft, "#ffd36b", "#9ad8ff"] : [CLASSIC.soft, "#f3dede", "#dfe7da"];

  return (
    <>
      <Ambient colors={ambient} />
      <EnvelopeIntro
        honoree={content.honoree_name ?? "Você"}
        character={character}
        color={accent.pair[0]}
        colorDark={accent.pair[1]}
        onOpen={() => setBurst((b) => b + 1)}
      />
      <ConfettiBurst trigger={burst} count={110} />

      <div className="mx-auto flex w-full max-w-[460px] flex-col gap-12 px-4 py-8">
        <TiltCard>
          <InvitationView content={content} layout={layout} inert={demo} label={`Convite de ${content.honoree_name ?? "exemplo"}`} />
        </TiltCard>

        <FlipCountdown date={content.event_date} time={content.event_time} timeZone={content.timezone} />

        <Section eyebrow="Anote aí" title="Detalhes da festa">
          <EventDetails content={content} demo={demo} accent={accent.pair} />
        </Section>

        <RsvpDemo character={character} accent={accent.pair} onCelebrate={() => setBurst((b) => b + 1)} onAddToCalendar={() => downloadIcs(content)} />
      </div>
    </>
  );
}
