import { CheckIcon, ClockCircleIcon } from "@/components/icons";
import { CATEGORY_META } from "@/components/services/category-meta";
import { EmptyState } from "@/components/ui/empty-state";
import { formatDuration, formatPrice } from "@/lib/date";
import type { Service } from "@/lib/types";
import { cn } from "@/lib/utils";

export interface StepServiceProps {
  services: Service[];
  selectedServiceId: string | null;
  onSelectService: (serviceId: string) => void;
}

export function StepService({
  services,
  selectedServiceId,
  onSelectService,
}: StepServiceProps) {
  if (services.length === 0) {
    return (
      <EmptyState
        title="No services available"
        description="There are no active services to book right now. Please check back soon."
      />
    );
  }

  return (
    <ul className="grid gap-3 sm:grid-cols-2">
      {services.map((service) => {
        const meta = CATEGORY_META[service.category];
        const CategoryIcon = meta.icon;
        const isSelected = service.id === selectedServiceId;

        return (
          <li key={service.id}>
            <button
              type="button"
              aria-pressed={isSelected}
              onClick={() => onSelectService(service.id)}
              className={cn(
                "group relative flex h-full min-h-11 w-full flex-col rounded-card border p-4 text-left transition-[border-color,background-color,transform] duration-150 sm:p-5",
                isSelected
                  ? "border-brand bg-brand-tint/50 ring-1 ring-brand"
                  : "border-line bg-card hover:-translate-y-0.5 hover:border-line-strong",
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
                <span className="text-caption font-medium uppercase tracking-[0.14em] text-ink-muted">
                  {service.category}
                </span>
              </div>

              <span className="mt-3 block text-base font-semibold text-ink">
                {service.name}
              </span>
              <span className="mt-1 block line-clamp-2 text-caption text-ink-secondary">
                {service.description}
              </span>

              <span className="mt-auto flex items-center gap-4 pt-4">
                <span className="text-base font-semibold tabular-nums text-ink">
                  {formatPrice(service.price)}
                </span>
                <span className="inline-flex items-center gap-1.5 text-caption text-ink-muted">
                  <ClockCircleIcon size={14} aria-hidden="true" />
                  {formatDuration(service.durationMinutes)}
                </span>
              </span>

              {isSelected ? (
                <span className="absolute right-3 top-3 flex h-6 w-6 items-center justify-center rounded-full bg-brand text-white sm:right-4 sm:top-4">
                  <CheckIcon size={14} aria-hidden="true" />
                </span>
              ) : null}
            </button>
          </li>
        );
      })}
    </ul>
  );
}
