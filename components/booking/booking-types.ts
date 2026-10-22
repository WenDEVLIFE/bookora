import { BUSINESS } from "@/lib/constants";
import { parseDateKey } from "@/lib/date";

export const DRAFT_STORAGE_KEY = "bookora.booking-draft.v1";

export const BOOKING_STEPS = [
  {
    key: "service",
    label: "Service",
    description: "Choose the treatment you would like to book.",
  },
  {
    key: "professional",
    label: "Professional",
    description: "Pick a professional or let us match you with the first one available.",
  },
  {
    key: "date",
    label: "Date",
    description: "Select a day that works for you within the next 30 days.",
  },
  {
    key: "time",
    label: "Time",
    description: "Choose an available start time for your appointment.",
  },
  {
    key: "details",
    label: "Details",
    description: "Tell us who the appointment is for.",
  },
  {
    key: "review",
    label: "Review",
    description: "Check the details before confirming your demo booking.",
  },
] as const;

export type BookingStepKey = (typeof BOOKING_STEPS)[number]["key"];

export type BookingStepIndex = 0 | 1 | 2 | 3 | 4 | 5;

export const LAST_STEP: BookingStepIndex = 5;
export const STEP_COUNT = BOOKING_STEPS.length;

export interface CustomerDraft {
  name: string;
  email: string;
  phone: string;
}

export interface BookingDraft {
  step: BookingStepIndex;
  serviceId: string | null;
  staffId: string | null;
  dateKey: string | null;
  slotStartAt: string | null;
  customer: CustomerDraft;
  notes: string;
}

export const EMPTY_CUSTOMER: CustomerDraft = {
  name: "",
  email: "",
  phone: "",
};

export function createEmptyDraft(): BookingDraft {
  return {
    step: 0,
    serviceId: null,
    staffId: null,
    dateKey: null,
    slotStartAt: null,
    customer: { ...EMPTY_CUSTOMER },
    notes: "",
  };
}

const DATE_KEY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export function isValidDateKey(value: string): boolean {
  return DATE_KEY_PATTERN.test(value);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isNullableString(value: unknown): value is string | null {
  return value === null || typeof value === "string";
}

function isStepIndex(value: unknown): value is BookingStepIndex {
  return (
    typeof value === "number" &&
    Number.isInteger(value) &&
    value >= 0 &&
    value <= LAST_STEP
  );
}

export function isBookingDraft(value: unknown): value is BookingDraft {
  if (!isRecord(value) || !isStepIndex(value.step)) {
    return false;
  }

  if (
    !isNullableString(value.serviceId) ||
    !isNullableString(value.staffId) ||
    !isNullableString(value.dateKey) ||
    !isNullableString(value.slotStartAt) ||
    typeof value.notes !== "string" ||
    !isRecord(value.customer)
  ) {
    return false;
  }

  return (
    typeof value.customer.name === "string" &&
    typeof value.customer.email === "string" &&
    typeof value.customer.phone === "string"
  );
}

export function readBookingDraft(): BookingDraft | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const raw = window.sessionStorage.getItem(DRAFT_STORAGE_KEY);

    if (!raw) {
      return null;
    }

    const parsed: unknown = JSON.parse(raw);

    return isBookingDraft(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export function writeBookingDraft(draft: BookingDraft): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.sessionStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draft));
  } catch {
    return;
  }
}

export function clearBookingDraft(): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.sessionStorage.removeItem(DRAFT_STORAGE_KEY);
  } catch {
    return;
  }
}

const timePartsFormatter = new Intl.DateTimeFormat("en-US", {
  timeZone: BUSINESS.timezone,
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

const weekdayFormatter = new Intl.DateTimeFormat("en-US", {
  timeZone: BUSINESS.timezone,
  weekday: "short",
});

const dayFormatter = new Intl.DateTimeFormat("en-US", {
  timeZone: BUSINESS.timezone,
  day: "numeric",
});

const monthFormatter = new Intl.DateTimeFormat("en-US", {
  timeZone: BUSINESS.timezone,
  month: "short",
});

export function getBusinessTimeInput(iso: string): string | null {
  const date = new Date(iso);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  const parts = timePartsFormatter.formatToParts(date);
  const hour = parts.find((part) => part.type === "hour")?.value;
  const minute = parts.find((part) => part.type === "minute")?.value;

  if (!hour || !minute) {
    return null;
  }

  return `${hour}:${minute}`;
}

export function getBusinessHour(iso: string): number {
  const time = getBusinessTimeInput(iso);

  if (!time) {
    return 0;
  }

  return Number(time.slice(0, 2));
}

export interface DateCardParts {
  weekday: string;
  day: string;
  month: string;
}

export function getDateCardParts(dateKey: string): DateCardParts {
  const date = parseDateKey(dateKey);

  if (Number.isNaN(date.getTime())) {
    return { weekday: "", day: "", month: "" };
  }

  return {
    weekday: weekdayFormatter.format(date),
    day: dayFormatter.format(date),
    month: monthFormatter.format(date),
  };
}
