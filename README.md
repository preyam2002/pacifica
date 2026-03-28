# Pacifica

Play-money prediction market platform. Create markets, trade with LMSR pricing, sync with Polymarket & Kalshi, and track your edge against real-money odds.

## Features

- **LMSR AMM trading** — atomic trade execution via Postgres functions with slippage protection
- **Dual-probability system** — community predictions run alongside synced real-money odds
- **Market sync** — auto-imports markets from Polymarket and Kalshi every 15 minutes
- **Edge scoring** — tracks how often you outperform real-money markets
- **Daily bonuses** — streak multipliers up to 3x ($50-$150/day)
- **Social features** — comments, reactions, likes, follows, leaderboards, activity feed
- **Real-time charts** — probability trends with Recharts
- **Achievements** — badges for trading milestones
- **Embeddable** — embed markets on external sites
- **8 categories** — politics, sports, tech, crypto, entertainment, science, economics, custom

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16, React 19, TypeScript (strict) |
| Database | Supabase (PostgreSQL + Auth + Realtime) |
| Trading | LMSR AMM (atomic via Postgres RPC) |
| Styling | Tailwind CSS v4, Framer Motion, shadcn/ui |
| Charts | Recharts |
| Sync | Polymarket & Kalshi APIs (Vercel cron) |
| Testing | Vitest |

## Quick Start

1. Create a [Supabase](https://supabase.com) project
2. Run all migrations in `supabase/migrations/` in order
3. Create a `pacifica_bot` profile for synced markets
4. Set environment variables:
   ```
   NEXT_PUBLIC_SUPABASE_URL=...
   NEXT_PUBLIC_SUPABASE_ANON_KEY=...
   CRON_SECRET=<random-string>
   ```
5. `npm install && npm run dev`

## Architecture

**Trading engine:** All trades execute through `execute_trade()` — an atomic Postgres function that locks rows, computes LMSR costs, validates balance, updates positions, and records history. Client-side LMSR (`lib/amm.ts`) is only for price previews.

**Market sync:** Vercel cron jobs fetch Polymarket/Kalshi markets every 15 minutes and auto-close expired markets hourly. Synced markets show both community and real-money probabilities.

```
app/
├── markets/          # Browse, create, trade
├── portfolio/        # Positions, trades, followed
├── leaderboard/      # Rankings by portfolio value
├── activity/         # Global feed
├── profile/[user]    # Public profiles
└── api/cron/         # Sync & expiration jobs
```

## Database

15 SQL migrations covering: profiles, markets, trades, positions, market history, comments, likes, reactions, follows, daily bonuses, trending scores, edge scoring, and RLS policies.

Key RPC functions: `execute_trade`, `resolve_market`, `calculate_market_edge`, `claim_daily_bonus`, `get_trending_markets`.

## License

MIT — Built by [Preyam](https://github.com/preyam2002)
