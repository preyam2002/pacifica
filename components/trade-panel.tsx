"use client"

import { useState, useMemo, useEffect, useCallback } from "react"
import { useAuth } from "@/components/providers"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { tradeCost, priceAfterTrade, estimateShares, price as lmsrPrice } from "@/lib/amm"
import type { Market, TradeSide, TradeAction, Position } from "@/types"
import { TradeToast } from "@/components/trade-toast"
import { Loader2, Zap } from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"

interface TradePanelProps {
  market: Market
  position: Position | null
  onTradeComplete: () => void
  initialSide?: TradeSide
}

export const TradePanel = ({ market, position, onTradeComplete, initialSide }: TradePanelProps) => {
  const { user, profile, refreshProfile } = useAuth()
  const [side, setSide] = useState<TradeSide>(initialSide ?? "yes")
  const [action, setAction] = useState<TradeAction>("buy")
  const [amount, setAmount] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [toast, setToast] = useState<{ side: TradeSide; action: TradeAction; shares: number; cost: number } | null>(null)

  const handleKeyboard = useCallback(
    (e: KeyboardEvent) => {
      if (!user || market.status !== "open") return
      const target = e.target as HTMLElement
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") return
      switch (e.key.toLowerCase()) {
        case "y": setSide("yes"); break
        case "n": setSide("no"); break
        case "b": setAction("buy"); break
        case "s": setAction("sell"); break
      }
    },
    [user, market.status]
  )

  useEffect(() => {
    window.addEventListener("keydown", handleKeyboard)
    return () => window.removeEventListener("keydown", handleKeyboard)
  }, [handleKeyboard])

  const shares = parseFloat(amount) || 0
  const currentPrice = lmsrPrice(market.yes_shares, market.no_shares, market.liquidity_param)

  const preview = useMemo(() => {
    if (shares <= 0) return null
    const cost = tradeCost(
      market.yes_shares, market.no_shares, market.liquidity_param,
      side, action, shares
    )
    const after = priceAfterTrade(
      market.yes_shares, market.no_shares, market.liquidity_param,
      side, action, shares
    )
    return {
      cost,
      pricePerShare: Math.abs(cost) / shares,
      newProbability: after,
      impact: Math.abs(after[side] - currentPrice[side]),
    }
  }, [shares, side, action, market, currentPrice])

  const handleTrade = async () => {
    if (!user || shares <= 0) return
    setLoading(true)
    setError(null)
    const supabase = createClient()
    const { data, error: err } = await supabase.rpc("execute_trade", {
      p_user_id: user.id,
      p_market_id: market.id,
      p_side: side,
      p_action: action,
      p_shares: shares,
      p_max_cost: action === "buy" && preview ? preview.cost * 1.05 : null,
    })
    if (err) {
      setError(err.message)
    } else {
      // Record sync probability at trade time for "Beat the Market" scoring
      if (market.is_synced && market.sync_probability != null) {
        supabase
          .from("trades")
          .update({ sync_prob_at_trade: market.sync_probability })
          .eq("user_id", user.id)
          .eq("market_id", market.id)
          .order("created_at", { ascending: false })
          .limit(1)
          .then(() => {})
      }
      const tradedShares = shares
      const tradedCost = preview?.cost ?? 0
      setAmount("")
      setToast({ side, action, shares: tradedShares, cost: tradedCost })
      setTimeout(() => setToast(null), 3000)
      await refreshProfile()
      onTradeComplete()
    }
    setLoading(false)
  }

  const canSell = position && (
    (side === "yes" && position.yes_shares > 0) ||
    (side === "no" && position.no_shares > 0)
  )
  const maxSellShares = position
    ? side === "yes" ? position.yes_shares : position.no_shares
    : 0

  if (market.status !== "open") {
    return (
      <Card className="border-border/40 bg-card/80">
        <CardContent className="py-8 text-center">
          <p className="text-muted-foreground">
            This market is {market.status}.
            {market.outcome && (
              <span className="ml-1">
                Resolved: <strong className={cn(
                  "font-mono",
                  market.outcome === "yes" ? "text-yes" : "text-no"
                )}>
                  {market.outcome.toUpperCase()}
                </strong>
              </span>
            )}
          </p>
        </CardContent>
      </Card>
    )
  }

  if (!user) {
    return (
      <Card className="border-border/40 bg-card/80">
        <CardContent className="py-8 text-center">
          <p className="mb-3 text-sm text-muted-foreground">Sign in to trade</p>
          <Link href="/auth/login">
            <Button size="sm" className="glow-primary">Sign in</Button>
          </Link>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="overflow-hidden border-border/40 bg-card/80 backdrop-blur-sm">
      <CardHeader className="border-b border-border/30 pb-3">
        <CardTitle className="flex items-center justify-between text-base font-heading">
          Trade
          {profile && (
            <span className="font-mono text-sm font-normal text-muted-foreground">
              <span className="text-primary font-medium">${profile.balance.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 pt-4">
        <Tabs value={action} onValueChange={(v) => { setAction(v as TradeAction); setAmount("") }}>
          <TabsList className="w-full bg-secondary/50">
            <TabsTrigger value="buy" className="flex-1 font-semibold">Buy</TabsTrigger>
            <TabsTrigger value="sell" className="flex-1 font-semibold">Sell</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="grid grid-cols-2 gap-2.5">
          <button
            className={cn(
              "relative h-14 rounded-xl border-2 font-mono text-base font-bold transition-all",
              side === "yes"
                ? "border-yes bg-yes/10 text-yes glow-yes"
                : "border-border/40 bg-secondary/30 text-muted-foreground hover:border-yes/30 hover:text-yes"
            )}
            onClick={() => setSide("yes")}
          >
            <span className="text-lg">{Math.round(currentPrice.yes * 100)}¢</span>
            <span className="absolute bottom-1 left-1/2 -translate-x-1/2 text-[10px] uppercase tracking-widest opacity-60">Yes</span>
          </button>
          <button
            className={cn(
              "relative h-14 rounded-xl border-2 font-mono text-base font-bold transition-all",
              side === "no"
                ? "border-no bg-no/10 text-no glow-no"
                : "border-border/40 bg-secondary/30 text-muted-foreground hover:border-no/30 hover:text-no"
            )}
            onClick={() => setSide("no")}
          >
            <span className="text-lg">{Math.round(currentPrice.no * 100)}¢</span>
            <span className="absolute bottom-1 left-1/2 -translate-x-1/2 text-[10px] uppercase tracking-widest opacity-60">No</span>
          </button>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-xs uppercase tracking-wider text-muted-foreground">Shares</Label>
            {action === "sell" && maxSellShares > 0 && (
              <button
                className="text-xs font-medium text-primary hover:underline"
                onClick={() => setAmount(String(maxSellShares))}
              >
                Max: {maxSellShares.toFixed(2)}
              </button>
            )}
          </div>
          <Input
            type="number"
            placeholder="0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            min={0}
            step={1}
            className="h-11 bg-secondary/30 font-mono text-lg border-border/40 focus:border-primary/40"
          />
          {action === "buy" && profile && (
            <div className="flex gap-1.5">
              {[10, 50, 100, 500].map((v) => {
                const est = estimateShares(
                  market.yes_shares, market.no_shares, market.liquidity_param,
                  side, v
                )
                return (
                  <button
                    key={v}
                    className="flex-1 rounded-lg border border-border/30 bg-secondary/20 px-2 py-1.5 font-mono text-xs text-muted-foreground transition-all hover:border-primary/20 hover:text-primary"
                    onClick={() => setAmount(String(Math.floor(est)))}
                  >
                    ${v}
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {preview && shares > 0 && (
          <div className="space-y-2 rounded-xl border border-border/30 bg-secondary/20 p-3 font-mono text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">
                {action === "buy" ? "Cost" : "Receive"}
              </span>
              <span className="font-semibold text-foreground">
                ${Math.abs(preview.cost).toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Avg price</span>
              <span>{(preview.pricePerShare * 100).toFixed(1)}¢</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">New prob</span>
              <span>
                <span className="text-yes">{Math.round(preview.newProbability.yes * 100)}%</span>
                {" / "}
                <span className="text-no">{Math.round(preview.newProbability.no * 100)}%</span>
              </span>
            </div>
            {preview.impact > 0.01 && (
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Impact</span>
                <span className="text-chart-4">{(preview.impact * 100).toFixed(1)}%</span>
              </div>
            )}
          </div>
        )}

        {/* Beat the Market edge indicator */}
        {market.is_synced && market.sync_probability != null && shares > 0 && action === "buy" && preview && (
          <div className="flex items-center gap-2 rounded-xl border border-primary/20 bg-primary/5 p-2.5 text-xs">
            <Zap className="h-4 w-4 shrink-0 text-primary" />
            <div className="flex-1">
              <span className="font-medium">Edge indicator: </span>
              {(() => {
                const userPrice = preview.pricePerShare
                const marketPrice = side === "yes" ? market.sync_probability! : (1 - market.sync_probability!)
                const edge = marketPrice - userPrice
                if (edge > 0.02) {
                  return <span className="text-yes font-semibold">Getting {(edge * 100).toFixed(0)}¢ edge vs real money</span>
                } else if (edge < -0.02) {
                  return <span className="text-muted-foreground">Paying {(Math.abs(edge) * 100).toFixed(0)}¢ premium vs real money</span>
                } else {
                  return <span className="text-muted-foreground">Fair price (matches real money)</span>
                }
              })()}
            </div>
          </div>
        )}

        {error && <p className="text-sm text-destructive">{error}</p>}

        <Button
          className={cn(
            "w-full h-12 font-semibold text-base",
            side === "yes"
              ? "bg-yes hover:bg-yes/90 text-yes-foreground glow-yes"
              : "bg-no hover:bg-no/90 text-no-foreground glow-no"
          )}
          disabled={loading || shares <= 0 || (action === "sell" && !canSell)}
          onClick={handleTrade}
        >
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          <span className="truncate">
            {action === "buy" ? "Buy" : "Sell"} {side.toUpperCase()} {shares > 0 ? `(${shares})` : ""}
          </span>
        </Button>

        {position && (position.yes_shares > 0 || position.no_shares > 0) && (
          <div className="rounded-xl border border-border/30 bg-secondary/20 p-3">
            <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Position</p>
            <div className="flex justify-between font-mono text-sm">
              {position.yes_shares > 0 && (
                <span className="text-yes">{position.yes_shares.toFixed(2)} Yes</span>
              )}
              {position.no_shares > 0 && (
                <span className="text-no">{position.no_shares.toFixed(2)} No</span>
              )}
            </div>
          </div>
        )}
      </CardContent>

      <div className="hidden border-t border-border/20 px-4 py-2 lg:block">
        <p className="text-center font-mono text-[10px] text-muted-foreground/40 tracking-wider">
          Y/N side &middot; B/S action
        </p>
      </div>

      {toast && (
        <TradeToast
          show={!!toast}
          side={toast.side}
          action={toast.action}
          shares={toast.shares}
          cost={toast.cost}
          onClose={() => setToast(null)}
        />
      )}
    </Card>
  )
}
