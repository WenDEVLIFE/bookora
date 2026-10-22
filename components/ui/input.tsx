import {
  forwardRef,
  type InputHTMLAttributes,
} from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  invalid?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  function Input({ className, invalid = false, ...props }, ref) {
    return (
      <input
        ref={ref}
        className={cn(
          "h-10 w-full rounded-input border border-line bg-input px-3 text-[15px] text-ink transition-colors placeholder:text-ink-muted aria-invalid:border-danger focus:border-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-soft/40 disabled:cursor-not-allowed disabled:opacity-60",
          invalid && "border-danger focus:border-danger focus-visible:ring-danger/30",
          className,
        )}
        aria-invalid={invalid || undefined}
        {...props}
      />
    );
  },
);

