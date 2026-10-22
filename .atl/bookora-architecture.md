# Bookora — Internal Build Contract

Read `docs/PROJECT.MD`, `docs/THEME.MD`, `docs/TYPOGRAHY.MD` first. This file resolves implementation details.
All code, comments, UI copy, and identifiers are in English. No emojis in source. Strict TypeScript, no `any`.

## 0. Non-negotiables

- Next.js 16.4 App Router, React 19, Tailwind CSS 4 (`@import "tailwindcss"` + `@theme`), TypeScript strict.
- Server Components by default; `"use client"` only where interaction/state is required.
- Demo-only: no auth, no server, no external API. Persistence = localStorage after hydration.
- Icons: `@solar-icons/react`, linear style. Import only from `@solar-icons/react/linear`.
  Approved names (verified to exist): CalendarIcon, CalendarSearchIcon, CalendarMarkIcon, CalendarMinimalisticIcon, CalendarAddIcon,
  ClockCircleIcon, ClockSquareIcon, UserIcon, UserRoundedIcon, UserCircleIcon, UsersGroupRoundedIcon, UsersGroupTwoRoundedIcon, UserCheckIcon,
  ScissorsIcon, ScissorsSquareIcon, StarIcon, Star2Icon, StarsIcon, MagnifierIcon, PhoneIcon, LetterIcon, MapPointIcon, WalletIcon, WalletMoneyIcon,
  ChartIcon, Chart2Icon, GraphIcon, GraphUpIcon, SettingsIcon, SettingsMinimalisticIcon, HomeIcon, CloseIcon, CloseCircleIcon, CheckIcon,
  CheckCircleIcon, CheckSquareIcon, ChecklistIcon, HamburgerMenuIcon, AltArrowRightIcon, AltArrowLeftIcon, AltArrowDownIcon, AltArrowUpIcon,
  TicketIcon, CardIcon, CardholderIcon, TagIcon, TagPriceIcon, ShieldCheckIcon, BagIcon, BellIcon, BellRingIcon, RefreshIcon, RestartIcon,
  TrashBinMinimalisticIcon, TrashBinMinimalistic2Icon, TrashBinTrashIcon, PenIcon, PenNewSquareIcon, AddIcon, MinusIcon, DownloadIcon,
  SunIcon, MoonIcon, DangerTriangleIcon, InfoCircleIcon, MagicWandIcon, VerifiedCheckIcon, RoundArrowLeftIcon, RoundArrowRightIcon,
  ArrowLeftIcon, ArrowRightIcon, FilterIcon, SortIcon, MenuDotsIcon, EyeIcon, ShareIcon, GiftIcon, MedalStarIcon, HandHeartIcon, CrownStarIcon,
  NotesIcon, DocumentsIcon, BuildingsIcon, ShopIcon, PaletteIcon, LeafIcon, HeartPulseIcon, DumbbellIcon, WineglassIcon, CupIcon, LoginIcon, LogoutIcon.
  Do NOT invent icon names. Do NOT use Lucide (PROJECT.md mentions it, but the user overrode it with Solar Icons).
- Utilities: `cn()` from `lib/utils.ts` using clsx + tailwind-merge.
- No new dependencies beyond: @solar-icons/react, clsx, tailwind-merge. No chart library, no date library, no form library.
- No remote images. Avatars = initials on a gradient. Service art = category icon on a token gradient.
- Every button/link must do something real. No placeholders.
- No horizontal overflow at 320px. All tables become cards under `md`.

## 1. Design tokens (app/globals.css)

Use Tailwind v4 `@theme` so utilities exist:
- colors: `app` #0B0B10, `surface` #101017, `card` #15151D, `elevated` #1C1C27, `input` #111119,
  `brand` #8B5CF6, `brand-hover` #7C3AED, `brand-soft` #A78BFA, `brand-tint` #251B3B,
  `ink` #F5F5FA, `ink-secondary` #A1A1B3, `ink-muted` #737387,
  `line` #292936, `line-strong` #3A3A4B, `line-subtle` #22222D,
  `success` #22C55E, `success-bg` #10251A, `warning` #F59E0B, `warning-bg` #2A2111,
  `danger` #F87171, `danger-bg` #301719, `info` #60A5FA, `info-bg` #15243A.
