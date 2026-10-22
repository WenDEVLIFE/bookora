import type { Metadata } from "next";
import { DashboardOverview } from "@/components/admin/dashboard/dashboard-overview";

export const metadata: Metadata = {
  title: { absolute: "Dashboard · Admin · Bookora" },
  description:
    "Demo dashboard for Bookora Studio with daily metrics, a seven-day outlook, and upcoming appointments.",
};

export default function AdminDashboardPage() {
  return <DashboardOverview />;
}
