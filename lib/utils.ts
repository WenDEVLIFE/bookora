import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

const REFERENCE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);

  if (parts.length === 0) {
    return "?";
  }

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

export function uid(prefix = "id"): string {
  const randomPart =
    typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
      ? crypto.randomUUID()
      : `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 10)}`;

  return `${prefix}_${randomPart}`;
}

export function generateReference(existing: string[]): string {
  const taken = new Set(existing);

  for (let attempt = 0; attempt < 1000; attempt += 1) {
    let reference = "BK-";

    for (let index = 0; index < 6; index += 1) {
      reference +=
        REFERENCE_ALPHABET[
          Math.floor(Math.random() * REFERENCE_ALPHABET.length)
        ];
    }

    if (!taken.has(reference)) {
      return reference;
    }
  }

  return `BK-${Date.now().toString(36).slice(-6).toUpperCase()}`;
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function formatPhoneInput(value: string): string {
  const trimmed = value.trim();
  const hasPlus = trimmed.startsWith("+");
  const digits = trimmed.replace(/\D/g, "");

  if (digits.length === 0) {
    return hasPlus ? "+" : "";
  }

  if (digits.startsWith("63") && digits.length > 7) {
    const rest = digits.slice(2);

    return `+63 ${rest.slice(0, 3)} ${rest.slice(3, 6)} ${rest.slice(6, 10)}`
      .trimEnd();
  }

  const prefix = hasPlus ? "+" : "";

  if (digits.length <= 4) {
    return `${prefix}${digits}`;
  }

  if (digits.length <= 7) {
    return `${prefix}${digits.slice(0, 4)} ${digits.slice(4)}`;
  }

  return `${prefix}${digits.slice(0, 4)} ${digits.slice(4, 7)} ${digits.slice(7, 11)}`
    .trimEnd();
}
