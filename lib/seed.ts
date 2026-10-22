import { DEMO_VERSION } from "@/lib/constants";
import {
  addDaysToKey,
  buildSlotDate,
  getBusinessNow,
  toDateKey,
  weekdayOfKey,
} from "@/lib/date";
import type {
  Booking,
  BookingStatus,
  DemoData,
  Service,
  StaffMember,
  UnavailableSlot,
  Weekday,
  WorkingHours,
} from "@/lib/types";

const WEEKDAYS: Weekday[] = [1, 2, 3, 4, 5, 6];

function workingWeek(open: string, close: string): WorkingHours[] {
  return WEEKDAYS.map((day) => ({ day, open, close }));
}

function unavailable(
  id: string,
  date: string,
  reason: string,
  startTime?: string,
  endTime?: string,
): UnavailableSlot {
  return {
    id,
    date,
    reason,
    ...(startTime ? { startTime } : {}),
    ...(endTime ? { endTime } : {}),
  };
}

function addMinutesToTime(time: string, minutesToAdd: number): string {
  const [hours, minutes] = time.split(":").map(Number);
  const total = hours * 60 + minutes + minutesToAdd;
  const nextHours = Math.floor(total / 60);
  const nextMinutes = total % 60;

  return `${String(nextHours).padStart(2, "0")}:${String(nextMinutes).padStart(
    2,
    "0",
  )}`;
}

export const SEED_SERVICES: Service[] = [
  {
    id: "svc_signature_haircut",
    name: "Signature Haircut",
    description:
      "A tailored cut with a consultation, relaxing wash, and a polished finish.",
    category: "Hair",
    price: 850,
    durationMinutes: 45,
    active: true,
  },
  {
    id: "svc_hair_color_gloss",
    name: "Hair Color & Gloss",
    description:
      "Full-color refresh with a conditioning gloss for depth, shine, and coverage.",
    category: "Hair",
    price: 2450,
    durationMinutes: 120,
    active: true,
  },
  {
    id: "svc_balayage_dimension",
    name: "Balayage & Dimension",
    description:
      "Hand-painted dimension with a soft root melt and a customized toner.",
    category: "Hair",
    price: 3800,
    durationMinutes: 180,
    active: true,
  },
  {
    id: "svc_keratin_smoothing",
    name: "Keratin Smoothing",
    description:
      "A smoothing treatment that reduces frizz and leaves hair soft for weeks.",
    category: "Hair",
    price: 1800,
    durationMinutes: 120,
    active: true,
  },
  {
    id: "svc_gel_manicure",
    name: "Gel Manicure",
    description:
      "Shape, cuticle care, and a long-lasting gel finish with your chosen shade.",
    category: "Nails",
    price: 650,
    durationMinutes: 60,
    active: true,
  },
  {
    id: "svc_spa_pedicure",
    name: "Spa Pedicure",
    description:
      "A warm soak, exfoliation, massage, and polish for refreshed feet.",
    category: "Nails",
    price: 750,
    durationMinutes: 75,
    active: true,
  },
  {
    id: "svc_hydrafacial_glow",
    name: "Hydrafacial Glow",
    description:
      "Deep cleansing, gentle exfoliation, and hydration for a brighter complexion.",
    category: "Skin",
    price: 1950,
    durationMinutes: 60,
    active: true,
  },
  {
    id: "svc_brow_lamination",
    name: "Brow Lamination",
    description:
      "Lift, shape, and set brows for a fuller look that lasts for weeks.",
    category: "Skin",
    price: 900,
    durationMinutes: 45,
    active: true,
  },
  {
    id: "svc_deep_tissue_massage",
    name: "Deep Tissue Massage",
    description:
      "Focused pressure therapy for tension in the back, shoulders, and neck.",
    category: "Massage",
    price: 1200,
    durationMinutes: 90,
    active: true,
  },
  {
    id: "svc_aromatherapy_ritual",
    name: "Aromatherapy Ritual",
    description:
      "A calm full-body massage with warm oils and a personalized blend.",
    category: "Wellness",
    price: 1500,
    durationMinutes: 75,
    active: true,
  },
];

