import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { LogOut, User as UserIcon, FileText, Bookmark, Briefcase, ChevronRight, CheckCircle2, Sparkles, Loader2, ArrowRight } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

export default function CandidateDashboard() {
  const { profile, signOut, user } = useAuth();
  const navigate = useNavigate();
  
  
  const [aiLoading, setAiLoading] = useState(false);
  const [aiRecs, setAiRecs] = useState<any[] | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);
  const [dbJobs, setDbJobs] = useState<any[]>([]);

  const fetchAiRecommendations = async () => {
    setAiLoading(true);
    setAiError(null);
    try {
      // Fetch user profile data
      const { data: candData } = await supabase.from('candidate_profiles').select('*').eq('profile_id', user!.id).single();
      const { data: eduData } = await supabase.from('education').select('degree, field_of_study, institution').eq('candidate_id', user!.id);
      const { data: expData } = await supabase.from('experience').select('role, company, description').eq('candidate_id', user!.id);
      const { data: projData } = await supabase.from('projects').select('title, description').eq('candidate_id', user!.id);

      const profileForAi = {
        phone: (candData as any)?.phone,
        objective: (candData as any)?.career_objective,
        city: (candData as any)?.city,
        education: eduData,
        experience: expData,
        projects: projData,
      };

      // Fetch 20 recent published jobs
      const { data: jobsData, error: jobsErr } = await supabase
        .from('jobs')
        .select('id, title, description, skills_list, experience_min, experience_max, company_id, companies(name, location_city)')
        .eq('status', 'published')
        .order('created_at', { ascending: false })
        .limit(20);

      if (jobsErr) throw jobsErr;
      if (!jobsData || jobsData.length === 0) throw new Error("No jobs available to recommend.");
      
      setDbJobs(jobsData);

      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch('/api/ai/suggest-jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session?.access_token}` },
        body: JSON.stringify({ candidateProfile: profileForAi, jobs: jobsData })
      });

      if (!res.ok) throw new Error('Failed to get AI recommendations');
      const aiResponse = await res.json();
      setAiRecs(aiResponse.recommendations || []);
    } catch (err: any) {
      setAiError(err.message);
    } finally {
      setAiLoading(false);
    }
  };

  const [stats, setStats] = useState<any>({
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
      
      
      <div className="bg-gradient-to-br from-indigo-900 to-purple-900 p-8 rounded-2xl shadow-lg border border-indigo-700 py-12 text-center text-white mb-8">
        <Sparkles className="w-12 h-12 text-indigo-300 mx-auto mb-4" />
        <h3 className="text-2xl font-bold">AI Career Matchmaker</h3>
        <p className="text-indigo-200 mt-2 max-w-lg mx-auto mb-6">Let Gemini analyze your profile, skills, and experience to find the perfect job matches for you from our latest openings.</p>
        
        {!aiRecs && !aiLoading && (
          <button 
            onClick={fetchAiRecommendations}
            className="inline-flex items-center gap-2 bg-white text-indigo-900 px-6 py-3 rounded-lg font-bold hover:bg-indigo-50 transition-colors shadow-sm"
          >
            Find My Matches
          </button>
        )}

        {aiLoading && (
          <div className="flex flex-col items-center justify-center py-4">
            <Loader2 className="w-8 h-8 animate-spin text-white mb-2" />
            <p className="text-indigo-200 text-sm">Analyzing profile and open roles...</p>
          </div>
        )}

        {aiError && (
          <div className="bg-red-500/20 text-red-100 p-4 rounded-lg mt-4 max-w-lg mx-auto border border-red-500/50 text-sm">
            {aiError}
          </div>
        )}
      </div>

      {aiRecs && aiRecs.length > 0 && (
        <div className="mb-12">
          <div className="flex items-center gap-2 mb-6">
            <Sparkles className="w-5 h-5 text-indigo-600" />
            <h2 className="text-xl font-bold text-gray-900">Your AI Recommended Matches</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {aiRecs.map((rec, idx) => {
              const matchedJob = dbJobs.find(j => j.id === rec.job_id);
              if (!matchedJob) return null;
              return (
                <div key={idx} className="bg-white rounded-xl border border-indigo-100 p-6 flex flex-col hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="font-bold text-gray-900">{matchedJob.title}</h4>
                      <p className="text-sm text-gray-600">{matchedJob.companies?.name}</p>
                    </div>
                  </div>
                  <div className="bg-indigo-50 rounded-lg p-4 mb-6 flex-grow">
                    <p className="text-sm text-indigo-900 leading-relaxed"><strong className="text-indigo-700">Why it fits:</strong> {rec.reason}</p>
                  </div>
                  <Link to={`/jobs/${matchedJob.id}`} className="flex justify-between items-center w-full px-4 py-2.5 bg-gray-50 hover:bg-gray-100 text-gray-900 rounded-lg font-medium transition-colors text-sm border border-gray-200">
                    View Job <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      )}

    </div>
  );
}
