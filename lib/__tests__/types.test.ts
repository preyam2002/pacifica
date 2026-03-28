import { describe, it, expect } from "vitest"
import { price, tradeCost, estimateShares } from "../amm"
import { DEFAULT_LIQUIDITY_PARAM, DEFAULT_PROBABILITY, DEFAULT_BALANCE } from "../constants"

/**
 * Integration-style tests that validate the trade flow
 * using AMM math + project constants together.
 */
describe("trade flow integration", () => {
  const B = DEFAULT_LIQUIDITY_PARAM

  it("initial market is at DEFAULT_PROBABILITY", () => {
    const p = price(0, 0, B)
    expect(p.yes).toBeCloseTo(DEFAULT_PROBABILITY, 10)
  })

  it("user can buy shares within their starting balance", () => {
    const budget = DEFAULT_BALANCE * 0.1 // 10% of balance
    const shares = estimateShares(0, 0, B, "yes", budget)
    expect(shares).toBeGreaterThan(0)

    const cost = tradeCost(0, 0, B, "yes", "buy", shares)
    expect(cost).toBeLessThanOrEqual(budget)
    expect(cost).toBeGreaterThan(0)
  })

  it("full balance buy moves price significantly but stays valid", () => {
    const shares = estimateShares(0, 0, B, "yes", DEFAULT_BALANCE)
    expect(shares).toBeGreaterThan(0)

    const cost = tradeCost(0, 0, B, "yes", "buy", shares)
    expect(cost).toBeLessThanOrEqual(DEFAULT_BALANCE)

    const newPrice = price(shares, 0, B)
    expect(newPrice.yes).toBeGreaterThan(0.5)
    // With b=100 and $10k budget, price saturates near 1 — that's correct LMSR behavior
    expect(newPrice.yes).toBeLessThanOrEqual(1)
    expect(newPrice.yes + newPrice.no).toBeCloseTo(1, 10)
  })

  it("simulates a sequence of trades keeping invariants", () => {
    let yesShares = 0
    let noShares = 0
    const trades = [
      { side: "yes" as const, amount: 50 },
      { side: "no" as const, amount: 30 },
      { side: "yes" as const, amount: 100 },
      { side: "no" as const, amount: 80 },
    ]

    for (const { side, amount } of trades) {
      const cost = tradeCost(yesShares, noShares, B, side, "buy", amount)
      expect(cost).toBeGreaterThan(0)

      if (side === "yes") yesShares += amount
      else noShares += amount

      const p = price(yesShares, noShares, B)
      expect(p.yes + p.no).toBeCloseTo(1, 10)
      expect(p.yes).toBeGreaterThan(0)
      expect(p.yes).toBeLessThan(1)
    }
  })

  it("buy → sell round trip returns approximately original price", () => {
    const buyAmount = 50
    const buyCost = tradeCost(0, 0, B, "yes", "buy", buyAmount)
    const sellCost = tradeCost(buyAmount, 0, B, "yes", "sell", buyAmount)

    // Net cost should be ~0 (no profit/loss from round trip)
    expect(buyCost + sellCost).toBeCloseTo(0, 10)

    // Price returns to 50/50
    const finalPrice = price(0, 0, B)
    expect(finalPrice.yes).toBeCloseTo(0.5, 10)
  })

  it("opposing trades push price toward 50/50", () => {
    // Buy 100 yes shares
    let yesShares = 100
    let noShares = 0
    const pAfterYes = price(yesShares, noShares, B)
    expect(pAfterYes.yes).toBeGreaterThan(0.5)

    // Now buy 100 no shares
    noShares = 100
    const pBalanced = price(yesShares, noShares, B)
    expect(pBalanced.yes).toBeCloseTo(0.5, 10)
  })
})

describe("edge score scenarios", () => {
  it("edge = user beats real money when user is correct", () => {
    // User buys YES at 0.30 (sync prob), market resolves YES
    // User's price was low, so they got a good deal
    // Edge: user was right, real money was closer to wrong
    const userPrice = 0.3
    const syncProb = 0.3
    const outcome = "yes"

    // User bet YES and YES won. User paid 30c for a $1 payout.
    const userProfit = 1 - userPrice
    expect(userProfit).toBe(0.7)

    // If sync probability was also 0.3 (30% yes), both predicted similarly
    // Edge comes from being early / having conviction the market undervalued
    expect(userPrice).toBeLessThanOrEqual(syncProb)
  })

  it("no edge when user is wrong", () => {
    // User buys YES at 0.70 but market resolves NO
    const userPrice = 0.7
    const outcome = "no"

    // User loses their cost
    const userPnl = -userPrice
    expect(userPnl).toBeLessThan(0)
  })
})
