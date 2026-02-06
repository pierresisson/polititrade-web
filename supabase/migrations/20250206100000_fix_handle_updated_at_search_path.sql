-- Fix mutable search_path on handle_updated_at
-- Sets search_path to empty string to prevent search_path injection attacks
create or replace function public.handle_updated_at()
returns trigger
language plpgsql
security invoker set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;
