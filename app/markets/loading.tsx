import { Skeleton } from "@/components/ui/skeleton"

export default function MarketsLoading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-10 w-72" />
      </div>
      <Skeleton className="h-10 w-64" />
      <Skeleton className="h-10 w-full" />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 9 }).map((_, i) => (
          <Skeleton key={i} className="h-48 rounded-lg" />
        ))}
      </div>
    </div>
  )
}
