import {
  forwardRef,
  type TextareaHTMLAttributes,
} from "react";
import { cn } from "@/lib/utils";

export interface TextareaProps
  extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  invalid?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  function Textarea({ className, invalid = false, ...props }, ref) {
    return (
      <textarea
        ref={ref}
        className={cn(
          "min-h-[120px] w-full resize-y rounded-input border border-line bg-input px-3 py-2.5 text-[15px] leading-relaxed text-ink transition-colors placeholder:text-ink-muted aria-invalid:border-danger focus:border-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-soft/40 disabled:cursor-not-allowed disabled:opacity-60",
          invalid && "border-danger focus:border-danger focus-visible:ring-danger/30",
          className,
        )}
        aria-invalid={invalid || undefined}
        {...props}
      />
    );
  },
);

