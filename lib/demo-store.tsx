"use client";

import {
  createContext,
  startTransition,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  getAvailableSlots,
  resolveStaffForSlot,
} from "@/lib/availability";
import { DEMO_VERSION, STORAGE_KEY } from "@/lib/constants";
import { buildSlotDate, getBusinessNow, toDateKey } from "@/lib/date";
import {
  createSeedData,
  SEED_SERVICES,
  SEED_STAFF,
} from "@/lib/seed";
import { loadDemoData, saveDemoData } from "@/lib/storage";
import type {
  Booking,
  BookingStatus,
  CreateBookingInput,
  DemoData,
  Result,
  Service,
  ServiceInput,
  StaffInput,
  StaffMember,
} from "@/lib/types";
import { generateReference, uid } from "@/lib/utils";
import {
  normalizePhone,
  validateCustomer,
  validateService,
  validateStaff,
} from "@/lib/validation";

const ALLOWED_TRANSITIONS: Record<BookingStatus, BookingStatus[]> = {
  pending: ["confirmed", "cancelled"],
  confirmed: ["completed", "cancelled"],
  completed: [],
  cancelled: [],
};

function createInitialData(): DemoData {
  return {
    version: DEMO_VERSION,
    services: structuredClone(SEED_SERVICES),
    staff: structuredClone(SEED_STAFF),
    bookings: [],
  };
}

function hasErrors(errors: Record<string, string>): boolean {
  return Object.keys(errors).length > 0;
}

export interface DemoStoreValue {
  hydrated: boolean;
  services: Service[];
  staff: StaffMember[];
  bookings: Booking[];
  serviceById: (id: string) => Service | undefined;
  staffById: (id: string) => StaffMember | undefined;
  createBooking: (input: CreateBookingInput) => Result<Booking>;
  updateBookingStatus: (
    id: string,
    status: BookingStatus,
  ) => Result<Booking>;
  saveService: (input: ServiceInput & { id?: string }) => Result<Service>;
  toggleServiceActive: (id: string) => Result<Service>;
  saveStaff: (input: StaffInput & { id?: string }) => Result<StaffMember>;
  toggleStaffActive: (id: string) => Result<StaffMember>;
  resetDemoData: () => Result<void>;
}

const DemoStoreContext = createContext<DemoStoreValue | null>(null);

