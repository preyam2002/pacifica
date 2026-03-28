"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"

export const useProbChanges = (marketIds: string[]) => {
  const [changes, setChanges] = useState<Record<string, number>>({})

  useEffect(() => {
    if (marketIds.length === 0) return
    const supabase = createClient()
    supabase
      .rpc("get_prob_changes", { p_market_ids: marketIds })
      .then(({ data }) => {
        if (!data) return
        const map: Record<string, number> = {}
        for (const row of data as { market_id: string; prob_change: number }[]) {
          map[row.market_id] = row.prob_change
        }
        setChanges(map)
      })
  }, [marketIds.join(",")])

  return changes
}
