import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import {
  CalendarSearchIcon,
  HomeIcon,
  ScissorsIcon,
} from "@/components/icons";
import { SiteFooter } from "@/components/marketing/site-footer";
import {
  SiteHeader,
  SiteHeaderFallback,
} from "@/components/marketing/site-header";
import { buttonClasses } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Page not found",
  description:
    "The page you are looking for does not exist. Return to Bookora Studio to browse services or book an appointment.",
};

export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col bg-app">
      <a
        href="#main-content"
        className="fixed left-4 top-4 z-50 -translate-y-24 rounded-control bg-brand-hover px-4 py-2 text-sm font-semibold text-white shadow-lg transition-transform focus:translate-y-0"
      >
        Skip to content
      </a>
      <Suspense fallback={<SiteHeaderFallback />}>
        <SiteHeader />
      </Suspense>
      <main
        id="main-content"
        tabIndex={-1}
        className="flex flex-1 items-center justify-center"
      >
        <div className="container-page flex flex-col items-center py-16 text-center md:py-24">
          <span className="flex h-14 w-14 items-center justify-center rounded-panel border border-brand/20 bg-brand-tint text-brand-soft">
            <CalendarSearchIcon size={26} aria-hidden="true" />
          </span>
          <p className="label-text mt-6 uppercase tracking-[0.18em] text-brand-soft">
            Error 404
          </p>
          <h1 className="heading-section mt-2 text-ink">Page not found</h1>
          <p className="body-text mt-3 max-w-lg text-ink-secondary">
            The page you are looking for does not exist, or it may have moved.
            Continue with one of the links below.
          </p>
          <div className="mt-8 flex w-full flex-col items-stretch justify-center gap-3 sm:w-auto sm:flex-row sm:items-center">
            <Link
              href="/"
              className={buttonClasses({
                size: "md",
                className: "min-h-11",
              })}
            >
              <HomeIcon size={17} aria-hidden="true" />
              Back to home
            </Link>
            <Link
              href="/services"
              className={buttonClasses({
                variant: "secondary",
                size: "md",
                className: "min-h-11",
              })}
            >
              <ScissorsIcon size={17} aria-hidden="true" />
              Browse services
            </Link>
            <Link
              href="/book"
              className={buttonClasses({
                variant: "outline",
                size: "md",
                className: "min-h-11",
              })}
            >
              Book an appointment
            </Link>
            <Link
              href="/admin"
              className={buttonClasses({
                variant: "ghost",
                size: "md",
                className: "min-h-11 text-ink-secondary",
              })}
            >
              Admin demo
            </Link>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
