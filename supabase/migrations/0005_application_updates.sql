-- Add new statuses to enum
ALTER TYPE application_status ADD VALUE IF NOT EXISTS 'applied';
ALTER TYPE application_status ADD VALUE IF NOT EXISTS 'under_review';
ALTER TYPE application_status ADD VALUE IF NOT EXISTS 'interview';
ALTER TYPE application_status ADD VALUE IF NOT EXISTS 'selected';
ALTER TYPE application_status ADD VALUE IF NOT EXISTS 'withdrawn';

-- Change default status to 'applied'
ALTER TABLE applications ALTER COLUMN status SET DEFAULT 'applied'::application_status;

-- Policies for applications
DROP POLICY IF EXISTS "Employers view applications for their jobs" ON applications;
CREATE POLICY "Employers view applications for their jobs" ON applications FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM jobs 
        WHERE jobs.id = applications.job_id 
        AND belongs_to_company(auth.uid(), jobs.company_id)
    )
);

DROP POLICY IF EXISTS "Employers update applications for their jobs" ON applications;
CREATE POLICY "Employers update applications for their jobs" ON applications FOR UPDATE USING (
    EXISTS (
        SELECT 1 FROM jobs 
        WHERE jobs.id = applications.job_id 
        AND belongs_to_company(auth.uid(), jobs.company_id)
    )
);

DROP POLICY IF EXISTS "Candidates update own applications" ON applications;
CREATE POLICY "Candidates update own applications" ON applications FOR UPDATE USING (
    auth.uid() = candidate_id
);

-- Function to allow employers to read resumes
CREATE OR REPLACE FUNCTION can_employer_view_resume(resume_obj_name TEXT, emp_id UUID) RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM applications a
    JOIN jobs j ON a.job_id = j.id
    JOIN resumes r ON a.resume_id = r.id
    WHERE r.file_url = resume_obj_name
    AND belongs_to_company(emp_id, j.company_id)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update Storage Policies for Resumes
DROP POLICY IF EXISTS "Employers can view applied resumes" ON storage.objects;
CREATE POLICY "Employers can view applied resumes" ON storage.objects FOR SELECT USING (
  bucket_id = 'resumes' AND can_employer_view_resume(name, auth.uid())
);
