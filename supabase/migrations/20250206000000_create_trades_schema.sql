-- ============================================================
-- Schema: Politicians, Source Documents & Trades
-- House PTR (Periodic Transaction Reports) ingestion pipeline
-- ============================================================

-- Politicians table
create table public.politicians (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  party text,
  chamber text,
  state text,
  district text,
  bioguide_id text,
  image_url text,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,
  unique (name, chamber)
);

-- Source documents — tracks ingestion state per document
create table public.source_documents (
  id uuid primary key default gen_random_uuid(),
  source text not null,
  external_id text not null,
  source_url text,
  filer_name text,
  office text,
  filing_year int,
  filed_at timestamptz,
  content_hash text,
  status text default 'pending' not null
    check (status in ('pending', 'downloaded', 'parsed', 'error')),
  raw_text text,
  error_message text,
  ingested_at timestamptz,
  created_at timestamptz default now() not null,
  unique (source, external_id)
);

-- Trades — normalized transactions
create table public.trades (
  id uuid primary key default gen_random_uuid(),
  source_document_id uuid references public.source_documents(id) on delete cascade,
  source text not null,
  politician_id uuid references public.politicians(id) on delete set null,
  person_name text not null,
  office text,
  asset_name text,
  ticker text,
  trade_type text check (trade_type in ('buy', 'sell', 'exchange', 'other')),
  trade_date date,
  disclosure_date date,
  amount_min int,
  amount_max int,
  raw_line text,
  source_url text,
  created_at timestamptz default now() not null
);

-- Indexes
create index idx_trades_source_disclosure on public.trades (source, disclosure_date desc);
create index idx_trades_ticker on public.trades (ticker);
create index idx_trades_person_name on public.trades (person_name);
create index idx_source_documents_status on public.source_documents (status);

-- updated_at trigger for politicians (reuse existing function)
create trigger on_politician_updated
  before update on public.politicians
  for each row execute function public.handle_updated_at();

-- ============================================================
-- RLS Policies
-- ============================================================

-- Politicians: public read
alter table public.politicians enable row level security;

create policy "Public read access on politicians"
  on public.politicians for select
  using (true);

-- Source documents: no public access (service role only)
alter table public.source_documents enable row level security;
-- No select policy = only accessible via service_role key

-- Trades: public read
alter table public.trades enable row level security;

create policy "Public read access on trades"
  on public.trades for select
  using (true);
