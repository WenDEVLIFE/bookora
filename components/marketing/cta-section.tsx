import Link from "next/link";
import { CalendarAddIcon, InfoCircleIcon } from "@/components/icons";
import { buttonClasses } from "@/components/ui/button";

export function CtaSection() {
  return (
    <section className="py-16 md:py-24">
      <div className="container-page">
        <div className="relative overflow-hidden rounded-panel border border-brand/25 bg-brand-tint px-6 py-12 sm:px-10 md:py-16">
          <div className="relative flex max-w-2xl flex-col gap-6">
            <div>
              <p className="label-text uppercase tracking-[0.18em] text-brand-soft">
                Ready when you are
              </p>
              <h2 className="heading-section mt-2 text-ink">
                Your next appointment is a few taps away.
              </h2>
              <p className="body-text mt-3 text-ink-secondary">
                Choose a service, pick a time that works, and keep every detail
                in one place.
              </p>
            </div>

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <Link
                href="/book"
                className={buttonClasses({
                  size: "lg",
                  className: "w-full sm:w-auto",
                })}
              >
                <CalendarAddIcon size={18} aria-hidden="true" />
                Book an appointment
              </Link>
              <p className="inline-flex items-center gap-2 text-caption text-ink-secondary">
                <InfoCircleIcon
                  size={16}
                  aria-hidden="true"
                  className="text-brand-soft"
                />
                No account required · Demo data stays in your browser
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
