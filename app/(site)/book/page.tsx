import type { Metadata } from "next";
import { Suspense } from "react";
import { ClockCircleIcon } from "@/components/icons";
import { BookingFlow } from "@/components/booking/booking-flow";
import { BookingFlowSkeleton } from "@/components/booking/booking-flow-skeleton";

export const metadata: Metadata = {
  title: "Book an appointment",
  description:
    "Reserve an appointment at Bookora Studio. Choose a service, professional, date, and time, then confirm a demo booking in a few steps.",
};

export default function BookPage() {
  return (
    <div className="container-page py-12 md:py-16">
      <div className="max-w-2xl">
        <p className="label-text uppercase tracking-[0.18em] text-brand-soft">
          Booking
        </p>
        <h1 className="heading-page mt-2 text-ink">Reserve your appointment</h1>
        <p className="body-text mt-3 text-ink-secondary">
          Pick a service, choose who you would like to see, and find a time that
          works. Every booking is held in this browser for the demo.
        </p>
        <p className="mt-4 inline-flex items-center gap-2 text-caption text-ink-muted">
          <ClockCircleIcon size={15} aria-hidden="true" />
          Takes about 2 minutes · Demo booking
        </p>
      </div>

      <Suspense fallback={<BookingFlowSkeleton />}>
        <BookingFlow />
      </Suspense>
    </div>
  );
}
