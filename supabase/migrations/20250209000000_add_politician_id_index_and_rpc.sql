-- ============================================================
-- Add missing index on trades.politician_id
-- + RPC function for efficient top politicians aggregation
-- ============================================================

-- Index for fast lookups by politician
create index idx_trades_politician_id on public.trades (politician_id);

-- RPC: aggregate trade stats per politician in SQL instead of JS
create or replace function public.get_top_politicians(p_limit int default 100)
returns table (
  id uuid,
  name text,
  party text,
  chamber text,
  state text,
  image_url text,
  trade_count bigint,
  volume numeric,
  top_ticker text
)
language sql stable
set search_path = ''
as $$
  with trade_stats as (
    select
      t.politician_id,
      count(*) as trade_count,
      coalesce(sum((coalesce(t.amount_min, 0) + coalesce(t.amount_max, 0)) / 2.0), 0) as volume
    from public.trades t
    where t.politician_id is not null
      and (
        t.asset_name is null
        or (
          t.asset_name not ilike '%Treasury%'
          and t.asset_name not ilike '%Municipal Bond%'
          and t.asset_name not ilike '%Savings Bond%'
        )
      )
    group by t.politician_id
  ),
  top_tickers as (
    select distinct on (t.politician_id)
      t.politician_id,
      t.ticker
    from public.trades t
    where t.politician_id is not null
      and t.ticker is not null
      and (
        t.asset_name is null
        or (
          t.asset_name not ilike '%Treasury%'
          and t.asset_name not ilike '%Municipal Bond%'
          and t.asset_name not ilike '%Savings Bond%'
        )
      )
    group by t.politician_id, t.ticker
    order by t.politician_id, count(*) desc
  )
  select
    p.id,
    p.name,
    p.party,
    p.chamber,
    p.state,
    p.image_url,
    coalesce(ts.trade_count, 0) as trade_count,
    coalesce(ts.volume, 0) as volume,
    tt.ticker as top_ticker
  from public.politicians p
  left join trade_stats ts on ts.politician_id = p.id
  left join top_tickers tt on tt.politician_id = p.id
  where ts.trade_count > 0
  order by ts.trade_count desc nulls last
  limit p_limit;
$$;
