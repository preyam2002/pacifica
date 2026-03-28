"use client"

import { useState, useEffect, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import { useAuth } from "@/components/providers"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Bell, TrendingUp, MessageSquare } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import Link from "next/link"
import { cn } from "@/lib/utils"

interface Activity {
  id: string
  type: "trade" | "comment"
  market_id: string
  market_question: string
  actor_username: string
  detail: string
  created_at: string
}

export const ActivityFeed = () => {
  const { user } = useAuth()
  const [activities, setActivities] = useState<Activity[]>([])
  const [unread, setUnread] = useState(0)
  const [open, setOpen] = useState(false)

  const fetchActivity = useCallback(async () => {
    if (!user) return
    const supabase = createClient()

    // Get recent trades on markets the user created
    const { data: trades } = await supabase
      .from("trades")
      .select("id, market_id, side, action, shares, created_at, user:profiles(username), market:markets!inner(question, creator_id)")
      .eq("market.creator_id", user.id)
      .neq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(10)

    // Get recent comments on markets the user created
    const { data: comments } = await supabase
      .from("comments")
      .select("id, market_id, content, created_at, user:profiles(username), market:markets!inner(question, creator_id)")
      .eq("market.creator_id", user.id)
      .neq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(10)

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
        detail: c.content.length > 60 ? c.content.slice(0, 60) + "..." : c.content,
        created_at: c.created_at,
      })),
    ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 15)

    setActivities(all)
    setUnread(all.length)
  }, [user])

  useEffect(() => {
    fetchActivity()
  }, [fetchActivity])

  if (!user) return null

  return (
    <DropdownMenu
      open={open}
      onOpenChange={(o) => {
        setOpen(o)
        if (o) setUnread(0)
      }}
    >
      <DropdownMenuTrigger
        render={
          <button className="relative flex h-8 w-8 items-center justify-center rounded-full hover:bg-accent" />
        }
      >
        <Bell className="h-4 w-4" />
        {unread > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-no text-[10px] font-bold text-white">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[min(20rem,calc(100vw-2rem))] max-h-96 overflow-y-auto">
        <div className="flex items-center justify-between px-3 py-2">
          <span className="text-sm font-semibold">Activity</span>
          <Link href="/activity" onClick={() => setOpen(false)} className="text-[10px] font-medium text-primary hover:underline">
            View all
          </Link>
        </div>
        {activities.length === 0 ? (
          <div className="px-3 py-6 text-center text-sm text-muted-foreground">
            No activity yet. Create a market to see trades and comments here.
          </div>
        ) : (
          activities.map((a) => (
            <Link key={a.id} href={`/markets/${a.market_id}`} onClick={() => setOpen(false)}>
              <div className="flex items-start gap-3 px-3 py-2.5 hover:bg-accent rounded-md transition-colors">
                <div className="mt-0.5">
                  {a.type === "trade" ? (
                    <TrendingUp className="h-4 w-4 text-primary" />
                  ) : (
                    <MessageSquare className="h-4 w-4 text-chart-4" />
                  )}
                </div>
                <div className="flex-1 space-y-0.5">
                  <p className="text-xs">
                    <span className="font-medium">@{a.actor_username}</span>{" "}
                    {a.type === "trade" ? a.detail : `commented: "${a.detail}"`}
                  </p>
                  <p className="text-xs text-muted-foreground line-clamp-1">
                    {a.market_question}
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    {formatDistanceToNow(new Date(a.created_at), { addSuffix: true })}
                  </p>
                </div>
              </div>
            </Link>
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
