-- source_documents is service-role only (ingestion pipeline).
-- Add an explicit deny-all policy so the RLS linter no longer flags
-- "RLS enabled but no policies exist".
create policy "Service role only on source_documents"
  on public.source_documents for all
  using (false)
  with check (false);
