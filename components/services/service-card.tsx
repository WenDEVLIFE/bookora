import Link from "next/link";
import { CalendarAddIcon, ClockCircleIcon } from "@/components/icons";
import { CATEGORY_META } from "@/components/services/category-meta";
import { buttonClasses } from "@/components/ui/button";
import { formatDuration, formatPrice } from "@/lib/date";
import type { Service } from "@/lib/types";
import { cn } from "@/lib/utils";

export interface ServiceCardProps {
  service: Service;
  onDetails?: () => void;
  className?: string;
}

export function ServiceCard({
  service,
  onDetails,
  className,
}: ServiceCardProps) {
  const meta = CATEGORY_META[service.category];
  const CategoryIcon = meta.icon;

  return (
    <article
      className={cn(
        "group flex h-full flex-col rounded-card border border-line bg-card p-5 transition-[transform,border-color] duration-150 hover:-translate-y-0.5 hover:border-line-strong sm:p-6",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <span
          className={cn(
            "flex h-11 w-11 items-center justify-center rounded-input border border-white/10",
            meta.tileClassName,
          )}
        >
          <CategoryIcon
            size={22}
            aria-hidden="true"
            className={meta.accentClassName}
          />
        </span>
        <span className="text-caption font-medium uppercase tracking-[0.16em] text-ink-muted">
          {service.category}
        </span>
      </div>

      <h3 className="heading-card mt-4 text-lg text-ink">{service.name}</h3>
      <p className="support-text mt-2 line-clamp-2 text-ink-secondary">
        {service.description}
      </p>

      <div className="mt-auto pt-5">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
          <span className="text-lg font-semibold tabular-nums text-ink">
            {formatPrice(service.price)}
          </span>
          <span className="inline-flex items-center gap-1.5 text-caption text-ink-muted">
            <ClockCircleIcon size={15} aria-hidden="true" />
            {formatDuration(service.durationMinutes)}
          </span>
        </div>

        <div className="mt-4 flex items-center gap-2">
          <Link
            href={`/book?service=${encodeURIComponent(service.id)}`}
            aria-label={`Book ${service.name}`}
            className={buttonClasses({
              variant: "secondary",
              size: "sm",
              className: "min-h-11 flex-1",
            })}
          >
            <CalendarAddIcon size={16} aria-hidden="true" />
            Book
          </Link>
          {onDetails ? (
            <button
              type="button"
              onClick={onDetails}
              aria-label={`Details for ${service.name}`}
              className={buttonClasses({
                variant: "ghost",
                size: "sm",
                className: "min-h-11",
              })}
            >
              Details
            </button>
          ) : null}
        </div>
      </div>
    </article>
  );
}
