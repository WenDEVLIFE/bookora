import { CheckIcon } from "@/components/icons";
import {
  BOOKING_STEPS,
  STEP_COUNT,
  type BookingStepIndex,
} from "@/components/booking/booking-types";
import { cn } from "@/lib/utils";

export interface BookingProgressProps {
  currentStep: BookingStepIndex;
  onSelectStep: (step: BookingStepIndex) => void;
  className?: string;
}

export function BookingProgress({
  currentStep,
  onSelectStep,
  className,
}: BookingProgressProps) {
  return (
    <nav
      aria-label="Booking progress"
      className={cn(
        "rounded-card border border-line bg-card px-4 py-3 sm:px-5",
        className,
      )}
    >
      <div className="hidden lg:block">
        <ol className="flex items-center gap-1">
          {BOOKING_STEPS.map((step, index) => {
            const stepIndex = index as BookingStepIndex;
            const isCompleted = stepIndex < currentStep;
            const isCurrent = stepIndex === currentStep;

            const content = (
              <>
                <span
                  className={cn(
                    "flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-xs font-semibold tabular-nums transition-colors",
                    isCompleted
                      ? "border-brand bg-brand text-white"
                      : isCurrent
                        ? "border-brand bg-brand-tint text-brand-soft"
                        : "border-line bg-elevated text-ink-muted",
                  )}
                >
                  {isCompleted ? (
                    <CheckIcon size={14} aria-hidden="true" />
                  ) : (
                    index + 1
                  )}
                </span>
                <span
                  className={cn(
                    "text-xs font-medium",
                    isCurrent
                      ? "text-brand-soft"
                      : isCompleted
                        ? "text-ink"
                        : "text-ink-muted",
                  )}
                >
                  {step.label}
                </span>
              </>
            );

            return (
              <li
                key={step.key}
                className="flex flex-1 items-center gap-1 last:flex-none"
              >
                {isCompleted ? (
                  <button
                    type="button"
                    onClick={() => onSelectStep(stepIndex)}
                    aria-label={`Go back to ${step.label}`}
                    className="flex items-center gap-2 rounded-control px-1 py-1 text-left transition-colors hover:bg-elevated"
                  >
                    {content}
                  </button>
                ) : (
                  <div
                    aria-current={isCurrent ? "step" : undefined}
                    className="flex items-center gap-2 px-1 py-1"
                  >
                    {content}
                  </div>
                )}
                {index < STEP_COUNT - 1 ? (
                  <span
                    aria-hidden="true"
                    className={cn(
                      "mx-1 h-px flex-1",
                      isCompleted ? "bg-brand/40" : "bg-line",
                    )}
                  />
                ) : null}
              </li>
            );
          })}
        </ol>
      </div>

      <div className="lg:hidden">
        <div className="flex items-center justify-between gap-3">
          <p className="text-caption text-ink-muted">
            Step {currentStep + 1} of {STEP_COUNT}
          </p>
          <p className="text-caption font-medium text-brand-soft">
            {BOOKING_STEPS[currentStep].label}
          </p>
        </div>
        <ol className="mt-1 flex items-center gap-1">
          {BOOKING_STEPS.map((step, index) => {
            const stepIndex = index as BookingStepIndex;
            const isCompleted = stepIndex < currentStep;
            const isCurrent = stepIndex === currentStep;

            const dot = (
              <span
                className={cn(
                  "flex h-7 w-7 items-center justify-center rounded-full border text-[11px] font-semibold tabular-nums transition-colors",
                  isCompleted
                    ? "border-brand bg-brand text-white"
                    : isCurrent
                      ? "border-brand bg-brand-tint text-brand-soft"
                      : "border-line bg-elevated text-ink-muted",
                )}
              >
                {isCompleted ? (
                  <CheckIcon size={13} aria-hidden="true" />
                ) : (
                  index + 1
                )}
              </span>
            );

            return (
              <li key={step.key} className="flex-1">
                {isCompleted ? (
                  <button
                    type="button"
                    onClick={() => onSelectStep(stepIndex)}
                    aria-label={`Go back to ${step.label}`}
                    className="flex min-h-11 w-full items-center justify-center rounded-control transition-colors hover:bg-elevated"
                  >
                    {dot}
                  </button>
                ) : (
                  <div
                    aria-current={isCurrent ? "step" : undefined}
                    className="flex min-h-11 w-full items-center justify-center"
                  >
                    {dot}
                  </div>
                )}
              </li>
            );
          })}
        </ol>
      </div>
    </nav>
  );
}