- font: `--font-sans: var(--font-inter), ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif`.
- radii: `--radius-control: 8px`, `--radius-input: 10px`, `--radius-card: 14px`, `--radius-panel: 20px`.
- text sizes: `--text-display` (56px/1.08, bold), `--text-hero` maybe not needed; define `--text-display`, `--text-section` (36px/1.2),
  `--text-page` (28px/1.25), `--text-card` (16px/1.4), `--text-metric` (32px/1.1), `--text-support` (14px/1.5), `--text-caption` (13px/1.5).
- Shared component classes in `@layer components`: `.container-page` (max 1200px, px 16/24/32), `.container-dash` (max 1440px, same padding),
  `.display-1` (36 → 44 → 56px, bold, tracking -0.03em), `.heading-section` (28 → 36px semibold), `.heading-page` (28px semibold),
  `.heading-card` (16px semibold), `.body-text`, `.support-text`, `.label-text`, `.metric-value` (tabular-nums).
- Base `body`: bg-app, text-ink, font-sans, antialiased. `::selection` brand tint. Visible focus ring brand-soft.
- `@media (prefers-reduced-motion: reduce)`: animations/transitions ~0.01ms.
- Optional utility `.glow-hero` for a restrained violet radial behind the hero only.

## 2. Data contract (lib/types.ts)

```ts
export type ServiceCategory = "Hair" | "Nails" | "Skin" | "Massage" | "Wellness";
export interface Service {
  id: string; name: string; description: string; category: ServiceCategory;
  price: number; durationMinutes: number; image?: string; active: boolean;
}
export type BookingStatus = "pending" | "confirmed" | "completed" | "cancelled";
export type Weekday = 0 | 1 | 2 | 3 | 4 | 5 | 6; // JS getDay
export interface WorkingHours { day: Weekday; open: string; close: string; } // "09:00"
export interface UnavailableSlot { id: string; date: string; startTime?: string; endTime?: string; reason?: string; }
export interface StaffMember {
  id: string; name: string; role: string; bio: string; avatar?: string;
  serviceIds: string[]; workingHours: WorkingHours[]; unavailableSlots: UnavailableSlot[]; active: boolean;
}
export interface Booking {
  id: string; reference: string; customerName: string; customerEmail: string; customerPhone: string;
  serviceId: string; staffId: string; startAt: string; endAt: string; status: BookingStatus;
  createdAt: string; notes?: string;
}
export interface DemoData { version: number; services: Service[]; staff: StaffMember[]; bookings: Booking[]; }
```

`lib/constants.ts`: `DEMO_VERSION = 1`, `STORAGE_KEY = "bookora.demo.v1"`, `BUSINESS = { name: "Bookora Studio", brand: "WenDEV", tagline, timezone: "Asia/Manila", phone: "+63 917 555 0142", email: "hello@bookora.ph", address, hours: "Mon–Sat · 9:00 AM – 7:00 PM", slotStepMinutes: 30, bufferMinutes: 15, horizonDays: 30 }`.

## 3. Seed data (lib/seed.ts)

- `SEED_SERVICES`: 10 services, realistic, PHP prices, durations 30–180:
  Hair (Signature Haircut 850/45, Hair Color & Gloss 2450/120, Balayage & Dimension 3800/180, Keratin Smoothing 1800/120),
  Nails (Gel Manicure 650/60, Spa Pedicure 750/75), Skin (Hydrafacial Glow 1950/60, Brow Lamination 900/45),
  Massage (Deep Tissue Massage 1200/90), Wellness (Aromatherapy Ritual 1500/75). All active.
- `SEED_STAFF`: 4 staff with serviceIds mapped by category/skill, working hours Mon–Sat (varied 09:00–19:00 / 10:00–18:00), Sunday none,
  1–2 future unavailable slots. Fictional bios, professional roles, initials avatar fallback.
- `createSeedBookings(now)`: ~14 bookings across yesterday (-1), today, tomorrow (+1), +2, +3, +5 with mixed statuses.
  Times on the 30-min grid, no two active bookings for the same staff overlap, all within working hours, end <= close.
  Past bookings = completed/cancelled; today has 1 completed (past time), 2 confirmed, 1 pending; future pending/confirmed.
  `createdAt` in the past. References `BK-` + 6 uppercase alphanumerics (unique).
- `createSeedData(now)` returns `{ version, services, staff, bookings }`. Services/staff are fresh copies (`structuredClone` or map).

## 4. Time & availability (lib/availability.ts)

