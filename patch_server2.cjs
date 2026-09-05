const fs = require('fs');

let serverCode = fs.readFileSync('server.ts', 'utf-8');

const fetchersCode = `
async function fetchJobicy(): Promise<Job[]> {
  try {
    const res = await fetch("https://jobicy.com/api/v2/remote-jobs?count=100");
    const data = await res.json();
    const jobs: Job[] = [];
    for (const j of data.jobs || []) {
      const desc = stripHtml(j.jobDescription || "");
      if (isValidJob(j.jobTitle, desc, j.pubDate)) {
        jobs.push({
          id: \`jobicy-\${j.id}\`,
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
          id: \`arbeitnow-\${j.slug}\`,
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
          id: \`himalayas-\${j.guid || Date.now()}\`,
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
`;

serverCode = serverCode.replace("async function getAllJobs(): Promise<Job[]> {", fetchersCode);

serverCode = serverCode.replace(
  "const [remotive, greenhouse, lever] = await Promise.all([",
  "const [remotive, greenhouse, lever, jobicy, arbeitnow, himalayas] = await Promise.all(["
);

serverCode = serverCode.replace(
  "fetchLever(),",
  "fetchLever(),\n    fetchJobicy(),\n    fetchArbeitnow(),\n    fetchHimalayas(),"
);

serverCode = serverCode.replace(
  "const allJobs = [...remotive, ...greenhouse, ...lever, ...manualJobs];",
  "const allJobs = [...remotive, ...greenhouse, ...lever, ...jobicy, ...arbeitnow, ...himalayas, ...manualJobs];"
);

fs.writeFileSync('server.ts', serverCode);
