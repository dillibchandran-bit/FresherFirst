-- Add verification_status to companies
ALTER TABLE companies ADD COLUMN IF NOT EXISTS verification_status TEXT DEFAULT 'unverified';

-- Migrate existing boolean data
UPDATE companies SET verification_status = 'verified' WHERE verified = true;
UPDATE companies SET verification_status = 'unverified' WHERE verified = false;
UPDATE companies SET verification_status = 'pending' WHERE verification_status = 'unverified'; -- Optional: maybe unverified is default, but let's assume they requested it? Actually, just leave it as unverified.

-- Add unique constraint for reporting to prevent duplicate reports from the same user for the same job
ALTER TABLE job_reports ADD CONSTRAINT unique_job_report UNIQUE (job_id, reporter_id);
