import { Badge } from "@/components/ui/badge"
import type { MarketStatus, SyncSource } from "@/types"
import { cn } from "@/lib/utils"

export const MarketStatusBadge = ({ status }: { status: MarketStatus }) => (
  <Badge
    variant="outline"
    className={cn(
      "text-xs",
      status === "open" && "border-yes/30 text-yes",
      status === "closed" && "border-muted-foreground/30 text-muted-foreground",
      status === "resolved" && "border-primary/30 text-primary"
    )}
  >
    {status.charAt(0).toUpperCase() + status.slice(1)}
  </Badge>
)

export const SyncBadge = ({ source }: { source: SyncSource }) => (
  <Badge variant="secondary" className="text-xs">
    {source === "polymarket" ? "Polymarket" : "Kalshi"}
  </Badge>
)
