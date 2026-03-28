"use client"

import { useState, useEffect, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import { useAuth } from "@/components/providers"
import { Button } from "@/components/ui/button"
import { EmptyState } from "@/components/empty-state"
import { Skeleton } from "@/components/ui/skeleton"
import { Bell, TrendingUp, MessageSquare, Gavel, ArrowLeft } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"

type ActivityType = "trade" | "comment" | "all"

interface Activity {
  id: string
  type: "trade" | "comment"
  market_id: string
  market_question: string
  actor_username: string
  detail: string
  created_at: string
}

export default function ActivityPage() {
  const { user } = useAuth()
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<ActivityType>("all")

  const fetchActivity = useCallback(async () => {
    if (!user) return
    setLoading(true)
    const supabase = createClient()

    const [{ data: trades }, { data: comments }] = await Promise.all([
      supabase
        .from("trades")
        .select("id, market_id, side, action, shares, created_at, user:profiles(username), market:markets!inner(question, creator_id)")
        .eq("market.creator_id", user.id)
        .neq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(50),
      supabase
        .from("comments")
        .select("id, market_id, content, created_at, user:profiles(username), market:markets!inner(question, creator_id)")
        .eq("market.creator_id", user.id)
        .neq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(50),
    ])

    const all: Activity[] = [
      ...(trades ?? []).map((t: any) => ({
        id: `trade-${t.id}`,
        type: "trade" as const,
        market_id: t.market_id,
        market_question: t.market?.question ?? "",
        actor_username: t.user?.username ?? "someone",
        detail: `${t.action === "buy" ? "bought" : "sold"} ${t.shares.toFixed(1)} ${t.side.toUpperCase()} shares`,
        created_at: t.created_at,
      })),
      ...(comments ?? []).map((c: any) => ({
        id: `comment-${c.id}`,
        type: "comment" as const,
        market_id: c.market_id,
        market_question: c.market?.question ?? "",
        actor_username: c.user?.username ?? "someone",
        detail: c.content.length > 100 ? c.content.slice(0, 100) + "..." : c.content,
        created_at: c.created_at,
      })),
    ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

    setActivities(all)
    setLoading(false)
  }, [user])

  useEffect(() => {
    fetchActivity()
  }, [fetchActivity])

  if (!user) {
    return (
      <EmptyState
        icon={<Bell className="h-8 w-8" />}
        title="Sign in to view activity"
        description="See trades and comments on your markets."
        action={
          <Link href="/auth/login">
            <Button className="glow-primary">Sign in</Button>
          </Link>
        }
      />
    )
  }

  const filtered = filter === "all" ? activities : activities.filter((a) => a.type === filter)

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <div className="flex items-center gap-3">
        <Link href="/">
          <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="font-heading text-3xl font-bold tracking-tight">Activity</h1>
          <p className="text-xs text-muted-foreground">Trades and comments on your markets</p>
        </div>
      </div>

      <div className="flex items-center gap-1.5">
        {(["all", "trade", "comment"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              "rounded-full px-3 py-1 text-xs font-medium transition-colors",
              filter === f
                ? "bg-primary text-primary-foreground"
                : "bg-secondary/60 text-muted-foreground hover:bg-secondary hover:text-foreground"
            )}
          >
            {f === "all" ? "All" : f === "trade" ? "Trades" : "Comments"}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-16" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<Bell className="h-8 w-8" />}
          title="No activity yet"
          description="When people trade or comment on your markets, it will show up here."
        />
      ) : (
        <div className="space-y-1.5 animate-in-children">
          {filtered.map((a) => (
            <Link key={a.id} href={`/markets/${a.market_id}`}>
              <div className="group flex items-start gap-3 rounded-xl border border-border/30 bg-card/60 p-3.5 transition-all hover:border-primary/20 hover:bg-card/80">
                <div className={cn(
                  "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
                  a.type === "trade" ? "bg-primary/10" : "bg-chart-4/10"
                )}>
                  {a.type === "trade" ? (
                    <TrendingUp className="h-4 w-4 text-primary" />
                  ) : (
                    <MessageSquare className="h-4 w-4 text-chart-4" />
                  )}
                </div>
                <div className="flex-1 min-w-0 space-y-1">
                  <p className="text-sm">
                    <span className="font-semibold">@{a.actor_username}</span>{" "}
                    <span className="text-muted-foreground">
                      {a.type === "trade" ? a.detail : `commented: "${a.detail}"`}
                    </span>
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {a.market_question}
                  </p>
                </div>
                <span className="shrink-0 text-[10px] text-muted-foreground/60">
                  {formatDistanceToNow(new Date(a.created_at), { addSuffix: true })}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </motion.div>
  )
}
