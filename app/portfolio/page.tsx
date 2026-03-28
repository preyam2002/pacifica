"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { createClient } from "@/lib/supabase/client"
import { useAuth } from "@/components/providers"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { EmptyState } from "@/components/empty-state"
import { Button } from "@/components/ui/button"
import { MarketStatusBadge } from "@/components/market-status-badge"
import { MarketCard } from "@/components/market-card"
import { PortfolioSparkline } from "@/components/portfolio-sparkline"
import type { Position, Trade, Market } from "@/types"
import {
  Briefcase,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Target,
  Flame,
  Gavel,
  Plus,
  Bookmark,
} from "lucide-react"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import { cn } from "@/lib/utils"

interface PositionWithMarket extends Position {
  market: Market
}

export default function PortfolioPage() {
  const { user, profile } = useAuth()
  const [positions, setPositions] = useState<PositionWithMarket[]>([])
  const [trades, setTrades] = useState<Trade[]>([])
  const [myMarkets, setMyMarkets] = useState<Market[]>([])
  const [following, setFollowing] = useState<Market[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    const fetch = async () => {
      const supabase = createClient()
      const [{ data: pos }, { data: tr }, { data: mm }, { data: fw }] = await Promise.all([
        supabase
          .from("positions")
          .select("*, market:markets(*)")
          .eq("user_id", user.id)
          .or("yes_shares.gt.0,no_shares.gt.0"),
        supabase
          .from("trades")
          .select("*, market:markets(question)")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(50),
        supabase
          .from("markets")
          .select("*")
          .eq("creator_id", user.id)
          .order("created_at", { ascending: false }),
        supabase
          .from("market_follows")
          .select("market:markets(*)")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false }),
      ])
      setPositions((pos as PositionWithMarket[]) ?? [])
      setTrades(tr ?? [])
      setMyMarkets(mm ?? [])
      setFollowing(((fw ?? []) as any[]).map((f: any) => f.market).filter(Boolean))
      setLoading(false)
    }
    fetch()
  }, [user])

  if (!user) {
    return (
      <EmptyState
        icon={<Briefcase className="h-8 w-8" />}
        title="Sign in to view your portfolio"
        description="Track your positions, P&L, and trade history."
        action={
          <Link href="/auth/login">
            <Button>Sign in</Button>
          </Link>
        }
      />
    )
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32" />
        <Skeleton className="h-64" />
      </div>
    )
  }

  const totalPositionValue = positions.reduce((sum, pos) => {
    const yesVal = pos.yes_shares * pos.market.probability
    const noVal = pos.no_shares * (1 - pos.market.probability)
    return sum + yesVal + noVal
  }, 0)

  const totalInvested = positions.reduce((sum, pos) => sum + pos.total_invested, 0)
  const unrealizedPnl = totalPositionValue - totalInvested
  const portfolioValue = (profile?.balance ?? 0) + totalPositionValue

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <h1 className="font-heading text-3xl font-bold tracking-tight">Portfolio</h1>

      {/* Summary cards */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 animate-in-children">
        <div className="stat-card rounded-xl p-4">
          <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-primary/10">
              <DollarSign className="h-3.5 w-3.5 text-primary" />
            </div>
            Total Value
          </div>
          <p className="mt-2 font-mono text-2xl font-bold">
            ${portfolioValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </p>
          <PortfolioSparkline userId={user.id} currentValue={portfolioValue} />
        </div>
        <div className="stat-card rounded-xl p-4">
          <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-yes/10">
              <DollarSign className="h-3.5 w-3.5 text-yes" />
            </div>
            Cash
          </div>
          <p className="mt-2 font-mono text-2xl font-bold">
            ${profile?.balance.toLocaleString(undefined, { maximumFractionDigits: 0 }) ?? "0"}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">Available to trade</p>
        </div>
        <div className="stat-card rounded-xl p-4">
          <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            <div className={cn("flex h-6 w-6 items-center justify-center rounded-lg", unrealizedPnl >= 0 ? "bg-yes/10" : "bg-no/10")}>
              {unrealizedPnl >= 0 ? <TrendingUp className="h-3.5 w-3.5 text-yes" /> : <TrendingDown className="h-3.5 w-3.5 text-no" />}
            </div>
            P&L
          </div>
          <p className={cn("mt-2 font-mono text-2xl font-bold", unrealizedPnl >= 0 ? "text-yes" : "text-no")}>
            {unrealizedPnl >= 0 ? "+" : ""}${unrealizedPnl.toFixed(2)}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">{positions.length} open position{positions.length !== 1 ? "s" : ""}</p>
        </div>
        <div className="stat-card rounded-xl p-4">
          <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-chart-4/10">
              <Flame className="h-3.5 w-3.5 text-chart-4" />
            </div>
            Streak
          </div>
          <p className="mt-2 font-mono text-2xl font-bold">
            {profile?.current_streak ?? 0}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">Best: {profile?.best_streak ?? 0}</p>
        </div>
      </div>

      <Tabs defaultValue="positions">
        <TabsList>
          <TabsTrigger value="positions">Positions ({positions.length})</TabsTrigger>
          <TabsTrigger value="following">Following ({following.length})</TabsTrigger>
          <TabsTrigger value="my-markets">My Markets ({myMarkets.length})</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="positions" className="space-y-3">
          {positions.length === 0 ? (
            <EmptyState
              icon={<Target className="h-8 w-8" />}
              title="No open positions"
              description="Start trading to build your portfolio."
              action={
                <Link href="/markets">
                  <Button size="sm">Browse Markets</Button>
                </Link>
              }
            />
          ) : (
            positions.map((pos) => {
              const yesVal = pos.yes_shares * pos.market.probability
              const noVal = pos.no_shares * (1 - pos.market.probability)
              const value = yesVal + noVal
              const pnl = value - pos.total_invested
              return (
                <Link key={pos.id} href={`/markets/${pos.market_id}`}>
                  <Card className="cursor-pointer transition-colors hover:border-primary/30">
                    <CardContent className="flex items-center justify-between p-4">
                      <div className="flex-1 space-y-1">
                        <p className="text-sm font-medium line-clamp-1">{pos.market.question}</p>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          {pos.yes_shares > 0 && (
                            <span className="text-yes">
                              {pos.yes_shares.toFixed(1)} Yes @ {(pos.avg_yes_price * 100).toFixed(0)}¢
                            </span>
                          )}
                          {pos.no_shares > 0 && (
                            <span className="text-no">
                              {pos.no_shares.toFixed(1)} No @ {(pos.avg_no_price * 100).toFixed(0)}¢
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-mono text-sm font-medium">${value.toFixed(2)}</p>
                        <p className={cn("font-mono text-xs", pnl >= 0 ? "text-yes" : "text-no")}>
                          {pnl >= 0 ? "+" : ""}${pnl.toFixed(2)}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              )
            })
          )}
        </TabsContent>

        <TabsContent value="following" className="space-y-3">
          {following.length === 0 ? (
            <EmptyState
              icon={<Bookmark className="h-8 w-8" />}
              title="No followed markets"
              description="Bookmark markets to track them here."
              action={
                <Link href="/markets">
                  <Button size="sm">Browse Markets</Button>
                </Link>
              }
            />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {following.map((market) => (
                <MarketCard key={market.id} market={market} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="my-markets" className="space-y-3">
          {myMarkets.length === 0 ? (
            <EmptyState
              icon={<Gavel className="h-8 w-8" />}
              title="No markets created"
              description="Create your first prediction market and start gathering opinions."
              action={
                <Link href="/markets/create">
                  <Button size="sm">
                    <Plus className="mr-1.5 h-4 w-4" />
                    Create Market
                  </Button>
                </Link>
              }
            />
          ) : (
            myMarkets.map((m) => (
              <Link key={m.id} href={`/markets/${m.id}`}>
                <Card className="cursor-pointer transition-colors hover:border-primary/30">
                  <CardContent className="flex items-center justify-between p-4">
                    <div className="flex-1 space-y-1.5">
                      <div className="flex items-center gap-2">
                        <MarketStatusBadge status={m.status} />
                        {m.outcome && (
                          <Badge
                            variant="outline"
                            className={cn(
                              "text-xs",
                              m.outcome === "yes" ? "border-yes/30 text-yes" : "border-no/30 text-no"
                            )}
                          >
                            {m.outcome.toUpperCase()}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm font-medium line-clamp-1">{m.question}</p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="font-mono">${m.total_volume.toLocaleString(undefined, { maximumFractionDigits: 0 })} vol</span>
                        <span>{m.trades_count} trades</span>
                      </div>
                    </div>
                    <div className="ml-3 text-right">
                      <p className="font-mono text-lg font-bold text-primary">
                        {Math.round(m.probability * 100)}%
                      </p>
                      {m.status === "open" && (
                        <span className="text-[10px] text-muted-foreground">
                          <Gavel className="mr-0.5 inline h-3 w-3" />
                          Resolve
                        </span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))
          )}
        </TabsContent>

        <TabsContent value="history" className="space-y-2">
          {trades.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">No trades yet.</p>
          ) : (
            trades.map((trade) => (
              <div key={trade.id} className="flex items-center justify-between rounded-lg border border-border p-3 text-sm">
                <div className="space-y-0.5">
                  <p className="line-clamp-1 text-xs text-muted-foreground">
                    {(trade.market as any)?.question ?? "Unknown market"}
                  </p>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-xs",
                        trade.side === "yes" ? "border-yes/30 text-yes" : "border-no/30 text-no"
                      )}
                    >
                      {trade.action === "buy" ? "Buy" : "Sell"} {trade.side.toUpperCase()}
                    </Badge>
                    <span className="font-mono text-xs">
                      {trade.shares.toFixed(1)} @ {(trade.price * 100).toFixed(0)}¢
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-mono text-xs">${Math.abs(trade.cost).toFixed(2)}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(trade.created_at), { addSuffix: true })}
                  </p>
                </div>
              </div>
            ))
          )}
        </TabsContent>
      </Tabs>
    </motion.div>
  )
}