export function buildSeedStaff(now?: Date): StaffMember[] {
  const baseDate = toDateKey(now ?? getBusinessNow());
  const futureDate = (days: number) => addDaysToKey(baseDate, days);

  return [
    {
      id: "stf_ana_reyes",
      name: "Ana Reyes",
      role: "Senior Hair Stylist",
      bio: "Ana specializes in dimensional color and precision cuts, with a calm approach that puts every client at ease.",
      serviceIds: [
        "svc_signature_haircut",
        "svc_hair_color_gloss",
        "svc_balayage_dimension",
        "svc_keratin_smoothing",
      ],
      workingHours: workingWeek("09:00", "19:00"),
      unavailableSlots: [
        unavailable(
          "unavail_ana_training",
          futureDate(9),
          "Color training session",
          "13:00",
          "17:00",
        ),
        unavailable(
          "unavail_ana_leave",
          futureDate(16),
          "Family leave",
        ),
      ],
      active: true,
    },
    {
      id: "stf_marco_santos",
      name: "Marco Santos",
      role: "Barber & Grooming Specialist",
      bio: "Marco brings a sharp eye for structure and a relaxed chair-side manner to every haircut and grooming service.",
      serviceIds: [
        "svc_signature_haircut",
        "svc_hair_color_gloss",
        "svc_keratin_smoothing",
        "svc_brow_lamination",
      ],
      workingHours: workingWeek("10:00", "18:00"),
      unavailableSlots: [
        unavailable(
          "unavail_marco_personal",
          futureDate(7),
          "Family commitment",
        ),
        unavailable(
          "unavail_marco_appointment",
          futureDate(12),
          "Dental appointment",
          "10:00",
          "12:00",
        ),
      ],
      active: true,
    },
    {
      id: "stf_liza_dela_cruz",
      name: "Liza Dela Cruz",
      role: "Nail & Skin Therapist",
      bio: "Liza is known for meticulous nail work and thoughtful skin consultations tailored to each client.",
      serviceIds: [
        "svc_gel_manicure",
        "svc_spa_pedicure",
        "svc_hydrafacial_glow",
        "svc_brow_lamination",
      ],
      workingHours: workingWeek("09:00", "18:00"),
      unavailableSlots: [
        unavailable(
          "unavail_liza_vacation",
          futureDate(10),
          "Vacation leave",
        ),
        unavailable(
          "unavail_liza_training",
          futureDate(18),
          "Continuing education",
          "09:00",
          "12:00",
        ),
      ],
      active: true,
    },
    {
      id: "stf_bea_villanueva",
      name: "Bea Villanueva",
      role: "Massage & Wellness Therapist",
      bio: "Bea blends deep tissue technique with restorative wellness rituals for a grounded, unhurried experience.",
      serviceIds: [
        "svc_deep_tissue_massage",
        "svc_aromatherapy_ritual",
        "svc_hydrafacial_glow",
        "svc_spa_pedicure",
      ],
      workingHours: workingWeek("10:00", "19:00"),
      unavailableSlots: [
        unavailable(
          "unavail_bea_workshop",
          futureDate(8),
          "Advanced massage workshop",
          "15:00",
          "19:00",
        ),
        unavailable(
          "unavail_bea_leave",
          futureDate(14),
          "Personal leave",
        ),
      ],
      active: true,
    },
  ];
}

export const SEED_STAFF: StaffMember[] = buildSeedStaff();

interface SeedBookingSpec {
  dayOffset: number;
  time: string;
  serviceId: string;
  staffId: string;
  status: BookingStatus;
  reference: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  notes?: string;
  createdDaysAgo: number;
}

