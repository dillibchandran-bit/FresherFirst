import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import fsPromises from "fs/promises";
import { blogPosts as staticPosts } from "./src/data/posts";

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  },
});

// Shared types
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

// In-memory cache to prevent spamming APIs on every reload

async function getManualJobs(): Promise<Job[]> {
  try {
    const data = await fsPromises.readFile('./src/data/manualJobs.json', 'utf-8');
    return JSON.parse(data);
  } catch (e) {
    return [];
  }
}

async function getManualBlogs(): Promise<any[]> {
  try {
    const data = await fsPromises.readFile('./src/data/manualBlogs.json', 'utf-8');
    return JSON.parse(data);
  } catch (e) {
    return [];
  }
}

let cachedJobs: Job[] = [];
let lastFetchTime = 0;
const CACHE_DURATION = 1000 * 60 * 15; // 15 minutes

const GREENHOUSE_TOKENS = ["razorpay", "chargebee", "cred", "meesho", "browserstack"];
const LEVER_TOKENS = ["postman", "vwo", "innovaccer"];

// Regexes for Quality Gate
const INCLUDE_REGEX = /fresher|entry-level|entry level|graduate|trainee|junior|intern/i;
const EXCLUDE_REGEX = /senior|lead|manager|director|principal|staff|\b3\+?\s*years\b|\b4\+?\s*years\b|\b5\+?\s*years\b/i;
const NON_TECH_REGEX = /sales|marketing|hr|human resources|recruiter|account executive|customer success|finance|legal|business development|bdr|sdr|seo/i;

function stripHtml(html: string) {
  return html.replace(/<[^>]*>?/gm, "").trim();
}

function isValidJob(title: string, description: string, postedAtStr: string): boolean {
  const combinedText = `${title} ${description}`;
  if (!INCLUDE_REGEX.test(title) && !INCLUDE_REGEX.test(description)) return false;
  if (EXCLUDE_REGEX.test(combinedText)) return false;
  if (NON_TECH_REGEX.test(title) || NON_TECH_REGEX.test(description)) return false;
  if (description.length < 200) return false;
  
  // 45 days check
  if (postedAtStr) {
    const postedAt = new Date(postedAtStr);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - postedAt.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays > 45) return false;
  }
  return true;
}

async function fetchRemotive(): Promise<Job[]> {
  try {
    const res = await fetch("https://remotive.com/api/remote-jobs");
    const data = await res.json();
    const jobs: Job[] = [];
    const validCategories = ["software-dev", "data", "qa", "it"]; // Tech related

    for (const j of data.jobs) {
      if (!validCategories.includes(j.category)) continue;
      
      const desc = stripHtml(j.description);
      if (isValidJob(j.title, desc, j.publication_date)) {
        jobs.push({
          id: `remotive-${j.id}`,
          title: j.title,
          company: j.company_name,
          location: j.candidate_required_location || "Remote",
          workMode: "Remote",
          source: "Remotive",
          url: j.url,
          postedAt: j.publication_date,
          excerpt: desc.substring(0, 150) + "...",
          tags: j.tags || [],
        });
      }
    }
    return jobs;
  } catch (err) {
    console.error("Failed to fetch Remotive:", err);
    return [];
  }
}

async function fetchGreenhouse(): Promise<Job[]> {
  let jobs: Job[] = [];
  for (const token of GREENHOUSE_TOKENS) {
    try {
      const res = await fetch(`https://boards-api.greenhouse.io/v1/boards/${token}/jobs?content=true`);
      if (!res.ok) {
        console.log(`[INFO] Greenhouse board ${token} failed with status: ${res.status}`);
        continue;
      }
      const data = await res.json();
      for (const j of data.jobs || []) {
        const desc = stripHtml(j.content || "");
        if (isValidJob(j.title, desc, j.updated_at)) {
          jobs.push({
            id: `greenhouse-${token}-${j.id}`,
            title: j.title,
            company: data.meta?.name || token,
            location: j.location?.name || "Multiple / Remote",
            workMode: (j.location?.name?.toLowerCase().includes("remote") || desc.toLowerCase().includes("remote")) ? "Remote" : "On-site",
            source: "Greenhouse",
            url: j.absolute_url,
            postedAt: j.updated_at,
            excerpt: desc.substring(0, 150) + "...",
            tags: [], // Greenhouse doesn't natively provide simple tags
          });
        }
      }
    } catch (err) {
      console.log(`[INFO] Failed to fetch Greenhouse for ${token}:`, err);
    }
  }
  return jobs;
}

