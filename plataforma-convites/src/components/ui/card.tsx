import { cn } from "@/lib/cn";
import type { HTMLAttributes } from "react";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("rounded-lg border-2 border-line bg-card shadow-soft", className)} {...props} />;
}

export function Badge({ className, tone = "neutral", ...props }: HTMLAttributes<HTMLSpanElement> & { tone?: "neutral" | "sage" | "rose" }) {
  const tones = {
    neutral: "bg-white text-ink-soft border-line",
    sage: "bg-mint-soft text-green-ink border-mint-soft",
    rose: "bg-pink-soft text-pink-ink border-pink-soft",
  };
  return <span className={cn("inline-flex items-center rounded-full border px-3 py-1 text-xs font-bold", tones[tone], className)} {...props} />;
}

export function Container({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8", className)} {...props} />;
}
