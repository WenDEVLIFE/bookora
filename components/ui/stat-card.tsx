import { type ReactNode } from "react";
import {
  AltArrowDownIcon,
  AltArrowUpIcon,
  MinusIcon,
} from "@/components/icons";
import { cn } from "@/lib/utils";

export interface StatTrend {
  value: string;
  direction: "up" | "down" | "neutral";
  label?: string;
}

export interface StatCardProps {
  label: string;
  value: ReactNode;
  hint?: string;
  icon?: ReactNode;
  trend?: StatTrend;
  className?: string;
}

const TREND_STYLES: Record<StatTrend["direction"], string> = {
  up: "text-success",
  down: "text-danger",
  neutral: "text-ink-muted",
};

const TREND_ICONS: Record<StatTrend["direction"], ReactNode> = {
  up: <AltArrowUpIcon size={14} aria-hidden="true" />,
  down: <AltArrowDownIcon size={14} aria-hidden="true" />,
  neutral: <MinusIcon size={14} aria-hidden="true" />,
};

export function StatCard({
  label,
  value,
  hint,
  icon,
  trend,
  className,
}: StatCardProps) {
  return (
    <div
      className={cn(
        "rounded-card border border-line bg-card p-5",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="support-text font-medium text-ink-secondary">
            {label}
          </p>
          <p className="metric-value mt-2 text-ink">{value}</p>
        </div>
        {icon ? (
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-control border border-line-subtle bg-elevated text-brand-soft">
            {icon}
          </span>
        ) : null}
      </div>
      {trend || hint ? (
        <div className="mt-3 flex items-center gap-2 text-caption">
          {trend ? (
            <span
              className={cn(
                "inline-flex items-center gap-1 font-medium",
                TREND_STYLES[trend.direction],
              )}
            >
              {TREND_ICONS[trend.direction]}
              {trend.value}
              {trend.label ? (
                <span className="font-normal text-ink-muted">
                  {trend.label}
                </span>
              ) : null}
            </span>
          ) : null}
          {hint ? <span className="text-ink-muted">{hint}</span> : null}
        </div>
      ) : null}
    </div>
  );
}
