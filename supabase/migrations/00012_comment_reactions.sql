-- Comment reactions
create table if not exists comment_reactions (
  id uuid primary key default gen_random_uuid(),
  comment_id uuid not null references comments(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  emoji text not null check (emoji in ('👍', '🔥', '🤔', '💯', '😂', '❤️')),
  created_at timestamptz not null default now(),
  unique(comment_id, user_id, emoji)
);

-- RLS
alter table comment_reactions enable row level security;

create policy "Anyone can view reactions" on comment_reactions for select using (true);
create policy "Authenticated users can react" on comment_reactions for insert with check (auth.uid() = user_id);
create policy "Users can remove own reactions" on comment_reactions for delete using (auth.uid() = user_id);

-- Index
create index idx_comment_reactions_comment on comment_reactions(comment_id);
