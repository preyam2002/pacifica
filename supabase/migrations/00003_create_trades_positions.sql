CREATE TYPE trade_side AS ENUM ('yes', 'no');
CREATE TYPE trade_action AS ENUM ('buy', 'sell');

CREATE TABLE trades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  market_id UUID NOT NULL REFERENCES markets(id) ON DELETE CASCADE,
  side trade_side NOT NULL,
  action trade_action NOT NULL DEFAULT 'buy',
  shares NUMERIC(14, 4) NOT NULL,
  price NUMERIC(5, 4) NOT NULL,
  cost NUMERIC(14, 4) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE positions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  market_id UUID NOT NULL REFERENCES markets(id) ON DELETE CASCADE,
  yes_shares NUMERIC(14, 4) NOT NULL DEFAULT 0,
  no_shares NUMERIC(14, 4) NOT NULL DEFAULT 0,
  avg_yes_price NUMERIC(5, 4) NOT NULL DEFAULT 0,
  avg_no_price NUMERIC(5, 4) NOT NULL DEFAULT 0,
  total_invested NUMERIC(14, 4) NOT NULL DEFAULT 0,
  realized_pnl NUMERIC(14, 4) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, market_id)
);

CREATE TRIGGER positions_updated_at
  BEFORE UPDATE ON positions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
