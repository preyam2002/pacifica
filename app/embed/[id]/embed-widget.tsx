"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Waves } from "lucide-react"
import { cn } from "@/lib/utils"

interface EmbedMarket {
  id: string
  question: string
  probability: number
  status: string
  outcome: string | null
  total_volume: number
  trades_count: number
  sync_source: string | null
  sync_probability: number | null
}

export const EmbedWidget = ({ market: initialMarket }: { market: EmbedMarket }) => {
  const [market, setMarket] = useState(initialMarket)

  // Auto-refresh every 30s
  useEffect(() => {
    const interval = setInterval(async () => {
      const supabase = createClient()
      const { data } = await supabase
        .from("markets")
        .select("id, question, probability, status, outcome, total_volume, trades_count, sync_source, sync_probability")
        .eq("id", market.id)
        .single()
      if (data) setMarket(data)
    }, 30_000)
    return () => clearInterval(interval)
  }, [market.id])
  const pct = Math.round(market.probability * 100)
  const isYes = market.probability >= 0.5
  const isResolved = market.status === "resolved"

  const origin = typeof window !== "undefined" ? window.location.origin : ""
  const marketUrl = `${origin}/markets/${market.id}`

  return (
    <div className="flex min-h-screen items-center justify-center bg-transparent p-3">
      <a
        href={marketUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="block w-full max-w-md overflow-hidden rounded-2xl border border-border/40 bg-card/95 backdrop-blur-sm transition-all hover:border-primary/30"
        style={{ fontFamily: "'DM Sans', system-ui, sans-serif" }}
      >
        {/* Header */}
        <div className="flex items-center gap-2 border-b border-border/30 px-4 py-2.5">
          <Waves className="h-4 w-4 text-primary" />
          <span className="text-xs font-semibold text-primary">Pacifica</span>
          {market.sync_source && (
            <span className="ml-auto rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
              {market.sync_source === "polymarket" ? "Polymarket" : "Kalshi"}
            </span>
          )}
        </div>

        {/* Body */}
        <div className="space-y-3 p-4">
          <p className="text-sm font-semibold leading-snug">{market.question}</p>

          {/* Probability */}
          <div className="flex items-end gap-3">
            <span
              className={cn(
                "font-mono text-3xl font-bold",
                isResolved
                  ? market.outcome === "yes" ? "text-yes" : "text-no"
                  : isYes ? "text-yes" : "text-no"
              )}
            >
              {isResolved ? market.outcome?.toUpperCase() : `${pct}%`}
            </span>
            {!isResolved && (
              <span className="mb-1 text-xs text-muted-foreground">chance of Yes</span>
            )}
          </div>

          {/* Bar */}
          {!isResolved && (
            <div className="h-2 w-full overflow-hidden rounded-full bg-muted/60">
              <div
                className={cn(
                  "h-full rounded-full transition-all",
                  isYes ? "prob-bar-yes" : "prob-bar-no"
                )}
                style={{ width: `${Math.max(pct, 2)}%` }}
              />
            </div>
          )}

          {/* Stats */}
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span className="font-mono">
              ${market.total_volume.toLocaleString(undefined, { maximumFractionDigits: 0 })} vol
            </span>
            <span>{market.trades_count} trades</span>
            {market.sync_probability != null && (
              <span className="ml-auto font-mono">
                {Math.round(market.sync_probability * 100)}% real odds
              </span>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-border/30 px-4 py-2 text-center text-[10px] text-muted-foreground">
          Trade on Pacifica — free play money
        </div>
      </a>
    </div>
  )
}
