-- Migration 0010: Enable Admins to insert jobs and companies for any employer

-- Allow Admins to insert any company
DROP POLICY IF EXISTS "Admins can insert all companies" ON companies;
CREATE POLICY "Admins can insert all companies" ON companies 
  FOR INSERT 
  WITH CHECK (is_admin(auth.uid()));

-- Allow Admins to insert jobs for any company
DROP POLICY IF EXISTS "Admins can insert all jobs" ON jobs;
CREATE POLICY "Admins can insert all jobs" ON jobs 
  FOR INSERT 
  WITH CHECK (is_admin(auth.uid()));

-- Allow Admins to delete jobs if needed
DROP POLICY IF EXISTS "Admins can delete all jobs" ON jobs;
CREATE POLICY "Admins can delete all jobs" ON jobs 
  FOR DELETE 
  USING (is_admin(auth.uid()));
