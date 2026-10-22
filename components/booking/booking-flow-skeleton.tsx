import { Skeleton } from "@/components/ui/skeleton";

export function BookingFlowSkeleton() {
  return (
    <div className="mt-8 space-y-6" aria-hidden="true">
      <div className="rounded-card border border-line bg-card p-4 sm:p-5">
        <div className="flex items-center justify-between gap-3">
          <Skeleton className="h-3 w-24" rounded="full" />
          <Skeleton className="h-3 w-16" rounded="full" />
        </div>
        <div className="mt-4 flex items-center gap-2">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="flex flex-1 items-center gap-2">
              <Skeleton className="h-7 w-7 shrink-0" rounded="full" />
              {index < 5 ? (
                <Skeleton className="h-px flex-1" rounded="sm" />
              ) : null}
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-5">
          <div className="space-y-2">
            <Skeleton className="h-3 w-20" rounded="full" />
            <Skeleton className="h-8 w-64 max-w-full" rounded="sm" />
            <Skeleton className="h-4 w-80 max-w-full" rounded="sm" />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="rounded-card border border-line bg-card p-5"
              >
                <div className="flex items-center gap-3">
                  <Skeleton className="h-11 w-11" rounded="sm" />
                  <div className="min-w-0 flex-1 space-y-2">
                    <Skeleton className="h-4 w-2/3" rounded="sm" />
                    <Skeleton className="h-3 w-1/3" rounded="sm" />
                  </div>
                </div>
                <Skeleton className="mt-4 h-3 w-full" rounded="sm" />
                <Skeleton className="mt-2 h-3 w-4/5" rounded="sm" />
                <div className="mt-4 flex items-center justify-between">
                  <Skeleton className="h-5 w-16" rounded="sm" />
                  <Skeleton className="h-3 w-14" rounded="sm" />
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between gap-3 pt-2">
            <Skeleton className="h-10 w-24" rounded="sm" />
            <Skeleton className="h-12 w-36" rounded="sm" />
          </div>
        </div>

        <aside className="hidden lg:block">
          <div className="rounded-card border border-line bg-card p-5">
            <Skeleton className="h-3 w-28" rounded="full" />
            <Skeleton className="mt-3 h-5 w-40" rounded="sm" />
            <div className="mt-5 space-y-3">
              <Skeleton className="h-14 w-full" rounded="sm" />
              {Array.from({ length: 4 }).map((_, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between gap-3"
                >
                  <Skeleton className="h-3 w-20" rounded="sm" />
                  <Skeleton className="h-3 w-24" rounded="sm" />
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

export function BookingResultSkeleton() {
  return (
    <div
      className="mx-auto max-w-3xl space-y-6"
      aria-hidden="true"
    >
      <div className="rounded-card border border-line bg-card p-6 sm:p-8">
        <Skeleton className="h-14 w-14" rounded="full" />
        <Skeleton className="mt-5 h-8 w-48" rounded="sm" />
        <Skeleton className="mt-3 h-4 w-72 max-w-full" rounded="sm" />
        <div className="mt-6 rounded-input border border-line bg-surface/60 p-4">
          <Skeleton className="h-3 w-28" rounded="full" />
          <Skeleton className="mt-3 h-8 w-44" rounded="sm" />
        </div>
      </div>
      <div className="rounded-card border border-line bg-card p-6">
        <Skeleton className="h-5 w-36" rounded="sm" />
        <div className="mt-5 space-y-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="flex items-center justify-between gap-4"
            >
              <Skeleton className="h-3 w-24" rounded="sm" />
              <Skeleton className="h-3 w-40" rounded="sm" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
