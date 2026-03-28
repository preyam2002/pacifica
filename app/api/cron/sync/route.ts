import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization")
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const baseUrl = new URL(request.url).origin
  const headers = { authorization: `Bearer ${process.env.CRON_SECRET}` }

  const results = await Promise.allSettled([
    fetch(`${baseUrl}/api/sync/polymarket`, { method: "POST", headers }).then((r) =>
      r.json()
    ),
    fetch(`${baseUrl}/api/sync/kalshi`, { method: "POST", headers }).then((r) =>
      r.json()
    ),
  ])

  return NextResponse.json({
    polymarket: results[0].status === "fulfilled" ? results[0].value : { error: (results[0] as PromiseRejectedResult).reason?.message },
    kalshi: results[1].status === "fulfilled" ? results[1].value : { error: (results[1] as PromiseRejectedResult).reason?.message },
    timestamp: new Date().toISOString(),
  })
}
