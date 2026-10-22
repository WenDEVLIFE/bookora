"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import {
  AltArrowRightIcon,
  CalendarSearchIcon,
  MagnifierIcon,
} from "@/components/icons";
import { AppointmentActions } from "@/components/admin/appointments/appointment-actions";
import {
  AppointmentDetail,
  type AppointmentFeedback,
} from "@/components/admin/appointments/appointment-detail";
import { PageHeader } from "@/components/admin/page-header";
import { Alert } from "@/components/ui/alert";
import { Avatar } from "@/components/ui/avatar";
import { StatusBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Modal } from "@/components/ui/modal";
import { Select } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { BOOKING_STATUS_LABELS } from "@/lib/constants";
import {
  formatDateLong,
  formatDateShort,
  formatDuration,
  formatPrice,
  formatTime,
  getBusinessNow,
  parseDateKey,
  toDateKey,
} from "@/lib/date";
import { useDemoStore } from "@/lib/demo-store";
import type { BookingStatus } from "@/lib/types";

type StatusFilter = BookingStatus | "all";

const subscribeToNothing = () => () => {};
const getClientMounted = () => true;
const getServerMounted = () => false;

function isValidDateKey(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  return !Number.isNaN(parseDateKey(value).getTime());
}

function AppointmentsSkeleton() {
  return (
    <div className="mt-6 space-y-4" aria-hidden="true">
      <Skeleton className="h-36" />
      <Skeleton className="h-4 w-48" rounded="sm" />
      <Skeleton className="h-80" />
    </div>
  );
}

