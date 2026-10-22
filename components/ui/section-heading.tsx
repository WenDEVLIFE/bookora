import { type ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
  align?: "left" | "center";
  as?: "h2" | "h3";
  className?: string;
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  actions,
  align = "left",
  as = "h2",
  className,
}: SectionHeadingProps) {
  const Heading = as;

  return (
    <div
      className={cn(
        "flex flex-col gap-4",
        actions ? "sm:flex-row sm:items-end sm:justify-between" : null,
        className,
      )}
    >
      <div
        className={cn(
          "max-w-2xl",
          align === "center" ? "mx-auto text-center" : null,
        )}
      >
        {eyebrow ? (
          <p className="label-text mb-2 uppercase tracking-[0.18em] text-brand-soft">
            {eyebrow}
          </p>
        ) : null}
        <Heading className="heading-section text-ink">{title}</Heading>
        {description ? (
          <p className="body-text mt-3 text-ink-secondary">{description}</p>
        ) : null}
      </div>
      {actions ? (
        <div className="flex shrink-0 flex-wrap items-center gap-3">
          {actions}
        </div>
      ) : null}
    </div>
  );
}
