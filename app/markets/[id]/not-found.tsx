import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Search } from "lucide-react"

export default function MarketNotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
        <Search className="h-8 w-8 text-muted-foreground" />
      </div>
      <h1 className="text-2xl font-bold">Market not found</h1>
      <p className="max-w-sm text-muted-foreground">
        This market may have been removed or the link is invalid.
      </p>
      <Link href="/markets">
        <Button>Browse Markets</Button>
      </Link>
    </div>
  )
}
