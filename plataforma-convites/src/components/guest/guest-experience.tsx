"use client";

import { useState } from "react";
import type { CharacterKind } from "@/components/characters/characters";
import { InvitationView, type InvitationContent, type InvitationLayout } from "@/components/invitation/invitation-view";
import { ConfettiBurst } from "./confetti-burst";
import { Countdown } from "./countdown";
import { EnvelopeIntro } from "./envelope-intro";
import { RsvpDemo } from "./rsvp-demo";

const ACCENTS: Record<string, string> = { rosa: "#d61f63", azul: "#1769b3", roxo: "#5a2fd6", verde: "#16774a", laranja: "#b8430b" };

/** Experiência completa de quem recebe o convite: envelope → confete → convite → contagem → RSVP. */
export function GuestExperience({ content, layout }: { content: InvitationContent; layout: InvitationLayout }) {
  const [burst, setBurst] = useState(0);
  const character = (layout.character as CharacterKind | undefined) ?? null;
  const accent = layout.variant === "animado" ? ACCENTS[content.palette ?? "rosa"] ?? ACCENTS.rosa : "#7a6646";

  return (
    <>
      <EnvelopeIntro honoree={content.honoree_name ?? "Você"} character={character} color={layout.variant === "animado" ? accent : "#d6c4a8"} onOpen={() => setBurst((b) => b + 1)} />
      <ConfettiBurst trigger={burst} />
      <div className="mx-auto w-full max-w-[480px] overflow-hidden sm:my-8 sm:rounded-lg sm:border-2 sm:border-ink sm:shadow-[0_8px_0_var(--ink)]">
        <InvitationView
          content={content}
          layout={layout}
          inert
          label={`Convite de ${content.honoree_name ?? "exemplo"}`}
          footer={
            <div className="flex flex-col gap-6">
              <Countdown date={content.event_date} time={content.event_time} timeZone={content.timezone} />
              <RsvpDemo character={character} accent={accent} onCelebrate={() => setBurst((b) => b + 1)} />
            </div>
          }
        />
      </div>
    </>
  );
}
