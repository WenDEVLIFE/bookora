import { type ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  titleAs?: "h1" | "h2" | "h3";
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  titleAs: Title = "h3",
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-card border border-dashed border-line bg-surface/40 px-6 py-12 text-center",
        className,
      )}
    >
      {icon ? (
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-brand-tint text-brand-soft">
          {icon}
        </div>
      ) : null}
      <Title className="heading-card text-ink">{title}</Title>
      {description ? (
        <p className="support-text mt-1.5 max-w-sm text-ink-secondary">
          {description}
        </p>
      ) : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}
