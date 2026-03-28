/**
 * LMSR (Logarithmic Market Scoring Rule) implementation.
 *
 * C(q) = b * ln(e^(q_yes/b) + e^(q_no/b))
 * P_yes = e^(q_yes/b) / (e^(q_yes/b) + e^(q_no/b))
 *
 * Uses log-sum-exp trick for numerical stability:
 * C(q) = b * (m/b + ln(e^((q_yes-m)/b) + e^((q_no-m)/b)))
 * where m = max(q_yes, q_no)
 */

import type { TradeSide, TradeAction } from "@/types"

const costFunction = (yesShares: number, noShares: number, b: number): number => {
  const m = Math.max(yesShares, noShares)
  return b * (m / b + Math.log(Math.exp((yesShares - m) / b) + Math.exp((noShares - m) / b)))
}

export const price = (
  yesShares: number,
  noShares: number,
  b: number
): { yes: number; no: number } => {
  const m = Math.max(yesShares, noShares)
  const expYes = Math.exp((yesShares - m) / b)
  const expNo = Math.exp((noShares - m) / b)
  const sum = expYes + expNo
  return { yes: expYes / sum, no: expNo / sum }
}

export const tradeCost = (
  yesShares: number,
  noShares: number,
  b: number,
  side: TradeSide,
  action: TradeAction,
  amount: number
): number => {
  let newYes = yesShares
  let newNo = noShares

  if (action === "buy") {
    if (side === "yes") newYes += amount
    else newNo += amount
  } else {
    if (side === "yes") newYes -= amount
    else newNo -= amount
  }

  return costFunction(newYes, newNo, b) - costFunction(yesShares, noShares, b)
}

export const priceAfterTrade = (
  yesShares: number,
  noShares: number,
  b: number,
  side: TradeSide,
  action: TradeAction,
  amount: number
): { yes: number; no: number } => {
  let newYes = yesShares
  let newNo = noShares

  if (action === "buy") {
    if (side === "yes") newYes += amount
    else newNo += amount
  } else {
    if (side === "yes") newYes -= amount
    else newNo -= amount
  }

  return price(newYes, newNo, b)
}

/** Given a budget, estimate how many shares you can buy */
export const estimateShares = (
  yesShares: number,
  noShares: number,
  b: number,
  side: TradeSide,
  budget: number
): number => {
  // Binary search for the number of shares that costs exactly `budget`
  let lo = 0
  let hi = budget * 10 // Upper bound: at minimum price
  for (let i = 0; i < 100; i++) {
    const mid = (lo + hi) / 2
    const cost = tradeCost(yesShares, noShares, b, side, "buy", mid)
    if (cost < budget) lo = mid
    else hi = mid
  }
  return Math.floor(lo * 10000) / 10000
}

export const priceImpact = (
  yesShares: number,
  noShares: number,
  b: number,
  side: TradeSide,
  action: TradeAction,
  amount: number
): number => {
  const current = price(yesShares, noShares, b)
  const after = priceAfterTrade(yesShares, noShares, b, side, action, amount)
  return Math.abs(after[side] - current[side])
}

/** Maximum possible loss for the market maker */
export const maxLoss = (b: number): number => b * Math.log(2)
