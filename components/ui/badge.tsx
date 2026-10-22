import { type HTMLAttributes } from "react";
import { BOOKING_STATUS_LABELS } from "@/lib/constants";
import type { BookingStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

export type BadgeVariant =
  | "neutral"
  | "brand"
  | "success"
  | "warning"
  | "danger"
  | "info";

const VARIANT_CLASSES: Record<BadgeVariant, string> = {
  neutral: "border-line bg-elevated text-ink-secondary",
  brand: "border-brand/30 bg-brand-tint text-brand-soft",
  success: "border-success/25 bg-success-bg text-success",
  warning: "border-warning/25 bg-warning-bg text-warning",
  danger: "border-danger/25 bg-danger-bg text-danger",
  info: "border-info/25 bg-info-bg text-info",
};

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  dot?: boolean;
}

export function Badge({
  variant = "neutral",
  dot = false,
  className,
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium leading-5",
        VARIANT_CLASSES[variant],
        className,
      )}
      {...props}
    >
      {dot ? (
        <span
          className="h-1.5 w-1.5 rounded-full bg-current"
          aria-hidden="true"
        />
      ) : null}
      {children}
    </span>
  );
}

const STATUS_VARIANTS: Record<BookingStatus, BadgeVariant> = {
  pending: "warning",
  confirmed: "info",
  completed: "success",
  cancelled: "danger",
};

export interface StatusBadgeProps {
  status: BookingStatus;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <Badge variant={STATUS_VARIANTS[status]} dot className={className}>
      {BOOKING_STATUS_LABELS[status]}
    </Badge>
  );
}
