"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/components/providers"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Waves, DollarSign, TrendingUp, Trophy } from "lucide-react"
import Link from "next/link"

export const WelcomeModal = () => {
  const { profile } = useAuth()
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (profile && profile.total_trades === 0) {
      const dismissed = localStorage.getItem("pacifica_welcome_dismissed")
      if (!dismissed) setOpen(true)
    }
  }, [profile])

  const handleDismiss = () => {
    localStorage.setItem("pacifica_welcome_dismissed", "1")
    setOpen(false)
  }

  const features = [
    {
      icon: <DollarSign className="h-5 w-5 text-yes" />,
      bg: "bg-yes/10 border-yes/20",
      title: "$10,000 Play Money",
      desc: "You start with $10k. Trade on markets to grow your portfolio.",
    },
    {
      icon: <TrendingUp className="h-5 w-5 text-primary" />,
      bg: "bg-primary/10 border-primary/20",
      title: "Real Market Odds",
      desc: "Synced markets show live odds from Polymarket & Kalshi. Can you beat them?",
    },
    {
      icon: <Trophy className="h-5 w-5 text-chart-4" />,
      bg: "bg-chart-4/10 border-chart-4/20",
      title: "Compete & Climb",
      desc: "Track your accuracy, build streaks, and climb the leaderboard.",
    },
  ]

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) handleDismiss() }}>
      <DialogContent className="overflow-hidden sm:max-w-md">
        {/* Decorative mesh glow */}
        <div className="hero-mesh absolute inset-0 -z-10 opacity-50" />

        <DialogHeader className="text-center">
          <div className="float mx-auto mb-4 flex h-18 w-18 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10">
            <Waves className="h-9 w-9 text-primary" />
          </div>
          <DialogTitle className="font-heading text-2xl font-bold">Welcome to Pacifica</DialogTitle>
          <DialogDescription className="text-base">
            Your play-money prediction market is ready.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3 py-4">
          {features.map((f) => (
            <div key={f.title} className="flex items-start gap-3">
              <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${f.bg}`}>
                {f.icon}
              </div>
              <div>
                <p className="text-sm font-semibold">{f.title}</p>
                <p className="text-xs text-muted-foreground">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
        <Link href="/markets" onClick={handleDismiss}>
          <Button className="w-full glow-primary font-semibold">Start Exploring Markets</Button>
        </Link>
      </DialogContent>
    </Dialog>
  )
}
