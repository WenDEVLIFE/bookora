"use client";

import { useMemo } from "react";
import { CalendarSearchIcon } from "@/components/icons";
import { getBusinessHour } from "@/components/booking/booking-types";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import {
  formatDateLong,
  formatTime,
  getNextAvailableDate,
  type Slot,
} from "@/lib/availability";
import { BUSINESS } from "@/lib/constants";
import type { Booking, Service, StaffMember } from "@/lib/types";
import { cn } from "@/lib/utils";

export interface StepTimeProps {
  service: Service;
  dateKey: string;
  staffId: string;
  staff: StaffMember[];
  bookings: Booking[];
  now: Date;
  slots: Slot[];
  selectedStartAt: string | null;
  onSelectSlot: (startAt: string) => void;
  onChooseAnotherDate: () => void;
  onJumpToDate: (dateKey: string) => void;
}

interface SlotGroup {
  key: "morning" | "afternoon" | "evening";
  label: string;
  slots: Slot[];
}

export function StepTime({
  service,
  dateKey,
  staffId,
  staff,
  bookings,
  now,
  slots,
  selectedStartAt,
  onSelectSlot,
  onChooseAnotherDate,
  onJumpToDate,
}: StepTimeProps) {
  const groups = useMemo<SlotGroup[]>(() => {
    const morning: Slot[] = [];
    const afternoon: Slot[] = [];
    const evening: Slot[] = [];

    for (const slot of slots) {
      const hour = getBusinessHour(slot.startAt);

      if (hour < 12) {
        morning.push(slot);
      } else if (hour < 17) {
        afternoon.push(slot);
      } else {
        evening.push(slot);
      }
    }

    return [
      { key: "morning", label: "Morning", slots: morning },
      { key: "afternoon", label: "Afternoon", slots: afternoon },
      { key: "evening", label: "Evening", slots: evening },
    ].filter((group) => group.slots.length > 0) as SlotGroup[];
  }, [slots]);

  const nextAvailable = useMemo(
    () =>
      getNextAvailableDate({
        service,
        staffId,
        staff,
        bookings,
        fromDateKey: dateKey,
        horizonDays: BUSINESS.horizonDays,
        now,
      }),
    [bookings, dateKey, now, service, staff, staffId],
  );

  if (slots.length === 0) {
    return (
      <EmptyState
        icon={<CalendarSearchIcon size={22} aria-hidden="true" />}
        title="No times available"
        description={`There are no open times on ${formatDateLong(dateKey, {
          year: true,
        })}. Choose another date to keep going.`}
        action={
          <div className="flex flex-wrap items-center justify-center gap-2">
            <Button variant="secondary" onClick={onChooseAnotherDate}>
              Choose another date
            </Button>
            {nextAvailable ? (
              <Button onClick={() => onJumpToDate(nextAvailable)}>
                Next available · {formatDateLong(nextAvailable)}
              </Button>
            ) : null}
          </div>
        }
      />
    );
  }

  return (
    <div className="space-y-5">
      <p aria-live="polite" className="text-caption text-ink-muted">
        {slots.length} {slots.length === 1 ? "time" : "times"} available on{" "}
        {formatDateLong(dateKey, { year: true })}
      </p>

      {groups.map((group) => (
        <section key={group.key} aria-labelledby={`slot-group-${group.key}`}>
          <h3
            id={`slot-group-${group.key}`}
            className="text-sm font-semibold text-ink"
          >
            {group.label}
          </h3>
          <ul className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-4">
            {group.slots.map((slot) => {
              const isSelected = slot.startAt === selectedStartAt;

              return (
                <li key={slot.startAt}>
                  <button
                    type="button"
                    aria-pressed={isSelected}
                    onClick={() => onSelectSlot(slot.startAt)}
                    className={cn(
                      "flex min-h-11 w-full flex-col items-center justify-center rounded-input border px-2 py-2 text-center transition-colors",
                      isSelected
                        ? "border-brand bg-brand-tint text-brand-soft ring-1 ring-brand"
                        : "border-line bg-card text-ink hover:border-line-strong hover:bg-elevated",
                    )}
                  >
                    <span className="text-sm font-semibold tabular-nums">
                      {formatTime(slot.startAt)}
                    </span>
                    {staffId === "any" ? (
                      <span
                        className={cn(
                          "mt-0.5 text-[11px]",
                          isSelected ? "text-brand-soft" : "text-ink-muted",
                        )}
                      >
                        {slot.staffIds.length}{" "}
                        {slot.staffIds.length === 1 ? "pro" : "pros"}
                      </span>
                    ) : null}
                  </button>
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </div>
  );
}
