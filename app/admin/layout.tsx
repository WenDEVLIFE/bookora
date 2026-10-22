import type { Metadata } from "next";
import { Suspense, type ReactNode } from "react";
import { AdminShell } from "@/components/admin/admin-shell";

export const metadata: Metadata = {
  title: {
    default: "Admin · Bookora",
    template: "%s · Admin · Bookora",
  },
  description:
    "Demo admin workspace for Bookora Studio. Review appointments, services, and staff. No authentication.",
};

function AdminShellFallback() {
  return (
    <div className="min-h-dvh bg-app" aria-hidden="true">
      <aside className="fixed inset-y-0 left-0 hidden w-60 flex-col border-r border-line bg-surface lg:flex">
        <div className="flex h-16 items-center border-b border-line-subtle px-5">
          <div className="h-8 w-32 animate-pulse rounded-control bg-elevated" />
        </div>
        <div className="flex-1 space-y-2 p-3">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="h-10 animate-pulse rounded-control bg-elevated"
            />
          ))}
        </div>
        <div className="space-y-2 border-t border-line-subtle p-3">
          <div className="h-10 animate-pulse rounded-control bg-elevated" />
          <div className="h-8 animate-pulse rounded-control bg-elevated" />
        </div>
      </aside>
      <div className="lg:pl-60">
        <div className="flex h-16 items-center justify-between border-b border-line-subtle bg-app px-4 sm:px-6 lg:px-8">
          <div className="h-8 w-28 animate-pulse rounded-control bg-elevated lg:hidden" />
          <div className="hidden h-8 w-40 animate-pulse rounded-control bg-elevated lg:block" />
          <div className="h-10 w-10 animate-pulse rounded-control bg-elevated lg:hidden" />
        </div>
        <div className="border-b border-brand/20 bg-brand-tint/35 px-4 py-3 sm:px-6 lg:px-8">
          <div className="h-4 w-full max-w-xl animate-pulse rounded-control bg-elevated" />
        </div>
        <main id="admin-main" className="container-dash py-6 lg:py-8">
          <div className="h-8 w-56 animate-pulse rounded-control bg-elevated" />
          <div className="mt-3 h-4 w-80 max-w-full animate-pulse rounded-control bg-elevated" />
          <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
            {Array.from({ length: 5 }).map((_, index) => (
              <div
                key={index}
                className="h-32 animate-pulse rounded-card bg-elevated"
              />
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <a
        href="#admin-main"
        className="fixed left-4 top-4 z-[60] -translate-y-24 rounded-control bg-brand-hover px-4 py-2 text-sm font-semibold text-white shadow-lg transition-transform focus:translate-y-0"
      >
        Skip to content
      </a>
      <Suspense fallback={<AdminShellFallback />}>
        <AdminShell>{children}</AdminShell>
      </Suspense>
    </>
  );
}
