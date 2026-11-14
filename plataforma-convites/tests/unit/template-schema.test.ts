import { describe, expect, it } from "vitest";
import { buildCustomizationSchema, fieldDefinitionSchema } from "@/lib/domain/template-schema";

const fields = [
  { key: "honoree_name", type: "text", label: "Nome", required: true, max_length: 80 },
  { key: "event_date", type: "date", label: "Data", required: true },
  { key: "event_time", type: "time", label: "Horário", required: true },
  { key: "timezone", type: "timezone", label: "Fuso", required: true },
  { key: "map_url", type: "url", label: "Mapa" },
  { key: "palette", type: "color", label: "Paleta", options: { choices: ["champagne", "salvia"] } },
  { key: "age", type: "number", label: "Idade", options: { min: 0, max: 120 } },
].map((f) => fieldDefinitionSchema.parse(f));

const valid = { honoree_name: "Helena", event_date: "2026-12-20", event_time: "15:00", timezone: "America/Sao_Paulo" };

describe("esquema de personalização", () => {
  const schema = buildCustomizationSchema(fields);

  it("aceita dados válidos", () => {
    expect(schema.safeParse({ ...valid, palette: "salvia", age: "7", map_url: "https://maps.example.com/x" }).success).toBe(true);
  });

  it("exige campos obrigatórios", () => {
    expect(schema.safeParse({ ...valid, honoree_name: "  " }).success).toBe(false);
  });

  it("rejeita chaves fora do esquema (sem injeção de componentes/estilos)", () => {
    expect(schema.safeParse({ ...valid, __html: "<script>alert(1)</script>" }).success).toBe(false);
  });

  it("aceita apenas cores/fontes autorizadas", () => {
    expect(schema.safeParse({ ...valid, palette: "#ff0000" }).success).toBe(false);
  });

  it("aceita somente links https", () => {
    expect(schema.safeParse({ ...valid, map_url: "javascript:alert(1)" }).success).toBe(false);
    expect(schema.safeParse({ ...valid, map_url: "http://exemplo.com" }).success).toBe(false);
  });

  it("aplica limites de caracteres e de número", () => {
    expect(schema.safeParse({ ...valid, honoree_name: "x".repeat(81) }).success).toBe(false);
    expect(schema.safeParse({ ...valid, age: "500" }).success).toBe(false);
  });

  it("modo rascunho permite campos obrigatórios vazios", () => {
    expect(buildCustomizationSchema(fields, { partial: true }).safeParse({ honoree_name: "" }).success).toBe(true);
  });
});
