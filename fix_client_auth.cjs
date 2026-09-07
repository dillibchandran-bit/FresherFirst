const fs = require('fs');

function fixFetch(file) {
  let c = fs.readFileSync(file, 'utf8');
  if (c.includes('const { data: { session } } = await supabase.auth.getSession();')) return; // already fixed
  
  c = c.replace(
    /const res = await fetch\('\/api\/ai\//g,
    `const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch('/api/ai/`
  );
  
  c = c.replace(
    /headers: \{ 'Content-Type': 'application\/json' \}/g,
    `headers: { 'Content-Type': 'application/json', 'Authorization': \\\`Bearer \${session?.access_token}\\\` }`
  );
  
  fs.writeFileSync(file, c);
}

fixFetch('src/pages/candidate/Profile.tsx');
fixFetch('src/pages/candidate/Dashboard.tsx');
fixFetch('src/pages/employer/PostJob.tsx');
