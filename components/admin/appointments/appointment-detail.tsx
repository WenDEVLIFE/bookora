"use client";

import type { ReactNode } from "react";
import {
  CalendarMarkIcon,
  ClockCircleIcon,
  ClockSquareIcon,
  LetterIcon,
  NotesIcon,
  PhoneIcon,
  TagPriceIcon,
  UserRoundedIcon,
} from "@/components/icons";
import { Alert } from "@/components/ui/alert";
import { Avatar } from "@/components/ui/avatar";
import { StatusBadge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import {
  formatDateLong,
  formatDateTime,
  formatDuration,
  formatPrice,
  formatTime,
} from "@/lib/date";
import type { Booking, Service, StaffMember } from "@/lib/types";

export interface AppointmentFeedback {
  variant: "success" | "danger";
  message: string;
}

export interface AppointmentDetailProps {
  booking: Booking;
  service?: Service;
  staff?: StaffMember;
  onClose: () => void;
  footer: ReactNode;
  feedback?: AppointmentFeedback | null;
}

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
    <div className="flex items-start justify-between gap-4 border-b border-line-subtle py-2.5 first:pt-0 last:border-0 last:pb-0">
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

export function AppointmentDetail({
  booking,
  service,
  staff,
  onClose,
  footer,
  feedback,
}: AppointmentDetailProps) {
  return (
    <Modal
      open
      onClose={onClose}
      title={`Booking ${booking.reference}`}
      description={`${formatDateLong(booking.startAt, {
        year: true,
      })} at ${formatTime(booking.startAt)}`}
      size="lg"
      footer={footer}
    >
      <div className="space-y-5">
        {feedback ? (
          <Alert
            variant={feedback.variant}
            title={
              feedback.variant === "success"
                ? "Status updated"
                : "Could not update booking"
            }
          >
            {feedback.message}
          </Alert>
        ) : null}

        <div className="flex flex-wrap items-center gap-3">
          <StatusBadge status={booking.status} />
          <span className="text-caption text-ink-muted">
            Created {formatDateTime(booking.createdAt)}
          </span>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <section className="rounded-input border border-line-subtle bg-surface/50 p-4">
            <div className="flex items-center gap-3">
              <Avatar name={booking.customerName} size="md" />
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-ink">
                  {booking.customerName}
                </p>
                <p className="text-caption text-ink-muted">Customer</p>
              </div>
            </div>
            <dl className="mt-4 space-y-2 text-sm">
              <div className="flex items-start gap-2">
                <LetterIcon
                  size={15}
                  aria-hidden="true"
                  className="mt-0.5 shrink-0 text-ink-muted"
                />
                <dd className="min-w-0 break-all text-ink-secondary">
                  {booking.customerEmail}
                </dd>
              </div>
              <div className="flex items-start gap-2">
                <PhoneIcon
                  size={15}
                  aria-hidden="true"
                  className="mt-0.5 shrink-0 text-ink-muted"
                />
                <dd className="tabular-nums text-ink-secondary">
                  {booking.customerPhone}
                </dd>
              </div>
            </dl>
          </section>

          <section className="rounded-input border border-line-subtle bg-surface/50 p-4">
            <p className="text-caption font-medium uppercase tracking-[0.14em] text-ink-muted">
              Appointment
            </p>
            <dl className="mt-3">
              <DetailRow
                icon={<TagPriceIcon size={15} aria-hidden="true" />}
                label="Service"
                value={service?.name ?? "Service unavailable"}
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
              <DetailRow
                icon={<UserRoundedIcon size={15} aria-hidden="true" />}
                label="Professional"
                value={
                  staff ? (
                    <span className="inline-flex items-center justify-end gap-2">
                      <Avatar
                        name={staff.name}
                        size="sm"
                        className="h-6 w-6"
                      />
                      {staff.name}
                    </span>
                  ) : (
                    "Professional unavailable"
                  )
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
            </dl>
          </section>
        </div>

        {booking.notes ? (
          <section className="rounded-input border border-line-subtle bg-surface/50 p-4">
            <p className="inline-flex items-center gap-2 text-caption text-ink-muted">
              <NotesIcon size={15} aria-hidden="true" />
              Notes
            </p>
            <p className="mt-2 whitespace-pre-line text-sm text-ink-secondary">
              {booking.notes}
            </p>
          </section>
        ) : null}

        <Alert variant="warning" title="Demo booking">
          This appointment is stored in this browser only. No email, SMS, or
          payment has been processed.
        </Alert>
      </div>
    </Modal>
  );
}
