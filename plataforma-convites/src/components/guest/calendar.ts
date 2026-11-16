"use client";

import type { InvitationContent } from "@/components/invitation/invitation-view";
import { localToUtc } from "@/lib/domain/expiration";
import { buildIcs } from "@/lib/domain/ics";

/** Baixa um .ics com os dados do convite (o celular oferece "Adicionar à agenda"). */
export function downloadIcs(c: InvitationContent) {
  if (!c.event_date || !c.event_time) return;
  const start = localToUtc(c.event_date, c.event_time, c.timezone || "America/Sao_Paulo");
  const ics = buildIcs({
    uid: `${crypto.randomUUID()}@festanolink`,
    title: [c.title, c.honoree_name].filter(Boolean).join(" · ") || "Festa",
    start,
    location: [c.venue_name, c.address, c.address_extra].filter(Boolean).join(", "),
    description: c.message ?? "",
  });
  const url = URL.createObjectURL(new Blob([ics], { type: "text/calendar;charset=utf-8" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = "convite.ics";
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
