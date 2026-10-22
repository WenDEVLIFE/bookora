"use client";

import { useMemo, useState } from "react";
import {
  AddIcon,
  PenIcon,
  UsersGroupRoundedIcon,
} from "@/components/icons";
import { StaffFormModal } from "@/components/admin/staff/staff-form-modal";
import { formatWorkingHoursSummary } from "@/components/admin/staff/working-hours-editor";
import { PageHeader } from "@/components/admin/page-header";
import { Alert } from "@/components/ui/alert";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Modal } from "@/components/ui/modal";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDateLong, getBusinessNow, toDateKey } from "@/lib/date";
import { useDemoStore } from "@/lib/demo-store";
import type {
  Service,
  StaffMember,
  UnavailableSlot,
} from "@/lib/types";
import { cn } from "@/lib/utils";

const DEACTIVATE_CLASSES =
  "border-danger/40 text-danger hover:border-danger/60 hover:bg-danger-bg/60";

interface Feedback {
  variant: "success" | "danger";
  message: string;
}

function StaffSkeleton() {
  return (
    <div className="mt-6 space-y-5" aria-hidden="true">
      <div className="flex flex-wrap gap-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-6 w-28" rounded="full" />
        ))}
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <Skeleton key={index} className="h-80" />
        ))}
      </div>
    </div>
  );
}

function getNextTimeOff(
  member: StaffMember,
  todayKey: string,
): UnavailableSlot | undefined {
  return [...member.unavailableSlots]
    .filter((slot) => slot.date >= todayKey)
    .sort((a, b) => {
      if (a.date !== b.date) {
        return a.date.localeCompare(b.date);
      }

      return (a.startTime ?? "00:00").localeCompare(
        b.startTime ?? "00:00",
      );
    })[0];
}

