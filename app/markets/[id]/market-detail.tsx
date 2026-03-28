"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { useSearchParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { useAuth } from "@/components/providers"
import { useMarket } from "@/lib/hooks/use-market"
import { useLiveTrades } from "@/lib/hooks/use-trades"
import { ProbabilityDisplay } from "@/components/probability-display"
import { TradePanel } from "@/components/trade-panel"
import { PriceChart } from "@/components/price-chart"
import { CommentSection } from "@/components/comment-section"
import { MarketStatusBadge, SyncBadge } from "@/components/market-status-badge"
import { ShareButton } from "@/components/share-button"
import { LikeButton } from "@/components/like-button"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { CATEGORIES } from "@/lib/constants"
import type { Market, MarketHistoryPoint, Trade, Position } from "@/types"
import { RelatedMarkets } from "@/components/related-markets"
import { ResolutionBanner } from "@/components/resolution-banner"
import { Countdown } from "@/components/countdown"
import { FollowButton } from "@/components/follow-button"
import { MarketTimeline } from "@/components/market-timeline"
import { CreatorStats } from "@/components/creator-stats"
import { ArrowLeft, Clock, BarChart3, Users, Gavel, Copy, ChevronUp } from "lucide-react"
import { format, formatDistanceToNow } from "date-fns"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"

interface MarketDetailProps {
  initialMarket: Market
  initialHistory: MarketHistoryPoint[]
  initialTrades: Trade[]
}

