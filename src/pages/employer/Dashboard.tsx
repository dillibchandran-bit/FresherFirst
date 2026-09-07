import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { LogOut, Building2, Plus, Briefcase, FileText, CheckCircle2, Clock, XCircle, Users, Eye } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Company, EmployerProfile, Job } from '../../types';

export default function EmployerDashboard() {
  const { profile, signOut, user } = useAuth();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [employerData, setEmployerData] = useState<EmployerProfile | null>(null);
  const [company, setCompany] = useState<Company | null>(null);
  const [jobs, setJobs] = useState<any[]>([]);
  const [stats, setStats] = useState({
    active: 0,
    pending: 0,
    closed: 0,
    applications: 0
  });

  // Setup states
  const [setupCompanyName, setSetupCompanyName] = useState('');
  const [setupSaving, setSetupSaving] = useState(false);

  useEffect(() => {
    if (user) fetchDashboardData();
  }, [user]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // 1. Get employer profile
      const { data: empData } = await supabase
        .from('employer_profiles')
        .select('*')
        .eq('profile_id', user!.id)
        .maybeSingle();
      
      setEmployerData(empData);

      if ((empData as any)?.company_id) {
        // 2. Get company
        const { data: compData } = await supabase
          .from('companies')
          .select('*')
          .eq('id', (empData as any).company_id)
          .maybeSingle();
        
        setCompany(compData);

        // 3. Get jobs and application counts
        const { data: jobsData } = await supabase
          .from('jobs')
          .select(`
            *,
            applications ( count )
          `)
          .eq('company_id', (empData as any).company_id)
          .order('created_at', { ascending: false });
        
        if (jobsData) {
          setJobs(jobsData);
          
          let active = 0, pending = 0, closed = 0, totalApps = 0;
          jobsData.forEach((j: any) => {
            if (j.status === 'published') active++;
            if (j.status === 'pending' || j.status === 'draft') pending++;
            if (j.status === 'closed') closed++;
            totalApps += (j.applications?.[0]?.count || 0);
          });

          setStats({ active, pending, closed, applications: totalApps });
        }
      }
    } catch (error) {
      console.error('Error fetching dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    setSetupSaving(true);
    try {
      const slug = setupCompanyName.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now();
      
      const { data: newCompany, error: companyError } = await supabase
        .from('companies')
        .insert({
          name: setupCompanyName,
          slug: slug,
        } as any).select().single()
        .select()
        .maybeSingle();
        
      if (companyError) throw companyError;

      const { error: updateError } = await supabase
        .from('employer_profiles')
        .update({ company_id: (newCompany as any).id } as any)
        .eq('profile_id', user!.id);
        
      if (updateError) throw updateError;
      
      setCompany(newCompany);
      fetchDashboardData();
    } catch (error) {
      console.error(error);
      alert("Failed to create company.");
    } finally {
      setSetupSaving(false);
    }
  };

  
  const handleRequestVerification = async () => {
    if (confirm('Request verification for your company? Our team will review your profile.')) {
      await supabase.from('companies').update({ verification_status: 'pending' } as any).eq('id', company.id);
      window.location.reload();
    }
  };
  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'published': return <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Published</span>;
      case 'pending': return <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">Pending Review</span>;
      case 'draft': return <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">Draft</span>;
      case 'closed': return <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">Closed</span>;
      case 'rejected': return <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">Rejected</span>;
      default: return <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">{status}</span>;
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  // FORCE COMPANY SETUP IF MISSING
  if (!company) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 min-h-screen">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200 text-center">
          <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900">Complete Company Setup</h2>
          <p className="text-gray-500 mt-2 mb-6">Before you can post jobs, we need some basic details about your company.</p>
          
          <form onSubmit={handleCreateCompany} className="max-w-md mx-auto text-left">
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
              <input type="text" required value={setupCompanyName} onChange={(e) => setSetupCompanyName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-gray-900 outline-none"
                placeholder="Acme Corp" />
            </div>
            <button type="submit" disabled={setupSaving} className="w-full bg-gray-900 text-white py-2.5 rounded-lg font-medium hover:bg-gray-800 disabled:opacity-70">
              {setupSaving ? 'Saving...' : 'Create Company Profile'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Employer Portal</h1>
          <p className="text-gray-600 mt-1 flex items-center gap-2">
            {company.name} 
            
            {company.verification_status === 'verified' && <span className="inline-flex items-center gap-1 text-xs font-medium text-green-700 bg-green-50 px-2 py-0.5 rounded-full"><CheckCircle2 className="w-3 h-3"/> Verified</span>}
            {company.verification_status === 'pending' && <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full"><Clock className="w-3 h-3"/> Verification Pending</span>}
            {company.verification_status === 'rejected' && <span className="inline-flex items-center gap-1 text-xs font-medium text-red-700 bg-red-50 px-2 py-0.5 rounded-full">Verification Rejected</span>}
            {company.verification_status === 'suspended' && <span className="inline-flex items-center gap-1 text-xs font-medium text-red-700 bg-red-50 px-2 py-0.5 rounded-full">Suspended</span>}
            {(!company.verification_status || company.verification_status === 'unverified') && <button onClick={handleRequestVerification} className="inline-flex items-center gap-1 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 px-2 py-0.5 rounded-full cursor-pointer transition-colors">Unverified - Request Verification</button>}

          </p>
        </div>
        <div className="flex gap-4">
          <Link to="/employer/post-job" className="flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-lg font-medium hover:bg-gray-800 transition-colors">
            <Plus className="w-4 h-4" /> Post a Job
          </Link>
          <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors">
            <LogOut className="w-4 h-4" /> Sign out
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-500 font-medium">Active Jobs</h3>
            <Briefcase className="w-5 h-5 text-green-500" />
          </div>
          <span className="text-3xl font-bold text-gray-900">{stats.active}</span>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-500 font-medium">Pending Review</h3>
            <Clock className="w-5 h-5 text-amber-500" />
          </div>
          <span className="text-3xl font-bold text-gray-900">{stats.pending}</span>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-500 font-medium">Closed Jobs</h3>
            <XCircle className="w-5 h-5 text-red-500" />
          </div>
          <span className="text-3xl font-bold text-gray-900">{stats.closed}</span>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-500 font-medium">Total Applications</h3>
            <Users className="w-5 h-5 text-blue-500" />
          </div>
          <span className="text-3xl font-bold text-gray-900">{stats.applications}</span>
        </div>
      </div>
      
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h2 className="text-lg font-bold text-gray-900">Your Job Postings</h2>
        </div>
        
        {jobs.length === 0 ? (
          <div className="text-center py-20">
            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-900">No jobs posted yet</h3>
            <p className="text-gray-500 mt-2 mb-6">Create your first job listing to start hiring freshers.</p>
            <Link to="/employer/post-job" className="inline-flex items-center gap-2 bg-gray-900 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-gray-800 transition-colors">
              <Plus className="w-4 h-4" /> Post a Job
            </Link>
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {jobs.map(job => (
              <li key={job.id} className="p-6 hover:bg-gray-50 transition-colors flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <Link to={`/employer/jobs/${job.id}/edit`} className="text-lg font-bold text-gray-900 hover:text-amber-600 transition-colors">
                      {job.title}
                    </Link>
                    {getStatusBadge(job.status)}
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
                    <span className="flex items-center gap-1.5"><Briefcase className="w-4 h-4" /> {job.job_type.replace('_', ' ')}</span>
                    <span>&bull;</span>
                    <span className="flex items-center gap-1.5"><Building2 className="w-4 h-4" /> {job.work_mode.replace('_', ' ')}</span>
                    <span>&bull;</span>
                    <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" /> Posted {new Date(job.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Link 
                    to={`/employer/jobs/${job.id}/applicants`} 
                    className="flex items-center gap-2 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 border border-gray-300 px-4 py-2 rounded-lg transition-colors"
                  >
                    <Users className="w-4 h-4" /> 
                    Applicants ({job.applications?.[0]?.count || 0})
                  </Link>
                  <Link 
                    to={`/employer/jobs/${job.id}/edit`} 
                    className="text-sm font-medium text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg transition-colors"
                  >
                    Edit
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
