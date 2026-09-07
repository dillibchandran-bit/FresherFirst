import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { ArrowLeft, Download, Mail, Phone, FileText, MapPin, Loader2, Search } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '../../contexts/AuthContext';

export default function ManageApplicants() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [job, setJob] = useState<any>(null);
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    if (user && id) fetchApplicants();
  }, [id, user]);

  const fetchApplicants = async () => {
    setLoading(true);
    try {
      // Fetch Job Info
      const { data: jobData } = await supabase
        .from('jobs')
        .select('id, title, status')
        .eq('id', id)
        .single();
      
      setJob(jobData);

      // Fetch Applications (with Candidate profile joined)
      const { data: appsData, error } = await supabase
        .from('applications')
        .select(`
          id,
          status,
          applied_at,
          cover_letter,
          candidate:candidate_profiles(
            profile_id,
            phone,
            city,
            profile:profiles(full_name, email, avatar_url)
          ),
          resume:resumes(file_url)
        `)
        .eq('job_id', id)
        .order('applied_at', { ascending: false });

      if (error) throw error;
      setApplications(appsData || []);
    } catch (error) {
      console.error('Error fetching applicants:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (appId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('applications')
        .update({ status: newStatus } as any)
        .eq('id', appId);

      if (error) throw error;
      
      setApplications(apps => apps.map(app => 
        app.id === appId ? { ...app, status: newStatus } : app
      ));
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update status.');
    }
  };

  const getResumeUrl = async (path: string) => {
    try {
      // Create a signed URL valid for 60 seconds
      const { data, error } = await supabase.storage
        .from('resumes')
        .createSignedUrl(path, 60);
      
      if (error) throw error;
      if (data) window.open(data.signedUrl, '_blank');
    } catch (error) {
      console.error('Error getting resume URL:', error);
      alert('Could not open resume. Check permissions or try again.');
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-amber-500"/></div>;

  const filteredApps = filter === 'all' 
    ? applications 
    : applications.filter(a => a.status === filter);

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 min-h-screen">
      <div className="mb-6 flex items-center justify-between">
        <Link to="/employer/dashboard" className="flex items-center text-sm font-medium text-gray-500 hover:text-gray-900">
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to Dashboard
        </Link>
      </div>

      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{job?.title || 'Job Applicants'}</h1>
          <p className="text-gray-500 mt-1">Manage candidates who applied to this position.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <label className="text-sm font-medium text-gray-700">Filter by Status:</label>
          <select 
            value={filter} 
            onChange={(e) => setFilter(e.target.value)}
            className="border-gray-300 rounded-lg py-2 pl-3 pr-10 text-sm focus:ring-gray-900 focus:border-gray-900 outline-none border"
          >
            <option value="all">All Applicants ({applications.length})</option>
            <option value="applied">Applied / Pending</option>
            <option value="under_review">Under Review</option>
            <option value="shortlisted">Shortlisted</option>
            <option value="interview">Interview</option>
            <option value="selected">Selected</option>
            <option value="rejected">Rejected</option>
            <option value="withdrawn">Withdrawn</option>
          </select>
        </div>
      </div>

      {applications.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
          <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-gray-900">No applicants yet</h3>
          <p className="text-gray-500 mt-1">When candidates apply, they will appear here.</p>
        </div>
      ) : filteredApps.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
          <p className="text-gray-500">No applicants match this filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {filteredApps.map(app => {
            const profile = app.candidate?.profile || {};
            const phone = app.candidate?.phone;
            const city = app.candidate?.city;
            const resumePath = app.resume?.file_url;
            
            return (
              <div key={app.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col md:flex-row">
                {/* Candidate Info Side */}
                <div className="p-6 md:w-1/3 border-b md:border-b-0 md:border-r border-gray-100 bg-gray-50 flex flex-col items-center text-center">
                  <div className="w-20 h-20 bg-gray-200 rounded-full mb-4 flex items-center justify-center overflow-hidden border-2 border-white shadow-sm">
                    {profile.avatar_url ? (
                      <img loading="lazy" src={profile.avatar_url} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-2xl font-bold text-gray-400">{profile.full_name?.charAt(0) || '?'}</span>
                    )}
                  </div>
                  <h3 className="font-bold text-lg text-gray-900 mb-1">{profile.full_name || 'Unknown Candidate'}</h3>
                  
                  <div className="space-y-2 mt-4 w-full text-sm text-gray-600 text-left">
                    <a href={`mailto:${profile.email}`} className="flex items-center gap-2 hover:text-amber-600 truncate">
                      <Mail className="w-4 h-4 flex-shrink-0" /> <span className="truncate">{profile.email}</span>
                    </a>
                    {phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 flex-shrink-0" /> {phone}
                      </div>
                    )}
                    {city && (
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 flex-shrink-0" /> {city}
                      </div>
                    )}
                  </div>
                </div>

                {/* Application Details Side */}
                <div className="p-6 flex-1 flex flex-col">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Applied</div>
                      <div className="text-sm font-medium text-gray-900">{formatDistanceToNow(new Date(app.applied_at))} ago</div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <label className="text-xs font-bold text-gray-500 uppercase">Status:</label>
                      <select 
                        value={app.status === 'pending' ? 'applied' : app.status === 'reviewed' ? 'under_review' : app.status === 'hired' ? 'selected' : app.status}
                        onChange={(e) => updateStatus(app.id, e.target.value)}
                        disabled={app.status === 'withdrawn'}
                        className={`text-sm font-medium rounded-lg border py-1.5 pl-3 pr-8 focus:ring-0 ${
                          app.status === 'withdrawn' ? 'bg-gray-100 text-gray-500 cursor-not-allowed border-gray-200' : 'bg-white border-gray-300 text-gray-900 hover:border-gray-400 cursor-pointer'
                        }`}
                      >
                        <option value="applied">Applied</option>
                        <option value="under_review">Under Review</option>
                        <option value="shortlisted">Shortlisted</option>
                        <option value="interview">Interview</option>
                        <option value="selected">Selected</option>
                        <option value="rejected">Rejected</option>
                        {app.status === 'withdrawn' && <option value="withdrawn">Withdrawn (by candidate)</option>}
                      </select>
                    </div>
                  </div>

                  {app.cover_letter && (
                    <div className="mb-6 bg-amber-50/50 p-4 rounded-xl border border-amber-100/50 flex-grow">
                      <h4 className="text-xs font-bold text-amber-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5" /> Cover Note
                      </h4>
                      <p className="text-sm text-gray-700 whitespace-pre-wrap">{app.cover_letter}</p>
                    </div>
                  )}

                  <div className="mt-auto pt-4 border-t border-gray-100 flex justify-end">
                    {resumePath ? (
                      <button 
                        onClick={() => getResumeUrl(resumePath)}
                        className="flex items-center gap-2 bg-gray-900 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
                      >
                        <Download className="w-4 h-4" /> View Resume
                      </button>
                    ) : (
                      <span className="text-sm text-gray-500 italic">No resume attached</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
