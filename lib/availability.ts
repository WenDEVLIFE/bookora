import { BUSINESS } from "@/lib/constants";
import {
  addDaysToKey,
  buildSlotDate,
  getBusinessNow,
  toDateKey,
  weekdayOfKey,
} from "@/lib/date";
import type {
  Booking,
  Service,
  StaffMember,
  WorkingHours,
} from "@/lib/types";

export {
  addDaysToKey,
  buildSlotDate,
  formatDateLong,
  formatDateShort,
  formatDateTime,
  formatDuration,
  formatPrice,
  formatTime,
  getBusinessNow,
  minutesBetween,
  parseDateKey,
  toDateKey,
  weekdayOfKey,
} from "@/lib/date";

const DATE_KEY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

const businessTimeFormatter = new Intl.DateTimeFormat("en-US", {
  timeZone: BUSINESS.timezone,
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

export interface Slot {
  startAt: string;
  endAt: string;
  staffIds: string[];
}

export interface StaffDayStatus {
  open: boolean;
  reason?: string;
  openTime?: string;
  closeTime?: string;
}

export interface GetAvailableSlotsArgs {
  dateKey: string;
  service: Service;
  staffId: string | "any";
  staff: StaffMember[];
  bookings: Booking[];
  now?: Date;
}

export interface StaffDayStatusArgs {
  staff: StaffMember;
  dateKey: string;
  now?: Date;
}

export interface ResolveStaffForSlotArgs {
  slot: Slot;
  staff: StaffMember[];
  bookings: Booking[];
}

export interface GetNextAvailableDateArgs {
  service: Service;
  staffId: string | "any";
  staff: StaffMember[];
  bookings: Booking[];
  fromDateKey?: string;
  horizonDays?: number;
  now?: Date;
}

function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(":").map(Number);

  if (!Number.isInteger(hours) || !Number.isInteger(minutes)) {
    return 0;
  }

  return hours * 60 + minutes;
}

function minutesToTime(totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

function workingHoursFor(
  staff: StaffMember,
  dateKey: string,
): WorkingHours | undefined {
  const weekday = weekdayOfKey(dateKey);

  return staff.workingHours.find((entry) => entry.day === weekday);
}

function isInsideUnavailable(
  staff: StaffMember,
  dateKey: string,
  start: Date,
  end: Date,
): boolean {
  return staff.unavailableSlots.some((slot) => {
    if (slot.date !== dateKey) {
      return false;
    }

    if (!slot.startTime && !slot.endTime) {
      return true;
    }

    const blockStart = slot.startTime
      ? buildSlotDate(dateKey, slot.startTime)
      : buildSlotDate(dateKey, "00:00");
    const blockEnd = slot.endTime
      ? buildSlotDate(dateKey, slot.endTime)
      : buildSlotDate(dateKey, "23:59");

    return start.getTime() < blockEnd.getTime() &&
      end.getTime() > blockStart.getTime();
  });
}

export function getEligibleStaff(
  service: Service,
  staff: StaffMember[],
): StaffMember[] {
  return staff.filter(
    (member) => member.active && member.serviceIds.includes(service.id),
  );
}

export function isStaffFree(args: {
  staffId: string;
  start: Date;
  end: Date;
  bookings: Booking[];
  bufferMinutes?: number;
}): boolean {
  const bufferMinutes = args.bufferMinutes ?? BUSINESS.bufferMinutes;
  const buffer = bufferMinutes * 60 * 1000;
  const start = args.start.getTime() - buffer;
  const end = args.end.getTime() + buffer;

  return !args.bookings.some((booking) => {
    if (booking.staffId !== args.staffId || booking.status === "cancelled") {
      return false;
    }

    const bookingStart = new Date(booking.startAt).getTime();
    const bookingEnd = new Date(booking.endAt).getTime();

    if (Number.isNaN(bookingStart) || Number.isNaN(bookingEnd)) {
      return false;
    }

    return start < bookingEnd && end > bookingStart;
  });
}

export function getAvailableSlots(args: GetAvailableSlotsArgs): Slot[] {
  const { dateKey, service, staffId, staff, bookings } = args;

  if (!DATE_KEY_PATTERN.test(dateKey) || !service.active) {
    return [];
  }

  const now = getBusinessNow(args.now);
  const nowTime = now.getTime();
  const eligible = getEligibleStaff(service, staff).filter((member) =>
    staffId === "any" ? true : member.id === staffId,
  );

  if (eligible.length === 0) {
    return [];
  }

  const openMinutes = timeToMinutes(BUSINESS.open);
  const closeMinutes = timeToMinutes(BUSINESS.close);
  const duration = service.durationMinutes;
  const slots = new Map<number, Slot>();

  for (
    let startMinutes = openMinutes;
    startMinutes + duration <= closeMinutes;
    startMinutes += BUSINESS.slotStepMinutes
  ) {
    const start = buildSlotDate(dateKey, minutesToTime(startMinutes));

    if (start.getTime() <= nowTime) {
      continue;
    }

    const end = new Date(start.getTime() + duration * 60 * 1000);
    const time = minutesToTime(startMinutes);

    for (const member of eligible) {
      const hours = workingHoursFor(member, dateKey);

      if (!hours) {
        continue;
      }

      const memberOpen = timeToMinutes(hours.open);
      const memberClose = timeToMinutes(hours.close);
      const memberStart = timeToMinutes(time);

      if (
        memberStart < memberOpen ||
        memberStart + duration > memberClose
      ) {
        continue;
      }

      if (isInsideUnavailable(member, dateKey, start, end)) {
        continue;
      }

      if (
        !isStaffFree({
          staffId: member.id,
          start,
          end,
          bookings,
          bufferMinutes: BUSINESS.bufferMinutes,
        })
      ) {
        continue;
      }

      const key = start.getTime();
      const existing = slots.get(key);

      if (existing) {
        existing.staffIds.push(member.id);
      } else {
        slots.set(key, {
          startAt: start.toISOString(),
          endAt: end.toISOString(),
          staffIds: [member.id],
        });
      }
    }
  }

  return Array.from(slots.values()).sort(
    (a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime(),
  );
}

export function resolveStaffForSlot(
  args: ResolveStaffForSlotArgs,
): StaffMember | undefined {
  const { slot, staff, bookings } = args;
  const dayKey = toDateKey(slot.startAt);
  const candidates = slot.staffIds
    .map((staffId) => staff.find((member) => member.id === staffId))
    .filter((member): member is StaffMember => Boolean(member?.active));

  if (candidates.length === 0) {
    return undefined;
  }

  const load = new Map<string, number>();

  for (const member of candidates) {
    load.set(member.id, 0);
  }

  for (const booking of bookings) {
    if (
      booking.status === "cancelled" ||
      toDateKey(booking.startAt) !== dayKey ||
      !load.has(booking.staffId)
    ) {
      continue;
    }

    load.set(booking.staffId, (load.get(booking.staffId) ?? 0) + 1);
  }

  return [...candidates].sort((a, b) => {
    const loadDifference = (load.get(a.id) ?? 0) - (load.get(b.id) ?? 0);

    if (loadDifference !== 0) {
      return loadDifference;
    }

    return a.name.localeCompare(b.name);
  })[0];
}

export function getStaffDayStatus(
  args: StaffDayStatusArgs,
): StaffDayStatus {
  const { staff, dateKey } = args;

  if (!DATE_KEY_PATTERN.test(dateKey)) {
    return { open: false, reason: "Invalid date" };
  }

  if (!staff.active) {
    return { open: false, reason: "Not accepting bookings" };
  }

  const hours = workingHoursFor(staff, dateKey);

  if (!hours) {
    return { open: false, reason: "Day off" };
  }

  const closedAllDay = staff.unavailableSlots.some(
    (slot) =>
      slot.date === dateKey && !slot.startTime && !slot.endTime,
  );

  if (closedAllDay) {
    const reason = staff.unavailableSlots.find(
      (slot) =>
        slot.date === dateKey && !slot.startTime && !slot.endTime,
    )?.reason;

    return { open: false, reason: reason ?? "Unavailable" };
  }

  const now = getBusinessNow(args.now);
  const todayKey = toDateKey(now);

  if (dateKey < todayKey) {
    return { open: false, reason: "Date has passed" };
  }

  if (dateKey === todayKey) {
    const parts = businessTimeFormatter.formatToParts(now);
    const nowMinutes =
      Number(parts.find((part) => part.type === "hour")?.value ?? "0") * 60 +
      Number(parts.find((part) => part.type === "minute")?.value ?? "0");

    if (nowMinutes >= timeToMinutes(hours.close)) {
      return { open: false, reason: "Closed for today" };
    }
  }

  return {
    open: true,
    openTime: hours.open,
    closeTime: hours.close,
  };
}

export function getNextAvailableDate(
  args: GetNextAvailableDateArgs,
): string | null {
  const now = getBusinessNow(args.now);
  const startKey = args.fromDateKey ?? toDateKey(now);
  const horizon = args.horizonDays ?? BUSINESS.horizonDays;

  if (!DATE_KEY_PATTERN.test(startKey)) {
    return null;
  }

  for (let offset = 0; offset < horizon; offset += 1) {
    const dateKey = addDaysToKey(startKey, offset);

    if (!dateKey) {
      return null;
    }

    const slots = getAvailableSlots({
      dateKey,
      service: args.service,
      staffId: args.staffId,
      staff: args.staff,
      bookings: args.bookings,
      now,
    });

    if (slots.length > 0) {
      return dateKey;
    }
  }

  return null;
}
