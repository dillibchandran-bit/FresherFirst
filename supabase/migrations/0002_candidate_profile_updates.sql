-- Add new columns to candidate_profiles for extended profile
ALTER TABLE candidate_profiles ADD COLUMN IF NOT EXISTS city TEXT;
ALTER TABLE candidate_profiles ADD COLUMN IF NOT EXISTS preferred_locations TEXT[];
ALTER TABLE candidate_profiles ADD COLUMN IF NOT EXISTS career_objective TEXT;
ALTER TABLE candidate_profiles ADD COLUMN IF NOT EXISTS preferred_roles TEXT[];
ALTER TABLE candidate_profiles ADD COLUMN IF NOT EXISTS work_mode work_mode;
ALTER TABLE candidate_profiles ADD COLUMN IF NOT EXISTS expected_salary INTEGER;

-- Create experience table (since freshers might have internships)
CREATE TABLE IF NOT EXISTS experience (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    candidate_id UUID NOT NULL REFERENCES candidate_profiles(profile_id) ON DELETE CASCADE,
    company TEXT NOT NULL,
    role TEXT NOT NULL,
    start_date DATE,
    end_date DATE,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS for experience
ALTER TABLE experience ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Candidates manage own experience" ON experience FOR ALL USING (auth.uid() = candidate_id);
CREATE POLICY "Employers can view candidate experience" ON experience FOR SELECT USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('employer', 'admin')));

-- Triggers for experience updated_at
CREATE TRIGGER update_experience_updated_at BEFORE UPDATE ON experience FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Storage setup for avatars and resumes
-- Note: Depending on Supabase version, direct inserts to storage.buckets might require superuser. 
-- Assuming standard local/remote setup supports this for the service role running migrations.
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true) ON CONFLICT DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('resumes', 'resumes', false) ON CONFLICT DO NOTHING;

-- Storage RLS Policies
-- Avatars (Public)
CREATE POLICY "Avatar images are publicly accessible." ON storage.objects FOR SELECT USING (bucket_id = 'avatars');
CREATE POLICY "Anyone can upload an avatar." ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.uid() = owner);
CREATE POLICY "Anyone can update their own avatar." ON storage.objects FOR UPDATE USING (auth.uid() = owner) WITH CHECK (bucket_id = 'avatars');

-- Resumes (Private)
CREATE POLICY "Candidates can read own resumes" ON storage.objects FOR SELECT USING (bucket_id = 'resumes' AND auth.uid() = owner);
CREATE POLICY "Candidates can insert own resumes" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'resumes' AND auth.uid() = owner);
CREATE POLICY "Candidates can update own resumes" ON storage.objects FOR UPDATE USING (bucket_id = 'resumes' AND auth.uid() = owner);
CREATE POLICY "Candidates can delete own resumes" ON storage.objects FOR DELETE USING (bucket_id = 'resumes' AND auth.uid() = owner);
