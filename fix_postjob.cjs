const fs = require('fs');
let c = fs.readFileSync('src/pages/employer/PostJob.tsx', 'utf8');

const imports = "import { Sparkles, Loader2, AlertCircle } from 'lucide-react';";
c = c.replace(/import \{.*?Loader2, AlertCircle.*?\} from 'lucide-react';/, imports);

const aiState = `
  const [roughNotes, setRoughNotes] = useState('');
  const [generatingAi, setGeneratingAi] = useState(false);

  const handleGenerateAi = async () => {
    if (!roughNotes.trim()) return;
    setGeneratingAi(true);
    try {
      const res = await fetch('/api/ai/structure-job', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roughDescription: roughNotes })
      });
      if (!res.ok) throw new Error('AI generation failed');
      const data = await res.json();
      
      if (data.title_suggestion) setTitle(data.title_suggestion);
      if (data.description_intro) setDescription(data.description_intro);
      if (data.responsibilities) setResponsibilities(data.responsibilities.join('\\n'));
      if (data.requirements) setRequirements(data.requirements.join('\\n'));
      if (data.skills) setSkills(data.skills.join(', '));
      
      setRoughNotes('');
    } catch (err: any) {
      alert(err.message);
    } finally {
      setGeneratingAi(false);
    }
  };
`;

c = c.replace('const [error, setError] = useState<string | null>(null);', 'const [error, setError] = useState<string | null>(null);\n' + aiState);

const aiSection = `
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
`;

c = c.replace('{/* Basics */}', aiSection + '\n          {/* Basics */}');

fs.writeFileSync('src/pages/employer/PostJob.tsx', c);
