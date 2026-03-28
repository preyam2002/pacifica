"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"

export const useRank = (userId: string | undefined) => {
  const [rank, setRank] = useState<number | null>(null)

  useEffect(() => {
    if (!userId) return
    const supabase = createClient()
    // Count profiles with higher balance = rank
    supabase
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .then(async ({ count: total }) => {
        // Get user's balance
        const { data: user } = await supabase
          .from("profiles")
          .select("balance")
          .eq("id", userId)
          .single()
        if (!user) return
        // Count how many have higher balance
        const { count } = await supabase
          .from("profiles")
          .select("id", { count: "exact", head: true })
          .gt("balance", user.balance)
        setRank((count ?? 0) + 1)
      })
  }, [userId])

  return rank
}
