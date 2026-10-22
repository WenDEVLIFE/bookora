import type { Metadata } from "next";
import { AppointmentsManager } from "@/components/admin/appointments/appointments-manager";

export const metadata: Metadata = {
  title: "Appointments",
  description:
    "Manage demo appointments at Bookora Studio. Search, filter, confirm, complete, and cancel bookings.",
};

export default function AdminAppointmentsPage() {
  return <AppointmentsManager />;
}
