import {
  forwardRef,
  type SelectHTMLAttributes,
} from "react";
import { AltArrowDownIcon } from "@/components/icons";
import { cn } from "@/lib/utils";

export interface SelectProps
  extends SelectHTMLAttributes<HTMLSelectElement> {
  invalid?: boolean;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  function Select(
    { className, invalid = false, children, ...props },
    ref,
  ) {
    return (
      <div className="relative w-full">
        <select
          ref={ref}
          className={cn(
            "h-10 w-full appearance-none rounded-input border border-line bg-input px-3 pr-10 text-[15px] text-ink transition-colors aria-invalid:border-danger focus:border-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-soft/40 disabled:cursor-not-allowed disabled:opacity-60",
            invalid &&
              "border-danger focus:border-danger focus-visible:ring-danger/30",
            className,
          )}
          aria-invalid={invalid || undefined}
          {...props}
        >
          {children}
        </select>
        <AltArrowDownIcon
          size={18}
          aria-hidden="true"
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-ink-muted"
        />
      </div>
    );
  },
);

