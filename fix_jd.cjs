const fs = require('fs');
let jd = fs.readFileSync('src/pages/jobs/JobDetails.tsx', 'utf8');
jd = jd.replace('coverLetter.trim( as any)', 'coverLetter.trim()');
jd = jd.replace("job!.id,", "job!.id as any,");
jd = jd.replace("candidate_id: user!.id,", "candidate_id: user!.id as any,");
jd = jd.replace("resume_id: selectedResumeId || null,", "resume_id: selectedResumeId || null as any,");
jd = jd.replace("cover_letter: coverLetter.trim() || null,", "cover_letter: coverLetter.trim() || null as any,");
fs.writeFileSync('src/pages/jobs/JobDetails.tsx', jd);
