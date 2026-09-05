import { useState } from 'react';
import { Send, Sparkles, Loader2 } from 'lucide-react';
import { Job } from '../types';
import JobCard from './JobCard';

export default function ChatAssistant() {
  const [profile, setProfile] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [recommendedJobs, setRecommendedJobs] = useState<Job[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile.trim()) return;

    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile }),
      });
      if (!res.ok) throw new Error('Failed to fetch recommendations');
      const data = await res.json();
      setRecommendedJobs(data.jobs || []);
      setHasSearched(true);
    } catch (err: any) {
      setError(err.message || 'An error occurred while finding jobs.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-amber-50 rounded-2xl p-6 sm:p-8 mb-12">
      <div className="flex items-center gap-3 mb-4">
        <div className="bg-amber-500 p-2 rounded-full">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <h2 className="font-serif text-2xl font-semibold text-gray-900">
          AI Matchmaker
        </h2>
      </div>
      <p className="text-gray-700 mb-6">
        Describe your skills in plain English, and our AI will find the 3 most relevant entry-level jobs for you.
      </p>
      
      <form onSubmit={handleSearch} className="relative">
        <input
          type="text"
          value={profile}
          onChange={(e) => setProfile(e.target.value)}
          placeholder="e.g. 'I know React and basic Python, no job experience yet'"
          className="w-full bg-white border border-amber-200 rounded-full pl-6 pr-14 py-4 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500/50 shadow-sm transition-all"
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={isLoading || !profile.trim()}
          className="absolute right-2 top-2 bottom-2 aspect-square bg-amber-500 hover:bg-amber-600 text-white rounded-full flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Send className="w-5 h-5" />
          )}
        </button>
      </form>

      {error && (
        <div className="mt-4 p-4 bg-red-50 text-red-700 rounded-xl text-sm border border-red-100">
          {error}
        </div>
      )}

      {hasSearched && !isLoading && (
        <div className="mt-8 space-y-2 border-t border-amber-200 pt-6">
          <h3 className="font-medium text-gray-900 mb-4">Top 3 Recommended Roles:</h3>
          {recommendedJobs.length > 0 ? (
            <div className="flex flex-col space-y-0">
              {recommendedJobs.map((job) => (
                <JobCard key={job.id} job={job} />
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">No matches found for this profile right now.</p>
          )}
        </div>
      )}
    </div>
  );
}
