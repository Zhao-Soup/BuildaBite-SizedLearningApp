import * as React from "react";
import { clsx } from "clsx";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={clsx(
          "flex w-full min-h-[80px] rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-foreground placeholder-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
          className
        )}
        {...props}
      />
    );
  }
);

Textarea.displayName = "Textarea";



