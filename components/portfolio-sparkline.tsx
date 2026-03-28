"use client"

import { useState, useEffect, useMemo } from "react"
import { createClient } from "@/lib/supabase/client"
import { AreaChart, Area, ResponsiveContainer } from "recharts"

interface PortfolioSparklineProps {
  userId: string
  currentValue: number
}

export const PortfolioSparkline = ({ userId, currentValue }: PortfolioSparklineProps) => {
  const [trades, setTrades] = useState<{ cost: number; created_at: string; action: string }[]>([])

  useEffect(() => {
    const supabase = createClient()
    supabase
      .from("trades")
      .select("cost, created_at, action")
      .eq("user_id", userId)
      .order("created_at", { ascending: true })
      .limit(200)
      .then(({ data }) => setTrades(data ?? []))
  }, [userId])

  const data = useMemo(() => {
    if (trades.length < 2) return null

    // Build a synthetic portfolio value series
    // Start at 10000 (initial balance) and track net cash flow from trades
    let balance = 10000
    const points: { t: number; v: number }[] = [{ t: new Date(trades[0].created_at).getTime(), v: balance }]

    for (const trade of trades) {
      // Buys decrease balance (cost > 0), sells increase it (cost < 0)
      balance -= trade.cost
      points.push({ t: new Date(trade.created_at).getTime(), v: Math.round(balance) })
    }

    // Add current value as last point
    points.push({ t: Date.now(), v: Math.round(currentValue) })

    // Downsample to ~20 points for sparkline
    if (points.length > 20) {
      const step = Math.floor(points.length / 20)
      const sampled = points.filter((_, i) => i % step === 0)
      if (sampled[sampled.length - 1] !== points[points.length - 1]) {
        sampled.push(points[points.length - 1])
      }
      return sampled
    }

    return points
  }, [trades, currentValue])

  if (!data) return null

  const isUp = data[data.length - 1].v >= data[0].v
  const color = isUp ? "oklch(0.72 0.18 155)" : "oklch(0.65 0.20 25)"

  return (
    <div className="h-12 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="sparkGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.3} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area
            type="monotone"
            dataKey="v"
            stroke={color}
            strokeWidth={1.5}
            fill="url(#sparkGrad)"
            dot={false}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
