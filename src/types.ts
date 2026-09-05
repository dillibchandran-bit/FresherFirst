export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  source: string;
  url: string;
  postedAt: string;
  excerpt: string;
  tags: string[];
  workMode?: "Remote" | "Hybrid" | "On-site";
  employmentType?: string;
  experienceLevel?: string;
  validThrough?: string;
  isManual?: boolean;
}
