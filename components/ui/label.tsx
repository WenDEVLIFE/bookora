import {
  type LabelHTMLAttributes,
  type ReactNode,
} from "react";
import { cn } from "@/lib/utils";

export interface LabelProps
  extends LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean;
  children: ReactNode;
}

export function Label({
  required = false,
  className,
  children,
  ...props
}: LabelProps) {
  return (
    <label
      className={cn("label-text inline-flex items-center gap-1", className)}
      {...props}
    >
      {children}
      {required ? (
        <span className="text-brand-soft" aria-hidden="true">
          *
        </span>
      ) : null}
    </label>
  );
}
