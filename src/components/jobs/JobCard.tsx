import React from 'react';
import { Link } from 'react-router-dom';
import { JobWithDetails } from '../../types';
import { MapPin, Briefcase, IndianRupee, Clock, CheckCircle2, GraduationCap, ShieldCheck, Award } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface JobCardProps {
  job: JobWithDetails;
}

export default function JobCard({ job }: JobCardProps) {
  const formatSalary = (min: number | null, max: number | null) => {
    if (!min && !max) return 'Not disclosed';
    if (min && !max) return `₹${(min/100000).toFixed(1)}L+`;
    if (!min && max) return `Up to ₹${(max/100000).toFixed(1)}L`;
    return `₹${(min!/100000).toFixed(1)}L - ₹${(max!/100000).toFixed(1)}L`;
  };

  const getWorkModeLabel = (mode: string) => {
    return mode.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };
  
  const getJobTypeLabel = (type: string) => {
    return type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow p-6 flex flex-col h-full relative overflow-hidden group">
      {job.fresher_eligible && (
        <div className="absolute top-0 right-0 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-bl-xl z-10">
          Freshers Welcome
        </div>
      )}
      
      <div className="flex items-start gap-4 mb-4">
        {job.company.logo_url ? (
          <img loading="lazy" src={job.company.logo_url} alt={job.company.name} className="w-12 h-12 rounded-lg object-contain bg-gray-50 border border-gray-100 p-1" />
        ) : (
          <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center border border-gray-200 flex-shrink-0">
            <Briefcase className="w-6 h-6 text-gray-400" />
          </div>
        )}
        
        <div className="flex-1 min-w-0">
          <Link to={`/jobs/${job.slug}`} className="block">
            <h3 className="text-lg font-bold text-gray-900 leading-tight truncate group-hover:text-amber-600 transition-colors">
              {job.title}
            </h3>
          </Link>
          <div className="flex items-center mt-1 text-gray-600 text-sm">
            <span className="font-medium truncate">{job.company.name}</span>
            {job.company.verification_status === 'verified' && (
              <span title="Verified Company"><CheckCircle2 className="w-4 h-4 text-green-500 ml-1 flex-shrink-0" /></span>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 text-sm text-gray-600 mb-5">
        <div className="flex items-center gap-1.5 truncate">
          <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
          <span className="truncate">{job.location?.name || 'Anywhere'} ({getWorkModeLabel(job.work_mode)})</span>
        </div>
        
        <div className="flex items-center gap-1.5 truncate">
          <GraduationCap className="w-4 h-4 text-gray-400 flex-shrink-0" />
          <span className="truncate">
            {job.experience_max === 0 ? 'Fresher' : `${job.experience_min}-${job.experience_max} Yrs`}
          </span>
        </div>
        
        <div className="flex items-center gap-1.5 truncate">
          <IndianRupee className="w-4 h-4 text-gray-400 flex-shrink-0" />
          <span className="truncate">{formatSalary(job.salary_min, job.salary_max)}</span>
        </div>
        
        <div className="flex items-center gap-1.5 truncate">
          <Briefcase className="w-4 h-4 text-gray-400 flex-shrink-0" />
          <span className="truncate">{getJobTypeLabel(job.job_type)}</span>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-6 flex-grow">
        {job.skills_list && job.skills_list.slice(0, 3).map((skill, i) => (
          <span key={i} className="px-2.5 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-md truncate max-w-full">
            {skill}
          </span>
        ))}
        {job.skills_list && job.skills_list.length > 3 && (
          <span className="px-2.5 py-1 bg-gray-50 text-gray-500 text-xs font-medium rounded-md">
            +{job.skills_list.length - 3}
          </span>
        )}
      </div>

      <div className="pt-4 border-t border-gray-100 flex items-center justify-between mt-auto">
        <div className="flex items-center gap-1.5 text-xs text-gray-500">
          <Clock className="w-3.5 h-3.5" />
          <span>
            {job.posted_at ? formatDistanceToNow(new Date(job.posted_at), { addSuffix: true }) : 'Recently'}
          </span>
        </div>
        
        <Link 
          to={`/jobs/${job.slug}`}
          className="text-sm font-semibold text-gray-900 hover:text-amber-600 transition-colors flex items-center gap-1"
        >
          View Details
          <span aria-hidden="true">&rarr;</span>
        </Link>
      </div>
    </div>
  );
}
