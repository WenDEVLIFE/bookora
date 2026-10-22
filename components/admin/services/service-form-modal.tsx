"use client";

import { useId, useState, type FormEvent } from "react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Modal } from "@/components/ui/modal";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { SERVICE_CATEGORIES } from "@/lib/constants";
import { formatDuration } from "@/lib/date";
import { useDemoStore } from "@/lib/demo-store";
import type { Service, ServiceCategory } from "@/lib/types";
import {
  validateService,
  type ValidationErrors,
} from "@/lib/validation";

const DURATION_OPTIONS = Array.from(
  { length: 32 },
  (_, index) => (index + 1) * 15,
);

interface ServiceFormState {
  name: string;
  description: string;
  category: ServiceCategory;
  price: string;
  durationMinutes: string;
  active: boolean;
}

function initialState(service?: Service): ServiceFormState {
  return {
    name: service?.name ?? "",
    description: service?.description ?? "",
    category: service?.category ?? "Hair",
    price: service ? String(service.price) : "",
    durationMinutes: service ? String(service.durationMinutes) : "60",
    active: service?.active ?? true,
  };
}

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

export interface ServiceFormModalProps {
  open: boolean;
  service?: Service;
  onClose: () => void;
  onSaved: (service: Service) => void;
}

export function ServiceFormModal({
  open,
  service,
  onClose,
  onSaved,
}: ServiceFormModalProps) {
  const { saveService } = useDemoStore();
  const [form, setForm] = useState<ServiceFormState>(() =>
    initialState(service),
  );
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const rawId = useId();
  const formId = `service-form-${rawId.replace(/:/g, "")}`;
  const priceId = `${formId}-price`;

  function update<K extends keyof ServiceFormState>(
    key: K,
    value: ServiceFormState[K],
  ) {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => clearFieldError(current, key));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const priceValue =
      form.price.trim() === "" ? Number.NaN : Number(form.price);
    const durationValue =
      form.durationMinutes.trim() === ""
        ? Number.NaN
        : Number(form.durationMinutes);
    const nextErrors = validateService({
      name: form.name,
      description: form.description,
      price: priceValue,
      durationMinutes: durationValue,
      category: form.category,
    });

    if (form.description.trim().length > 400) {
      nextErrors.description =
        "Keep the description to 400 characters or less.";
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      setFormError("Please review the highlighted fields.");
      return;
    }

    setSubmitting(true);
    setFormError(null);

    const result = saveService({
      name: form.name.trim(),
      description: form.description.trim(),
      category: form.category,
      price: priceValue,
      durationMinutes: durationValue,
      active: form.active,
      ...(service ? { id: service.id } : {}),
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
      title={service ? "Edit service" : "Add service"}
      description={
        service
          ? `Update the details for ${service.name}.`
          : "Create a service customers can book."
      }
      size="lg"
      footer={
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button variant="secondary" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button type="submit" form={formId} loading={submitting}>
            {service ? "Save changes" : "Create service"}
          </Button>
        </div>
      }
    >
      <form
        id={formId}
        onSubmit={handleSubmit}
        className="space-y-5"
        noValidate
      >
        {formError ? (
          <Alert variant="danger" title="Could not save service">
            {formError}
          </Alert>
        ) : null}

        <Field label="Service name" required error={errors.name}>
          <Input
            value={form.name}
            onChange={(event) => update("name", event.target.value)}
            placeholder="Signature Haircut"
            autoComplete="off"
          />
        </Field>

        <Field
          label="Description"
          required
          error={errors.description}
          hint="Between 10 and 400 characters."
        >
          <Textarea
            value={form.description}
            onChange={(event) => update("description", event.target.value)}
            placeholder="Describe what the service includes and who it is for."
            maxLength={400}
            className="min-h-[96px]"
          />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Category" required error={errors.category}>
            <Select
              value={form.category}
              onChange={(event) =>
                update("category", event.target.value as ServiceCategory)
              }
            >
              {SERVICE_CATEGORIES.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </Select>
          </Field>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor={priceId} required>
              Price
            </Label>
            <div className="relative">
              <span
                aria-hidden="true"
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-ink-muted"
              >
                ₱
              </span>
              <Input
                id={priceId}
                type="number"
                inputMode="decimal"
                min={1}
                max={100000}
                step={1}
                value={form.price}
                onChange={(event) => update("price", event.target.value)}
                placeholder="850"
                invalid={Boolean(errors.price)}
                aria-describedby={
                  errors.price ? `${priceId}-error` : `${priceId}-hint`
                }
                className="pl-7 tabular-nums"
              />
            </div>
            {errors.price ? (
              <p
                id={`${priceId}-error`}
                role="alert"
                className="text-caption text-danger"
              >
                {errors.price}
              </p>
            ) : (
              <p
                id={`${priceId}-hint`}
                className="text-caption text-ink-muted"
              >
                Philippine peso. Between ₱1 and ₱100,000.
              </p>
            )}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="Duration"
            required
            error={errors.durationMinutes}
            hint="Bookings step in 15-minute increments."
          >
            <Select
              value={form.durationMinutes}
              onChange={(event) =>
                update("durationMinutes", event.target.value)
              }
            >
              {DURATION_OPTIONS.map((minutes) => (
                <option key={minutes} value={minutes}>
                  {formatDuration(minutes)}
                </option>
              ))}
            </Select>
          </Field>

          <div className="flex flex-col gap-1.5">
            <span className="label-text">Availability</span>
            <label className="flex min-h-11 cursor-pointer items-center gap-3 rounded-input border border-line bg-input px-3 py-2 text-sm text-ink">
              <input
                type="checkbox"
                checked={form.active}
                onChange={(event) => update("active", event.target.checked)}
                className="h-4 w-4 shrink-0 accent-brand"
              />
              <span className="min-w-0">
                <span className="block font-medium">
                  Active for new bookings
                </span>
                <span className="block text-caption text-ink-muted">
                  Inactive services stay in history but leave the catalog.
                </span>
              </span>
            </label>
          </div>
        </div>
      </form>
    </Modal>
  );
}
