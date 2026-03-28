"use client"

import type { Profile } from "@/types"
import { cn } from "@/lib/utils"
import {
  TrendingUp,
  Target,
  Flame,
  DollarSign,
  Award,
  Zap,
  Crown,
  Star,
} from "lucide-react"

interface Achievement {
  id: string
  icon: React.ReactNode
  label: string
  description: string
  earned: boolean
}

const getAchievements = (profile: Profile, marketsCreated: number): Achievement[] => [
  {
    id: "first_trade",
    icon: <TrendingUp className="h-4 w-4" />,
    label: "First Trade",
    description: "Made your first trade",
    earned: profile.total_trades >= 1,
  },
  {
    id: "trader",
    icon: <Zap className="h-4 w-4" />,
    label: "Active Trader",
    description: "Made 10+ trades",
    earned: profile.total_trades >= 10,
  },
  {
    id: "whale",
    icon: <DollarSign className="h-4 w-4" />,
    label: "Whale",
    description: "Made 100+ trades",
    earned: profile.total_trades >= 100,
  },
  {
    id: "oracle",
    icon: <Target className="h-4 w-4" />,
    label: "Oracle",
    description: "10+ correct predictions",
    earned: profile.correct_predictions >= 10,
  },
  {
    id: "streak_3",
    icon: <Flame className="h-4 w-4" />,
    label: "On Fire",
    description: "3+ prediction streak",
    earned: profile.best_streak >= 3,
  },
  {
    id: "streak_10",
    icon: <Crown className="h-4 w-4" />,
    label: "Unstoppable",
    description: "10+ prediction streak",
    earned: profile.best_streak >= 10,
  },
  {
    id: "creator",
    icon: <Star className="h-4 w-4" />,
    label: "Market Maker",
    description: "Created your first market",
    earned: marketsCreated >= 1,
  },
  {
    id: "prolific",
    icon: <Award className="h-4 w-4" />,
    label: "Prolific Creator",
    description: "Created 5+ markets",
    earned: marketsCreated >= 5,
  },
]

export const Achievements = ({
  profile,
  marketsCreated,
}: {
  profile: Profile
  marketsCreated: number
}) => {
  const achievements = getAchievements(profile, marketsCreated)
  const earned = achievements.filter((a) => a.earned)

  if (earned.length === 0) return null

  return (
    <div className="space-y-2">
      <h2 className="text-sm font-semibold text-muted-foreground">Achievements</h2>
      <div className="flex flex-wrap gap-2">
        {achievements.map((a) => (
          <div
            key={a.id}
            className={cn(
              "flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs transition-colors",
              a.earned
                ? "border-primary/30 bg-primary/10 text-primary"
                : "border-border/50 text-muted-foreground/40"
            )}
            title={a.description}
          >
            {a.icon}
            {a.label}
          </div>
        ))}
      </div>
    </div>
  )
}
