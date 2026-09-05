const fs = require('fs');

let code = fs.readFileSync('src/pages/Home.tsx', 'utf-8');

code = code.replace(
  "const [searchQuery, setSearchQuery] = useState('');",
  "const [searchQuery, setSearchQuery] = useState('');\n  const [workModeFilter, setWorkModeFilter] = useState('All');"
);

code = code.replace(
  "const filteredJobs = useMemo(() => {",
  `const filteredJobs = useMemo(() => {
    let filtered = jobs;
    if (workModeFilter !== 'All') {
      filtered = filtered.filter(j => j.workMode === workModeFilter || (!j.workMode && workModeFilter === 'On-site'));
    }
`
);

code = code.replace(
  "if (!searchQuery.trim()) return jobs;",
  "if (!searchQuery.trim()) return filtered;"
);

code = code.replace(
  "return jobs.filter(j => ",
  "return filtered.filter(j => "
);

code = code.replace(
  "}, [jobs, searchQuery]);",
  "}, [jobs, searchQuery, workModeFilter]);"
);

code = code.replace(
  '<div className="relative w-full sm:w-96">',
  `<div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <div className="relative w-full sm:w-96">`
);

code = code.replace(
  '</div>\n        \n        <div className="text-sm font-medium text-gray-500 w-full sm:w-auto text-left sm:text-right font-mono">',
  `</div>
          <select 
            value={workModeFilter}
            onChange={(e) => setWorkModeFilter(e.target.value)}
            className="w-full sm:w-40 px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/50 shadow-sm transition-shadow text-gray-900 appearance-none"
          >
            <option value="All">All Modes</option>
            <option value="Remote">Remote</option>
            <option value="Hybrid">Hybrid</option>
            <option value="On-site">On-site</option>
          </select>
        </div>
        
        <div className="text-sm font-medium text-gray-500 w-full sm:w-auto text-left sm:text-right font-mono">`
);

fs.writeFileSync('src/pages/Home.tsx', code);
