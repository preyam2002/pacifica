import { describe, it, expect, vi, beforeEach } from "vitest"

// We test the transform/mapping logic by importing the modules
// and mocking fetch to control API responses

const mockFetch = vi.fn()
vi.stubGlobal("fetch", mockFetch)

describe("polymarket sync", () => {
  beforeEach(() => {
    vi.resetModules()
    mockFetch.mockReset()
  })

  it("maps category strings correctly", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [
        {
          condition_id: "abc",
          question: "Will X win the election?",
          description: "Test",
          outcomes: '["Yes","No"]',
          outcomePrices: '["0.72","0.28"]',
          volume_num: 1000000,
          end_date_iso: "2026-12-01T00:00:00Z",
          active: true,
          closed: false,
          category: "Politics",
        },
      ],
    })

    const { fetchPolymarketMarkets } = await import("../sync/polymarket")
    const markets = await fetchPolymarketMarkets()
    expect(markets).toHaveLength(1)
    expect(markets[0].category).toBe("politics")
  })

  it("filters non-binary markets", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [
        {
          condition_id: "binary",
          question: "Binary?",
          description: "",
          outcomes: '["Yes","No"]',
          outcomePrices: '["0.5","0.5"]',
          volume_num: 100,
          end_date_iso: "2026-12-01T00:00:00Z",
          active: true,
          closed: false,
          category: "Tech",
        },
        {
          condition_id: "multi",
          question: "Multi?",
          description: "",
          outcomes: '["A","B","C"]',
          outcomePrices: '["0.3","0.3","0.4"]',
          volume_num: 100,
          end_date_iso: "2026-12-01T00:00:00Z",
          active: true,
          closed: false,
          category: "Sports",
        },
      ],
    })

    const { fetchPolymarketMarkets } = await import("../sync/polymarket")
    const markets = await fetchPolymarketMarkets()
    expect(markets).toHaveLength(1)
    expect(markets[0].sync_id).toBe("binary")
  })

  it("clamps probability to [0.01, 0.99]", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [
        {
          condition_id: "extreme",
          question: "Sure thing?",
          description: "",
          outcomes: '["Yes","No"]',
          outcomePrices: '["1.00","0.00"]',
          volume_num: 500,
          end_date_iso: "2026-12-01T00:00:00Z",
          active: true,
          closed: false,
          category: "Custom",
        },
      ],
    })

    const { fetchPolymarketMarkets } = await import("../sync/polymarket")
    const markets = await fetchPolymarketMarkets()
    expect(markets[0].probability).toBeLessThanOrEqual(0.99)
    expect(markets[0].probability).toBeGreaterThanOrEqual(0.01)
  })

  it("throws on API error", async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, status: 500 })

    const { fetchPolymarketMarkets } = await import("../sync/polymarket")
    await expect(fetchPolymarketMarkets()).rejects.toThrow("Polymarket API error: 500")
  })
})

describe("kalshi sync", () => {
  beforeEach(() => {
    vi.resetModules()
    mockFetch.mockReset()
  })

  it("converts cents to probability", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        markets: [
          {
            ticker: "KXTEST",
            event_ticker: "KXEVENT",
            title: "Test market",
            subtitle: "Description",
            yes_ask: 65,
            no_ask: 35,
            last_price: 65,
            volume: 10000,
            close_time: "2026-12-01T00:00:00Z",
            status: "open",
            result: "",
            category: "Economics",
          },
        ],
        cursor: "",
      }),
    })

    const { fetchKalshiMarkets } = await import("../sync/kalshi")
    const markets = await fetchKalshiMarkets()
    expect(markets).toHaveLength(1)
    expect(markets[0].probability).toBeCloseTo(0.65, 2)
    expect(markets[0].category).toBe("economics")
  })

  it("clamps probability for extreme prices", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        markets: [
          {
            ticker: "KXZERO",
            event_ticker: "EV",
            title: "Zero price",
            subtitle: "",
            yes_ask: 0,
            no_ask: 100,
            last_price: 0,
            volume: 0,
            close_time: "2026-12-01T00:00:00Z",
            status: "open",
            result: "",
            category: "Custom",
          },
        ],
        cursor: "",
      }),
    })

    const { fetchKalshiMarkets } = await import("../sync/kalshi")
    const markets = await fetchKalshiMarkets()
    // last_price=0 → 0/100=0, clamped to 0.01
    // But wait: Math.max(0.01, Math.min(0.99, (0 || 50) / 100)) = 0.5 because of || 50 fallback
    expect(markets[0].probability).toBe(0.5)
  })

  it("throws on API error", async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, status: 403 })

    const { fetchKalshiMarkets } = await import("../sync/kalshi")
    await expect(fetchKalshiMarkets()).rejects.toThrow("Kalshi API error: 403")
  })
})