export function StaffManager() {
  const { hydrated, staff, services, toggleStaffActive } = useDemoStore();
  const [formOpen, setFormOpen] = useState(false);
  const [formKey, setFormKey] = useState(0);
  const [editing, setEditing] = useState<StaffMember | undefined>();
  const [deactivateTarget, setDeactivateTarget] =
    useState<StaffMember | null>(null);
  const [deactivateError, setDeactivateError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<Feedback | null>(null);

  const todayKey = toDateKey(getBusinessNow());

  const serviceById = useMemo(
    () => new Map(services.map((service) => [service.id, service])),
    [services],
  );

  const activeCount = useMemo(
    () => staff.filter((member) => member.active).length,
    [staff],
  );

  const assignedServiceCount = useMemo(() => {
    const assigned = new Set<string>();

    for (const member of staff) {
      for (const serviceId of member.serviceIds) {
        assigned.add(serviceId);
      }
    }

    return assigned.size;
  }, [staff]);

  const upcomingTimeOff = useMemo(
    () =>
      staff.reduce(
        (sum, member) =>
          sum +
          member.unavailableSlots.filter((slot) => slot.date >= todayKey)
            .length,
        0,
      ),
    [staff, todayKey],
  );

  function openCreate() {
    setEditing(undefined);
    setFeedback(null);
    setFormKey((current) => current + 1);
    setFormOpen(true);
  }

  function openEdit(member: StaffMember) {
    setEditing(member);
    setFeedback(null);
    setFormKey((current) => current + 1);
    setFormOpen(true);
  }

  function closeForm() {
    setFormOpen(false);
    setEditing(undefined);
  }

  function handleSaved(member: StaffMember) {
    const wasEditing = Boolean(editing);

    setFormOpen(false);
    setEditing(undefined);
    setFeedback({
      variant: "success",
      message: wasEditing
        ? `${member.name}'s profile was updated.`
        : `${member.name} was added to the team.`,
    });
  }

  function requestActivate(member: StaffMember) {
    setFeedback(null);

    const result = toggleStaffActive(member.id);

    if (result.ok) {
      setFeedback({
        variant: "success",
        message: `${result.data.name} is now accepting new bookings.`,
      });
      return;
    }

    setFeedback({ variant: "danger", message: result.error });
  }

  function requestDeactivate(member: StaffMember) {
    setFeedback(null);
    setDeactivateError(null);
    setDeactivateTarget(member);
  }

  function confirmDeactivate() {
    if (!deactivateTarget) {
      return;
    }

    const result = toggleStaffActive(deactivateTarget.id);

    if (result.ok) {
      setDeactivateTarget(null);
      setDeactivateError(null);
      setFeedback({
        variant: "success",
        message: `${result.data.name} was deactivated. Existing appointments are unchanged.`,
      });
      return;
    }

    setDeactivateError(result.error);
  }

  function renderServiceChips(member: StaffMember) {
    const assigned = member.serviceIds
      .map((serviceId) => serviceById.get(serviceId))
      .filter((service): service is Service => Boolean(service));
    const visible = assigned.slice(0, 3);
    const hidden = assigned.length - visible.length;

    if (assigned.length === 0) {
      return (
        <p className="text-caption text-ink-muted">
          No services assigned
        </p>
      );
    }

    return (
      <div className="flex flex-wrap gap-1.5">
        {visible.map((service) => (
          <Badge
            key={service.id}
            variant="neutral"
            className="max-w-full"
            title={service.name}
          >
            <span className="truncate">{service.name}</span>
          </Badge>
        ))}
        {hidden > 0 ? (
          <Badge variant="neutral">+{hidden} more</Badge>
        ) : null}
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Staff"
        eyebrow="Management"
        description="Manage profiles, service assignments, working hours, and time off."
        actions={
          <Button
            leftIcon={<AddIcon size={18} aria-hidden="true" />}
            onClick={openCreate}
            disabled={!hydrated}
          >
            Add staff member
          </Button>
        }
      />

      {!hydrated ? (
        <StaffSkeleton />
      ) : (
        <div className="mt-6 space-y-5">
          <div className="flex flex-wrap gap-2">
            <Badge variant="neutral">
              {staff.length} {staff.length === 1 ? "staff member" : "staff"}
            </Badge>
            <Badge variant="success" dot>
              {activeCount} active
            </Badge>
            <Badge variant="brand">
              {assignedServiceCount}{" "}
              {assignedServiceCount === 1 ? "service assigned" : "services assigned"}
            </Badge>
            <Badge variant="warning">
              {upcomingTimeOff} upcoming time off
            </Badge>
          </div>

          {feedback ? (
            <Alert
              variant={feedback.variant}
              title={
                feedback.variant === "success"
                  ? "Staff saved"
                  : "Action failed"
              }
            >
              {feedback.message}
            </Alert>
          ) : null}

          {staff.length === 0 ? (
            <EmptyState
              icon={<UsersGroupRoundedIcon size={24} aria-hidden="true" />}
              title="No staff yet"
              description="Add your first staff member to assign services and availability."
              action={
                <Button
                  leftIcon={<AddIcon size={18} aria-hidden="true" />}
                  onClick={openCreate}
                >
                  Add staff member
                </Button>
              }
            />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {staff.map((member) => {
                const next = getNextTimeOff(member, todayKey);

                return (
                  <Card
                    key={member.id}
                    className={cn(
                      "flex flex-col",
                      !member.active && "opacity-70",
                    )}
                  >
                    <CardContent className="flex flex-1 flex-col gap-4">
                      <div className="flex items-start gap-3">
                        <Avatar name={member.name} size="lg" />
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h2 className="heading-card truncate text-ink">
                              {member.name}
                            </h2>
                            <Badge
                              variant={member.active ? "success" : "neutral"}
                              dot
                            >
                              {member.active ? "Active" : "Inactive"}
                            </Badge>
                          </div>
                          <p className="mt-0.5 text-caption text-ink-muted">
                            {member.role}
                          </p>
                        </div>
                      </div>

                      <p className="line-clamp-2 text-caption leading-relaxed text-ink-secondary">
                        {member.bio || "No bio added yet."}
                      </p>

                      <div>
                        <p className="text-caption font-medium uppercase tracking-[0.12em] text-ink-muted">
                          Services
                        </p>
                        <div className="mt-2">
                          {renderServiceChips(member)}
                        </div>
                      </div>

                      <dl className="mt-auto space-y-2 border-t border-line-subtle pt-3 text-caption">
                        <div>
                          <dt className="text-ink-muted">Working days</dt>
                          <dd className="mt-0.5 text-ink-secondary">
                            {formatWorkingHoursSummary(
                              member.workingHours,
                            )}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-ink-muted">Time off</dt>
                          <dd className="mt-0.5 text-ink-secondary">
                            {member.unavailableSlots.length}{" "}
                            {member.unavailableSlots.length === 1
                              ? "entry"
                              : "entries"}
                            {next
                              ? ` · Next: ${formatDateLong(next.date, {
                                  year: true,
                                })}${next.reason ? ` · ${next.reason}` : ""}`
                              : " · None upcoming"}
                          </dd>
                        </div>
                      </dl>
                    </CardContent>

                    <CardFooter className="mt-auto gap-2 border-t border-line-subtle pt-4">
                      <Button
                        variant="secondary"
                        size="sm"
                        leftIcon={<PenIcon size={15} aria-hidden="true" />}
                        onClick={() => openEdit(member)}
                      >
                        Edit
                      </Button>
                      {member.active ? (
                        <Button
                          variant="outline"
                          size="sm"
                          className={DEACTIVATE_CLASSES}
                          onClick={() => requestDeactivate(member)}
                        >
                          Deactivate
                        </Button>
                      ) : (
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => requestActivate(member)}
                        >
                          Activate
                        </Button>
                      )}
                    </CardFooter>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}

      <StaffFormModal
        key={formKey}
        open={formOpen}
        member={editing}
        onClose={closeForm}
        onSaved={handleSaved}
      />

      <Modal
        open={deactivateTarget !== null}
        onClose={() => {
          setDeactivateTarget(null);
          setDeactivateError(null);
        }}
        title="Deactivate this staff member?"
        description={deactivateTarget?.name}
        size="sm"
        footer={
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button
              variant="secondary"
              onClick={() => {
                setDeactivateTarget(null);
                setDeactivateError(null);
              }}
            >
              Keep active
            </Button>
            <Button variant="destructive" onClick={confirmDeactivate}>
              Deactivate staff member
            </Button>
          </div>
        }
      >
        <p className="support-text">
          They will be removed from new bookings. Existing appointments and
          history are kept.
        </p>
        {deactivateError ? (
          <Alert variant="danger" className="mt-4">
            {deactivateError}
          </Alert>
        ) : null}
      </Modal>
    </div>
  );
}
