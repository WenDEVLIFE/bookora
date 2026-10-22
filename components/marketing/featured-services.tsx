"use client";

import Link from "next/link";
import { ArrowRightIcon } from "@/components/icons";
import { ServiceCard } from "@/components/services/service-card";
import { EmptyState } from "@/components/ui/empty-state";
import { SectionHeading } from "@/components/ui/section-heading";
import { useDemoStore } from "@/lib/demo-store";
import type { Service } from "@/lib/types";

const FEATURED_SERVICE_IDS = [
  "svc_signature_haircut",
  "svc_hydrafacial_glow",
  "svc_aromatherapy_ritual",
] as const;

function selectFeatured(activeServices: Service[]): Service[] {
  const selected: Service[] = [];

  for (const id of FEATURED_SERVICE_IDS) {
    const service = activeServices.find((entry) => entry.id === id);

    if (service) {
      selected.push(service);
    }
  }

  for (const service of activeServices) {
    if (selected.length >= 3) {
      break;
    }

    if (!selected.some((entry) => entry.id === service.id)) {
      selected.push(service);
    }
  }

  return selected.slice(0, 3);
}

export function FeaturedServices() {
  const { services } = useDemoStore();
  const activeServices = services.filter((service) => service.active);
  const featured = selectFeatured(activeServices);

  return (
    <section className="border-t border-line-subtle py-16 md:py-24">
      <div className="container-page">
        <SectionHeading
          eyebrow="Signature services"
          title="The services clients come back for."
          description="Clear pricing, realistic durations, and a team that knows every treatment in detail."
          actions={
            <Link
              href="/services"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-soft transition-colors hover:text-ink"
            >
              View all services
              <ArrowRightIcon size={16} aria-hidden="true" />
            </Link>
          }
        />

        {featured.length > 0 ? (
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((service) => (
              <ServiceCard key={service.id} service={service} />
            ))}
          </div>
        ) : (
          <EmptyState
            className="mt-10"
            title="Services are being refreshed"
            description="No services are available for booking right now. Please check back soon."
          />
        )}
      </div>
    </section>
  );
}
