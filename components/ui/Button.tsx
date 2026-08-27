import Link from "next/link";
import type { ComponentProps } from "react";

const styles = {
  primary: "bg-brand-700 text-white hover:bg-brand-800 shadow-soft",
  secondary: "bg-white text-ink-800 border border-ink-200 hover:border-brand-400 hover:text-brand-700",
  ghost: "text-brand-700 hover:bg-brand-50",
  whatsapp: "bg-[#25D366] text-white hover:bg-[#1da851] shadow-soft",
} as const;

const sizes = {
  md: "px-5 py-2.5 text-sm",
  lg: "px-6 py-3.5 text-base",
} as const;

type Variant = keyof typeof styles;
type Size = keyof typeof sizes;

const base =
  "inline-flex items-center justify-center gap-2 rounded-xl font-bold transition-colors disabled:opacity-50";

export function Button({
  variant = "primary",
  size = "md",
  className = "",
  ...props
}: ComponentProps<"button"> & { variant?: Variant; size?: Size }) {
  return <button className={`${base} ${styles[variant]} ${sizes[size]} ${className}`} {...props} />;
}

export function ButtonLink({
  variant = "primary",
  size = "md",
  className = "",
  ...props
}: ComponentProps<typeof Link> & { variant?: Variant; size?: Size }) {
  return <Link className={`${base} ${styles[variant]} ${sizes[size]} ${className}`} {...props} />;
}
