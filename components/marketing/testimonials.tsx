import { StarIcon } from "@/components/icons";
import { SectionHeading } from "@/components/ui/section-heading";

const TESTIMONIALS = [
  {
    quote:
      "The whole process felt considered. I picked my stylist, saw the exact time, and walked out with the cut I asked for.",
    name: "Mia Fernandez",
    service: "Hair Color & Gloss",
  },
  {
    quote:
      "Booking around a busy week was painless. The summary meant I knew exactly what to expect before I arrived.",
    name: "Clara Navarro",
    service: "Deep Tissue Massage",
  },
  {
    quote:
      "A quiet room, careful nail work, and no back-and-forth messages. I booked my next visit before I left.",
    name: "Jules Tan",
    service: "Spa Pedicure",
  },
] as const;

export function Testimonials() {
  return (
    <section className="border-y border-line-subtle bg-surface/40 py-16 md:py-24">
      <div className="container-page">
        <SectionHeading
          eyebrow="Client notes"
          title="A calm experience, start to finish."
          description="Sample feedback from a fictional client roster, included to show the finished experience."
        />

        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {TESTIMONIALS.map((testimonial) => (
            <figure
              key={testimonial.name}
              className="flex h-full flex-col rounded-card border border-line bg-card p-5 sm:p-6"
            >
              <div
                role="img"
                aria-label="Rated 5 out of 5"
                className="flex items-center gap-1 text-brand-soft"
              >
                {Array.from({ length: 5 }).map((_, index) => (
                  <StarIcon key={index} size={15} aria-hidden="true" />
                ))}
              </div>
              <blockquote className="body-text mt-4 flex-1 text-ink">
                “{testimonial.quote}”
              </blockquote>
              <figcaption className="mt-5 border-t border-line-subtle pt-4">
                <p className="text-sm font-semibold text-ink">
                  {testimonial.name}
                </p>
                <p className="support-text mt-0.5">{testimonial.service}</p>
                <p className="text-caption mt-2 text-ink-muted">
                  Fictional demo testimonial
                </p>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
