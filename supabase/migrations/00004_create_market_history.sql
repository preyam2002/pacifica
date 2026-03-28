CREATE TABLE market_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  market_id UUID NOT NULL REFERENCES markets(id) ON DELETE CASCADE,
  probability NUMERIC(5, 4) NOT NULL,
  volume NUMERIC(14, 2),
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
