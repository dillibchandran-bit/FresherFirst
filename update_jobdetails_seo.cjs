const fs = require('fs');
let c = fs.readFileSync('src/pages/jobs/JobDetails.tsx', 'utf8');

c = c.replace(
  "import { useParams, useNavigate } from 'react-router-dom';",
  "import { useParams, useNavigate, Link } from 'react-router-dom';\nimport SEO from '../../components/layout/SEO';"
);
c = c.replace(
  "import { MapPin, Briefcase, IndianRupee, Clock, CheckCircle2, GraduationCap, Building2, Flag, AlertCircle, ArrowLeft, X, FileText, Loader2, ShieldCheck, Award, History } from 'lucide-react';",
  "import { MapPin, Briefcase, IndianRupee, Clock, CheckCircle2, GraduationCap, Building2, Flag, AlertCircle, ArrowLeft, X, FileText, Loader2, ShieldCheck, Award, History, ChevronRight } from 'lucide-react';"
);

// structured data creation
const seoLogic = `
  const jobSchema = job ? {
    "@context": "https://schema.org/",
    "@type": "JobPosting",
    "title": job.title,
    "description": job.description,
    "identifier": {
      "@type": "PropertyValue",
      "name": job.company?.name || "Unknown Company",
      "value": job.id
    },
    "datePosted": job.posted_at,
    "validThrough": new Date(new Date(job.posted_at).getTime() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    "employmentType": job.work_mode === 'remote' ? 'TELECOMMUTE' : 'FULL_TIME',
    "hiringOrganization": {
      "@type": "Organization",
      "name": job.company?.name || "Unknown Company",
      "sameAs": job.company?.website || ""
    },
    "jobLocation": {
      "@type": "Place",
      "address": {
        "@type": "PostalAddress",
        "addressLocality": job.location?.name || "India",
        "addressCountry": "IN"
      }
    },
    ...(job.salary_min && job.salary_max ? {
      "baseSalary": {
        "@type": "MonetaryAmount",
        "currency": "INR",
        "value": {
          "@type": "QuantitativeValue",
          "minValue": job.salary_min,
          "maxValue": job.salary_max,
          "unitText": "YEAR"
        }
      }
    } : {})
  } : undefined;

  const breadcrumbs = job ? (
    <nav className="flex items-center text-sm text-gray-500 mb-6" aria-label="Breadcrumb">
      <Link to="/" className="hover:text-amber-600 transition-colors">Home</Link>
      <ChevronRight className="w-4 h-4 mx-2" />
      <Link to="/jobs" className="hover:text-amber-600 transition-colors">Jobs</Link>
      <ChevronRight className="w-4 h-4 mx-2" />
      {job.category && (
         <>
           <Link to={\`/jobs?category=\${job.category_id}\`} className="hover:text-amber-600 transition-colors">{job.category.name}</Link>
           <ChevronRight className="w-4 h-4 mx-2" />
         </>
      )}
      <span className="text-gray-900 font-medium truncate max-w-[200px] sm:max-w-md">{job.title}</span>
    </nav>
  ) : null;
`;

c = c.replace('if (loading) return', seoLogic + '\n  if (loading) return');

const seoComponent = `
      <SEO 
        title={\`\${job.title} at \${job.company?.name} | Fresher First\`} 
        description={\`Apply for \${job.title} at \${job.company?.name} in \${job.location?.name}. \${job.fresher_eligible ? 'Freshers welcome.' : ''} \${job.skills_list.slice(0,3).join(', ')}.\`}
        canonicalUrl={\`/jobs/\${job.slug}\`}
        type="job"
        schema={jobSchema}
      />
      
      {breadcrumbs}
`;

c = c.replace(/<div className="max-w-5xl mx-auto">/, '<div className="max-w-5xl mx-auto">\n' + seoComponent);

fs.writeFileSync('src/pages/jobs/JobDetails.tsx', c);
