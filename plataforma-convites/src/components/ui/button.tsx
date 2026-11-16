import { cn } from "@/lib/cn";
import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "ghost";
type Size = "md" | "lg";

// Botões "3D" brincalhões: sombra sólida embaixo que afunda ao clicar.
const variants: Record<Variant, string> = {
  primary: "bg-brand text-white shadow-[0_5px_0_var(--brand-dark)] hover:-translate-y-0.5 hover:shadow-[0_7px_0_var(--brand-dark)] active:translate-y-1 active:shadow-[0_1px_0_var(--brand-dark)]",
  secondary: "bg-white text-ink border-2 border-ink shadow-[0_5px_0_var(--ink)] hover:-translate-y-0.5 hover:shadow-[0_7px_0_var(--ink)] active:translate-y-1 active:shadow-[0_1px_0_var(--ink)]",
  ghost: "text-ink hover:bg-pink-soft",
};
const sizes: Record<Size, string> = {
  md: "h-11 px-5 text-sm",
  lg: "h-14 px-8 text-lg",
};

export function buttonClasses(variant: Variant = "primary", size: Size = "md", className?: string) {
  return cn(
    "inline-flex items-center justify-center gap-2 rounded-full font-display font-semibold tracking-wide",
    "transition-[background-color,border-color,transform,box-shadow] duration-200 ease-premium",
    "disabled:pointer-events-none disabled:opacity-50",
    variants[variant],
    sizes[size],
    className,
  );
}

export function Button({
  variant = "primary",
  size = "md",
  className,
  type = "button",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: Size }) {
  return <button type={type} className={buttonClasses(variant, size, className)} {...props} />;
}
