CREATE OR REPLACE FUNCTION check_report_rate_limit()
RETURNS TRIGGER AS $$
DECLARE
  report_count INT;
BEGIN
  SELECT COUNT(*) INTO report_count
  FROM job_reports
  WHERE reporter_id = NEW.reporter_id
    AND created_at > NOW() - INTERVAL '1 hour';
    
  IF report_count >= 10 THEN
    RAISE EXCEPTION 'Rate limit exceeded: You can only submit up to 10 reports per hour.';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER enforce_report_rate_limit
BEFORE INSERT ON job_reports
FOR EACH ROW
EXECUTE FUNCTION check_report_rate_limit();
