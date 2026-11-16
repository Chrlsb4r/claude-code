const brl = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
export const formatPrice = (cents: number) => brl.format(cents / 100);

export const FEATURE_LABELS: Record<string, string> = {
  animacao: "Personagem animado",
  rsvp: "Confirmação de presença",
  mapa: "Mapa e localização",
  contagem_regressiva: "Contagem regressiva",
  links_individuais: "Links individuais",
  lista_de_presentes: "Lista de presentes",
  programacao: "Programação",
};
export const featureLabel = (f: string) => FEATURE_LABELS[f] ?? f.replace(/_/g, " ");
