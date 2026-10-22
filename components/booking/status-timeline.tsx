import { CheckIcon, CloseCircleIcon } from "@/components/icons";
import { BOOKING_STATUS_LABELS } from "@/lib/constants";
import type { BookingStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

export interface StatusTimelineProps {
  status: BookingStatus;
  className?: string;
}

const STAGES = ["pending", "confirmed", "completed"] as const;

const STAGE_DESCRIPTIONS: Record<(typeof STAGES)[number], string> = {
  pending: "Request received and waiting for studio confirmation.",
  confirmed: "Confirmed by the studio. See you soon.",
  completed: "Appointment completed.",
};

export function StatusTimeline({ status, className }: StatusTimelineProps) {
  if (status === "cancelled") {
    return (
      <div
        role="status"
        className={cn(
          "flex items-start gap-3 rounded-card border border-danger/30 bg-danger-bg/50 p-4",
          className,
        )}
      >
        <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-danger-bg text-danger">
          <CloseCircleIcon size={18} aria-hidden="true" />
        </span>
        <div>
          <p className="text-sm font-semibold text-danger">
            {BOOKING_STATUS_LABELS.cancelled}
          </p>
          <p className="mt-0.5 text-caption text-ink-secondary">
            This appointment was cancelled. Book a new appointment or contact
            the studio for help.
          </p>
        </div>
      </div>
    );
  }

  const currentIndex = STAGES.indexOf(status);

  return (
    <ol
      aria-label="Booking status timeline"
      className={cn("space-y-0", className)}
    >
      {STAGES.map((stage, index) => {
        const reached = index <= currentIndex;
        const isCurrent = index === currentIndex;

        return (
          <li
            key={stage}
            className="relative flex gap-3 pb-5 last:pb-0"
            aria-current={isCurrent ? "step" : undefined}
          >
            {index < STAGES.length - 1 ? (
              <span
                aria-hidden="true"
                className={cn(
                  "absolute left-[11px] top-6 h-full w-px",
                  reached ? "bg-brand/40" : "bg-line",
                )}
              />
            ) : null}
            <span
              className={cn(
                "relative z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-[11px] font-semibold tabular-nums",
                isCurrent
                  ? "border-brand bg-brand text-white"
                  : reached
                    ? "border-brand/40 bg-brand-tint text-brand-soft"
                    : "border-line bg-card text-ink-muted",
              )}
            >
              {reached ? (
                <CheckIcon size={13} aria-hidden="true" />
              ) : (
                index + 1
              )}
            </span>
            <div className="pt-0.5">
              <p
                className={cn(
                  "text-sm font-semibold",
                  isCurrent
                    ? "text-brand-soft"
                    : reached
                      ? "text-ink"
                      : "text-ink-muted",
                )}
              >
                {BOOKING_STATUS_LABELS[stage]}
              </p>
              <p className="mt-0.5 text-caption text-ink-secondary">
                {STAGE_DESCRIPTIONS[stage]}
              </p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
