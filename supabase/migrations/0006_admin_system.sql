-- Add status to profiles for suspension
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';

-- Job Reports Table
CREATE TABLE IF NOT EXISTS job_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
    reporter_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    reason TEXT NOT NULL,
    status TEXT DEFAULT 'pending', -- pending, reviewed, resolved
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Admin Audit Logs Table
CREATE TABLE IF NOT EXISTS admin_audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    admin_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    action TEXT NOT NULL,
    target_type TEXT NOT NULL,
    target_id UUID,
    details JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Function for easy admin logging
CREATE OR REPLACE FUNCTION log_admin_action(
    p_admin_id UUID, 
    p_action TEXT, 
    p_target_type TEXT, 
    p_target_id UUID, 
    p_details JSONB
)
RETURNS VOID AS $$
BEGIN
    INSERT INTO admin_audit_logs (admin_id, action, target_type, target_id, details)
    VALUES (p_admin_id, p_action, p_target_type, p_target_id, p_details);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Job Reports Policies
ALTER TABLE job_reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can insert job reports" ON job_reports FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can view job reports" ON job_reports FOR SELECT USING (is_admin(auth.uid()));
CREATE POLICY "Admins can update job reports" ON job_reports FOR UPDATE USING (is_admin(auth.uid()));

-- Audit Logs Policies
ALTER TABLE admin_audit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can view audit logs" ON admin_audit_logs FOR SELECT USING (is_admin(auth.uid()));
CREATE POLICY "Admins can insert audit logs" ON admin_audit_logs FOR INSERT WITH CHECK (is_admin(auth.uid()));

-- Extend Admin Access to Profiles
DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;
CREATE POLICY "Admins can update all profiles" ON profiles FOR UPDATE USING (is_admin(auth.uid()));

-- Extend Admin Access to Companies
DROP POLICY IF EXISTS "Admins can update all companies" ON companies;
CREATE POLICY "Admins can update all companies" ON companies FOR UPDATE USING (is_admin(auth.uid()));

-- Extend Admin Access to Jobs
DROP POLICY IF EXISTS "Admins can update all jobs" ON jobs;
CREATE POLICY "Admins can update all jobs" ON jobs FOR UPDATE USING (is_admin(auth.uid()));

-- Extend Admin Access to Locations
DROP POLICY IF EXISTS "Admins manage locations" ON locations;
CREATE POLICY "Admins manage locations" ON locations FOR ALL USING (is_admin(auth.uid()));

-- Extend Admin Access to Categories
DROP POLICY IF EXISTS "Admins manage categories" ON job_categories;
CREATE POLICY "Admins manage categories" ON job_categories FOR ALL USING (is_admin(auth.uid()));
