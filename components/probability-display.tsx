"use client"

import { cn } from "@/lib/utils"
import { motion } from "framer-motion"
import { AnimatedNumber } from "@/components/animated-number"

interface ProbabilityDisplayProps {
  probability: number
  size?: "sm" | "md" | "lg"
  showBar?: boolean
  syncProbability?: number | null
  syncSource?: string | null
}

export const ProbabilityDisplay = ({
  probability,
  size = "md",
  showBar = true,
  syncProbability,
  syncSource,
}: ProbabilityDisplayProps) => {
  const pct = probability * 100
  const isYesFavored = probability >= 0.5

  return (
    <div className="space-y-2.5">
      <div className="flex items-baseline gap-2">
        <span
          className={cn(
            "font-mono font-bold tracking-tight",
            isYesFavored ? "text-yes" : "text-no",
            size === "sm" && "text-xl",
            size === "md" && "text-3xl",
            size === "lg" && "text-5xl"
          )}
        >
          <AnimatedNumber
            value={pct}
            formatter={(v) => `${Math.round(v)}%`}
          />
        </span>
        <span className={cn(
          "font-medium uppercase tracking-wider",
          isYesFavored ? "text-yes/60" : "text-no/60",
          size === "lg" ? "text-sm" : "text-[10px]",
        )}>
          Yes
        </span>
      </div>
      {showBar && (
        <div className={cn(
          "relative w-full overflow-hidden rounded-full bg-muted/60",
          size === "lg" ? "h-3" : size === "md" ? "h-2" : "h-1.5",
        )}>
          <motion.div
            className={cn(
              "h-full rounded-full",
              isYesFavored ? "prob-bar-yes" : "prob-bar-no",
            )}
            initial={{ width: 0 }}
            animate={{ width: `${Math.max(Math.round(pct), 2)}%` }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          />
          {/* Sync probability marker */}
          {syncProbability != null && (
            <motion.div
              className="absolute top-0 h-full w-0.5 bg-foreground/40"
              initial={{ left: 0, opacity: 0 }}
              animate={{ left: `${Math.round(syncProbability * 100)}%`, opacity: 1 }}
              transition={{ duration: 0.7, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
              title={`${syncSource}: ${Math.round(syncProbability * 100)}%`}
            />
          )}
        </div>
      )}
      {syncProbability != null && syncSource && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="font-mono font-medium text-foreground/70">{Math.round(syncProbability * 100)}%</span>
          <span>on {syncSource === "polymarket" ? "Polymarket" : "Kalshi"}</span>
        </div>
      )}
    </div>
  )
}
