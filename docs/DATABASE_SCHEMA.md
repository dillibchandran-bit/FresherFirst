# Fresher First - Database Schema

This document outlines the Supabase PostgreSQL database structure designed for Fresher First.

## Core Principles
- **Normalized Architecture**: Data is separated into distinct, related tables to avoid redundancy.
- **UUIDs**: Used as Primary Keys globally for security and scaling.
- **Row Level Security (RLS)**: Enforced on all tables. Users only see and modify what they own.
- **Role-Based Access**: Distinguishes between `candidate`, `employer`, and `admin`.

## Schema Overview (19 Tables)

### Authentication & Profiles
1. **`profiles`**: Extends `auth.users`. Stores basic info (email, role, name, avatar).
2. **`candidate_profiles`**: Candidate-specific data (phone, portfolio, github).
3. **`employer_profiles`**: Employer-specific data (company_id, position).

### Company & Job Entities
4. **`companies`**: Organization details. (name, website, verification status).
5. **`locations`**: Cities/Regions (OMR, Navalur, etc).
6. **`job_categories`**: Domains (Software Dev, QA, etc).
7. **`jobs`**: Core job listings. Connects to companies, categories, locations.
8. **`skills`**: Master list of tech skills.
9. **`job_skills`**: Many-to-many relationship mapping jobs to skills.

### Candidate Details
10. **`candidate_skills`**: Skills claimed by a candidate.
11. **`education`**: Candidate's academic history.
12. **`projects`**: Candidate's portfolio projects.
13. **`resumes`**: Uploaded resume metadata/parsing.

### Interaction & Platform
14. **`applications`**: Tracks candidate job submissions and status.
15. **`saved_jobs`**: Candidate bookmarks.
16. **`notifications`**: In-app alerts for users.
17. **`employer_verifications`**: Admin workflow to approve companies.
18. **`reported_jobs`**: Community moderation tool.
19. **`admin_actions`**: Audit log of admin changes.

## Row Level Security (RLS) Rules

*   **Candidates**: 
    *   `SELECT`: Can view published jobs, public companies, and own private data.
    *   `INSERT/UPDATE/DELETE`: Only on tables where `candidate_id = auth.uid()` (e.g., `education`, `applications`, `saved_jobs`).
*   **Employers**:
    *   `SELECT`: Can view candidate profiles and resumes *if* the candidate applied to their job (via application join).
    *   `INSERT`: Can post jobs under their `company_id`.
    *   `UPDATE`: Can edit their own jobs, company details, and application statuses for their jobs.
*   **Admins**: Full access to all tables via `is_admin()` PostgreSQL function.

## Indexing Strategy
Indexes are configured on high-traffic filter points:
- `jobs.title`, `jobs.location_id`, `jobs.category_id`, `jobs.company_id` (For search/filter UI)
- `jobs.fresher_eligible` (Crucial for the core value proposition)
- `jobs.status` (To quickly filter out closed/rejected jobs)

## Implementation Instructions
To apply this database:
1. Log into your Supabase Dashboard.
2. Go to **SQL Editor**.
3. Copy the contents of `supabase/migrations/0001_initial_schema.sql`.
4. Run the script.