async function fetchLever(): Promise<Job[]> {
  let jobs: Job[] = [];
  for (const token of LEVER_TOKENS) {
    try {
      const res = await fetch(`https://api.lever.co/v0/postings/${token}?mode=json`);
      if (!res.ok) {
        console.log(`[INFO] Lever board ${token} failed with status: ${res.status}`);
        continue;
      }
      const data = await res.json();
      for (const j of data || []) {
        const desc = stripHtml(j.descriptionPlain || "");
        if (isValidJob(j.text, desc, j.createdAt)) {
          jobs.push({
            id: `lever-${token}-${j.id}`,
            title: j.text,
            company: token,
            location: j.categories?.location || j.categories?.commitment || "Remote",
            workMode: ((j.categories?.location || "").toLowerCase().includes("remote") || desc.toLowerCase().includes("remote")) ? "Remote" : "On-site",
            source: "Lever",
            url: j.hostedUrl,
            postedAt: new Date(j.createdAt).toISOString(),
            excerpt: desc.substring(0, 150) + "...",
            tags: [j.categories?.team, j.categories?.department].filter(Boolean) as string[],
          });
        }
      }
    } catch (err) {
      console.log(`[INFO] Failed to fetch Lever for ${token}:`, err);
    }
  }
  return jobs;
}


async function fetchJobicy(): Promise<Job[]> {
  try {
    const res = await fetch("https://jobicy.com/api/v2/remote-jobs?count=100");
    const data = await res.json();
    const jobs: Job[] = [];
    for (const j of data.jobs || []) {
      const desc = stripHtml(j.jobDescription || "");
      if (isValidJob(j.jobTitle, desc, j.pubDate)) {
        jobs.push({
          id: `jobicy-${j.id}`,
          title: j.jobTitle,
          company: j.companyName,
          location: j.jobGeo || "Remote",
          workMode: "Remote",
          source: "Jobicy",
          url: j.url,
          postedAt: j.pubDate,
          excerpt: desc.substring(0, 150) + "...",
          tags: [],
        });
      }
    }
    return jobs;
  } catch (err) {
    console.error("Failed to fetch Jobicy:", err);
    return [];
  }
}

async function fetchArbeitnow(): Promise<Job[]> {
  try {
    const res = await fetch("https://www.arbeitnow.com/api/job-board-api");
    const data = await res.json();
    const jobs: Job[] = [];
    for (const j of data.data || []) {
      const desc = stripHtml(j.description || "");
      const postedAt = new Date(j.created_at * 1000).toISOString();
      if (isValidJob(j.title, desc, postedAt)) {
        jobs.push({
          id: `arbeitnow-${j.slug}`,
          title: j.title,
          company: j.company_name,
          location: j.location || (j.remote ? "Remote" : "N/A"),
          workMode: j.remote ? "Remote" : (j.location?.toLowerCase().includes("remote") ? "Remote" : "On-site"),
          source: "Arbeitnow",
          url: j.url,
          postedAt: postedAt,
          excerpt: desc.substring(0, 150) + "...",
          tags: j.tags || [],
        });
      }
    }
    return jobs;
  } catch (err) {
    console.error("Failed to fetch Arbeitnow:", err);
    return [];
  }
}

async function fetchHimalayas(): Promise<Job[]> {
  try {
    const res = await fetch("https://himalayas.app/jobs/api?limit=100");
    const data = await res.json();
    const jobs: Job[] = [];
    for (const j of data.jobs || []) {
      const desc = stripHtml(j.description || "");
      const postedAt = new Date(j.pubDate * 1000).toISOString();
      if (isValidJob(j.title, desc, postedAt)) {
        jobs.push({
          id: `himalayas-${j.guid || Date.now()}`,
          title: j.title,
          company: j.companyName,
          location: (j.locationRestrictions && j.locationRestrictions.length > 0) ? j.locationRestrictions.join(", ") : "Remote",
          workMode: "Remote",
          source: "Himalayas",
          url: j.applicationLink,
          postedAt: postedAt,
          excerpt: desc.substring(0, 150) + "...",
          tags: j.categories || [],
        });
      }
    }
    return jobs;
  } catch (err) {
    console.error("Failed to fetch Himalayas:", err);
    return [];
  }
}

async function getAllJobs(): Promise<Job[]> {

  if (cachedJobs.length > 0 && Date.now() - lastFetchTime < CACHE_DURATION) {
    return cachedJobs;
  }

  const [remotive, greenhouse, lever, jobicy, arbeitnow, himalayas] = await Promise.all([
    fetchRemotive(),
    fetchGreenhouse(),
    fetchLever(),
    fetchJobicy(),
    fetchArbeitnow(),
    fetchHimalayas(),
  ]);

  const manualJobs = await getManualJobs();
  const allJobs = [...remotive, ...greenhouse, ...lever, ...jobicy, ...arbeitnow, ...himalayas, ...manualJobs];

  // De-duplicate by title + company
  const seen = new Set<string>();
  const uniqueJobs: Job[] = [];

  for (const j of allJobs) {
    const key = `${j.title.toLowerCase().trim()}|${j.company.toLowerCase().trim()}`;
    if (!seen.has(key)) {
      seen.add(key);
      uniqueJobs.push(j);
    }
  }

  // Sort by most recent
  uniqueJobs.sort((a, b) => new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime());

  cachedJobs = uniqueJobs;
  lastFetchTime = Date.now();
  return uniqueJobs;
}


