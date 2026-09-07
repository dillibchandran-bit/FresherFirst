const fs = require('fs');
let jd = fs.readFileSync('src/pages/jobs/JobDetails.tsx', 'utf8');
jd = jd.replace(/use\(r as any\)\.id/g, 'user!.id');
fs.writeFileSync('src/pages/jobs/JobDetails.tsx', jd);

let sb = fs.readFileSync('src/lib/supabase.ts', 'utf8');
sb = `/// <reference types="vite/client" />\n` + sb;
fs.writeFileSync('src/lib/supabase.ts', sb);
