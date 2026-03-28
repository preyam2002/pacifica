"use client"

import { motion, AnimatePresence } from "framer-motion"
import { Check, X } from "lucide-react"
import { cn } from "@/lib/utils"

interface TradeToastProps {
  show: boolean
  side: "yes" | "no"
  action: "buy" | "sell"
  shares: number
  cost: number
  onClose: () => void
}

export const TradeToast = ({ show, side, action, shares, cost, onClose }: TradeToastProps) => (
  <AnimatePresence>
    {show && (
      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.95 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
        className={cn(
          "glass fixed bottom-24 left-1/2 z-[100] -translate-x-1/2 rounded-xl px-5 py-3.5 shadow-2xl md:bottom-8",
          side === "yes" ? "glow-yes" : "glow-no"
        )}
      >
        <div className="flex items-center gap-3">
          <div className={cn(
            "flex h-7 w-7 items-center justify-center rounded-full",
            side === "yes" ? "bg-yes" : "bg-no"
          )}>
            <Check className="h-4 w-4 text-white" />
          </div>
          <div className="font-mono text-sm font-medium">
            {action === "buy" ? "Bought" : "Sold"}{" "}
            <span className="font-bold">{shares.toFixed(1)}</span>{" "}
            <span className={side === "yes" ? "text-yes" : "text-no"}>{side.toUpperCase()}</span>
            {" "}for{" "}
            <span className="font-bold">${Math.abs(cost).toFixed(2)}</span>
          </div>
          <button onClick={onClose} className="ml-2 rounded-full p-1 opacity-40 transition-opacity hover:opacity-100">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </motion.div>
    )}
  </AnimatePresence>
)
