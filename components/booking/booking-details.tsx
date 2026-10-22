"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useMemo, type ReactNode } from "react";
import {
  CalendarMarkIcon,
  CalendarSearchIcon,
  ClockCircleIcon,
  ClockSquareIcon,
  HomeIcon,
  NotesIcon,
  TagPriceIcon,
  UserRoundedIcon,
} from "@/components/icons";
import { BookingResultSkeleton } from "@/components/booking/booking-flow-skeleton";
import { StatusTimeline } from "@/components/booking/status-timeline";
import { Alert } from "@/components/ui/alert";
import { Avatar } from "@/components/ui/avatar";
import { StatusBadge } from "@/components/ui/badge";
import { buttonClasses } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

function DetailRow({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-line-subtle py-3 first:pt-0 last:border-0 last:pb-0">
      <dt className="inline-flex items-center gap-2 text-caption text-ink-muted">
        <span aria-hidden="true">{icon}</span>
        {label}
      </dt>
      <dd className="min-w-0 text-right text-sm font-medium text-ink">
        {value}
      </dd>
    </div>
  );
}

export function BookingDetails() {
  const { hydrated, bookings, serviceById, staffById } = useDemoStore();
  const params = useParams<{ id: string }>();
  const rawId = typeof params?.id === "string" ? params.id : "";

  const booking = useMemo(() => {
    const needle = rawId.trim();

    if (!needle) {
      return undefined;
    }

    const lowered = needle.toLowerCase();

    return bookings.find(
      (entry) =>
        entry.id === needle ||
        entry.reference.toLowerCase() === lowered ||
        entry.id.toLowerCase() === lowered,
    );
  }, [bookings, rawId]);

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
          description="The booking may have been made in a different browser, or the link is incorrect. Demo bookings are stored locally."
          action={
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Link href="/book" className={buttonClasses({ size: "md" })}>
                Book an appointment
              </Link>
              <Link
                href="/"
                className={buttonClasses({ variant: "secondary", size: "md" })}
              >
                Back to home
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
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="label-text uppercase tracking-[0.18em] text-brand-soft">
            Booking details
          </p>
          <h1 className="heading-page mt-2 text-ink">
            Booking {booking.reference}
          </h1>
          <p className="support-text mt-2">
            Requested {formatDateTime(booking.createdAt)} · Read-only demo view
          </p>
        </div>
        <StatusBadge status={booking.status} className="self-start" />
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Appointment</CardTitle>
            </CardHeader>
            <CardContent>
              <dl>
                <DetailRow
                  icon={<TagPriceIcon size={15} aria-hidden="true" />}
                  label="Service"
                  value={service?.name ?? "Service unavailable"}
                />
                <DetailRow
                  icon={<UserRoundedIcon size={15} aria-hidden="true" />}
                  label="Professional"
                  value={
                    <span className="inline-flex items-center justify-end gap-2">
                      {staff ? (
                        <Avatar
                          name={staff.name}
                          size="sm"
                          className="h-6 w-6"
                        />
                      ) : null}
                      {staff?.name ?? "Professional unavailable"}
                    </span>
                  }
                />
                <DetailRow
                  icon={<CalendarMarkIcon size={15} aria-hidden="true" />}
                  label="Date"
                  value={formatDateLong(booking.startAt, { year: true })}
                />
                <DetailRow
                  icon={<ClockCircleIcon size={15} aria-hidden="true" />}
                  label="Time"
                  value={formatTime(booking.startAt)}
                />
                <DetailRow
                  icon={<ClockSquareIcon size={15} aria-hidden="true" />}
                  label="Duration"
                  value={
                    service
                      ? formatDuration(service.durationMinutes)
                      : "Not available"
                  }
                />
                <DetailRow
                  icon={<TagPriceIcon size={15} aria-hidden="true" />}
                  label="Price"
                  value={service ? formatPrice(service.price) : "Not available"}
                />
              </dl>

              {booking.notes ? (
                <div className="mt-4 rounded-input border border-line-subtle bg-surface/60 p-3.5">
                  <p className="inline-flex items-center gap-2 text-caption text-ink-muted">
                    <NotesIcon size={15} aria-hidden="true" />
                    Notes
                  </p>
                  <p className="mt-1.5 whitespace-pre-line text-sm text-ink-secondary">
                    {booking.notes}
                  </p>
                </div>
              ) : null}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Customer</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="space-y-2.5 text-sm">
                <div className="flex items-start justify-between gap-4">
                  <dt className="text-ink-muted">Name</dt>
                  <dd className="text-right font-medium text-ink">
                    {booking.customerName}
                  </dd>
                </div>
                <div className="flex items-start justify-between gap-4">
                  <dt className="text-ink-muted">Email</dt>
                  <dd className="break-all text-right font-medium text-ink">
                    {booking.customerEmail}
                  </dd>
                </div>
                <div className="flex items-start justify-between gap-4">
                  <dt className="text-ink-muted">Phone</dt>
                  <dd className="text-right font-medium tabular-nums text-ink">
                    {booking.customerPhone}
                  </dd>
                </div>
              </dl>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Status</CardTitle>
            </CardHeader>
            <CardContent>
              <StatusTimeline status={booking.status} />
              <p className="mt-4 border-t border-line-subtle pt-4 text-caption text-ink-muted">
                The studio manages booking statuses from the admin demo. This
                page is read-only.
              </p>
            </CardContent>
          </Card>

          <div className="flex flex-col gap-2">
            <Link
              href="/book"
              className={buttonClasses({ size: "md", className: "w-full" })}
            >
              Book another appointment
            </Link>
            <Link
              href="/"
              className={cn(
                buttonClasses({ variant: "secondary", size: "md" }),
                "w-full",
              )}
            >
              <HomeIcon size={16} aria-hidden="true" />
              Back to home
            </Link>
          </div>
        </div>
      </div>

      <Alert variant="warning" title="Demo booking">
        This booking exists only in this browser. The studio has not been
        notified, and no email or SMS has been sent.
      </Alert>
    </div>
  );
}
