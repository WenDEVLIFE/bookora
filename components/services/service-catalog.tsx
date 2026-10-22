"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  CalendarAddIcon,
  CheckIcon,
  ClockCircleIcon,
  MagnifierIcon,
} from "@/components/icons";
import {
  CATEGORY_INCLUDES,
  CATEGORY_META,
} from "@/components/services/category-meta";
import { ServiceCard } from "@/components/services/service-card";
import { Badge } from "@/components/ui/badge";
import { Button, buttonClasses } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Modal } from "@/components/ui/modal";
import { SERVICE_CATEGORIES } from "@/lib/constants";
import { formatDuration, formatPrice } from "@/lib/date";
import { useDemoStore } from "@/lib/demo-store";
import type { ServiceCategory } from "@/lib/types";
import { cn } from "@/lib/utils";

const ALL_CATEGORIES = "All" as const;

type CategoryFilter = ServiceCategory | typeof ALL_CATEGORIES;

export function ServiceCatalog() {
  const { services, staff } = useDemoStore();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<CategoryFilter>(ALL_CATEGORIES);
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(
    null,
  );

  const activeServices = useMemo(
    () => services.filter((service) => service.active),
    [services],
  );

  const categoryCounts = useMemo(() => {
    const counts = new Map<ServiceCategory, number>();

    for (const entry of SERVICE_CATEGORIES) {
      counts.set(entry, 0);
    }

    for (const service of activeServices) {
      counts.set(service.category, (counts.get(service.category) ?? 0) + 1);
    }

    return counts;
  }, [activeServices]);

  const filteredServices = useMemo(() => {
    const term = query.trim().toLowerCase();

    return activeServices.filter((service) => {
      const matchesCategory =
        category === ALL_CATEGORIES || service.category === category;

      if (!matchesCategory) {
        return false;
      }

      if (!term) {
        return true;
      }

      return (
        service.name.toLowerCase().includes(term) ||
        service.description.toLowerCase().includes(term) ||
        service.category.toLowerCase().includes(term)
      );
    });
  }, [activeServices, category, query]);

  const selectedService = selectedServiceId
    ? services.find(
        (service) => service.id === selectedServiceId && service.active,
      ) ?? null
    : null;

  const selectedMeta = selectedService
    ? CATEGORY_META[selectedService.category]
    : null;
  const SelectedIcon = selectedMeta?.icon ?? null;
  const eligibleStaff = selectedService
    ? staff.filter(
        (member) =>
          member.active && member.serviceIds.includes(selectedService.id),
      )
    : [];

  const hasFilters = query.trim().length > 0 || category !== ALL_CATEGORIES;

  function clearFilters() {
    setQuery("");
    setCategory(ALL_CATEGORIES);
  }

  function closeDetails() {
    setSelectedServiceId(null);
  }

  return (
    <>
      <div className="mt-10 space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex w-full flex-col gap-1.5 sm:max-w-sm">
            <Label htmlFor="service-search">Search services</Label>
            <div className="relative">
              <MagnifierIcon
                size={18}
                aria-hidden="true"
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted"
              />
              <Input
                id="service-search"
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search services or categories"
                className="pl-9"
              />
            </div>
          </div>
          {hasFilters ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="min-h-11 self-start sm:min-h-9"
            >
              Clear filters
            </Button>
          ) : null}
        </div>

        <div
          className="flex flex-wrap gap-2"
          role="group"
          aria-label="Filter by category"
        >
          <button
            type="button"
            aria-pressed={category === ALL_CATEGORIES}
            onClick={() => setCategory(ALL_CATEGORIES)}
            className={cn(
              "inline-flex min-h-11 items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors",
              category === ALL_CATEGORIES
                ? "border-brand/40 bg-brand-tint text-brand-soft"
                : "border-line bg-card text-ink-secondary hover:border-line-strong hover:text-ink",
            )}
          >
            All
            <span className="tabular-nums text-ink-muted">
              {activeServices.length}
            </span>
          </button>
          {SERVICE_CATEGORIES.map((entry) => {
            const isActive = category === entry;

            return (
              <button
                key={entry}
                type="button"
                aria-pressed={isActive}
                onClick={() => setCategory(entry)}
                className={cn(
                  "inline-flex min-h-11 items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors",
                  isActive
                    ? "border-brand/40 bg-brand-tint text-brand-soft"
                    : "border-line bg-card text-ink-secondary hover:border-line-strong hover:text-ink",
                )}
              >
                {entry}
                <span className="tabular-nums text-ink-muted">
                  {categoryCounts.get(entry) ?? 0}
                </span>
              </button>
            );
          })}
        </div>

        <p aria-live="polite" className="text-caption text-ink-muted">
          Showing {filteredServices.length} of {activeServices.length}{" "}
          {activeServices.length === 1 ? "service" : "services"}
        </p>
      </div>

      {filteredServices.length > 0 ? (
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filteredServices.map((service) => (
            <ServiceCard
              key={service.id}
              service={service}
              onDetails={() => setSelectedServiceId(service.id)}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          className="mt-6"
          icon={<MagnifierIcon size={22} aria-hidden="true" />}
          title={hasFilters ? "No services match" : "No services available"}
          description={
            hasFilters
              ? "Try a different keyword or clear the category filter."
              : "There are no active services to book right now. Please check back soon."
          }
          action={
            hasFilters ? (
              <Button variant="secondary" onClick={clearFilters}>
                Clear filters
              </Button>
            ) : undefined
          }
        />
      )}

      <Modal
        open={selectedService !== null}
        onClose={closeDetails}
        title={selectedService?.name ?? "Service details"}
        description={
          selectedService
            ? `${selectedService.category} · ${formatDuration(
                selectedService.durationMinutes,
              )} · ${formatPrice(selectedService.price)}`
            : undefined
        }
        size="lg"
        footer={
          selectedService ? (
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
              <Button variant="ghost" onClick={closeDetails}>
                Close
              </Button>
              <Link
                href={`/book?service=${encodeURIComponent(selectedService.id)}`}
                onClick={closeDetails}
                className={buttonClasses({ size: "md" })}
              >
                <CalendarAddIcon size={16} aria-hidden="true" />
                Book this service
              </Link>
            </div>
          ) : undefined
        }
      >
        {selectedService ? (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center gap-3">
              <span
                className={cn(
                  "flex h-11 w-11 items-center justify-center rounded-input border border-white/10",
                  selectedMeta?.tileClassName,
                )}
              >
                {SelectedIcon ? (
                  <SelectedIcon
                    size={22}
                    aria-hidden="true"
                    className={selectedMeta?.accentClassName}
                  />
                ) : null}
              </span>
              <Badge variant="brand">{selectedService.category}</Badge>
              <span className="inline-flex items-center gap-1.5 text-caption text-ink-muted">
                <ClockCircleIcon size={15} aria-hidden="true" />
                {formatDuration(selectedService.durationMinutes)}
              </span>
              <span className="text-sm font-semibold tabular-nums text-ink">
                {formatPrice(selectedService.price)}
              </span>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-ink">
                About this service
              </h3>
              <p className="support-text mt-2">
                {selectedService.description}
              </p>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-ink">
                What is included
              </h3>
              <ul className="mt-2 space-y-2">
                {CATEGORY_INCLUDES[selectedService.category].map((note) => (
                  <li
                    key={note}
                    className="flex gap-2 text-sm text-ink-secondary"
                  >
                    <CheckIcon
                      size={16}
                      aria-hidden="true"
                      className="mt-0.5 shrink-0 text-success"
                    />
                    {note}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-ink">
                Available professionals
              </h3>
              {eligibleStaff.length > 0 ? (
                <ul className="mt-2 flex flex-wrap gap-2">
                  {eligibleStaff.map((member) => (
                    <li
                      key={member.id}
                      className="rounded-full border border-line bg-elevated px-2.5 py-1 text-xs text-ink-secondary"
                    >
                      {member.name}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="support-text mt-2">
                  No professionals are currently assigned to this service.
                </p>
              )}
            </div>
          </div>
        ) : null}
      </Modal>
    </>
  );
}