export function DemoStoreProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<DemoData>(createInitialData);
  const [hydrated, setHydrated] = useState(false);
  const dataRef = useRef(data);
  const hydratedRef = useRef(false);

  const commit = useCallback((next: DemoData) => {
    dataRef.current = next;
    setData(next);

    if (hydratedRef.current) {
      saveDemoData(next);
    }
  }, []);

  useEffect(() => {
    const stored = loadDemoData();
    const next = stored ?? createSeedData();

    dataRef.current = next;
    hydratedRef.current = true;
    startTransition(() => {
      setData(next);
      setHydrated(true);
    });
  }, []);

  useEffect(() => {
    if (!hydrated) {
      return;
    }

    saveDemoData(data);
  }, [data, hydrated]);

  useEffect(() => {
    function handleStorage(event: StorageEvent) {
      if (event.key !== STORAGE_KEY) {
        return;
      }

      const stored = loadDemoData();

      if (stored) {
        dataRef.current = stored;
        setData(stored);
      }
    }

    window.addEventListener("storage", handleStorage);

    return () => {
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  const serviceById = useCallback(
    (id: string) => dataRef.current.services.find((service) => service.id === id),
    [],
  );

  const staffById = useCallback(
    (id: string) =>
      dataRef.current.staff.find((member) => member.id === id),
    [],
  );

  const createBooking = useCallback(
    (input: CreateBookingInput): Result<Booking> => {
      if (!hydratedRef.current) {
        return { ok: false, error: "Demo data is still loading." };
      }

      const snapshot = dataRef.current;
      const fieldErrors: Record<string, string> = {};
      const customerErrors = validateCustomer({
        name: input.customerName,
        email: input.customerEmail,
        phone: input.customerPhone,
      });

      if (customerErrors.name) {
        fieldErrors.customerName = customerErrors.name;
      }

      if (customerErrors.email) {
        fieldErrors.customerEmail = customerErrors.email;
      }

      if (customerErrors.phone) {
        fieldErrors.customerPhone = customerErrors.phone;
      }

      const service = snapshot.services.find(
        (entry) => entry.id === input.serviceId,
      );

      if (!service) {
        fieldErrors.serviceId = "Choose a valid service.";
      } else if (!service.active) {
        fieldErrors.serviceId =
          "This service is not available for new bookings.";
      }

      const requestedStaffId = input.staffId.trim() || "any";

      if (requestedStaffId !== "any") {
        const member = snapshot.staff.find(
          (entry) => entry.id === requestedStaffId,
        );

        if (!member) {
          fieldErrors.staffId = "Choose a valid professional.";
        } else if (!member.active) {
          fieldErrors.staffId =
            "This professional is not accepting new bookings.";
        } else if (service && !member.serviceIds.includes(service.id)) {
          fieldErrors.staffId =
            "This professional does not offer the selected service.";
        }
      }

      const now = getBusinessNow();
      let start: Date | null = null;
      let dateKey = "";

      if (input.startAt) {
        const parsed = new Date(input.startAt);

        if (!Number.isNaN(parsed.getTime())) {
          start = parsed;
          dateKey = toDateKey(parsed);
        }
      } else if (input.dateKey && input.time) {
        const parsed = buildSlotDate(input.dateKey, input.time);

        if (!Number.isNaN(parsed.getTime())) {
          start = parsed;
          dateKey = input.dateKey;
        }
      }

      if (!start || !dateKey) {
        fieldErrors.time = "Choose a valid date and time.";
      } else if (start.getTime() <= now.getTime()) {
        fieldErrors.time = "Choose a time in the future.";
      }

      if (hasErrors(fieldErrors) || !service || !start) {
        return {
          ok: false,
          error: "Please review the highlighted fields.",
          fieldErrors,
        };
      }

      const slots = getAvailableSlots({
        dateKey,
        service,
        staffId: requestedStaffId,
        staff: snapshot.staff,
        bookings: snapshot.bookings,
        now,
      });
      const slot = slots.find(
        (entry) => new Date(entry.startAt).getTime() === start.getTime(),
      );

      if (!slot) {
        return {
          ok: false,
          error: "That time is no longer available. Please choose another slot.",
          fieldErrors: {
            time: "That time is no longer available. Please choose another slot.",
          },
        };
      }

      const staffMember =
        requestedStaffId === "any"
          ? resolveStaffForSlot({
              slot,
              staff: snapshot.staff,
              bookings: snapshot.bookings,
            })
          : snapshot.staff.find(
              (member) =>
                member.id === requestedStaffId &&
                slot.staffIds.includes(member.id),
            );

      if (!staffMember) {
        return {
          ok: false,
          error: "No professional is available at that time.",
          fieldErrors: {
            staffId: "No professional is available at that time.",
          },
        };
      }

      const end = new Date(
        start.getTime() + service.durationMinutes * 60 * 1000,
      );
      const notes = input.notes?.trim();
      const booking: Booking = {
        id: uid("bk"),
        reference: generateReference(
          snapshot.bookings.map((entry) => entry.reference),
        ),
        customerName: input.customerName.trim(),
        customerEmail: input.customerEmail.trim().toLowerCase(),
        customerPhone: normalizePhone(input.customerPhone),
        serviceId: service.id,
        staffId: staffMember.id,
        startAt: start.toISOString(),
        endAt: end.toISOString(),
        status: "pending",
        createdAt: new Date().toISOString(),
        ...(notes ? { notes } : {}),
      };

      commit({
        ...snapshot,
        bookings: [...snapshot.bookings, booking],
      });

      return { ok: true, data: booking };
    },
    [commit],
  );

  const updateBookingStatus = useCallback(
    (id: string, status: BookingStatus): Result<Booking> => {
      if (!hydratedRef.current) {
        return { ok: false, error: "Demo data is still loading." };
      }

      const snapshot = dataRef.current;
      const booking = snapshot.bookings.find((entry) => entry.id === id);

      if (!booking) {
        return { ok: false, error: "Booking not found." };
      }

      if (!ALLOWED_TRANSITIONS[booking.status].includes(status)) {
        return {
          ok: false,
          error: `A ${booking.status} booking cannot be marked as ${status}.`,
        };
      }

      const updated: Booking = { ...booking, status };

      commit({
        ...snapshot,
        bookings: snapshot.bookings.map((entry) =>
          entry.id === id ? updated : entry,
        ),
      });

      return { ok: true, data: updated };
    },
    [commit],
  );

  const saveService = useCallback(
    (input: ServiceInput & { id?: string }): Result<Service> => {
      if (!hydratedRef.current) {
        return { ok: false, error: "Demo data is still loading." };
      }

      const snapshot = dataRef.current;
      const errors = validateService({
        name: input.name,
        description: input.description,
        price: input.price,
        durationMinutes: input.durationMinutes,
        category: input.category,
      });

      if (hasErrors(errors)) {
        return {
          ok: false,
          error: "Please review the highlighted fields.",
          fieldErrors: errors,
        };
      }

      const existing = input.id
        ? snapshot.services.find((entry) => entry.id === input.id)
        : undefined;

      if (input.id && !existing) {
        return { ok: false, error: "Service not found." };
      }

      const image =
        input.image !== undefined
          ? input.image.trim() || undefined
          : existing?.image;
      const service: Service = {
        id: existing?.id ?? uid("svc"),
        name: input.name.trim(),
        description: input.description.trim(),
        category: input.category,
        price: Math.round(input.price),
        durationMinutes: input.durationMinutes,
        active: input.active ?? existing?.active ?? true,
        ...(image ? { image } : {}),
      };

      commit({
        ...snapshot,
        services: existing
          ? snapshot.services.map((entry) =>
              entry.id === service.id ? service : entry,
            )
          : [...snapshot.services, service],
      });

      return { ok: true, data: service };
    },
    [commit],
  );

  const toggleServiceActive = useCallback(
    (id: string): Result<Service> => {
      if (!hydratedRef.current) {
        return { ok: false, error: "Demo data is still loading." };
      }

      const snapshot = dataRef.current;
      const service = snapshot.services.find((entry) => entry.id === id);

      if (!service) {
        return { ok: false, error: "Service not found." };
      }

      const updated: Service = { ...service, active: !service.active };

      commit({
        ...snapshot,
        services: snapshot.services.map((entry) =>
          entry.id === id ? updated : entry,
        ),
      });

      return { ok: true, data: updated };
    },
    [commit],
  );

  const saveStaff = useCallback(
    (input: StaffInput & { id?: string }): Result<StaffMember> => {
      if (!hydratedRef.current) {
        return { ok: false, error: "Demo data is still loading." };
      }

      const snapshot = dataRef.current;
      const errors = validateStaff({
        name: input.name,
        role: input.role,
        serviceIds: input.serviceIds,
        workingHours: input.workingHours,
      });

      if (
        input.serviceIds.some(
          (serviceId) =>
            !snapshot.services.some((service) => service.id === serviceId),
        )
      ) {
        errors.serviceIds = "One or more selected services no longer exist.";
      }

      if (hasErrors(errors)) {
        return {
          ok: false,
          error: "Please review the highlighted fields.",
          fieldErrors: errors,
        };
      }

      const existing = input.id
        ? snapshot.staff.find((entry) => entry.id === input.id)
        : undefined;

      if (input.id && !existing) {
        return { ok: false, error: "Staff member not found." };
      }

      const avatar =
        input.avatar !== undefined
          ? input.avatar.trim() || undefined
          : existing?.avatar;
      const member: StaffMember = {
        id: existing?.id ?? uid("stf"),
        name: input.name.trim(),
        role: input.role.trim(),
        bio: input.bio.trim(),
        serviceIds: [...new Set(input.serviceIds)],
        workingHours: input.workingHours.map((entry) => ({ ...entry })),
        unavailableSlots: input.unavailableSlots.map((slot) => ({
          ...slot,
          id: slot.id || uid("unavail"),
        })),
        active: input.active ?? existing?.active ?? true,
        ...(avatar ? { avatar } : {}),
      };

      commit({
        ...snapshot,
        staff: existing
          ? snapshot.staff.map((entry) =>
              entry.id === member.id ? member : entry,
            )
          : [...snapshot.staff, member],
      });

      return { ok: true, data: member };
    },
    [commit],
  );

  const toggleStaffActive = useCallback(
    (id: string): Result<StaffMember> => {
      if (!hydratedRef.current) {
        return { ok: false, error: "Demo data is still loading." };
      }

      const snapshot = dataRef.current;
      const member = snapshot.staff.find((entry) => entry.id === id);

      if (!member) {
        return { ok: false, error: "Staff member not found." };
      }

      const updated: StaffMember = { ...member, active: !member.active };

      commit({
        ...snapshot,
        staff: snapshot.staff.map((entry) =>
          entry.id === id ? updated : entry,
        ),
      });

      return { ok: true, data: updated };
    },
    [commit],
  );

  const resetDemoData = useCallback((): Result<void> => {
    const seeded = createSeedData();

    commit(seeded);

    if (hydratedRef.current) {
      saveDemoData(seeded);
    }

    return { ok: true, data: undefined };
  }, [commit]);

  const value = useMemo<DemoStoreValue>(
    () => ({
      hydrated,
      services: data.services,
      staff: data.staff,
      bookings: data.bookings,
      serviceById,
      staffById,
      createBooking,
      updateBookingStatus,
      saveService,
      toggleServiceActive,
      saveStaff,
      toggleStaffActive,
      resetDemoData,
    }),
    [
      data,
      hydrated,
      serviceById,
      staffById,
      createBooking,
      updateBookingStatus,
      saveService,
      toggleServiceActive,
      saveStaff,
      toggleStaffActive,
      resetDemoData,
    ],
  );

  return (
    <DemoStoreContext.Provider value={value}>
      {children}
    </DemoStoreContext.Provider>
  );
}

export function useDemoStore(): DemoStoreValue {
  const context = useContext(DemoStoreContext);

  if (!context) {
    throw new Error("useDemoStore must be used within DemoStoreProvider.");
  }

  return context;
}
