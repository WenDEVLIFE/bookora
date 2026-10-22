
# Bookora — Project Specification

## 1. Overview

**Project Name:** Bookora  
**Brand:** WenDEV  
**Tagline:** Smart scheduling. Seamless experiences.  
**Project Type:** Appointment Booking Web Application  
**Project Status:** Portfolio Demo / MVP Prototype  
**Primary Goal:** Demonstrate the design and development of a polished, interactive appointment booking platform for service-based businesses.

Bookora helps customers discover services, choose a preferred staff member, select an available appointment slot, and manage their booking experience. Business administrators can review appointments and manage demo business information.

## 2. Target Audience

- Salons and barbershops
- Beauty and wellness studios
- Massage and spa businesses
- Personal trainers and consultants
- Other appointment-based service providers

## 3. Product Goals

1. Deliver a premium, professional visual experience.
2. Make booking straightforward and intuitive.
3. Demonstrate realistic business workflows.
4. Provide a functional admin dashboard.
5. Work smoothly on desktop, tablet, and mobile.
6. Run without a backend, external database, or paid API.

## 4. Recommended Technology Stack

- Framework: Next.js with App Router
- Language: TypeScript
- Styling: Tailwind CSS
- Icons: Lucide
- Components: Reusable React components
- State: React state and context where appropriate
- Demo persistence: localStorage with safe initialization
- Data: Typed local TypeScript seed data
- Date handling: Native Date API or a lightweight date utility

Use the repository's existing stack if the project has already been initialized.

## 5. Application Routes

### Public Routes

- `/` — Marketing landing page
- `/services` — Service catalog
- `/book` — Appointment booking flow
- `/booking/success` — Booking confirmation
- `/booking/[id]` — Demo booking details

### Admin Routes

- `/admin` — Dashboard overview
- `/admin/appointments` — Appointment management
- `/admin/services` — Service management
- `/admin/staff` — Staff directory and availability

Admin routes are demo-only and must be clearly identified as a prototype. Do not imply that production authentication is implemented.

## 6. Customer Features

### Landing Page
- Premium hero section with primary booking CTA
- Featured services
- How booking works
- Staff highlights
- Customer testimonials using clearly fictional sample content
- Business information and footer

### Service Catalog
- Service name and description
- Price in Philippine pesos (PHP)
- Duration in minutes
- Category and optional image
- Search and category filtering
- Empty state when no services match

### Booking Flow
1. Select a service.
2. Select a staff member or choose "Any available professional."
3. Select a date.
4. Select an available time slot.
5. Enter customer name, email, and phone number.
6. Review the appointment summary.
7. Confirm the demo booking.
8. Display a unique booking reference and confirmation summary.

Include validation, loading-style feedback where useful, clear errors, and a way to return to previous steps.

### Availability Rules
- Use a configurable business schedule.
- Exclude past dates and past time slots.
- Respect service duration and staff availability.
- Prevent overlapping bookings for the same staff member.
- Include a configurable buffer between appointments if needed.
- Clearly indicate when no slots are available.
- Revalidate the slot immediately before creating a demo booking.

Availability calculations must use one consistent business timezone. Configure the demo timezone explicitly rather than relying on assumptions about the visitor's device.

## 7. Admin Features

### Dashboard
- Total bookings for the selected day
- Upcoming appointments
- Completed and cancelled booking counts
- Estimated booked service value
- Recent appointments
- Quick links to management pages

All statistics must be calculated from the actual demo dataset and current booking state.

### Appointment Management
- Table or card list of appointments
- Search by customer, service, or reference
- Filter by date and status
- View booking details
- Confirm pending appointments
- Mark confirmed appointments as completed
- Cancel appointments with a confirmation step
- Show helpful empty and error states

### Service Management
- List and inspect services
- Add and edit service details
- Set price, duration, category, and active status
- Prevent invalid prices and durations
- Allow inactive services to be excluded from new bookings

### Staff Management
- List staff profiles and assigned services
- Configure working days and working hours
- Configure unavailable dates or time periods
- Assign services to staff members
- Exclude inactive staff from new bookings

## 8. Data Model

### Service
- id
- name
- description
- category
- price
- durationMinutes
- image
- active

### StaffMember
- id
- name
- role
- bio
- avatar
- serviceIds
- workingHours
- unavailableSlots
- active

### Booking
- id
- reference
- customerName
- customerEmail
- customerPhone
- serviceId
- staffId
- startAt
- endAt
- status
- createdAt
- notes (optional)

Use ISO-formatted timestamps and stable IDs. Keep data validation separate from UI components.

## 9. Demo Persistence and State

- Seed the application with realistic sample services, staff, and appointments.
- Initialize browser storage safely after client hydration.
- Persist booking and admin changes to localStorage.
- Provide a reset-demo-data action with confirmation.
- Handle malformed or missing local storage by restoring valid seed data.
- Never store real payment information or sensitive credentials.
- Clearly communicate that demo data is stored in the current browser.

For a demo without local persistence, React state may be used instead. Document that changes disappear on refresh.

## 10. Design Requirements

- Premium dark interface
- Near-black and charcoal surfaces
- Restrained violet accent color
- Strong typographic hierarchy
- Generous spacing and consistent alignment
- Rounded cards and subtle borders
- Clear contrast and visible focus states
- Thoughtful hover, active, and disabled states
- Responsive navigation and data tables
- Accessible labels and keyboard interaction
- Consistent empty, loading, success, and error states

Follow THEME.md and TYPOGRAPHY.md for the exact design tokens and type scale.

## 11. Non-Functional Requirements

- Mobile-first responsive behavior
- Reusable and maintainable components
- Type-safe models and form handling
- No dead buttons or misleading actions
- No required external API
- No secrets or credentials in client code
- Accessible semantic HTML
- Reasonable performance and optimized images
- Clear separation between sample data, business logic, and presentation

## 12. Out of Scope

- Production authentication and authorization
- Server-side booking transactions
- Cross-device synchronization
- Online payments and refunds
- Real SMS or email delivery
- Third-party calendar integration
- Real-time notifications
- Multi-tenant production infrastructure

## 13. Definition of Done

- All planned routes render correctly.
- Customers can complete a valid booking.
- Conflicting appointments are rejected within the demo state.
- Admin actions update the visible interface.
- Dashboard metrics respond to booking changes.
- Search and filters work.
- Invalid forms display useful errors.
- Mobile layouts are usable without horizontal overflow.
- Demo data can be reset.
- Refresh behavior matches the documented persistence approach.
- No obvious broken links, console errors, or placeholder controls remain.
- The project is ready for a live portfolio demonstration.
