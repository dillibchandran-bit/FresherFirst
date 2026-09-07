import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { JobWithDetails } from '../../types';
import { MapPin, Briefcase, IndianRupee, Clock, CheckCircle2, GraduationCap, Building2, Flag, AlertCircle, ArrowLeft } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function JobDetails() {
  const { slug } = useParams<{ slug: string }>();
  const [job, setJob] = useState<JobWithDetails | null>(null);
  const [similarJobs, setSimilarJobs] = useState<JobWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchJobDetails();
    window.scrollTo(0, 0);
  }, [slug]);

  const fetchJobDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('jobs')
        .select(`
          *,
          company:companies(*),
          location:locations(*),
          category:job_categories(*)
        `)
        .eq('slug', slug)
        .eq('status', 'published')
        .single();

      if (error) throw error;
      setJob(data as unknown as JobWithDetails);

      // Fetch similar jobs (same category, different id)
      if (data.category_id) {
        const { data: similar } = await supabase
          .from('jobs')
          .select(`*, company:companies(*), location:locations(*)`)
          .eq('category_id', data.category_id)
          .eq('status', 'published')
          .neq('id', data.id)
          .limit(3);
        
        if (similar) setSimilarJobs(similar as unknown as JobWithDetails[]);
      }
    } catch (err: any) {
      console.error(err);
      setError("We couldn't find this job. It may have been closed or removed.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="min-h-screen flex justify-center py-20"><div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div></div>;
  if (error || !job) return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-4">
      <AlertCircle className="w-16 h-16 text-gray-300 mb-4" />
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Job not found</h2>
      <p className="text-gray-500 max-w-md">{error}</p>
      <Link to="/jobs" className="mt-6 flex items-center gap-2 text-amber-600 font-medium hover:text-amber-700">
        <ArrowLeft className="w-4 h-4" /> Back to Jobs
      </Link>
    </div>
  );

  const formatSalary = (min: number | null, max: number | null) => {
    if (!min && !max) return 'Not disclosed';
    if (min && !max) return `₹${(min/100000).toFixed(1)}L+ / ${job.salary_period}`;
    if (!min && max) return `Up to ₹${(max/100000).toFixed(1)}L / ${job.salary_period}`;
    return `₹${(min!/100000).toFixed(1)}L - ₹${(max!/100000).toFixed(1)}L / ${job.salary_period}`;
  };

  return (
    <div className="bg-gray-50 min-h-screen pb-20">
      {/* Hero Header */}
      <div className="bg-white border-b border-gray-200 py-10 px-4">
        <div className="max-w-7xl mx-auto">
          <Link to="/jobs" className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-900 mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-1" /> Back to search results
          </Link>
          
          <div className="flex flex-col md:flex-row gap-6 md:items-start justify-between">
            <div className="flex gap-6 items-start">
              {job.company.logo_url ? (
                <img src={job.company.logo_url} alt={job.company.name} className="w-20 h-20 rounded-xl object-contain bg-white border border-gray-100 shadow-sm p-1" />
              ) : (
                <div className="w-20 h-20 rounded-xl bg-gray-100 flex items-center justify-center border border-gray-200 flex-shrink-0">
                  <Building2 className="w-8 h-8 text-gray-400" />
                </div>
              )}
              
              <div>
                <h1 className="text-3xl font-bold text-gray-900 leading-tight">{job.title}</h1>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-2 text-gray-600">
                  <span className="font-medium text-lg flex items-center gap-1 text-gray-900">
                    {job.company.name}
                    {job.company.verified && <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" title="Verified Company" />}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <span>{job.location?.name || 'Anywhere'}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span>Posted {job.posted_at ? formatDistanceToNow(new Date(job.posted_at), { addSuffix: true }) : 'Recently'}</span>
                  </div>
                </div>
                {job.fresher_eligible && (
                  <div className="mt-4 inline-flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-700 text-sm font-semibold rounded-full border border-green-200">
                    <GraduationCap className="w-4 h-4" /> Fresher Friendly
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex flex-col gap-3 min-w-[200px]">
              <button className="w-full bg-amber-500 text-white font-bold py-3.5 px-6 rounded-xl hover:bg-amber-600 transition-colors shadow-sm shadow-amber-500/20">
                Apply Now
              </button>
              <button className="w-full bg-white border border-gray-300 text-gray-700 font-medium py-3 px-6 rounded-xl hover:bg-gray-50 transition-colors">
                Save Job
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 flex flex-col lg:flex-row gap-8">
        
        {/* Main Content */}
        <div className="flex-1 space-y-6">
          <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Job Description</h2>
            <div className="prose max-w-none text-gray-600 whitespace-pre-wrap">
              {job.description}
            </div>
          </div>

          {(job.responsibilities && job.responsibilities.length > 0) && (
            <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Key Responsibilities</h2>
              <ul className="list-disc list-outside ml-5 space-y-2 text-gray-600">
                {job.responsibilities.map((resp, i) => (
                  <li key={i}>{resp}</li>
                ))}
              </ul>
            </div>
          )}

          {(job.requirements && job.requirements.length > 0) && (
            <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Requirements</h2>
              <ul className="list-disc list-outside ml-5 space-y-2 text-gray-600">
                {job.requirements.map((req, i) => (
                  <li key={i}>{req}</li>
                ))}
              </ul>
            </div>
          )}
          
          {(job.skills_list && job.skills_list.length > 0) && (
            <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Required Skills</h2>
              <div className="flex flex-wrap gap-2">
                {job.skills_list.map((skill, i) => (
                  <span key={i} className="px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="w-full lg:w-80 flex-shrink-0 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
            <h3 className="font-bold text-gray-900 mb-4 pb-4 border-b border-gray-100">Job Overview</h3>
            <div className="space-y-4">
              <div className="flex gap-3">
                <IndianRupee className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="text-sm text-gray-500 font-medium mb-0.5">Salary</div>
                  <div className="text-gray-900 font-medium">{formatSalary(job.salary_min, job.salary_max)}</div>
                </div>
              </div>
              <div className="flex gap-3">
                <Briefcase className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="text-sm text-gray-500 font-medium mb-0.5">Job Type</div>
                  <div className="text-gray-900 font-medium">{job.job_type.replace('_', ' ')}</div>
                </div>
              </div>
              <div className="flex gap-3">
                <MapPin className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="text-sm text-gray-500 font-medium mb-0.5">Work Mode</div>
                  <div className="text-gray-900 font-medium">{job.work_mode.replace('_', ' ')}</div>
                </div>
              </div>
              <div className="flex gap-3">
                <GraduationCap className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="text-sm text-gray-500 font-medium mb-0.5">Experience</div>
                  <div className="text-gray-900 font-medium">
                    {job.experience_max === 0 ? 'Fresher (0 Years)' : `${job.experience_min} to ${job.experience_max} Years`}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
            <h3 className="font-bold text-gray-900 mb-4 pb-4 border-b border-gray-100">About the Company</h3>
            <div className="flex items-center gap-3 mb-3">
              {job.company.logo_url && <img src={job.company.logo_url} className="w-10 h-10 rounded border" />}
              <div>
                <div className="font-bold text-gray-900 flex items-center gap-1">
                  {job.company.name}
                  {job.company.verified && <CheckCircle2 className="w-4 h-4 text-green-500" />}
                </div>
                <a href={job.company.website || '#'} target="_blank" rel="noreferrer" className="text-sm text-amber-600 hover:underline">Visit Website</a>
              </div>
            </div>
            {job.company.description && (
              <p className="text-sm text-gray-600 line-clamp-4">{job.company.description}</p>
            )}
          </div>

          <button className="w-full flex items-center justify-center gap-2 text-sm text-gray-500 hover:text-gray-800 py-2">
            <Flag className="w-4 h-4" /> Report this listing
          </button>
        </div>
      </div>

      {similarJobs.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 pt-12 border-t border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Similar Jobs</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {similarJobs.map(sj => (
              <div key={sj.id} className="bg-white p-5 rounded-2xl border border-gray-200 hover:border-amber-300 transition-colors">
                <h3 className="font-bold text-gray-900 truncate mb-1">
                  <Link to={`/jobs/${sj.slug}`} className="hover:text-amber-600 transition-colors">{sj.title}</Link>
                </h3>
                <div className="text-sm text-gray-500 mb-3">{sj.company.name}</div>
                <div className="flex items-center justify-between mt-4">
                  <span className="text-xs font-medium px-2 py-1 bg-gray-100 rounded text-gray-600">{sj.location?.name}</span>
                  <Link to={`/jobs/${sj.slug}`} className="text-sm font-medium text-amber-600 hover:text-amber-700">View &rarr;</Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
