"use client";

import { useMemo } from "react";
import { CalendarSearchIcon } from "@/components/icons";
import { getDateCardParts } from "@/components/booking/booking-types";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import {
  addDaysToKey,
  formatDateLong,
  getAvailableSlots,
  getNextAvailableDate,
  toDateKey,
} from "@/lib/availability";
import { BUSINESS } from "@/lib/constants";
import type { Booking, Service, StaffMember } from "@/lib/types";
import { cn } from "@/lib/utils";

export interface StepDateProps {
  service: Service;
  staffId: string;
  staff: StaffMember[];
  bookings: Booking[];
  now: Date;
  selectedDateKey: string | null;
  onSelectDate: (dateKey: string) => void;
  onGoToServices: () => void;
}

interface DateOption {
  dateKey: string;
  count: number;
}

export function StepDate({
  service,
  staffId,
  staff,
  bookings,
  now,
  selectedDateKey,
  onSelectDate,
  onGoToServices,
}: StepDateProps) {
  const todayKey = toDateKey(now);

  const options = useMemo<DateOption[]>(() => {
    return Array.from({ length: BUSINESS.horizonDays }, (_, index) => {
      const dateKey = addDaysToKey(todayKey, index);

      if (!dateKey) {
        return { dateKey: "", count: 0 };
      }

      const count = getAvailableSlots({
        dateKey,
        service,
        staffId,
        staff,
        bookings,
        now,
      }).length;

      return { dateKey, count };
    }).filter((option) => option.dateKey.length > 0);
  }, [bookings, now, service, staff, staffId, todayKey]);

  const nextAvailable = useMemo(
    () =>
      getNextAvailableDate({
        service,
        staffId,
        staff,
        bookings,
        horizonDays: BUSINESS.horizonDays,
        now,
      }),
    [bookings, now, service, staff, staffId],
  );

  const availableDays = options.filter((option) => option.count > 0).length;

  if (availableDays === 0) {
    return (
      <EmptyState
        icon={<CalendarSearchIcon size={22} aria-hidden="true" />}
        title="No availability in the next 30 days"
        description="This professional has no open times for this service. Try another professional or service."
        action={
          <div className="flex flex-wrap items-center justify-center gap-2">
            <Button variant="secondary" onClick={onGoToServices}>
              Browse services
            </Button>
          </div>
        }
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p aria-live="polite" className="text-caption text-ink-muted">
          {availableDays} {availableDays === 1 ? "day" : "days"} with openings in
          the next {BUSINESS.horizonDays} days
        </p>
        {nextAvailable ? (
          <Button
            variant="secondary"
            size="sm"
            leftIcon={<CalendarSearchIcon size={16} aria-hidden="true" />}
            onClick={() => onSelectDate(nextAvailable)}
          >
            Next available
          </Button>
        ) : null}
      </div>

      <ul className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-4 xl:grid-cols-5">
        {options.map((option) => {
          const parts = getDateCardParts(option.dateKey);
          const isSelected = option.dateKey === selectedDateKey;
          const isFull = option.count === 0;

          return (
            <li key={option.dateKey}>
              <button
                type="button"
                aria-pressed={isSelected}
                aria-label={`${formatDateLong(option.dateKey, {
                  year: true,
                })}: ${
                  isFull
                    ? "no availability"
                    : `${option.count} ${
                        option.count === 1 ? "slot" : "slots"
                      } available`
                }`}
                disabled={isFull}
                onClick={() => onSelectDate(option.dateKey)}
                className={cn(
                  "flex min-h-[76px] w-full flex-col items-center justify-center rounded-input border px-2 py-2 text-center transition-colors",
                  isSelected
                    ? "border-brand bg-brand-tint text-brand-soft ring-1 ring-brand"
                    : isFull
                      ? "cursor-not-allowed border-line-subtle bg-surface/40 text-ink-muted opacity-60"
                      : "border-line bg-card text-ink hover:border-line-strong hover:bg-elevated",
                )}
              >
                <span className="text-[11px] font-medium uppercase tracking-[0.12em] text-ink-muted">
                  {parts.weekday}
                </span>
                <span className="mt-0.5 text-lg font-semibold tabular-nums leading-none">
                  {parts.day}
                </span>
                <span className="mt-0.5 text-[11px] text-ink-muted">
                  {parts.month}
                </span>
                <span
                  className={cn(
                    "mt-1 text-[10px] font-medium",
                    isFull
                      ? "text-ink-muted"
                      : isSelected
                        ? "text-brand-soft"
                        : "text-success",
                  )}
                >
                  {isFull
                    ? "Full"
                    : `${option.count} ${
                        option.count === 1 ? "slot" : "slots"
                      }`}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
