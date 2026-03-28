"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { Profile, Position, Trade, Market } from "@/types"
import {
  DollarSign,
  Target,
  Flame,
  TrendingUp,
  Calendar,
  Zap,
} from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { motion } from "framer-motion"
import { Achievements } from "@/components/achievements"
import { RankBadge } from "@/components/rank-badge"

interface PositionRow extends Omit<Position, "market"> {
  market: { question: string; probability: number; status: string }
}

interface TradeRow extends Omit<Trade, "market"> {
  market: { question: string }
}

interface ProfileViewProps {
  profile: Profile
  positions: PositionRow[]
  recentTrades: TradeRow[]
  marketsCreated: number
  rank: number
}

export const ProfileView = ({ profile, positions, recentTrades, marketsCreated, rank }: ProfileViewProps) => {
  const accuracy =
    profile.total_trades > 0
      ? ((profile.correct_predictions / profile.total_trades) * 100).toFixed(0)
      : "N/A"

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* Profile header */}
      <div className="flex items-center gap-4">
        <Avatar className="h-16 w-16">
          <AvatarImage src={profile.avatar_url ?? undefined} />
          <AvatarFallback className="text-lg">
            {profile.username.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-heading text-2xl font-bold tracking-tight">
              {profile.display_name ?? profile.username}
            </h1>
            <RankBadge rank={rank} size="md" />
          </div>
          <p className="text-sm text-muted-foreground">@{profile.username}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            <Calendar className="mr-1 inline h-3 w-3" />
            Joined {format(new Date(profile.created_at), "MMM yyyy")}
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        <Card>
          <CardContent className="p-4 text-center">
            <DollarSign className="mx-auto h-5 w-5 text-primary" />
            <p className="mt-1 font-mono text-xl font-bold">
              ${profile.balance.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </p>
            <p className="text-xs text-muted-foreground">Balance</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <TrendingUp className="mx-auto h-5 w-5 text-yes" />
            <p className="mt-1 font-mono text-xl font-bold">{profile.total_trades}</p>
            <p className="text-xs text-muted-foreground">Trades</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Target className="mx-auto h-5 w-5 text-chart-4" />
            <p className="mt-1 font-mono text-xl font-bold">{accuracy}%</p>
            <p className="text-xs text-muted-foreground">Accuracy</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Flame className="mx-auto h-5 w-5 text-no" />
            <p className="mt-1 font-mono text-xl font-bold">{profile.best_streak}</p>
            <p className="text-xs text-muted-foreground">Best Streak</p>
          </CardContent>
        </Card>
        <Card className={cn(profile.edge_trades > 0 && profile.edge_correct > profile.edge_trades * 0.5 && "border-primary/30 bg-primary/5")}>
          <CardContent className="p-4 text-center">
            <Zap className="mx-auto h-5 w-5 text-primary" />
            <p className="mt-1 font-mono text-xl font-bold">
              {profile.edge_trades > 0
                ? `${((profile.edge_correct / profile.edge_trades) * 100).toFixed(0)}%`
                : "—"}
            </p>
            <p className="text-xs text-muted-foreground">Edge</p>
          </CardContent>
        </Card>
      </div>

      <Achievements profile={profile} marketsCreated={marketsCreated} />

      {/* Open positions */}
      {positions.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold">Open Positions</h2>
          {positions.map((pos) => (
            <Link key={pos.id} href={`/markets/${pos.market_id}`}>
              <Card className="cursor-pointer transition-colors hover:border-primary/30">
                <CardContent className="flex items-center justify-between p-3">
                  <p className="text-sm line-clamp-1 flex-1">{pos.market.question}</p>
                  <div className="ml-3 flex items-center gap-2">
                    {pos.yes_shares > 0 && (
                      <Badge variant="outline" className="border-yes/30 text-yes text-xs">
                        {pos.yes_shares.toFixed(1)} Yes
                      </Badge>
                    )}
                    {pos.no_shares > 0 && (
                      <Badge variant="outline" className="border-no/30 text-no text-xs">
                        {pos.no_shares.toFixed(1)} No
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}

      {/* Recent trades */}
      {recentTrades.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold">Recent Trades</h2>
          {recentTrades.map((trade) => (
            <Link key={trade.id} href={`/markets/${trade.market_id}`}>
              <div className="flex items-center justify-between rounded-xl border border-border/40 bg-card/80 p-3 text-sm transition-colors hover:border-primary/20">
                <div className="flex-1 space-y-0.5">
                  <p className="line-clamp-1 text-xs text-muted-foreground">
                    {trade.market?.question}
                  </p>
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-xs",
                      trade.side === "yes" ? "border-yes/30 text-yes" : "border-no/30 text-no"
                    )}
                  >
                    {trade.action === "buy" ? "Buy" : "Sell"} {trade.side.toUpperCase()}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs text-muted-foreground">
                    {trade.shares.toFixed(1)} @ {(trade.price * 100).toFixed(0)}¢
                  </span>
                  <span className="text-[10px] text-primary opacity-0 transition-opacity group-hover:opacity-100">
                    Trade &rarr;
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </motion.div>
  )
}
