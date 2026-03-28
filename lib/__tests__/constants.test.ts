import { describe, it, expect } from "vitest"
import {
  DEFAULT_BALANCE,
  DEFAULT_LIQUIDITY_PARAM,
  DEFAULT_PROBABILITY,
  CATEGORIES,
  SYNC_INTERVAL_MS,
} from "../constants"
import type { MarketCategory } from "@/types"

describe("constants", () => {
  it("DEFAULT_BALANCE is 10,000", () => {
    expect(DEFAULT_BALANCE).toBe(10_000)
  })

  it("DEFAULT_LIQUIDITY_PARAM is positive", () => {
    expect(DEFAULT_LIQUIDITY_PARAM).toBeGreaterThan(0)
  })

  it("DEFAULT_PROBABILITY is 0.5", () => {
    expect(DEFAULT_PROBABILITY).toBe(0.5)
  })

  it("SYNC_INTERVAL_MS is 15 minutes", () => {
    expect(SYNC_INTERVAL_MS).toBe(15 * 60 * 1000)
  })
})

describe("CATEGORIES", () => {
  it("has 8 categories", () => {
    expect(CATEGORIES).toHaveLength(8)
  })

  it("every category has value, label, and emoji", () => {
    for (const cat of CATEGORIES) {
      expect(cat.value).toBeTruthy()
      expect(cat.label).toBeTruthy()
      expect(cat.emoji).toBeTruthy()
    }
  })

  it("category values are unique", () => {
    const values = CATEGORIES.map((c) => c.value)
    expect(new Set(values).size).toBe(values.length)
  })

  it("includes all MarketCategory union members", () => {
    const expected: MarketCategory[] = [
      "politics", "sports", "tech", "crypto",
      "entertainment", "science", "economics", "custom",
    ]
    const values = CATEGORIES.map((c) => c.value)
    for (const cat of expected) {
      expect(values).toContain(cat)
    }
  })

  it("labels start with uppercase", () => {
    for (const cat of CATEGORIES) {
      expect(cat.label[0]).toBe(cat.label[0].toUpperCase())
    }
  })
})
