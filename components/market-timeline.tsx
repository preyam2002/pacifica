"use client"

import type { Market, Trade } from "@/types"
import { formatDistanceToNow, format } from "date-fns"
import {
  Clock,
  TrendingUp,
  BarChart3,
  Gavel,
  Plus,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface TimelineEvent {
  id: string
  icon: React.ReactNode
  label: string
  time: string
  color: string
}

export const MarketTimeline = ({
  market,
  trades,
}: {
  market: Market
  trades: Trade[]
}) => {
  const events: TimelineEvent[] = []

  // Created
  events.push({
    id: "created",
    icon: <Plus className="h-3.5 w-3.5" />,
    label: `Market created${market.creator ? ` by @${market.creator.username}` : ""}`,
    time: market.created_at,
    color: "text-primary",
  })

  // First trade
  if (trades.length > 0) {
    const first = trades[trades.length - 1]
    events.push({
      id: "first_trade",
      icon: <TrendingUp className="h-3.5 w-3.5" />,
      label: "First trade",
      time: first.created_at,
      color: "text-yes",
    })
  }

  // Volume milestones
  if (market.total_volume >= 100) {
    events.push({
      id: "vol_100",
      icon: <BarChart3 className="h-3.5 w-3.5" />,
      label: "$100 volume milestone",
      time: market.created_at, // approximate
      color: "text-chart-4",
    })
  }
  if (market.total_volume >= 1000) {
    events.push({
      id: "vol_1k",
      icon: <BarChart3 className="h-3.5 w-3.5" />,
      label: "$1,000 volume milestone",
      time: market.created_at,
      color: "text-chart-4",
    })
  }

  // Closing soon / closed
  const closingDate = new Date(market.resolution_date)
  if (closingDate <= new Date()) {
    events.push({
      id: "closed",
      icon: <Clock className="h-3.5 w-3.5" />,
      label: "Market closed for trading",
      time: market.resolution_date,
      color: "text-muted-foreground",
    })
  }

  // Resolved
  if (market.status === "resolved" && market.outcome) {
    events.push({
      id: "resolved",
      icon: <Gavel className="h-3.5 w-3.5" />,
      label: `Resolved ${market.outcome.toUpperCase()}`,
      time: market.resolution_date,
      color: market.outcome === "yes" ? "text-yes" : "text-no",
    })
  }

  // Sort chronologically
  events.sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime())

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold">Timeline</h3>
      <div className="space-y-0">
        {events.map((event, i) => (
          <div key={event.id} className="flex items-start gap-3">
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  "flex h-7 w-7 items-center justify-center rounded-full border border-border bg-background",
                  event.color
                )}
              >
                {event.icon}
              </div>
              {i < events.length - 1 && (
                <div className="h-6 w-px bg-border" />
              )}
            </div>
            <div className="flex-1 pb-4">
              <p className="text-sm">{event.label}</p>
              <p className="text-xs text-muted-foreground">
                {format(new Date(event.time), "MMM d, yyyy")} ({formatDistanceToNow(new Date(event.time), { addSuffix: true })})
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
