import type { InvitationContent } from "@/components/invitation/invitation-view";

/**
 * Dados FICTÍCIOS usados nas demonstrações e capas. Nunca vêm do banco de clientes.
 * Data fixa: evita leitura do relógio na renderização (mantém as páginas pré-renderizáveis).
 */
const DEMO_DATE = "2027-04-17";

const base: InvitationContent = {
  event_time: "16:00",
  timezone: "America/Sao_Paulo",
  venue_name: "Casa Jardim",
  address: "Rua das Acácias, 120 — São Paulo",
  map_url: "https://maps.example.com/demo",
};

const BY_CATEGORY: Record<string, InvitationContent> = {
  "aniversario-infantil": { title: "Aniversário", honoree_name: "Helena", age: "5", message: "Venha brincar e celebrar com a gente!" },
  "aniversario-adulto": { title: "Celebração", honoree_name: "Marina", age: "40", message: "Uma noite para brindar novos começos." },
  casamento: { title: "Casamento", honoree_name: "Clara & Rafael", event_time: "17:30", venue_name: "Capela do Bosque", message: "Com alegria, convidamos você para celebrar o nosso sim." },
  "cha-de-bebe": { title: "Chá de bebê", honoree_name: "Theo", message: "Estamos contando os dias para conhecer o Theo." },
  "cha-revelacao": { title: "Chá revelação", honoree_name: "Ana & Pedro", message: "Menino ou menina? Venha descobrir com a gente!" },
  batizado: { title: "Batizado", honoree_name: "Lucas", event_time: "10:00", venue_name: "Paróquia São José", message: "Será uma alegria ter você neste dia." },
  formatura: { title: "Formatura", honoree_name: "Beatriz Lima", event_time: "21:00", venue_name: "Espaço Aurora", message: "Celebre esta conquista comigo." },
  "15-anos": { title: "Meus 15 anos", honoree_name: "Sofia", event_time: "20:00", venue_name: "Salão Lumière", message: "Uma noite para guardar para sempre." },
  corporativo: { title: "Encontro anual", honoree_name: "Empresa Exemplo", event_time: "09:00", venue_name: "Centro de Convenções", message: "Programação completa e credenciamento a partir das 8h30." },
  "datas-comemorativas": { title: "Ceia de fim de ano", honoree_name: "Família Souza", event_time: "20:00", message: "Traga seu prato preferido e muita alegria." },
  outros: { title: "Encontro", honoree_name: "Amigos de sempre", message: "Um dia simples, especial pela companhia." },
};

// Nomes variados para as capas infantis não ficarem todas iguais.
const KID_NAMES = ["Helena", "Miguel", "Alice", "Gael", "Laura", "Davi", "Cecília", "Theo", "Maria Luísa", "Bento"];

function hash(s: string) {
  let h = 0;
  for (const ch of s) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return h;
}

export function demoContent(categorySlug: string, templateSlug?: string): InvitationContent {
  const c: InvitationContent = { ...base, event_date: DEMO_DATE, ...(BY_CATEGORY[categorySlug] ?? BY_CATEGORY.outros) };
  if (templateSlug && (categorySlug === "aniversario-infantil" || categorySlug === "cha-de-bebe" || categorySlug === "batizado")) {
    const h = hash(templateSlug);
    c.honoree_name = KID_NAMES[h % KID_NAMES.length];
    if (categorySlug === "aniversario-infantil") c.age = String(1 + (h % 9));
  }
  return c;
}
