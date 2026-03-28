"use client"

import { useState } from "react"
import { useRealtime } from "./use-realtime"
import type { Trade } from "@/types"

export const useLiveTrades = (marketId: string, initialTrades: Trade[]) => {
  const [trades, setTrades] = useState(initialTrades)

  useRealtime<Trade & { [key: string]: any }>({
    table: "trades",
    event: "INSERT",
    filter: `market_id=eq.${marketId}`,
    onPayload: (payload) => {
      if (payload.new && typeof payload.new === "object" && "id" in payload.new) {
        setTrades((prev) => [payload.new as Trade, ...prev].slice(0, 20))
      }
    },
  })

  return { trades, setTrades }
}
