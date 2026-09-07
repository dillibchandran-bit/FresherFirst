import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Link } from 'react-router-dom';
import { Briefcase, Building2, MapPin, Clock, FileText, CheckCircle2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function CandidateApplications() {
  const { user } = useAuth();
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [withdrawing, setWithdrawing] = useState<string | null>(null);

  useEffect(() => {
    if (user) fetchApplications();
  }, [user]);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('applications')
        .select(`
          id,
          status,
          applied_at,
          job:jobs(
            id, title, slug, location:locations(name), company:companies(name, logo_url)
          )
        `)
        .eq('candidate_id', user!.id)
        .order('applied_at', { ascending: false });

      if (error) throw error;
      setApplications(data || []);
    } catch (error) {
      console.error('Error fetching applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async (appId: string) => {
    if (!confirm('Are you sure you want to withdraw this application? This action cannot be undone.')) return;
    
    setWithdrawing(appId);
    try {
      const { error } = await supabase
        .from('applications')
        .update({ status: 'withdrawn' })
        .eq('id', appId)
        .eq('candidate_id', user!.id);

      if (error) throw error;
      
      setApplications(apps => apps.map(app => 
        app.id === appId ? { ...app, status: 'withdrawn' } : app
      ));
    } catch (error) {
      console.error('Error withdrawing:', error);
      alert('Failed to withdraw application. Please try again later.');
    } finally {
      setWithdrawing(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'applied':
      case 'pending':
        return <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">Applied</span>;
      case 'under_review':
      case 'reviewed':
        return <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">Under Review</span>;
      case 'shortlisted':
        return <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-200">Shortlisted</span>;
      case 'interview':
        return <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-purple-50 text-purple-700 border border-purple-200">Interview</span>;
      case 'selected':
      case 'hired':
        return <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200">Selected</span>;
      case 'rejected':
        return <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-200">Not Selected</span>;
      case 'withdrawn':
        return <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200">Withdrawn</span>;
      default:
        return <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200">{status}</span>;
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading applications...</div>;

  return (
    <div className="max-w-5xl mx-auto px-4 py-12 min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My Applications</h1>
        <p className="text-gray-500 mt-2">Track the status of your job applications</p>
      </div>

      {applications.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8 text-gray-400" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">No applications yet</h2>
          <p className="text-gray-500 mt-2 mb-6">You haven't applied to any jobs. Start exploring opportunities!</p>
          <Link to="/jobs" className="inline-flex bg-gray-900 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-gray-800">
            Browse Jobs
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <ul className="divide-y divide-gray-200">
            {applications.map(app => {
              const isActive = !['rejected', 'withdrawn', 'selected', 'hired'].includes(app.status);
              
              return (
                <li key={app.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    
                    <div className="flex items-start gap-4">
                      {app.job.company.logo_url ? (
                        <img src={app.job.company.logo_url} className="w-12 h-12 rounded bg-white border border-gray-100 p-1 object-contain" />
                      ) : (
                        <div className="w-12 h-12 rounded bg-gray-100 border border-gray-200 flex items-center justify-center flex-shrink-0">
                          <Building2 className="w-6 h-6 text-gray-400" />
                        </div>
                      )}
                      
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">
                          <Link to={`/jobs/${app.job.slug}`} className="hover:text-amber-600 transition-colors">
                            {app.job.title}
                          </Link>
                        </h3>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-sm text-gray-600">
                          <span className="font-medium">{app.job.company.name}</span>
                          {app.job.location?.name && (
                            <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{app.job.location.name}</span>
                          )}
                          <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />Applied {formatDistanceToNow(new Date(app.applied_at))} ago</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center gap-3 w-full md:w-auto mt-4 md:mt-0 pt-4 md:pt-0 border-t border-gray-100 md:border-0">
                      {getStatusBadge(app.status)}
                      
                      {isActive && (
                        <button 
                          onClick={() => handleWithdraw(app.id)}
                          disabled={withdrawing === app.id}
                          className="text-xs font-medium text-red-600 hover:text-red-700 hover:underline disabled:opacity-50"
                        >
                          Withdraw Application
                        </button>
                      )}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