Business timezone Asia/Manila (UTC+8, no DST). All display in business timezone.
```ts
export function getBusinessNow(now?: Date): Date;
export function toDateKey(input: Date | string): string;      // YYYY-MM-DD in business TZ
export function parseDateKey(key: string): Date;              // noon-safe Date for display
export function addDaysToKey(key: string, days: number): string;
export function weekdayOfKey(key: string): Weekday;
export function buildSlotDate(dateKey: string, time: string): Date; // `${dateKey}T${time}:00+08:00`
export function minutesBetween(a: string, b: string): number; // "09:00","17:00"
export function formatTime(iso: string): string;              // "9:00 AM" in business TZ
export function formatDateLong(isoOrKey: string, opts?): string; // "Thu, Oct 22"
export function formatDateShort(isoOrKey: string): string;    // "Oct 22"
export function formatPrice(amount: number): string;          // "₱850" / "₱1,950"
export function formatDuration(minutes: number): string;      // "45 min" / "1 hr 30 min"
export function formatDateTime(iso: string): string;
export interface Slot { startAt: string; endAt: string; staffIds: string[]; }
export function getAvailableSlots(args: { dateKey: string; service: Service; staffId: string | "any"; staff: StaffMember[]; bookings: Booking[]; now?: Date; }): Slot[];
export function isStaffFree(args: { staffId: string; start: Date; end: Date; bookings: Booking[]; bufferMinutes?: number; }): boolean;
export function getEligibleStaff(service: Service, staff: StaffMember[]): StaffMember[];
export function getStaffDayStatus(...): { open: boolean; reason?: string };
export function resolveStaffForSlot(slot: Slot, ...): StaffMember | undefined; // least-loaded that day
export function getNextAvailableDate(args): string | null;
```
Rules:
- Slot candidates step 30 min from max(business/ staff open) to (staff close − service duration).
- Exclude slots starting <= now.
- Exclude staff not active, not assigned to service, not working that weekday, or fully inside an unavailable slot.
- Conflict = candidate interval overlaps a non-cancelled booking of that staff with 15-min buffer on both sides.
- staffId "any": a slot exists if ≥1 eligible staff free; `staffIds` lists all free eligible staff.
- Revalidate immediately before creating the booking.

## 5. Persistence & store (lib/storage.ts, lib/demo-store.tsx)

- `loadDemoData(): DemoData | null` — safe JSON parse + minimal shape/version validation; malformed → null.
- `saveDemoData(data)`, `clearDemoData()`.
- Provider `"use client"`: initial state `{ services: SEED_SERVICES, staff: SEED_STAFF, bookings: [], hydrated: false }`.
  On mount: load localStorage or seed; set hydrated. Persist on every mutation and on storage events (cross-tab).
  Never persist before hydrated (do not overwrite saved data).
- Context value:
```ts
hydrated: boolean; services; staff; bookings;
serviceById(id): Service | undefined; staffById(id): StaffMember | undefined;
createBooking(input: CreateBookingInput): Result<Booking>;   // validates + revalidates availability
updateBookingStatus(id, status): Result<Booking>;
saveService(input: ServiceInput & { id?: string }): Result<Service>;
toggleServiceActive(id): Result<Service>;
saveStaff(input: StaffInput & { id?: string }): Result<StaffMember>;
toggleStaffActive(id): Result<StaffMember>;
resetDemoData(): Result<void>;
```
`Result<T> = { ok: true; data: T } | { ok: false; error: string; fieldErrors?: Record<string,string> }`.
- `CreateBookingInput`: serviceId, staffId (`"any"` allowed), startAt/endAt or dateKey+time, customerName, email, phone, notes.
  Store resolves "any" to a free staff; generates a unique `BK-XXXXXX`; status "pending"; `createdAt` now.
- Status transitions: pending → confirmed | cancelled; confirmed → completed | cancelled; completed/cancelled terminal. Invalid → error.
- Booking id: `bk_` + crypto.randomUUID() fallback.
- Reference alphabet excludes O/0/I/1.

## 6. Validation (lib/validation.ts)

Pure functions returning `Record<string,string>`:
- `validateCustomer({name,email,phone})` — name ≥2 chars, email regex, PH-ish phone 10–13 digits allowing +, spaces, dashes, parens.
- `validateService({name,description,price,durationMinutes,category})` — name ≥2, description ≥10, price > 0 ≤ 100000, duration 15–480 and multiple of 15.
- `validateStaff(...)` — name/role required, ≥1 service, ≥1 working day.
- `sanitizePrice`, `normalizePhone`.

## 7. UI components

