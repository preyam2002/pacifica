"use client"

import { useMemo } from "react"
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { MarketHistoryPoint } from "@/types"
import { format } from "date-fns"

interface PriceChartProps {
  history: MarketHistoryPoint[]
  currentProbability: number
}

export const PriceChart = ({ history, currentProbability }: PriceChartProps) => {
  const data = useMemo(() => {
    const points = history.map((h) => ({
      time: new Date(h.recorded_at).getTime(),
      probability: Math.round(h.probability * 100),
    }))
    points.push({
      time: Date.now(),
      probability: Math.round(currentProbability * 100),
    })
    return points.sort((a, b) => a.time - b.time)
  }, [history, currentProbability])

  if (data.length < 2) {
    return (
      <Card className="border-border/40 bg-card/80">
        <CardContent className="flex h-48 items-center justify-center text-sm text-muted-foreground">
          Chart will appear after the first trade
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-border/40 bg-card/80 overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Price History
        </CardTitle>
      </CardHeader>
      <CardContent className="pr-2">
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={data}>
            <defs>
              <linearGradient id="probGlow" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="oklch(0.78 0.155 185)" stopOpacity={0.25} />
                <stop offset="50%" stopColor="oklch(0.78 0.155 185)" stopOpacity={0.08} />
                <stop offset="100%" stopColor="oklch(0.78 0.155 185)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="time"
              tickFormatter={(t) => format(new Date(t), "MMM d")}
              tick={{ fontSize: 10, fill: "oklch(0.60 0.015 230)", fontFamily: "monospace" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              domain={[0, 100]}
              tickFormatter={(v) => `${v}%`}
              tick={{ fontSize: 10, fill: "oklch(0.60 0.015 230)", fontFamily: "monospace" }}
              axisLine={false}
              tickLine={false}
              width={36}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "oklch(0.14 0.025 235 / 0.9)",
                backdropFilter: "blur(12px)",
                border: "1px solid oklch(0.30 0.02 235 / 0.5)",
                borderRadius: "10px",
                fontSize: 12,
                fontFamily: "monospace",
                boxShadow: "0 8px 32px oklch(0 0 0 / 0.4)",
              }}
              labelFormatter={(t) => format(new Date(t), "MMM d, HH:mm")}
              formatter={(value) => [`${value}%`, "Yes"]}
            />
            <Area
              type="monotone"
              dataKey="probability"
              stroke="oklch(0.78 0.155 185)"
              strokeWidth={2}
              fill="url(#probGlow)"
              dot={false}
              activeDot={{
                r: 4,
                fill: "oklch(0.78 0.155 185)",
                stroke: "oklch(0.78 0.155 185 / 0.4)",
                strokeWidth: 6,
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
