const fs = require('fs');
let cp = fs.readFileSync('src/pages/candidate/Profile.tsx', 'utf8');
cp = cp.replace('(await supabase) as any.storage.from', 'await supabase.storage.from');
cp = cp.replace('const { data, error } = (await supabase) as any', 'const { data, error } = await supabase');
fs.writeFileSync('src/pages/candidate/Profile.tsx', cp);
