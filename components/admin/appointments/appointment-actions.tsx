"use client";

import { Button } from "@/components/ui/button";
import type { Booking, BookingStatus } from "@/lib/types";

const CANCEL_CLASSES =
  "border-danger/40 text-danger hover:border-danger/60 hover:bg-danger-bg/60";

export interface AppointmentActionsProps {
  booking: Booking;
  busy: boolean;
  pendingStatus: BookingStatus | null;
  onUpdate: (status: BookingStatus) => void;
  onRequestCancel: () => void;
  onClose: () => void;
}

export function AppointmentActions({
  booking,
  busy,
  pendingStatus,
  onUpdate,
  onRequestCancel,
  onClose,
}: AppointmentActionsProps) {
  if (booking.status === "pending") {
    return (
      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button
          variant="outline"
          className={CANCEL_CLASSES}
          onClick={onRequestCancel}
          disabled={busy}
        >
          Cancel booking
        </Button>
        <Button
          onClick={() => onUpdate("confirmed")}
          loading={pendingStatus === "confirmed"}
          disabled={busy}
        >
          Confirm booking
        </Button>
      </div>
    );
  }

  if (booking.status === "confirmed") {
    return (
      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button
          variant="outline"
          className={CANCEL_CLASSES}
          onClick={onRequestCancel}
          disabled={busy}
        >
          Cancel booking
        </Button>
        <Button
          onClick={() => onUpdate("completed")}
          loading={pendingStatus === "completed"}
          disabled={busy}
        >
          Mark completed
        </Button>
      </div>
    );
  }

  return (
    <div className="flex justify-end">
      <Button variant="secondary" onClick={onClose}>
        Close
      </Button>
    </div>
  );
}
