"use client"

import { useState, useEffect, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import { useAuth } from "@/components/providers"
import { cn } from "@/lib/utils"

const EMOJIS = ["👍", "🔥", "🤔", "💯", "😂", "❤️"] as const

interface Reaction {
  emoji: string
  count: number
  reacted: boolean
}

export const CommentReactions = ({ commentId }: { commentId: string }) => {
  const { user } = useAuth()
  const [reactions, setReactions] = useState<Reaction[]>([])
  const [showPicker, setShowPicker] = useState(false)

  const fetchReactions = useCallback(async () => {
    const supabase = createClient()
    const { data } = await supabase
      .from("comment_reactions")
      .select("emoji, user_id")
      .eq("comment_id", commentId)

    if (!data) return

    const counts = new Map<string, { count: number; reacted: boolean }>()
    for (const r of data) {
      const existing = counts.get(r.emoji) ?? { count: 0, reacted: false }
      existing.count++
      if (r.user_id === user?.id) existing.reacted = true
      counts.set(r.emoji, existing)
    }

    setReactions(
      Array.from(counts.entries())
        .map(([emoji, { count, reacted }]) => ({ emoji, count, reacted }))
        .sort((a, b) => b.count - a.count)
    )
  }, [commentId, user?.id])

  useEffect(() => {
    fetchReactions()
  }, [fetchReactions])

  const toggleReaction = async (emoji: string) => {
    if (!user) return
    const supabase = createClient()
    const existing = reactions.find((r) => r.emoji === emoji && r.reacted)

    if (existing) {
      await supabase
        .from("comment_reactions")
        .delete()
        .eq("comment_id", commentId)
        .eq("user_id", user.id)
        .eq("emoji", emoji)
    } else {
      await supabase.from("comment_reactions").insert({
        comment_id: commentId,
        user_id: user.id,
        emoji,
      })
    }
    setShowPicker(false)
    fetchReactions()
  }

  return (
    <div className="flex items-center gap-1 flex-wrap">
      {reactions.map((r) => (
        <button
          key={r.emoji}
          onClick={() => toggleReaction(r.emoji)}
          className={cn(
            "inline-flex items-center gap-1 rounded-full border px-1.5 py-0.5 text-[11px] transition-colors",
            r.reacted
              ? "border-primary/30 bg-primary/10 text-foreground"
              : "border-border/40 bg-secondary/30 text-muted-foreground hover:border-primary/20"
          )}
        >
          <span>{r.emoji}</span>
          <span className="font-mono text-[10px]">{r.count}</span>
        </button>
      ))}
      {user && (
        <div className="relative">
          <button
            onClick={() => setShowPicker(!showPicker)}
            className="flex h-5 w-5 items-center justify-center rounded-full border border-border/30 bg-secondary/20 text-[10px] text-muted-foreground transition-colors hover:border-primary/20 hover:text-foreground"
          >
            +
          </button>
          {showPicker && (
            <div className="absolute bottom-full left-0 z-10 mb-1 flex gap-0.5 rounded-lg border border-border/40 bg-popover p-1 shadow-xl">
              {EMOJIS.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => toggleReaction(emoji)}
                  className="flex h-7 w-7 items-center justify-center rounded-md text-sm transition-colors hover:bg-accent"
                >
                  {emoji}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
