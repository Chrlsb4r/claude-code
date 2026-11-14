import { z } from "zod";

export const rsvpInputSchema = z
  .object({
    name: z.string().trim().min(1, "Informe seu nome").max(120),
    attending: z.boolean(),
    companions: z.number().int().min(0).max(20).default(0),
    companionNames: z.array(z.string().trim().min(1).max(120)).max(20).default([]),
    notes: z.string().trim().max(500).optional().default(""),
    guestToken: z.string().regex(/^[A-Za-z0-9_-]{32}$/).optional(),
    editToken: z.string().regex(/^[A-Za-z0-9_-]{32}$/).optional(),
  })
  .strict()
  .transform((v) => (v.attending ? v : { ...v, companions: 0, companionNames: [] }))
  .refine((v) => v.companionNames.length <= v.companions, {
    message: "Há mais nomes do que acompanhantes",
    path: ["companionNames"],
  });

export type RsvpInput = z.infer<typeof rsvpInputSchema>;

/** Mensagens amigáveis para os códigos de erro levantados pelo banco. */
export const RSVP_ERRORS: Record<string, string> = {
  convite_nao_encontrado: "Convite não encontrado.",
  convite_indisponivel: "Este convite não está disponível.",
  convite_expirado: "Este evento já foi encerrado.",
  rsvp_encerrado: "As confirmações para este evento foram encerradas.",
  muitas_tentativas: "Muitas tentativas. Aguarde alguns minutos e tente novamente.",
  recusa_nao_aceita: "Este convite aceita apenas confirmações de presença.",
  convite_restrito: "Use o link individual que você recebeu para confirmar.",
  link_individual_invalido: "Link de confirmação inválido.",
  acompanhantes_excedidos: "Quantidade de acompanhantes acima do permitido.",
  nomes_acompanhantes: "Informe o nome de cada acompanhante.",
  edicao_nao_permitida: "Este convite não permite alterar respostas.",
  token_edicao_invalido: "Não foi possível localizar sua resposta.",
};
