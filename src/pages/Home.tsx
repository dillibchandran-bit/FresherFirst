import { useEffect, useState, useMemo } from 'react';
import { Search, Briefcase, Loader2 } from 'lucide-react';
import { Job } from '../types';
import JobCard from '../components/JobCard';
import ChatAssistant from '../components/ChatAssistant';

export default function Home() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [workModeFilter, setWorkModeFilter] = useState('All');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchJobs() {
      try {
        const res = await fetch('/api/jobs');
        if (!res.ok) throw new Error('Failed to fetch jobs');
        const data = await res.json();
        setJobs(data.jobs || []);
      } catch (err: any) {
        setError(err.message || 'Failed to load jobs');
      } finally {
        setIsLoading(false);
      }
    }
    fetchJobs();
  }, []);

  const filteredJobs = useMemo(() => {
    let filtered = jobs;
    if (workModeFilter !== 'All') {
      filtered = filtered.filter(j => j.workMode === workModeFilter || (!j.workMode && workModeFilter === 'On-site'));
    }

    if (!searchQuery.trim()) return filtered;
    const q = searchQuery.toLowerCase();
    return filtered.filter(j => 
      j.title.toLowerCase().includes(q) ||
      j.company.toLowerCase().includes(q) ||
      j.location.toLowerCase().includes(q) ||
      j.tags.some(t => t.toLowerCase().includes(q))
    );
  }, [jobs, searchQuery, workModeFilter]);

  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <h2 className="font-serif text-4xl sm:text-5xl font-bold text-gray-900 mb-4 tracking-tight">
          Your first tech job,<br />filtered right.
        </h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          We scour thousands of listings to find entry-level, junior, and fresh graduate roles in tech. No senior roles, no marketing jobs. Just pure tech opportunities for freshers.
        </p>
      </div>

      <ChatAssistant />

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search title, company, or location..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/50 shadow-sm transition-shadow text-gray-900"
          />
        </div>
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
        
        <div className="text-sm font-medium text-gray-500 w-full sm:w-auto text-left sm:text-right font-mono">
          {isLoading ? (
            <span className="flex items-center gap-2 justify-end">
              <Loader2 className="w-4 h-4 animate-spin" /> Loading roles...
            </span>
          ) : (
            <span>{filteredJobs.length} roles found</span>
          )}
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-700 rounded-xl mb-8 border border-red-100 flex items-center justify-center">
          {error}
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden px-4 sm:px-8 py-2">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400 gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
            <p>Aggregating and filtering fresh jobs...</p>
          </div>
        ) : filteredJobs.length > 0 ? (
          <div className="flex flex-col">
            {filteredJobs.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-gray-500">
            <Briefcase className="w-12 h-12 text-gray-300 mb-4" />
            <p className="text-lg font-medium text-gray-900 mb-1">No roles found</p>
            <p>Try adjusting your search criteria.</p>
          </div>
        )}
      </div>
    </main>
  );
}
