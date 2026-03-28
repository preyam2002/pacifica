import { ImageResponse } from "next/og"
import { createClient } from "@/lib/supabase/server"

export const dynamic = "force-dynamic"

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()
  const { data: market } = await supabase
    .from("markets")
    .select("question, probability, category, total_volume, trades_count, status, outcome")
    .eq("id", id)
    .single()

  if (!market) {
    return new Response("Not found", { status: 404 })
  }

  const prob = Math.round(market.probability * 100)
  const isResolved = market.status === "resolved"

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "60px",
          background: "linear-gradient(135deg, #0d1117 0%, #0f1a2e 50%, #0d1117 100%)",
          color: "white",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        {/* Top: Branding */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <span style={{ fontSize: "24px", fontWeight: 700, color: "#5eead4" }}>
            Pacifica
          </span>
          <span style={{ fontSize: "16px", color: "#888", marginLeft: "auto" }}>
            Play-Money Prediction Market
          </span>
        </div>

        {/* Middle: Question + Probability */}
        <div style={{ display: "flex", flexDirection: "column", gap: "30px" }}>
          <div
            style={{
              fontSize: market.question.length > 80 ? "36px" : "44px",
              fontWeight: 700,
              lineHeight: 1.2,
              maxWidth: "90%",
            }}
          >
            {market.question}
          </div>

          {/* Probability bar */}
          <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <span
                style={{
                  fontSize: "72px",
                  fontWeight: 800,
                  color: isResolved
                    ? market.outcome === "yes"
                      ? "#22c55e"
                      : "#ef4444"
                    : prob >= 50
                      ? "#22c55e"
                      : "#ef4444",
                  fontFamily: "monospace",
                }}
              >
                {isResolved ? (market.outcome === "yes" ? "YES" : "NO") : `${prob}%`}
              </span>
              {!isResolved && (
                <span style={{ fontSize: "18px", color: "#888" }}>chance of Yes</span>
              )}
              {isResolved && (
                <span style={{ fontSize: "18px", color: "#888" }}>Resolved</span>
              )}
            </div>

            {!isResolved && (
              <div
                style={{
                  flex: 1,
                  height: "16px",
                  borderRadius: "8px",
                  background: "#1e293b",
                  overflow: "hidden",
                  display: "flex",
                }}
              >
                <div
                  style={{
                    width: `${prob}%`,
                    height: "100%",
                    borderRadius: "8px",
                    background: `linear-gradient(90deg, #22c55e, ${prob >= 50 ? "#22c55e" : "#ef4444"})`,
                  }}
                />
              </div>
            )}
          </div>
        </div>

        {/* Bottom: Stats */}
        <div style={{ display: "flex", gap: "40px", fontSize: "18px", color: "#888" }}>
          <span>
            ${market.total_volume.toLocaleString()} volume
          </span>
          <span>{market.trades_count} trades</span>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  )
}
