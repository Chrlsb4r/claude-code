import type { FieldDefinition } from "@/lib/domain/template-schema";

export type Ref = { slug: string; name: string };
export type TemplateCard = {
  slug: string;
  name: string;
  description: string | null;
  style: string | null;
  is_featured: boolean;
  category: Ref;
  theme: Ref | null;
  price_cents: number;
  currency: string;
  features: string[];
  layout: { variant?: string };
};
export type TemplateDetail = TemplateCard & {
  version: number;
  style_options: { palettes?: string[]; fonts?: string[] };
  fields: FieldDefinition[];
};
export type Category = Ref & { description: string | null; template_count: number };
export type Facets = { themes: Ref[]; styles: string[]; features: string[]; price: { min: number; max: number } };
export type SearchResult = { total: number; items: TemplateCard[] };
