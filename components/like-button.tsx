"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { useAuth } from "@/components/providers"
import { Button } from "@/components/ui/button"
import { Heart } from "lucide-react"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"

export const LikeButton = ({
  marketId,
  initialCount,
}: {
  marketId: string
  initialCount: number
}) => {
  const { user } = useAuth()
  const [liked, setLiked] = useState(false)
  const [count, setCount] = useState(initialCount)
  const [animating, setAnimating] = useState(false)

  useEffect(() => {
    if (!user) return
    const supabase = createClient()
    supabase
      .from("likes")
      .select("user_id")
      .eq("user_id", user.id)
      .eq("market_id", marketId)
      .single()
      .then(({ data }) => setLiked(!!data))
  }, [user, marketId])

  const handleToggle = async () => {
    if (!user) return
    const supabase = createClient()

    if (liked) {
      setLiked(false)
      setCount((c) => c - 1)
      await supabase.from("likes").delete().eq("user_id", user.id).eq("market_id", marketId)
    } else {
      setLiked(true)
      setCount((c) => c + 1)
      setAnimating(true)
      setTimeout(() => setAnimating(false), 300)
      await supabase.from("likes").insert({ user_id: user.id, market_id: marketId })
    }
  }

  return (
    <Button
      variant="outline"
      size="sm"
      className={cn("gap-1.5", liked && "border-no/30 text-no")}
      onClick={handleToggle}
      disabled={!user}
    >
      <motion.div animate={animating ? { scale: [1, 1.3, 1] } : {}} transition={{ duration: 0.3 }}>
        <Heart className={cn("h-3.5 w-3.5", liked && "fill-current")} />
      </motion.div>
      {count}
    </Button>
  )
}
