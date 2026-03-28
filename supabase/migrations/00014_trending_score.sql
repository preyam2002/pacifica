-- Trending score function: combines recent trade volume, trade velocity, and probability movement
-- Higher scores = more "hot" markets. Uses time decay (last 24h weighted heavily).
create or replace function get_trending_markets(p_limit int default 20)
returns setof markets as $$
  select m.*
  from markets m
  where m.status = 'open'
  order by (
    -- Recent trade velocity (trades in last 24h)
    coalesce((
      select count(*)::float
      from trades t
      where t.market_id = m.id
        and t.created_at > now() - interval '24 hours'
    ), 0) * 10
    +
    -- Recent volume (last 24h)
    coalesce((
      select sum(abs(t.cost))
      from trades t
      where t.market_id = m.id
        and t.created_at > now() - interval '24 hours'
    ), 0) * 0.1
    +
    -- Probability movement (bigger swings = more interesting)
    coalesce((
      select abs(m.probability - h.probability) * 100
      from market_history h
      where h.market_id = m.id
        and h.recorded_at <= now() - interval '24 hours'
      order by h.recorded_at desc
      limit 1
    ), 0) * 5
    +
    -- Recency boost for new markets (created in last 48h)
    case when m.created_at > now() - interval '48 hours' then 20 else 0 end
    +
    -- Comment activity
    coalesce(m.comments_count, 0) * 2
    +
    -- Base volume (all time, lower weight)
    coalesce(m.total_volume, 0) * 0.01
  ) desc
  limit p_limit;
$$ language sql stable;
