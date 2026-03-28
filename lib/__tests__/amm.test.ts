import { describe, it, expect } from "vitest"
import { price, tradeCost, priceAfterTrade, estimateShares, priceImpact, maxLoss } from "../amm"

const B = 100 // default liquidity parameter

describe("price", () => {
  it("sums to 1 (yes + no)", () => {
    const p = price(0, 0, B)
    expect(p.yes + p.no).toBeCloseTo(1, 10)
  })

  it("returns 50/50 when shares are equal", () => {
    const p = price(0, 0, B)
    expect(p.yes).toBeCloseTo(0.5, 10)
    expect(p.no).toBeCloseTo(0.5, 10)
  })

  it("sums to 1 with asymmetric shares", () => {
    const p = price(200, 50, B)
    expect(p.yes + p.no).toBeCloseTo(1, 10)
  })

  it("yes price increases when yes shares increase", () => {
    const before = price(100, 100, B)
    const after = price(150, 100, B)
    expect(after.yes).toBeGreaterThan(before.yes)
  })

  it("no price increases when no shares increase", () => {
    const before = price(100, 100, B)
    const after = price(100, 150, B)
    expect(after.no).toBeGreaterThan(before.no)
  })

  it("is symmetric: swapping shares swaps prices", () => {
    const p = price(120, 80, B)
    const swapped = price(80, 120, B)
    expect(p.yes).toBeCloseTo(swapped.no, 10)
    expect(p.no).toBeCloseTo(swapped.yes, 10)
  })

  it("stays valid at extreme values (numerical stability)", () => {
    const p = price(10000, 0, B)
    expect(p.yes + p.no).toBeCloseTo(1, 10)
    expect(p.yes).toBeCloseTo(1, 5)
    expect(p.no).toBeCloseTo(0, 5)
  })

  it("stays valid with negative extreme (numerical stability)", () => {
    const p = price(-5000, 5000, B)
    expect(p.yes + p.no).toBeCloseTo(1, 10)
    expect(p.yes).toBeCloseTo(0, 5)
    expect(p.no).toBeCloseTo(1, 5)
  })
})

describe("tradeCost", () => {
  it("is positive for buying yes", () => {
    const cost = tradeCost(0, 0, B, "yes", "buy", 10)
    expect(cost).toBeGreaterThan(0)
  })

  it("is positive for buying no", () => {
    const cost = tradeCost(0, 0, B, "no", "buy", 10)
    expect(cost).toBeGreaterThan(0)
  })

  it("is negative for selling yes", () => {
    const cost = tradeCost(100, 50, B, "yes", "sell", 10)
    expect(cost).toBeLessThan(0)
  })

  it("is negative for selling no", () => {
    const cost = tradeCost(50, 100, B, "no", "sell", 10)
    expect(cost).toBeLessThan(0)
  })

  it("buying then selling the same amount returns close to zero cost", () => {
    const buyCost = tradeCost(0, 0, B, "yes", "buy", 50)
    const sellCost = tradeCost(50, 0, B, "yes", "sell", 50)
    expect(buyCost + sellCost).toBeCloseTo(0, 10)
  })

  it("cost increases with amount (convexity)", () => {
    const cost10 = tradeCost(0, 0, B, "yes", "buy", 10)
    const cost20 = tradeCost(0, 0, B, "yes", "buy", 20)
    expect(cost20).toBeGreaterThan(cost10 * 2 - 0.001) // convex: 20 shares cost more than 2x 10 shares
  })

  it("cost at 50/50 is the same for yes and no", () => {
    const yesCost = tradeCost(0, 0, B, "yes", "buy", 10)
    const noCost = tradeCost(0, 0, B, "no", "buy", 10)
    expect(yesCost).toBeCloseTo(noCost, 10)
  })

  it("buying yes is cheaper when yes price is low", () => {
    const cheapYes = tradeCost(0, 200, B, "yes", "buy", 10)
    const expensiveYes = tradeCost(200, 0, B, "yes", "buy", 10)
    expect(cheapYes).toBeLessThan(expensiveYes)
  })
})