export const MarketDetail = ({
  initialMarket,
  initialHistory,
  initialTrades,
}: MarketDetailProps) => {
  const { user } = useAuth()
  const searchParams = useSearchParams()
  const initialSide = searchParams.get("side") as "yes" | "no" | null
  const { market, refresh: refreshMarket } = useMarket(initialMarket)
  const { trades, setTrades } = useLiveTrades(initialMarket.id, initialTrades)
  const [history, setHistory] = useState(initialHistory)
  const [position, setPosition] = useState<Position | null>(null)
  const [resolveOpen, setResolveOpen] = useState(false)
  const [resolveConfirm, setResolveConfirm] = useState("")
  const [resolving, setResolving] = useState(false)
  const tradePanelRef = useRef<HTMLDivElement>(null)

  const category = CATEGORIES.find((c) => c.value === market.category)
  const isCreator = user?.id === market.creator_id

  const refreshAll = useCallback(async () => {
    const supabase = createClient()
    const [{ data: h }, { data: t }] = await Promise.all([
      supabase.from("market_history").select("*").eq("market_id", market.id).order("recorded_at", { ascending: true }).limit(500),
      supabase.from("trades").select("*, user:profiles(username, avatar_url)").eq("market_id", market.id).order("created_at", { ascending: false }).limit(20),
    ])
    if (h) setHistory(h)
    if (t) setTrades(t)
    await refreshMarket()
  }, [market.id, refreshMarket, setTrades])

  useEffect(() => {
    if (!user) return
    const supabase = createClient()
    supabase
      .from("positions")
      .select("*")
      .eq("user_id", user.id)
      .eq("market_id", market.id)
      .single()
      .then(({ data }) => setPosition(data))
  }, [user, market.id])

  const handleResolve = async (outcome: "yes" | "no") => {
    if (!user || resolving) return
    setResolving(true)
    const supabase = createClient()
    await supabase.rpc("resolve_market", {
      p_market_id: market.id,
      p_outcome: outcome,
      p_resolver_id: user.id,
    })
    setResolveOpen(false)
    setResolveConfirm("")
    setResolving(false)
    refreshAll()
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <Link href="/markets">
        <Button variant="ghost" size="sm">
          <ArrowLeft className="mr-1.5 h-4 w-4" />
          Back to Markets
        </Button>
      </Link>

      <div className="grid gap-6 lg:grid-cols-[1fr_350px]">
        {/* Left: Market info */}
        <div className="space-y-6">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <MarketStatusBadge status={market.status} />
              {category && (
                <Badge variant="secondary">{category.emoji} {category.label}</Badge>
              )}
              {market.is_synced && market.sync_source && (
                <SyncBadge source={market.sync_source} />
              )}
            </div>

            {market.status === "resolved" && (
              <ResolutionBanner market={market} position={position} />
            )}

            <h1 className="font-heading text-2xl font-bold leading-tight tracking-tight md:text-3xl">{market.question}</h1>

            {market.description && (
              <p className="text-sm text-muted-foreground">{market.description}</p>
            )}

            <ProbabilityDisplay
              probability={market.probability}
              size="lg"
              syncProbability={market.sync_probability}
              syncSource={market.sync_source}
            />

            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <BarChart3 className="h-4 w-4" />
                ${market.total_volume.toLocaleString(undefined, { maximumFractionDigits: 0 })} volume
              </span>
              <span className="flex items-center gap-1.5">
                <Users className="h-4 w-4" />
                {market.trades_count} trades
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="h-4 w-4" />
                {new Date(market.resolution_date) > new Date() ? (
                  new Date(market.resolution_date).getTime() - Date.now() < 7 * 24 * 60 * 60 * 1000 ? (
                    <Countdown targetDate={market.resolution_date} />
                  ) : (
                    `Closes ${formatDistanceToNow(new Date(market.resolution_date), { addSuffix: true })}`
                  )
                ) : (
                  `Closed ${format(new Date(market.resolution_date), "MMM d, yyyy")}`
                )}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <FollowButton marketId={market.id} />
              <LikeButton marketId={market.id} initialCount={market.likes_count} />
              <ShareButton question={market.question} marketId={market.id} />
              {user && (
                <Link
                  href={`/markets/create?q=${encodeURIComponent(market.question)}&desc=${encodeURIComponent(market.description ?? "")}&cat=${market.category}&src=${encodeURIComponent(market.resolution_source ?? "")}`}
                >
                  <Button variant="ghost" size="sm" className="text-muted-foreground">
                    <Copy className="mr-1.5 h-3.5 w-3.5" />
                    Create similar
                  </Button>
                </Link>
              )}
            </div>

            {market.is_synced && market.sync_volume != null && (
              <div className="rounded-lg border border-primary/20 bg-primary/5 p-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">
                    Real-money odds ({market.sync_source === "polymarket" ? "Polymarket" : "Kalshi"})
                  </span>
                  <span className="font-mono font-semibold text-primary">
                    {market.sync_probability != null
                      ? `${Math.round(market.sync_probability * 100)}% Yes`
                      : "N/A"}
                  </span>
                </div>
                <div className="mt-1 flex items-center justify-between text-xs text-muted-foreground">
                  <span>
                    ${market.sync_volume.toLocaleString(undefined, { maximumFractionDigits: 0 })} real volume
                  </span>
                  {market.last_synced_at && (
                    <span>
                      Synced {formatDistanceToNow(new Date(market.last_synced_at), { addSuffix: true })}
                    </span>
                  )}
                </div>
              </div>
            )}

            {market.creator && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Avatar className="h-5 w-5">
                  <AvatarImage src={market.creator.avatar_url ?? undefined} />
                  <AvatarFallback className="text-[8px]">
                    {market.creator.username.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                Created by @{market.creator.username}
              </div>
            )}
          </div>

          <PriceChart history={history} currentProbability={market.probability} />

          {/* Recent trades */}
          <Card>
            <CardContent className="p-4">
              <h3 className="mb-3 text-sm font-semibold">Recent Trades</h3>
              {trades.length === 0 ? (
                <p className="text-sm text-muted-foreground">No trades yet. Be the first!</p>
              ) : (
                <div className="space-y-2">
                  <AnimatePresence mode="popLayout">
                    {trades.map((trade) => (
                      <motion.div
                        key={trade.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0 }}
                        layout
                        className="flex items-center justify-between text-sm"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">
                            @{(trade as any).user?.username ?? "anon"}
                          </span>
                          <Badge
                            variant="outline"
                            className={trade.side === "yes" ? "border-yes/30 text-yes" : "border-no/30 text-no"}
                          >
                            {trade.action === "buy" ? "Bought" : "Sold"} {trade.side.toUpperCase()}
                          </Badge>
                        </div>
                        <div className="text-right">
                          <span className="font-mono text-xs">
                            {trade.shares.toFixed(1)} @ {(trade.price * 100).toFixed(0)}¢
                          </span>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </CardContent>
          </Card>

          <MarketTimeline market={market} trades={trades} />

          <Separator />

          <CommentSection marketId={market.id} />

          <Separator />

          <RelatedMarkets marketId={market.id} category={market.category} />
        </div>

        {/* Right: Trade panel */}
        <div ref={tradePanelRef} className="space-y-4 lg:sticky lg:top-20 lg:self-start">
          <TradePanel
            market={market}
            position={position}
            initialSide={initialSide ?? undefined}
            onTradeComplete={async () => {
              await refreshAll()
              if (user) {
                const supabase = createClient()
                const { data } = await supabase
                  .from("positions")
                  .select("*")
                  .eq("user_id", user.id)
                  .eq("market_id", market.id)
                  .single()
                setPosition(data)
              }
            }}
          />

          {isCreator && market.status === "open" && (
            <Dialog open={resolveOpen} onOpenChange={setResolveOpen}>
              <DialogTrigger
                render={<Button variant="outline" className="w-full" />}
              >
                <Gavel className="mr-2 h-4 w-4" />
                Resolve Market
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Resolve Market</DialogTitle>
                  <DialogDescription>
                    This will close the market and pay out winners. This action cannot be undone.
                    Type &quot;RESOLVE&quot; below to confirm.
                  </DialogDescription>
                </DialogHeader>
                <Input
                  placeholder='Type "RESOLVE" to confirm'
                  value={resolveConfirm}
                  onChange={(e) => setResolveConfirm(e.target.value)}
                  className="font-mono"
                />
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    className="bg-yes hover:bg-yes/90 text-yes-foreground"
                    onClick={() => handleResolve("yes")}
                    disabled={resolveConfirm !== "RESOLVE" || resolving}
                  >
                    Resolve YES
                  </Button>
                  <Button
                    className="bg-no hover:bg-no/90 text-no-foreground"
                    onClick={() => handleResolve("no")}
                    disabled={resolveConfirm !== "RESOLVE" || resolving}
                  >
                    Resolve NO
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}

          {isCreator && <CreatorStats marketId={market.id} />}
        </div>
      </div>

      {/* Mobile floating trade bar */}
      {user && market.status === "open" && (
        <div className="fixed bottom-16 left-0 right-0 z-40 border-t border-border/40 bg-card/95 backdrop-blur-md px-4 py-2.5 lg:hidden">
          <div className="flex items-center justify-between gap-3">
            <div className="flex-1 min-w-0">
              <span className="font-mono text-lg font-bold text-yes">{Math.round(market.probability * 100)}%</span>
              <span className="ml-1.5 text-xs text-muted-foreground">Yes</span>
            </div>
            <Button
              size="sm"
              className="bg-yes text-yes-foreground glow-yes font-semibold"
              onClick={() => tradePanelRef.current?.scrollIntoView({ behavior: "smooth", block: "center" })}
            >
              <ChevronUp className="mr-1 h-3.5 w-3.5" />
              Trade
            </Button>
          </div>
        </div>
      )}
    </motion.div>
  )
}
