import Link from "next/link";
import {
  ClockCircleIcon,
  InfoCircleIcon,
  LetterIcon,
  MapPointIcon,
  PhoneIcon,
} from "@/components/icons";
import { Wordmark } from "@/components/marketing/logo";
import { BUSINESS } from "@/lib/constants";

const PHONE_HREF = `tel:${BUSINESS.phone.replace(/[^\d+]/g, "")}`;

const EXPLORE_LINKS = [
  { label: "Services", href: "/services" },
  { label: "How it works", href: "/#how-it-works" },
  { label: "Team", href: "/#team" },
  { label: "Book an appointment", href: "/book" },
] as const;

export function SiteFooter() {
  return (
    <footer
      id="contact"
      className="scroll-mt-20 border-t border-line-subtle bg-surface"
    >
      <div className="container-page py-12 md:py-16">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-4">
            <Link
              href="/"
              aria-label="Bookora Studio home"
              className="inline-flex rounded-control"
            >
              <Wordmark />
            </Link>
            <p className="support-text max-w-xs">
              Smart scheduling for hair, nails, skin, massage, and wellness
              appointments.
            </p>
          </div>

          <div>
            <h2 className="text-sm font-semibold text-ink">Explore</h2>
            <ul className="mt-4 space-y-2.5 text-sm">
              {EXPLORE_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-ink-secondary transition-colors hover:text-ink"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="text-sm font-semibold text-ink">Visit</h2>
            <div className="mt-4 space-y-3">
              <address className="support-text flex gap-2.5 not-italic">
                <MapPointIcon
                  size={18}
                  aria-hidden="true"
                  className="mt-0.5 shrink-0 text-brand-soft"
                />
                <span>{BUSINESS.address}</span>
              </address>
              <p className="support-text flex gap-2.5">
                <ClockCircleIcon
                  size={18}
                  aria-hidden="true"
                  className="mt-0.5 shrink-0 text-ink-muted"
                />
                <span>{BUSINESS.hours}</span>
              </p>
            </div>
          </div>

          <div>
            <h2 className="text-sm font-semibold text-ink">Contact</h2>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li>
                <a
                  href={PHONE_HREF}
                  className="inline-flex items-center gap-2 text-ink-secondary transition-colors hover:text-ink"
                >
                  <PhoneIcon size={16} aria-hidden="true" />
                  {BUSINESS.phone}
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${BUSINESS.email}`}
                  className="inline-flex items-center gap-2 text-ink-secondary transition-colors hover:text-ink"
                >
                  <LetterIcon size={16} aria-hidden="true" />
                  {BUSINESS.email}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-3 rounded-card border border-line-subtle bg-card/60 p-4 sm:flex-row sm:items-center">
          <InfoCircleIcon
            size={18}
            aria-hidden="true"
            className="shrink-0 text-brand-soft"
          />
          <p className="text-caption text-ink-secondary">
            Portfolio prototype. Bookings are stored only in this browser.
          </p>
        </div>

        <div className="mt-8 flex flex-col gap-3 border-t border-line-subtle pt-6 text-caption text-ink-muted sm:flex-row sm:items-center sm:justify-between">
          <p>
            © 2026 Bookora Studio · Crafted by {BUSINESS.brand}
          </p>
          <div className="flex flex-wrap items-center gap-4">
            <Link
              href="/admin"
              className="transition-colors hover:text-ink"
            >
              Admin demo
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
