"use client"

import { useMemo } from "react"

interface MiniSparklineProps {
  data: number[]
  width?: number
  height?: number
  className?: string
}

export const MiniSparkline = ({ data, width = 80, height = 24, className }: MiniSparklineProps) => {
  const path = useMemo(() => {
    if (data.length < 2) return ""
    const min = Math.min(...data)
    const max = Math.max(...data)
    const range = max - min || 0.01
    const pad = 1

    const points = data.map((v, i) => ({
      x: pad + (i / (data.length - 1)) * (width - pad * 2),
      y: pad + (1 - (v - min) / range) * (height - pad * 2),
    }))

    return points.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ")
  }, [data, width, height])

  if (data.length < 2) return null

  const isUp = data[data.length - 1] >= data[0]

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className={className}
      fill="none"
    >
      <path
        d={path}
        stroke={isUp ? "oklch(0.74 0.20 155 / 0.6)" : "oklch(0.68 0.22 22 / 0.6)"}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
