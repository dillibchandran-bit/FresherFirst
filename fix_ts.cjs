const fs = require('fs');

let c = fs.readFileSync('src/pages/employer/Dashboard.tsx', 'utf8');
c = c.replace(/\.select\(\)\.single\(\)\n\s*\.select\(\)\n\s*\.maybeSingle\(\);/g, '.select().single();');
fs.writeFileSync('src/pages/employer/Dashboard.tsx', c);
