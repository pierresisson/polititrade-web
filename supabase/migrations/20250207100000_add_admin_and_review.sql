-- Add admin flag to profiles (manually assigned via SQL)
ALTER TABLE profiles ADD COLUMN is_admin boolean NOT NULL DEFAULT false;

-- Prevent is_admin changes via PostgREST (API).
-- Admins are assigned via direct SQL in the Supabase dashboard.
CREATE OR REPLACE FUNCTION protect_is_admin()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- If the request comes through PostgREST it carries JWT claims
  IF current_setting('request.jwt.claims', true) IS NOT NULL
     AND current_setting('request.jwt.claims', true) <> '' THEN
    NEW.is_admin := OLD.is_admin;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_protect_is_admin
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION protect_is_admin();

-- Add review_status to trades (nullable — null means not yet reviewed)
ALTER TABLE trades ADD COLUMN review_status text
  CHECK (review_status IN ('verified', 'to_review'));

-- Partial index for filtering reviewed trades
CREATE INDEX idx_trades_review_status
  ON trades (review_status) WHERE review_status IS NOT NULL;
