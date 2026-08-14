import { Skeleton } from "@/components/ui/skeleton";

export function KpiCardsSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="grid gap-6 md:grid-cols-3">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="rounded-xl border border-border bg-card p-6">
          <div className="flex items-start justify-between gap-3">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-9 w-9 rounded-xl" />
          </div>
          <Skeleton className="mt-5 h-7 w-28" />
          <Skeleton className="mt-3 h-3 w-24" />
        </div>
      ))}
    </div>
  );
}

export function ChartSkeleton() {
  return (
    <div className="rounded-xl border border-border bg-card p-6 shadow-sm sm:p-8">
      <Skeleton className="h-5 w-40" />
      <Skeleton className="mt-3 h-3 w-64 max-w-full" />
      <div className="mt-8 flex h-[240px] items-end gap-2 sm:gap-3">
        {[35, 45, 55, 50, 65, 72, 60, 80, 88, 95].map((height, index) => (
          <Skeleton key={index} className="w-full rounded-lg" style={{ height: `${height}%` }} />
        ))}
      </div>
    </div>
  );
}

export function ListSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <ul className="space-y-3">
      {Array.from({ length: rows }).map((_, index) => (
        <li
          key={index}
          className="flex flex-col gap-4 rounded-xl border border-border bg-card p-5 sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="min-w-0 flex-1 space-y-3">
            <Skeleton className="h-4 w-2/3 max-w-xs" />
            <Skeleton className="h-3 w-1/2 max-w-[16rem]" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-7 w-24 rounded-lg" />
            <Skeleton className="h-7 w-20 rounded-lg" />
          </div>
        </li>
      ))}
    </ul>
  );
}

export function CardsSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div className="space-y-5">
      {Array.from({ length: rows }).map((_, index) => (
        <div key={index} className="rounded-xl border border-border bg-card p-5 sm:p-6">
          <Skeleton className="h-5 w-1/2 max-w-sm" />
          <Skeleton className="mt-4 h-3 w-full" />
          <Skeleton className="mt-2 h-3 w-4/5" />
          <div className="mt-5 flex flex-wrap gap-2">
            <Skeleton className="h-10 w-40 rounded-xl" />
            <Skeleton className="h-10 w-32 rounded-xl" />
          </div>
        </div>
      ))}
    </div>
  );
}
