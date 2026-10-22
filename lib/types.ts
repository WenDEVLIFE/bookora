export type ServiceCategory = "Hair" | "Nails" | "Skin" | "Massage" | "Wellness";

export interface Service {
  id: string;
  name: string;
  description: string;
  category: ServiceCategory;
  price: number;
  durationMinutes: number;
  image?: string;
  active: boolean;
}

export type BookingStatus = "pending" | "confirmed" | "completed" | "cancelled";

export type Weekday = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export interface WorkingHours {
  day: Weekday;
  open: string;
  close: string;
}

export interface UnavailableSlot {
  id: string;
  date: string;
  startTime?: string;
  endTime?: string;
  reason?: string;
}

export interface StaffMember {
  id: string;
  name: string;
  role: string;
  bio: string;
  avatar?: string;
  serviceIds: string[];
  workingHours: WorkingHours[];
  unavailableSlots: UnavailableSlot[];
  active: boolean;
}

export interface Booking {
  id: string;
  reference: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  serviceId: string;
  staffId: string;
  startAt: string;
  endAt: string;
  status: BookingStatus;
  createdAt: string;
  notes?: string;
}

export interface DemoData {
  version: number;
  services: Service[];
  staff: StaffMember[];
  bookings: Booking[];
}

export type CategoryIconName = "scissors" | "palette" | "stars" | "heart-pulse" | "leaf";

export interface CategoryStyle {
  gradient: string;
  icon: CategoryIconName;
  accent: string;
}

export type Result<T> =
  | { ok: true; data: T }
  | { ok: false; error: string; fieldErrors?: Record<string, string> };

export interface CreateBookingInput {
  serviceId: string;
  staffId: string | "any";
  startAt?: string;
  endAt?: string;
  dateKey?: string;
  time?: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  notes?: string;
}

export type ServiceInput = Omit<Service, "id">;

export type StaffInput = Omit<StaffMember, "id">;
