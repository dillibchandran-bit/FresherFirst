import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Shield, Users, Building2, Briefcase, Flag, Activity, Settings, AlertCircle, CheckCircle2, Search, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function AdminDashboard() {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);

  // States for tabs
  const [metrics, setMetrics] = useState({
    candidates: 0,
    employers: 0,
    verifiedEmployers: 0,
    pendingEmployers: 0,
    publishedJobs: 0,
    pendingJobs: 0,
    totalApplications: 0,
    reportedJobs: 0,
  });

  const [candidates, setCandidates] = useState<any[]>([]);
  const [companies, setCompanies] = useState<any[]>([]);
  const [jobs, setJobs] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [locations, setLocations] = useState<any[]>([]);

  const [jobSearch, setJobSearch] = useState('');
  const [empSearch, setEmpSearch] = useState('');
  const [candSearch, setCandSearch] = useState('');


  useEffect(() => {
    if (profile?.role === 'admin') {
      fetchAllData();
    }
  }, [profile]);

  const logAdminAction = async (action: string, target_type: string, target_id: string, details: any = {}) => {
    try {
      await supabase.rpc('log_admin_action' as any, {
        p_admin_id: user!.id,
        p_action: action,
        p_target_type: target_type,
        p_target_id: target_id,
        p_details: details
      });
      fetchAuditLogs();
    } catch (e) {
      console.error("Failed to log admin action", e);
    }
  };

  const fetchAllData = async () => {
    setLoading(true);
    await Promise.all([
      fetchMetrics(),
      fetchJobs(),
      fetchCompanies(),
      fetchCandidates(),
      fetchReports(),
      fetchAuditLogs(),
      fetchConfig()
    ]);
    setLoading(false);
  };

  const fetchMetrics = async () => {
    const { count: cCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'candidate');
    const { count: eCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'employer');
    const { count: vEmpCount } = await supabase.from('companies').select('*', { count: 'exact', head: true }).eq('verification_status', 'verified');
    const { count: pEmpCount } = await supabase.from('companies').select('*', { count: 'exact', head: true }).eq('verification_status', 'pending');
    const { count: pubJobsCount } = await supabase.from('jobs').select('*', { count: 'exact', head: true }).eq('status', 'published');
    const { count: pendJobsCount } = await supabase.from('jobs').select('*', { count: 'exact', head: true }).eq('status', 'pending');
    const { count: appCount } = await supabase.from('applications').select('*', { count: 'exact', head: true });
    const { count: repCount } = await supabase.from('job_reports').select('*', { count: 'exact', head: true }).eq('status', 'pending');
    
    setMetrics({
      candidates: cCount || 0,
      employers: eCount || 0,
      verifiedEmployers: vEmpCount || 0,
      pendingEmployers: pEmpCount || 0,
      publishedJobs: pubJobsCount || 0,
      pendingJobs: pendJobsCount || 0,
      totalApplications: appCount || 0,
      reportedJobs: repCount || 0,
    });
  };

  const fetchJobs = async () => {
    const { data } = await supabase.from('jobs').select('*, company:companies(name)').order('created_at', { ascending: false });
    if (data) setJobs(data);
  };

  const fetchCompanies = async () => {
    const { data } = await supabase.from('companies').select('*').order('created_at', { ascending: false });
    if (data) setCompanies(data);
  };

  const fetchCandidates = async () => {
    const { data } = await supabase.from('profiles').select('*').eq('role', 'candidate').order('created_at', { ascending: false });
    if (data) setCandidates(data);
  };

  const fetchReports = async () => {
    const { data } = await supabase.from('job_reports').select('*, job:jobs(title, company_id), reporter:profiles(full_name)').order('created_at', { ascending: false });
    if (data) setReports(data);
  };

  const fetchAuditLogs = async () => {
    const { data } = await supabase.from('admin_audit_logs').select('*, admin:profiles(full_name)').order('created_at', { ascending: false }).limit(50);
    if (data) setAuditLogs(data);
  };

  const fetchConfig = async () => {
    const { data: catData } = await supabase.from('job_categories').select('*').order('name');
    if (catData) setCategories(catData);
    const { data: locData } = await supabase.from('locations').select('*').order('name');
    if (locData) setLocations(locData);
  };

  // -------------------------------------------------------------
  // ACTIONS
  // -------------------------------------------------------------

  
  const handleUpdateCompanyStatus = async (id: string, status: string) => {
    await supabase.from('companies').update({ verification_status: status } as any).eq('id', id);
    logAdminAction(`company_status_${status}`, 'company', id);
    fetchCompanies();
    fetchMetrics();
  };


  const handleUpdateJobStatus = async (id: string, status: string) => {
    await supabase.from('jobs').update({ status } as any).eq('id', id);
    logAdminAction(`updated_job_status_${status}`, 'job', id);
    fetchJobs();
    fetchMetrics();
  };

  const handleToggleProfileStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'suspended' ? 'active' : 'suspended';
    await supabase.from('profiles').update({ status: newStatus } as any).eq('id', id);
    logAdminAction(`${newStatus}_profile`, 'profile', id);
    fetchCandidates();
  };

  const handleResolveReport = async (id: string, status: string) => {
    await supabase.from('job_reports').update({ status } as any).eq('id', id);
    logAdminAction(`resolved_report_${status}`, 'job_report', id);
    fetchReports();
    fetchMetrics();
  };

  
  const handleAddCategory = async () => {
    const name = prompt('Enter new category name:');
    if (!name) return;
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    await supabase.from('job_categories').insert({ name, slug } as any);
    logAdminAction('created_category', 'category', slug);
    fetchConfig();
  };

  const handleAddLocation = async () => {
    const name = prompt('Enter new location name:');
    if (!name) return;
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    await supabase.from('locations').insert({ name, slug } as any);
    logAdminAction('created_location', 'location', slug);
    fetchConfig();
  };

  const handleDeleteCategory = async (id, name) => {
    if (!confirm(`Are you sure you want to delete category "${name}"?`)) return;
    await supabase.from('job_categories').delete().eq('id', id);
    logAdminAction('deleted_category', 'category', id);
    fetchConfig();
  };

  const handleDeleteLocation = async (id, name) => {
    if (!confirm(`Are you sure you want to delete location "${name}"?`)) return;
    await supabase.from('locations').delete().eq('id', id);
    logAdminAction('deleted_location', 'location', id);
    fetchConfig();
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading admin panel...</div>;

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 bg-gray-900 text-white flex flex-col">
        <div className="p-6">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Shield className="w-6 h-6 text-amber-500" /> Admin
          </h2>
          <p className="text-gray-400 text-sm mt-1">{profile?.full_name}</p>
        </div>
        
        <nav className="flex-1 px-4 space-y-1">
          {[
            { id: 'overview', icon: Activity, label: 'Overview' },
            { id: 'jobs', icon: Briefcase, label: 'Jobs' },
            { id: 'employers', icon: Building2, label: 'Employers' },
            { id: 'candidates', icon: Users, label: 'Candidates' },
            { id: 'reports', icon: Flag, label: 'Reports' },
            { id: 'config', icon: Settings, label: 'Categories & Locations' },
            { id: 'audit', icon: Shield, label: 'Audit Logs' },
          ].map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeTab === item.id ? 'bg-amber-500 text-gray-900' : 'text-gray-300 hover:bg-gray-800'}`}
            >
              <item.icon className="w-5 h-5" /> {item.label}
            </button>
          ))}
        </nav>
        
        <div className="p-4 border-t border-gray-800">
          <button onClick={() => { signOut(); navigate('/'); }} className="flex items-center gap-2 text-sm text-gray-400 hover:text-white w-full">
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-8 max-w-6xl mx-auto">
          
          {/* OVERVIEW */}
          {activeTab === 'overview' && (
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard Overview</h1>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                  <div className="text-gray-500 text-sm font-medium">Pending Jobs</div>
                  <div className="text-3xl font-bold text-gray-900 mt-2">{metrics.pendingJobs}</div>
                </div>
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                  <div className="text-gray-500 text-sm font-medium">Pending Employers</div>
                  <div className="text-3xl font-bold text-gray-900 mt-2">{metrics.pendingEmployers}</div>
                </div>
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                  <div className="text-gray-500 text-sm font-medium">Reported Jobs</div>
                  <div className="text-3xl font-bold text-gray-900 mt-2">{metrics.reportedJobs}</div>
                </div>
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                  <div className="text-gray-500 text-sm font-medium">Total Apps</div>
                  <div className="text-3xl font-bold text-gray-900 mt-2">{metrics.totalApplications}</div>
                </div>
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                  <div className="text-gray-500 text-sm font-medium">Verified Employers</div>
                  <div className="text-3xl font-bold text-gray-900 mt-2">{metrics.verifiedEmployers}</div>
                </div>
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                  <div className="text-gray-500 text-sm font-medium">Published Jobs</div>
                  <div className="text-3xl font-bold text-gray-900 mt-2">{metrics.publishedJobs}</div>
                </div>
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                  <div className="text-gray-500 text-sm font-medium">Total Candidates</div>
                  <div className="text-3xl font-bold text-gray-900 mt-2">{metrics.candidates}</div>
                </div>
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                  <div className="text-gray-500 text-sm font-medium">Total Employers</div>
                  <div className="text-3xl font-bold text-gray-900 mt-2">{metrics.employers}</div>
                </div>
              </div>
            </div>
          )}

          {/* JOBS */}
          {activeTab === 'jobs' && (
            <div>
              
              <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Manage Jobs</h1>
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type="text" placeholder="Search jobs..." value={jobSearch} onChange={e => setJobSearch(e.target.value)} className="pl-9 pr-4 py-2 border rounded-lg text-sm" />
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <table className="w-full text-left text-sm text-gray-500">
                  <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b">
                    <tr>
                      <th className="px-6 py-3">Job Title</th>
                      <th className="px-6 py-3">Company</th>
                      <th className="px-6 py-3">Status</th>
                      <th className="px-6 py-3">Actions</th>
                    </tr>
                  </thead>
                  
                  <tbody>
                    {companies.filter(c => c.name.toLowerCase().includes(empSearch.toLowerCase())).map(company => (
                      <tr key={company.id} className="border-b">
                        <td className="px-6 py-4 font-medium text-gray-900">{company.name}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            company.verification_status === 'verified' ? 'bg-green-100 text-green-800' :
                            company.verification_status === 'pending' ? 'bg-amber-100 text-amber-800' :
                            company.verification_status === 'rejected' ? 'bg-red-100 text-red-800' :
                            company.verification_status === 'suspended' ? 'bg-gray-100 text-gray-800' :
                            'bg-gray-100 text-gray-600'
                          }`}>
                            {(company.verification_status || 'unverified').toUpperCase()}
                          </span>
                        </td>
                        <td className="px-6 py-4">{new Date(company.created_at).toLocaleDateString()}</td>
                        <td className="px-6 py-4">
                          <select 
                            value={company.verification_status || 'unverified'} 
                            onChange={(e) => handleUpdateCompanyStatus(company.id, e.target.value)}
                            className="text-xs border rounded p-1"
                          >
                            <option value="unverified">Unverified</option>
                            <option value="pending">Pending</option>
                            <option value="verified">Verified</option>
                            <option value="rejected">Rejected</option>
                            <option value="suspended">Suspended</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>

                </table>
              </div>
            </div>
          )}

          {/* CANDIDATES */}
          {activeTab === 'candidates' && (
            <div>
              
              <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Manage Candidates</h1>
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type="text" placeholder="Search name or email..." value={candSearch} onChange={e => setCandSearch(e.target.value)} className="pl-9 pr-4 py-2 border rounded-lg text-sm" />
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <table className="w-full text-left text-sm text-gray-500">
                  <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b">
                    <tr>
                      <th className="px-6 py-3">Name</th>
                      <th className="px-6 py-3">Email</th>
                      <th className="px-6 py-3">Status</th>
                      <th className="px-6 py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {candidates.filter(c => (c.full_name || "").toLowerCase().includes(candSearch.toLowerCase()) || c.email.toLowerCase().includes(candSearch.toLowerCase())).map(candidate => (
                      <tr key={candidate.id} className="border-b">
                        <td className="px-6 py-4 font-medium text-gray-900">{candidate.full_name}</td>
                        <td className="px-6 py-4">{candidate.email}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            candidate.status === 'suspended' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                          }`}>{candidate.status || 'active'}</span>
                        </td>
                        <td className="px-6 py-4">
                          <button 
                            onClick={() => handleToggleProfileStatus(candidate.id, candidate.status || 'active')}
                            className={`font-medium hover:underline ${candidate.status === 'suspended' ? 'text-green-600' : 'text-red-600'}`}
                          >
                            {candidate.status === 'suspended' ? 'Reactivate' : 'Suspend'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* REPORTS */}
          {activeTab === 'reports' && (
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-6">Job Reports</h1>
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <table className="w-full text-left text-sm text-gray-500">
                  <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b">
                    <tr>
                      <th className="px-6 py-3">Job Title</th>
                      <th className="px-6 py-3">Reason</th>
                      <th className="px-6 py-3">Status</th>
                      <th className="px-6 py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reports.map(report => (
                      <tr key={report.id} className="border-b">
                        <td className="px-6 py-4 font-medium text-gray-900">{report.job?.title || 'Unknown Job'}</td>
                        <td className="px-6 py-4 max-w-xs truncate" title={report.reason}>{report.reason}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            report.status === 'pending' ? 'bg-amber-100 text-amber-800' : 'bg-green-100 text-green-800'
                          }`}>{report.status}</span>
                        </td>
                        <td className="px-6 py-4 flex gap-3">
                          {report.status === 'pending' && (
                            <>
                              <button onClick={() => handleUpdateJobStatus(report.job_id, 'rejected')} className="text-red-600 font-medium hover:underline">Suspend Job</button>
                              <button onClick={() => handleResolveReport(report.id, 'resolved')} className="text-green-600 font-medium hover:underline">Dismiss</button>
                            </>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* CONFIG (Categories & Locations) */}
          {activeTab === 'config' && (
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-6">System Configuration</h1>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                  <h3 className="font-bold text-gray-900 mb-4">Job Categories</h3>
                  
                  
                  <ul className="divide-y divide-gray-100 mb-4 border rounded">
                    {locations.map(l => (
                      <li key={l.id} className="px-3 py-2 flex justify-between items-center text-sm">
                        <span>{l.name}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-gray-400 text-xs">{l.slug}</span>
                          <button onClick={() => handleDeleteLocation(l.id, l.name)} className="text-red-500 hover:text-red-700 text-xs">Delete</button>
                        </div>
                      </li>
                    ))}
                  </ul>
                  <button onClick={handleAddLocation} className="w-full py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded text-sm font-medium">Add Location</button>

                </div>
              </div>
            </div>
          )}

          {/* AUDIT LOGS */}
          {activeTab === 'audit' && (
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-6">Audit Logs</h1>
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <table className="w-full text-left text-sm text-gray-500">
                  <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b">
                    <tr>
                      <th className="px-6 py-3">Timestamp</th>
                      <th className="px-6 py-3">Admin</th>
                      <th className="px-6 py-3">Action</th>
                      <th className="px-6 py-3">Target</th>
                    </tr>
                  </thead>
                  <tbody>
                    {auditLogs.map(log => (
                      <tr key={log.id} className="border-b">
                        <td className="px-6 py-4 whitespace-nowrap">{new Date(log.created_at).toLocaleString()}</td>
                        <td className="px-6 py-4">{log.admin?.full_name || 'System'}</td>
                        <td className="px-6 py-4 font-mono text-xs">{log.action}</td>
                        <td className="px-6 py-4 text-xs">
                          {log.target_type}: {log.target_id?.substring(0, 8)}...
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
