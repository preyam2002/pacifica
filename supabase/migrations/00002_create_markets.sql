CREATE TYPE market_status AS ENUM ('open', 'closed', 'resolved');
CREATE TYPE market_outcome AS ENUM ('yes', 'no');
CREATE TYPE market_category AS ENUM (
  'politics', 'sports', 'tech', 'crypto',
  'entertainment', 'science', 'economics', 'custom'
);
CREATE TYPE sync_source AS ENUM ('polymarket', 'kalshi');

CREATE TABLE markets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  description TEXT,
  category market_category NOT NULL DEFAULT 'custom',
  resolution_date TIMESTAMPTZ NOT NULL,
  resolution_source TEXT,
  status market_status NOT NULL DEFAULT 'open',
  outcome market_outcome,
  probability NUMERIC(5, 4) NOT NULL DEFAULT 0.5000,
  yes_shares NUMERIC(14, 4) NOT NULL DEFAULT 0,
  no_shares NUMERIC(14, 4) NOT NULL DEFAULT 0,
  liquidity_param NUMERIC(10, 2) NOT NULL DEFAULT 100.00,
  total_volume NUMERIC(14, 2) NOT NULL DEFAULT 0,
  is_synced BOOLEAN NOT NULL DEFAULT FALSE,
  sync_source sync_source,
  sync_id TEXT,
  sync_probability NUMERIC(5, 4),
  sync_volume NUMERIC(14, 2),
  last_synced_at TIMESTAMPTZ,
  likes_count INTEGER NOT NULL DEFAULT 0,
  comments_count INTEGER NOT NULL DEFAULT 0,
  trades_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_markets_sync
  ON markets (sync_source, sync_id)
  WHERE is_synced = TRUE;

CREATE TRIGGER markets_updated_at
  BEFORE UPDATE ON markets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
