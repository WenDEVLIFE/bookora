"use client";

import { useMemo, useState } from "react";
import {
  AddIcon,
  MagnifierIcon,
  PenIcon,
  ScissorsIcon,
} from "@/components/icons";
import { ServiceFormModal } from "@/components/admin/services/service-form-modal";
import { PageHeader } from "@/components/admin/page-header";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Modal } from "@/components/ui/modal";
import { Select } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { SERVICE_CATEGORIES } from "@/lib/constants";
import { formatDuration, formatPrice } from "@/lib/date";
import { useDemoStore } from "@/lib/demo-store";
import type { Service, ServiceCategory } from "@/lib/types";
import { cn } from "@/lib/utils";

type StatusFilter = "all" | "active" | "inactive";
type CategoryFilter = ServiceCategory | "all";

interface Feedback {
  variant: "success" | "danger";
  message: string;
}

function ServicesSkeleton() {
  return (
    <div className="mt-6 space-y-4" aria-hidden="true">
      <Skeleton className="h-5 w-64" rounded="sm" />
      <Skeleton className="h-24" />
      <Skeleton className="h-80" />
    </div>
  );
}

export function ServicesManager() {
  const { hydrated, services, staff, toggleServiceActive } = useDemoStore();
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] =
    useState<CategoryFilter>("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [formOpen, setFormOpen] = useState(false);
  const [formKey, setFormKey] = useState(0);
  const [editing, setEditing] = useState<Service | undefined>();
  const [deactivateTarget, setDeactivateTarget] = useState<Service | null>(
    null,
  );
  const [deactivateError, setDeactivateError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<Feedback | null>(null);

  const summary = useMemo(() => {
    const total = services.length;
    const active = services.filter((service) => service.active).length;
    const average =
      total === 0
        ? 0
        : Math.round(
            services.reduce((sum, service) => sum + service.price, 0) / total,
          );

    return { total, active, average };
  }, [services]);

  const staffCountByService = useMemo(() => {
    const counts = new Map<string, number>();

    for (const member of staff) {
      for (const serviceId of member.serviceIds) {
        counts.set(serviceId, (counts.get(serviceId) ?? 0) + 1);
      }
    }

    return counts;
  }, [staff]);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    const list = services.filter((service) => {
      if (statusFilter === "active" && !service.active) {
        return false;
      }

      if (statusFilter === "inactive" && service.active) {
        return false;
      }

      if (categoryFilter !== "all" && service.category !== categoryFilter) {
        return false;
      }

      if (!query) {
        return true;
      }

      return `${service.name} ${service.description} ${service.category}`
        .toLowerCase()
        .includes(query);
    });

    list.sort((a, b) => {
      if (a.active !== b.active) {
        return a.active ? -1 : 1;
      }

      const categoryOrder = a.category.localeCompare(b.category);

      if (categoryOrder !== 0) {
        return categoryOrder;
      }

      return a.name.localeCompare(b.name);
    });

    return list;
  }, [categoryFilter, search, services, statusFilter]);

  const hasActiveFilters =
    search.trim() !== "" ||
    categoryFilter !== "all" ||
    statusFilter !== "all";

  function clearFilters() {
    setSearch("");
    setCategoryFilter("all");
    setStatusFilter("all");
  }

  function openCreate() {
    setEditing(undefined);
    setFeedback(null);
    setFormKey((current) => current + 1);
    setFormOpen(true);
  }

  function openEdit(service: Service) {
    setEditing(service);
    setFeedback(null);
    setFormKey((current) => current + 1);
    setFormOpen(true);
  }

  function closeForm() {
    setFormOpen(false);
    setEditing(undefined);
  }

  function handleSaved(service: Service) {
    const wasEditing = Boolean(editing);

    setFormOpen(false);
    setEditing(undefined);
    setFeedback({
      variant: "success",
      message: wasEditing
        ? `"${service.name}" was updated.`
        : `"${service.name}" was created.`,
    });
  }

  function requestToggle(service: Service) {
    setFeedback(null);
    setDeactivateError(null);

    if (service.active) {
      setDeactivateTarget(service);
      return;
    }

    const result = toggleServiceActive(service.id);

    if (result.ok) {
      setFeedback({
        variant: "success",
        message: `"${result.data.name}" is now active for new bookings.`,
      });
      return;
    }

    setFeedback({ variant: "danger", message: result.error });
  }

  function confirmDeactivate() {
    if (!deactivateTarget) {
      return;
    }

    const result = toggleServiceActive(deactivateTarget.id);

    if (result.ok) {
      setDeactivateTarget(null);
      setDeactivateError(null);
      setFeedback({
        variant: "success",
        message: `"${result.data.name}" was deactivated. It no longer appears in new bookings.`,
      });
      return;
    }

    setDeactivateError(result.error);
  }

  function renderStatusBadge(service: Service) {
    return (
      <Badge variant={service.active ? "success" : "neutral"} dot>
        {service.active ? "Active" : "Inactive"}
      </Badge>
    );
  }

  function renderStaffCount(service: Service) {
    const count = staffCountByService.get(service.id) ?? 0;

    return `${count} ${count === 1 ? "professional" : "professionals"}`;
  }

  return (
    <div>
      <PageHeader
        title="Services"
        eyebrow="Management"
        description="Create, price, and retire the services customers can book."
        actions={
          <Button
            leftIcon={<AddIcon size={18} aria-hidden="true" />}
            onClick={openCreate}
            disabled={!hydrated}
          >
            Add service
          </Button>
        }
      />

      {!hydrated ? (
        <ServicesSkeleton />
      ) : (
        <div className="mt-6 space-y-4">
          <p
            role="status"
            aria-live="polite"
            className="text-caption tabular-nums text-ink-muted"
          >
            {summary.total}{" "}
            {summary.total === 1 ? "service" : "services"} · {summary.active}{" "}
            active · {formatPrice(summary.average)} average price
          </p>

          {feedback ? (
            <Alert
              variant={feedback.variant}
              title={
                feedback.variant === "success"
                  ? "Service saved"
                  : "Action failed"
              }
            >
              {feedback.message}
            </Alert>
          ) : null}

          <Card>
            <CardContent className="grid gap-4 sm:grid-cols-2 xl:grid-cols-[minmax(0,1.5fr)_11rem_11rem_auto] xl:items-end">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="services-search">Search</Label>
                <div className="relative">
                  <MagnifierIcon
                    size={17}
                    aria-hidden="true"
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted"
                  />
                  <Input
                    id="services-search"
                    type="search"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Name, description, category"
                    className="pl-9"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="services-category">Category</Label>
                <Select
                  id="services-category"
                  value={categoryFilter}
                  onChange={(event) =>
                    setCategoryFilter(event.target.value as CategoryFilter)
                  }
                >
                  <option value="all">All categories</option>
                  {SERVICE_CATEGORIES.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </Select>
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="services-status">Status</Label>
                <Select
                  id="services-status"
                  value={statusFilter}
                  onChange={(event) =>
                    setStatusFilter(event.target.value as StatusFilter)
                  }
                >
                  <option value="all">All statuses</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </Select>
              </div>

              <div className="flex flex-wrap items-end gap-2">
                {hasActiveFilters ? (
                  <Button variant="ghost" onClick={clearFilters}>
                    Clear filters
                  </Button>
                ) : null}
              </div>
            </CardContent>
          </Card>

          <p
            role="status"
            aria-live="polite"
            className="text-caption tabular-nums text-ink-muted"
          >
            Showing {filtered.length} of {services.length}{" "}
            {services.length === 1 ? "service" : "services"}
          </p>

          {filtered.length === 0 ? (
            <EmptyState
              icon={<ScissorsIcon size={24} aria-hidden="true" />}
              title={hasActiveFilters ? "No services match" : "No services yet"}
              description={
                hasActiveFilters
                  ? "Try a different search or clear the filters to see the full menu."
                  : "Add the first service so customers can start booking."
              }
              action={
                hasActiveFilters ? (
                  <Button variant="secondary" onClick={clearFilters}>
                    Clear filters
                  </Button>
                ) : (
                  <Button
                    leftIcon={<AddIcon size={18} aria-hidden="true" />}
                    onClick={openCreate}
                  >
                    Add service
                  </Button>
                )
              }
            />
          ) : (
            <>
              <Card className="hidden overflow-hidden md:block">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[48rem] border-collapse text-left text-sm">
                    <thead>
                      <tr className="border-b border-line bg-surface/60">
                        <th
                          scope="col"
                          className="px-5 py-3 text-caption font-medium uppercase tracking-[0.12em] text-ink-muted"
                        >
                          Service
                        </th>
                        <th
                          scope="col"
                          className="px-5 py-3 text-caption font-medium uppercase tracking-[0.12em] text-ink-muted"
                        >
                          Category
                        </th>
                        <th
                          scope="col"
                          className="px-5 py-3 text-caption font-medium uppercase tracking-[0.12em] text-ink-muted"
                        >
                          Duration
                        </th>
                        <th
                          scope="col"
                          className="px-5 py-3 text-caption font-medium uppercase tracking-[0.12em] text-ink-muted"
                        >
                          Price
                        </th>
                        <th
                          scope="col"
                          className="px-5 py-3 text-caption font-medium uppercase tracking-[0.12em] text-ink-muted"
                        >
                          Status
                        </th>
                        <th
                          scope="col"
                          className="px-5 py-3 text-right text-caption font-medium uppercase tracking-[0.12em] text-ink-muted"
                        >
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map((service) => (
                        <tr
                          key={service.id}
                          className={cn(
                            "border-b border-line-subtle last:border-0",
                            !service.active && "bg-surface/40",
                          )}
                        >
                          <td className="max-w-[22rem] px-5 py-3.5">
                            <span
                              className={cn(
                                "block font-medium",
                                service.active
                                  ? "text-ink"
                                  : "text-ink-secondary",
                              )}
                            >
                              {service.name}
                            </span>
                            <span
                              className="mt-0.5 line-clamp-2 block text-caption text-ink-muted"
                              title={service.description}
                            >
                              {service.description}
                            </span>
                          </td>
                          <td className="px-5 py-3.5">
                            <span
                              className={cn(
                                "block",
                                service.active
                                  ? "text-ink"
                                  : "text-ink-secondary",
                              )}
                            >
                              {service.category}
                            </span>
                            <span className="block text-caption text-ink-muted">
                              {renderStaffCount(service)}
                            </span>
                          </td>
                          <td className="px-5 py-3.5 tabular-nums text-ink-secondary">
                            {formatDuration(service.durationMinutes)}
                          </td>
                          <td className="px-5 py-3.5 tabular-nums font-medium text-ink">
                            {formatPrice(service.price)}
                          </td>
                          <td className="px-5 py-3.5">
                            {renderStatusBadge(service)}
                          </td>
                          <td className="px-5 py-3.5">
                            <div className="flex flex-wrap items-center justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                leftIcon={
                                  <PenIcon size={15} aria-hidden="true" />
                                }
                                onClick={() => openEdit(service)}
                              >
                                Edit
                              </Button>
                              <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => requestToggle(service)}
                              >
                                {service.active ? "Deactivate" : "Activate"}
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>

              <Card className="overflow-hidden md:hidden">
                <div className="divide-y divide-line-subtle">
                  {filtered.map((service) => (
                    <div
                      key={service.id}
                      className={cn(
                        "p-4",
                        !service.active && "bg-surface/40",
                      )}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p
                            className={cn(
                              "text-sm font-semibold",
                              service.active
                                ? "text-ink"
                                : "text-ink-secondary",
                            )}
                          >
                            {service.name}
                          </p>
                          <p className="mt-0.5 text-caption text-ink-muted">
                            {service.category} ·{" "}
                            {formatDuration(service.durationMinutes)}
                          </p>
                        </div>
                        {renderStatusBadge(service)}
                      </div>
                      <p
                        className="mt-2 line-clamp-2 text-caption text-ink-secondary"
                        title={service.description}
                      >
                        {service.description}
                      </p>
                      <div className="mt-3 flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-sm font-semibold tabular-nums text-ink">
                            {formatPrice(service.price)}
                          </p>
                          <p className="text-caption text-ink-muted">
                            {renderStaffCount(service)}
                          </p>
                        </div>
                        <div className="flex shrink-0 items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEdit(service)}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => requestToggle(service)}
                          >
                            {service.active ? "Deactivate" : "Activate"}
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </>
          )}
        </div>
      )}

      <ServiceFormModal
        key={formKey}
        open={formOpen}
        service={editing}
        onClose={closeForm}
        onSaved={handleSaved}
      />

      <Modal
        open={deactivateTarget !== null}
        onClose={() => {
          setDeactivateTarget(null);
          setDeactivateError(null);
        }}
        title="Deactivate this service?"
        description={deactivateTarget?.name}
        size="sm"
        footer={
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button
              variant="secondary"
              onClick={() => {
                setDeactivateTarget(null);
                setDeactivateError(null);
              }}
            >
              Keep active
            </Button>
            <Button variant="destructive" onClick={confirmDeactivate}>
              Deactivate service
            </Button>
          </div>
        }
      >
        <p className="support-text">
          It will be hidden from new bookings. Existing appointments keep their
          service.
        </p>
        {deactivateError ? (
          <Alert variant="danger" className="mt-4">
            {deactivateError}
          </Alert>
        ) : null}
      </Modal>
    </div>
  );
}
