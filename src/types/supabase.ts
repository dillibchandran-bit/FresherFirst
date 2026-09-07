import { Job, Company, Profile, Application, CandidateProfile, Education, Experience, Project, Resume } from './index';

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Omit<Profile, 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Profile, 'id' | 'created_at'>>;
      };
      candidate_profiles: {
        Row: CandidateProfile;
        Insert: CandidateProfile;
        Update: Partial<Omit<CandidateProfile, 'profile_id'>>;
      };
      education: {
        Row: Education;
        Insert: Omit<Education, 'id'>;
        Update: Partial<Omit<Education, 'id' | 'candidate_id'>>;
      };
      experience: {
        Row: Experience;
        Insert: Omit<Experience, 'id'>;
        Update: Partial<Omit<Experience, 'id' | 'candidate_id'>>;
      };
      projects: {
        Row: Project;
        Insert: Omit<Project, 'id'>;
        Update: Partial<Omit<Project, 'id' | 'candidate_id'>>;
      };
      resumes: {
        Row: Resume;
        Insert: Omit<Resume, 'id' | 'created_at'>;
        Update: Partial<Omit<Resume, 'id' | 'created_at' | 'candidate_id'>>;
      };
      companies: {
        Row: Company;
        Insert: Omit<Company, 'id' | 'created_at' | 'updated_at' | 'verified'>;
        Update: Partial<Omit<Company, 'id' | 'created_at'>>;
      };
      jobs: {
        Row: Job;
        Insert: Omit<Job, 'id' | 'created_at' | 'updated_at' | 'posted_at' | 'status'>;
        Update: Partial<Omit<Job, 'id' | 'created_at'>>;
      };
      applications: {
        Row: Application;
        Insert: Omit<Application, 'id' | 'applied_at' | 'updated_at' | 'status'>;
        Update: Partial<Omit<Application, 'id' | 'applied_at'>>;
      };
    };
    Views: {
      [_ in never]: never
    };
    Functions: {
      [_ in never]: never
    };
    Enums: {
      user_role: 'candidate' | 'employer' | 'admin';
      job_status: 'pending' | 'published' | 'closed' | 'rejected';
      work_mode: 'on_site' | 'hybrid' | 'remote';
      job_type: 'full_time' | 'part_time' | 'contract' | 'internship';
      application_status: 'pending' | 'reviewed' | 'shortlisted' | 'rejected' | 'hired';
    };
  };
}
