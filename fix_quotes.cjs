const fs = require('fs');

function fixSyntax(file) {
  let c = fs.readFileSync(file, 'utf8');
  c = c.replace(/\\`Bearer \$\{session\?\.access_token\}\\`/g, "`Bearer ${session?.access_token}`");
  fs.writeFileSync(file, c);
}

fixSyntax('src/pages/candidate/Dashboard.tsx');
fixSyntax('src/pages/candidate/Profile.tsx');
fixSyntax('src/pages/employer/PostJob.tsx');
