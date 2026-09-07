const fs = require('fs');
let c = fs.readFileSync('src/pages/candidate/Profile.tsx', 'utf8');

const imports = "import { Loader2, User, BookOpen, Briefcase, Code, UploadCloud, Save, Trash2, CheckCircle2, Sparkles, FileText, AlertCircle } from 'lucide-react';";
c = c.replace(/import \{.*?Loader2, User.*?\} from 'lucide-react';/, imports);

const aiStates = `
  const [aiResumeText, setAiResumeText] = useState('');
  const [analyzingResume, setAnalyzingResume] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<any>(null);
  const [aiError, setAiError] = useState<string | null>(null);

  const handleAnalyzeResume = async () => {
    if (!aiResumeText.trim()) return;
    setAnalyzingResume(true);
    setAiError(null);
    try {
      const res = await fetch('/api/ai/improve-resume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resumeText: aiResumeText })
      });
      if (!res.ok) throw new Error('AI analysis failed');
      const data = await res.json();
      setAiAnalysis(data);
    } catch (err: any) {
      setAiError(err.message);
    } finally {
      setAnalyzingResume(false);
    }
  };

  const handleExtractResume = async () => {
    if (!aiResumeText.trim()) return;
    setAnalyzingResume(true);
    setAiError(null);
    try {
      const res = await fetch('/api/ai/extract-resume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resumeText: aiResumeText })
      });
      if (!res.ok) throw new Error('AI extraction failed');
      const data = await res.json();
      setAiAnalysis({...aiAnalysis, extraction: data});
    } catch (err: any) {
      setAiError(err.message);
    } finally {
      setAnalyzingResume(false);
    }
  };
`;

c = c.replace('const [success, setSuccess] = useState(\'\');', 'const [success, setSuccess] = useState(\'\');\n' + aiStates);

const aiUi = `
                <div className="mt-12 pt-8 border-t border-gray-100">
                  <div className="flex items-center gap-2 mb-4">
                    <Sparkles className="w-6 h-6 text-indigo-600" />
                    <h2 className="text-xl font-bold text-gray-900">AI Resume Assistant</h2>
                  </div>
                  <p className="text-sm text-gray-600 mb-6">Paste your resume text below to get AI-powered suggestions for improvement, or to automatically extract your skills and experience to fill out your profile.</p>
                  
                  <textarea
                    value={aiResumeText}
                    onChange={(e) => setAiResumeText(e.target.value)}
                    rows={6}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none mb-4"
                    placeholder="Paste your resume text here..."
                  />

                  <div className="flex gap-4 mb-8">
                    <button 
                      onClick={handleAnalyzeResume}
                      disabled={analyzingResume || !aiResumeText.trim()}
                      className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                    >
                      {analyzingResume ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
                      Get Suggestions
                    </button>
                    <button 
                      onClick={handleExtractResume}
                      disabled={analyzingResume || !aiResumeText.trim()}
                      className="flex items-center gap-2 px-6 py-2.5 bg-white border border-indigo-200 text-indigo-700 rounded-lg font-medium hover:bg-indigo-50 disabled:opacity-50 transition-colors"
                    >
                      {analyzingResume ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                      Extract Profile Data
                    </button>
                  </div>

                  {aiError && (
                    <div className="p-4 bg-red-50 text-red-700 rounded-lg flex items-center gap-2 mb-6">
                      <AlertCircle className="w-5 h-5" />
                      <span className="text-sm">{aiError}</span>
                    </div>
                  )}

                  {aiAnalysis && (
                    <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-6 rounded-xl border border-indigo-100 space-y-6">
                      
                      {aiAnalysis.missing_skills && (
                        <div>
                          <h4 className="font-bold text-indigo-900 mb-2">Suggested Skills to Add</h4>
                          <div className="flex flex-wrap gap-2">
                            {aiAnalysis.missing_skills.map((s: string, i: number) => (
                              <span key={i} className="px-2.5 py-1 bg-white border border-indigo-200 text-indigo-700 rounded-full text-xs font-medium">{s}</span>
                            ))}
                          </div>
                        </div>
                      )}

                      {aiAnalysis.project_improvements && (
                        <div>
                          <h4 className="font-bold text-indigo-900 mb-2">Project Improvements</h4>
                          <ul className="list-disc list-inside text-sm text-indigo-800 space-y-1">
                            {aiAnalysis.project_improvements.map((p: string, i: number) => <li key={i}>{p}</li>)}
                          </ul>
                        </div>
                      )}

                      {aiAnalysis.general_formatting && (
                        <div>
                          <h4 className="font-bold text-indigo-900 mb-2">General Formatting</h4>
                          <ul className="list-disc list-inside text-sm text-indigo-800 space-y-1">
                            {aiAnalysis.general_formatting.map((p: string, i: number) => <li key={i}>{p}</li>)}
                          </ul>
                        </div>
                      )}

                      {aiAnalysis.extraction && (
                        <div className="pt-4 border-t border-indigo-200">
                          <h4 className="font-bold text-indigo-900 mb-4">Extracted Data (You can manually add these to your profile tabs)</h4>
                          
                          <div className="space-y-4">
                            <div>
                              <strong className="text-xs uppercase tracking-wider text-indigo-500">Skills & Tech</strong>
                              <p className="text-sm text-indigo-900">
                                {aiAnalysis.extraction.skills?.join(', ')} <br/>
                                {aiAnalysis.extraction.technologies?.join(', ')}
                              </p>
                            </div>
                            <div>
                              <strong className="text-xs uppercase tracking-wider text-indigo-500">Experience</strong>
                              <ul className="list-disc list-inside text-sm text-indigo-900">
                                {aiAnalysis.extraction.experience?.map((e: string, i: number) => <li key={i}>{e}</li>)}
                              </ul>
                            </div>
                            <div>
                              <strong className="text-xs uppercase tracking-wider text-indigo-500">Education</strong>
                              <ul className="list-disc list-inside text-sm text-indigo-900">
                                {aiAnalysis.extraction.education?.map((e: string, i: number) => <li key={i}>{e}</li>)}
                              </ul>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
`;

c = c.replace('</div>\n            )}\n\n          </div>', aiUi + '\n              </div>\n            )}\n\n          </div>');

fs.writeFileSync('src/pages/candidate/Profile.tsx', c);
