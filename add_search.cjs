const fs = require('fs');
let content = fs.readFileSync('src/pages/admin/Dashboard.tsx', 'utf8');

// Add search states
const statesToInject = `
  const [jobSearch, setJobSearch] = useState('');
  const [empSearch, setEmpSearch] = useState('');
  const [candSearch, setCandSearch] = useState('');
`;

content = content.replace('const [locations, setLocations] = useState<any[]>([]);', 'const [locations, setLocations] = useState<any[]>([]);\n' + statesToInject);

// Job search UI and filter
const jobsUI = `
              <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Manage Jobs</h1>
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type="text" placeholder="Search jobs..." value={jobSearch} onChange={e => setJobSearch(e.target.value)} className="pl-9 pr-4 py-2 border rounded-lg text-sm" />
                </div>
              </div>
`;
content = content.replace('<h1 className="text-2xl font-bold text-gray-900 mb-6">Manage Jobs</h1>', jobsUI);
content = content.replace('{jobs.map(job => (', '{jobs.filter(j => j.title.toLowerCase().includes(jobSearch.toLowerCase()) || j.company?.name.toLowerCase().includes(jobSearch.toLowerCase())).map(job => (');

// Employers search UI and filter
const employersUI = `
              <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Manage Companies</h1>
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type="text" placeholder="Search companies..." value={empSearch} onChange={e => setEmpSearch(e.target.value)} className="pl-9 pr-4 py-2 border rounded-lg text-sm" />
                </div>
              </div>
`;
content = content.replace('<h1 className="text-2xl font-bold text-gray-900 mb-6">Manage Companies</h1>', employersUI);
content = content.replace('{companies.map(company => (', '{companies.filter(c => c.name.toLowerCase().includes(empSearch.toLowerCase())).map(company => (');

// Candidates search UI and filter
const candidatesUI = `
              <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Manage Candidates</h1>
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type="text" placeholder="Search name or email..." value={candSearch} onChange={e => setCandSearch(e.target.value)} className="pl-9 pr-4 py-2 border rounded-lg text-sm" />
                </div>
              </div>
`;
content = content.replace('<h1 className="text-2xl font-bold text-gray-900 mb-6">Manage Candidates</h1>', candidatesUI);
content = content.replace('{candidates.map(candidate => (', '{candidates.filter(c => (c.full_name || "").toLowerCase().includes(candSearch.toLowerCase()) || c.email.toLowerCase().includes(candSearch.toLowerCase())).map(candidate => (');


fs.writeFileSync('src/pages/admin/Dashboard.tsx', content);
