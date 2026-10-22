import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Spinner } from "@/components/ui/spinner";

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "ghost"
  | "outline"
  | "destructive";

export type ButtonSize = "sm" | "md" | "lg" | "icon";

const BASE_CLASSES =
  "inline-flex items-center justify-center gap-2 rounded-control font-semibold whitespace-nowrap transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-soft focus-visible:ring-offset-2 focus-visible:ring-offset-app disabled:pointer-events-none disabled:border-line disabled:bg-elevated disabled:text-ink-muted";

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary: "bg-brand-hover text-white hover:bg-brand-hover/90",
  secondary:
    "border border-line bg-elevated text-ink hover:border-line-strong hover:bg-elevated",
  ghost: "bg-transparent text-ink-secondary hover:bg-elevated hover:text-ink",
  outline:
    "border border-line bg-transparent text-ink hover:border-line-strong hover:bg-elevated",
  destructive: "bg-danger text-app hover:bg-danger/90",
};

const SIZE_CLASSES: Record<ButtonSize, string> = {
  sm: "h-9 px-3 text-sm",
  md: "h-10 px-4 text-sm",
  lg: "h-12 px-6 text-base",
  icon: "h-11 w-11 p-0",
};

export interface ButtonClassOptions {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
}

export function buttonClasses({
  variant = "primary",
  size = "md",
  className,
}: ButtonClassOptions = {}): string {
  return cn(
    BASE_CLASSES,
    VARIANT_CLASSES[variant],
    SIZE_CLASSES[size],
    className,
  );
}

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    {
      variant = "primary",
      size = "md",
      leftIcon,
      rightIcon,
      loading = false,
      className,
      children,
      disabled,
      type = "button",
      ...props
    },
    ref,
  ) {
    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled || loading}
        aria-busy={loading || undefined}
        className={buttonClasses({ variant, size, className })}
        {...props}
      >
        {loading ? <Spinner size="sm" /> : leftIcon}
        {children}
        {rightIcon}
      </button>
    );
  },
);
