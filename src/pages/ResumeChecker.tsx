import React, { useState } from 'react';
import { FileText, CheckCircle, AlertTriangle, ArrowRight, Loader2 } from 'lucide-react';

interface Fix {
  original: string;
  suggestion: string;
  reason: string;
}

interface AnalysisResult {
  atsScore: number;
  feedback: string[];
  bulletsToFix: Fix[];
  topFixes: string[];
}

export default function ResumeChecker() {
  const [resumeText, setResumeText] = useState('');
  const [status, setStatus] = useState<'idle' | 'analyzing' | 'success' | 'error'>('idle');
  const [result, setResult] = useState<AnalysisResult | null>(null);

  const handleAnalyze = async () => {
    if (!resumeText.trim()) return;
    setStatus('analyzing');
    
    try {
      const res = await fetch('/api/resume-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resumeText })
      });
      
      if (!res.ok) throw new Error('Failed to analyze');
      
      const data = await res.json();
      setResult(data);
      setStatus('success');
    } catch (err) {
      console.error(err);
      setStatus('error');
    }
  };

  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-gray-900 mb-2 flex items-center gap-3">
          <FileText className="w-8 h-8 text-amber-500" />
          Fresher Resume Checker
        </h1>
        <p className="text-gray-600 text-lg">
          Paste your resume text below. Our AI recruiter will score it for ATS readability, fix vague bullet points, and ensure it's properly calibrated for entry-level roles.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <div className="flex flex-col gap-4">
          <div className="bg-white rounded-3xl shadow-sm border border-gray-200 p-6 sm:p-8 flex-1 flex flex-col">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Resume Content</h2>
            <textarea
              className="w-full flex-1 min-h-[300px] p-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/50 resize-y"
              placeholder="Paste your resume text here..."
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
            />
            <button
              onClick={handleAnalyze}
              disabled={status === 'analyzing' || !resumeText.trim()}
              className="mt-6 w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-3 px-6 rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {status === 'analyzing' ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Analyzing Resume...
                </>
              ) : (
                <>
                  Analyze My Resume
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
            {status === 'error' && (
              <p className="text-red-500 text-sm mt-4 text-center">Failed to analyze resume. Please try again.</p>
            )}
          </div>
        </div>

        <div>
          {status === 'idle' && (
            <div className="bg-amber-50 rounded-3xl border border-amber-100 p-8 h-full flex flex-col justify-center items-center text-center text-amber-800">
              <FileText className="w-12 h-12 text-amber-300 mb-4" />
              <h3 className="font-bold text-lg mb-2">Awaiting Analysis</h3>
              <p className="opacity-80">Paste your resume text on the left and click analyze to see your ATS score and feedback.</p>
            </div>
          )}

          {status === 'analyzing' && (
            <div className="bg-white rounded-3xl shadow-sm border border-gray-200 p-8 h-full flex flex-col justify-center items-center text-center">
              <Loader2 className="w-12 h-12 text-amber-500 animate-spin mb-4" />
              <h3 className="font-bold text-lg text-gray-900 mb-2">AI is reading your resume...</h3>
              <p className="text-gray-500">Checking standard headers, bullet point impact, and fresher consistency.</p>
            </div>
          )}

          {status === 'success' && result && (
            <div className="space-y-6">
              {/* ATS Score Card */}
              <div className="bg-white rounded-3xl shadow-sm border border-gray-200 p-6 sm:p-8 flex items-center gap-6">
                <div className="relative w-24 h-24 flex items-center justify-center flex-shrink-0">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-gray-100" />
                    <circle 
                      cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" 
                      strokeDasharray="251.2" 
                      strokeDashoffset={251.2 - (251.2 * result.atsScore) / 100}
                      className={result.atsScore >= 75 ? 'text-green-500' : result.atsScore >= 50 ? 'text-amber-500' : 'text-red-500'}
                    />
                  </svg>
                  <span className="absolute text-2xl font-bold text-gray-900">{result.atsScore}</span>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">ATS Readability Score</h2>
                  <p className="text-gray-600 text-sm mt-1">Based on formatting, keyword density, and standard section headers.</p>
                </div>
              </div>

              {/* Top Fixes */}
              <div className="bg-white rounded-3xl shadow-sm border border-gray-200 p-6 sm:p-8">
                <h3 className="font-bold text-lg text-gray-900 mb-4 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-amber-500" />
                  Top 3 Things to Fix
                </h3>
                <ul className="space-y-3">
                  {result.topFixes.map((fix, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-gray-700 bg-amber-50/50 p-3 rounded-xl border border-amber-100/50">
                      <span className="font-bold text-amber-600 mt-0.5">{idx + 1}.</span>
                      <span>{fix}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Fresher Calibration Feedback */}
              <div className="bg-white rounded-3xl shadow-sm border border-gray-200 p-6 sm:p-8">
                <h3 className="font-bold text-lg text-gray-900 mb-4">Fresher Calibration</h3>
                <div className="space-y-3">
                  {result.feedback.map((f, idx) => (
                    <div key={idx} className="flex gap-3 text-gray-700">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <p>{f}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bullet Point Rewrites */}
              {result.bulletsToFix.length > 0 && (
                <div className="bg-white rounded-3xl shadow-sm border border-gray-200 p-6 sm:p-8">
                  <h3 className="font-bold text-lg text-gray-900 mb-4">Bullet Point Rewrites</h3>
                  <div className="space-y-6">
                    {result.bulletsToFix.map((bullet, idx) => (
                      <div key={idx} className="relative pl-4 border-l-2 border-amber-200">
                        <p className="text-sm text-gray-500 mb-1 line-through">"{bullet.original}"</p>
                        <p className="font-medium text-gray-900 mb-2">"{bullet.suggestion}"</p>
                        <p className="text-sm text-amber-700 bg-amber-50 p-2 rounded-lg inline-block border border-amber-100">
                          <strong>Why:</strong> {bullet.reason}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
