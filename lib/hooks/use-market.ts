"use client"

import { useState, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRealtime } from "./use-realtime"
import type { Market } from "@/types"

export const useMarket = (initialMarket: Market) => {
  const [market, setMarket] = useState(initialMarket)

  useRealtime<Market & { [key: string]: any }>({
    table: "markets",
    event: "UPDATE",
    filter: `id=eq.${initialMarket.id}`,
    onPayload: (payload) => {
      if (payload.new && typeof payload.new === "object" && "id" in payload.new) {
        setMarket((prev) => ({ ...prev, ...(payload.new as Market) }))
      }
    },
  })

  const refresh = useCallback(async () => {
    const supabase = createClient()
    const { data } = await supabase
      .from("markets")
      .select("*, creator:profiles(*)")
      .eq("id", initialMarket.id)
      .single()
    if (data) setMarket(data)
  }, [initialMarket.id])

  return { market, refresh, setMarket }
}
