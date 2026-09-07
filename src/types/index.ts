export type UserRole = 'candidate' | 'employer' | 'admin';
export type JobStatus = 'draft' | 'pending' | 'published' | 'closed' | 'rejected';
export type WorkMode = 'on_site' | 'hybrid' | 'remote';
export type JobType = 'full_time' | 'part_time' | 'contract' | 'internship';
export type ApplicationStatus = 'pending' | 'reviewed' | 'shortlisted' | 'rejected' | 'hired';
export type VerificationStatus = 'pending' | 'approved' | 'rejected';

export interface Profile {
  id: string;
  role: UserRole;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface CandidateProfile {
  profile_id: string;
  phone: string | null;
  about: string | null;
  github_url: string | null;
  linkedin_url: string | null;
  portfolio_url: string | null;
  city: string | null;
  preferred_locations: string[] | null;
  career_objective: string | null;
  preferred_roles: string[] | null;
  work_mode: WorkMode | null;
  expected_salary: number | null;
}

export interface EmployerProfile {
  profile_id: string;
  company_id: string | null;
  position_in_company: string | null;
  created_at: string;
  updated_at: string;
}

export interface Education {
  id: string;
  candidate_id: string;
  institution: string;
  degree: string;
  field_of_study: string;
  start_date: string | null;
  end_date: string | null;
  grade: string | null;
}

export interface Experience {
  id: string;
  candidate_id: string;
  company: string;
  role: string;
  start_date: string | null;
  end_date: string | null;
  description: string | null;
}

export interface Project {
  id: string;
  candidate_id: string;
  title: string;
  description: string;
  url: string | null;
  repo_url: string | null;
  start_date: string | null;
  end_date: string | null;
}

export interface Resume {
  id: string;
  candidate_id: string;
  file_url: string;
  is_primary: boolean;
  created_at: string;
}

export interface Company {
  id: string;
  name: string;
  slug: string;
  website: string | null;
  logo_url: string | null;
  description: string | null;
  verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface Location {
  id: string;
  name: string;
  slug: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
}

export interface Job {
  id: string;
  company_id: string;
  category_id: string | null;
  location_id: string | null;
  title: string;
  slug: string;
  description: string;
  responsibilities: string[];
  requirements: string[];
  skills_list: string[];
  experience_min: number;
  experience_max: number;
  salary_min: number | null;
  salary_max: number | null;
  salary_period: string;
  job_type: JobType;
  work_mode: WorkMode;
  education_requirements: string | null;
  fresher_eligible: boolean;
  deadline: string | null;
  openings: number;
  status: JobStatus;
  posted_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface JobWithDetails extends Job {
  company: Company;
  location?: Location;
  category?: Category;
}

export interface Application {
  id: string;
  job_id: string;
  candidate_id: string;
  resume_id: string | null;
  cover_letter: string | null;
  status: ApplicationStatus;
  applied_at: string;
  updated_at: string;
}