const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "fresher123";
app.use("/api/admin", (req, res, next) => {
  const auth = req.headers.authorization;
  if (auth === `Bearer ${ADMIN_PASSWORD}`) {
    next();
  } else {
    res.status(401).json({ error: "Unauthorized" });
  }
});

app.post("/api/admin/jobs", async (req, res) => {
  try {
    const newJob = req.body;
    
    // Quality Gate
    if (!isValidJob(newJob.title, newJob.excerpt, newJob.postedAt)) {
      return res.status(400).json({ error: "Job does not meet fresher quality gate requirements." });
    }
    
    newJob.id = "manual-" + Date.now();
    newJob.source = "Manual";
    newJob.isManual = true;
    
    const jobs = await getManualJobs();
    jobs.push(newJob);
    await fsPromises.writeFile('./src/data/manualJobs.json', JSON.stringify(jobs, null, 2));
    
    // Invalidate cache
    lastFetchTime = 0;
    
    res.json({ success: true, job: newJob });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

app.post("/api/admin/blogs", async (req, res) => {
  try {
    const newBlog = req.body;
    const blogs = await getManualBlogs();
    blogs.push(newBlog);
    await fsPromises.writeFile('./src/data/manualBlogs.json', JSON.stringify(blogs, null, 2));
    res.json({ success: true, blog: newBlog });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

app.get("/api/blogs", async (req, res) => {
  try {
    const manualBlogs = await getManualBlogs();
    const allBlogs = [...staticPosts, ...manualBlogs];
    const published = allBlogs.filter(b => b.status !== 'Draft');
    res.json({ blogs: published });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

app.get("/api/blogs/:slug", async (req, res) => {
  try {
    const manualBlogs = await getManualBlogs();
    const allBlogs = [...staticPosts, ...manualBlogs];
    const blog = allBlogs.find(b => b.id === req.params.slug);
    if (!blog) return res.status(404).json({ error: "Not found" });
    res.json(blog);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

app.get("/api/jobs", async (req, res) => {
  const jobs = await getAllJobs();
  res.json({ jobs });
});

app.post("/api/chat", async (req, res) => {
  try {
    const { profile } = req.body;
    if (!profile) return res.status(400).json({ error: "Profile is required" });

    const jobs = await getAllJobs();
    
    // Create a compact list for Gemini to analyze
    const compactJobs = jobs.map(j => ({
      id: j.id,
      title: j.title,
      company: j.company,
      tags: j.tags.join(", "),
      excerpt: j.excerpt
    }));

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: `User Profile: "${profile}"
      
Find the 3 most relevant jobs from this JSON list of jobs for the user profile above.
Use semantic matching (skills, potential roles) rather than exact keyword matches.
Jobs List: ${JSON.stringify(compactJobs)}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          description: "List of exactly 3 most relevant job IDs based on the user's profile.",
          items: {
            type: Type.STRING
          }
        }
      }
    });

    let matchedIds: string[] = [];
    try {
      matchedIds = JSON.parse(response.text.trim());
    } catch (e) {
      console.error("Failed to parse Gemini response", e);
      return res.status(500).json({ error: "Failed to process matches" });
    }

    const matchedJobs = matchedIds
      .map(id => jobs.find(j => j.id === id))
      .filter(Boolean);

    res.json({ jobs: matchedJobs });
  } catch (error) {
    console.error("Chat error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/api/resume-check", async (req, res) => {
  try {
    const { resumeText } = req.body;
    if (!resumeText) return res.status(400).json({ error: "Resume text is required" });

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: `You are an expert ATS (Applicant Tracking System) parser and recruiter for entry-level Indian tech roles. 
Analyze the following resume text specifically for a 'fresher' (entry-level) candidate.

Resume Text:
"""
${resumeText}
"""

Provide your analysis matching the required JSON schema.
- atsScore: A score out of 100 based on standard section headers, clean text, and readability.
- feedback: Notes on whether it reads clearly as a fresher resume (e.g., flag if they claim 5 years of experience but are a fresh grad, or if formatting seems broken).
- bulletsToFix: Identify up to 3 vague bullet points (e.g. "worked on project", "did bug fixes") and provide a concrete rewrite (e.g. using XYZ metric or specific technologies). If none, return an empty array.
- topFixes: Exactly 3 short sentences on the most critical things to fix first.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            atsScore: { type: Type.INTEGER },
            feedback: { type: Type.ARRAY, items: { type: Type.STRING } },
            bulletsToFix: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  original: { type: Type.STRING },
                  suggestion: { type: Type.STRING },
                  reason: { type: Type.STRING },
                },
                required: ["original", "suggestion", "reason"]
              }
            },
            topFixes: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          },
          required: ["atsScore", "feedback", "bulletsToFix", "topFixes"]
        }
      }
    });

    const result = JSON.parse(response.text.trim());
    res.json(result);
  } catch (error) {
    console.error("Resume check error:", error);
    res.status(500).json({ error: "Internal server error analyzing resume" });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
