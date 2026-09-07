-- Add 'draft' to job_status enum
ALTER TYPE job_status ADD VALUE IF NOT EXISTS 'draft';

-- Add salary_period and skills array to jobs table for easier form handling
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS salary_period TEXT DEFAULT 'yearly';
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS skills_list TEXT[] DEFAULT '{}';

-- Allow employers to update their own profiles more easily
CREATE POLICY "Employers can update own profile" ON employer_profiles FOR UPDATE USING (auth.uid() = profile_id);

-- Update jobs policies to ensure draft status is handled
-- Drop the old policy and recreate it to be safer, or just rely on the existing one which allows SELECT if they belong to company
DROP POLICY IF EXISTS "Employers view company jobs" ON jobs;
CREATE POLICY "Employers view company jobs" ON jobs FOR SELECT USING (status = 'published' OR is_admin(auth.uid()) OR belongs_to_company(auth.uid(), company_id));


-- Allow employers to update their own company's jobs
CREATE POLICY "Employers update company jobs" ON jobs FOR UPDATE USING (belongs_to_company(auth.uid(), company_id));
