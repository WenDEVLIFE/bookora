import { BookingSummary } from "@/components/booking/booking-summary";
import type { CustomerDraft } from "@/components/booking/booking-types";
import { Alert } from "@/components/ui/alert";
import type { Service, StaffMember } from "@/lib/types";

export interface StepReviewProps {
  service: Service;
  staffName: string;
  staff?: StaffMember | null;
  dateKey: string;
  startAt: string;
  customer: CustomerDraft;
  notes: string;
}

export function StepReview({
  service,
  staffName,
  staff,
  dateKey,
  startAt,
  customer,
  notes,
}: StepReviewProps) {
  return (
    <div className="space-y-4">
      <BookingSummary
        service={service}
        staffName={staffName}
        staff={staff}
        dateKey={dateKey}
        startAt={startAt}
        customer={customer}
        notes={notes}
        showCustomer
      />

      <Alert variant="info" title="Demo booking">
        Confirming only creates a booking in this browser. The studio is not
        notified, and no payment is collected.
      </Alert>
    </div>
  );
}
