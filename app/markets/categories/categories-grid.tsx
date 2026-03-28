"use client"

import Link from "next/link"
import { CATEGORIES } from "@/lib/constants"
import { ArrowLeft, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

const categoryColors: Record<string, string> = {
  politics: "from-[oklch(0.55_0.15_30)] to-[oklch(0.4_0.12_30)]",
  sports: "from-[oklch(0.55_0.15_145)] to-[oklch(0.4_0.12_145)]",
  tech: "from-[oklch(0.55_0.15_250)] to-[oklch(0.4_0.12_250)]",
  crypto: "from-[oklch(0.6_0.17_60)] to-[oklch(0.45_0.14_60)]",
  entertainment: "from-[oklch(0.55_0.18_320)] to-[oklch(0.4_0.15_320)]",
  science: "from-[oklch(0.55_0.12_200)] to-[oklch(0.4_0.1_200)]",
  economics: "from-[oklch(0.55_0.14_160)] to-[oklch(0.4_0.11_160)]",
  custom: "from-[oklch(0.55_0.1_185)] to-[oklch(0.4_0.08_185)]",
}

interface CategoriesGridProps {
  counts: Record<string, { count: number; volume: number }>
}

export const CategoriesGrid = ({ counts }: CategoriesGridProps) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/markets">
          <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="font-heading text-3xl font-bold tracking-tight">Categories</h1>
          <p className="text-sm text-muted-foreground">Browse markets by topic</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {CATEGORIES.map((cat, i) => {
          const stats = counts[cat.value] ?? { count: 0, volume: 0 }
          return (
            <motion.div
              key={cat.value}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            >
              <Link href={`/markets?category=${cat.value}`}>
                <div
                  className={cn(
                    "group relative overflow-hidden rounded-2xl bg-gradient-to-br p-6 transition-all hover:scale-[1.02] hover:shadow-xl",
                    categoryColors[cat.value] ?? categoryColors.custom
                  )}
                >
                  <div className="absolute inset-0 bg-black/10 transition-colors group-hover:bg-black/5" />
                  <div className="relative space-y-4">
                    <span className="text-4xl">{cat.emoji}</span>
                    <div>
                      <h2 className="font-heading text-lg font-bold text-white">
                        {cat.label}
                      </h2>
                      <div className="mt-1 flex items-center gap-3 text-sm text-white/70">
                        <span className="font-mono">{stats.count} open</span>
                        {stats.volume > 0 && (
                          <span className="font-mono">${stats.volume.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                        )}
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-white/40 transition-transform group-hover:translate-x-1 group-hover:text-white/70" />
                  </div>
                </div>
              </Link>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
