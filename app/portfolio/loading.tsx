import { Skeleton } from "@/components/ui/skeleton"

export default function PortfolioLoading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-6 w-24 rounded-full" />
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="stat-card rounded-xl p-4 space-y-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-7 w-28" />
          </div>
        ))}
      </div>

      <Skeleton className="h-32 w-full rounded-xl" />

      <Skeleton className="h-10 w-80" />
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-20 rounded-xl" />
        ))}
      </div>
    </div>
  )
}
