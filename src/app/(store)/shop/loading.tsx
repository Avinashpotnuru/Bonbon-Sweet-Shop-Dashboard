import { Skeleton } from "@/components/ui/skeleton";

/** Loading skeleton for /shop — mirrors the premium header + filter bar + grid. */
export default function ShopLoading() {
  return (
    <div className="relative">
      {/* Header skeleton */}
      <section className="relative overflow-hidden border-b bg-gradient-to-br from-[oklch(0.94_0.03_78)] via-[oklch(0.96_0.025_82)] to-[oklch(0.92_0.06_80)]">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
          <Skeleton className="h-4 w-40 rounded-full" />
          <Skeleton className="h-10 w-56 rounded-lg" />
          <Skeleton className="h-4 w-80 rounded-lg" />
          <Skeleton className="h-3 w-32 rounded-lg" />
        </div>
      </section>

      {/* Filter + grid skeleton */}
      <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        {/* Filter bar */}
        <div className="mb-8 flex items-center gap-3">
          <Skeleton className="h-10 flex-1 rounded-lg" />
          <Skeleton className="h-10 w-48 rounded-lg" />
        </div>

        {/* Category pills */}
        <div className="mb-8 flex gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-8 w-20 rounded-xl" />
          ))}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex flex-col gap-3 rounded-2xl border p-0">
              <Skeleton className="aspect-[4/5] w-full rounded-t-2xl" />
              <div className="flex flex-col gap-2 p-4">
                <Skeleton className="h-3 w-16 rounded" />
                <Skeleton className="h-5 w-3/4 rounded" />
                <Skeleton className="h-3 w-full rounded" />
                <Skeleton className="h-6 w-20 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
