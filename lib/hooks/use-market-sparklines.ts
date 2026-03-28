"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"

export const useMarketSparklines = (marketIds: string[]) => {
  const [sparklines, setSparklines] = useState<Record<string, number[]>>({})

  useEffect(() => {
    if (marketIds.length === 0) return

    const supabase = createClient()
    // Fetch recent history for all markets in one query
    supabase
      .from("market_history")
      .select("market_id, probability, recorded_at")
      .in("market_id", marketIds)
      .order("recorded_at", { ascending: true })
      .limit(marketIds.length * 50) // ~50 points per market max
      .then(({ data }) => {
        if (!data) return
        const grouped = new Map<string, number[]>()
        for (const row of data) {
          const arr = grouped.get(row.market_id) ?? []
          arr.push(row.probability)
          grouped.set(row.market_id, arr)
        }
        // Downsample each to ~12 points
        const result: Record<string, number[]> = {}
        for (const [id, probs] of grouped) {
          if (probs.length <= 12) {
            result[id] = probs
          } else {
            const step = Math.floor(probs.length / 12)
            const sampled = probs.filter((_, i) => i % step === 0)
            if (sampled[sampled.length - 1] !== probs[probs.length - 1]) {
              sampled.push(probs[probs.length - 1])
            }
            result[id] = sampled
          }
        }
        setSparklines(result)
      })
  }, [marketIds.join(",")])

  return sparklines
}
