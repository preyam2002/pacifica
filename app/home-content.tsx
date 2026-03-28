"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { MarketCard } from "@/components/market-card"
import { EmptyState } from "@/components/empty-state"
import { Waves, TrendingUp, Sparkles, Clock, Plus, ArrowRight, Users, BarChart3 } from "lucide-react"
import type { Market } from "@/types"
import { useAuth } from "@/components/providers"
import { WelcomeModal } from "@/components/welcome-modal"
import { SearchBar } from "@/components/search-bar"
import { DailyBonus } from "@/components/daily-bonus"
import { useProbChanges } from "@/lib/hooks/use-prob-changes"
import { useMarketSparklines } from "@/lib/hooks/use-market-sparklines"
import { motion } from "framer-motion"
import { useMemo } from "react"

interface HomeContentProps {
  trending: Market[]
  newest: Market[]
  closingSoon: Market[]
  stats: { totalMarkets: number; totalUsers: number; totalVolume: number }
}

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
}

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as const } },
}

const MarketSection = ({
  title,
  icon,
  markets,
  href,
  delay = 0,
  probChanges = {},
  sparklines = {},
}: {
  title: string
  icon: React.ReactNode
  markets: Market[]
  href: string
  delay?: number
  probChanges?: Record<string, number>
  sparklines?: Record<string, number[]>
}) => (
  <motion.section
    initial="hidden"
    whileInView="show"
    viewport={{ once: true, margin: "-60px" }}
    variants={stagger}
    className="space-y-5"
  >
    <motion.div variants={fadeUp} className="flex items-center justify-between">
      <h2 className="flex items-center gap-2.5 font-heading text-xl font-bold tracking-tight">
        {icon}
        {title}
      </h2>
      <Link href={href}>
        <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary">
          View all
          <ArrowRight className="ml-1 h-4 w-4" />
        </Button>
      </Link>
    </motion.div>
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {markets.map((market, i) => (
        <motion.div key={market.id} variants={fadeUp}>
          <MarketCard market={market} probChange={probChanges[market.id]} sparkline={sparklines?.[market.id]} />
        </motion.div>
      ))}
    </div>
  </motion.section>
)

export const HomeContent = ({ trending, newest, closingSoon, stats }: HomeContentProps) => {
  const { user } = useAuth()
  const hasMarkets = trending.length > 0 || newest.length > 0

  const allMarketIds = useMemo(() => {
    const ids = new Set<string>()
    for (const m of [...trending, ...newest, ...closingSoon]) ids.add(m.id)
    return Array.from(ids)
  }, [trending, newest, closingSoon])
  const probChanges = useProbChanges(allMarketIds)
  const sparklines = useMarketSparklines(allMarketIds)

  return (
    <div className="space-y-14">
      <WelcomeModal />
      <DailyBonus />

      {/* Hero with mesh gradient atmosphere */}
      <motion.section
        initial="hidden"
        animate="show"
        variants={stagger}
        className="relative overflow-hidden rounded-3xl py-16 text-center md:py-20"
      >
        {/* Animated mesh background */}
        <div className="hero-mesh absolute inset-0 -z-10 rounded-3xl" />
        <div className="absolute inset-0 -z-10 rounded-3xl bg-gradient-to-b from-transparent via-background/30 to-background/80" />

        <div className="relative space-y-6 px-4">
          <motion.div variants={fadeUp} className="float mx-auto flex h-20 w-20 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10">
            <Waves className="h-10 w-10 text-primary" />
          </motion.div>

          <motion.h1
            variants={fadeUp}
            className="font-heading text-4xl font-extrabold leading-tight tracking-tight md:text-5xl lg:text-6xl"
          >
            Predict the future.
            <br />
            <span className="bg-gradient-to-r from-primary via-yes to-primary bg-clip-text text-transparent">
              No money required.
            </span>
          </motion.h1>

          <motion.p
            variants={fadeUp}
            className="mx-auto max-w-lg text-base text-muted-foreground md:text-lg"
          >
            Create markets, trade with play money, and see if you can beat the real-money odds
            from Polymarket & Kalshi.
          </motion.p>

          <motion.div variants={fadeUp}>
            <SearchBar className="mx-auto max-w-md" />
          </motion.div>

          <motion.div variants={fadeUp} className="flex items-center justify-center gap-3">
            <Link href="/markets">
              <Button size="lg" className="glow-primary font-semibold">
                Browse Markets
              </Button>
            </Link>
            {user && (
              <Link href="/markets/create">
                <Button size="lg" variant="outline" className="border-primary/20 text-primary hover:bg-primary/10">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Market
                </Button>
              </Link>
            )}
          </motion.div>

          {(stats.totalMarkets > 0 || stats.totalUsers > 0) && (
            <motion.div
              variants={fadeUp}
              className="flex items-center justify-center gap-8 pt-2"
            >
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                  <BarChart3 className="h-4 w-4 text-primary" />
                </div>
                <div className="text-left">
                  <span className="block font-mono text-lg font-bold text-foreground">{stats.totalMarkets}</span>
                  <span className="text-xs">markets</span>
                </div>
              </div>
              <div className="h-8 w-px bg-border" />
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-yes/10">
                  <Users className="h-4 w-4 text-yes" />
                </div>
                <div className="text-left">
                  <span className="block font-mono text-lg font-bold text-foreground">{stats.totalUsers}</span>
                  <span className="text-xs">traders</span>
                </div>
              </div>
              {stats.totalVolume > 0 && (
                <>
                  <div className="h-8 w-px bg-border" />
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-chart-4/10">
                      <TrendingUp className="h-4 w-4 text-chart-4" />
                    </div>
                    <div className="text-left">
                      <span className="block font-mono text-lg font-bold text-foreground">
                        ${stats.totalVolume >= 1000 ? `${(stats.totalVolume / 1000).toFixed(1)}k` : stats.totalVolume.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                      </span>
                      <span className="text-xs">volume</span>
                    </div>
                  </div>
                </>
              )}
            </motion.div>
          )}
        </div>
      </motion.section>

      {!hasMarkets ? (
        <EmptyState
          icon={<TrendingUp className="h-8 w-8" />}
          title="No markets yet"
          description="Be the first to create a prediction market and start trading!"
          action={
            <Link href="/markets/create">
              <Button className="glow-primary">
                <Plus className="mr-2 h-4 w-4" />
                Create a Market
              </Button>
            </Link>
          }
        />
      ) : (
        <>
          {trending.length > 0 && (
            <MarketSection
              title="Trending"
              icon={<TrendingUp className="h-5 w-5 text-primary" />}
              markets={trending}
              href="/markets?sort=trending"
              probChanges={probChanges}
              sparklines={sparklines}
            />
          )}
          {closingSoon.length > 0 && (
            <MarketSection
              title="Closing Soon"
              icon={<Clock className="h-5 w-5 text-no" />}
              markets={closingSoon}
              href="/markets?sort=closing_soon"
              delay={0.1}
              probChanges={probChanges}
              sparklines={sparklines}
            />
          )}
          {newest.length > 0 && (
            <MarketSection
              title="Just Created"
              icon={<Sparkles className="h-5 w-5 text-yes" />}
              markets={newest}
              href="/markets?sort=newest"
              delay={0.2}
              probChanges={probChanges}
              sparklines={sparklines}
            />
          )}
        </>
      )}
    </div>
  )
}
