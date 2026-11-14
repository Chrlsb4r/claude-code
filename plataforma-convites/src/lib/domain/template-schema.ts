import { z } from "zod";
import { isValidTimeZone } from "./expiration";

/**
 * Definição de campo editável de um template (espelha public.template_fields).
 * Tudo que o cliente pode alterar é descrito aqui: não há HTML/CSS livre.
 */
export const fieldTypeSchema = z.enum([
  "text", "textarea", "date", "time", "timezone", "number", "url", "select", "color", "font", "image",
]);

export const fieldDefinitionSchema = z.object({
  key: z.string().regex(/^[a-z][a-z0-9_]{1,40}$/),
  type: fieldTypeSchema,
  label: z.string().min(1).max(80),
  step: z.string().regex(/^[a-z_]{2,30}$/).default("basico"),
  required: z.boolean().default(false),
  max_length: z.number().int().min(1).max(2000).nullish(),
  options: z
    .object({
      choices: z.array(z.string().min(1).max(80)).max(50).optional(),
      min: z.number().optional(),
      max: z.number().optional(),
      placeholder: z.string().max(120).optional(),
    })
    .default({}),
  sort_order: z.number().int().default(0),
});
export type FieldDefinition = z.infer<typeof fieldDefinitionSchema>;

const DEFAULT_MAX = { text: 120, textarea: 1000, url: 500 } as const;
// Caminho de objeto no bucket privado de uploads do próprio usuário: <uuid>/<uuid>.<ext>
const IMAGE_PATH_RE = /^[0-9a-f-]{36}\/[0-9a-f-]{36}\.(jpg|jpeg|png|webp)$/;

function fieldValueSchema(f: FieldDefinition): z.ZodType<string> {
  const choices = f.options.choices ?? [];
  switch (f.type) {
    case "text":
    case "textarea":
      return z.string().trim().max(f.max_length ?? DEFAULT_MAX[f.type]);
    case "date":
      return z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Data inválida");
    case "time":
      return z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Horário inválido");
    case "timezone":
      return z.string().refine(isValidTimeZone, "Fuso horário inválido");
    case "number": {
      const min = f.options.min ?? 0;
      const max = f.options.max ?? 999;
      return z.string().regex(/^\d{1,4}$/, "Número inválido").refine((v) => {
        const n = Number(v);
        return n >= min && n <= max;
      }, `Use um valor entre ${min} e ${max}`);
    }
    case "url":
      return z
        .string()
        .trim()
        .max(f.max_length ?? DEFAULT_MAX.url)
        .refine((v) => {
          try {
            return new URL(v).protocol === "https:";
          } catch {
            return false;
          }
        }, "Use um link https:// válido");
    case "select":
    case "color":
    case "font":
      // Apenas opções autorizadas pelo template.
      return z.string().refine((v) => choices.includes(v), "Opção não permitida");
    case "image":
      return z.string().regex(IMAGE_PATH_RE, "Imagem inválida");
  }
}

/** Monta o validador da personalização a partir dos campos da versão do template. */
export function buildCustomizationSchema(fields: FieldDefinition[], opts: { partial?: boolean } = {}) {
  const shape: Record<string, z.ZodType> = {};
  for (const f of fields) {
    const base = fieldValueSchema(f);
    shape[f.key] =
      f.required && !opts.partial
        ? base.refine((v) => v.trim().length > 0, `${f.label} é obrigatório`)
        : z.union([z.literal(""), base]).optional();
  }
  // strict: chaves desconhecidas são rejeitadas (nada além do esquema chega ao banco).
  return z.object(shape).strict();
}
