import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.VITE_SUPABASE_URL || 'http://localhost:54321', 
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || ''
);

const requireAuth = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: Missing Authorization header' });
  }
  
  const token = authHeader.split(' ')[1];
  const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
  
  if (error || !user) {
    return res.status(401).json({ error: 'Unauthorized: Invalid token' });
  }
  
  (req as any).user = user;
  next();
};


const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || 'dummy_key',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // === AI Endpoints ===

  app.post("/api/ai/extract-resume", requireAuth, async (req, res) => {
    try {
      const { resumeText } = req.body;
      if (!process.env.GEMINI_API_KEY) {
        return res.status(500).json({ error: "Gemini API key is missing on the server." });
      }

      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: `Extract the following information from the provided resume text. Return it as structured JSON.\n\nResume Text:\n${resumeText}`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              skills: { type: Type.ARRAY, items: { type: Type.STRING }, description: "List of technical and soft skills." },
              technologies: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Specific software, tools, languages, or frameworks." },
              education: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Degrees, institutions, and graduation years." },
              projects: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Titles or brief descriptions of key projects." },
              experience: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Companies worked for and job titles." },
              job_role_keywords: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Keywords representing suitable job roles." }
            },
            required: ["skills", "technologies", "education", "projects", "experience", "job_role_keywords"]
          }
        }
      });
      
      const parsed = JSON.parse(response.text || '{}');
      res.json(parsed);
    } catch (err: any) {
      console.error('AI Error:', err);
      res.status(500).json({ error: err.message || 'Failed to extract resume.' });
    }
  });

  app.post("/api/ai/suggest-jobs", requireAuth, async (req, res) => {
    try {
      const { candidateProfile, jobs } = req.body;
      if (!process.env.GEMINI_API_KEY) {
        return res.status(500).json({ error: "Gemini API key is missing on the server." });
      }
      // Note: We just ask the AI to score/filter the passed jobs based on the profile.
      // We are explicitly not making a final hiring decision, just returning recommendations.
      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: `You are a helpful AI career assistant. Given the following candidate profile and a list of open jobs, suggest the top 3 most relevant jobs for this candidate based on skills, location, experience, and education. Explain briefly why each is a good fit. DO NOT make definitive hiring decisions or claim these are guaranteed matches.\n\nCandidate Profile:\n${JSON.stringify(candidateProfile)}\n\nJobs Available:\n${JSON.stringify(jobs)}`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              recommendations: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    job_id: { type: Type.STRING },
                    reason: { type: Type.STRING, description: "Brief explanation of why this job fits the candidate." }
                  },
                  required: ["job_id", "reason"]
                }
              }
            },
            required: ["recommendations"]
          }
        }
      });
      const parsed = JSON.parse(response.text || '{}');
      res.json(parsed);
    } catch (err: any) {
      console.error('AI Error:', err);
      res.status(500).json({ error: err.message || 'Failed to suggest jobs.' });
    }
  });

  app.post("/api/ai/improve-resume", requireAuth, async (req, res) => {
    try {
      const { resumeText } = req.body;
      if (!process.env.GEMINI_API_KEY) {
        return res.status(500).json({ error: "Gemini API key is missing on the server." });
      }
      
      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: `Review the following resume text and provide suggestions for improvement. Focus on missing skills, unclear project descriptions, and formatting or content improvements. Be constructive and helpful.\n\nResume Text:\n${resumeText}`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              missing_skills: { type: Type.ARRAY, items: { type: Type.STRING } },
              project_improvements: { type: Type.ARRAY, items: { type: Type.STRING } },
              general_formatting: { type: Type.ARRAY, items: { type: Type.STRING } }
            },
            required: ["missing_skills", "project_improvements", "general_formatting"]
          }
        }
      });
      const parsed = JSON.parse(response.text || '{}');
      res.json(parsed);
    } catch (err: any) {
      console.error('AI Error:', err);
      res.status(500).json({ error: err.message || 'Failed to analyze resume.' });
    }
  });

  app.post("/api/ai/structure-job", requireAuth, async (req, res) => {
    try {
      const { roughDescription } = req.body;
      if (!process.env.GEMINI_API_KEY) {
        return res.status(500).json({ error: "Gemini API key is missing on the server." });
      }
      
      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: `You are an AI assistant helping an employer structure a job description. Based on the following rough notes, generate structured responsibilities, requirements, and key skills. Ensure the tone is professional. Do not invent requirements that are not implied.\n\nRough Notes:\n${roughDescription}`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title_suggestion: { type: Type.STRING },
              description_intro: { type: Type.STRING },
              responsibilities: { type: Type.ARRAY, items: { type: Type.STRING } },
              requirements: { type: Type.ARRAY, items: { type: Type.STRING } },
              skills: { type: Type.ARRAY, items: { type: Type.STRING } }
            },
            required: ["title_suggestion", "description_intro", "responsibilities", "requirements", "skills"]
          }
        }
      });
      const parsed = JSON.parse(response.text || '{}');
      res.json(parsed);
    } catch (err: any) {
      console.error('AI Error:', err);
      res.status(500).json({ error: err.message || 'Failed to structure job.' });
    }
  });


  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
