-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==========================================
-- ENUMS
-- ==========================================
CREATE TYPE user_role AS ENUM ('candidate', 'employer', 'admin');
CREATE TYPE job_status AS ENUM ('pending', 'published', 'closed', 'rejected');
CREATE TYPE work_mode AS ENUM ('on_site', 'hybrid', 'remote');
CREATE TYPE job_type AS ENUM ('full_time', 'part_time', 'contract', 'internship');
CREATE TYPE application_status AS ENUM ('pending', 'reviewed', 'shortlisted', 'rejected', 'hired');
CREATE TYPE verification_status AS ENUM ('pending', 'approved', 'rejected');

-- ==========================================
-- TABLES
-- ==========================================

-- 1. profiles
-- Extends the Supabase auth.users table
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    role user_role NOT NULL DEFAULT 'candidate',
    email TEXT NOT NULL UNIQUE,
    full_name TEXT,
    avatar_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. candidate_profiles
CREATE TABLE candidate_profiles (
    profile_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
    phone TEXT,
    about TEXT,
    github_url TEXT,
    linkedin_url TEXT,
    portfolio_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. companies
CREATE TABLE companies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    website TEXT,
    logo_url TEXT,
    description TEXT,
    verified BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. employer_profiles
CREATE TABLE employer_profiles (
    profile_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
    company_id UUID REFERENCES companies(id) ON DELETE SET NULL,
    position_in_company TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 14. job_categories
CREATE TABLE job_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 15. locations
CREATE TABLE locations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. jobs
CREATE TABLE jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    category_id UUID REFERENCES job_categories(id),
    location_id UUID REFERENCES locations(id),
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT NOT NULL,
    responsibilities TEXT[] DEFAULT '{}',
    requirements TEXT[] DEFAULT '{}',
    experience_min INTEGER NOT NULL DEFAULT 0,
    experience_max INTEGER NOT NULL DEFAULT 2,
    salary_min INTEGER,
    salary_max INTEGER,
    job_type job_type NOT NULL DEFAULT 'full_time',
    work_mode work_mode NOT NULL DEFAULT 'on_site',
    education_requirements TEXT,
    fresher_eligible BOOLEAN NOT NULL DEFAULT true,
    deadline TIMESTAMPTZ,
    openings INTEGER NOT NULL DEFAULT 1,
    status job_status NOT NULL DEFAULT 'pending',
    posted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 7. skills
CREATE TABLE skills (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 6. job_skills
CREATE TABLE job_skills (
    job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
    skill_id UUID REFERENCES skills(id) ON DELETE CASCADE,
    PRIMARY KEY (job_id, skill_id)
);

-- 8. candidate_skills
CREATE TABLE candidate_skills (
    candidate_id UUID REFERENCES candidate_profiles(profile_id) ON DELETE CASCADE,
    skill_id UUID REFERENCES skills(id) ON DELETE CASCADE,
    PRIMARY KEY (candidate_id, skill_id)
);

-- 9. education
CREATE TABLE education (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    candidate_id UUID NOT NULL REFERENCES candidate_profiles(profile_id) ON DELETE CASCADE,
    institution TEXT NOT NULL,
    degree TEXT NOT NULL,
    field_of_study TEXT NOT NULL,
    start_date DATE,
    end_date DATE,
    grade TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 10. projects
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    candidate_id UUID NOT NULL REFERENCES candidate_profiles(profile_id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    url TEXT,
    repo_url TEXT,
    start_date DATE,
    end_date DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 11. resumes
CREATE TABLE resumes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    candidate_id UUID NOT NULL REFERENCES candidate_profiles(profile_id) ON DELETE CASCADE,
    file_url TEXT NOT NULL,
    is_primary BOOLEAN NOT NULL DEFAULT false,
    parsed_data JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 12. applications
CREATE TABLE applications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    candidate_id UUID NOT NULL REFERENCES candidate_profiles(profile_id) ON DELETE CASCADE,
    resume_id UUID REFERENCES resumes(id) ON DELETE SET NULL,
    cover_letter TEXT,
    status application_status NOT NULL DEFAULT 'pending',
    applied_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(job_id, candidate_id) -- Prevent duplicate applications
);

-- 13. saved_jobs
CREATE TABLE saved_jobs (
    candidate_id UUID REFERENCES candidate_profiles(profile_id) ON DELETE CASCADE,
    job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (candidate_id, job_id)
);

-- 16. notifications
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL,
    read BOOLEAN NOT NULL DEFAULT false,
    link TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 17. employer_verifications
CREATE TABLE employer_verifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    requested_by UUID NOT NULL REFERENCES employer_profiles(profile_id) ON DELETE CASCADE,
    status verification_status NOT NULL DEFAULT 'pending',
    documents JSONB,
    reviewed_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    reviewed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 18. reported_jobs
CREATE TABLE reported_jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    reporter_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    reason TEXT NOT NULL,
    status verification_status NOT NULL DEFAULT 'pending',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 19. admin_actions
CREATE TABLE admin_actions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    admin_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    action_type TEXT NOT NULL,
    target_type TEXT NOT NULL,
    target_id UUID NOT NULL,
    details JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ==========================================
-- INDEXES
-- ==========================================
CREATE INDEX idx_jobs_title ON jobs (title);
CREATE INDEX idx_jobs_location ON jobs (location_id);
CREATE INDEX idx_jobs_category ON jobs (category_id);
CREATE INDEX idx_jobs_fresher ON jobs (fresher_eligible);
CREATE INDEX idx_jobs_status ON jobs (status);
CREATE INDEX idx_jobs_posted_at ON jobs (posted_at);
CREATE INDEX idx_jobs_company ON jobs (company_id);
CREATE INDEX idx_skills_name ON skills (name);
CREATE INDEX idx_applications_job ON applications (job_id);
CREATE INDEX idx_applications_candidate ON applications (candidate_id);

-- ==========================================
-- HELPER FUNCTIONS
-- ==========================================
-- Check if user is an admin
CREATE OR REPLACE FUNCTION is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles WHERE id = user_id AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check if user belongs to the company
CREATE OR REPLACE FUNCTION belongs_to_company(user_id UUID, check_company_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM employer_profiles WHERE profile_id = user_id AND company_id = check_company_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update updated_at timestamp function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON companies FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_jobs_updated_at BEFORE UPDATE ON jobs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_applications_updated_at BEFORE UPDATE ON applications FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger to auto-create profile on auth.users insert
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    new.id, 
    new.email, 
    new.raw_user_meta_data->>'full_name',
    COALESCE((new.raw_user_meta_data->>'role')::user_role, 'candidate'::user_role)
  );
  
  -- Also initialize specific profile tables based on role
  IF (new.raw_user_meta_data->>'role' = 'employer') THEN
    INSERT INTO public.employer_profiles (profile_id) VALUES (new.id);
  ELSE
    INSERT INTO public.candidate_profiles (profile_id) VALUES (new.id);
  END IF;
  
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ==========================================
-- ROW LEVEL SECURITY (RLS)
-- ==========================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidate_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE employer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidate_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE education ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE resumes ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Policies for profiles
CREATE POLICY "Public profiles are viewable by everyone" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Policies for candidate_profiles
CREATE POLICY "Candidate profiles are viewable by employers and admins" ON candidate_profiles FOR SELECT 
  USING (auth.uid() = profile_id OR is_admin(auth.uid()) OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'employer'));
CREATE POLICY "Candidates can update own profile details" ON candidate_profiles FOR UPDATE USING (auth.uid() = profile_id);

-- Policies for employer_profiles
CREATE POLICY "Employer profiles are viewable by everyone" ON employer_profiles FOR SELECT USING (true);
CREATE POLICY "Employers can update own details" ON employer_profiles FOR UPDATE USING (auth.uid() = profile_id);

-- Policies for companies
CREATE POLICY "Companies are viewable by everyone" ON companies FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert company" ON companies FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Employers can update their own company" ON companies FOR UPDATE 
  USING (belongs_to_company(auth.uid(), id) OR is_admin(auth.uid()));

-- Policies for jobs
CREATE POLICY "Published jobs are viewable by everyone" ON jobs FOR SELECT USING (status = 'published' OR is_admin(auth.uid()) OR belongs_to_company(auth.uid(), company_id));
CREATE POLICY "Employers can insert jobs for their company" ON jobs FOR INSERT WITH CHECK (belongs_to_company(auth.uid(), company_id));
CREATE POLICY "Employers can update their own jobs" ON jobs FOR UPDATE USING (belongs_to_company(auth.uid(), company_id) OR is_admin(auth.uid()));

-- Policies for applications
CREATE POLICY "Candidates can view their own applications" ON applications FOR SELECT USING (auth.uid() = candidate_id);
CREATE POLICY "Employers can view applications for their jobs" ON applications FOR SELECT 
  USING (EXISTS (SELECT 1 FROM jobs WHERE jobs.id = applications.job_id AND belongs_to_company(auth.uid(), jobs.company_id)));
CREATE POLICY "Candidates can insert applications" ON applications FOR INSERT WITH CHECK (auth.uid() = candidate_id);
CREATE POLICY "Employers can update application status" ON applications FOR UPDATE 
  USING (EXISTS (SELECT 1 FROM jobs WHERE jobs.id = applications.job_id AND belongs_to_company(auth.uid(), jobs.company_id)));

-- Policies for saved_jobs
CREATE POLICY "Candidates can manage their saved jobs" ON saved_jobs FOR ALL USING (auth.uid() = candidate_id);

-- Policies for candidate sub-data (education, projects, resumes, candidate_skills)
CREATE POLICY "Candidates manage own education" ON education FOR ALL USING (auth.uid() = candidate_id);
CREATE POLICY "Candidates manage own projects" ON projects FOR ALL USING (auth.uid() = candidate_id);
CREATE POLICY "Candidates manage own resumes" ON resumes FOR ALL USING (auth.uid() = candidate_id);
CREATE POLICY "Candidates manage own skills" ON candidate_skills FOR ALL USING (auth.uid() = candidate_id);

-- Employers & Admins can read candidate sub-data
CREATE POLICY "Employers can view candidate education" ON education FOR SELECT USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('employer', 'admin')));
CREATE POLICY "Employers can view candidate projects" ON projects FOR SELECT USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('employer', 'admin')));
CREATE POLICY "Employers can view candidate resumes" ON resumes FOR SELECT USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('employer', 'admin')));
CREATE POLICY "Employers can view candidate skills" ON candidate_skills FOR SELECT USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('employer', 'admin')));

-- Policies for public reference tables (locations, categories, skills)
CREATE POLICY "Locations viewable by all" ON locations FOR SELECT USING (true);
CREATE POLICY "Categories viewable by all" ON job_categories FOR SELECT USING (true);
CREATE POLICY "Skills viewable by all" ON skills FOR SELECT USING (true);
CREATE POLICY "Job skills viewable by all" ON job_skills FOR SELECT USING (true);

-- Admins can do everything (Bypass RLS can also be done via roles, but explicit policies help clarity)
CREATE POLICY "Admins have full access" ON profiles FOR ALL USING (is_admin(auth.uid()));

