import type { Metadata } from "next";
import { Suspense } from "react";
import { BookingDetails } from "@/components/booking/booking-details";
import { BookingResultSkeleton } from "@/components/booking/booking-flow-skeleton";

export const metadata: Metadata = {
  title: "Booking details",
  description: "View the status and details of a demo booking at Bookora Studio.",
};

export default function BookingDetailPage() {
  return (
    <div className="container-page py-12 md:py-20">
      <Suspense fallback={<BookingResultSkeleton />}>
        <BookingDetails />
      </Suspense>
    </div>
  );
}
