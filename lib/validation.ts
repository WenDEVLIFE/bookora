import { SERVICE_CATEGORIES } from "@/lib/constants";
import type { ServiceCategory, Weekday, WorkingHours } from "@/lib/types";

export type ValidationErrors = Record<string, string>;

export interface CustomerInput {
  name: string;
  email: string;
  phone: string;
}

export interface ServiceValidationInput {
  name: string;
  description: string;
  price: number;
  durationMinutes: number;
  category: ServiceCategory | string;
}

export interface StaffValidationInput {
  name: string;
  role: string;
  serviceIds: string[];
  workingHours: WorkingHours[];
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_CHARACTERS = /^[+\d\s().-]+$/;
const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;

export function isValidEmail(value: string): boolean {
  return EMAIL_PATTERN.test(value.trim());
}

export function isValidPhone(value: string): boolean {
  const trimmed = value.trim();

  if (!trimmed || !PHONE_CHARACTERS.test(trimmed)) {
    return false;
  }

  const digits = trimmed.replace(/\D/g, "");

  return digits.length >= 10 && digits.length <= 13;
}

export function isValidPrice(value: unknown): boolean {
  return (
    typeof value === "number" &&
    Number.isFinite(value) &&
    value > 0 &&
    value <= 100000
  );
}

export function isValidDuration(value: unknown): boolean {
  return (
    typeof value === "number" &&
    Number.isInteger(value) &&
    value >= 15 &&
    value <= 480 &&
    value % 15 === 0
  );
}

export function normalizePhone(value: string): string {
  const trimmed = value.trim();
  const digits = trimmed.replace(/\D/g, "");

  return trimmed.startsWith("+") ? `+${digits}` : digits;
}

export function sanitizePrice(value: string | number): number {
  if (typeof value === "number") {
    return Number.isFinite(value) ? Math.max(0, value) : 0;
  }

  const normalized = value.replace(/[^\d.]/g, "");
  const parsed = Number.parseFloat(normalized);

  return Number.isFinite(parsed) ? Math.max(0, parsed) : 0;
}

export function validateCustomer(input: CustomerInput): ValidationErrors {
  const errors: ValidationErrors = {};

  if (input.name.trim().length < 2) {
    errors.name = "Enter at least 2 characters.";
  }

  if (!isValidEmail(input.email)) {
    errors.email = "Enter a valid email address.";
  }

  if (!isValidPhone(input.phone)) {
    errors.phone = "Enter a valid phone number with 10 to 13 digits.";
  }

  return errors;
}

export function validateService(
  input: ServiceValidationInput,
): ValidationErrors {
  const errors: ValidationErrors = {};

  if (input.name.trim().length < 2) {
    errors.name = "Enter at least 2 characters.";
  }

  if (input.description.trim().length < 10) {
    errors.description = "Write at least 10 characters.";
  }

  if (!isValidPrice(input.price)) {
    errors.price = "Enter a price between ₱1 and ₱100,000.";
  }

  if (!isValidDuration(input.durationMinutes)) {
    errors.durationMinutes =
      "Duration must be between 15 and 480 minutes in 15-minute steps.";
  }

  if (!SERVICE_CATEGORIES.includes(input.category as ServiceCategory)) {
    errors.category = "Choose a valid category.";
  }

  return errors;
}

export function validateStaff(input: StaffValidationInput): ValidationErrors {
  const errors: ValidationErrors = {};

  if (input.name.trim().length < 2) {
    errors.name = "Enter at least 2 characters.";
  }

  if (input.role.trim().length < 2) {
    errors.role = "Enter the staff role.";
  }

  if (!Array.isArray(input.serviceIds) || input.serviceIds.length === 0) {
    errors.serviceIds = "Assign at least one service.";
  }

  const validHours = Array.isArray(input.workingHours)
    ? input.workingHours.filter((entry) => {
        const day = Number(entry.day);

        return (
          Number.isInteger(day) &&
          day >= 0 &&
          day <= 6 &&
          TIME_PATTERN.test(entry.open) &&
          TIME_PATTERN.test(entry.close) &&
          entry.open < entry.close
        );
      })
    : [];

  if (validHours.length === 0) {
    errors.workingHours = "Add at least one valid working day.";
  }

  return errors;
}

export function isValidWeekday(value: number): value is Weekday {
  return Number.isInteger(value) && value >= 0 && value <= 6;
}
