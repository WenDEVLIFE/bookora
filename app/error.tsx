"use client";

import Link from "next/link";
import { DangerTriangleIcon, HomeIcon, RestartIcon } from "@/components/icons";
import { Wordmark } from "@/components/marketing/logo";
import { Button, buttonClasses } from "@/components/ui/button";

export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <div className="flex min-h-dvh flex-col bg-app">
      <header className="border-b border-line-subtle bg-app">
        <div className="container-page flex h-16 items-center">
          <Link
            href="/"
            aria-label="Bookora Studio home"
            className="inline-flex rounded-control"
          >
            <Wordmark priority />
          </Link>
        </div>
      </header>
      <main className="flex flex-1 items-center justify-center">
        <div className="container-page flex flex-col items-center py-16 text-center md:py-24">
          <span className="flex h-14 w-14 items-center justify-center rounded-panel border border-danger/30 bg-danger-bg text-danger">
            <DangerTriangleIcon size={26} aria-hidden="true" />
          </span>
          <p className="label-text mt-6 uppercase tracking-[0.18em] text-brand-soft">
            Something went wrong
          </p>
          <h1 className="heading-section mt-2 text-ink">
            This page could not be loaded
          </h1>
          <p className="body-text mt-3 max-w-lg text-ink-secondary">
            An unexpected error interrupted this view. Try again, or return
            home. Any demo data already saved in this browser is unchanged.
          </p>
          <div className="mt-8 flex w-full flex-col items-stretch justify-center gap-3 sm:w-auto sm:flex-row sm:items-center">
            <Button
              size="md"
              onClick={reset}
              leftIcon={<RestartIcon size={17} aria-hidden="true" />}
              className="min-h-11"
            >
              Try again
            </Button>
            <Link
              href="/"
              className={buttonClasses({
                variant: "secondary",
                size: "md",
                className: "min-h-11",
              })}
            >
              <HomeIcon size={17} aria-hidden="true" />
              Back to home
            </Link>
          </div>
        </div>
      </main>
      <footer className="border-t border-line-subtle bg-surface">
        <div className="container-page py-6">
          <p className="text-caption text-ink-muted">
            Bookora Studio 路 Portfolio prototype by WenDEV
          </p>
        </div>
      </footer>
    </div>
  );
}

