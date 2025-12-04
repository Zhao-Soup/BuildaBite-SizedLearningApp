import * as React from "react";
import { clsx } from "clsx";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={clsx(
          "flex h-10 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-foreground placeholder-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
          className
        )}
        {...props}
      />
    );
  }
);

Input.displayName = "Input";



