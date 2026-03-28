"use client"

import { useEffect, useRef, useState } from "react"
import { cn } from "@/lib/utils"

interface AnimatedNumberProps {
  value: number
  duration?: number
  className?: string
  formatter?: (value: number) => string
}

export const AnimatedNumber = ({
  value,
  duration = 500,
  className,
  formatter = (v) => v.toString(),
}: AnimatedNumberProps) => {
  const [display, setDisplay] = useState(value)
  const prevValue = useRef(value)

  useEffect(() => {
    const start = prevValue.current
    const diff = value - start
    if (Math.abs(diff) < 0.01) {
      setDisplay(value)
      prevValue.current = value
      return
    }

    const startTime = performance.now()

    const animate = (time: number) => {
      const elapsed = time - startTime
      const progress = Math.min(elapsed / duration, 1)
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplay(start + diff * eased)

      if (progress < 1) {
        requestAnimationFrame(animate)
      } else {
        prevValue.current = value
      }
    }

    requestAnimationFrame(animate)
  }, [value, duration])

  return <span className={cn("tabular-nums", className)}>{formatter(display)}</span>
}
