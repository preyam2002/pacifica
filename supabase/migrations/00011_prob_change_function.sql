-- Returns 24h probability change for a batch of markets
create or replace function get_prob_changes(p_market_ids uuid[])
returns table(market_id uuid, prob_change double precision) as $$
  select
    m.id as market_id,
    m.probability - coalesce(
      (select h.probability
       from market_history h
       where h.market_id = m.id
         and h.recorded_at <= now() - interval '24 hours'
       order by h.recorded_at desc
       limit 1),
      m.probability
    ) as prob_change
  from markets m
  where m.id = any(p_market_ids);
$$ language sql stable;
