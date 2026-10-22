import type { Metadata } from "next";
import { ServicesManager } from "@/components/admin/services/services-manager";

export const metadata: Metadata = {
  title: "Services",
  description:
    "Create, edit, price, and retire the services customers can book at Bookora Studio.",
};

export default function AdminServicesPage() {
  return <ServicesManager />;
}
