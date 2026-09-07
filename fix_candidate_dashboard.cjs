const fs = require('fs');
let c = fs.readFileSync('src/pages/candidate/Dashboard.tsx', 'utf8');

const imports = "import { LogOut, User as UserIcon, FileText, Bookmark, Briefcase, ChevronRight, CheckCircle2, Sparkles, Loader2, ArrowRight } from 'lucide-react';";
c = c.replace(/import \{.*?LogOut, User as UserIcon.*?\} from 'lucide-react';/, imports);

const aiStates = `
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
        objective: candData?.career_objective,
        city: candData?.city,
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

      const res = await fetch('/api/ai/suggest-jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
`;

c = c.replace('const [stats, setStats] = useState({', aiStates + '\n  const [stats, setStats] = useState({');

const aiSection = `
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
                  <Link to={\`/jobs/\${matchedJob.id}\`} className="flex justify-between items-center w-full px-4 py-2.5 bg-gray-50 hover:bg-gray-100 text-gray-900 rounded-lg font-medium transition-colors text-sm border border-gray-200">
                    View Job <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      )}
`;

c = c.replace(/<div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200 py-16 text-center">[\s\S]*?<\/div>/, aiSection);

fs.writeFileSync('src/pages/candidate/Dashboard.tsx', c);
