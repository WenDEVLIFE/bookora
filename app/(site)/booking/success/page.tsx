import type { Metadata } from "next";
import { Suspense } from "react";
import { BookingConfirmation } from "@/components/booking/booking-confirmation";
import { BookingResultSkeleton } from "@/components/booking/booking-flow-skeleton";

export const metadata: Metadata = {
  title: "Booking confirmed",
  description:
    "Your demo booking reference and appointment details at Bookora Studio.",
};

export default function BookingSuccessPage() {
  return (
    <div className="container-page py-12 md:py-20">
      <Suspense fallback={<BookingResultSkeleton />}>
        <BookingConfirmation />
      </Suspense>
    </div>
  );
}