const SEED_BOOKINGS: SeedBookingSpec[] = [
  {
    dayOffset: -1,
    time: "10:00",
    serviceId: "svc_hair_color_gloss",
    staffId: "stf_ana_reyes",
    status: "completed",
    reference: "BK-7K2M9Q",
    customerName: "Mariel Santos",
    customerEmail: "mariel.santos@example.com",
    customerPhone: "+63 917 555 0181",
    notes: "Wants a soft root melt.",
    createdDaysAgo: 6,
  },
  {
    dayOffset: -1,
    time: "10:00",
    serviceId: "svc_gel_manicure",
    staffId: "stf_liza_dela_cruz",
    status: "completed",
    reference: "BK-4P8T2X",
    customerName: "Angela Cruz",
    customerEmail: "angela.cruz@example.com",
    customerPhone: "+63 917 555 0164",
    createdDaysAgo: 5,
  },
  {
    dayOffset: -1,
    time: "15:00",
    serviceId: "svc_deep_tissue_massage",
    staffId: "stf_bea_villanueva",
    status: "cancelled",
    reference: "BK-9R3W7Z",
    customerName: "Paolo Reyes",
    customerEmail: "paolo.reyes@example.com",
    customerPhone: "+63 917 555 0147",
    createdDaysAgo: 4,
  },
  {
    dayOffset: 0,
    time: "09:00",
    serviceId: "svc_signature_haircut",
    staffId: "stf_ana_reyes",
    status: "completed",
    reference: "BK-6H4N8B",
    customerName: "Camille Flores",
    customerEmail: "camille.flores@example.com",
    customerPhone: "+63 917 555 0112",
    createdDaysAgo: 2,
  },
  {
    dayOffset: 0,
    time: "11:00",
    serviceId: "svc_hydrafacial_glow",
    staffId: "stf_liza_dela_cruz",
    status: "confirmed",
    reference: "BK-2C7Y5L",
    customerName: "Joshua Garcia",
    customerEmail: "joshua.garcia@example.com",
    customerPhone: "+63 917 555 0198",
    notes: "Sensitive skin around the cheeks.",
    createdDaysAgo: 3,
  },
  {
    dayOffset: 0,
    time: "15:00",
    serviceId: "svc_signature_haircut",
    staffId: "stf_marco_santos",
    status: "confirmed",
    reference: "BK-8F3J6V",
    customerName: "Patricia Lim",
    customerEmail: "patricia.lim@example.com",
    customerPhone: "+63 917 555 0136",
    createdDaysAgo: 2,
  },
  {
    dayOffset: 0,
    time: "16:00",
    serviceId: "svc_aromatherapy_ritual",
    staffId: "stf_bea_villanueva",
    status: "pending",
    reference: "BK-5D9S2K",
    customerName: "Daniel Mercado",
    customerEmail: "daniel.mercado@example.com",
    customerPhone: "+63 917 555 0175",
    notes: "Prefers a quiet room.",
    createdDaysAgo: 1,
  },
  {
    dayOffset: 1,
    time: "10:00",
    serviceId: "svc_balayage_dimension",
    staffId: "stf_ana_reyes",
    status: "confirmed",
    reference: "BK-3G7X4M",
    customerName: "Sofia Villanueva",
    customerEmail: "sofia.villanueva@example.com",
    customerPhone: "+63 917 555 0159",
    createdDaysAgo: 2,
  },
  {
    dayOffset: 1,
    time: "14:00",
    serviceId: "svc_spa_pedicure",
    staffId: "stf_liza_dela_cruz",
    status: "pending",
    reference: "BK-7B2Q8T",
    customerName: "Rafael Domingo",
    customerEmail: "rafael.domingo@example.com",
    customerPhone: "+63 917 555 0123",
    createdDaysAgo: 1,
  },
  {
    dayOffset: 2,
    time: "11:00",
    serviceId: "svc_brow_lamination",
    staffId: "stf_marco_santos",
    status: "pending",
    reference: "BK-4L6Z3R",
    customerName: "Nadine Aquino",
    customerEmail: "nadine.aquino@example.com",
    customerPhone: "+63 917 555 0187",
    createdDaysAgo: 1,
  },
  {
    dayOffset: 2,
    time: "14:00",
    serviceId: "svc_deep_tissue_massage",
    staffId: "stf_bea_villanueva",
    status: "confirmed",
    reference: "BK-9N5W2P",
    customerName: "Miguel Torres",
    customerEmail: "miguel.torres@example.com",
    customerPhone: "+63 917 555 0141",
    createdDaysAgo: 2,
  },
  {
    dayOffset: 3,
    time: "09:00",
    serviceId: "svc_keratin_smoothing",
    staffId: "stf_ana_reyes",
    status: "confirmed",
    reference: "BK-6T8K4J",
    customerName: "Isabel Ramos",
    customerEmail: "isabel.ramos@example.com",
    customerPhone: "+63 917 555 0166",
    createdDaysAgo: 3,
  },
  {
    dayOffset: 3,
    time: "13:00",
    serviceId: "svc_gel_manicure",
    staffId: "stf_liza_dela_cruz",
    status: "pending",
    reference: "BK-2Y7C9F",
    customerName: "Bea Mendoza",
    customerEmail: "bea.mendoza@example.com",
    customerPhone: "+63 917 555 0193",
    createdDaysAgo: 1,
  },
  {
    dayOffset: 5,
    time: "12:00",
    serviceId: "svc_aromatherapy_ritual",
    staffId: "stf_bea_villanueva",
    status: "confirmed",
    reference: "BK-8M3V6H",
    customerName: "Lucas Bautista",
    customerEmail: "lucas.bautista@example.com",
    customerPhone: "+63 917 555 0154",
    createdDaysAgo: 2,
  },
];

