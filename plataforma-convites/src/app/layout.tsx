import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Fredoka, Nunito } from "next/font/google";
import "./globals.css";
import { BRAND } from "@/lib/brand";

const display = Fredoka({ variable: "--font-fredoka", subsets: ["latin"], weight: ["500", "600", "700"], display: "swap" });
// Serifada só para os convites clássicos (casamento, 15 anos...).
const elegant = Cormorant_Garamond({ variable: "--font-elegant", subsets: ["latin"], weight: ["400", "500", "600"], display: "swap" });
const body = Nunito({ variable: "--font-nunito", subsets: ["latin"], weight: ["400", "600", "700", "800"], display: "swap" });

export const metadata: Metadata = {
  title: { default: `${BRAND} — convites animados`, template: `%s · ${BRAND}` },
  description: "Convites digitais animados e personalizados, com confirmação de presença online. A partir de R$ 29,90.",
};

export const viewport: Viewport = { themeColor: "#fff8ee", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR" className={`${display.variable} ${body.variable} ${elegant.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <a href="#conteudo" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-card focus:px-4 focus:py-2">
          Pular para o conteúdo
        </a>
        {children}
      </body>
    </html>
  );
}
