"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  CalendarMarkIcon,
  CalendarSearchIcon,
  CheckCircleIcon,
  CheckIcon,
  ClockCircleIcon,
  DocumentsIcon,
  HomeIcon,
  TagPriceIcon,
  UserRoundedIcon,
} from "@/components/icons";
import { BookingResultSkeleton } from "@/components/booking/booking-flow-skeleton";
import { Alert } from "@/components/ui/alert";
import { Avatar } from "@/components/ui/avatar";
import { StatusBadge } from "@/components/ui/badge";
import { Button, buttonClasses } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import {
  formatDateLong,
  formatDateTime,
  formatDuration,
  formatPrice,
  formatTime,
} from "@/lib/date";
import { useDemoStore } from "@/lib/demo-store";
import { cn } from "@/lib/utils";

type CopyState = "idle" | "copied" | "failed";

function DetailRow({
  label,
  value,
}: {
  label: string;
  value: ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-line-subtle py-2.5 last:border-0 last:pb-0">
      <dt className="text-caption text-ink-muted">{label}</dt>
      <dd className="min-w-0 text-right text-sm font-medium text-ink">
        {value}
      </dd>
    </div>
  );
}

export function BookingConfirmation() {
  const { hydrated, bookings, serviceById, staffById } = useDemoStore();
  const searchParams = useSearchParams();
  const reference = searchParams.get("ref")?.trim() ?? "";
  const [copyState, setCopyState] = useState<CopyState>("idle");
  const copyTimerRef = useRef<number | null>(null);

  const booking = useMemo(() => {
    if (!reference) {
      return undefined;
    }

    const lowered = reference.toLowerCase();

    return bookings.find(
      (entry) =>
        entry.reference.toLowerCase() === lowered ||
        entry.id.toLowerCase() === lowered,
    );
  }, [bookings, reference]);

  useEffect(() => {
    return () => {
      if (copyTimerRef.current !== null) {
        window.clearTimeout(copyTimerRef.current);
      }
    };
  }, []);

  function scheduleReset() {
    if (copyTimerRef.current !== null) {
      window.clearTimeout(copyTimerRef.current);
    }

    copyTimerRef.current = window.setTimeout(() => {
      setCopyState("idle");
    }, 2200);
  }

  async function handleCopy() {
    if (!booking) {
      return;
    }

    try {
      if (!navigator.clipboard) {
        throw new Error("Clipboard unavailable");
      }

      await navigator.clipboard.writeText(booking.reference);
      setCopyState("copied");
    } catch {
      setCopyState("failed");
    }

    scheduleReset();
  }

  if (!hydrated) {
    return <BookingResultSkeleton />;
  }

  if (!booking) {
    return (
      <div className="mx-auto max-w-3xl">
        <EmptyState
          icon={<CalendarSearchIcon size={24} aria-hidden="true" />}
          titleAs="h1"
          title="We couldn't find that booking"
          description="The reference may be incorrect, or this booking was made in a different browser. Demo bookings are stored locally."
          action={
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Link href="/book" className={buttonClasses({ size: "md" })}>
                Book an appointment
              </Link>
              <Link
                href="/services"
                className={buttonClasses({ variant: "secondary", size: "md" })}
              >
                Browse services
              </Link>
            </div>
          }
        />
      </div>
    );
  }

  const service = serviceById(booking.serviceId);
  const staff = staffById(booking.staffId);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Card className="overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-brand via-brand-soft to-brand/40" />
        <CardContent className="p-6 sm:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-start gap-4">
              <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-success/30 bg-success-bg text-success">
                <CheckCircleIcon size={30} aria-hidden="true" />
              </span>
              <div>
                <h1 className="heading-section text-3xl text-ink">
                  You&apos;re booked
                </h1>
                <p className="support-text mt-2 max-w-lg">
                  Your appointment request has been saved. The studio will see
                  it in the admin demo and can confirm it there.
                </p>
              </div>
            </div>
            <StatusBadge status={booking.status} className="self-start" />
          </div>

          <div className="mt-6 rounded-card border border-line bg-surface/60 p-4 sm:p-5">
            <p className="text-caption font-medium uppercase tracking-[0.16em] text-ink-muted">
              Booking reference
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-3">
              <p className="font-mono text-2xl font-semibold tracking-[0.04em] text-ink">
                {booking.reference}
              </p>
              <Button
                variant="secondary"
                size="sm"
                onClick={handleCopy}
                leftIcon={
                  copyState === "copied" ? (
                    <CheckIcon size={15} aria-hidden="true" />
                  ) : (
                    <DocumentsIcon size={15} aria-hidden="true" />
                  )
                }
              >
                {copyState === "copied"
                  ? "Copied"
                  : copyState === "failed"
                    ? "Copy failed"
                    : "Copy"}
              </Button>
            </div>
            <p aria-live="polite" className="sr-only">
              {copyState === "copied"
                ? "Booking reference copied to clipboard"
                : copyState === "failed"
                  ? "Copy failed. Select the reference manually."
                  : ""}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-5 sm:p-6">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-input border border-brand/20 bg-brand-tint text-brand-soft">
              <CalendarMarkIcon size={20} aria-hidden="true" />
            </span>
            <div>
              <h2 className="heading-card text-ink">Appointment details</h2>
              <p className="text-caption text-ink-muted">
                Requested {formatDateTime(booking.createdAt)}
              </p>
            </div>
          </div>

          <dl className="mt-5">
            <DetailRow
              label="Service"
              value={
                <span className="inline-flex items-center gap-2">
                  <TagPriceIcon
                    size={15}
                    aria-hidden="true"
                    className="text-ink-muted"
                  />
                  {service?.name ?? "Service unavailable"}
                </span>
              }
            />
            <DetailRow
              label="Professional"
              value={
                <span className="inline-flex items-center justify-end gap-2">
                  {staff ? (
                    <Avatar name={staff.name} size="sm" className="h-6 w-6" />
                  ) : (
                    <UserRoundedIcon
                      size={15}
                      aria-hidden="true"
                      className="text-ink-muted"
                    />
                  )}
                  {staff?.name ?? "Professional unavailable"}
                </span>
              }
            />
            <DetailRow
              label="Date"
              value={formatDateLong(booking.startAt, { year: true })}
            />
            <DetailRow
              label="Time"
              value={
                <span className="inline-flex items-center gap-2">
                  <ClockCircleIcon
                    size={15}
                    aria-hidden="true"
                    className="text-ink-muted"
                  />
                  {formatTime(booking.startAt)}
                </span>
              }
            />
            <DetailRow
              label="Duration"
              value={
                service ? formatDuration(service.durationMinutes) : "Not available"
              }
            />
            <DetailRow
              label="Price"
              value={service ? formatPrice(service.price) : "Not available"}
            />
            <DetailRow label="Customer" value={booking.customerName} />
            <DetailRow label="Email" value={booking.customerEmail} />
            <DetailRow label="Phone" value={booking.customerPhone} />
            {booking.notes ? (
              <DetailRow
                label="Notes"
                value={
                  <span className="whitespace-pre-line font-normal text-ink-secondary">
                    {booking.notes}
                  </span>
                }
              />
            ) : null}
          </dl>
        </CardContent>
      </Card>

      <Alert variant="warning" title="Demo booking">
        This is a demo booking. The studio has not been notified. Your data
        stays in this browser.
      </Alert>

      <div className="flex flex-wrap items-center gap-3">
        <Link
          href={`/booking/${encodeURIComponent(booking.id)}`}
          className={buttonClasses({ size: "md" })}
        >
          View booking details
        </Link>
        <Link
          href="/book"
          className={buttonClasses({ variant: "secondary", size: "md" })}
        >
          Book another appointment
        </Link>
        <Link
          href="/"
          className={cn(
            buttonClasses({ variant: "ghost", size: "md" }),
            "text-ink-secondary",
          )}
        >
          <HomeIcon size={16} aria-hidden="true" />
          Back to home
        </Link>
      </div>
    </div>
  );
}
