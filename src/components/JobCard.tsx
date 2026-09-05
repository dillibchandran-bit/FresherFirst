import { ExternalLink, MapPin, Building2, CalendarDays, Laptop } from 'lucide-react';
import { Job } from '../types';
import React from 'react';

export default function JobCard({ job }: { job: Job }) {
  const postedDate = new Date(job.postedAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  // Prepare structured data for JobPosting
  const structuredData: any = {
    "@context": "https://schema.org/",
    "@type": "JobPosting",
    "title": job.title,
    "description": job.excerpt,
    "identifier": {
      "@type": "PropertyValue",
      "name": job.company,
      "value": job.id
    },
    "datePosted": job.postedAt,
    "validThrough": job.validThrough || new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString(),
    "employmentType": job.employmentType || "FULL_TIME",
    "hiringOrganization": {
      "@type": "Organization",
      "name": job.company,
      "sameAs": job.url
    },
  };

  if (job.workMode === "Remote" || job.location.toLowerCase().includes("remote") || job.location === "Anywhere") {
    structuredData.jobLocationType = "TELECOMMUTE";
    structuredData.applicantLocationRequirements = {
      "@type": "Country",
      "name": "India"
    };
  } else {
    structuredData.jobLocation = {
      "@type": "Place",
      "address": {
        "@type": "PostalAddress",
        "addressLocality": job.location,
        "addressCountry": "IN"
      }
    };
  }

  return (
    <div className="py-6 border-b border-gray-200 hover:bg-amber-50/30 transition-colors -mx-4 px-4 sm:mx-0 sm:px-0">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
        <div className="space-y-2 flex-1">
          <div className="flex items-center gap-2 mb-1 text-sm font-medium text-amber-700 font-mono">
            <span>{job.source}</span>
            {job.workMode && (
              <>
                <span className="text-gray-300">•</span>
                <span className="flex items-center gap-1">
                  <Laptop className="w-3 h-3" />
                  {job.workMode}
                </span>
              </>
            )}
          </div>
          <h3 className="font-serif text-xl sm:text-2xl font-semibold text-gray-900 leading-tight">
            {job.title}
          </h3>
          <div className="flex flex-wrap items-center gap-3 text-gray-600 text-sm">
            <div className="flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-gray-400" />
              <span>{job.company}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-gray-400" />
              <span>{job.location}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CalendarDays className="w-4 h-4 text-gray-400" />
              <span>{postedDate}</span>
            </div>
          </div>
          
          <p className="text-gray-600 text-sm mt-3 line-clamp-2 leading-relaxed">
            {job.excerpt}
          </p>
          {job.tags && job.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {job.tags.slice(0, 5).map((tag, idx) => (
                <span 
                  key={idx} 
                  className="px-2.5 py-1 bg-gray-100 text-gray-700 text-xs rounded font-mono"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
        
        <a 
          href={job.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 bg-white border border-gray-300 text-gray-900 px-5 py-2.5 rounded-full text-sm font-medium hover:bg-amber-50 hover:border-amber-300 hover:text-amber-800 transition-colors w-full sm:w-auto flex-shrink-0 mt-2 sm:mt-0"
        >
          View & apply
          <ExternalLink className="w-4 h-4" />
        </a>
      </div>
    </div>
  );
}
