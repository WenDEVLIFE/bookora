import Link from "next/link";
import { CalendarAddIcon, StarIcon } from "@/components/icons";
import { AppointmentPreview } from "@/components/marketing/appointment-preview";
import { Badge } from "@/components/ui/badge";
import { buttonClasses } from "@/components/ui/button";

export function Hero() {
  return (
    <section className="glow-hero overflow-hidden py-16 md:py-24 lg:py-28">
      <div className="container-page grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
        <div className="max-w-xl">
          <Badge variant="brand" dot>
            Now booking · Quezon City
          </Badge>

          <h1 className="display-1 mt-5 text-ink">
            Booking that feels as good as the service.
          </h1>

          <p className="body-text mt-5 max-w-lg text-ink-secondary">
            Choose a service, pick a professional, and lock in a time that
            truly works. Clear pricing, honest availability, and no back-and-forth
            messages.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
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
            <Link
              href="/services"
              className={buttonClasses({
                variant: "outline",
                size: "lg",
                className: "w-full sm:w-auto",
              })}
            >
              Explore services
            </Link>
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-2 text-caption text-ink-secondary">
            <span className="inline-flex items-center gap-1.5">
              <StarIcon
                size={15}
                aria-hidden="true"
                className="text-brand-soft"
              />
              <strong className="font-semibold text-ink">4.9</strong>
              average rating
            </span>
            <span
              aria-hidden="true"
              className="hidden h-3 w-px bg-line-strong sm:block"
            />
            <span>
              <strong className="font-semibold text-ink">1,200+</strong>{" "}
              appointments
            </span>
            <span
              aria-hidden="true"
              className="hidden h-3 w-px bg-line-strong sm:block"
            />
            <span>
              <strong className="font-semibold text-ink">6 years</strong> in
              practice
            </span>
          </div>
        </div>

        <AppointmentPreview />
      </div>
    </section>
  );
}
