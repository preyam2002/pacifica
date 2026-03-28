-- Add daily bonus columns to profiles
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS last_daily_bonus timestamptz DEFAULT NULL,
ADD COLUMN IF NOT EXISTS daily_streak integer DEFAULT 0;

-- Function to claim daily bonus
-- Returns the bonus amount (0 if already claimed today)
CREATE OR REPLACE FUNCTION claim_daily_bonus(p_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_profile profiles%ROWTYPE;
  v_base_bonus numeric := 50;
  v_streak integer;
  v_multiplier numeric;
  v_bonus numeric;
  v_last_claim date;
  v_today date := CURRENT_DATE;
BEGIN
  SELECT * INTO v_profile FROM profiles WHERE id = p_user_id FOR UPDATE;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Profile not found');
  END IF;

  v_last_claim := v_profile.last_daily_bonus::date;

  -- Already claimed today
  IF v_last_claim = v_today THEN
    RETURN jsonb_build_object('success', false, 'error', 'Already claimed today', 'next_claim', (v_today + 1)::text);
  END IF;

  -- Check if streak continues (claimed yesterday)
  IF v_last_claim = v_today - 1 THEN
    v_streak := v_profile.daily_streak + 1;
  ELSE
    v_streak := 1;
  END IF;

  -- Multiplier: 1x for day 1, up to 3x for 7+ day streak
  v_multiplier := LEAST(1 + (v_streak - 1) * 0.33, 3.0);
  v_bonus := ROUND(v_base_bonus * v_multiplier);

  UPDATE profiles
  SET balance = balance + v_bonus,
      last_daily_bonus = NOW(),
      daily_streak = v_streak
  WHERE id = p_user_id;

  RETURN jsonb_build_object(
    'success', true,
    'bonus', v_bonus,
    'streak', v_streak,
    'multiplier', v_multiplier,
    'new_balance', v_profile.balance + v_bonus
  );
END;
$$;
