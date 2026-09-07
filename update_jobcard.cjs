const fs = require('fs');
let c = fs.readFileSync('src/components/jobs/JobCard.tsx', 'utf8');

c = c.replace(
  "import { MapPin, Briefcase, IndianRupee, Clock, CheckCircle2, GraduationCap } from 'lucide-react';",
  "import { MapPin, Briefcase, IndianRupee, Clock, CheckCircle2, GraduationCap, ShieldCheck, Award } from 'lucide-react';"
);

// update Fresher Friendly
c = c.replace("Fresher Friendly", "Freshers Welcome");

// update checkCircle2 verified check
c = c.replace(
  "job.company.verified && (",
  "job.company.verification_status === 'verified' && ("
);

// add little verified badges inside the card maybe? Or keep it clean.
// "Freshers Welcome" is top right banner. Maybe add a "Verified Job" banner top left if verified? Or just small tags in the skills area.
// Just leave CheckCircle2 for verified company as it is already next to company name.

fs.writeFileSync('src/components/jobs/JobCard.tsx', c);
