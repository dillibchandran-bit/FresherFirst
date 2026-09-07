ALTER TABLE notifications 
  ADD COLUMN IF NOT EXISTS channels TEXT[] DEFAULT ARRAY['in_app'],
  ADD COLUMN IF NOT EXISTS reference_id UUID,
  ADD COLUMN IF NOT EXISTS reference_type TEXT;

DROP POLICY IF EXISTS "Users can view their own notifications" ON notifications;
CREATE POLICY "Users can view their own notifications" ON notifications FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own notifications" ON notifications;
CREATE POLICY "Users can update their own notifications" ON notifications FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own notifications" ON notifications;
CREATE POLICY "Users can delete their own notifications" ON notifications FOR DELETE USING (auth.uid() = user_id);


-- 1. Notify Employer on New Application
CREATE OR REPLACE FUNCTION notify_employer_on_new_application()
RETURNS TRIGGER AS $$
DECLARE
  v_job_title TEXT;
  v_company_id UUID;
  v_candidate_name TEXT;
  v_employer_rec RECORD;
BEGIN
  SELECT title, company_id INTO v_job_title, v_company_id
  FROM jobs WHERE id = NEW.job_id;
  
  SELECT full_name INTO v_candidate_name
  FROM profiles WHERE id = NEW.candidate_id;

  FOR v_employer_rec IN (SELECT profile_id FROM employer_profiles WHERE company_id = v_company_id)
  LOOP
    INSERT INTO notifications (user_id, title, message, type, reference_id, reference_type, link)
    VALUES (
      v_employer_rec.profile_id,
      'New Application Received',
      v_candidate_name || ' has applied for ' || v_job_title,
      'new_application',
      NEW.id,
      'application',
      '/employer/jobs/' || NEW.job_id || '/applicants'
    );
  END LOOP;

  -- Also notify the candidate
  INSERT INTO notifications (user_id, title, message, type, reference_id, reference_type, link)
  VALUES (
    NEW.candidate_id,
    'Application Submitted',
    'Your application for ' || v_job_title || ' has been successfully submitted.',
    'application_submitted',
    NEW.id,
    'application',
    '/candidate/applications'
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_notify_new_application ON applications;
CREATE TRIGGER trigger_notify_new_application
AFTER INSERT ON applications
FOR EACH ROW
EXECUTE FUNCTION notify_employer_on_new_application();


-- 2. Notify Candidate on Application Status Change
CREATE OR REPLACE FUNCTION notify_candidate_on_app_status()
RETURNS TRIGGER AS $$
DECLARE
  v_job_title TEXT;
  v_company_name TEXT;
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    SELECT j.title, c.name INTO v_job_title, v_company_name
    FROM jobs j
    JOIN companies c ON c.id = j.company_id
    WHERE j.id = NEW.job_id;

    INSERT INTO notifications (user_id, title, message, type, reference_id, reference_type, link)
    VALUES (
      NEW.candidate_id,
      'Application Status Update',
      'Your application for ' || v_job_title || ' at ' || v_company_name || ' is now ' || NEW.status || '.',
      'application_status',
      NEW.id,
      'application',
      '/candidate/applications'
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_notify_app_status ON applications;
CREATE TRIGGER trigger_notify_app_status
AFTER UPDATE ON applications
FOR EACH ROW
EXECUTE FUNCTION notify_candidate_on_app_status();


-- 3. Notify Employer on Job Approval/Rejection
CREATE OR REPLACE FUNCTION notify_employer_on_job_status()
RETURNS TRIGGER AS $$
DECLARE
  v_employer_rec RECORD;
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status AND NEW.status IN ('published', 'rejected') THEN
    FOR v_employer_rec IN (SELECT profile_id FROM employer_profiles WHERE company_id = NEW.company_id)
    LOOP
      INSERT INTO notifications (user_id, title, message, type, reference_id, reference_type, link)
      VALUES (
        v_employer_rec.profile_id,
        CASE WHEN NEW.status = 'published' THEN 'Job Approved' ELSE 'Job Rejected' END,
        'Your job posting "' || NEW.title || '" has been ' || NEW.status || '.',
        'job_status',
        NEW.id,
        'job',
        '/employer/dashboard'
      );
    END LOOP;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_notify_job_status ON jobs;
CREATE TRIGGER trigger_notify_job_status
AFTER UPDATE ON jobs
FOR EACH ROW
EXECUTE FUNCTION notify_employer_on_job_status();
