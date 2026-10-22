import { type ReactNode } from "react";
import {
  CheckCircleIcon,
  CloseCircleIcon,
  DangerTriangleIcon,
  InfoCircleIcon,
} from "@/components/icons";
import { cn } from "@/lib/utils";

export type AlertVariant = "info" | "success" | "warning" | "danger";

const VARIANT_STYLES: Record<
  AlertVariant,
  { container: string; icon: string; iconNode: ReactNode }
> = {
  info: {
    container: "border-info/30 bg-info-bg/60",
    icon: "text-info",
    iconNode: <InfoCircleIcon size={20} aria-hidden="true" />,
  },
  success: {
    container: "border-success/30 bg-success-bg/60",
    icon: "text-success",
    iconNode: <CheckCircleIcon size={20} aria-hidden="true" />,
  },
  warning: {
    container: "border-warning/30 bg-warning-bg/60",
    icon: "text-warning",
    iconNode: <DangerTriangleIcon size={20} aria-hidden="true" />,
  },
  danger: {
    container: "border-danger/30 bg-danger-bg/60",
    icon: "text-danger",
    iconNode: <CloseCircleIcon size={20} aria-hidden="true" />,
  },
};

export interface AlertProps {
  variant?: AlertVariant;
  title?: string;
  children?: ReactNode;
  className?: string;
}

export function Alert({
  variant = "info",
  title,
  children,
  className,
}: AlertProps) {
  const styles = VARIANT_STYLES[variant];
  const role = variant === "danger" || variant === "warning" ? "alert" : "status";

  return (
    <div
      role={role}
      className={cn(
        "flex gap-3 rounded-card border p-4",
        styles.container,
        className,
      )}
    >
      <span className={cn("mt-0.5 shrink-0", styles.icon)}>
        {styles.iconNode}
      </span>
      <div className="min-w-0 space-y-1">
        {title ? (
          <p className="text-sm font-semibold text-ink">{title}</p>
        ) : null}
        {children ? (
          <div className="text-sm leading-relaxed text-ink-secondary">
            {children}
          </div>
        ) : null}
      </div>
    </div>
  );
}
