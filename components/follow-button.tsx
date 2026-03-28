"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { useAuth } from "@/components/providers"
import { Bookmark } from "lucide-react"
import { cn } from "@/lib/utils"

export const FollowButton = ({
  marketId,
  className,
}: {
  marketId: string
  className?: string
}) => {
  const { user } = useAuth()
  const [following, setFollowing] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!user) return
    const supabase = createClient()
    supabase
      .from("market_follows")
      .select("id")
      .eq("user_id", user.id)
      .eq("market_id", marketId)
      .single()
      .then(({ data }) => setFollowing(!!data))
  }, [user, marketId])

  const toggle = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!user || loading) return
    setLoading(true)
    const supabase = createClient()

    if (following) {
      await supabase
        .from("market_follows")
        .delete()
        .eq("user_id", user.id)
        .eq("market_id", marketId)
      setFollowing(false)
    } else {
      await supabase
        .from("market_follows")
        .insert({ user_id: user.id, market_id: marketId })
      setFollowing(true)
    }
    setLoading(false)
  }

  if (!user) return null

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className={cn(
        "flex items-center justify-center rounded-lg p-1.5 transition-colors",
        following
          ? "text-primary"
          : "text-muted-foreground/40 hover:text-muted-foreground",
        className
      )}
      title={following ? "Unfollow" : "Follow"}
    >
      <Bookmark
        className={cn("h-4 w-4 transition-all", following && "fill-primary")}
      />
    </button>
  )
}
