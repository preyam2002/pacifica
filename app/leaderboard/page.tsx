"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { useAuth } from "@/components/providers"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import type { Profile } from "@/types"
import { Trophy, Flame, Target, Crown, Zap } from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { motion } from "framer-motion"

type LeaderboardTab = "balance" | "accuracy" | "streak" | "edge"

const podiumConfig = [
  { rank: 1, cls: "podium-gold", color: "text-[oklch(0.85_0.16_85)]", ring: "ring-[oklch(0.85_0.16_85)]", size: "h-14 w-14", barH: "h-28" },
  { rank: 2, cls: "podium-silver", color: "text-[oklch(0.78_0.02_260)]", ring: "ring-[oklch(0.78_0.02_260)]", size: "h-12 w-12", barH: "h-20" },
  { rank: 3, cls: "podium-bronze", color: "text-[oklch(0.68_0.12_55)]", ring: "ring-[oklch(0.68_0.12_55)]", size: "h-11 w-11", barH: "h-14" },
] as const

export default function LeaderboardPage() {
  const { user } = useAuth()
  const [tab, setTab] = useState<LeaderboardTab>("balance")
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetch = async () => {
      setLoading(true)
      const supabase = createClient()
      let query = supabase.from("profiles").select("*")

      switch (tab) {
        case "balance":
          query = query.order("balance", { ascending: false })
          break
        case "accuracy":
          query = query.order("correct_predictions", { ascending: false })
          break
        case "streak":
          query = query.order("best_streak", { ascending: false })
          break
        case "edge":
          query = query.order("edge_score", { ascending: false }).gt("edge_trades", 0)
          break
      }

      const { data } = await query.limit(50)
      setProfiles(data ?? [])
      setLoading(false)
    }
    fetch()
  }, [tab])

  const getValue = (profile: Profile) => {
    switch (tab) {
      case "balance":
        return `$${profile.balance.toLocaleString(undefined, { maximumFractionDigits: 0 })}`
      case "accuracy":
        return profile.total_trades > 0
          ? `${((profile.correct_predictions / profile.total_trades) * 100).toFixed(0)}%`
          : "N/A"
      case "streak":
        return `${profile.best_streak}`
      case "edge":
        return profile.edge_trades > 0
          ? `${((profile.edge_correct / profile.edge_trades) * 100).toFixed(0)}%`
          : "N/A"
    }
  }

  const getSubValue = (profile: Profile) => {
    switch (tab) {
      case "balance":
        return `${profile.total_trades} trades`
      case "accuracy":
        return `${profile.correct_predictions}/${profile.total_trades}`
      case "streak":
        return `${profile.current_streak} current`
      case "edge":
        return `${profile.edge_correct}/${profile.edge_trades} edge trades`
    }
  }

  const top3 = profiles.slice(0, 3)
  const rest = profiles.slice(3)
  // Reorder for podium display: [2nd, 1st, 3rd]
  const podiumOrder = top3.length >= 3 ? [top3[1], top3[0], top3[2]] : top3
  const podiumConfOrder = top3.length >= 3 ? [podiumConfig[1], podiumConfig[0], podiumConfig[2]] : podiumConfig.slice(0, top3.length)

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="flex items-center gap-2.5 font-heading text-3xl font-bold tracking-tight">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-chart-4/10 border border-chart-4/20">
            <Trophy className="h-5 w-5 text-chart-4" />
          </div>
          Leaderboard
        </h1>

        <Tabs value={tab} onValueChange={(v) => setTab(v as LeaderboardTab)}>
          <TabsList className="bg-secondary/50">
            <TabsTrigger value="balance" className="font-medium">
              <Target className="mr-1.5 h-3.5 w-3.5" />
              Portfolio
            </TabsTrigger>
            <TabsTrigger value="accuracy" className="font-medium">
              <Target className="mr-1.5 h-3.5 w-3.5" />
              Accuracy
            </TabsTrigger>
            <TabsTrigger value="streak" className="font-medium">
              <Flame className="mr-1.5 h-3.5 w-3.5" />
              Streaks
            </TabsTrigger>
            <TabsTrigger value="edge" className="font-medium">
              <Zap className="mr-1.5 h-3.5 w-3.5" />
              Edge
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 10 }).map((_, i) => (
            <Skeleton key={i} className="h-16" />
          ))}
        </div>
      ) : (
        <>
          {/* Podium visualization */}
          {top3.length >= 3 && (
            <div className="relative overflow-hidden rounded-2xl border border-border/30 bg-card/50 px-4 pb-6 pt-10 backdrop-blur-sm">
              <div className="hero-mesh absolute inset-0 -z-10 opacity-20" />
              <div className="flex items-end justify-center gap-4 sm:gap-8">
                {podiumOrder.map((profile, idx) => {
                  const conf = podiumConfOrder[idx]
                  return (
                    <motion.div
                      key={profile.id}
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.15 * idx, duration: 0.6, ease: [0.16, 1, 0.3, 1] as const }}
                      className="flex flex-col items-center gap-2"
                    >
                      <div className="relative">
                        {conf.rank === 1 && (
                          <Crown className="absolute -top-5 left-1/2 h-5 w-5 -translate-x-1/2 text-[oklch(0.85_0.16_85)]" />
                        )}
                        <Avatar className={cn(conf.size, "ring-2 ring-offset-2 ring-offset-card", conf.ring)}>
                          <AvatarImage src={profile.avatar_url ?? undefined} />
                          <AvatarFallback className={cn("text-xs font-bold", conf.color)}>
                            {profile.username.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                      </div>
                      <div className="text-center">
                        <p className="text-xs font-semibold line-clamp-1 max-w-[80px]">
                          {profile.display_name ?? profile.username}
                        </p>
                        <p className={cn("font-mono text-sm font-bold", conf.color)}>
                          {getValue(profile)}
                        </p>
                      </div>
                      {/* Podium bar */}
                      <div className={cn(
                        "w-20 rounded-t-xl sm:w-24",
                        conf.barH,
                        conf.cls,
                        "podium-slot"
                      )}
                        style={{
                          background: `linear-gradient(180deg, oklch(0.20 0.025 235 / 0.8), oklch(0.14 0.02 235 / 0.9))`,
                          borderTop: `2px solid color-mix(in oklch, currentColor 30%, transparent)`,
                        }}
                      >
                        <div className="flex h-full items-center justify-center">
                          <span className={cn("font-heading text-2xl font-bold opacity-20", conf.color)}>
                            {conf.rank}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Rest of leaderboard */}
          <div className="space-y-1.5 animate-in-children">
            {rest.map((profile, index) => {
              const rank = index + 4
              const isCurrentUser = user?.id === profile.id
              return (
                <Link key={profile.id} href={`/profile/${profile.username}`}>
                  <div
                    className={cn(
                      "group flex items-center gap-3 rounded-xl border border-border/30 bg-card/60 p-3 transition-all hover:border-primary/20 hover:bg-card/80",
                      isCurrentUser && "border-primary/30 bg-primary/5"
                    )}
                  >
                    <span className="w-8 text-center font-mono text-sm text-muted-foreground/60">
                      {rank}
                    </span>
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={profile.avatar_url ?? undefined} />
                      <AvatarFallback className="bg-secondary text-xs font-semibold">
                        {profile.username.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {profile.display_name ?? profile.username}
                        {isCurrentUser && (
                          <span className="ml-1.5 text-[10px] font-semibold uppercase tracking-wider text-primary">you</span>
                        )}
                      </p>
                      <p className="text-xs text-muted-foreground">@{profile.username}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-mono text-sm font-bold">{getValue(profile)}</p>
                      <p className="font-mono text-[10px] text-muted-foreground">{getSubValue(profile)}</p>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        </>
      )}
    </motion.div>
  )
}
