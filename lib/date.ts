import { BUSINESS } from "@/lib/constants";
import type { Weekday } from "@/lib/types";

const DATE_KEY_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;
const TIME_PATTERN = /^(\d{1,2}):(\d{2})$/;

const dateKeyFormatter = new Intl.DateTimeFormat("en-US", {
  timeZone: BUSINESS.timezone,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

const timeFormatter = new Intl.DateTimeFormat("en-US", {
  timeZone: BUSINESS.timezone,
  hour: "numeric",
  minute: "2-digit",
  hour12: true,
});

const dateShortFormatter = new Intl.DateTimeFormat("en-US", {
  timeZone: BUSINESS.timezone,
  month: "short",
  day: "numeric",
});

const priceFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 0,
});

export interface FormatDateOptions {
  weekday?: boolean;
  year?: boolean;
  month?: "short" | "long";
}

function isDateKey(value: string): boolean {
  return DATE_KEY_PATTERN.test(value);
}

function dateFromInput(input: string): Date {
  if (isDateKey(input)) {
    return parseDateKey(input);
  }

  return new Date(input);
}

function normalizeTimeString(time: string): string | null {
  const match = TIME_PATTERN.exec(time.trim());

  if (!match) {
    return null;
  }

  const hours = Number(match[1]);
  const minutes = Number(match[2]);

  if (
    !Number.isInteger(hours) ||
    !Number.isInteger(minutes) ||
    hours < 0 ||
    hours > 23 ||
    minutes < 0 ||
    minutes > 59
  ) {
    return null;
  }

  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

export function getBusinessNow(now?: Date): Date {
  return now ? new Date(now.getTime()) : new Date();
}

export function toDateKey(input: Date | string): string {
  const date = typeof input === "string" ? dateFromInput(input) : input;

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const parts = dateKeyFormatter.formatToParts(date);
  const year = parts.find((part) => part.type === "year")?.value;
  const month = parts.find((part) => part.type === "month")?.value;
  const day = parts.find((part) => part.type === "day")?.value;

  if (!year || !month || !day) {
    return "";
  }

  return `${year}-${month}-${day}`;
}

export function parseDateKey(key: string): Date {
  const match = DATE_KEY_PATTERN.exec(key.trim());

  if (!match) {
    return new Date(Number.NaN);
  }

  return new Date(`${key.trim()}T12:00:00+08:00`);
}

export function addDaysToKey(key: string, days: number): string {
  const match = DATE_KEY_PATTERN.exec(key.trim());

  if (!match) {
    return "";
  }

  const date = new Date(
    Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3]) + days),
  );

  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(
    2,
    "0",
  )}-${String(date.getUTCDate()).padStart(2, "0")}`;
}

export function weekdayOfKey(key: string): Weekday {
  const match = DATE_KEY_PATTERN.exec(key.trim());

  if (!match) {
    return 0;
  }

  const day = new Date(
    Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])),
  ).getUTCDay();

  return day as Weekday;
}

export function buildSlotDate(dateKey: string, time: string): Date {
  const normalizedTime = normalizeTimeString(time) ?? "00:00";

  return new Date(`${dateKey}T${normalizedTime}:00+08:00`);
}

export function minutesBetween(a: string, b: string): number {
  const start = normalizeTimeString(a);
  const end = normalizeTimeString(b);

  if (!start || !end) {
    return 0;
  }

  const [startHours, startMinutes] = start.split(":").map(Number);
  const [endHours, endMinutes] = end.split(":").map(Number);

  return endHours * 60 + endMinutes - (startHours * 60 + startMinutes);
}

export function formatTime(iso: string): string {
  const date = dateFromInput(iso);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return timeFormatter.format(date);
}

export function formatDateLong(
  isoOrKey: string,
  options: FormatDateOptions = {},
): string {
  const date = dateFromInput(isoOrKey);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat("en-US", {
    timeZone: BUSINESS.timezone,
    weekday: (options.weekday ?? true) ? "short" : undefined,
    month: options.month ?? "short",
    day: "numeric",
    year: options.year ? "numeric" : undefined,
  }).format(date);
}

export function formatDateShort(isoOrKey: string): string {
  const date = dateFromInput(isoOrKey);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return dateShortFormatter.format(date);
}

export function formatPrice(amount: number): string {
  if (!Number.isFinite(amount)) {
    return "₱0";
  }

  return `₱${priceFormatter.format(Math.round(amount))}`;
}

export function formatDuration(minutes: number): string {
  if (!Number.isFinite(minutes) || minutes <= 0) {
    return "0 min";
  }

  const rounded = Math.round(minutes);
  const hours = Math.floor(rounded / 60);
  const remainder = rounded % 60;

  if (hours === 0) {
    return `${remainder} min`;
  }

  if (remainder === 0) {
    return `${hours} hr`;
  }

  return `${hours} hr ${remainder} min`;
}

export function formatDateTime(iso: string): string {
  const datePart = formatDateLong(iso);
  const timePart = formatTime(iso);

  if (!datePart || !timePart) {
    return "";
  }

  return `${datePart} · ${timePart}`;
}
