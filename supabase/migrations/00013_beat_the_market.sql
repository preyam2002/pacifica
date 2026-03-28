-- Beat the Market: track user edge over real-money odds
--
-- For synced markets, record the real-money probability at trade time.
-- On resolution, calculate whether the user's position outperformed
-- the real-money market's implied odds.

-- Store sync probability at trade time
alter table trades add column if not exists sync_prob_at_trade double precision;

-- Profile-level edge tracking
alter table profiles add column if not exists edge_score double precision not null default 0;
alter table profiles add column if not exists edge_trades integer not null default 0;
alter table profiles add column if not exists edge_correct integer not null default 0;

-- Function to calculate edge on market resolution
-- Called after resolve_market for synced markets
create or replace function calculate_market_edge(p_market_id uuid)
returns void as $$
declare
  v_outcome text;
  v_is_synced boolean;
  rec record;
  v_user_correct boolean;
  v_market_correct boolean;
  v_edge double precision;
begin
  select outcome, is_synced into v_outcome, v_is_synced
  from markets where id = p_market_id;

  -- Only calculate edge for resolved synced markets
  if v_outcome is null or not v_is_synced then return; end if;

  -- For each trade on this market that has sync_prob_at_trade
  for rec in
    select user_id, side, action, price, sync_prob_at_trade
    from trades
    where market_id = p_market_id
      and sync_prob_at_trade is not null
      and action = 'buy'
  loop
    -- Did the user's trade direction agree with the outcome?
    v_user_correct := (rec.side = v_outcome);

    -- Did the real-money market favor this outcome at trade time?
    -- If sync_prob > 0.5 and outcome is yes, market was correct
    -- If sync_prob < 0.5 and outcome is no, market was correct
    if v_outcome = 'yes' then
      v_market_correct := (rec.sync_prob_at_trade > 0.5);
    else
      v_market_correct := (rec.sync_prob_at_trade < 0.5);
    end if;

    -- User "beats the market" if they were right when the market was wrong,
    -- OR if they got better odds than the market implied
    if v_user_correct and not v_market_correct then
      v_edge := 1.0; -- Called it when the market didn't
    elsif v_user_correct and v_market_correct then
      -- Both right, but did user get better price?
      if v_outcome = 'yes' then
        v_edge := case when rec.price < rec.sync_prob_at_trade then 0.5 else 0.0 end;
      else
        v_edge := case when rec.price < (1.0 - rec.sync_prob_at_trade) then 0.5 else 0.0 end;
      end if;
    else
      v_edge := 0.0;
    end if;

    update profiles set
      edge_trades = edge_trades + 1,
      edge_correct = edge_correct + (case when v_edge > 0 then 1 else 0 end),
      edge_score = edge_score + v_edge
    where id = rec.user_id;
  end loop;
end;
$$ language plpgsql security definer;
