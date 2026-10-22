"use client";

import Link from "next/link";
import { useMemo, useState, useSyncExternalStore } from "react";
import {
  AltArrowRightIcon,
  CalendarIcon,
  CalendarMarkIcon,
  CalendarSearchIcon,
  CheckCircleIcon,
  ClockCircleIcon,
  CloseCircleIcon,
  ScissorsIcon,
  UsersGroupRoundedIcon,
  WalletMoneyIcon,
} from "@/components/icons";
import { PageHeader } from "@/components/admin/page-header";
import { Alert } from "@/components/ui/alert";
import { Avatar } from "@/components/ui/avatar";
import { Badge, StatusBadge } from "@/components/ui/badge";
import { buttonClasses } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { StatCard } from "@/components/ui/stat-card";
import {
  addDaysToKey,
  formatDateLong,
  formatDateShort,
  formatPrice,
  formatTime,
  getBusinessNow,
  parseDateKey,
  toDateKey,
} from "@/lib/date";
import { useDemoStore } from "@/lib/demo-store";
import type { Booking, Service, StaffMember } from "@/lib/types";
import { cn } from "@/lib/utils";

interface DayOutlook {
  key: string;
  count: number;
}

const subscribeToNothing = () => () => {};
const getClientMounted = () => true;
const getServerMounted = () => false;

interface DashboardMetrics {
  nonCancelledCount: number;
  upcomingCount: number;
  completed: number;
  cancelled: number;
  value: number;
  upcoming: Booking[];
  activity: Booking[];
  outlook: DayOutlook[];
}

function isValidDateKey(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  return !Number.isNaN(parseDateKey(value).getTime());
}

function DashboardSkeleton() {
  return (
    <div className="mt-6 space-y-6" aria-hidden="true">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <Skeleton className="h-3 w-20" rounded="full" />
          <Skeleton className="h-10 w-44" rounded="sm" />
        </div>
        <Skeleton className="h-4 w-36" rounded="sm" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {Array.from({ length: 5 }).map((_, index) => (
          <Skeleton key={index} className="h-32" />
        ))}
      </div>
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
        <Skeleton className="h-80" />
        <Skeleton className="h-80" />
      </div>
      <div className="grid gap-6 xl:grid-cols-2">
        <Skeleton className="h-64" />
        <Skeleton className="h-64" />
      </div>
    </div>
  );
}

function OutlookChart({
  day,
  outlook,
}: {
  day: string;
  outlook: DayOutlook[];
}) {
  const max = Math.max(1, ...outlook.map((entry) => entry.count));
  const total = outlook.reduce((sum, entry) => sum + entry.count, 0);
  const peak = outlook.reduce(
    (best, entry) => (entry.count > best.count ? entry : best),
    outlook[0],
  );
  const lastKey = outlook[outlook.length - 1]?.key ?? day;

  return (
    <Card>
      <CardHeader className="flex-row items-start justify-between gap-3">
        <div className="min-w-0">
          <CardTitle>7-day outlook</CardTitle>
          <CardDescription>
            Non-cancelled appointments from {formatDateLong(day)} to{" "}
            {formatDateLong(lastKey)}.
          </CardDescription>
        </div>
        <Badge variant="brand">{total} total</Badge>
      </CardHeader>
      <CardContent>
        <div
          role="group"
          aria-label="Seven-day booking outlook"
          className="flex h-48 items-end gap-1.5 sm:gap-3"
        >
          {outlook.map((entry) => {
            const percent =
              entry.count === 0
                ? 4
                : Math.max(10, Math.round((entry.count / max) * 100));

            return (
              <div
                key={entry.key}
                role="img"
                aria-label={`${formatDateLong(entry.key, {
                  year: true,
                })}: ${entry.count} ${
                  entry.count === 1 ? "booking" : "bookings"
                }`}
                className="flex min-w-0 flex-1 flex-col items-center gap-2"
              >
                <span
                  aria-hidden="true"
                  className="text-[0.625rem] font-medium tabular-nums text-ink sm:text-caption"
                >
                  {entry.count}
                </span>
                <div
                  aria-hidden="true"
                  className="flex h-28 w-full items-end overflow-hidden rounded-sm bg-surface/70 sm:h-32"
                >
                  <div
                    className={cn(
                      "w-full rounded-sm transition-colors",
                      entry.count > 0 ? "bg-brand" : "bg-line-strong/60",
                    )}
                    style={{ height: `${percent}%` }}
                  />
                </div>
                <span
                  aria-hidden="true"
                  className="text-[0.625rem] text-ink-muted sm:text-caption"
                >
                  {formatDateShort(entry.key)}
                </span>
              </div>
            );
          })}
        </div>
        <p className="mt-4 text-caption text-ink-muted">
          {total === 0
            ? "No non-cancelled appointments in this range."
            : `${total} ${
                total === 1 ? "booking" : "bookings"
              } across seven days. Peak day: ${formatDateLong(
                peak.key,
              )} with ${peak.count}.`}
        </p>
      </CardContent>
    </Card>
  );
}

