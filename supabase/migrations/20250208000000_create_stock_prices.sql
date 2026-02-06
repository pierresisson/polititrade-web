-- Stock Prices & Trade Performance tables
-- Stores daily OHLCV price data, pre-computed trade returns, and fetch state

-- ─── stock_prices: Daily OHLCV cache ──────────────────────────────────

CREATE TABLE stock_prices (
  ticker     text         NOT NULL,
  price_date date         NOT NULL,
  close      numeric(12,4) NOT NULL,
  open       numeric(12,4),
  high       numeric(12,4),
  low        numeric(12,4),
  adj_close  numeric(12,4),
  volume     bigint,
  UNIQUE (ticker, price_date)
);

CREATE INDEX idx_stock_prices_ticker_date_desc
  ON stock_prices (ticker, price_date DESC);

ALTER TABLE stock_prices ENABLE ROW LEVEL SECURITY;

-- Public read
CREATE POLICY "stock_prices_public_read" ON stock_prices
  FOR SELECT USING (true);

-- Service-role writes (no insert/update/delete for anon/authenticated)

-- ─── trade_performance: Pre-computed returns per trade ─────────────────

CREATE TABLE trade_performance (
  trade_id           uuid PRIMARY KEY REFERENCES trades(id) ON DELETE CASCADE,
  reference_date     date,
  reference_price    numeric(12,4),
  is_estimated_date  boolean DEFAULT false,
  return_1d          numeric(8,4),
  return_1w          numeric(8,4),
  return_1m          numeric(8,4),
  return_3m          numeric(8,4),
  return_6m          numeric(8,4),
  return_1y          numeric(8,4),
  return_to_date     numeric(8,4),
  sp500_return_1m    numeric(8,4),
  sp500_return_3m    numeric(8,4),
  sp500_return_6m    numeric(8,4),
  sp500_return_1y    numeric(8,4),
  sp500_return_to_date numeric(8,4),
  current_price      numeric(12,4),
  computed_at        timestamptz DEFAULT now()
);

ALTER TABLE trade_performance ENABLE ROW LEVEL SECURITY;

-- Public read
CREATE POLICY "trade_performance_public_read" ON trade_performance
  FOR SELECT USING (true);

-- ─── price_fetch_log: Tracks fetch state per ticker ───────────────────

CREATE TABLE price_fetch_log (
  ticker          text PRIMARY KEY,
  last_fetched_at timestamptz,
  earliest_date   date,
  latest_date     date,
  status          text DEFAULT 'ok' CHECK (status IN ('ok', 'error', 'not_found'))
);

ALTER TABLE price_fetch_log ENABLE ROW LEVEL SECURITY;

-- No public access — service-role only
