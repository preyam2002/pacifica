"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { useAuth } from "@/components/providers"
import type { Market, Position } from "@/types"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { CheckCircle, XCircle, Trophy, PartyPopper } from "lucide-react"

interface ResolutionBannerProps {
  market: Market
  position: Position | null
}

export const ResolutionBanner = ({ market, position }: ResolutionBannerProps) => {
  if (market.status !== "resolved" || !market.outcome) return null

  const isYes = market.outcome === "yes"
  const userWon = position && (
    (isYes && position.yes_shares > 0) ||
    (!isYes && position.no_shares > 0)
  )
  const userLost = position && (
    (isYes && position.no_shares > 0 && position.yes_shares === 0) ||
    (!isYes && position.yes_shares > 0 && position.no_shares === 0)
  )
  const winningShares = position
    ? isYes ? position.yes_shares : position.no_shares
    : 0
  const payout = winningShares // $1 per winning share

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] as const }}
      className={cn(
        "relative overflow-hidden rounded-2xl border p-6",
        isYes
          ? "border-yes/30 bg-yes/5"
          : "border-no/30 bg-no/5"
      )}
    >
      {/* Radial glow */}
      <div
        className="absolute inset-0 -z-10 opacity-20"
        style={{
          background: `radial-gradient(ellipse 60% 80% at 50% 0%, ${isYes ? "oklch(0.74 0.20 155)" : "oklch(0.68 0.22 22)"}, transparent)`,
        }}
      />

      {/* Floating particles for winners */}
      {userWon && (
        <div className="absolute inset-0 -z-10 overflow-hidden">
          {Array.from({ length: 12 }).map((_, i) => (
            <motion.div
              key={i}
              className={cn(
                "absolute h-1.5 w-1.5 rounded-full",
                isYes ? "bg-yes/40" : "bg-no/40"
              )}
              initial={{
                x: `${20 + Math.random() * 60}%`,
                y: "100%",
                opacity: 0,
              }}
              animate={{
                y: `${-20 - Math.random() * 30}%`,
                opacity: [0, 0.8, 0],
              }}
              transition={{
                duration: 2 + Math.random() * 2,
                delay: Math.random() * 1.5,
                repeat: Infinity,
                repeatDelay: Math.random() * 3,
              }}
            />
          ))}
        </div>
      )}

      <div className="flex items-start gap-4">
        <div className={cn(
          "flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border",
          isYes ? "border-yes/30 bg-yes/10" : "border-no/30 bg-no/10"
        )}>
          {isYes ? (
            <CheckCircle className="h-7 w-7 text-yes" />
          ) : (
            <XCircle className="h-7 w-7 text-no" />
          )}
        </div>

        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <span className={cn(
              "font-heading text-2xl font-bold",
              isYes ? "text-yes" : "text-no"
            )}>
              Resolved {market.outcome.toUpperCase()}
            </span>
          </div>

          <p className="text-sm text-muted-foreground">
            This market has been resolved. {isYes ? "Yes" : "No"} shareholders received $1 per share.
          </p>

          {userWon && payout > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex items-center gap-2 pt-1"
            >
              <PartyPopper className="h-5 w-5 text-chart-4" />
              <span className="font-heading text-lg font-bold text-chart-4">
                You won ${payout.toFixed(2)}!
              </span>
            </motion.div>
          )}

          {userLost && (
            <p className="text-sm text-muted-foreground/70 pt-1">
              Your position expired worthless. Better luck next time.
            </p>
          )}
        </div>
      </div>
    </motion.div>
  )
}