function UpcomingPanel({
  upcoming,
  servicesById,
  staffById,
}: {
  upcoming: Booking[];
  servicesById: Map<string, Service>;
  staffById: Map<string, StaffMember>;
}) {
  return (
    <Card className="flex flex-col">
      <CardHeader className="flex-row items-start justify-between gap-3">
        <div className="min-w-0">
          <CardTitle>Upcoming appointments</CardTitle>
          <CardDescription>
            Next pending or confirmed bookings.
          </CardDescription>
        </div>
        <Link
          href="/admin/appointments"
          className={buttonClasses({ variant: "ghost", size: "sm" })}
        >
          View all
        </Link>
      </CardHeader>
      <CardContent className="flex-1">
        {upcoming.length === 0 ? (
          <EmptyState
            icon={<CalendarSearchIcon size={22} aria-hidden="true" />}
            title="No upcoming appointments"
            description="New pending or confirmed bookings will appear here."
          />
        ) : (
          <ul className="space-y-1">
            {upcoming.map((booking) => {
              const service = servicesById.get(booking.serviceId);
              const member = staffById.get(booking.staffId);

              return (
                <li key={booking.id}>
                  <Link
                    href={`/booking/${booking.id}`}
                    className="block rounded-input p-2.5 transition-colors hover:bg-elevated/60"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-caption font-medium tabular-nums text-ink-secondary">
                        {formatDateLong(booking.startAt)} ·{" "}
                        {formatTime(booking.startAt)}
                      </span>
                      <StatusBadge status={booking.status} />
                    </div>
                    <div className="mt-2 flex items-center gap-3">
                      <Avatar name={booking.customerName} size="sm" />
                      <div className="min-w-0">
                        <p
                          className="truncate text-sm font-medium text-ink"
                          title={booking.customerName}
                        >
                          {booking.customerName}
                        </p>
                        <p
                          className="truncate text-caption text-ink-muted"
                          title={`${service?.name ?? "Service unavailable"} · ${
                            member?.name ?? "Professional unavailable"
                          }`}
                        >
                          {service?.name ?? "Service unavailable"} ·{" "}
                          {member?.name ?? "Professional unavailable"}
                        </p>
                      </div>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

function RecentActivityPanel({ activity }: { activity: Booking[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent activity</CardTitle>
        <CardDescription>Last bookings created in this demo.</CardDescription>
      </CardHeader>
      <CardContent>
        {activity.length === 0 ? (
          <EmptyState
            icon={<ClockCircleIcon size={22} aria-hidden="true" />}
            title="No activity yet"
            description="Bookings created in this browser will show up here."
          />
        ) : (
          <ul className="space-y-1">
            {activity.map((booking) => (
              <li key={booking.id}>
                <Link
                  href={`/booking/${booking.id}`}
                  className="flex items-center gap-3 rounded-input p-2.5 transition-colors hover:bg-elevated/60"
                >
                  <Avatar name={booking.customerName} size="sm" />
                  <div className="min-w-0 flex-1">
                    <p
                      className="truncate text-sm font-medium text-ink"
                      title={booking.customerName}
                    >
                      {booking.customerName}
                    </p>
                    <p
                      className="truncate text-caption text-ink-muted"
                      title={`${booking.reference} · ${formatDateShort(
                        booking.createdAt,
                      )}`}
                    >
                      {booking.reference} · {formatDateShort(booking.createdAt)}
                    </p>
                  </div>
                  <StatusBadge status={booking.status} />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

function QuickLinksPanel() {
  const links = [
    {
      href: "/admin/appointments",
      label: "Appointments",
      description: "Review and update bookings",
      icon: CalendarIcon,
    },
    {
      href: "/admin/services",
      label: "Services",
      description: "Manage the service menu",
      icon: ScissorsIcon,
    },
    {
      href: "/admin/staff",
      label: "Staff",
      description: "Profiles and availability",
      icon: UsersGroupRoundedIcon,
    },
  ] as const;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Manage the studio</CardTitle>
        <CardDescription>Jump into the demo admin tools.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
        {links.map((link) => {
          const Icon = link.icon;

          return (
            <Link
              key={link.href}
              href={link.href}
              className="group flex items-start gap-3 rounded-input border border-line bg-surface/50 p-4 transition-colors hover:border-line-strong hover:bg-elevated"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-control border border-line-subtle bg-elevated text-brand-soft">
                <Icon size={18} aria-hidden="true" />
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-semibold text-ink">
                  {link.label}
                </span>
                <span className="mt-0.5 block text-caption text-ink-muted">
                  {link.description}
                </span>
              </span>
              <AltArrowRightIcon
                size={16}
                aria-hidden="true"
                className="ml-auto mt-1 shrink-0 text-ink-muted transition-transform group-hover:translate-x-0.5"
              />
            </Link>
          );
        })}
      </CardContent>
    </Card>
  );
}

export function DashboardOverview() {
  const { hydrated, bookings, services, staff } = useDemoStore();
  const mounted = useSyncExternalStore(
    subscribeToNothing,
    getClientMounted,
    getServerMounted,
  );
  const [day, setDay] = useState(() => toDateKey(getBusinessNow()));

  const ready = hydrated && mounted;
  const validDay = isValidDateKey(day);

  const servicesById = useMemo(
    () => new Map(services.map((service) => [service.id, service])),
    [services],
  );
  const staffById = useMemo(
    () => new Map(staff.map((member) => [member.id, member])),
    [staff],
  );

  const metrics = useMemo<DashboardMetrics | null>(() => {
    if (!validDay) {
      return null;
    }

    const nowMs = getBusinessNow().getTime();
    const selected = bookings.filter(
      (booking) => toDateKey(booking.startAt) === day,
    );
    const nonCancelled = selected.filter(
      (booking) => booking.status !== "cancelled",
    );
    const completed = selected.filter(
      (booking) => booking.status === "completed",
    ).length;
    const cancelled = selected.filter(
      (booking) => booking.status === "cancelled",
    ).length;
    const value = nonCancelled.reduce(
      (sum, booking) =>
        sum + (servicesById.get(booking.serviceId)?.price ?? 0),
      0,
    );
    const upcomingAll = bookings
      .filter(
        (booking) =>
          (booking.status === "pending" || booking.status === "confirmed") &&
          new Date(booking.startAt).getTime() >= nowMs,
      )
      .sort(
        (a, b) =>
          new Date(a.startAt).getTime() - new Date(b.startAt).getTime(),
      );
    const activity = [...bookings]
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      )
      .slice(0, 5);
    const outlook: DayOutlook[] = Array.from({ length: 7 }, (_, index) => {
      const key = addDaysToKey(day, index);
      const count = bookings.filter(
        (booking) =>
          booking.status !== "cancelled" &&
          toDateKey(booking.startAt) === key,
      ).length;

      return { key, count };
    });

    return {
      nonCancelledCount: nonCancelled.length,
      upcomingCount: upcomingAll.length,
      completed,
      cancelled,
      value,
      upcoming: upcomingAll.slice(0, 5),
      activity,
      outlook,
    };
  }, [bookings, day, servicesById, validDay]);

  return (
    <div>
      <PageHeader
        title="Dashboard"
        eyebrow="Overview"
        description="A live view of the selected business day, upcoming appointments, and estimated service value."
      />

      {!ready ? (
        <DashboardSkeleton />
      ) : (
        <div className="mt-6 space-y-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex flex-wrap items-end gap-3">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="dashboard-day">Business day</Label>
                <Input
                  id="dashboard-day"
                  type="date"
                  value={day}
                  onChange={(event) => setDay(event.target.value)}
                  className="w-[11rem]"
                />
              </div>
              <p className="pb-2.5 text-sm text-ink-secondary">
                {validDay
                  ? formatDateLong(day, { year: true })
                  : "Choose a valid date"}
              </p>
            </div>
            <p className="pb-2.5 text-caption text-ink-muted">
              All times in Asia/Manila
            </p>
          </div>

          {!validDay ? (
            <Alert variant="warning" title="Choose a business day">
              Enter a valid date to see metrics and the seven-day outlook.
            </Alert>
          ) : metrics ? (
            <>
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
                <StatCard
                  label="Bookings"
                  value={metrics.nonCancelledCount}
                  hint="Non-cancelled on this day"
                  icon={<CalendarMarkIcon size={20} aria-hidden="true" />}
                />
                <StatCard
                  label="Upcoming"
                  value={metrics.upcomingCount}
                  hint="Pending or confirmed from now"
                  icon={<ClockCircleIcon size={20} aria-hidden="true" />}
                />
                <StatCard
                  label="Completed"
                  value={metrics.completed}
                  hint="Completed on this day"
                  icon={<CheckCircleIcon size={20} aria-hidden="true" />}
                />
                <StatCard
                  label="Estimated value"
                  value={formatPrice(metrics.value)}
                  hint="Non-cancelled services"
                  icon={<WalletMoneyIcon size={20} aria-hidden="true" />}
                />
                <StatCard
                  label="Cancelled"
                  value={metrics.cancelled}
                  hint="Excluded from totals"
                  icon={<CloseCircleIcon size={20} aria-hidden="true" />}
                />
              </div>

              <div className="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
                <OutlookChart day={day} outlook={metrics.outlook} />
                <UpcomingPanel
                  upcoming={metrics.upcoming}
                  servicesById={servicesById}
                  staffById={staffById}
                />
              </div>

              <div className="grid gap-6 xl:grid-cols-2">
                <RecentActivityPanel activity={metrics.activity} />
                <QuickLinksPanel />
              </div>
            </>
          ) : null}
        </div>
      )}
    </div>
  );
}
