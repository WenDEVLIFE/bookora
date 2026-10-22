"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { CloseIcon, HamburgerMenuIcon } from "@/components/icons";
import { Wordmark } from "@/components/marketing/logo";
import { buttonClasses } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { label: "Services", href: "/services" },
  { label: "How it works", href: "/#how-it-works" },
  { label: "Team", href: "/#team" },
  { label: "Contact", href: "/#contact" },
] as const;

const MOBILE_MENU_ID = "site-mobile-menu";

export function SiteHeaderFallback() {
  return (
    <header className="border-b border-line-subtle bg-app">
      <div className="container-page flex h-16 items-center justify-between gap-4">
        <Link href="/" aria-label="Bookora Studio home">
          <Wordmark priority />
        </Link>
        <Link href="/book" className={buttonClasses({ size: "sm" })}>
          Book an appointment
        </Link>
      </div>
    </header>
  );
}

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const servicesActive = pathname === "/services";

  useEffect(() => {
    if (!open) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
        menuButtonRef.current?.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  return (
    <header className="sticky top-0 z-40 border-b border-line-subtle bg-app/80 backdrop-blur-md">
      <div className="container-page flex h-16 items-center justify-between gap-4">
        <Link
          href="/"
          aria-label="Bookora Studio home"
          className="inline-flex rounded-control"
        >
          <Wordmark priority />
        </Link>

        <nav
          aria-label="Primary"
          className="hidden items-center gap-1 lg:flex"
        >
          {NAV_LINKS.map((link) => {
            const isActive = link.href === "/services" && servicesActive;

            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "relative inline-flex items-center rounded-control px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "text-brand-soft"
                    : "text-ink-secondary hover:text-ink",
                )}
              >
                {link.label}
                {isActive ? (
                  <span
                    aria-hidden="true"
                    className="absolute inset-x-3 -bottom-1 h-px bg-brand-soft"
                  />
                ) : null}
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-4 lg:flex">
          <Link
            href="/admin"
            className="text-sm font-medium text-ink-muted transition-colors hover:text-ink"
          >
            Admin demo
          </Link>
          <Link href="/book" className={buttonClasses({ size: "md" })}>
            Book an appointment
          </Link>
        </div>

        <button
          ref={menuButtonRef}
          type="button"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          aria-controls={MOBILE_MENU_ID}
          onClick={() => setOpen((current) => !current)}
          className={buttonClasses({
            variant: "ghost",
            size: "icon",
            className: "lg:hidden",
          })}
        >
          {open ? (
            <CloseIcon size={22} aria-hidden="true" />
          ) : (
            <HamburgerMenuIcon size={22} aria-hidden="true" />
          )}
        </button>
      </div>

      {open ? (
        <div
          id={MOBILE_MENU_ID}
          className="border-t border-line-subtle bg-app/95 lg:hidden"
        >
          <nav
            aria-label="Mobile"
            className="container-page flex flex-col gap-1 py-4"
          >
            {NAV_LINKS.map((link) => {
              const isActive = link.href === "/services" && servicesActive;

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "rounded-control px-3 py-2.5 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-brand-tint text-brand-soft"
                      : "text-ink-secondary hover:bg-elevated hover:text-ink",
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
            <Link
              href="/admin"
              onClick={() => setOpen(false)}
              className="rounded-control px-3 py-2.5 text-sm font-medium text-ink-muted transition-colors hover:bg-elevated hover:text-ink"
            >
              Admin demo
            </Link>
            <Link
              href="/book"
              onClick={() => setOpen(false)}
              className={buttonClasses({ size: "lg", className: "mt-3 w-full" })}
            >
              Book an appointment
            </Link>
          </nav>
        </div>
      ) : null}
    </header>
  );
}

