const fs = require('fs');
let c = fs.readFileSync('src/pages/admin/Dashboard.tsx', 'utf8');
c = c.replace(/\\\`/g, '`');
fs.writeFileSync('src/pages/admin/Dashboard.tsx', c);
