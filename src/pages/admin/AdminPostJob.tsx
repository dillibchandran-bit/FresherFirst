import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Briefcase, Building2, MapPin, IndianRupee, Calendar, 
  CheckCircle2, AlertCircle, Copy, Check, ArrowLeft, 
  ExternalLink, Eye, Globe, Sparkles, Plus, Code, HelpCircle
} from 'lucide-react';
import { generateGoogleJobsSchema } from '../../lib/googleJobsSchema';

export default function AdminPostJob() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  // Companies & Metadata
  const [companies, setCompanies] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [locations, setLocations] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  // Employer Selection Mode: 'existing' | 'new'
  const [employerMode, setEmployerMode] = useState<'existing' | 'new'>('existing');
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>('');

  // New Employer Details
  const [newCompanyName, setNewCompanyName] = useState('');
  const [newCompanyWebsite, setNewCompanyWebsite] = useState('');
  const [newCompanyLogoUrl, setNewCompanyLogoUrl] = useState('');
  const [newCompanyDescription, setNewCompanyDescription] = useState('');
  const [newCompanyVerified, setNewCompanyVerified] = useState(true);

  // Job Details
  const [title, setTitle] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [locationId, setLocationId] = useState('');
  const [customLocationName, setCustomLocationName] = useState('Chennai, Tamil Nadu');
  const [streetAddress, setStreetAddress] = useState('OMR IT Expressway');
  const [addressLocality, setAddressLocality] = useState('Chennai');
  const [addressRegion, setAddressRegion] = useState('Tamil Nadu');
  const [postalCode, setPostalCode] = useState('600096');
  
  const [jobType, setJobType] = useState('full_time');
  const [workMode, setWorkMode] = useState<'on_site' | 'remote' | 'hybrid'>('on_site');
  const [experienceMin, setExperienceMin] = useState(0);
  const [experienceMax, setExperienceMax] = useState(1);
  const [educationRequirements, setEducationRequirements] = useState('B.E / B.Tech / BCA / MCA / B.Sc (2024, 2025, 2026 Batches)');
  const [fresherEligible, setFresherEligible] = useState(true);
  
  // Salary
  const [salaryDisclosed, setSalaryDisclosed] = useState(true);
  const [salaryMin, setSalaryMin] = useState('350000');
  const [salaryMax, setSalaryMax] = useState('600000');
  const [salaryPeriod, setSalaryPeriod] = useState('yearly');
  
  // Dates
  const [postedDate, setPostedDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [validThroughDate, setValidThroughDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 45);
    return d.toISOString().split('T')[0];
  });

  // Description & Content
  const [description, setDescription] = useState('');
  const [responsibilities, setResponsibilities] = useState('');
  const [requirements, setRequirements] = useState('');
  const [skills, setSkills] = useState('Java, Python, SQL, Problem Solving, Communication');

  // UI States
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successJob, setSuccessJob] = useState<any | null>(null);
  const [copiedSchema, setCopiedSchema] = useState(false);
  const [showSchemaPreview, setShowSchemaPreview] = useState(false);

  useEffect(() => {
    fetchPrerequisites();
  }, []);

  const fetchPrerequisites = async () => {
    setLoadingData(true);
    try {
      const [compRes, catRes, locRes] = await Promise.all([
        supabase.from('companies').select('*').order('name'),
        supabase.from('job_categories').select('*').order('name'),
        supabase.from('locations').select('*').order('name')
      ]);

      if (compRes.data) {
        setCompanies(compRes.data);
        if (compRes.data.length > 0) {
          setSelectedCompanyId(compRes.data[0].id);
        }
      }
      if (catRes.data) {
        setCategories(catRes.data);
        if (catRes.data.length > 0) setCategoryId(catRes.data[0].id);
      }
      if (locRes.data) {
        setLocations(locRes.data);
        if (locRes.data.length > 0) setLocationId(locRes.data[0].id);
      }
    } catch (err: any) {
      console.error("Failed to load prerequisite data", err);
    } finally {
      setLoadingData(false);
    }
  };

  // Determine active company info
  const activeCompany = employerMode === 'existing'
    ? companies.find(c => c.id === selectedCompanyId)
    : {
        name: newCompanyName || 'Company Name',
        website: newCompanyWebsite,
        logo_url: newCompanyLogoUrl,
        description: newCompanyDescription
      };

  // Auto-suggest clearbit logo if domain typed in new company website
  const handleWebsiteChange = (url: string) => {
    setNewCompanyWebsite(url);
    try {
      const parsed = new URL(url.startsWith('http') ? url : `https://${url}`);
      const domain = parsed.hostname.replace(/^www\./, '');
      if (domain && !newCompanyLogoUrl) {
        setNewCompanyLogoUrl(`https://logo.clearbit.com/${domain}`);
      }
    } catch (e) {
      // ignore parsing error while user is typing
    }
  };

  // Generate live Google Jobs Schema
  const generatedSchema = generateGoogleJobsSchema({
    id: 'preview-id',
    title: title || 'Job Title',
    description: description || 'Job description details...',
    responsibilities: responsibilities,
    requirements: requirements,
    skills: skills,
    education: educationRequirements,
    experienceMin: experienceMin,
    experienceMax: experienceMax,
    companyName: activeCompany?.name || 'Company Name',
    companyWebsite: activeCompany?.website || '',
    companyLogoUrl: activeCompany?.logo_url || '',
    locationName: customLocationName,
    streetAddress: streetAddress,
    addressLocality: addressLocality,
    addressRegion: addressRegion,
    postalCode: postalCode,
    workMode: workMode,
    jobType: jobType,
    salaryMin: salaryDisclosed ? salaryMin : null,
    salaryMax: salaryDisclosed ? salaryMax : null,
    salaryPeriod: salaryPeriod,
    datePosted: postedDate ? new Date(postedDate).toISOString() : new Date().toISOString(),
    validThrough: validThroughDate ? new Date(validThroughDate).toISOString() : undefined,
  });

  const handleCopySchema = () => {
    navigator.clipboard.writeText(JSON.stringify(generatedSchema, null, 2));
    setCopiedSchema(true);
    setTimeout(() => setCopiedSchema(false), 2500);
  };

  const handleSubmit = async (publishStatus: 'published' | 'draft') => {
    setError(null);
    setSaving(true);

    try {
      let finalCompanyId = selectedCompanyId;

      // 1. If new employer mode, insert company first
      if (employerMode === 'new') {
        if (!newCompanyName.trim()) {
          throw new Error('Please enter the employer / company name.');
        }

        const compSlug = newCompanyName.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Math.floor(Math.random() * 10000);
        const { data: newComp, error: compErr } = await supabase
          .from('companies')
          .insert({
            name: newCompanyName.trim(),
            slug: compSlug,
            website: newCompanyWebsite.trim() || null,
            logo_url: newCompanyLogoUrl.trim() || null,
            description: newCompanyDescription.trim() || null,
            verified: newCompanyVerified,
            verification_status: newCompanyVerified ? 'verified' : 'unverified'
          })
          .select()
          .single();

        if (compErr) {
          throw new Error(`Failed to create company: ${compErr.message}. (Make sure Supabase allows admin inserts)`);
        }
        finalCompanyId = newComp.id;
      }

      if (!finalCompanyId) {
        throw new Error('Please select or specify a company.');
      }

      if (!title.trim()) {
        throw new Error('Please provide a job title.');
      }

      if (!description.trim()) {
        throw new Error('Please enter the job description.');
      }

      // 2. Prepare Job Payload
      const jobSlug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + (activeCompany?.name || 'job').toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Math.floor(Math.random() * 10000);

      const respArray = responsibilities
        .split('\n')
        .map(s => s.trim().replace(/^[-*•]\s*/, ''))
        .filter(Boolean);

      const reqArray = requirements
        .split('\n')
        .map(s => s.trim().replace(/^[-*•]\s*/, ''))
        .filter(Boolean);

      const skillsArray = skills
        .split(',')
        .map(s => s.trim())
        .filter(Boolean);

      const jobPayload: any = {
        company_id: finalCompanyId,
        location_id: locationId || null,
        category_id: categoryId || null,
        title: title.trim(),
        slug: jobSlug,
        description: description.trim(),
        responsibilities: respArray,
        requirements: reqArray,
        skills_list: skillsArray,
        experience_min: Number(experienceMin) || 0,
        experience_max: Number(experienceMax) || 0,
        salary_min: salaryDisclosed && salaryMin ? Number(salaryMin) : null,
        salary_max: salaryDisclosed && salaryMax ? Number(salaryMax) : null,
        salary_period: salaryPeriod,
        job_type: jobType,
        work_mode: workMode,
        education_requirements: educationRequirements.trim() || null,
        fresher_eligible: fresherEligible,
        status: publishStatus,
        posted_at: postedDate ? new Date(postedDate).toISOString() : new Date().toISOString(),
        expires_at: validThroughDate ? new Date(validThroughDate).toISOString() : null,
      };

      const { data: createdJob, error: jobErr } = await supabase
        .from('jobs')
        .insert(jobPayload)
        .select(`*, company:companies(*)`)
        .single();

      if (jobErr) {
        throw new Error(`Failed to post job: ${jobErr.message}`);
      }

      // Log admin action
      try {
        if (user?.id) {
          await supabase.rpc('log_admin_action' as any, {
            p_admin_id: user.id,
            p_action: `admin_created_job_${publishStatus}`,
            p_target_type: 'job',
            p_target_id: createdJob.id,
            p_details: { title: createdJob.title, company: activeCompany?.name }
          });
        }
      } catch (e) {
        console.warn("Audit log skipped", e);
      }

      setSuccessJob(createdJob);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred while posting job.');
    } finally {
      setSaving(false);
    }
  };

  const handleResetForm = () => {
    setSuccessJob(null);
    setTitle('');
    setDescription('');
    setResponsibilities('');
    setRequirements('');
    setSkills('Java, Python, SQL, Problem Solving, Communication');
    setEmployerMode('existing');
    fetchPrerequisites();
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        
        {/* Navigation & Header */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <Link 
              to="/admin/dashboard" 
              className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-800 transition-colors mb-2"
            >
              <ArrowLeft className="w-4 h-4 mr-1" /> Back to Admin Dashboard
            </Link>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-2">
              <Briefcase className="w-7 h-7 text-amber-500" />
              Post Job for Any Employer
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Add any employer's job opening with automated <strong>Google Jobs (Schema.org)</strong> rich snippet tags for search indexing.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowSchemaPreview(!showSchemaPreview)}
              className="inline-flex items-center gap-2 px-3.5 py-2 bg-white border border-gray-300 rounded-lg text-xs sm:text-sm font-medium text-gray-700 hover:bg-gray-50 shadow-sm"
            >
              <Code className="w-4 h-4 text-amber-600" />
              {showSchemaPreview ? 'Hide Google Schema' : 'Inspect Google Schema'}
            </button>
          </div>
        </div>

        {/* SUCCESS BANNER */}
        {successJob && (
          <div className="mb-8 bg-green-50 border-2 border-green-200 rounded-2xl p-6 sm:p-8 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                <CheckCircle2 className="w-7 h-7 text-green-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-green-900">Job Successfully Published!</h3>
                <p className="text-green-700 mt-1 text-sm">
                  The job <strong>{successJob.title}</strong> is now live on the portal and equipped with full Google Jobs JobPosting schema.
                </p>

                <div className="mt-5 flex flex-wrap gap-3">
                  <a
                    href={`/jobs/${successJob.slug}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-semibold shadow-sm transition-colors"
                  >
                    <Eye className="w-4 h-4" /> View Live Job Page
                  </a>

                  <a
                    href={`https://search.google.com/test/rich-results?url=${encodeURIComponent(window.location.origin + '/jobs/' + successJob.slug)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-white border border-green-300 text-green-800 hover:bg-green-100 rounded-lg text-sm font-medium transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" /> Test on Google Rich Results
                  </a>

                  <button
                    type="button"
                    onClick={handleResetForm}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg text-sm font-medium transition-colors"
                  >
                    <Plus className="w-4 h-4" /> Post Another Job
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ERROR BANNER */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3 text-red-700">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-red-500" />
            <div className="text-sm">{error}</div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* MAIN FORM COLUMN */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* 1. EMPLOYER SELECTION CARD */}
            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-4">
                <div className="flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-amber-500" />
                  <h2 className="text-base font-bold text-gray-900">1. Select or Create Employer</h2>
                </div>
                
                {/* Switcher Toggle */}
                <div className="flex p-0.5 bg-gray-100 rounded-lg text-xs font-semibold">
                  <button
                    type="button"
                    onClick={() => setEmployerMode('existing')}
                    className={`px-3 py-1.5 rounded-md transition-colors ${employerMode === 'existing' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
                  >
                    Existing Company
                  </button>
                  <button
                    type="button"
                    onClick={() => setEmployerMode('new')}
                    className={`px-3 py-1.5 rounded-md transition-colors ${employerMode === 'new' ? 'bg-white text-amber-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
                  >
                    + New Company
                  </button>
                </div>
              </div>

              {employerMode === 'existing' ? (
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">
                    Select Employer <span className="text-red-500">*</span>
                  </label>
                  {loadingData ? (
                    <div className="text-xs text-gray-400 py-2">Loading companies...</div>
                  ) : (
                    <div className="space-y-3">
                      <select
                        value={selectedCompanyId}
                        onChange={(e) => setSelectedCompanyId(e.target.value)}
                        className="w-full text-sm border border-gray-300 rounded-lg p-2.5 bg-white focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                      >
                        {companies.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name} {c.verification_status === 'verified' ? '✓ (Verified)' : ''}
                          </option>
                        ))}
                      </select>

                      {/* Selected Company Preview Card */}
                      {activeCompany && (
                        <div className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                          {activeCompany.logo_url ? (
                            <img 
                              src={activeCompany.logo_url} 
                              alt={activeCompany.name} 
                              className="w-10 h-10 rounded-md object-contain bg-white border border-gray-100 p-0.5" 
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-md bg-gray-200 flex items-center justify-center text-gray-400">
                              <Building2 className="w-5 h-5" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-semibold text-gray-900 flex items-center gap-1.5 truncate">
                              {activeCompany.name}
                              {activeCompany.verification_status === 'verified' && (
                                <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                              )}
                            </div>
                            <div className="text-xs text-gray-500 truncate">
                              {activeCompany.website || 'No website linked'}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Company / Employer Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Zoho Corporation, Freshworks, Infosys"
                      value={newCompanyName}
                      onChange={(e) => setNewCompanyName(e.target.value)}
                      className="w-full text-sm border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-amber-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Company Website</label>
                      <input
                        type="url"
                        placeholder="https://www.company.com"
                        value={newCompanyWebsite}
                        onChange={(e) => handleWebsiteChange(e.target.value)}
                        className="w-full text-sm border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-amber-500"
                      />
                      <p className="text-[11px] text-gray-400 mt-0.5">Typing domain auto-suggests Clearbit logo</p>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Company Logo URL</label>
                      <div className="flex gap-2">
                        <input
                          type="url"
                          placeholder="https://.../logo.png"
                          value={newCompanyLogoUrl}
                          onChange={(e) => setNewCompanyLogoUrl(e.target.value)}
                          className="w-full text-sm border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-amber-500"
                        />
                        {newCompanyLogoUrl && (
                          <img 
                            src={newCompanyLogoUrl} 
                            alt="Logo preview" 
                            className="w-10 h-10 rounded border bg-white object-contain p-0.5 flex-shrink-0"
                            onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                          />
                        )}
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">About the Company</label>
                    <textarea
                      rows={2}
                      placeholder="Brief summary of company culture, products, or mission..."
                      value={newCompanyDescription}
                      onChange={(e) => setNewCompanyDescription(e.target.value)}
                      className="w-full text-sm border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-amber-500"
                    />
                  </div>

                  <label className="flex items-center gap-2 text-xs font-medium text-gray-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newCompanyVerified}
                      onChange={(e) => setNewCompanyVerified(e.target.checked)}
                      className="rounded text-amber-500 focus:ring-amber-400"
                    />
                    Mark as Verified Employer (recommended)
                  </label>
                </div>
              )}
            </div>

            {/* 2. JOB BASICS CARD */}
            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
                <Briefcase className="w-5 h-5 text-amber-500" />
                <h2 className="text-base font-bold text-gray-900">2. Job Position Details</h2>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Job Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Junior Backend Developer (Java / Python) - 2025/2026 Batch"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full text-sm border border-gray-300 rounded-lg p-2.5 font-medium focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Job Category</label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full text-sm border border-gray-300 rounded-lg p-2.5 bg-white"
                  >
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Employment Type</label>
                  <select
                    value={jobType}
                    onChange={(e) => setJobType(e.target.value)}
                    className="w-full text-sm border border-gray-300 rounded-lg p-2.5 bg-white"
                  >
                    <option value="full_time">Full-Time (FULL_TIME)</option>
                    <option value="part_time">Part-Time (PART_TIME)</option>
                    <option value="internship">Internship (INTERN)</option>
                    <option value="contract">Contract (CONTRACTOR)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Work Mode</label>
                  <select
                    value={workMode}
                    onChange={(e) => setWorkMode(e.target.value as any)}
                    className="w-full text-sm border border-gray-300 rounded-lg p-2.5 bg-white"
                  >
                    <option value="on_site">On-Site (Office)</option>
                    <option value="hybrid">Hybrid</option>
                    <option value="remote">Remote (TELECOMMUTE)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Eligible Degrees & Batches</label>
                  <input
                    type="text"
                    placeholder="e.g. B.E / B.Tech / MCA (2024, 2025, 2026)"
                    value={educationRequirements}
                    onChange={(e) => setEducationRequirements(e.target.value)}
                    className="w-full text-sm border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div className="flex items-center pt-5">
                  <label className="flex items-center gap-2 text-xs font-semibold text-gray-800 cursor-pointer bg-amber-50 border border-amber-200 px-3 py-2 rounded-lg w-full">
                    <input
                      type="checkbox"
                      checked={fresherEligible}
                      onChange={(e) => setFresherEligible(e.target.checked)}
                      className="rounded text-amber-500 focus:ring-amber-400"
                    />
                    <span>Fresher Eligible (0-1 Yrs Exp)</span>
                  </label>
                </div>
              </div>
            </div>

            {/* 3. LOCATION SPECIFICATION (FOR GOOGLE JOBS) */}
            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-amber-500" />
                  <h2 className="text-base font-bold text-gray-900">3. Location (Google Search Optimized)</h2>
                </div>
                {workMode === 'remote' && (
                  <span className="text-xs bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full font-medium">
                    Google Telecommute Enabled
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Primary Area / Locality</label>
                  <input
                    type="text"
                    placeholder="e.g. OMR, Sholinganallur, Siruseri"
                    value={customLocationName}
                    onChange={(e) => setCustomLocationName(e.target.value)}
                    className="w-full text-sm border border-gray-300 rounded-lg p-2.5"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Street Address</label>
                  <input
                    type="text"
                    placeholder="e.g. IT Expressway, Navalur"
                    value={streetAddress}
                    onChange={(e) => setStreetAddress(e.target.value)}
                    className="w-full text-sm border border-gray-300 rounded-lg p-2.5"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">City</label>
                  <input
                    type="text"
                    value={addressLocality}
                    onChange={(e) => setAddressLocality(e.target.value)}
                    className="w-full text-sm border border-gray-300 rounded-lg p-2.5"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">State</label>
                  <input
                    type="text"
                    value={addressRegion}
                    onChange={(e) => setAddressRegion(e.target.value)}
                    className="w-full text-sm border border-gray-300 rounded-lg p-2.5"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">PIN / Postal Code</label>
                  <input
                    type="text"
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    className="w-full text-sm border border-gray-300 rounded-lg p-2.5"
                  />
                </div>
              </div>
            </div>

            {/* 4. COMPENSATION & TIMELINE */}
            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <IndianRupee className="w-5 h-5 text-amber-500" />
                  <h2 className="text-base font-bold text-gray-900">4. Compensation & Timeline</h2>
                </div>
                <label className="flex items-center gap-1.5 text-xs text-gray-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={salaryDisclosed}
                    onChange={(e) => setSalaryDisclosed(e.target.checked)}
                    className="rounded text-amber-500"
                  />
                  Disclose Salary
                </label>
              </div>

              {salaryDisclosed && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Min Salary (₹)</label>
                    <input
                      type="number"
                      placeholder="350000"
                      value={salaryMin}
                      onChange={(e) => setSalaryMin(e.target.value)}
                      className="w-full text-sm border border-gray-300 rounded-lg p-2.5"
                    />
                    <span className="text-[11px] text-gray-500">₹{(Number(salaryMin)/100000 || 0).toFixed(1)} LPA</span>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Max Salary (₹)</label>
                    <input
                      type="number"
                      placeholder="600000"
                      value={salaryMax}
                      onChange={(e) => setSalaryMax(e.target.value)}
                      className="w-full text-sm border border-gray-300 rounded-lg p-2.5"
                    />
                    <span className="text-[11px] text-gray-500">₹{(Number(salaryMax)/100000 || 0).toFixed(1)} LPA</span>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Period</label>
                    <select
                      value={salaryPeriod}
                      onChange={(e) => setSalaryPeriod(e.target.value)}
                      className="w-full text-sm border border-gray-300 rounded-lg p-2.5 bg-white"
                    >
                      <option value="yearly">Yearly (Per Annum)</option>
                      <option value="monthly">Monthly</option>
                    </select>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Date Posted</label>
                  <input
                    type="date"
                    value={postedDate}
                    onChange={(e) => setPostedDate(e.target.value)}
                    className="w-full text-sm border border-gray-300 rounded-lg p-2.5"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Valid Through / Expiry Date <span className="text-amber-600 font-normal">(Google Jobs requirement)</span>
                  </label>
                  <input
                    type="date"
                    value={validThroughDate}
                    onChange={(e) => setValidThroughDate(e.target.value)}
                    className="w-full text-sm border border-gray-300 rounded-lg p-2.5"
                  />
                </div>
              </div>
            </div>

            {/* 5. JOB DESCRIPTION & CRITERIA */}
            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
                <Sparkles className="w-5 h-5 text-amber-500" />
                <h2 className="text-base font-bold text-gray-900">5. Description & Requirements</h2>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Job Overview / Summary <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={4}
                  placeholder="Provide a detailed overview of the role, team, and day-to-day work..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full text-sm border border-gray-300 rounded-lg p-2.5"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Key Responsibilities (one per line)
                </label>
                <textarea
                  rows={3}
                  placeholder="Design and implement clean software solutions&#10;Collaborate with cross-functional development teams&#10;Write unit tests and documentation"
                  value={responsibilities}
                  onChange={(e) => setResponsibilities(e.target.value)}
                  className="w-full text-sm border border-gray-300 rounded-lg p-2.5"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Qualifications & Requirements (one per line)
                </label>
                <textarea
                  rows={3}
                  placeholder="Graduation year 2024, 2025, or 2026&#10;Strong understanding of Object-Oriented Programming (Java/Python)&#10;Good verbal and written communication skills"
                  value={requirements}
                  onChange={(e) => setRequirements(e.target.value)}
                  className="w-full text-sm border border-gray-300 rounded-lg p-2.5"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Key Skills (comma-separated tags)
                </label>
                <input
                  type="text"
                  placeholder="Java, React, Python, SQL, REST APIs"
                  value={skills}
                  onChange={(e) => setSkills(e.target.value)}
                  className="w-full text-sm border border-gray-300 rounded-lg p-2.5"
                />
              </div>
            </div>

            {/* ACTION BUTTONS */}
            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
              <button
                type="button"
                disabled={saving}
                onClick={() => handleSubmit('published')}
                className="w-full sm:w-auto px-6 py-3 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-gray-900 font-bold rounded-xl shadow-sm transition-all flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-5 h-5 text-gray-900" />
                {saving ? 'Publishing Job...' : 'Publish Job Live & Enable Google Schema'}
              </button>

              <button
                type="button"
                disabled={saving}
                onClick={() => handleSubmit('draft')}
                className="w-full sm:w-auto px-5 py-3 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold rounded-xl shadow-sm transition-colors"
              >
                Save as Draft
              </button>
            </div>

          </div>

          {/* SIDEBAR: GOOGLE JOBS PREVIEW & SCHEMA INSPECTOR */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* GOOGLE SEARCH CARD SIMULATOR */}
            <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm sticky top-6">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-bold">G</div>
                  <h3 className="text-sm font-bold text-gray-900">Google Jobs Card Preview</h3>
                </div>
                <span className="text-[11px] font-medium text-green-700 bg-green-50 px-2 py-0.5 rounded-full border border-green-200">
                  Schema.org Active
                </span>
              </div>

              {/* Simulated Google Jobs Card */}
              <div className="border border-gray-200 rounded-xl p-4 bg-white shadow-xs hover:border-gray-300 transition-colors">
                <div className="flex items-start gap-3">
                  {activeCompany?.logo_url ? (
                    <img 
                      src={activeCompany.logo_url} 
                      alt="Logo" 
                      className="w-10 h-10 rounded-lg object-contain bg-gray-50 border p-1 flex-shrink-0" 
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-lg bg-gray-100 border flex items-center justify-center text-gray-400 font-bold text-xs flex-shrink-0">
                      {activeCompany?.name?.[0] || 'C'}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <h4 className="text-base font-semibold text-blue-700 hover:underline leading-snug line-clamp-2">
                      {title || 'Junior Software Engineer (Fresher)'}
                    </h4>
                    <div className="text-xs text-gray-700 mt-1 font-medium flex items-center gap-1">
                      <span>{activeCompany?.name || 'Company Name'}</span>
                      {activeCompany?.verification_status === 'verified' && (
                        <CheckCircle2 className="w-3.5 h-3.5 text-green-600 inline" />
                      )}
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5 flex items-center gap-1.5">
                      <MapPin className="w-3 h-3 text-gray-400" />
                      <span>{customLocationName} {workMode === 'remote' ? '• Remote' : ''}</span>
                    </div>
                  </div>
                </div>

                {/* Google Snippet Badges */}
                <div className="mt-3 flex flex-wrap gap-1.5 text-[11px]">
                  {salaryDisclosed && salaryMin && salaryMax && (
                    <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-md font-medium">
                      ₹{(Number(salaryMin)/100000).toFixed(1)}L–{(Number(salaryMax)/100000).toFixed(1)}L a year
                    </span>
                  )}
                  <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded-md capitalize font-medium">
                    {jobType.replace('_', ' ')}
                  </span>
                  {fresherEligible && (
                    <span className="bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded-md font-medium">
                      Fresher Eligible
                    </span>
                  )}
                </div>

                <p className="mt-2.5 text-xs text-gray-600 line-clamp-2">
                  {description || 'We are seeking energetic fresh graduates to join our team...'}
                </p>

                <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
                  <span className="text-gray-400">Via FresherFirst</span>
                  <span className="text-blue-600 font-medium">Apply on FresherFirst</span>
                </div>
              </div>

              {/* GOOGLE COMPLIANCE CHECKLIST */}
              <div className="mt-5 space-y-2 text-xs">
                <div className="font-semibold text-gray-800 mb-2">Google Indexing Requirements:</div>
                <div className="flex items-center gap-2 text-gray-700">
                  <CheckCircle2 className={`w-4 h-4 ${title ? 'text-green-500' : 'text-gray-300'}`} />
                  <span>Job Title specified</span>
                </div>
                <div className="flex items-center gap-2 text-gray-700">
                  <CheckCircle2 className={`w-4 h-4 ${activeCompany?.name ? 'text-green-500' : 'text-gray-300'}`} />
                  <span>Hiring Organization identified</span>
                </div>
                <div className="flex items-center gap-2 text-gray-700">
                  <CheckCircle2 className={`w-4 h-4 ${description ? 'text-green-500' : 'text-gray-300'}`} />
                  <span>Full HTML description formatted</span>
                </div>
                <div className="flex items-center gap-2 text-gray-700">
                  <CheckCircle2 className={`w-4 h-4 ${validThroughDate ? 'text-green-500' : 'text-gray-300'}`} />
                  <span>ValidThrough expiry timestamp set</span>
                </div>
                <div className="flex items-center gap-2 text-gray-700">
                  <CheckCircle2 className={`w-4 h-4 ${salaryDisclosed ? 'text-green-500' : 'text-gray-300'}`} />
                  <span>BaseSalary monetary amount included</span>
                </div>
              </div>

              {/* JSON-LD CODE VIEWER */}
              <div className="mt-6 pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-gray-700">Schema.org JSON-LD (Live)</span>
                  <button
                    type="button"
                    onClick={handleCopySchema}
                    className="inline-flex items-center gap-1 text-xs text-amber-600 hover:text-amber-700 font-semibold"
                  >
                    {copiedSchema ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-green-600" /> Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" /> Copy Code
                      </>
                    )}
                  </button>
                </div>
                <pre className="bg-gray-900 text-gray-200 p-3 rounded-lg text-[10px] font-mono overflow-x-auto max-h-60 leading-relaxed">
                  {JSON.stringify(generatedSchema, null, 2)}
                </pre>
              </div>

            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
