import { Skeleton } from "@/components/ui/skeleton"

export default function ProfileLoading() {
  return (
    <div className="space-y-6">
      {/* Profile header */}
      <div className="flex items-center gap-4">
        <Skeleton className="h-16 w-16 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-24" />
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="stat-card rounded-xl p-4 space-y-2">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-6 w-20" />
          </div>
        ))}
      </div>

      {/* Content tabs */}
      <Skeleton className="h-10 w-64" />
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-16 rounded-xl" />
        ))}
      </div>
    </div>
  )
}
