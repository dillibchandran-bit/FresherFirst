const fs = require('fs');

let c1 = fs.readFileSync('src/components/jobs/JobCard.tsx', 'utf8');
c1 = c1.replace('<CheckCircle2 className="w-4 h-4 text-green-500 ml-1 flex-shrink-0" title="Verified Company" />', '<span title="Verified Company"><CheckCircle2 className="w-4 h-4 text-green-500 ml-1 flex-shrink-0" /></span>');
fs.writeFileSync('src/components/jobs/JobCard.tsx', c1);

let c2 = fs.readFileSync('src/pages/jobs/JobDetails.tsx', 'utf8');
c2 = c2.replace('<CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" title="Verified Company" />', '<span title="Verified Company"><CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" /></span>');
fs.writeFileSync('src/pages/jobs/JobDetails.tsx', c2);

