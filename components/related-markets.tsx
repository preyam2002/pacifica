"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { Market, MarketCategory } from "@/types"
import { CATEGORIES } from "@/lib/constants"
import Link from "next/link"
import { cn } from "@/lib/utils"

export const RelatedMarkets = ({
  marketId,
  category,
}: {
  marketId: string
  category: MarketCategory
}) => {
  const [markets, setMarkets] = useState<Market[]>([])

  useEffect(() => {
    const supabase = createClient()
    supabase
      .from("markets")
      .select("id, question, probability, category, status, trades_count")
      .eq("category", category)
      .eq("status", "open")
      .neq("id", marketId)
      .order("trades_count", { ascending: false })
      .limit(4)
      .then(({ data }) => setMarkets((data as Market[]) ?? []))
  }, [marketId, category])

  if (markets.length === 0) return null

  const cat = CATEGORIES.find((c) => c.value === category)

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold">
        More in {cat?.emoji} {cat?.label}
      </h3>
      <div className="grid gap-2 sm:grid-cols-2">
        {markets.map((m) => (
          <Link key={m.id} href={`/markets/${m.id}`}>
            <Card className="cursor-pointer transition-colors hover:border-primary/30">
              <CardContent className="p-3">
                <p className="text-sm line-clamp-2">{m.question}</p>
                <div className="mt-2 flex items-center justify-between">
                  <span
                    className={cn(
                      "font-mono text-xs font-semibold",
                      m.probability >= 0.5 ? "text-yes" : "text-no"
                    )}
                  >
                    {Math.round(m.probability * 100)}%
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {m.trades_count} trades
                  </span>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
