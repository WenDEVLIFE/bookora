import type { Metadata } from "next";
import { ServiceCatalog } from "@/components/services/service-catalog";

export const metadata: Metadata = {
  title: "Services & pricing",
  description:
    "Browse Bookora Studio services across hair, nails, skin, massage, and wellness, with clear pricing, durations, and available professionals.",
};

export default function ServicesPage() {
  return (
    <div className="container-page py-16 md:py-24">
      <div className="max-w-2xl">
        <p className="label-text uppercase tracking-[0.18em] text-brand-soft">
          Service catalog
        </p>
        <h1 className="heading-page mt-2 text-ink">Services &amp; pricing</h1>
        <p className="body-text mt-3 text-ink-secondary">
          Every appointment includes a short consultation before the service
          begins. Filter by category or search by name to find the right fit.
        </p>
      </div>

      <ServiceCatalog />
    </div>
  );
}
