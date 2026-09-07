const fs = require('fs');
let server = fs.readFileSync('server.ts', 'utf8');

// I will insert a basic auth middleware
let mw = `
import { createClient } from '@supabase/supabase-js';
const supabaseAdmin = createClient(
  process.env.VITE_SUPABASE_URL || 'http://localhost:54321', 
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || ''
);

// Middleware to verify Supabase token
const requireAuth = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing Authorization header' });
  }
  
  const token = authHeader.split(' ')[1];
  const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
  
  if (error || !user) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
  
  // Attach user to req for downstream usage
  (req as any).user = user;
  next();
};
`;

server = server.replace('const ai = new GoogleGenAI({', mw + '\nconst ai = new GoogleGenAI({');
server = server.replace(/app\.post\("\/api\/ai\//g, 'app.post("/api/ai/');

console.log('Modified AI routes');
