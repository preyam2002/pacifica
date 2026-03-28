"use client"

import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ProbabilityDisplay } from "@/components/probability-display"
import { MarketStatusBadge, SyncBadge } from "@/components/market-status-badge"
import { CATEGORIES } from "@/lib/constants"
import type { Market } from "@/types"
import { Clock, BarChart3, MessageSquare, Flame, TrendingUp, TrendingDown } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { cn } from "@/lib/utils"
import { MiniSparkline } from "@/components/mini-sparkline"
import { Countdown } from "@/components/countdown"
import { FollowButton } from "@/components/follow-button"

export const MarketCard = ({ market, probChange, sparkline }: { market: Market; probChange?: number; sparkline?: number[] }) => {
  const category = CATEGORIES.find((c) => c.value === market.category)
  const closingDate = new Date(market.resolution_date)
  const isSoon = closingDate.getTime() - Date.now() < 3 * 24 * 60 * 60 * 1000
  const isHot = market.trades_count >= 10 || market.total_volume >= 500

  return (
    <Link href={`/markets/${market.id}`}>
      <Card className="card-depth group relative cursor-pointer overflow-hidden border-border/40 bg-card/80 backdrop-blur-sm hover:border-primary/20">
        {/* Subtle top accent line */}
        <div
          className="absolute inset-x-0 top-0 h-px opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{
            background: `linear-gradient(90deg, transparent, oklch(0.78 0.155 185 / 0.5), transparent)`,
          }}
        />

        <CardContent className="space-y-3.5 p-4">
          <div className="flex items-start justify-between gap-2">
            <div className="flex flex-wrap items-center gap-1.5">
              {category && (
                <Badge variant="secondary" className="border-border/50 bg-secondary/80 text-xs font-medium">
                  {category.emoji} {category.label}
                </Badge>
              )}
              {isHot && (
                <Badge variant="secondary" className="border-no/20 bg-no/8 text-no text-xs font-medium">
                  <Flame className="mr-0.5 h-3 w-3" />
                  Hot
                </Badge>
              )}
              {market.is_synced && market.sync_source && (
                <SyncBadge source={market.sync_source} />
              )}
            </div>
            <div className="flex items-center gap-1">
              <FollowButton marketId={market.id} />
              <MarketStatusBadge status={market.status} />
            </div>
          </div>

          <h3 className="line-clamp-2 text-sm font-semibold leading-snug transition-colors group-hover:text-primary">
            {market.question}
          </h3>

          <div className="flex items-center gap-2">
            <ProbabilityDisplay
              probability={market.probability}
              size="sm"
              syncProbability={market.sync_probability}
              syncSource={market.sync_source}
            />
            {probChange != null && Math.abs(probChange) >= 0.01 && (
              <span
                className={cn(
                  "flex items-center gap-0.5 rounded-full px-1.5 py-0.5 font-mono text-[10px] font-semibold",
                  probChange > 0
                    ? "bg-yes/10 text-yes"
                    : "bg-no/10 text-no"
                )}
              >
                {probChange > 0 ? (
                  <TrendingUp className="h-3 w-3" />
                ) : (
                  <TrendingDown className="h-3 w-3" />
                )}
                {probChange > 0 ? "+" : ""}{(probChange * 100).toFixed(0)}%
              </span>
            )}
          </div>

          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <BarChart3 className="h-3.5 w-3.5" />
              <span className="font-mono">${market.total_volume.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
            </span>
            <span className="flex items-center gap-1">
              <MessageSquare className="h-3.5 w-3.5" />
              {market.comments_count}
            </span>
            {sparkline && sparkline.length >= 2 && (
              <MiniSparkline data={sparkline} width={56} height={18} className="opacity-60 group-hover:opacity-100 transition-opacity" />
            )}
            <span className="ml-auto flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {closingDate > new Date() ? (
                isSoon ? (
                  <Countdown targetDate={market.resolution_date} compact />
                ) : (
                  <span>{formatDistanceToNow(closingDate, { addSuffix: false })}</span>
                )
              ) : (
                "Ended"
              )}
            </span>
          </div>

          {/* Quick bet buttons — visible on hover */}
          {market.status === "open" && (
            <div className="flex gap-2 opacity-0 transition-opacity group-hover:opacity-100">
              <Link
                href={`/markets/${market.id}?side=yes`}
                onClick={(e) => e.stopPropagation()}
                className="flex-1 rounded-lg border border-yes/30 bg-yes/5 py-1.5 text-center font-mono text-xs font-semibold text-yes transition-colors hover:bg-yes/15"
              >
                Yes {Math.round(market.probability * 100)}¢
              </Link>
              <Link
                href={`/markets/${market.id}?side=no`}
                onClick={(e) => e.stopPropagation()}
                className="flex-1 rounded-lg border border-no/30 bg-no/5 py-1.5 text-center font-mono text-xs font-semibold text-no transition-colors hover:bg-no/15"
              >
                No {Math.round((1 - market.probability) * 100)}¢
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  )
}
