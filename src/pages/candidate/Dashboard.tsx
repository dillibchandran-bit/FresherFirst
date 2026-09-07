import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { LogOut, User as UserIcon, FileText, Bookmark, Briefcase, ChevronRight, CheckCircle2 } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

export default function CandidateDashboard() {
  const { profile, signOut, user } = useAuth();
  const navigate = useNavigate();
  
  const [stats, setStats] = useState({
    applications: 0,
    savedJobs: 0,
    completion: 0
  });

  useEffect(() => {
    if (!user) return;

    const fetchStats = async () => {
      // Get counts
      const [appRes, savedRes, candidateRes, resumeRes] = await Promise.all([
        supabase.from('applications').select('*', { count: 'exact', head: true }).eq('candidate_id', user.id),
        supabase.from('saved_jobs').select('*', { count: 'exact', head: true }).eq('candidate_id', user.id),
        supabase.from('candidate_profiles').select('*').eq('profile_id', user.id).single(),
        supabase.from('resumes').select('id').eq('candidate_id', user.id).limit(1)
      ]);

      // Calculate simple completion
      let completedPoints = 0;
      let totalPoints = 5;
      
      if (profile?.full_name) completedPoints++;
      if (profile?.avatar_url) completedPoints++;
      
      const c = candidateRes.data;
      if (c) {
        if (c.phone) completedPoints++;
        if (c.career_objective) completedPoints++;
      }
      
      if (resumeRes.data && resumeRes.data.length > 0) completedPoints++;

      setStats({
        applications: appRes.count || 0,
        savedJobs: savedRes.count || 0,
        completion: Math.round((completedPoints / totalPoints) * 100)
      });
    };

    fetchStats();
  }, [user, profile]);

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Candidate Dashboard</h1>
          <p className="text-gray-600 mt-2">Welcome back, {profile?.full_name}</p>
        </div>
        <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors">
          <LogOut className="w-4 h-4" /> Sign out
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-500 font-medium">Profile Status</h3>
            <CheckCircle2 className="w-5 h-5 text-amber-500" />
          </div>
          <div>
            <div className="flex items-end gap-2 mb-2">
              <span className="text-3xl font-bold text-gray-900">{stats.completion}%</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2 mb-4">
              <div className="bg-amber-500 h-2 rounded-full transition-all" style={{ width: `${stats.completion}%` }}></div>
            </div>
            <Link to="/candidate/profile" className="text-amber-600 hover:text-amber-700 text-sm font-medium flex items-center gap-1">
              Complete profile <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-500 font-medium">Applications</h3>
            <Briefcase className="w-5 h-5 text-blue-500" />
          </div>
          <div>
            <span className="text-3xl font-bold text-gray-900">{stats.applications}</span>
            <Link to="/candidate/applications" className="mt-4 block text-gray-600 hover:text-gray-900 text-sm font-medium flex items-center gap-1">
              View all <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-500 font-medium">Saved Jobs</h3>
            <Bookmark className="w-5 h-5 text-green-500" />
          </div>
          <div>
            <span className="text-3xl font-bold text-gray-900">{stats.savedJobs}</span>
            <Link to="/candidate/saved" className="mt-4 block text-gray-600 hover:text-gray-900 text-sm font-medium flex items-center gap-1">
              View all <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-500 font-medium">Resume</h3>
            <FileText className="w-5 h-5 text-purple-500" />
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-4">{stats.completion > 60 ? "Resume active" : "Needs update"}</p>
            <Link to="/candidate/profile" className="text-purple-600 hover:text-purple-700 text-sm font-medium flex items-center gap-1">
              Manage resume <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
      
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200 py-16 text-center">
        <Briefcase className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <h3 className="text-xl font-medium text-gray-900">Recommended Jobs</h3>
        <p className="text-gray-500 mt-2 max-w-md mx-auto">Complete your profile to get personalized job recommendations in the Chennai IT corridor.</p>
        <Link to="/jobs" className="inline-block mt-6 bg-gray-900 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-gray-800 transition-colors">
          Browse all jobs
        </Link>
      </div>
    </div>
  );
}
