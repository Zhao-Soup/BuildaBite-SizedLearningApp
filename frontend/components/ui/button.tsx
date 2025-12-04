import * as React from "react";
import { clsx } from "clsx";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost";
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", ...props }, ref) => {
    const base =
      "inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:opacity-50 disabled:pointer-events-none";
    const variants: Record<NonNullable<ButtonProps["variant"]>, string> = {
      primary: "bg-accent text-black hover:bg-cyan-400",
      secondary: "bg-muted text-foreground hover:bg-slate-700",
      ghost: "bg-transparent text-foreground hover:bg-slate-800"
    };

    return (
      <button
        ref={ref}
        className={clsx(base, variants[variant], className)}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";