export function AppointmentsManager() {
  const { hydrated, bookings, services, staff, updateBookingStatus } =
    useDemoStore();
  const mounted = useSyncExternalStore(
    subscribeToNothing,
    getClientMounted,
    getServerMounted,
  );
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [selectedDay, setSelectedDay] = useState(() =>
    toDateKey(getBusinessNow()),
  );
  const [allDates, setAllDates] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [cancelTargetId, setCancelTargetId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [pendingStatus, setPendingStatus] = useState<BookingStatus | null>(null);
  const [feedback, setFeedback] = useState<AppointmentFeedback | null>(null);
  const [cancelError, setCancelError] = useState<string | null>(null);

  const ready = hydrated && mounted;
  const todayKey = ready ? toDateKey(getBusinessNow()) : "";
  const dateInvalid = !allDates && !isValidDateKey(selectedDay);

  const servicesById = useMemo(
    () => new Map(services.map((service) => [service.id, service])),
    [services],
  );
  const staffById = useMemo(
    () => new Map(staff.map((member) => [member.id, member])),
    [staff],
  );

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    const list = bookings.filter((booking) => {
      if (!allDates) {
        if (!selectedDay) {
          return false;
        }

        if (toDateKey(booking.startAt) !== selectedDay) {
          return false;
        }
      }

      if (statusFilter !== "all" && booking.status !== statusFilter) {
        return false;
      }

      if (!query) {
        return true;
      }

      const service = servicesById.get(booking.serviceId);
      const member = staffById.get(booking.staffId);
      const haystack = [
        booking.customerName,
        booking.customerEmail,
        booking.reference,
        service?.name ?? "",
        member?.name ?? "",
      ]
        .join(" ")
        .toLowerCase();

      return haystack.includes(query);
    });

    list.sort((a, b) => {
      const delta =
        new Date(a.startAt).getTime() - new Date(b.startAt).getTime();

      return allDates ? -delta : delta;
    });

    return list;
  }, [
    allDates,
    bookings,
    search,
    selectedDay,
    servicesById,
    staffById,
    statusFilter,
  ]);

  const hasActiveFilters =
    search.trim() !== "" ||
    statusFilter !== "all" ||
    allDates ||
    (ready && selectedDay !== todayKey);

  const filterSummary = useMemo(() => {
    const parts: string[] = [];
    const query = search.trim();

    if (query) {
      parts.push(`matching "${query}"`);
    }

    if (statusFilter !== "all") {
      parts.push(
        `status ${BOOKING_STATUS_LABELS[statusFilter].toLowerCase()}`,
      );
    }

    if (allDates) {
      parts.push("all dates");
    } else if (selectedDay) {
      parts.push(`on ${formatDateLong(selectedDay, { year: true })}`);
    }

    return parts.join(" · ");
  }, [allDates, search, selectedDay, statusFilter]);

  const selectedBooking = selectedId
    ? bookings.find((booking) => booking.id === selectedId)
    : undefined;
  const cancelTarget = cancelTargetId
    ? bookings.find((booking) => booking.id === cancelTargetId)
    : undefined;

  function openDetail(id: string) {
    setSelectedId(id);
    setFeedback(null);
  }

  function clearFilters() {
    setSearch("");
    setStatusFilter("all");
    setAllDates(false);
    setSelectedDay(toDateKey(getBusinessNow()));
    setCancelError(null);
    setFeedback(null);
  }

  function handleUpdate(status: BookingStatus) {
    if (!selectedBooking) {
      return;
    }

    setBusy(true);
    setPendingStatus(status);
    setFeedback(null);

    const result = updateBookingStatus(selectedBooking.id, status);

    if (result.ok) {
      setFeedback({
        variant: "success",
        message: `Booking ${result.data.reference} marked as ${BOOKING_STATUS_LABELS[
          status
        ].toLowerCase()}.`,
      });
    } else {
      setFeedback({ variant: "danger", message: result.error });
    }

    setPendingStatus(null);
    setBusy(false);
  }

  function requestCancel() {
    if (!selectedBooking) {
      return;
    }

    setCancelError(null);
    setCancelTargetId(selectedBooking.id);
  }

  function confirmCancel() {
    if (!cancelTarget) {
      return;
    }

    setBusy(true);
    setPendingStatus("cancelled");
    setCancelError(null);

    const result = updateBookingStatus(cancelTarget.id, "cancelled");

    if (result.ok) {
      setCancelTargetId(null);
      setFeedback({
        variant: "success",
        message: `Booking ${result.data.reference} cancelled. The time slot is now available.`,
      });
    } else {
      setCancelError(result.error);
    }

    setPendingStatus(null);
    setBusy(false);
  }

  return (
    <div>
      <PageHeader
        title="Appointments"
        eyebrow="Management"
        description={
          ready
            ? `${bookings.length} ${
                bookings.length === 1 ? "appointment" : "appointments"
              } in this demo. Review, confirm, complete, or cancel bookings.`
            : "Loading demo appointments."
        }
      />

      {!ready ? (
        <AppointmentsSkeleton />
      ) : (
        <div className="mt-6 space-y-4">
          <Card>
            <CardContent className="grid gap-4 sm:grid-cols-2 xl:grid-cols-[minmax(0,1.5fr)_11rem_12rem_auto] xl:items-end">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="appointments-search">Search</Label>
                <div className="relative">
                  <MagnifierIcon
                    size={17}
                    aria-hidden="true"
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted"
                  />
                  <Input
                    id="appointments-search"
                    type="search"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Customer, reference, service, professional"
                    className="pl-9"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="appointments-status">Status</Label>
                <Select
                  id="appointments-status"
                  value={statusFilter}
                  onChange={(event) =>
                    setStatusFilter(event.target.value as StatusFilter)
                  }
                >
                  <option value="all">All statuses</option>
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </Select>
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="appointments-date">Date</Label>
                <Input
                  id="appointments-date"
                  type="date"
                  value={selectedDay}
                  onChange={(event) => setSelectedDay(event.target.value)}
                  disabled={allDates}
                  invalid={dateInvalid}
                  aria-describedby={
                    dateInvalid ? "appointments-date-error" : undefined
                  }
                />
                {dateInvalid ? (
                  <p
                    id="appointments-date-error"
                    className="text-caption text-danger"
                  >
                    Choose a valid date, or use All dates.
                  </p>
                ) : null}
              </div>

              <div className="flex flex-wrap items-end gap-2">
                <Button
                  variant={allDates ? "secondary" : "outline"}
                  aria-pressed={allDates}
                  onClick={() => setAllDates((current) => !current)}
                >
                  All dates
                </Button>
                {hasActiveFilters ? (
                  <Button variant="ghost" onClick={clearFilters}>
                    Clear filters
                  </Button>
                ) : null}
              </div>
            </CardContent>
          </Card>

          <div className="flex flex-wrap items-center justify-between gap-2">
            <p
              role="status"
              aria-live="polite"
              className="text-caption text-ink-muted"
            >
              Showing {filtered.length} of {bookings.length} appointments
            </p>
            {hasActiveFilters ? (
              <p className="text-caption text-ink-muted">Filters active</p>
            ) : null}
          </div>

          {filtered.length === 0 ? (
            <EmptyState
              icon={<CalendarSearchIcon size={24} aria-hidden="true" />}
              title="No appointments found"
              description={
                dateInvalid
                  ? "Choose a valid business day, or turn on All dates."
                  : filterSummary
                    ? `No appointments match ${filterSummary}.`
                    : "There are no appointments in this demo yet. New bookings appear here automatically."
              }
              action={
                hasActiveFilters ? (
                  <Button variant="secondary" onClick={clearFilters}>
                    Clear filters
                  </Button>
                ) : undefined
              }
            />
          ) : (
            <>
              <Card className="hidden overflow-hidden md:block">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[52rem] border-collapse text-left text-sm">
                    <thead>
                      <tr className="border-b border-line bg-surface/60">
                        <th
                          scope="col"
                          className="px-5 py-3 text-caption font-medium uppercase tracking-[0.12em] text-ink-muted"
                        >
                          Customer
                        </th>
                        <th
                          scope="col"
                          className="px-5 py-3 text-caption font-medium uppercase tracking-[0.12em] text-ink-muted"
                        >
                          Service
                        </th>
                        <th
                          scope="col"
                          className="px-5 py-3 text-caption font-medium uppercase tracking-[0.12em] text-ink-muted"
                        >
                          Professional
                        </th>
                        <th
                          scope="col"
                          className="px-5 py-3 text-caption font-medium uppercase tracking-[0.12em] text-ink-muted"
                        >
                          Schedule
                        </th>
                        <th
                          scope="col"
                          className="px-5 py-3 text-caption font-medium uppercase tracking-[0.12em] text-ink-muted"
                        >
                          Status
                        </th>
                        <th
                          scope="col"
                          className="px-5 py-3 text-caption font-medium uppercase tracking-[0.12em] text-ink-muted"
                        >
                          Value
                        </th>
                        <th
                          scope="col"
                          className="px-5 py-3 text-right text-caption font-medium uppercase tracking-[0.12em] text-ink-muted"
                        >
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map((booking) => {
                        const service = servicesById.get(booking.serviceId);
                        const member = staffById.get(booking.staffId);

                        return (
                          <tr
                            key={booking.id}
                            onClick={() => openDetail(booking.id)}
                            className="cursor-pointer border-b border-line-subtle transition-colors last:border-0 hover:bg-elevated/50"
                          >
                            <td className="px-5 py-3.5">
                              <button
                                type="button"
                                onClick={(event) => {
                                  event.stopPropagation();
                                  openDetail(booking.id);
                                }}
                                className="flex items-center gap-3 rounded-control text-left"
                              >
                                <Avatar
                                  name={booking.customerName}
                                  size="sm"
                                />
                                <span className="min-w-0">
                                  <span className="block truncate font-medium text-ink">
                                    {booking.customerName}
                                  </span>
                                  <span
                                    className="block truncate text-caption text-ink-muted"
                                    title={booking.customerEmail}
                                  >
                                    {booking.customerEmail}
                                  </span>
                                  <span className="mt-0.5 block font-mono text-[11px] tracking-[0.08em] text-ink-muted">
                                    {booking.reference}
                                  </span>
                                </span>
                              </button>
                            </td>
                            <td className="px-5 py-3.5">
                              <span className="block font-medium text-ink">
                                {service?.name ?? "Service unavailable"}
                              </span>
                              <span className="block text-caption text-ink-muted">
                                {service
                                  ? formatDuration(service.durationMinutes)
                                  : "—"}
                              </span>
                            </td>
                            <td className="px-5 py-3.5">
                              <span className="flex items-center gap-2 text-ink">
                                <Avatar
                                  name={member?.name ?? "Unknown"}
                                  size="sm"
                                  className="h-6 w-6"
                                />
                                <span
                                  className="truncate"
                                  title={
                                    member?.name ?? "Professional unavailable"
                                  }
                                >
                                  {member?.name ?? "Professional unavailable"}
                                </span>
                              </span>
                            </td>
                            <td className="px-5 py-3.5">
                              <span className="block tabular-nums text-ink">
                                {formatDateLong(booking.startAt)}
                              </span>
                              <span className="block text-caption tabular-nums text-ink-muted">
                                {formatTime(booking.startAt)}
                              </span>
                            </td>
                            <td className="px-5 py-3.5">
                              <StatusBadge status={booking.status} />
                            </td>
                            <td className="px-5 py-3.5 tabular-nums text-ink">
                              {service ? formatPrice(service.price) : "—"}
                            </td>
                            <td className="px-5 py-3.5 text-right">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(event) => {
                                  event.stopPropagation();
                                  openDetail(booking.id);
                                }}
                                aria-label={`View booking ${booking.reference}`}
                              >
                                View
                              </Button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </Card>

              <Card className="overflow-hidden md:hidden">
                <div className="divide-y divide-line-subtle">
                  {filtered.map((booking) => {
                    const service = servicesById.get(booking.serviceId);
                    const member = staffById.get(booking.staffId);

                    return (
                      <button
                        key={booking.id}
                        type="button"
                        onClick={() => openDetail(booking.id)}
                        className="flex w-full flex-col gap-3 p-4 text-left transition-colors hover:bg-elevated/50"
                      >
                        <span className="flex items-start justify-between gap-3">
                          <span className="flex min-w-0 items-center gap-3">
                            <Avatar
                              name={booking.customerName}
                              size="md"
                            />
                            <span className="min-w-0">
                              <span className="block truncate text-sm font-semibold text-ink">
                                {booking.customerName}
                              </span>
                              <span
                                className="block truncate text-caption text-ink-muted"
                                title={booking.reference}
                              >
                                {booking.reference}
                              </span>
                            </span>
                          </span>
                          <StatusBadge
                            status={booking.status}
                            className="shrink-0"
                          />
                        </span>
                        <span className="grid grid-cols-2 gap-x-4 gap-y-2 text-caption">
                          <span className="min-w-0">
                            <span className="block text-ink-muted">
                              Service
                            </span>
                            <span
                              className="block truncate font-medium text-ink"
                              title={service?.name ?? "Service unavailable"}
                            >
                              {service?.name ?? "Service unavailable"}
                            </span>
                          </span>
                          <span className="min-w-0">
                            <span className="block text-ink-muted">
                              Professional
                            </span>
                            <span
                              className="block truncate font-medium text-ink"
                              title={
                                member?.name ?? "Professional unavailable"
                              }
                            >
                              {member?.name ?? "Professional unavailable"}
                            </span>
                          </span>
                          <span>
                            <span className="block text-ink-muted">
                              Schedule
                            </span>
                            <span className="block font-medium tabular-nums text-ink">
                              {formatDateShort(booking.startAt)} ·{" "}
                              {formatTime(booking.startAt)}
                            </span>
                          </span>
                          <span>
                            <span className="block text-ink-muted">Value</span>
                            <span className="block font-medium tabular-nums text-ink">
                              {service ? formatPrice(service.price) : "—"}
                            </span>
                          </span>
                        </span>
                        <span className="inline-flex items-center gap-1 text-caption font-medium text-brand-soft">
                          View details
                          <AltArrowRightIcon size={14} aria-hidden="true" />
                        </span>
                      </button>
                    );
                  })}
                </div>
              </Card>
            </>
          )}
        </div>
      )}

      {selectedBooking && !cancelTarget ? (
        <AppointmentDetail
          booking={selectedBooking}
          service={servicesById.get(selectedBooking.serviceId)}
          staff={staffById.get(selectedBooking.staffId)}
          onClose={() => setSelectedId(null)}
          feedback={feedback}
          footer={
            <AppointmentActions
              booking={selectedBooking}
              busy={busy}
              pendingStatus={pendingStatus}
              onUpdate={handleUpdate}
              onRequestCancel={requestCancel}
              onClose={() => setSelectedId(null)}
            />
          }
        />
      ) : null}

      {cancelTarget ? (
        <Modal
          open
          onClose={() => {
            setCancelTargetId(null);
            setCancelError(null);
          }}
          title="Cancel this booking?"
          description={`${cancelTarget.customerName} · ${formatDateLong(
            cancelTarget.startAt,
            { year: true },
          )} at ${formatTime(cancelTarget.startAt)}`}
          size="sm"
          footer={
            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Button
                variant="secondary"
                onClick={() => {
                  setCancelTargetId(null);
                  setCancelError(null);
                }}
                disabled={busy}
              >
                Keep booking
              </Button>
              <Button
                variant="destructive"
                onClick={confirmCancel}
                loading={pendingStatus === "cancelled"}
                disabled={busy}
              >
                Cancel booking
              </Button>
            </div>
          }
        >
          <p className="support-text">
            Cancelling marks this appointment as cancelled and frees the time
            slot for other clients. This cannot be undone.
          </p>
          {cancelError ? (
            <Alert variant="danger" className="mt-4">
              {cancelError}
            </Alert>
          ) : null}
        </Modal>
      ) : null}
    </div>
  );
}
