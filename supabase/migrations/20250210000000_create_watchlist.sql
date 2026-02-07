-- Watchlist items: users can follow politicians and assets (tickers)
create table public.watchlist_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  entity_type text not null check (entity_type in ('person', 'asset')),
  entity_id text not null,
  created_at timestamptz default now() not null,
  unique (user_id, entity_type, entity_id)
);

create index idx_watchlist_user on public.watchlist_items (user_id);

alter table public.watchlist_items enable row level security;

create policy "Users can view own watchlist"
  on public.watchlist_items for select
  using (auth.uid() = user_id);

create policy "Users can insert own watchlist"
  on public.watchlist_items for insert
  with check (auth.uid() = user_id);

create policy "Users can delete own watchlist"
  on public.watchlist_items for delete
  using (auth.uid() = user_id);
