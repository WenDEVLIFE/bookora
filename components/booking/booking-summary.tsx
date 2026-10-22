import type { ReactNode } from "react";
import {
  CalendarMarkIcon,
  ClockCircleIcon,
  ClockSquareIcon,
  TagPriceIcon,
  UserRoundedIcon,
} from "@/components/icons";
import { CATEGORY_META } from "@/components/services/category-meta";
import { Avatar } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  formatDateLong,
  formatDuration,
  formatPrice,
  formatTime,
} from "@/lib/date";
import type { Service, StaffMember } from "@/lib/types";
import type { CustomerDraft } from "@/components/booking/booking-types";
import { cn } from "@/lib/utils";

export interface BookingSummaryProps {
  service?: Service;
  staffName?: string | null;
  staff?: StaffMember | null;
  dateKey?: string | null;
  startAt?: string | null;
  customer?: CustomerDraft;
  notes?: string;
  showCustomer?: boolean;
  className?: string;
}

function SummaryRow({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <dt className="inline-flex items-center gap-2 text-caption text-ink-muted">
        <span className="text-ink-muted" aria-hidden="true">
          {icon}
        </span>
        {label}
      </dt>
      <dd className="min-w-0 text-right text-sm font-medium text-ink">
        {value}
      </dd>
    </div>
  );
}

export function BookingSummary({
  service,
  staffName,
  staff,
  dateKey,
  startAt,
  customer,
  notes,
  showCustomer = false,
  className,
}: BookingSummaryProps) {
  const categoryMeta = service ? CATEGORY_META[service.category] : null;
  const CategoryIcon = categoryMeta?.icon ?? null;
  const dateLabel = startAt
    ? formatDateLong(startAt, { year: true })
    : dateKey
      ? formatDateLong(dateKey, { year: true })
      : "Not selected";
  const timeLabel = startAt ? formatTime(startAt) : "Not selected";
  const customerName = customer?.name.trim() ?? "";
  const customerEmail = customer?.email.trim() ?? "";
  const customerPhone = customer?.phone.trim() ?? "";
  const hasCustomer = Boolean(customerName || customerEmail || customerPhone);
  const trimmedNotes = notes?.trim() ?? "";

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="flex-row items-center justify-between gap-3 border-b border-line-subtle pb-4">
        <div>
          <p className="text-caption font-medium uppercase tracking-[0.16em] text-ink-muted">
            Appointment summary
          </p>
          <h3 className="heading-card mt-1 text-ink">Your booking</h3>
        </div>
        <span className="flex h-10 w-10 items-center justify-center rounded-input border border-brand/20 bg-brand-tint text-brand-soft">
          <CalendarMarkIcon size={20} aria-hidden="true" />
        </span>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex items-start gap-3">
          <span
            className={cn(
              "flex h-11 w-11 shrink-0 items-center justify-center rounded-input border border-white/10",
              categoryMeta?.tileClassName ?? "bg-elevated",
            )}
          >
            {CategoryIcon ? (
              <CategoryIcon
                size={22}
                aria-hidden="true"
                className={categoryMeta?.accentClassName ?? "text-ink-muted"}
              />
            ) : null}
          </span>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-ink">
              {service?.name ?? "Choose a service"}
            </p>
            <p className="mt-0.5 text-caption text-ink-muted">
              {service
                ? `${service.category} · ${formatDuration(
                    service.durationMinutes,
                  )} · ${formatPrice(service.price)}`
                : "No service selected yet"}
            </p>
          </div>
        </div>

        <dl className="space-y-3 border-t border-line-subtle pt-4">
          <SummaryRow
            icon={<UserRoundedIcon size={15} aria-hidden="true" />}
            label="Professional"
            value={
              <span className="inline-flex items-center justify-end gap-2">
                {staff ? (
                  <Avatar name={staff.name} size="sm" className="h-6 w-6" />
                ) : null}
                {staffName || "Not selected"}
              </span>
            }
          />
          <SummaryRow
            icon={<CalendarMarkIcon size={15} aria-hidden="true" />}
            label="Date"
            value={dateLabel}
          />
          <SummaryRow
            icon={<ClockCircleIcon size={15} aria-hidden="true" />}
            label="Time"
            value={timeLabel}
          />
          <SummaryRow
            icon={<ClockSquareIcon size={15} aria-hidden="true" />}
            label="Duration"
            value={service ? formatDuration(service.durationMinutes) : "Not selected"}
          />
          <SummaryRow
            icon={<TagPriceIcon size={15} aria-hidden="true" />}
            label="Price"
            value={service ? formatPrice(service.price) : "Not selected"}
          />
        </dl>

        {showCustomer && hasCustomer ? (
          <div className="border-t border-line-subtle pt-4">
            <p className="text-caption font-medium uppercase tracking-[0.16em] text-ink-muted">
              Customer
            </p>
            <dl className="mt-2 space-y-1.5 text-sm">
              {customerName ? (
                <div className="flex items-start justify-between gap-4">
                  <dt className="text-ink-muted">Name</dt>
                  <dd className="text-right font-medium text-ink">
                    {customerName}
                  </dd>
                </div>
              ) : null}
              {customerEmail ? (
                <div className="flex items-start justify-between gap-4">
                  <dt className="text-ink-muted">Email</dt>
                  <dd className="break-all text-right font-medium text-ink">
                    {customerEmail}
                  </dd>
                </div>
              ) : null}
              {customerPhone ? (
                <div className="flex items-start justify-between gap-4">
                  <dt className="text-ink-muted">Phone</dt>
                  <dd className="text-right font-medium tabular-nums text-ink">
                    {customerPhone}
                  </dd>
                </div>
              ) : null}
            </dl>
          </div>
        ) : null}

        {trimmedNotes ? (
          <div className="border-t border-line-subtle pt-4">
            <p className="text-caption font-medium uppercase tracking-[0.16em] text-ink-muted">
              Notes
            </p>
            <p className="support-text mt-1.5 whitespace-pre-line text-ink-secondary">
              {trimmedNotes}
            </p>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
