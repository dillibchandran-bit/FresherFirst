const fs = require('fs');
let s = fs.readFileSync('server.ts', 'utf8');

const mw = `import { createClient } from '@supabase/supabase-js';

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
`;

s = s.replace('import { GoogleGenAI, Type } from "@google/genai";', 'import { GoogleGenAI, Type } from "@google/genai";\n' + mw);
s = s.replace(/app\.post\("\/api\/ai\/(extract-resume|suggest-jobs|improve-resume|structure-job)", async \(req, res\) => {/g, 'app.post("/api/ai/$1", requireAuth, async (req, res) => {');

fs.writeFileSync('server.ts', s);
