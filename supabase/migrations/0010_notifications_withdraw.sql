-- Notify Employer on Candidate Withdrawal
CREATE OR REPLACE FUNCTION notify_employer_on_app_withdrawal()
RETURNS TRIGGER AS $$
DECLARE
  v_job_title TEXT;
  v_company_id UUID;
  v_candidate_name TEXT;
  v_employer_rec RECORD;
BEGIN
  SELECT title, company_id INTO v_job_title, v_company_id
  FROM jobs WHERE id = OLD.job_id;
  
  SELECT full_name INTO v_candidate_name
  FROM profiles WHERE id = OLD.candidate_id;

  FOR v_employer_rec IN (SELECT profile_id FROM employer_profiles WHERE company_id = v_company_id)
  LOOP
    INSERT INTO notifications (user_id, title, message, type, reference_id, reference_type, link)
    VALUES (
      v_employer_rec.profile_id,
      'Application Withdrawn',
      v_candidate_name || ' has withdrawn their application for ' || v_job_title,
      'application_withdrawn',
      OLD.job_id,
      'job',
      '/employer/jobs/' || OLD.job_id || '/applicants'
    );
  END LOOP;

  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_notify_app_withdrawal ON applications;
CREATE TRIGGER trigger_notify_app_withdrawal
AFTER DELETE ON applications
FOR EACH ROW
EXECUTE FUNCTION notify_employer_on_app_withdrawal();


-- 5. Helper function to notify employers of expiring jobs
-- Can be called via pg_cron or an edge function periodically
CREATE OR REPLACE FUNCTION notify_expiring_jobs()
RETURNS void AS $$
DECLARE
  v_job RECORD;
  v_employer_rec RECORD;
BEGIN
  -- Find jobs expiring in exactly 3 days (assuming jobs expire in 30 days, so 27 days old)
  FOR v_job IN (
    SELECT id, title, company_id 
    FROM jobs 
    WHERE status = 'published' 
      AND created_at >= (NOW() - INTERVAL '27 days')
      AND created_at < (NOW() - INTERVAL '26 days')
  )
  LOOP
    FOR v_employer_rec IN (SELECT profile_id FROM employer_profiles WHERE company_id = v_job.company_id)
    LOOP
      INSERT INTO notifications (user_id, title, message, type, reference_id, reference_type, link)
      VALUES (
        v_employer_rec.profile_id,
        'Job Expiring Soon',
        'Your job posting "' || v_job.title || '" is expiring in 3 days.',
        'job_expiring',
        v_job.id,
        'job',
        '/employer/jobs/' || v_job.id || '/edit'
      );
    END LOOP;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
