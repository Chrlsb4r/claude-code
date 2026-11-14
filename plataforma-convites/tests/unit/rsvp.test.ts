import { describe, expect, it } from "vitest";
import { rsvpInputSchema } from "@/lib/domain/rsvp";

describe("entrada de RSVP", () => {
  it("zera acompanhantes quando o convidado não vai", () => {
    const r = rsvpInputSchema.parse({ name: "Ana", attending: false, companions: 3, companionNames: ["a"] });
    expect(r.companions).toBe(0);
    expect(r.companionNames).toEqual([]);
  });
  it("rejeita mais nomes que acompanhantes e campos extras", () => {
    expect(rsvpInputSchema.safeParse({ name: "Ana", attending: true, companions: 1, companionNames: ["a", "b"] }).success).toBe(false);
    expect(rsvpInputSchema.safeParse({ name: "Ana", attending: true, eventId: "x" }).success).toBe(false);
  });
  it("rejeita quantidade negativa ou acima do teto absoluto", () => {
    expect(rsvpInputSchema.safeParse({ name: "Ana", attending: true, companions: -1 }).success).toBe(false);
    expect(rsvpInputSchema.safeParse({ name: "Ana", attending: true, companions: 50 }).success).toBe(false);
  });
});
