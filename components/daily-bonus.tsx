"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { useAuth } from "@/components/providers"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Gift, Flame, X } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"

export const DailyBonus = () => {
  const { user, profile, refreshProfile } = useAuth()
  const [canClaim, setCanClaim] = useState(false)
  const [claiming, setClaiming] = useState(false)
  const [result, setResult] = useState<{ bonus: number; streak: number; multiplier: number } | null>(null)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    if (!profile) return
    if (!profile.last_daily_bonus) {
      setCanClaim(true)
      return
    }
    const lastClaim = new Date(profile.last_daily_bonus)
    const today = new Date()
    setCanClaim(
      lastClaim.toDateString() !== today.toDateString()
    )
  }, [profile])

  const handleClaim = async () => {
    if (!user || claiming) return
    setClaiming(true)
    const supabase = createClient()
    const { data } = await supabase.rpc("claim_daily_bonus", { p_user_id: user.id })
    if (data?.success) {
      setResult({ bonus: data.bonus, streak: data.streak, multiplier: data.multiplier })
      setCanClaim(false)
      await refreshProfile()
    }
    setClaiming(false)
  }

  if (!user || !canClaim || dismissed) return null

  return (
    <AnimatePresence>
      {!result ? (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, height: 0 }}
        >
          <Card className="relative overflow-hidden border-chart-4/20 bg-chart-4/5">
            <div className="absolute inset-0 bg-gradient-to-r from-chart-4/5 via-transparent to-chart-4/5 btn-shimmer" />
            <CardContent className="relative flex items-center gap-3 p-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-chart-4/20 bg-chart-4/10">
                <Gift className="h-5 w-5 text-chart-4" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold">Daily Bonus Available</p>
                <p className="text-xs text-muted-foreground">
                  Claim your free play money{profile?.daily_streak ? ` (${profile.daily_streak} day streak)` : ""}
                </p>
              </div>
              <Button size="sm" onClick={handleClaim} disabled={claiming} className="shrink-0">
                {claiming ? "..." : "Claim"}
              </Button>
              <button onClick={() => setDismissed(true)} className="text-muted-foreground hover:text-foreground">
                <X className="h-4 w-4" />
              </button>
            </CardContent>
          </Card>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, height: 0 }}
        >
          <Card className="border-yes/20 bg-yes/5">
            <CardContent className="flex items-center gap-3 p-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-yes/10">
                <Gift className="h-5 w-5 text-yes" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-yes">
                  +${result.bonus} claimed!
                </p>
                <p className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Flame className={cn("h-3 w-3", result.streak >= 3 && "text-chart-4")} />
                  {result.streak} day streak ({result.multiplier.toFixed(1)}x multiplier)
                </p>
              </div>
              <button onClick={() => setDismissed(true)} className="text-muted-foreground hover:text-foreground">
                <X className="h-4 w-4" />
              </button>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
