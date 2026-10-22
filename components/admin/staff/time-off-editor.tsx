"use client";

import { useId, useState } from "react";
import {
  AddIcon,
  TrashBinMinimalisticIcon,
} from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatDateLong, parseDateKey, toDateKey } from "@/lib/date";
import type { UnavailableSlot } from "@/lib/types";
import { uid } from "@/lib/utils";

const DATE_KEY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;

interface TimeOffDraft {
  date: string;
  startTime: string;
  endTime: string;
  reason: string;
}

const EMPTY_DRAFT: TimeOffDraft = {
  date: "",
  startTime: "",
  endTime: "",
  reason: "",
};

function isValidDateKey(value: string): boolean {
  return (
    DATE_KEY_PATTERN.test(value) &&
    !Number.isNaN(parseDateKey(value).getTime()) &&
    toDateKey(parseDateKey(value)) === value
  );
}

function slotRangeLabel(slot: UnavailableSlot): string {
  if (!slot.startTime && !slot.endTime) {
    return "All day";
  }

  return `${slot.startTime ?? ""}–${slot.endTime ?? ""}`;
}

export interface TimeOffEditorProps {
  slots: UnavailableSlot[];
  onAdd: (slot: UnavailableSlot) => void;
  onRemove: (id: string) => void;
}

export function TimeOffEditor({
  slots,
  onAdd,
  onRemove,
}: TimeOffEditorProps) {
  const [draft, setDraft] = useState<TimeOffDraft>(EMPTY_DRAFT);
  const [error, setError] = useState<string | null>(null);
  const rawId = useId();
  const fieldId = `time-off-${rawId.replace(/:/g, "")}`;

  const ordered = [...slots].sort((a, b) => {
    if (a.date !== b.date) {
      return a.date.localeCompare(b.date);
    }

    return (a.startTime ?? "00:00").localeCompare(b.startTime ?? "00:00");
  });

  function update(key: keyof TimeOffDraft, value: string) {
    setDraft((current) => ({ ...current, [key]: value }));
    setError(null);
  }

  function handleAdd() {
    const date = draft.date.trim();
    const start = draft.startTime.trim();
    const end = draft.endTime.trim();

    if (!isValidDateKey(date)) {
      setError("Choose a valid date.");
      return;
    }

    if (Boolean(start) !== Boolean(end)) {
      setError(
        "Add both a start and end time, or leave both blank for a full day.",
      );
      return;
    }

    if (start && end) {
      if (!TIME_PATTERN.test(start) || !TIME_PATTERN.test(end)) {
        setError("Enter valid start and end times.");
        return;
      }

      if (start >= end) {
        setError("The end time must be after the start time.");
        return;
      }
    }

    const duplicate = slots.some(
      (slot) =>
        slot.date === date &&
        (slot.startTime ?? "") === start &&
        (slot.endTime ?? "") === end,
    );

    if (duplicate) {
      setError("This time off already exists for the same date and range.");
      return;
    }

    const reason = draft.reason.trim();

    onAdd({
      id: uid("unavail"),
      date,
      ...(start ? { startTime: start } : {}),
      ...(end ? { endTime: end } : {}),
      ...(reason ? { reason } : {}),
    });

    setDraft(EMPTY_DRAFT);
    setError(null);
  }

  return (
    <div className="space-y-4">
      {ordered.length === 0 ? (
        <p className="text-caption text-ink-muted">No time off scheduled.</p>
      ) : (
        <ul className="space-y-2">
          {ordered.map((slot) => (
            <li
              key={slot.id}
              className="flex items-start justify-between gap-3 rounded-input border border-line-subtle bg-surface/40 p-3"
            >
              <div className="min-w-0">
                <p className="text-sm font-medium text-ink">
                  {formatDateLong(slot.date, { year: true })}
                </p>
                <p className="text-caption text-ink-muted">
                  {slotRangeLabel(slot)}
                  {slot.reason ? ` · ${slot.reason}` : ""}
                </p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label={`Remove time off on ${formatDateLong(slot.date, {
                  year: true,
                })}`}
                onClick={() => onRemove(slot.id)}
                className="h-11 w-11 shrink-0 text-ink-muted hover:text-danger"
              >
                <TrashBinMinimalisticIcon size={18} aria-hidden="true" />
              </Button>
            </li>
          ))}
        </ul>
      )}

      <div className="rounded-input border border-dashed border-line p-3">
        <p className="text-caption font-medium uppercase tracking-[0.12em] text-ink-muted">
          Add time off
        </p>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor={`${fieldId}-date`}>Date</Label>
            <Input
              id={`${fieldId}-date`}
              type="date"
              value={draft.date}
              onChange={(event) => update("date", event.target.value)}
              className="h-11"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor={`${fieldId}-reason`}>Reason (optional)</Label>
            <Input
              id={`${fieldId}-reason`}
              value={draft.reason}
              onChange={(event) => update("reason", event.target.value)}
              placeholder="Training, leave, appointment"
              className="h-11"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor={`${fieldId}-start`}>Start (optional)</Label>
            <Input
              id={`${fieldId}-start`}
              type="time"
              value={draft.startTime}
              onChange={(event) => update("startTime", event.target.value)}
              className="h-11"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor={`${fieldId}-end`}>End (optional)</Label>
            <Input
              id={`${fieldId}-end`}
              type="time"
              value={draft.endTime}
              onChange={(event) => update("endTime", event.target.value)}
              className="h-11"
            />
          </div>
        </div>
        {error ? (
          <p role="alert" className="mt-2 text-caption text-danger">
            {error}
          </p>
        ) : null}
        <div className="mt-3 flex justify-end">
          <Button
            type="button"
            variant="secondary"
            leftIcon={<AddIcon size={16} aria-hidden="true" />}
            onClick={handleAdd}
            className="h-11"
          >
            Add time off
          </Button>
        </div>
      </div>
    </div>
  );
}
