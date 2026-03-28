import { Skeleton } from "@/components/ui/skeleton"

export default function LeaderboardLoading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-44" />
        <Skeleton className="h-10 w-64 rounded-full" />
      </div>

      {/* Podium skeleton */}
      <div className="flex items-end justify-center gap-4 pt-6 pb-4">
        <div className="flex flex-col items-center gap-2">
          <Skeleton className="h-12 w-12 rounded-full" />
          <Skeleton className="h-20 w-20 rounded-t-lg" />
        </div>
        <div className="flex flex-col items-center gap-2">
          <Skeleton className="h-14 w-14 rounded-full" />
          <Skeleton className="h-28 w-20 rounded-t-lg" />
        </div>
        <div className="flex flex-col items-center gap-2">
          <Skeleton className="h-11 w-11 rounded-full" />
          <Skeleton className="h-14 w-20 rounded-t-lg" />
        </div>
      </div>

      {/* Rows skeleton */}
      <div className="space-y-2">
        {Array.from({ length: 7 }).map((_, i) => (
          <Skeleton key={i} className="h-14 rounded-xl" />
        ))}
      </div>
    </div>
  )
}
