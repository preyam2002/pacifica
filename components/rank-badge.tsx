"use client"

import { cn } from "@/lib/utils"

interface RankBadgeProps {
  rank: number
  size?: "sm" | "md"
  className?: string
}

export const RankBadge = ({ rank, size = "sm", className }: RankBadgeProps) => {
  const isTop3 = rank <= 3
  const colorMap: Record<number, string> = {
    1: "bg-[oklch(0.85_0.16_85/0.15)] text-[oklch(0.85_0.16_85)] border-[oklch(0.85_0.16_85/0.3)]",
    2: "bg-[oklch(0.78_0.02_260/0.15)] text-[oklch(0.78_0.02_260)] border-[oklch(0.78_0.02_260/0.3)]",
    3: "bg-[oklch(0.68_0.12_55/0.15)] text-[oklch(0.68_0.12_55)] border-[oklch(0.68_0.12_55/0.3)]",
  }

  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded-full border font-mono font-bold",
        size === "sm" ? "h-5 min-w-5 px-1 text-[10px]" : "h-6 min-w-6 px-1.5 text-xs",
        isTop3
          ? colorMap[rank]
          : "bg-secondary/50 text-muted-foreground border-border/50",
        className
      )}
    >
      #{rank}
    </span>
  )
}
