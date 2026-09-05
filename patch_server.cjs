const fs = require('fs');

let serverCode = fs.readFileSync('server.ts', 'utf-8');

// Add imports
serverCode = serverCode.replace('import { GoogleGenAI, Type } from "@google/genai";', 'import { GoogleGenAI, Type } from "@google/genai";\nimport fsPromises from "fs/promises";\nimport { blogPosts as staticPosts } from "./src/data/posts";');

// Update Job interface
serverCode = serverCode.replace(
`export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  source: string;
  url: string;
  postedAt: string;
  excerpt: string;
  tags: string[];
}`,
`export interface Job {
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
}`
);

// We need a helper to read manual jobs
const helperCode = `
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
`;

serverCode = serverCode.replace('let cachedJobs: Job[] = [];', helperCode + '\nlet cachedJobs: Job[] = [];');

// Update getAllJobs
serverCode = serverCode.replace(
  'const allJobs = [...remotive, ...greenhouse, ...lever];',
  'const manualJobs = await getManualJobs();\n  const allJobs = [...remotive, ...greenhouse, ...lever, ...manualJobs];'
);

// Admin Middleware and endpoints
const adminCode = `
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "fresher123";
app.use("/api/admin", (req, res, next) => {
  const auth = req.headers.authorization;
  if (auth === \`Bearer \${ADMIN_PASSWORD}\`) {
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
`;

serverCode = serverCode.replace('app.get("/api/jobs", async (req, res) => {', adminCode + '\napp.get("/api/jobs", async (req, res) => {');

// Update workMode inference in Remotive, Greenhouse, Lever
serverCode = serverCode.replace(
  'location: j.candidate_required_location || "Remote",',
  'location: j.candidate_required_location || "Remote",\n          workMode: "Remote",'
);

serverCode = serverCode.replace(
  'location: j.location?.name || "Multiple / Remote",',
  'location: j.location?.name || "Multiple / Remote",\n            workMode: (j.location?.name?.toLowerCase().includes("remote") || desc.toLowerCase().includes("remote")) ? "Remote" : "On-site",'
);

serverCode = serverCode.replace(
  'location: j.categories?.location || j.categories?.commitment || "Remote",',
  'location: j.categories?.location || j.categories?.commitment || "Remote",\n            workMode: ((j.categories?.location || "").toLowerCase().includes("remote") || desc.toLowerCase().includes("remote")) ? "Remote" : "On-site",'
);

fs.writeFileSync('server.ts', serverCode);
