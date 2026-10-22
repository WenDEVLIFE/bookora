import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface PageHeaderProps {
  title: string;
  description?: ReactNode;
  eyebrow?: string;
  breadcrumb?: ReactNode;
  actions?: ReactNode;
  className?: string;
}

export function PageHeader({
  title,
  description,
  eyebrow,
  breadcrumb,
  actions,
  className,
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between",
        className,
      )}
    >
      <div className="min-w-0">
        {breadcrumb ? (
          <div className="mb-2 text-caption text-ink-muted">{breadcrumb}</div>
        ) : null}
        {eyebrow ? (
          <p className="label-text uppercase tracking-[0.18em] text-brand-soft">
            {eyebrow}
          </p>
        ) : null}
        <h1 className={cn("heading-page text-ink", eyebrow ? "mt-1" : undefined)}>
          {title}
        </h1>
        {description ? (
          <p className="support-text mt-2 max-w-2xl">{description}</p>
        ) : null}
      </div>
      {actions ? (
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          {actions}
        </div>
      ) : null}
    </div>
  );
}
