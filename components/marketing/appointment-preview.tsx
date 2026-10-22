import {
  CalendarMarkIcon,
  ClockCircleIcon,
  UserRoundedIcon,
} from "@/components/icons";
import { CATEGORY_META } from "@/components/services/category-meta";
import { StatusBadge } from "@/components/ui/badge";
import { formatDuration, formatPrice } from "@/lib/date";
import { SEED_SERVICES, SEED_STAFF } from "@/lib/seed";
import { cn } from "@/lib/utils";

const PREVIEW_SERVICE = SEED_SERVICES[0];
const PREVIEW_SPECIALIST = SEED_STAFF[0];

export function AppointmentPreview() {
  const meta = CATEGORY_META[PREVIEW_SERVICE.category];
  const CategoryIcon = meta.icon;

  return (
    <div className="relative mx-auto w-full max-w-md">
      <div
        aria-hidden="true"
        className="absolute -inset-8 rounded-[2.5rem] bg-brand/10 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="absolute inset-x-6 -bottom-4 top-10 rounded-panel border border-line-subtle bg-surface/70"
      />

      <div className="relative rounded-panel border border-line-strong bg-card p-5 shadow-[0_28px_80px_-36px_rgba(139,92,246,0.55)] sm:p-6">
        <div className="flex items-center justify-between gap-3">
          <p className="text-caption font-medium uppercase tracking-[0.18em] text-ink-muted">
            Appointment
          </p>
          <StatusBadge status="confirmed" />
        </div>

        <div className="mt-5 flex items-start gap-3.5">
          <span
            className={cn(
              "flex h-12 w-12 shrink-0 items-center justify-center rounded-input border border-white/10",
              meta.tileClassName,
            )}
          >
            <CategoryIcon
              size={24}
              aria-hidden="true"
              className={meta.accentClassName}
            />
          </span>
          <div className="min-w-0">
            <p className="text-base font-semibold text-ink">
              {PREVIEW_SERVICE.name}
            </p>
            <p className="support-text mt-0.5">
              {PREVIEW_SERVICE.category} ·{" "}
              {formatDuration(PREVIEW_SERVICE.durationMinutes)}
            </p>
          </div>
        </div>

        <dl className="mt-6 space-y-3 border-t border-line-subtle pt-5">
          <div className="flex items-center justify-between gap-4">
            <dt className="inline-flex items-center gap-2 text-sm text-ink-muted">
              <UserRoundedIcon size={17} aria-hidden="true" />
              Specialist
            </dt>
            <dd className="text-sm font-medium text-ink">
              {PREVIEW_SPECIALIST.name}
            </dd>
          </div>
          <div className="flex items-center justify-between gap-4">
            <dt className="inline-flex items-center gap-2 text-sm text-ink-muted">
              <CalendarMarkIcon size={17} aria-hidden="true" />
              Date
            </dt>
            <dd className="text-sm font-medium text-ink">Sat, Oct 24</dd>
          </div>
          <div className="flex items-center justify-between gap-4">
            <dt className="inline-flex items-center gap-2 text-sm text-ink-muted">
              <ClockCircleIcon size={17} aria-hidden="true" />
              Time
            </dt>
            <dd className="text-sm font-medium text-ink">10:00 AM</dd>
          </div>
        </dl>

        <div className="mt-5 flex items-end justify-between gap-4 rounded-card border border-line-subtle bg-input/60 p-4">
          <div>
            <p className="text-caption text-ink-muted">Total</p>
            <p className="mt-0.5 text-xl font-semibold tabular-nums text-ink">
              {formatPrice(PREVIEW_SERVICE.price)}
            </p>
          </div>
          <p className="text-caption text-ink-muted">
            {formatDuration(PREVIEW_SERVICE.durationMinutes)}
          </p>
        </div>

        <div className="mt-4 flex items-center gap-2 text-caption text-ink-muted">
          <span
            className="h-1.5 w-1.5 rounded-full bg-success"
            aria-hidden="true"
          />
          Preview of a confirmed demo appointment.
        </div>
      </div>
    </div>
  );
}
