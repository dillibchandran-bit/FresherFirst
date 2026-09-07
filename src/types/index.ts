export type UserRole = 'CANDIDATE' | 'EMPLOYER' | 'ADMIN';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  created_at: string;
}

export interface Company {
  id: string;
  name: string;
  slug: string;
  website?: string;
  logo_url?: string;
  description?: string;
  verified: boolean;
  created_at: string;
}

export type JobStatus = 'PENDING' | 'PUBLISHED' | 'CLOSED' | 'REJECTED';
export type WorkMode = 'ON_SITE' | 'HYBRID' | 'REMOTE';
export type JobType = 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'INTERNSHIP';

export interface Job {
  id: string;
  title: string;
  slug: string;
  company_id: string;
  company?: Company;
  description: string;
  responsibilities: string[];
  requirements: string[];
  skills: string[];
  experience_min: number;
  experience_max: number;
  salary_min?: number;
  salary_max?: number;
  job_type: JobType;
  work_mode: WorkMode;
  location: string;
  education_requirements: string;
  fresher_eligible: boolean;
  deadline?: string;
  openings: number;
  status: JobStatus;
  verified: boolean;
  posted_at: string;
  created_at: string;
}
