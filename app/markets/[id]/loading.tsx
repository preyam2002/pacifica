import { Skeleton } from "@/components/ui/skeleton"

export default function MarketDetailLoading() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-32" />
      <div className="grid gap-6 lg:grid-cols-[1fr_350px]">
        <div className="space-y-4">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-16 w-48" />
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
        <div className="space-y-4">
          <Skeleton className="h-80 w-full" />
        </div>
      </div>
    </div>
  )
}
