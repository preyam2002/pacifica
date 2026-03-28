"use client"

import { useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import type { RealtimePostgresChangesPayload } from "@supabase/supabase-js"

type Table = "markets" | "trades" | "positions" | "comments"
type Event = "INSERT" | "UPDATE" | "DELETE" | "*"

interface UseRealtimeOptions<T extends { [key: string]: any }> {
  table: Table
  event?: Event
  filter?: string
  onPayload: (payload: RealtimePostgresChangesPayload<T>) => void
}

export const useRealtime = <T extends { [key: string]: any }>({
  table,
  event = "*",
  filter,
  onPayload,
}: UseRealtimeOptions<T>) => {
  useEffect(() => {
    const supabase = createClient()

    const channelConfig: Record<string, string> = {
      event,
      schema: "public",
      table,
    }
    if (filter) channelConfig.filter = filter

    const channel = supabase
      .channel(`realtime:${table}:${filter ?? "all"}`)
      .on(
        "postgres_changes" as any,
        channelConfig,
        (payload: RealtimePostgresChangesPayload<T>) => {
          onPayload(payload)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [table, event, filter])
}
