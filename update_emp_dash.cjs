const fs = require('fs');
let c = fs.readFileSync('src/pages/employer/Dashboard.tsx', 'utf8');

const replacement = `
            {company.verification_status === 'verified' && <span className="inline-flex items-center gap-1 text-xs font-medium text-green-700 bg-green-50 px-2 py-0.5 rounded-full"><CheckCircle2 className="w-3 h-3"/> Verified</span>}
            {company.verification_status === 'pending' && <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full"><Clock className="w-3 h-3"/> Verification Pending</span>}
            {company.verification_status === 'rejected' && <span className="inline-flex items-center gap-1 text-xs font-medium text-red-700 bg-red-50 px-2 py-0.5 rounded-full">Verification Rejected</span>}
            {company.verification_status === 'suspended' && <span className="inline-flex items-center gap-1 text-xs font-medium text-red-700 bg-red-50 px-2 py-0.5 rounded-full">Suspended</span>}
            {(!company.verification_status || company.verification_status === 'unverified') && <span className="inline-flex items-center gap-1 text-xs font-medium text-gray-700 bg-gray-100 px-2 py-0.5 rounded-full">Unverified</span>}
`;

c = c.replace(/\{company\.verified \?[\s\S]*?Pending Verification<\/span>\s*\}/, replacement);
fs.writeFileSync('src/pages/employer/Dashboard.tsx', c);
