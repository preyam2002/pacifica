-- Function to close all markets past their resolution date
CREATE OR REPLACE FUNCTION close_expired_markets()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  closed_count integer;
BEGIN
  UPDATE markets
  SET status = 'closed'
  WHERE status = 'open'
    AND resolution_date < NOW();

  GET DIAGNOSTICS closed_count = ROW_COUNT;
  RETURN closed_count;
END;
$$;
