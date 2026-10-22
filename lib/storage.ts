import {
  DEMO_VERSION,
  SERVICE_CATEGORIES,
  STORAGE_KEY,
} from "@/lib/constants";
import type {
  Booking,
  BookingStatus,
  DemoData,
  Service,
  StaffMember,
  UnavailableSlot,
  WorkingHours,
} from "@/lib/types";

const BOOKING_STATUSES: BookingStatus[] = [
  "pending",
  "confirmed",
  "completed",
  "cancelled",
];

const DATE_KEY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isDateKey(value: unknown): value is string {
  return typeof value === "string" && DATE_KEY_PATTERN.test(value);
}

function isTime(value: unknown): value is string {
  return typeof value === "string" && TIME_PATTERN.test(value);
}

function isIsoTimestamp(value: unknown): value is string {
  return (
    typeof value === "string" &&
    value.trim().length > 0 &&
    !Number.isNaN(new Date(value).getTime())
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

function isWorkingHours(value: unknown): value is WorkingHours {
  return (
    isRecord(value) &&
    typeof value.day === "number" &&
    Number.isInteger(value.day) &&
    value.day >= 0 &&
    value.day <= 6 &&
    isTime(value.open) &&
    isTime(value.close) &&
    value.open < value.close
  );
}

function isUnavailableSlot(value: unknown): value is UnavailableSlot {
  if (!isRecord(value) || !isNonEmptyString(value.id) || !isDateKey(value.date)) {
    return false;
  }

  const hasStart = value.startTime !== undefined;
  const hasEnd = value.endTime !== undefined;

  if (hasStart !== hasEnd) {
    return false;
  }

  if (hasStart && (!isTime(value.startTime) || !isTime(value.endTime))) {
    return false;
  }

  if (hasStart && (value.startTime as string) >= (value.endTime as string)) {
    return false;
  }

  return value.reason === undefined || typeof value.reason === "string";
}

function isService(value: unknown): value is Service {
  return (
    isRecord(value) &&
    isNonEmptyString(value.id) &&
    isNonEmptyString(value.name) &&
    isNonEmptyString(value.description) &&
    typeof value.category === "string" &&
    SERVICE_CATEGORIES.includes(
      value.category as (typeof SERVICE_CATEGORIES)[number],
    ) &&
    typeof value.price === "number" &&
    Number.isFinite(value.price) &&
    value.price >= 0 &&
    typeof value.durationMinutes === "number" &&
    Number.isInteger(value.durationMinutes) &&
    value.durationMinutes >= 15 &&
    value.durationMinutes <= 480 &&
    typeof value.active === "boolean" &&
    (value.image === undefined || typeof value.image === "string")
  );
}

function isStaffMember(value: unknown): value is StaffMember {
  return (
    isRecord(value) &&
    isNonEmptyString(value.id) &&
    isNonEmptyString(value.name) &&
    isNonEmptyString(value.role) &&
    typeof value.bio === "string" &&
    isStringArray(value.serviceIds) &&
    value.serviceIds.length > 0 &&
    Array.isArray(value.workingHours) &&
    value.workingHours.every(isWorkingHours) &&
    Array.isArray(value.unavailableSlots) &&
    value.unavailableSlots.every(isUnavailableSlot) &&
    typeof value.active === "boolean" &&
    (value.avatar === undefined || typeof value.avatar === "string")
  );
}

function isBooking(value: unknown): value is Booking {
  return (
    isRecord(value) &&
    isNonEmptyString(value.id) &&
    isNonEmptyString(value.reference) &&
    isNonEmptyString(value.customerName) &&
    isNonEmptyString(value.customerEmail) &&
    isNonEmptyString(value.customerPhone) &&
    isNonEmptyString(value.serviceId) &&
    isNonEmptyString(value.staffId) &&
    isIsoTimestamp(value.startAt) &&
    isIsoTimestamp(value.endAt) &&
    new Date(value.startAt).getTime() < new Date(value.endAt).getTime() &&
    typeof value.status === "string" &&
    BOOKING_STATUSES.includes(value.status as BookingStatus) &&
    isIsoTimestamp(value.createdAt) &&
    (value.notes === undefined || typeof value.notes === "string")
  );
}

function isDemoData(value: unknown): value is DemoData {
  if (
    !isRecord(value) ||
    value.version !== DEMO_VERSION ||
    !Array.isArray(value.services) ||
    value.services.length === 0 ||
    !value.services.every(isService) ||
    !Array.isArray(value.staff) ||
    value.staff.length === 0 ||
    !value.staff.every(isStaffMember) ||
    !Array.isArray(value.bookings) ||
    !value.bookings.every(isBooking)
  ) {
    return false;
  }

  const serviceIds = new Set(
    (value.services as Service[]).map((service) => service.id),
  );
  const staffIds = new Set((value.staff as StaffMember[]).map((member) => member.id));

  return (
    (value.staff as StaffMember[]).every((member) =>
      member.serviceIds.every((serviceId) => serviceIds.has(serviceId)),
    ) &&
    (value.bookings as Booking[]).every(
      (booking) =>
        serviceIds.has(booking.serviceId) && staffIds.has(booking.staffId),
    )
  );
}

export function loadDemoData(): DemoData | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);

    if (!raw) {
      return null;
    }

    const parsed: unknown = JSON.parse(raw);

    return isDemoData(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export function saveDemoData(data: DemoData): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    return;
  }
}

export function clearDemoData(): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    return;
  }
}
