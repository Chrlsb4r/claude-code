import { describe, expect, it } from "vitest";
import { computeExpiry, isExpired, localToUtc } from "@/lib/domain/expiration";

describe("validade do convite", () => {
  it("exemplo do requisito: 20/12/2026 15h (São Paulo) expira 21/12/2026 15h", () => {
    const start = localToUtc("2026-12-20", "15:00", "America/Sao_Paulo");
    expect(start.toISOString()).toBe("2026-12-20T18:00:00.000Z");
    expect(computeExpiry(start).toISOString()).toBe("2026-12-21T18:00:00.000Z");
  });

  it("é ativo 1 ms antes e expirado exatamente em +24h", () => {
    const start = localToUtc("2026-12-20", "15:00", "America/Sao_Paulo");
    const exp = computeExpiry(start).getTime();
    expect(isExpired(start, new Date(exp - 1))).toBe(false);
    expect(isExpired(start, new Date(exp))).toBe(true);
  });

  it("preserva o fuso do evento (Manaus, UTC-4)", () => {
    expect(localToUtc("2026-12-20", "15:00", "America/Manaus").toISOString()).toBe("2026-12-20T19:00:00.000Z");
  });

  it("soma 24 horas reais mesmo atravessando horário de verão", () => {
    const start = localToUtc("2026-03-07", "12:00", "America/New_York");
    expect(computeExpiry(start).getTime() - start.getTime()).toBe(86400000);
  });

  it("rejeita datas inexistentes, horários e fusos inválidos", () => {
    expect(() => localToUtc("2026-02-31", "10:00", "America/Sao_Paulo")).toThrow("data_ou_hora_invalida");
    expect(() => localToUtc("2026-02-10", "25:00", "America/Sao_Paulo")).toThrow("data_ou_hora_invalida");
    expect(() => localToUtc("2026-02-10", "10:00", "Mars/Olympus")).toThrow("fuso_invalido");
  });
});
