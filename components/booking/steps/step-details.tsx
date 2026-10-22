import { ShieldCheckIcon } from "@/components/icons";
import type { CustomerDraft } from "@/components/booking/booking-types";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export type CustomerField = keyof CustomerDraft;

export interface StepDetailsProps {
  customer: CustomerDraft;
  notes: string;
  errors: Partial<Record<CustomerField, string>>;
  onCustomerChange: (field: CustomerField, value: string) => void;
  onNotesChange: (value: string) => void;
  onBlur: (field: CustomerField) => void;
}

export function StepDetails({
  customer,
  notes,
  errors,
  onCustomerChange,
  onNotesChange,
  onBlur,
}: StepDetailsProps) {
  return (
    <div className="space-y-5">
      <div className="space-y-4">
        <Field label="Full name" required error={errors.name}>
          <Input
            type="text"
            autoComplete="name"
            placeholder="Your full name"
            value={customer.name}
            invalid={Boolean(errors.name)}
            onChange={(event) => onCustomerChange("name", event.target.value)}
            onBlur={() => onBlur("name")}
          />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Email" required error={errors.email}>
            <Input
              type="email"
              inputMode="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={customer.email}
              invalid={Boolean(errors.email)}
              onChange={(event) => onCustomerChange("email", event.target.value)}
              onBlur={() => onBlur("email")}
            />
          </Field>

          <Field label="Phone" required error={errors.phone}>
            <Input
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              placeholder="+63 917 555 0000"
              value={customer.phone}
              invalid={Boolean(errors.phone)}
              onChange={(event) => onCustomerChange("phone", event.target.value)}
              onBlur={() => onBlur("phone")}
            />
          </Field>
        </div>

        <Field
          label="Notes"
          hint={`Optional · ${notes.length}/300 characters`}
        >
          <Textarea
            value={notes}
            maxLength={300}
            placeholder="Anything the studio should know before your visit?"
            onChange={(event) => onNotesChange(event.target.value)}
          />
        </Field>
      </div>

      <div className="flex items-start gap-2.5 rounded-card border border-line-subtle bg-surface/60 p-3.5">
        <ShieldCheckIcon
          size={18}
          aria-hidden="true"
          className="mt-0.5 shrink-0 text-brand-soft"
        />
        <p className="text-caption text-ink-muted">
          Stored only in this browser. This demo does not send email or SMS
          confirmations.
        </p>
      </div>
    </div>
  );
}
