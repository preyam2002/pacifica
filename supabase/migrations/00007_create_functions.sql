-- Atomic trade execution via LMSR
-- C(q) = b * ln(exp(q_yes/b) + exp(q_no/b))
-- Uses log-sum-exp trick: C = b * (m + ln(exp((q_yes-m)/b) + exp((q_no-m)/b))) where m = max(q_yes, q_no)
CREATE OR REPLACE FUNCTION execute_trade(
  p_user_id UUID,
  p_market_id UUID,
  p_side trade_side,
  p_action trade_action,
  p_shares NUMERIC,
  p_max_cost NUMERIC DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
  v_market RECORD;
  v_profile RECORD;
  v_cost NUMERIC;
  v_new_yes NUMERIC;
  v_new_no NUMERIC;
  v_new_prob NUMERIC;
  v_price NUMERIC;
  v_b NUMERIC;
  v_old_cost_fn NUMERIC;
  v_new_cost_fn NUMERIC;
  v_m NUMERIC;
  v_trade_id UUID;
  v_pos RECORD;
BEGIN
  -- Lock market row
  SELECT * INTO v_market FROM markets WHERE id = p_market_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Market not found'; END IF;
  IF v_market.status != 'open' THEN RAISE EXCEPTION 'Market is not open for trading'; END IF;

  -- Lock profile row
  SELECT * INTO v_profile FROM profiles WHERE id = p_user_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'User not found'; END IF;

  v_b := v_market.liquidity_param;

  -- Old cost function (log-sum-exp)
  v_m := GREATEST(v_market.yes_shares, v_market.no_shares);
  v_old_cost_fn := v_b * (v_m / v_b + LN(EXP((v_market.yes_shares - v_m) / v_b) + EXP((v_market.no_shares - v_m) / v_b)));

  -- Compute new shares
  IF p_action = 'buy' THEN
    IF p_side = 'yes' THEN
      v_new_yes := v_market.yes_shares + p_shares;
      v_new_no := v_market.no_shares;
    ELSE
      v_new_yes := v_market.yes_shares;
      v_new_no := v_market.no_shares + p_shares;
    END IF;
  ELSE
    IF p_side = 'yes' THEN
      v_new_yes := v_market.yes_shares - p_shares;
      v_new_no := v_market.no_shares;
    ELSE
      v_new_yes := v_market.yes_shares;
      v_new_no := v_market.no_shares - p_shares;
    END IF;
  END IF;

  -- New cost function
  v_m := GREATEST(v_new_yes, v_new_no);
  v_new_cost_fn := v_b * (v_m / v_b + LN(EXP((v_new_yes - v_m) / v_b) + EXP((v_new_no - v_m) / v_b)));

  v_cost := v_new_cost_fn - v_old_cost_fn;

  -- Slippage protection
  IF p_action = 'buy' AND p_max_cost IS NOT NULL AND v_cost > p_max_cost THEN
    RAISE EXCEPTION 'Trade exceeds max cost. Cost: %, Max: %', ROUND(v_cost, 4), ROUND(p_max_cost, 4);
  END IF;

  -- Balance check for buys
  IF p_action = 'buy' AND v_profile.balance < v_cost THEN
    RAISE EXCEPTION 'Insufficient balance. Need $%, have $%', ROUND(v_cost, 2), ROUND(v_profile.balance, 2);
  END IF;

  -- Share check for sells
  IF p_action = 'sell' THEN
    SELECT * INTO v_pos FROM positions WHERE user_id = p_user_id AND market_id = p_market_id;
    IF p_side = 'yes' AND (v_pos IS NULL OR v_pos.yes_shares < p_shares) THEN
      RAISE EXCEPTION 'Insufficient yes shares to sell';
    END IF;
    IF p_side = 'no' AND (v_pos IS NULL OR v_pos.no_shares < p_shares) THEN
      RAISE EXCEPTION 'Insufficient no shares to sell';
    END IF;
  END IF;

  -- New probability
  v_m := GREATEST(v_new_yes, v_new_no);
  v_new_prob := EXP((v_new_yes - v_m) / v_b) / (EXP((v_new_yes - v_m) / v_b) + EXP((v_new_no - v_m) / v_b));
  v_price := CASE WHEN p_shares > 0 THEN ABS(v_cost) / p_shares ELSE 0 END;

  -- Update balance
  UPDATE profiles
  SET balance = balance - v_cost, total_trades = total_trades + 1
  WHERE id = p_user_id;

  -- Update market
  UPDATE markets
  SET yes_shares = v_new_yes, no_shares = v_new_no, probability = v_new_prob,
      total_volume = total_volume + ABS(v_cost), trades_count = trades_count + 1
  WHERE id = p_market_id;

  -- Upsert position
  INSERT INTO positions (user_id, market_id, yes_shares, no_shares, avg_yes_price, avg_no_price, total_invested)
  VALUES (
    p_user_id, p_market_id,
    CASE WHEN p_side = 'yes' AND p_action = 'buy' THEN p_shares ELSE 0 END,
    CASE WHEN p_side = 'no' AND p_action = 'buy' THEN p_shares ELSE 0 END,
    CASE WHEN p_side = 'yes' AND p_action = 'buy' THEN v_price ELSE 0 END,
    CASE WHEN p_side = 'no' AND p_action = 'buy' THEN v_price ELSE 0 END,
    CASE WHEN p_action = 'buy' THEN v_cost ELSE 0 END
  )
  ON CONFLICT (user_id, market_id) DO UPDATE SET
    yes_shares = CASE
      WHEN p_side = 'yes' AND p_action = 'buy' THEN positions.yes_shares + p_shares
      WHEN p_side = 'yes' AND p_action = 'sell' THEN positions.yes_shares - p_shares
      ELSE positions.yes_shares
    END,
    no_shares = CASE
      WHEN p_side = 'no' AND p_action = 'buy' THEN positions.no_shares + p_shares
      WHEN p_side = 'no' AND p_action = 'sell' THEN positions.no_shares - p_shares
      ELSE positions.no_shares
    END,
    avg_yes_price = CASE
      WHEN p_side = 'yes' AND p_action = 'buy' AND (positions.yes_shares + p_shares) > 0 THEN
        (positions.avg_yes_price * positions.yes_shares + v_price * p_shares) / (positions.yes_shares + p_shares)
      ELSE positions.avg_yes_price
    END,
    avg_no_price = CASE
      WHEN p_side = 'no' AND p_action = 'buy' AND (positions.no_shares + p_shares) > 0 THEN
        (positions.avg_no_price * positions.no_shares + v_price * p_shares) / (positions.no_shares + p_shares)
      ELSE positions.avg_no_price
    END,
    total_invested = positions.total_invested + CASE WHEN p_action = 'buy' THEN v_cost ELSE 0 END,
    realized_pnl = positions.realized_pnl + CASE
      WHEN p_action = 'sell' THEN
        -v_cost - (CASE WHEN p_side = 'yes' THEN positions.avg_yes_price ELSE positions.avg_no_price END * p_shares)
      ELSE 0
    END,
    updated_at = NOW();

  -- Record trade
  INSERT INTO trades (user_id, market_id, side, action, shares, price, cost)
  VALUES (p_user_id, p_market_id, p_side, p_action, p_shares, v_price, v_cost)
  RETURNING id INTO v_trade_id;

  -- Record history
  INSERT INTO market_history (market_id, probability, volume)
  VALUES (p_market_id, v_new_prob, ABS(v_cost));

  RETURN json_build_object(
    'trade_id', v_trade_id,
    'cost', ROUND(v_cost, 4),
    'price', ROUND(v_price, 4),
    'new_probability', ROUND(v_new_prob, 4),
    'new_balance', ROUND(v_profile.balance - v_cost, 2)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Market resolution
CREATE OR REPLACE FUNCTION resolve_market(
  p_market_id UUID,
  p_outcome market_outcome,
  p_resolver_id UUID
)
RETURNS VOID AS $$
DECLARE
  v_market RECORD;
  v_pos RECORD;
  v_payout NUMERIC;
BEGIN
  SELECT * INTO v_market FROM markets WHERE id = p_market_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Market not found'; END IF;
  IF v_market.status = 'resolved' THEN RAISE EXCEPTION 'Already resolved'; END IF;
  IF v_market.creator_id != p_resolver_id AND NOT v_market.is_synced THEN
    RAISE EXCEPTION 'Only creator can resolve';
  END IF;

  UPDATE markets SET status = 'resolved', outcome = p_outcome WHERE id = p_market_id;

  FOR v_pos IN SELECT * FROM positions WHERE market_id = p_market_id
  LOOP
    IF p_outcome = 'yes' THEN
      v_payout := v_pos.yes_shares;
    ELSE
      v_payout := v_pos.no_shares;
    END IF;

    IF v_payout > 0 THEN
      UPDATE profiles
      SET balance = balance + v_payout,
          correct_predictions = correct_predictions + 1,
          current_streak = current_streak + 1,
          best_streak = GREATEST(best_streak, current_streak + 1)
      WHERE id = v_pos.user_id;
    ELSE
      IF (p_outcome = 'yes' AND v_pos.no_shares > 0) OR
         (p_outcome = 'no' AND v_pos.yes_shares > 0) THEN
        UPDATE profiles SET current_streak = 0 WHERE id = v_pos.user_id;
      END IF;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
