const fs = require('fs');

function replaceLazy(filePath) {
  let c = fs.readFileSync(filePath, 'utf8');
  c = c.replace(/<img (.*?)(?<!loading="lazy" )>/g, '<img loading="lazy" $1>');
  fs.writeFileSync(filePath, c);
}

replaceLazy('src/pages/jobs/JobDetails.tsx');
replaceLazy('src/components/jobs/JobCard.tsx');
replaceLazy('src/pages/candidate/Applications.tsx');
replaceLazy('src/pages/employer/ManageApplicants.tsx');