`lib/utils.ts`: `cn`, `initials(name)`, `generateReference(existing)`, `uid(prefix)`.
`components/ui/`:
- `button.tsx` — CVA-free variant map; exports `Button` and `buttonClasses({variant,size})`. variants primary, secondary, ghost, outline, destructive; sizes sm/md/lg/icon. Supports `asChild`-free usage; for links use `buttonClasses`.
- `input.tsx`, `textarea.tsx`, `select.tsx`, `label.tsx`, `field.tsx` (label + hint + error + aria-describedby wiring).
- `card.tsx` — Card/CardHeader/CardTitle/CardDescription/CardContent/CardFooter.
- `badge.tsx` — neutral/brand/success/warning/danger/info + `StatusBadge` for booking status (label + dot + icon-free).
- `modal.tsx` — accessible client dialog: portal, overlay, focus trap, Esc, `aria-modal`, labelled title, body scroll lock, sizes sm/md/lg, close button with sr-only label.
- `skeleton.tsx`, `empty-state.tsx` (icon + title + description + optional action), `alert.tsx` (info/success/warning/danger with icon + role), `spinner.tsx`, `avatar.tsx` (initials gradient), `section-heading.tsx` (eyebrow + title + description), `stat-card.tsx` for admin.
- `date-picker.tsx` maybe not; date selection is a custom horizontal list in booking and native date input in admin filters.

`components/icons.ts`: re-export the approved icon set from `@solar-icons/react/linear` to keep imports consistent. (Optional; direct imports are fine but must use approved names.)

## 8. Routes

```
app/layout.tsx                 Inter font + metadata + DemoStoreProvider
app/globals.css
app/icon.svg                   custom Bookora mark
app/(site)/layout.tsx          SiteHeader + main + SiteFooter
app/(site)/page.tsx            Landing
app/(site)/services/page.tsx   Catalog (client inner component, Suspense)
app/(site)/book/page.tsx       Booking wizard (client inner, Suspense for useSearchParams)
app/(site)/booking/success/page.tsx   Confirmation (useSearchParams, Suspense)
app/(site)/booking/[id]/page.tsx      Demo booking details (client, useParams)
app/admin/layout.tsx           AdminShell (sidebar + mobile drawer + demo banner)
app/admin/page.tsx             Dashboard
app/admin/appointments/page.tsx
app/admin/services/page.tsx
app/admin/staff/page.tsx
```
Root metadata: title template `%s · Bookora`, description, applicationName, themeColor #0B0B10 (via viewport export if needed).
Remove the old `app/page.tsx`. Keep `app/favicon.ico` or replace with icon.svg (both okay; icon.svg wins).

## 9. Design quality bar

- Marketing: hero with badge, two-line headline, supporting copy, primary CTA "Book an appointment" + secondary "Explore services";
  right side = a composed "appointment card" preview built with real seed data (not a screenshot). Trust row (rating, years, clients).
  Featured services 3 cards; "How it works" 4 steps; staff highlights 4 cards; testimonials 3 quote cards with fictional labels;
  final CTA band; footer with contact, hours, links, "Demo prototype" note.
- Cards: `bg-card border border-line rounded-card p-5/6`, hover `border-line-strong` + slight `-translate-y-0.5` only when interactive.
- Violet used sparingly: primary buttons, active nav, selected date/slot, step indicator, small accents.
- No emoji. No exclamation-heavy copy. No fake social proof that looks like real company logos.
- Admin: sidebar 240px, wordmark, nav icons, active state brand tint + left indicator; topbar with page title/breadcrumb + reset demo;
  demo banner; metric cards with tabular numbers; 7-day bar chart (CSS bars, aria labels); upcoming list; recent appointments table.
- Booking: 3-column desktop (steps rail / content / summary) or 2-column content+summary; mobile single column with sticky bottom actions;
  step indicator with completed/current/upcoming states; selected states ring brand; disabled slots visibly disabled with reason.
- Status: pending warning, confirmed info, completed success, cancelled danger. Always label + color.
- Motion: `transition-colors duration-150`, entrance `animate-in`-style custom keyframes optional; respect reduced motion.

## 10. Acceptance

- `npm run lint` and `npm run build` pass.
- No unused imports (ESLint/TS), no `any`, no `@ts-ignore`.
- Booking can be completed end-to-end; duplicate submit blocked; conflicts rejected; past slots hidden.
- Admin updates reflect dashboard immediately; reset restores seed.
- All routes linked from header/sidebar/footer; no dead controls.
- Works at 320/768/1024/1440 widths.
