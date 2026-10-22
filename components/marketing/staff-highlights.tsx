"use client";

import Link from "next/link";
import { ArrowRightIcon } from "@/components/icons";
import { Avatar } from "@/components/ui/avatar";
import { EmptyState } from "@/components/ui/empty-state";
import { SectionHeading } from "@/components/ui/section-heading";
import { useDemoStore } from "@/lib/demo-store";

export function StaffHighlights() {
  const { staff, services } = useDemoStore();
  const activeStaff = staff.filter((member) => member.active).slice(0, 4);

  return (
    <section id="team" className="scroll-mt-20 py-16 md:py-24">
      <div className="container-page">
        <SectionHeading
          eyebrow="The team"
          title="Specialists who know the details."
          description="Every professional is trained across a focused set of services, so recommendations stay honest."
          actions={
            <Link
              href="/book"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-soft transition-colors hover:text-ink"
            >
              Meet the team
              <ArrowRightIcon size={16} aria-hidden="true" />
            </Link>
          }
        />

        {activeStaff.length > 0 ? (
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {activeStaff.map((member) => {
              const serviceCount = services.filter(
                (service) =>
                  service.active && member.serviceIds.includes(service.id),
              ).length;

              return (
                <article
                  key={member.id}
                  className="flex h-full flex-col rounded-card border border-line bg-card p-5 sm:p-6"
                >
                  <Avatar name={member.name} size="lg" />
                  <h3 className="heading-card mt-4 text-ink">{member.name}</h3>
                  <p className="text-caption mt-1 text-brand-soft">
                    {member.role}
                  </p>
                  <p className="support-text mt-3 line-clamp-2">
                    {member.bio}
                  </p>
                  <p className="mt-auto pt-5 text-caption text-ink-muted">
                    {serviceCount}{" "}
                    {serviceCount === 1 ? "service" : "services"} assigned
                  </p>
                </article>
              );
            })}
          </div>
        ) : (
          <EmptyState
            className="mt-10"
            title="The team is unavailable"
            description="No active professionals are listed right now. Please check back soon."
          />
        )}
      </div>
    </section>
  );
}
