"use client";

import { useId, useMemo, useState, type FormEvent } from "react";
import { TimeOffEditor } from "@/components/admin/staff/time-off-editor";
import {
  DEFAULT_CLOSE,
  DEFAULT_OPEN,
  buildDayRows,
  rowsToWorkingHours,
  WorkingHoursEditor,
  type DayRow,
} from "@/components/admin/staff/working-hours-editor";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { Textarea } from "@/components/ui/textarea";
import { useDemoStore } from "@/lib/demo-store";
import type {
  StaffMember,
  UnavailableSlot,
  Weekday,
  WorkingHours,
} from "@/lib/types";
import { cn } from "@/lib/utils";
import { validateStaff, type ValidationErrors } from "@/lib/validation";

const DEFAULT_DAYS: Weekday[] = [1, 2, 3, 4, 5, 6];

const DEFAULT_STAFF_HOURS: WorkingHours[] = DEFAULT_DAYS.map((day) => ({
  day,
  open: DEFAULT_OPEN,
  close: DEFAULT_CLOSE,
}));

function clearFieldError(
  errors: ValidationErrors,
  field: string,
): ValidationErrors {
  if (!errors[field]) {
    return errors;
  }

  const next = { ...errors };
  delete next[field];

  return next;
}

export interface StaffFormModalProps {
  open: boolean;
  member?: StaffMember;
  onClose: () => void;
  onSaved: (member: StaffMember) => void;
}

