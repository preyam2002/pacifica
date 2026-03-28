"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { createClient } from "@/lib/supabase/client"
import { useAuth } from "@/components/providers"
import { useRealtime } from "@/lib/hooks/use-realtime"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import type { Comment } from "@/types"
import { formatDistanceToNow } from "date-fns"
import { Loader2, MessageSquare, Trash2 } from "lucide-react"
import { CommentReactions } from "@/components/comment-reactions"

export const CommentSection = ({ marketId }: { marketId: string }) => {
  const { user } = useAuth()
  const [comments, setComments] = useState<Comment[]>([])
  const [content, setContent] = useState("")
  const [loading, setLoading] = useState(false)

  const fetchComments = useCallback(async () => {
    const supabase = createClient()
    const { data } = await supabase
      .from("comments")
      .select("*, user:profiles(*)")
      .eq("market_id", marketId)
      .order("created_at", { ascending: false })
      .limit(50)
    setComments(data ?? [])
  }, [marketId])

  useEffect(() => {
    fetchComments()
  }, [fetchComments])

  // Auto-refresh when new comments are inserted or deleted by other users
  const fetchRef = useRef(fetchComments)
  fetchRef.current = fetchComments
  useRealtime({
    table: "comments",
    filter: `market_id=eq.${marketId}`,
    onPayload: () => fetchRef.current(),
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !content.trim()) return
    setLoading(true)
    const supabase = createClient()
    await supabase.from("comments").insert({
      user_id: user.id,
      market_id: marketId,
      content: content.trim(),
    })
    setContent("")
    setLoading(false)
    fetchComments()
  }

  const handleDelete = async (id: string) => {
    const supabase = createClient()
    await supabase.from("comments").delete().eq("id", id)
    fetchComments()
  }

  return (
    <div className="space-y-4">
      <h3 className="flex items-center gap-2 text-sm font-semibold">
        <MessageSquare className="h-4 w-4 text-muted-foreground" />
        Comments
        <span className="rounded-full bg-secondary px-2 py-0.5 font-mono text-[10px] text-muted-foreground">
          {comments.length}
        </span>
      </h3>

      {user && (
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Textarea
            placeholder="Share your take..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={2}
            className="flex-1"
            maxLength={2000}
          />
          <Button type="submit" size="sm" disabled={loading || !content.trim()}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Post"}
          </Button>
        </form>
      )}

      <div className="space-y-3">
        {comments.map((comment) => (
          <div key={comment.id} className="flex gap-3">
            <Avatar className="h-7 w-7 shrink-0">
              <AvatarImage src={comment.user?.avatar_url ?? undefined} />
              <AvatarFallback className="text-[10px]">
                {comment.user?.username?.slice(0, 2).toUpperCase() ?? "??"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium">@{comment.user?.username}</span>
                <span className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                </span>
                {user?.id === comment.user_id && (
                  <button
                    onClick={() => handleDelete(comment.id)}
                    className="ml-auto text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                )}
              </div>
              <p className="text-sm text-foreground/90">{comment.content}</p>
              <CommentReactions commentId={comment.id} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