describe("priceAfterTrade", () => {
  it("buying yes increases yes price", () => {
    const before = price(100, 100, B)
    const after = priceAfterTrade(100, 100, B, "yes", "buy", 20)
    expect(after.yes).toBeGreaterThan(before.yes)
  })

  it("buying no increases no price", () => {
    const before = price(100, 100, B)
    const after = priceAfterTrade(100, 100, B, "no", "buy", 20)
    expect(after.no).toBeGreaterThan(before.no)
  })

  it("selling yes decreases yes price", () => {
    const before = price(100, 50, B)
    const after = priceAfterTrade(100, 50, B, "yes", "sell", 20)
    expect(after.yes).toBeLessThan(before.yes)
  })

  it("prices still sum to 1 after trade", () => {
    const after = priceAfterTrade(100, 80, B, "yes", "buy", 50)
    expect(after.yes + after.no).toBeCloseTo(1, 10)
  })
})

describe("estimateShares", () => {
  it("estimated shares cost approximately the budget", () => {
    const budget = 50
    const shares = estimateShares(0, 0, B, "yes", budget)
    const actualCost = tradeCost(0, 0, B, "yes", "buy", shares)
    expect(actualCost).toBeLessThanOrEqual(budget)
    expect(actualCost).toBeGreaterThan(budget * 0.999)
  })

  it("more budget buys more shares", () => {
    const shares50 = estimateShares(0, 0, B, "yes", 50)
    const shares100 = estimateShares(0, 0, B, "yes", 100)
    expect(shares100).toBeGreaterThan(shares50)
  })

  it("cheaper side gets more shares for same budget", () => {
    const yesCheap = estimateShares(0, 200, B, "yes", 50)
    const yesExpensive = estimateShares(200, 0, B, "yes", 50)
    expect(yesCheap).toBeGreaterThan(yesExpensive)
  })

  it("returns a non-negative number", () => {
    const shares = estimateShares(0, 0, B, "yes", 10)
    expect(shares).toBeGreaterThanOrEqual(0)
  })

  it("works with small budgets", () => {
    const shares = estimateShares(0, 0, B, "yes", 1)
    const actualCost = tradeCost(0, 0, B, "yes", "buy", shares)
    expect(actualCost).toBeLessThanOrEqual(1)
    expect(actualCost).toBeGreaterThan(0.99)
  })

  it("works with large budgets", () => {
    const shares = estimateShares(0, 0, B, "yes", 5000)
    const actualCost = tradeCost(0, 0, B, "yes", "buy", shares)
    expect(actualCost).toBeLessThanOrEqual(5000)
    expect(actualCost).toBeGreaterThan(4999)
  })
})

describe("priceImpact", () => {
  it("is non-negative", () => {
    const impact = priceImpact(0, 0, B, "yes", "buy", 10)
    expect(impact).toBeGreaterThanOrEqual(0)
  })

  it("larger trades have more impact", () => {
    const small = priceImpact(0, 0, B, "yes", "buy", 5)
    const large = priceImpact(0, 0, B, "yes", "buy", 50)
    expect(large).toBeGreaterThan(small)
  })

  it("impact is 0 for 0 shares", () => {
    const impact = priceImpact(0, 0, B, "yes", "buy", 0)
    expect(impact).toBeCloseTo(0, 10)
  })
})

describe("maxLoss", () => {
  it("equals b * ln(2)", () => {
    expect(maxLoss(B)).toBeCloseTo(100 * Math.log(2), 10)
  })

  it("scales linearly with b", () => {
    expect(maxLoss(200)).toBeCloseTo(2 * maxLoss(100), 10)
  })

  it("is positive", () => {
    expect(maxLoss(B)).toBeGreaterThan(0)
  })
})
