const fs = require('fs');
let c1 = fs.readFileSync('src/components/layout/SEO.tsx', 'utf8');
c1 = c1.replace(/\\\`/g, '`');
c1 = c1.replace(/\\\$/g, '$');
fs.writeFileSync('src/components/layout/SEO.tsx', c1);

let c2 = fs.readFileSync('src/pages/jobs/JobList.tsx', 'utf8');
c2 = c2.replace(/\\\`/g, '`');
c2 = c2.replace(/\\\$/g, '$');
fs.writeFileSync('src/pages/jobs/JobList.tsx', c2);

let c3 = fs.readFileSync('src/pages/jobs/JobDetails.tsx', 'utf8');
c3 = c3.replace(/\\\`/g, '`');
c3 = c3.replace(/\\\$/g, '$');
fs.writeFileSync('src/pages/jobs/JobDetails.tsx', c3);
