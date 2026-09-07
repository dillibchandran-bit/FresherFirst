import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { ArrowLeft, Save, Send, Loader2, AlertCircle, Sparkles } from 'lucide-react';
import { JobType, WorkMode, JobStatus } from '../../types';

export default function PostJob() {
  const { id } = useParams<{ id: string }>();
  const isEditing = !!id;
  const { user } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [roughNotes, setRoughNotes] = useState('');
  const [generatingAi, setGeneratingAi] = useState(false);

  const handleGenerateAi = async () => {
    if (!roughNotes.trim()) return;
    setGeneratingAi(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch('/api/ai/structure-job', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session?.access_token}` },
        body: JSON.stringify({ roughDescription: roughNotes })
      });
      if (!res.ok) throw new Error('AI generation failed');
      const data = await res.json();
      
      if (data.title_suggestion) setTitle(data.title_suggestion);
      if (data.description_intro) setDescription(data.description_intro);
      if (data.responsibilities) setResponsibilities(data.responsibilities.join('\n'));
      if (data.requirements) setRequirements(data.requirements.join('\n'));
      if (data.skills) setSkills(data.skills.join(', '));
      
      setRoughNotes('');
    } catch (err: any) {
      alert(err.message);
    } finally {
      setGeneratingAi(false);
    }
  };


  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [responsibilities, setResponsibilities] = useState('');
  const [requirements, setRequirements] = useState('');
  const [skills, setSkills] = useState('');
  const [experienceMin, setExperienceMin] = useState(0);
  const [experienceMax, setExperienceMax] = useState(2);
  const [salaryMin, setSalaryMin] = useState('');
  const [salaryMax, setSalaryMax] = useState('');
  const [salaryPeriod, setSalaryPeriod] = useState('yearly');
  const [jobType, setJobType] = useState<JobType>('full_time');
  const [workMode, setWorkMode] = useState<WorkMode>('on_site');
  const [openings, setOpenings] = useState(1);
  const [fresherEligible, setFresherEligible] = useState(true);
  const [status, setStatus] = useState<JobStatus>('draft');

  useEffect(() => {
    if (isEditing && user) {
      loadJob();
    }
  }, [id, user]);

  const loadJob = async () => {
    try {
      const { data, error } = await supabase.from('jobs').select('*').eq('id', id).single();
      if (error) throw error;

      setTitle(data.title);
      setDescription(data.description);
      setResponsibilities(data.responsibilities.join('\n'));
      setRequirements(data.requirements.join('\n'));
      setSkills(data.skills_list ? data.skills_list.join(', ') : '');
      setExperienceMin(data.experience_min);
      setExperienceMax(data.experience_max);
      setSalaryMin(data.salary_min?.toString() || '');
      setSalaryMax(data.salary_max?.toString() || '');
      setSalaryPeriod(data.salary_period || 'yearly');
      setJobType(data.job_type);
      setWorkMode(data.work_mode);
      setOpenings(data.openings);
      setFresherEligible(data.fresher_eligible);
      setStatus(data.status);
    } catch (err: any) {
      setError(err.message || 'Failed to load job');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (action: 'draft' | 'pending') => {
    setSaving(true);
    setError(null);

    try {
      // Get company_id
      const { data: empData, error: empError } = await supabase
        .from('employer_profiles')
        .select('company_id')
        .eq('profile_id', user!.id)
        .single();

      if (empError || !empData?.company_id) {
        throw new Error("Company profile not found. Please complete your company setup first.");
      }

      const companyId = empData.company_id;

      // Validation
      if (!title || !description) {
        throw new Error("Title and Description are required.");
      }

      const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now();
      const splitLines = (str: string) => str.split('\n').map(s => s.trim()).filter(Boolean);
      const splitComma = (str: string) => str.split(',').map(s => s.trim()).filter(Boolean);

      const jobData = {
        title,
        description,
        responsibilities: splitLines(responsibilities),
        requirements: splitLines(requirements),
        skills_list: splitComma(skills),
        experience_min: experienceMin,
        experience_max: experienceMax,
        salary_min: salaryMin ? parseInt(salaryMin) : null,
        salary_max: salaryMax ? parseInt(salaryMax) : null,
        salary_period: salaryPeriod,
        job_type: jobType,
        work_mode: workMode,
        openings,
        fresher_eligible: fresherEligible,
        status: action,
        company_id: companyId,
        ...(isEditing ? {} : { slug })
      };

      if (isEditing) {
        const { error: updateError } = await supabase.from('jobs').update(jobData).eq('id', id);
        if (updateError) throw updateError;
      } else {
        const { error: insertError } = await supabase.from('jobs').insert(jobData);
        if (insertError) throw insertError;
      }

      navigate('/employer/dashboard');
    } catch (err: any) {
      setError(err.message || 'Failed to save job');
      setSaving(false);
    }
  };

  const handleStatusChange = async (newStatus: JobStatus) => {
    if (!isEditing) return;
    if (!confirm(`Are you sure you want to change the status to ${newStatus}?`)) return;
    
    setSaving(true);
    try {
      const { error } = await supabase.from('jobs').update({ status: newStatus }).eq('id', id);
      if (error) throw error;
      setStatus(newStatus);
    } catch (err: any) {
      setError(err.message || 'Failed to update status');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-amber-500" /></div>;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
      <div className="mb-6 flex items-center justify-between">
        <Link to="/employer/dashboard" className="flex items-center text-sm font-medium text-gray-500 hover:text-gray-900">
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to Dashboard
        </Link>
        {isEditing && (
          <div className="flex gap-2">
            {status !== 'closed' && status !== 'rejected' && (
              <button onClick={() => handleStatusChange('closed')} className="px-3 py-1.5 text-sm font-medium bg-red-50 text-red-700 hover:bg-red-100 rounded-md">
                Close Job
              </button>
            )}
            {status === 'closed' && (
              <button onClick={() => handleStatusChange('pending')} className="px-3 py-1.5 text-sm font-medium bg-amber-50 text-amber-700 hover:bg-amber-100 rounded-md">
                Reopen (Submit for review)
              </button>
            )}
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-900">{isEditing ? 'Edit Job Posting' : 'Create New Job'}</h1>
          {isEditing && (
            <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-gray-200 text-gray-800 uppercase tracking-wider">
              Status: {status}
            </span>
          )}
        </div>

        {error && (
          <div className="m-6 p-4 bg-red-50 border border-red-100 rounded-lg flex gap-3 text-red-700">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p className="text-sm">{error}</p>
          </div>
        )}

        <div className="p-6 space-y-8">
          
          {/* AI Assistant */}
          <section className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-6 border border-indigo-100">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-5 h-5 text-indigo-600" />
              <h2 className="text-lg font-bold text-indigo-900">AI Job Description Assistant</h2>
            </div>
            <p className="text-sm text-indigo-700 mb-4">Provide rough notes about the role, and AI will structure the responsibilities, requirements, and required skills for you. Please review all AI-generated content before publishing.</p>
            <div className="flex gap-4">
              <textarea 
                value={roughNotes} 
                onChange={(e) => setRoughNotes(e.target.value)} 
                rows={3}
                className="flex-1 px-4 py-3 border border-indigo-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                placeholder="e.g. Need a frontend dev with 2 yrs react experience. Must know tailwind. Will build our new admin panel." 
              />
              <button 
                onClick={handleGenerateAi}
                disabled={generatingAi || !roughNotes.trim()}
                className="self-end px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2 transition-colors whitespace-nowrap"
              >
                {generatingAi ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                Generate
              </button>
            </div>
          </section>

          {/* Basics */}
          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-4">Basic Information</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Job Title *</label>
                <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 outline-none"
                  placeholder="e.g. Junior Frontend Developer" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Job Type</label>
                  <select value={jobType} onChange={(e) => setJobType(e.target.value as JobType)} className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none">
                    <option value="full_time">Full Time</option>
                    <option value="part_time">Part Time</option>
                    <option value="contract">Contract</option>
                    <option value="internship">Internship</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Work Mode</label>
                  <select value={workMode} onChange={(e) => setWorkMode(e.target.value as WorkMode)} className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none">
                    <option value="on_site">On-site</option>
                    <option value="hybrid">Hybrid</option>
                    <option value="remote">Remote</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Number of Openings</label>
                  <input type="number" min="1" value={openings} onChange={(e) => setOpenings(parseInt(e.target.value))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none" />
                </div>
                <div className="flex items-center mt-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={fresherEligible} onChange={(e) => setFresherEligible(e.target.checked)} className="w-5 h-5 rounded border-gray-300 text-gray-900 focus:ring-gray-900" />
                    <span className="text-sm font-medium text-gray-700">Fresher Eligible</span>
                  </label>
                </div>
              </div>
            </div>
          </section>

          {/* Details */}
          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-4">Job Details</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none"
                  placeholder="Overview of the role..." />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Responsibilities (One per line)</label>
                  <textarea value={responsibilities} onChange={(e) => setResponsibilities(e.target.value)} rows={5}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none"
                    placeholder="Write clean code&#10;Collaborate with team&#10;..." />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Requirements (One per line)</label>
                  <textarea value={requirements} onChange={(e) => setRequirements(e.target.value)} rows={5}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none"
                    placeholder="B.Tech in CS&#10;Basic knowledge of React&#10;..." />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Required Skills (Comma separated)</label>
                <input type="text" value={skills} onChange={(e) => setSkills(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none"
                  placeholder="React, TypeScript, Node.js" />
              </div>
            </div>
          </section>

          {/* Compensation & Experience */}
          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-4">Experience & Compensation</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Min Exp (Years)</label>
                  <input type="number" min="0" value={experienceMin} onChange={(e) => setExperienceMin(parseInt(e.target.value))} className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Max Exp (Years)</label>
                  <input type="number" min="0" value={experienceMax} onChange={(e) => setExperienceMax(parseInt(e.target.value))} className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none" />
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Min Salary</label>
                  <input type="number" value={salaryMin} onChange={(e) => setSalaryMin(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none" placeholder="300000" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Max Salary</label>
                  <input type="number" value={salaryMax} onChange={(e) => setSalaryMax(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none" placeholder="500000" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Period</label>
                  <select value={salaryPeriod} onChange={(e) => setSalaryPeriod(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none">
                    <option value="yearly">Yearly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>
              </div>
            </div>
          </section>
        </div>

        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex gap-4 justify-end">
          <button 
            onClick={() => handleSubmit('draft')}
            disabled={saving || (status !== 'draft' && isEditing)}
            className="flex items-center gap-2 px-6 py-2.5 rounded-lg font-medium border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save as Draft
          </button>
          
          <button 
            onClick={() => handleSubmit('pending')}
            disabled={saving || status === 'closed' || status === 'rejected'}
            className="flex items-center gap-2 px-6 py-2.5 rounded-lg font-medium text-white bg-gray-900 hover:bg-gray-800 disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            {isEditing && status === 'published' ? 'Save Changes' : 'Submit for Review'}
          </button>
        </div>
      </div>
    </div>
  );
}