function resolveSeedDates(
  todayKey: string,
  offsets: number[],
): Map<number, string> {
  const used = new Set<string>();
  const dates = new Map<number, string>();

  for (const offset of offsets) {
    const direction = offset < 0 ? -1 : 1;
    let dateKey = addDaysToKey(todayKey, offset);

    while (weekdayOfKey(dateKey) === 0 || used.has(dateKey)) {
      dateKey = addDaysToKey(dateKey, direction);
    }

    used.add(dateKey);
    dates.set(offset, dateKey);
  }

  return dates;
}

export function createSeedBookings(now?: Date): Booking[] {
  const baseNow = getBusinessNow(now);
  const todayKey = toDateKey(baseNow);
  const servicesById = new Map(
    SEED_SERVICES.map((service) => [service.id, service]),
  );
  const seedDates = resolveSeedDates(todayKey, [
    ...new Set(SEED_BOOKINGS.map((spec) => spec.dayOffset)),
  ]);

  return SEED_BOOKINGS.map((spec, index) => {
    const service = servicesById.get(spec.serviceId);
    const duration = service?.durationMinutes ?? 60;
    const dateKey =
      seedDates.get(spec.dayOffset) ?? addDaysToKey(todayKey, spec.dayOffset);
    const startAt = buildSlotDate(dateKey, spec.time);
    const endAt = buildSlotDate(
      dateKey,
      addMinutesToTime(spec.time, duration),
    );
    const createdAt = new Date(
      baseNow.getTime() - spec.createdDaysAgo * 24 * 60 * 60 * 1000,
    ).toISOString();

    return {
      id: `bk_seed_${String(index + 1).padStart(2, "0")}`,
      reference: spec.reference,
      customerName: spec.customerName,
      customerEmail: spec.customerEmail,
      customerPhone: spec.customerPhone,
      serviceId: spec.serviceId,
      staffId: spec.staffId,
      startAt: startAt.toISOString(),
      endAt: endAt.toISOString(),
      status: spec.status,
      createdAt,
      ...(spec.notes ? { notes: spec.notes } : {}),
    };
  });
}

export function createSeedData(now?: Date): DemoData {
  return {
    version: DEMO_VERSION,
    services: structuredClone(SEED_SERVICES),
    staff: buildSeedStaff(now),
    bookings: createSeedBookings(now),
  };
}
