"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  CalendarIcon,
  ChartIcon,
  CheckCircleIcon,
  CloseIcon,
  HamburgerMenuIcon,
  HomeIcon,
  InfoCircleIcon,
  RefreshIcon,
  ScissorsIcon,
  UsersGroupRoundedIcon,
} from "@/components/icons";
import { Wordmark } from "@/components/marketing/logo";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { useDemoStore } from "@/lib/demo-store";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { label: "Overview", href: "/admin", icon: ChartIcon },
  { label: "Appointments", href: "/admin/appointments", icon: CalendarIcon },
  { label: "Services", href: "/admin/services", icon: ScissorsIcon },
  { label: "Staff", href: "/admin/staff", icon: UsersGroupRoundedIcon },
] as const;

const DRAWER_ID = "admin-mobile-navigation";

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

function isNavActive(href: string, pathname: string): boolean {
  if (href === "/admin") {
    return pathname === "/admin";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <ul className="space-y-1">
      {NAV_ITEMS.map((item) => {
        const active = isNavActive(item.href, pathname);
        const Icon = item.icon;

        return (
          <li key={item.href}>
            <Link
              href={item.href}
              aria-current={active ? "page" : undefined}
              onClick={onNavigate}
              className={cn(
                "relative flex items-center gap-3 rounded-control px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-brand-tint text-brand-soft"
                  : "text-ink-secondary hover:bg-elevated hover:text-ink",
              )}
            >
              {active ? (
                <span
                  aria-hidden="true"
                  className="absolute inset-y-2 left-0 w-0.5 rounded-full bg-brand-soft"
                />
              ) : null}
              <Icon size={19} aria-hidden="true" />
              {item.label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

export function AdminShell({ children }: { children: ReactNode }) {
  const { resetDemoData } = useDemoStore();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);
  const [resetError, setResetError] = useState<string | null>(null);
  const [resetDone, setResetDone] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!drawerOpen) {
      return;
    }

    const previouslyFocused =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    const previousOverflow = document.body.style.overflow;
    const panel = drawerRef.current;
    const initialFocus = panel?.querySelector<HTMLElement>(
      FOCUSABLE_SELECTOR,
    );

    document.body.style.overflow = "hidden";
    initialFocus?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        setDrawerOpen(false);
        return;
      }

      if (event.key !== "Tab") {
        return;
      }

      const currentPanel = drawerRef.current;

      if (!currentPanel) {
        return;
      }

      const focusable = Array.from(
        currentPanel.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
      ).filter((element) => element.getClientRects().length > 0);

      if (focusable.length === 0) {
        event.preventDefault();
        currentPanel.focus();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      } else if (!currentPanel.contains(document.activeElement)) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
      previouslyFocused?.focus();
    };
  }, [drawerOpen]);

  useEffect(() => {
    if (!resetDone) {
      return;
    }

    const timer = window.setTimeout(() => {
      setResetDone(false);
    }, 4000);

    return () => {
      window.clearTimeout(timer);
    };
  }, [resetDone]);

  function handleReset() {
    const result = resetDemoData();

    if (result.ok) {
      setResetOpen(false);
      setResetError(null);
      setResetDone(true);
      return;
    }

    setResetError(result.error);
  }

  return (
    <div className="min-h-dvh bg-app">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 flex-col border-r border-line bg-surface lg:flex">
        <div className="flex h-16 items-center border-b border-line-subtle px-5">
          <Link
            href="/"
            aria-label="Bookora Studio home"
            className="rounded-control"
          >
            <Wordmark priority />
          </Link>
        </div>
        <nav aria-label="Admin" className="flex-1 overflow-y-auto p-3">
          <p className="px-3 pb-2 pt-1 text-[0.625rem] font-semibold uppercase tracking-[0.18em] text-ink-muted">
            Workspace
          </p>
          <NavLinks />
        </nav>
        <div className="space-y-1 border-t border-line-subtle p-3">
          <Link
            href="/"
            className="flex items-center gap-3 rounded-control px-3 py-2.5 text-sm font-medium text-ink-secondary transition-colors hover:bg-elevated hover:text-ink"
          >
            <HomeIcon size={19} aria-hidden="true" />
            View site
          </Link>
          <p className="px-3 pt-2 text-caption leading-relaxed text-ink-muted">
            Demo workspace
            <br />
            No authentication
          </p>
        </div>
      </aside>

      <div className="lg:pl-60">
        <header className="sticky top-0 z-40 border-b border-line-subtle bg-app/90 backdrop-blur-md">
          <div className="flex h-16 items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
            <div className="flex min-w-0 items-center gap-2 lg:hidden">
              <Link
                href="/"
                aria-label="Bookora Studio home"
                className="rounded-control"
              >
                <Wordmark compact priority />
              </Link>
            </div>
            <div className="hidden min-w-0 lg:block">
              <p className="text-caption uppercase tracking-[0.18em] text-ink-muted">
                Studio admin
              </p>
              <p className="truncate text-sm font-medium text-ink">
                Bookora Studio
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Link
                href="/"
                className="hidden text-sm font-medium text-ink-muted transition-colors hover:text-ink sm:block lg:hidden"
              >
                View site
              </Link>
              <Button
                ref={menuButtonRef}
                variant="ghost"
                size="icon"
                className="lg:hidden"
                aria-label={drawerOpen ? "Close navigation" : "Open navigation"}
                aria-expanded={drawerOpen}
                aria-controls={DRAWER_ID}
                onClick={() => setDrawerOpen(true)}
              >
                <HamburgerMenuIcon size={22} aria-hidden="true" />
              </Button>
            </div>
          </div>
        </header>

        <div className="border-b border-brand/20 bg-brand-tint/35">
          <div className="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
            <p className="flex items-start gap-2 text-caption text-ink-secondary">
              <InfoCircleIcon
                size={17}
                aria-hidden="true"
                className="mt-0.5 shrink-0 text-brand-soft"
              />
              <span>
                <span className="font-semibold text-ink">Demo mode</span> 鈥?                changes are saved in this browser. No authentication.
              </span>
            </p>
            <div className="flex flex-wrap items-center gap-3">
              {resetDone ? (
                <p
                  role="status"
                  className="inline-flex items-center gap-1.5 text-caption font-medium text-success"
                >
                  <CheckCircleIcon size={15} aria-hidden="true" />
                  Demo data restored.
                </p>
              ) : null}
              <Button
                variant="outline"
                size="sm"
                leftIcon={<RefreshIcon size={16} aria-hidden="true" />}
                onClick={() => {
                  setResetError(null);
                  setResetOpen(true);
                }}
              >
                Reset demo data
              </Button>
            </div>
          </div>
        </div>

        <main id="admin-main" tabIndex={-1} className="flex-1">
          <div className="container-dash py-6 lg:py-8">{children}</div>
        </main>
      </div>

      {drawerOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            tabIndex={-1}
            aria-label="Close navigation"
            onClick={() => setDrawerOpen(false)}
            className="absolute inset-0 h-full w-full cursor-default bg-black/70 backdrop-blur-sm"
          />
          <div
            ref={drawerRef}
            id={DRAWER_ID}
            role="dialog"
            aria-modal="true"
            aria-label="Admin navigation"
            tabIndex={-1}
            className="absolute inset-y-0 left-0 flex w-[min(88vw,20rem)] flex-col border-r border-line bg-surface shadow-2xl"
          >
            <div className="flex h-16 items-center justify-between gap-3 border-b border-line-subtle px-4">
              <Link
                href="/"
                aria-label="Bookora Studio home"
                className="rounded-control"
                onClick={() => setDrawerOpen(false)}
              >
                <Wordmark priority />
              </Link>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Close navigation"
                onClick={() => setDrawerOpen(false)}
              >
                <CloseIcon size={20} aria-hidden="true" />
              </Button>
            </div>
            <nav aria-label="Admin" className="flex-1 overflow-y-auto p-3">
              <p className="px-3 pb-2 pt-1 text-[0.625rem] font-semibold uppercase tracking-[0.18em] text-ink-muted">
                Workspace
              </p>
              <NavLinks onNavigate={() => setDrawerOpen(false)} />
            </nav>
            <div className="space-y-1 border-t border-line-subtle p-3">
              <Link
                href="/"
                onClick={() => setDrawerOpen(false)}
                className="flex items-center gap-3 rounded-control px-3 py-2.5 text-sm font-medium text-ink-secondary transition-colors hover:bg-elevated hover:text-ink"
              >
                <HomeIcon size={19} aria-hidden="true" />
                View site
              </Link>
              <p className="px-3 pt-2 text-caption leading-relaxed text-ink-muted">
                Demo workspace
                <br />
                No authentication
              </p>
            </div>
          </div>
        </div>
      ) : null}

      <Modal
        open={resetOpen}
        onClose={() => {
          setResetOpen(false);
          setResetError(null);
        }}
        title="Reset demo data?"
        description="Restore the original sample services, staff, and appointments."
        size="sm"
        footer={
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button
              variant="secondary"
              onClick={() => {
                setResetOpen(false);
                setResetError(null);
              }}
            >
              Keep demo data
            </Button>
            <Button
              variant="destructive"
              leftIcon={<RefreshIcon size={16} aria-hidden="true" />}
              onClick={handleReset}
            >
              Reset demo data
            </Button>
          </div>
        }
      >
        <p className="support-text">
          Any bookings or edits saved in this browser will be discarded. This
          action cannot be undone.
        </p>
        {resetError ? (
          <Alert variant="danger" className="mt-4">
            {resetError}
          </Alert>
        ) : null}
      </Modal>
    </div>
  );
}

