const fs = require('fs');

function fix(file) {
  let c = fs.readFileSync(file, 'utf8');
  c = c.replace(/\.single\(\)/g, '.maybeSingle()');
  fs.writeFileSync(file, c);
}

fix('src/pages/jobs/JobDetails.tsx');
fix('src/pages/employer/Dashboard.tsx');
