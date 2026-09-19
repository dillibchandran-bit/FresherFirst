export interface GoogleJobSchemaInput {
  id?: string;
  title: string;
  description: string;
  responsibilities?: string[] | string;
  requirements?: string[] | string;
  skills?: string[] | string;
  education?: string;
  experienceMin?: number;
  experienceMax?: number;
  companyName: string;
  companyWebsite?: string;
  companyLogoUrl?: string;
  locationName?: string;
  streetAddress?: string;
  addressLocality?: string;
  addressRegion?: string;
  postalCode?: string;
  addressCountry?: string;
  workMode?: 'on_site' | 'remote' | 'hybrid' | string;
  jobType?: 'full_time' | 'part_time' | 'internship' | 'contract' | string;
  salaryMin?: number | string | null;
  salaryMax?: number | string | null;
  salaryPeriod?: string;
  datePosted?: string;
  validThrough?: string;
  directApplyUrl?: string;
}

const normalizeList = (val?: string[] | string): string[] => {
  if (!val) return [];
  if (Array.isArray(val)) return val.filter(Boolean);
  return val
    .split('\n')
    .map(s => s.trim().replace(/^[-*•]\s*/, ''))
    .filter(Boolean);
};

const escapeHtml = (text: string): string => {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
};

/**
 * Builds standard HTML string for Google JobPosting description.
 * Google strongly prefers HTML formatted descriptions with <p>, <ul>, <li>.
 */
export function formatGoogleJobDescription(data: {
  description: string;
  responsibilities?: string[] | string;
  requirements?: string[] | string;
  education?: string;
  skills?: string[] | string;
}): string {
  const parts: string[] = [];

  if (data.description) {
    parts.push(`<p>${escapeHtml(data.description).replace(/\n\n/g, '</p><p>').replace(/\n/g, '<br/>')}</p>`);
  }

  const resp = normalizeList(data.responsibilities);
  if (resp.length > 0) {
    parts.push(`<p><strong>Key Responsibilities:</strong></p><ul>`);
    resp.forEach(item => {
      parts.push(`<li>${escapeHtml(item)}</li>`);
    });
    parts.push(`</ul>`);
  }

  const reqs = normalizeList(data.requirements);
  if (reqs.length > 0) {
    parts.push(`<p><strong>Requirements &amp; Qualifications:</strong></p><ul>`);
    reqs.forEach(item => {
      parts.push(`<li>${escapeHtml(item)}</li>`);
    });
    parts.push(`</ul>`);
  }

  if (data.education) {
    parts.push(`<p><strong>Educational Requirements:</strong> ${escapeHtml(data.education)}</p>`);
  }

  const skillsList = normalizeList(data.skills);
  if (skillsList.length > 0) {
    parts.push(`<p><strong>Required Skills:</strong> ${escapeHtml(skillsList.join(', '))}</p>`);
  }

  return parts.join('\n');
}

/**
 * Generates 100% compliant Schema.org JobPosting structured data
 * optimized specifically for Google Jobs search indexing.
 */
export function generateGoogleJobsSchema(input: GoogleJobSchemaInput) {
  const datePosted = input.datePosted 
    ? new Date(input.datePosted).toISOString() 
    : new Date().toISOString();

  // If validThrough not specified, default to 45 days after datePosted
  const validThrough = input.validThrough
    ? new Date(input.validThrough).toISOString()
    : new Date(new Date(datePosted).getTime() + 45 * 24 * 60 * 60 * 1000).toISOString();

  const employmentTypeMap: Record<string, string> = {
    full_time: 'FULL_TIME',
    part_time: 'PART_TIME',
    internship: 'INTERN',
    contract: 'CONTRACTOR',
  };

  const formattedHtmlDescription = formatGoogleJobDescription({
    description: input.description,
    responsibilities: input.responsibilities,
    requirements: input.requirements,
    education: input.education,
    skills: input.skills,
  });

  const schema: Record<string, any> = {
    '@context': 'https://schema.org/',
    '@type': 'JobPosting',
    title: input.title,
    description: formattedHtmlDescription,
    identifier: {
      '@type': 'PropertyValue',
      name: input.companyName || 'FresherFirst',
      value: input.id || input.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    },
    datePosted: datePosted,
    validThrough: validThrough,
    employmentType: employmentTypeMap[input.jobType || 'full_time'] || 'FULL_TIME',
    hiringOrganization: {
      '@type': 'Organization',
      name: input.companyName || 'Company',
      sameAs: input.companyWebsite || undefined,
      logo: input.companyLogoUrl || undefined,
    },
    directApply: true,
  };

  // Google Job Location
  if (input.workMode === 'remote') {
    schema.jobLocationType = 'TELECOMMUTE';
    schema.applicantLocationRequirements = {
      '@type': 'Country',
      name: 'India',
    };
  } else {
    schema.jobLocation = {
      '@type': 'Place',
      address: {
        '@type': 'PostalAddress',
        streetAddress: input.streetAddress || input.locationName || 'OMR Road',
        addressLocality: input.addressLocality || input.locationName || 'Chennai',
        addressRegion: input.addressRegion || 'Tamil Nadu',
        postalCode: input.postalCode || '600096',
        addressCountry: input.addressCountry || 'IN',
      },
    };
  }

  // Base Salary (Google Jobs requirement/recommendation)
  const minSal = Number(input.salaryMin);
  const maxSal = Number(input.salaryMax);
  if ((minSal && !isNaN(minSal)) || (maxSal && !isNaN(maxSal))) {
    schema.baseSalary = {
      '@type': 'MonetaryAmount',
      currency: 'INR',
      value: {
        '@type': 'QuantitativeValue',
        minValue: !isNaN(minSal) && minSal > 0 ? minSal : maxSal,
        maxValue: !isNaN(maxSal) && maxSal > 0 ? maxSal : minSal,
        unitText: input.salaryPeriod === 'monthly' ? 'MONTH' : 'YEAR',
      },
    };
  }

  // Experience Requirements
  schema.experienceRequirements = {
    '@type': 'OccupationalExperienceRequirements',
    monthsOfExperience: input.experienceMin !== undefined ? input.experienceMin * 12 : 0,
  };

  // Education Requirements
  if (input.education) {
    schema.educationRequirements = {
      '@type': 'EducationalOccupationalCredential',
      credentialCategory: input.education,
    };
  }

  return schema;
}