export function StaffFormModal({
  open,
  member,
  onClose,
  onSaved,
}: StaffFormModalProps) {
  const { services, saveStaff } = useDemoStore();
  const [name, setName] = useState(member?.name ?? "");
  const [role, setRole] = useState(member?.role ?? "");
  const [bio, setBio] = useState(member?.bio ?? "");
  const [serviceIds, setServiceIds] = useState<string[]>(() =>
    member ? [...member.serviceIds] : [],
  );
  const [dayRows, setDayRows] = useState<DayRow[]>(() =>
    buildDayRows(
      member
        ? member.workingHours.map((entry) => ({ ...entry }))
        : DEFAULT_STAFF_HOURS,
    ),
  );
  const [slots, setSlots] = useState<UnavailableSlot[]>(() =>
    member ? member.unavailableSlots.map((slot) => ({ ...slot })) : [],
  );
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [dayErrors, setDayErrors] = useState<Record<number, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const rawId = useId();
  const formId = `staff-form-${rawId.replace(/:/g, "")}`;

  const selectedServiceIds = useMemo(
    () => new Set(serviceIds),
    [serviceIds],
  );

  function toggleService(id: string, checked: boolean) {
    setServiceIds((current) =>
      checked
        ? [...new Set([...current, id])]
        : current.filter((value) => value !== id),
    );
    setErrors((current) => clearFieldError(current, "serviceIds"));
  }

  function handleWorkingHoursChange(next: DayRow[]) {
    setDayRows(next);
    setDayErrors({});
    setErrors((current) => clearFieldError(current, "workingHours"));
  }

  function addSlot(slot: UnavailableSlot) {
    setSlots((current) => [...current, slot]);
  }

  function removeSlot(id: string) {
    setSlots((current) => current.filter((slot) => slot.id !== id));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const workingHours = rowsToWorkingHours(dayRows);
    const nextErrors = validateStaff({
      name,
      role,
      serviceIds,
      workingHours,
    });
    const nextDayErrors: Record<number, string> = {};

    for (const row of dayRows) {
      if (!row.enabled) {
        continue;
      }

      if (!row.open || !row.close) {
        nextDayErrors[row.day] =
          "Set both an opening and closing time.";
        continue;
      }

      if (row.open >= row.close) {
        nextDayErrors[row.day] =
          "Closing time must be after opening time.";
      }
    }

    if (Object.keys(nextDayErrors).length > 0) {
      nextErrors.workingHours = "Fix the highlighted working days.";
    }

    if (bio.trim().length > 400) {
      nextErrors.bio = "Keep the bio to 400 characters or less.";
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      setDayErrors(nextDayErrors);
      setFormError("Please review the highlighted fields.");
      return;
    }

    setSubmitting(true);
    setFormError(null);

    const result = saveStaff({
      name: name.trim(),
      role: role.trim(),
      bio: bio.trim(),
      serviceIds: [...serviceIds],
      workingHours,
      unavailableSlots: slots.map((slot) => ({ ...slot })),
      active: member?.active ?? true,
      ...(member ? { id: member.id } : {}),
    });

    setSubmitting(false);

    if (!result.ok) {
      setErrors(result.fieldErrors ?? {});
      setFormError(result.error);
      return;
    }

    onSaved(result.data);
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={member ? "Edit staff member" : "Add staff member"}
      description={
        member
          ? `Update ${member.name}'s profile and availability.`
          : "Create a profile, assign services, and set availability."
      }
      size="lg"
      footer={
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button
            variant="secondary"
            onClick={onClose}
            disabled={submitting}
            className="h-11"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            form={formId}
            loading={submitting}
            className="h-11"
          >
            {member ? "Save changes" : "Create staff member"}
          </Button>
        </div>
      }
    >
      <form
        id={formId}
        onSubmit={handleSubmit}
        className="space-y-6"
        noValidate
      >
        {formError ? (
          <Alert variant="danger" title="Could not save staff member">
            {formError}
          </Alert>
        ) : null}

        <fieldset className="min-w-0 space-y-4">
          <legend className="heading-card text-ink">Profile</legend>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Full name" required error={errors.name}>
              <Input
                value={name}
                onChange={(event) => {
                  setName(event.target.value);
                  setErrors((current) => clearFieldError(current, "name"));
                }}
                placeholder="Ana Reyes"
                autoComplete="name"
                className="h-11"
              />
            </Field>

            <Field label="Role" required error={errors.role}>
              <Input
                value={role}
                onChange={(event) => {
                  setRole(event.target.value);
                  setErrors((current) => clearFieldError(current, "role"));
                }}
                placeholder="Senior Hair Stylist"
                autoComplete="organization-title"
                className="h-11"
              />
            </Field>
          </div>

          <Field
            label="Bio"
            error={errors.bio}
            hint="Optional. Up to 400 characters."
          >
            <Textarea
              value={bio}
              onChange={(event) => {
                setBio(event.target.value);
                setErrors((current) => clearFieldError(current, "bio"));
              }}
              placeholder="Describe their specialties and approach."
              maxLength={400}
              className="min-h-[96px]"
            />
          </Field>
        </fieldset>

        <fieldset className="min-w-0 space-y-3">
          <legend className="heading-card text-ink">Services</legend>
          <p className="text-caption text-ink-muted">
            Assign at least one service. Inactive services can stay assigned for
            existing bookings.
          </p>
          {errors.serviceIds ? (
            <p role="alert" className="text-caption text-danger">
              {errors.serviceIds}
            </p>
          ) : null}
          {services.length === 0 ? (
            <p className="text-caption text-ink-muted">
              No services yet. Create a service first.
            </p>
          ) : (
            <div className="grid gap-2 sm:grid-cols-2">
              {services.map((service) => {
                const checked = selectedServiceIds.has(service.id);

                return (
                  <label
                    key={service.id}
                    className={cn(
                      "flex min-h-11 cursor-pointer items-start gap-3 rounded-input border px-3 py-2 transition-colors",
                      checked
                        ? "border-brand/40 bg-brand-tint/40"
                        : "border-line-subtle bg-surface/40 hover:border-line-strong",
                    )}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={(event) =>
                        toggleService(service.id, event.target.checked)
                      }
                      className="mt-1 h-4 w-4 shrink-0 accent-brand"
                    />
                    <span className="min-w-0">
                      <span
                        className={cn(
                          "block truncate text-sm font-medium",
                          checked ? "text-ink" : "text-ink-secondary",
                        )}
                      >
                        {service.name}
                      </span>
                      <span className="block text-caption text-ink-muted">
                        {service.category}
                        {service.active ? "" : " · Inactive"}
                      </span>
                    </span>
                  </label>
                );
              })}
            </div>
          )}
        </fieldset>

        <fieldset className="min-w-0 space-y-3">
          <legend className="heading-card text-ink">Working hours</legend>
          <p className="text-caption text-ink-muted">
            Enable working days and set opening and closing times.
          </p>
          {errors.workingHours ? (
            <p role="alert" className="text-caption text-danger">
              {errors.workingHours}
            </p>
          ) : null}
          <WorkingHoursEditor
            rows={dayRows}
            errors={dayErrors}
            onChange={handleWorkingHoursChange}
          />
        </fieldset>

        <fieldset className="min-w-0 space-y-3">
          <legend className="heading-card text-ink">Time off</legend>
          <p className="text-caption text-ink-muted">
            Block full days or specific hours. Leave both times blank for a full
            day.
          </p>
          <TimeOffEditor
            slots={slots}
            onAdd={addSlot}
            onRemove={removeSlot}
          />
        </fieldset>
      </form>
    </Modal>
  );
}
