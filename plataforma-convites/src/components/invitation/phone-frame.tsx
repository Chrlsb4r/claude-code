import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/** Moldura de celular para exibir o convite na versão mobile. */
export function PhoneFrame({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("relative mx-auto w-full max-w-[320px] rounded-[44px] bg-ink p-[10px] shadow-lift", className)}>
      <div className="absolute left-1/2 top-[18px] z-10 h-[22px] w-[84px] -translate-x-1/2 rounded-full bg-black" aria-hidden />
      <div className="aspect-[9/19] overflow-y-auto overflow-x-hidden rounded-[34px] bg-cream [scrollbar-width:none]">{children}</div>
    </div>
  );
}
