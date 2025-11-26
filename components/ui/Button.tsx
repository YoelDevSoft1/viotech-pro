"use client";

import clsx from "clsx";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "outline" | "ghost";
  size?: "sm" | "md";
};

export function Button({
  children,
  className,
  variant = "primary",
  size = "md",
  ...props
}: ButtonProps) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-full font-medium transition-all disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/50";
  const variants: Record<typeof variant, string> = {
    primary: "bg-foreground text-background hover:scale-[1.02]",
    outline: "border border-border text-foreground hover:bg-muted/40",
    ghost: "text-muted-foreground hover:text-foreground",
  };
  const sizes: Record<typeof size, string> = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-2 text-sm",
  };

  return (
    <button className={clsx(base, variants[variant], sizes[size], className)} {...props}>
      {children}
    </button>
  );
}
