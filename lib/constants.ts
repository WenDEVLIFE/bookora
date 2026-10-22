import type {
  BookingStatus,
  CategoryStyle,
  ServiceCategory,
  Weekday,
} from "@/lib/types";

export const DEMO_VERSION = 1;

export const STORAGE_KEY = "bookora.demo.v1";

export const BUSINESS = {
  name: "Bookora Studio",
  brand: "WenDEV",
  tagline: "Smart scheduling. Seamless experiences.",
  timezone: "Asia/Manila",
  phone: "+63 917 555 0142",
  email: "hello@bookora.ph",
  address: "2F The Grove, 118 Katipunan Ave, Quezon City, Metro Manila",
  hours: "Mon–Sat · 9:00 AM – 7:00 PM",
  open: "09:00",
  close: "19:00",
  slotStepMinutes: 30,
  bufferMinutes: 15,
  horizonDays: 30,
} as const;

export const WEEKDAY_LABELS: Record<Weekday, string> = {
  0: "Sunday",
  1: "Monday",
  2: "Tuesday",
  3: "Wednesday",
  4: "Thursday",
  5: "Friday",
  6: "Saturday",
};

export const BOOKING_STATUS_LABELS: Record<BookingStatus, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  completed: "Completed",
  cancelled: "Cancelled",
};

export const SERVICE_CATEGORIES: readonly ServiceCategory[] = [
  "Hair",
  "Nails",
  "Skin",
  "Massage",
  "Wellness",
];

export const CATEGORY_STYLES: Record<ServiceCategory, CategoryStyle> = {
  Hair: {
    gradient:
      "bg-gradient-to-br from-violet-500/25 via-fuchsia-500/10 to-transparent",
    icon: "scissors",
    accent: "text-brand-soft",
  },
  Nails: {
    gradient:
      "bg-gradient-to-br from-rose-500/25 via-pink-500/10 to-transparent",
    icon: "palette",
    accent: "text-rose-300",
  },
  Skin: {
    gradient:
      "bg-gradient-to-br from-sky-500/25 via-cyan-500/10 to-transparent",
    icon: "stars",
    accent: "text-sky-300",
  },
  Massage: {
    gradient:
      "bg-gradient-to-br from-amber-500/25 via-orange-500/10 to-transparent",
    icon: "heart-pulse",
    accent: "text-amber-300",
  },
  Wellness: {
    gradient:
      "bg-gradient-to-br from-emerald-500/25 via-teal-500/10 to-transparent",
    icon: "leaf",
    accent: "text-emerald-300",
  },
};
