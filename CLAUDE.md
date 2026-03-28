@AGENTS.md

# Pacifica - Play-Money Prediction Market

## Stack
- Next.js 16 (App Router), React 19, TypeScript strict
- Supabase (Postgres + Auth + Realtime), Tailwind CSS 4, Shadcn/ui
- LMSR AMM for trading, Framer Motion for animations

## Key Architecture
- Trade execution is atomic via `execute_trade()` Postgres function (lib/supabase server -> rpc call)
- Client-side LMSR in `lib/amm.ts` is for price previews only; real execution always through Postgres
- Synced markets (Polymarket/Kalshi) have dual odds: `probability` (community) and `sync_probability` (real money)
- SQL migrations in `supabase/migrations/` — run in order on Supabase

## Setup
1. Create a Supabase project
2. Run all SQL migrations in `supabase/migrations/` in order
3. Set env vars in `.env.local` (NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, CRON_SECRET)
4. Create a `pacifica_bot` profile for synced markets
5. `npm run dev`

## Commands
- `npm run dev` — start dev server
- `npm run build` — production build
- `npx tsc --noEmit` — type check
