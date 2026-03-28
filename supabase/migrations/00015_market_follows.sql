-- Market follows/bookmarks table
create table if not exists market_follows (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade not null,
  market_id uuid references markets on delete cascade not null,
  created_at timestamptz default now() not null,
  unique(user_id, market_id)
);

-- RLS
alter table market_follows enable row level security;

create policy "Users can view own follows"
  on market_follows for select
  using (auth.uid() = user_id);

create policy "Users can follow markets"
  on market_follows for insert
  with check (auth.uid() = user_id);

create policy "Users can unfollow markets"
  on market_follows for delete
  using (auth.uid() = user_id);

-- Index for fast lookup
create index if not exists idx_market_follows_user on market_follows(user_id);
create index if not exists idx_market_follows_market on market_follows(market_id);
