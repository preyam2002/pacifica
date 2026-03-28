"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Users, BarChart3, TrendingUp, Clock } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { cn } from "@/lib/utils"

interface TraderStat {
  user_id: string
  username: string
  avatar_url: string | null
  total_shares: number
  trade_count: number
}

export const CreatorStats = ({ marketId }: { marketId: string }) => {
  const [stats, setStats] = useState<{
    uniqueTraders: number
    totalTrades: number
    avgTradeSize: number
    topTraders: TraderStat[]
  } | null>(null)

  useEffect(() => {
    const fetch = async () => {
      const supabase = createClient()

      const { data: trades } = await supabase
        .from("trades")
        .select("user_id, shares, user:profiles(username, avatar_url)")
        .eq("market_id", marketId)

      if (!trades || trades.length === 0) return

      const traderMap = new Map<string, TraderStat>()
      let totalShares = 0

      for (const t of trades) {
        totalShares += t.shares
        const existing = traderMap.get(t.user_id)
        const user = t.user as any
        if (existing) {
          existing.total_shares += t.shares
          existing.trade_count += 1
        } else {
          traderMap.set(t.user_id, {
            user_id: t.user_id,
            username: user?.username ?? "anon",
            avatar_url: user?.avatar_url ?? null,
            total_shares: t.shares,
            trade_count: 1,
          })
        }
      }

      const topTraders = Array.from(traderMap.values())
        .sort((a, b) => b.total_shares - a.total_shares)
        .slice(0, 5)

      setStats({
        uniqueTraders: traderMap.size,
        totalTrades: trades.length,
        avgTradeSize: totalShares / trades.length,
        topTraders,
      })
    }
    fetch()
  }, [marketId])

  if (!stats) return null

  return (
    <Card className="border-border/40 bg-card/80">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm font-semibold">
          <BarChart3 className="h-4 w-4 text-primary" />
          Creator Analytics
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-xl bg-secondary/30 p-3 text-center">
            <Users className="mx-auto h-4 w-4 text-muted-foreground" />
            <p className="mt-1 font-mono text-lg font-bold">{stats.uniqueTraders}</p>
            <p className="text-[10px] text-muted-foreground">Traders</p>
          </div>
          <div className="rounded-xl bg-secondary/30 p-3 text-center">
            <TrendingUp className="mx-auto h-4 w-4 text-muted-foreground" />
            <p className="mt-1 font-mono text-lg font-bold">{stats.totalTrades}</p>
            <p className="text-[10px] text-muted-foreground">Trades</p>
          </div>
          <div className="rounded-xl bg-secondary/30 p-3 text-center">
            <Clock className="mx-auto h-4 w-4 text-muted-foreground" />
            <p className="mt-1 font-mono text-lg font-bold">{stats.avgTradeSize.toFixed(1)}</p>
            <p className="text-[10px] text-muted-foreground">Avg Size</p>
          </div>
        </div>

        {stats.topTraders.length > 0 && (
          <div className="space-y-2">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Top Traders</p>
            {stats.topTraders.map((trader, i) => (
              <div key={trader.user_id} className="flex items-center gap-2 text-sm">
                <span className="w-4 text-center font-mono text-xs text-muted-foreground">{i + 1}</span>
                <Avatar className="h-5 w-5">
                  <AvatarImage src={trader.avatar_url ?? undefined} />
                  <AvatarFallback className="text-[8px]">
                    {trader.username.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="flex-1 text-xs">@{trader.username}</span>
                <span className="font-mono text-xs text-muted-foreground">
                  {trader.total_shares.toFixed(1)} shares
                </span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
