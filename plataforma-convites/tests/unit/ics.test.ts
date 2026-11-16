import { describe, expect, it } from "vitest";
import { buildIcs, icsDate, icsEscape } from "@/lib/domain/ics";
import { localToUtc } from "@/lib/domain/expiration";

describe("arquivo de agenda (.ics)", () => {
  const start = localToUtc("2026-12-20", "15:00", "America/Sao_Paulo");
  const ics = buildIcs({
    uid: "abc@festa",
    title: "Aniversário da Helena",
    start,
    location: "Casa Jardim, Rua das Flores; 100",
    description: "Venha brincar!\nTraga roupa de banho.",
    url: "https://exemplo.com/c/helena",
    now: new Date("2026-11-16T12:00:00Z"),
  });

  it("usa horário UTC correto e duração padrão de 4h", () => {
    expect(icsDate(start)).toBe("20261220T180000Z");
    expect(ics).toContain("DTSTART:20261220T180000Z");
    expect(ics).toContain("DTEND:20261220T220000Z");
  });

  it("escapa vírgula, ponto e vírgula e quebras de linha", () => {
    expect(icsEscape("a,b;c\nd\\e")).toBe("a\\,b\\;c\\nd\\\\e");
    expect(ics).toContain("LOCATION:Casa Jardim\\, Rua das Flores\\; 100");
    expect(ics).toContain("Venha brincar!\\nTraga roupa de banho.");
  });

  it("tem estrutura válida com CRLF, lembrete de 1 dia e linhas dobradas", () => {
    expect(ics.startsWith("BEGIN:VCALENDAR\r\n")).toBe(true);
    expect(ics.trimEnd().endsWith("END:VCALENDAR")).toBe(true);
    expect(ics).toContain("TRIGGER:-P1D");
    for (const line of ics.split("\r\n")) expect(new TextEncoder().encode(line).length).toBeLessThanOrEqual(75);
  });

  it("ignora URL que não seja https e impede injeção de propriedades", () => {
    const bad = buildIcs({ uid: "x", title: "Festa\r\nATTENDEE:mailto:x@y", start, url: "javascript:alert(1)" });
    expect(bad).not.toContain("URL:");
    expect(bad).not.toMatch(/\r\nATTENDEE:/);
  });
});
