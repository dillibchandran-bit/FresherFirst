import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Loader2, User, BookOpen, Briefcase, Code, UploadCloud, Save, Trash2, CheckCircle2 } from 'lucide-react';
import { CandidateProfile as ICandidateProfile, Education, Experience, Project, Resume } from '../../types';

export default function CandidateProfile() {
  const { user, profile } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  
  const [activeTab, setActiveTab] = useState<'personal' | 'education' | 'experience' | 'projects' | 'resume'>('personal');

  // Form states
  const [candidateData, setCandidateData] = useState<Partial<ICandidateProfile>>({});
  const [fullName, setFullName] = useState('');
  const [educations, setEducations] = useState<Partial<Education>[]>([]);
  const [experiences, setExperiences] = useState<Partial<Experience>[]>([]);
  const [projects, setProjects] = useState<Partial<Project>[]>([]);
  const [resumes, setResumes] = useState<Resume[]>([]);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user) fetchProfileData();
  }, [user]);

  const fetchProfileData = async () => {
    setLoading(true);
    try {
      setFullName(profile?.full_name || '');
      
      const [candRes, eduRes, expRes, projRes, resRes] = await Promise.all([
        supabase.from('candidate_profiles').select('*').eq('profile_id', user!.id).single(),
        supabase.from('education').select('*').eq('candidate_id', user!.id).order('start_date', { ascending: false }),
        supabase.from('experience').select('*').eq('candidate_id', user!.id).order('start_date', { ascending: false }),
        supabase.from('projects').select('*').eq('candidate_id', user!.id).order('start_date', { ascending: false }),
        supabase.from('resumes').select('*').eq('candidate_id', user!.id).order('created_at', { ascending: false }),
      ]);

      if (candRes.data) setCandidateData(candRes.data);
      if (eduRes.data) setEducations(eduRes.data);
      if (expRes.data) setExperiences(expRes.data);
      if (projRes.data) setProjects(projRes.data);
      if (resRes.data) setResumes(resRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const showSuccess = (msg: string) => {
    setSuccess(msg);
    setTimeout(() => setSuccess(''), 3000);
  };

  const handleSavePersonal = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      // Update public profile name
      await supabase.from('profiles').update({ full_name: fullName }).eq('id', user!.id);
      
      // Update candidate profile
      const { error } = await supabase.from('candidate_profiles')
        .update({
          phone: candidateData.phone,
          city: candidateData.city,
          career_objective: candidateData.career_objective,
          work_mode: candidateData.work_mode as any,
          expected_salary: candidateData.expected_salary,
          github_url: candidateData.github_url,
          linkedin_url: candidateData.linkedin_url,
        })
        .eq('profile_id', user!.id);
      
      if (error) throw error;
      showSuccess("Personal information updated");
    } catch (error) {
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSaving(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user!.id}/${Math.random()}.${fileExt}`;

      // Upload to private bucket
      const { error: uploadError } = await supabase.storage.from('resumes').upload(fileName, file);
      if (uploadError) throw uploadError;

      // Create record
      const { data: resumeRecord, error: dbError } = await supabase.from('resumes').insert({
        candidate_id: user!.id,
        file_url: fileName,
        is_primary: resumes.length === 0
      }).select().single();

      if (dbError) throw dbError;
      
      setResumes([resumeRecord, ...resumes]);
      showSuccess("Resume uploaded successfully");
    } catch (error) {
      console.error(error);
      alert("Failed to upload resume");
    } finally {
      setSaving(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDeleteResume = async (id: string, fileUrl: string) => {
    if (!confirm("Delete this resume?")) return;
    try {
      await supabase.storage.from('resumes').remove([fileUrl]);
      await supabase.from('resumes').delete().eq('id', id);
      setResumes(resumes.filter(r => r.id !== id));
    } catch (error) {
      console.error("Delete failed", error);
    }
  };

  const handleDownloadResume = async (fileUrl: string) => {
    try {
      // create a signed url valid for 60 seconds
      const { data, error } = await supabase.storage.from('resumes').createSignedUrl(fileUrl, 60);
      if (error) throw error;
      window.open(data.signedUrl, '_blank');
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) {
    return <div className="min-h-[60vh] flex justify-center items-center"><Loader2 className="w-8 h-8 animate-spin text-amber-500" /></div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Your Profile</h1>
        {success && (
          <div className="flex items-center gap-2 text-green-600 bg-green-50 px-4 py-2 rounded-lg font-medium text-sm animate-fade-in">
            <CheckCircle2 className="w-4 h-4" /> {success}
          </div>
        )}
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar Nav */}
        <div className="w-full md:w-64 flex-shrink-0">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden sticky top-24">
            <nav className="flex flex-col">
              <button onClick={() => setActiveTab('personal')} className={`flex items-center gap-3 px-6 py-4 text-left text-sm font-medium transition-colors border-l-4 ${activeTab === 'personal' ? 'border-amber-500 bg-amber-50 text-amber-700' : 'border-transparent text-gray-600 hover:bg-gray-50'}`}>
                <User className="w-4 h-4" /> Personal Info
              </button>
              <button onClick={() => setActiveTab('education')} className={`flex items-center gap-3 px-6 py-4 text-left text-sm font-medium transition-colors border-l-4 border-t border-t-gray-100 ${activeTab === 'education' ? 'border-amber-500 bg-amber-50 text-amber-700' : 'border-transparent text-gray-600 hover:bg-gray-50'}`}>
                <BookOpen className="w-4 h-4" /> Education
              </button>
              <button onClick={() => setActiveTab('experience')} className={`flex items-center gap-3 px-6 py-4 text-left text-sm font-medium transition-colors border-l-4 border-t border-t-gray-100 ${activeTab === 'experience' ? 'border-amber-500 bg-amber-50 text-amber-700' : 'border-transparent text-gray-600 hover:bg-gray-50'}`}>
                <Briefcase className="w-4 h-4" /> Experience
              </button>
              <button onClick={() => setActiveTab('projects')} className={`flex items-center gap-3 px-6 py-4 text-left text-sm font-medium transition-colors border-l-4 border-t border-t-gray-100 ${activeTab === 'projects' ? 'border-amber-500 bg-amber-50 text-amber-700' : 'border-transparent text-gray-600 hover:bg-gray-50'}`}>
                <Code className="w-4 h-4" /> Projects
              </button>
              <button onClick={() => setActiveTab('resume')} className={`flex items-center gap-3 px-6 py-4 text-left text-sm font-medium transition-colors border-l-4 border-t border-t-gray-100 ${activeTab === 'resume' ? 'border-amber-500 bg-amber-50 text-amber-700' : 'border-transparent text-gray-600 hover:bg-gray-50'}`}>
                <UploadCloud className="w-4 h-4" /> Resumes
              </button>
            </nav>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-grow">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 sm:p-8">
            
            {/* PERSONAL TAB */}
            {activeTab === 'personal' && (
              <form onSubmit={handleSavePersonal}>
                <h2 className="text-xl font-bold text-gray-900 mb-6 border-b border-gray-100 pb-4">Personal Information</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                    <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-amber-500 focus:border-amber-500 outline-none" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                    <input type="tel" value={candidateData.phone || ''} onChange={(e) => setCandidateData({...candidateData, phone: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-amber-500 focus:border-amber-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Current City</label>
                    <input type="text" value={candidateData.city || ''} onChange={(e) => setCandidateData({...candidateData, city: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-amber-500 focus:border-amber-500 outline-none" placeholder="e.g. Chennai" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Expected Salary (₹ per year)</label>
                    <input type="number" value={candidateData.expected_salary || ''} onChange={(e) => setCandidateData({...candidateData, expected_salary: Number(e.target.value)})} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-amber-500 focus:border-amber-500 outline-none" placeholder="e.g. 400000" />
                  </div>
                </div>

                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Career Objective</label>
                  <textarea value={candidateData.career_objective || ''} onChange={(e) => setCandidateData({...candidateData, career_objective: e.target.value})} rows={3} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-amber-500 focus:border-amber-500 outline-none" placeholder="A brief summary of your skills and goals..."></textarea>
                </div>
                
                <h3 className="text-sm font-bold text-gray-900 mt-8 mb-4 border-b border-gray-100 pb-2">Links</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">LinkedIn URL</label>
                    <input type="url" value={candidateData.linkedin_url || ''} onChange={(e) => setCandidateData({...candidateData, linkedin_url: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-amber-500 focus:border-amber-500 outline-none" placeholder="https://linkedin.com/in/..." />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">GitHub URL</label>
                    <input type="url" value={candidateData.github_url || ''} onChange={(e) => setCandidateData({...candidateData, github_url: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-amber-500 focus:border-amber-500 outline-none" placeholder="https://github.com/..." />
                  </div>
                </div>

                <div className="mt-8 flex justify-end">
                  <button type="submit" disabled={saving} className="bg-gray-900 text-white px-6 py-2 rounded-lg font-medium hover:bg-gray-800 flex items-center gap-2">
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save Changes
                  </button>
                </div>
              </form>
            )}

            {/* EDUCATION TAB Placeholder - Can expand with full forms */}
            {activeTab === 'education' && (
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-6 border-b border-gray-100 pb-4">Education</h2>
                {educations.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                    <p>No education added yet.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {educations.map((edu, idx) => (
                      <div key={edu.id || idx} className="p-4 border border-gray-200 rounded-lg">
                        <h4 className="font-bold text-gray-900">{edu.degree} in {edu.field_of_study}</h4>
                        <p className="text-sm text-gray-600">{edu.institution}</p>
                      </div>
                    ))}
                  </div>
                )}
                <button className="mt-6 text-sm font-medium text-amber-600 bg-amber-50 px-4 py-2 rounded-lg">+ Add Education</button>
              </div>
            )}

            {/* EXPERIENCE TAB */}
            {activeTab === 'experience' && (
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-6 border-b border-gray-100 pb-4">Experience & Internships</h2>
                {experiences.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                    <p>No experience added. Internships count too!</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {experiences.map((exp, idx) => (
                      <div key={exp.id || idx} className="p-4 border border-gray-200 rounded-lg">
                        <h4 className="font-bold text-gray-900">{exp.role} at {exp.company}</h4>
                      </div>
                    ))}
                  </div>
                )}
                <button className="mt-6 text-sm font-medium text-amber-600 bg-amber-50 px-4 py-2 rounded-lg">+ Add Experience</button>
              </div>
            )}

            {/* PROJECTS TAB */}
            {activeTab === 'projects' && (
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-6 border-b border-gray-100 pb-4">Academic & Personal Projects</h2>
                {projects.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                    <p>No projects added. Show off what you built!</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {projects.map((proj, idx) => (
                      <div key={proj.id || idx} className="p-4 border border-gray-200 rounded-lg">
                        <h4 className="font-bold text-gray-900">{proj.title}</h4>
                      </div>
                    ))}
                  </div>
                )}
                <button className="mt-6 text-sm font-medium text-amber-600 bg-amber-50 px-4 py-2 rounded-lg">+ Add Project</button>
              </div>
            )}

            {/* RESUME TAB */}
            {activeTab === 'resume' && (
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-6 border-b border-gray-100 pb-4">Resumes</h2>
                
                <div className="mb-8">
                  <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept=".pdf,.doc,.docx" className="hidden" />
                  <button onClick={() => fileInputRef.current?.click()} disabled={saving} className="w-full flex flex-col items-center justify-center p-8 border-2 border-dashed border-gray-300 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50">
                    {saving ? <Loader2 className="w-8 h-8 text-amber-500 animate-spin mb-2" /> : <UploadCloud className="w-8 h-8 text-gray-400 mb-2" />}
                    <span className="text-sm font-medium text-gray-900">Click to upload a new resume</span>
                    <span className="text-xs text-gray-500 mt-1">PDF, DOCX up to 5MB</span>
                  </button>
                </div>

                {resumes.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold text-gray-900">Uploaded Resumes</h3>
                    {resumes.map(resume => (
                      <div key={resume.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-gray-900 truncate max-w-xs">{resume.file_url.split('/').pop()}</span>
                          <span className="text-xs text-gray-500">Uploaded on {new Date(resume.created_at).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button onClick={() => handleDownloadResume(resume.file_url)} className="text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors">
                            View
                          </button>
                          <button onClick={() => handleDeleteResume(resume.id, resume.file_url)} className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
