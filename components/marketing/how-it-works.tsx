import {
  CalendarSearchIcon,
  CheckCircleIcon,
  ScissorsIcon,
  UserCheckIcon,
} from "@/components/icons";
import { SectionHeading } from "@/components/ui/section-heading";

const STEPS = [
  {
    title: "Choose a service",
    description:
      "Browse the catalog with clear pricing and durations, then pick what fits your day.",
    icon: ScissorsIcon,
  },
  {
    title: "Pick your professional",
    description:
      "Choose a specialist you trust, or let Bookora assign the first available expert.",
    icon: UserCheckIcon,
  },
  {
    title: "Reserve a time",
    description:
      "See only real openings that match the service length and the team's schedule.",
    icon: CalendarSearchIcon,
  },
  {
    title: "Confirm in seconds",
    description:
      "Review the details and receive a booking reference. No account is required.",
    icon: CheckCircleIcon,
  },
] as const;

export function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="scroll-mt-20 border-y border-line-subtle bg-surface/40 py-16 md:py-24"
    >
      <div className="container-page">
        <SectionHeading
          eyebrow="How it works"
          title="A booking flow that respects your time."
          description="From first look to a confirmed appointment in four clear steps."
        />

        <ol className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((step, index) => {
            const Icon = step.icon;

            return (
              <li
                key={step.title}
                className="flex h-full flex-col rounded-card border border-line bg-card p-5 sm:p-6"
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-input border border-brand/20 bg-brand-tint text-brand-soft">
                    <Icon size={20} aria-hidden="true" />
                  </span>
                  <span className="text-caption font-semibold tabular-nums text-ink-muted">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                </div>
                <h3 className="heading-card mt-5 text-ink">{step.title}</h3>
                <p className="support-text mt-2">{step.description}</p>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
