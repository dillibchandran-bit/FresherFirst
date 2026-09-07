import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { JobWithDetails, Location, Category } from '../../types';
import JobCard from '../../components/jobs/JobCard';
import { Search, MapPin, Filter, X, Loader2, Briefcase } from 'lucide-react';

export default function JobList() {
  const [searchParams, setSearchParams] = useSearchParams();
  
  // URL Params
  const query = searchParams.get('q') || '';
  const locId = searchParams.get('location') || '';
  const categoryId = searchParams.get('category') || '';
  const fresherOnly = searchParams.get('fresher') === 'true';
  const workMode = searchParams.get('work_mode') || '';
  const sort = searchParams.get('sort') || 'recent';
  const page = parseInt(searchParams.get('page') || '1', 10);
  
  const JOBS_PER_PAGE = 10;

  // State
  const [jobs, setJobs] = useState<JobWithDetails[]>([]);
  const [totalJobs, setTotalJobs] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  
  // Filter Options Data
  const [locations, setLocations] = useState<Location[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    fetchFilterOptions();
  }, []);

  useEffect(() => {
    fetchJobs();
    window.scrollTo(0, 0);
  }, [query, locId, categoryId, fresherOnly, workMode, sort, page]);

  const fetchFilterOptions = async () => {
    const [locRes, catRes] = await Promise.all([
      supabase.from('locations').select('*').order('name'),
      supabase.from('job_categories').select('*').order('name')
    ]);
    if (locRes.data) setLocations(locRes.data);
    if (catRes.data) setCategories(catRes.data);
  };

  const fetchJobs = async () => {
    setLoading(true);
    try {
      let q = supabase
        .from('jobs')
        .select(`
          *,
          company:companies(*),
          location:locations(*),
          category:job_categories(*)
        `, { count: 'exact' })
        .eq('status', 'published');

      // Text search in title or skills
      if (query) {
        q = q.or(`title.ilike.%${query}%,skills_list.cs.{${query}}`);
      }
      
      // Filters
      if (locId) q = q.eq('location_id', locId);
      if (categoryId) q = q.eq('category_id', categoryId);
      if (fresherOnly) q = q.eq('fresher_eligible', true);
      if (workMode) q = q.eq('work_mode', workMode);

      // Sorting
      if (sort === 'salary_desc') {
        q = q.order('salary_max', { ascending: false, nullsFirst: false });
      } else {
        q = q.order('posted_at', { ascending: false });
      }

      // Pagination
      const from = (page - 1) * JOBS_PER_PAGE;
      const to = from + JOBS_PER_PAGE - 1;
      q = q.range(from, to);

      const { data, count, error } = await q;

      if (error) throw error;
      setJobs(data as unknown as JobWithDetails[]);
      setTotalJobs(count || 0);
    } catch (error) {
      console.error('Error fetching jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    if (key !== 'page') {
      newParams.set('page', '1'); // Reset to page 1 on filter change
    }
    setSearchParams(newParams);
  };

  const totalPages = Math.ceil(totalJobs / JOBS_PER_PAGE);

  return (
    <div className="bg-gray-50 min-h-screen pb-20">
      {/* Search Header */}
      <div className="bg-white border-b border-gray-200 py-10 px-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-6 text-center">Find Your First Tech Job</h1>
          <div className="flex flex-col md:flex-row gap-3 max-w-4xl mx-auto">
            <div className="relative flex-grow">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Job title, skill, or keyword..."
                value={query}
                onChange={(e) => {
                  const newParams = new URLSearchParams(searchParams);
                  if (e.target.value) newParams.set('q', e.target.value);
                  else newParams.delete('q');
                  newParams.set('page', '1');
                  // Debouncing ideally, but direct update for simplicity
                  setSearchParams(newParams);
                }}
                className="block w-full pl-11 pr-4 py-3.5 border border-gray-300 rounded-xl leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors shadow-sm"
              />
            </div>
            <div className="relative md:w-64">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <MapPin className="h-5 w-5 text-gray-400" />
              </div>
              <select
                value={locId}
                onChange={(e) => handleFilterChange('location', e.target.value)}
                className="block w-full pl-11 pr-10 py-3.5 border border-gray-300 rounded-xl leading-5 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors shadow-sm appearance-none"
              >
                <option value="">All Locations</option>
                {locations.map(loc => (
                  <option key={loc.id} value={loc.id}>{loc.name}</option>
                ))}
              </select>
            </div>
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className="md:hidden flex items-center justify-center gap-2 bg-gray-100 border border-gray-300 text-gray-700 py-3.5 px-4 rounded-xl"
            >
              <Filter className="w-5 h-5" /> Filters
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 flex gap-8">
        {/* Filters Sidebar */}
        <div className={`w-full md:w-64 flex-shrink-0 ${showFilters ? 'block' : 'hidden md:block'}`}>
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm sticky top-24">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-gray-900">Filters</h2>
              {showFilters && (
                <button onClick={() => setShowFilters(false)} className="md:hidden text-gray-500 hover:text-gray-900">
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>

            <div className="space-y-6">
              {/* Category */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Category</h3>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input type="radio" checked={categoryId === ''} onChange={() => handleFilterChange('category', '')} className="text-amber-600 focus:ring-amber-500 w-4 h-4" />
                    <span className="ml-2 text-sm text-gray-600">All Categories</span>
                  </label>
                  {categories.map(cat => (
                    <label key={cat.id} className="flex items-center">
                      <input type="radio" checked={categoryId === cat.id} onChange={() => handleFilterChange('category', cat.id)} className="text-amber-600 focus:ring-amber-500 w-4 h-4" />
                      <span className="ml-2 text-sm text-gray-600">{cat.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Fresher Eligible */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Experience</h3>
                <label className="flex items-center">
                  <input type="checkbox" checked={fresherOnly} onChange={(e) => handleFilterChange('fresher', e.target.checked ? 'true' : '')} className="rounded text-amber-600 focus:ring-amber-500 w-4 h-4 border-gray-300" />
                  <span className="ml-2 text-sm text-gray-600">Fresher Eligible Only</span>
                </label>
              </div>

              {/* Work Mode */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Work Mode</h3>
                <div className="space-y-2">
                  {['on_site', 'hybrid', 'remote'].map(mode => (
                    <label key={mode} className="flex items-center">
                      <input type="radio" checked={workMode === mode} onChange={() => handleFilterChange('work_mode', mode)} className="text-amber-600 focus:ring-amber-500 w-4 h-4" />
                      <span className="ml-2 text-sm text-gray-600">{mode.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
                    </label>
                  ))}
                  <button onClick={() => handleFilterChange('work_mode', '')} className="text-xs text-amber-600 font-medium pt-1">Clear mode filter</button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Job Results */}
        <div className="flex-1">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-gray-700 font-medium">
              {loading ? 'Searching...' : `Showing ${totalJobs} job${totalJobs !== 1 ? 's' : ''}`}
            </h2>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">Sort by:</span>
              <select 
                value={sort} 
                onChange={(e) => handleFilterChange('sort', e.target.value)}
                className="text-sm border-0 bg-transparent font-medium text-gray-900 focus:ring-0 cursor-pointer p-0 pr-4"
              >
                <option value="recent">Most Recent</option>
                <option value="salary_desc">Highest Salary</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="py-20 flex justify-center">
              <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
            </div>
          ) : jobs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              {jobs.map(job => (
                <JobCard key={job.id} job={job} />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">No jobs found</h3>
              <p className="text-gray-500 mt-1 max-w-md mx-auto">Try adjusting your search criteria, removing filters, or browsing all categories.</p>
              <button 
                onClick={() => setSearchParams(new URLSearchParams())}
                className="mt-6 px-6 py-2 bg-gray-900 text-white font-medium rounded-lg hover:bg-gray-800 transition-colors"
              >
                Clear all filters
              </button>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-8">
              <button 
                disabled={page <= 1}
                onClick={() => handleFilterChange('page', (page - 1).toString())}
                className="px-4 py-2 border border-gray-300 rounded-lg bg-white disabled:opacity-50 text-sm font-medium hover:bg-gray-50"
              >
                Previous
              </button>
              <div className="flex gap-1">
                {Array.from({ length: totalPages }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => handleFilterChange('page', (i + 1).toString())}
                    className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm font-medium transition-colors ${
                      page === i + 1 ? 'bg-amber-500 text-white border-amber-500' : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
              <button 
                disabled={page >= totalPages}
                onClick={() => handleFilterChange('page', (page + 1).toString())}
                className="px-4 py-2 border border-gray-300 rounded-lg bg-white disabled:opacity-50 text-sm font-medium hover:bg-gray-50"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
