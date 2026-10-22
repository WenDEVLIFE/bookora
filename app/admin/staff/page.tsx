import type { Metadata } from "next";
import { StaffManager } from "@/components/admin/staff/staff-manager";

export const metadata: Metadata = {
  title: "Staff",
  description:
    "Manage staff profiles, service assignments, working hours, and time off at Bookora Studio.",
};

export default function AdminStaffPage() {
  return <StaffManager />;
}
