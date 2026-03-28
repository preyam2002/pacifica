"use client"

import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"

interface CountdownProps {
  targetDate: string
  className?: string
  compact?: boolean
}

const pad = (n: number) => String(n).padStart(2, "0")

export const Countdown = ({ targetDate, className, compact = false }: CountdownProps) => {
  const [remaining, setRemaining] = useState(() => calcRemaining(targetDate))

  useEffect(() => {
    const interval = setInterval(() => {
      setRemaining(calcRemaining(targetDate))
    }, 1000)
    return () => clearInterval(interval)
  }, [targetDate])

  if (remaining.total <= 0) return null

  if (compact) {
    if (remaining.days > 0) {
      return (
        <span className={cn("font-mono text-no", className)}>
          {remaining.days}d {pad(remaining.hours)}h
        </span>
      )
    }
    return (
      <span className={cn("font-mono text-no", className)}>
        {pad(remaining.hours)}:{pad(remaining.minutes)}:{pad(remaining.seconds)}
      </span>
    )
  }

  return (
    <div className={cn("flex items-center gap-1.5", className)}>
      {remaining.days > 0 && (
        <TimeUnit value={remaining.days} label="d" />
      )}
      <TimeUnit value={remaining.hours} label="h" />
      <TimeUnit value={remaining.minutes} label="m" />
      {remaining.days === 0 && (
        <TimeUnit value={remaining.seconds} label="s" />
      )}
    </div>
  )
}

const TimeUnit = ({ value, label }: { value: number; label: string }) => (
  <div className="flex items-baseline gap-0.5">
    <span className="font-mono text-sm font-bold tabular-nums text-no">{pad(value)}</span>
    <span className="text-[10px] text-muted-foreground">{label}</span>
  </div>
)

const calcRemaining = (target: string) => {
  const diff = new Date(target).getTime() - Date.now()
  if (diff <= 0) return { total: 0, days: 0, hours: 0, minutes: 0, seconds: 0 }
  return {
    total: diff,
    days: Math.floor(diff / 86_400_000),
    hours: Math.floor((diff % 86_400_000) / 3_600_000),
    minutes: Math.floor((diff % 3_600_000) / 60_000),
    seconds: Math.floor((diff % 60_000) / 1_000),
  }
}
