"use client";

import { Input } from "@/components/ui/input";
import { WEEKDAY_LABELS } from "@/lib/constants";
import type { Weekday, WorkingHours } from "@/lib/types";
import { cn } from "@/lib/utils";

export const DAY_ORDER: Weekday[] = [1, 2, 3, 4, 5, 6, 0];

const SHORT_LABELS: Record<Weekday, string> = {
  0: "Sun",
  1: "Mon",
  2: "Tue",
  3: "Wed",
  4: "Thu",
  5: "Fri",
  6: "Sat",
};

export const DEFAULT_OPEN = "09:00";
export const DEFAULT_CLOSE = "19:00";

export interface DayRow {
  day: Weekday;
  enabled: boolean;
  open: string;
  close: string;
}

export function buildDayRows(hours: WorkingHours[]): DayRow[] {
  return DAY_ORDER.map((day) => {
    const entry = hours.find((item) => item.day === day);

    if (!entry) {
      return {
        day,
        enabled: false,
        open: DEFAULT_OPEN,
        close: DEFAULT_CLOSE,
      };
    }

    return {
      day,
      enabled: true,
      open: entry.open || DEFAULT_OPEN,
      close: entry.close || DEFAULT_CLOSE,
    };
  });
}

export function rowsToWorkingHours(rows: DayRow[]): WorkingHours[] {
  return rows
    .filter((row) => row.enabled)
    .map((row) => ({ day: row.day, open: row.open, close: row.close }));
}

function formatDaySet(days: Weekday[]): string {
  if (days.length === 1) {
    return SHORT_LABELS[days[0]];
  }

  const indices = days
    .map((day) => DAY_ORDER.indexOf(day))
    .sort((a, b) => a - b);
  const contiguous = indices.every(
    (value, index) => index === 0 || value === indices[index - 1] + 1,
  );

  if (contiguous) {
    const first = DAY_ORDER[indices[0]];
    const last = DAY_ORDER[indices[indices.length - 1]];

    return `${SHORT_LABELS[first]}–${SHORT_LABELS[last]}`;
  }

  return days.map((day) => SHORT_LABELS[day]).join(", ");
}

export function formatWorkingHoursSummary(hours: WorkingHours[]): string {
  if (hours.length === 0) {
    return "No working days";
  }

  const ordered = [...hours].sort(
    (a, b) => DAY_ORDER.indexOf(a.day) - DAY_ORDER.indexOf(b.day),
  );
  const first = ordered[0];
  const uniform = ordered.every(
    (entry) => entry.open === first.open && entry.close === first.close,
  );

  if (uniform) {
    return `${formatDaySet(
      ordered.map((entry) => entry.day),
    )} · ${first.open}–${first.close}`;
  }

  return ordered
    .map((entry) => `${SHORT_LABELS[entry.day]} ${entry.open}–${entry.close}`)
    .join(" · ");
}

export interface WorkingHoursEditorProps {
  rows: DayRow[];
  errors: Record<number, string>;
  onChange: (rows: DayRow[]) => void;
}

export function WorkingHoursEditor({
  rows,
  errors,
  onChange,
}: WorkingHoursEditorProps) {
  function update(day: Weekday, patch: Partial<Omit<DayRow, "day">>) {
    onChange(
      rows.map((row) => (row.day === day ? { ...row, ...patch } : row)),
    );
  }

  return (
    <div className="space-y-2">
      {rows.map((row) => {
        const rowError = errors[row.day];
        const errorId = `staff-hours-${row.day}-error`;

        return (
          <div
            key={row.day}
            className={cn(
              "rounded-input border border-line-subtle p-3",
              row.enabled ? "bg-surface/40" : "bg-surface/20",
            )}
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <label className="flex min-h-11 cursor-pointer items-center gap-3">
                <input
                  type="checkbox"
                  checked={row.enabled}
                  onChange={(event) =>
                    update(row.day, { enabled: event.target.checked })
                  }
                  aria-label={`Enable ${WEEKDAY_LABELS[row.day]}`}
                  className="h-4 w-4 shrink-0 accent-brand"
                />
                <span
                  className={cn(
                    "text-sm font-medium",
                    row.enabled ? "text-ink" : "text-ink-muted",
                  )}
                >
                  {WEEKDAY_LABELS[row.day]}
                </span>
              </label>

              {row.enabled ? (
                <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2 sm:w-72">
                  <Input
                    type="time"
                    value={row.open}
                    onChange={(event) =>
                      update(row.day, { open: event.target.value })
                    }
                    aria-label={`${WEEKDAY_LABELS[row.day]} opening time`}
                    invalid={Boolean(rowError)}
                    aria-describedby={rowError ? errorId : undefined}
                    className="h-11 min-w-0"
                  />
                  <span className="text-caption text-ink-muted">to</span>
                  <Input
                    type="time"
                    value={row.close}
                    onChange={(event) =>
                      update(row.day, { close: event.target.value })
                    }
                    aria-label={`${WEEKDAY_LABELS[row.day]} closing time`}
                    invalid={Boolean(rowError)}
                    aria-describedby={rowError ? errorId : undefined}
                    className="h-11 min-w-0"
                  />
                </div>
              ) : (
                <p className="text-caption text-ink-muted sm:w-72">Closed</p>
              )}
            </div>
            {rowError ? (
              <p
                id={errorId}
                role="alert"
                className="mt-2 text-caption text-danger"
              >
                {rowError}
              </p>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
