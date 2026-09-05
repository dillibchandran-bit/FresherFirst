import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function AdminJobNew() {
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    company: '',
    description: '',
    location: '',
    workMode: 'On-site',
    remoteEligibility: '',
    employmentType: 'FULL_TIME',
    experienceLevel: 'Fresher',
    salaryMin: '',
    salaryMax: '',
    url: '',
    postedAt: new Date().toISOString().split('T')[0],
    validThrough: '',
    tags: ''
  });
  const [status, setStatus] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password) setIsAuthenticated(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('Submitting...');
    
    const jobPayload = {
      ...formData,
      tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
      excerpt: formData.description.substring(0, 150) + '...'
    };

    try {
      const res = await fetch('/api/admin/jobs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${password}`
        },
        body: JSON.stringify(jobPayload)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to add job');
      setStatus('Job added successfully!');
      setTimeout(() => navigate('/'), 1500);
    } catch (err: any) {
      setStatus(`Error: ${err.message}`);
    }
  };

  if (!isAuthenticated) {
    return (
      <main className="max-w-md mx-auto px-4 py-20">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200 text-center">
          <h2 className="text-2xl font-bold mb-4 font-serif">Admin Access</h2>
          <form onSubmit={handleLogin} className="space-y-4">
            <input 
              type="password" 
              placeholder="Enter admin password" 
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-amber-500"
            />
            <button className="w-full bg-amber-500 text-white py-2 rounded-lg font-bold">Login</button>
          </form>
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="bg-white rounded-3xl shadow-sm border border-gray-200 p-8 sm:p-12">
        <h1 className="font-serif text-3xl font-bold text-gray-900 mb-8">Post a New Job</h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-1">Job Title *</label>
              <input required type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full px-4 py-2 border rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Company Name *</label>
              <input required type="text" value={formData.company} onChange={e => setFormData({...formData, company: e.target.value})} className="w-full px-4 py-2 border rounded-lg" />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Description * (min 200 chars)</label>
            <textarea required minLength={200} rows={5} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full px-4 py-2 border rounded-lg"></textarea>
          </div>
          
          <div className="grid sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-1">Location * (e.g. Bangalore, or N/A if remote)</label>
              <input required type="text" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} className="w-full px-4 py-2 border rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Work Mode *</label>
              <select value={formData.workMode} onChange={e => setFormData({...formData, workMode: e.target.value})} className="w-full px-4 py-2 border rounded-lg">
                <option value="On-site">On-site</option>
                <option value="Hybrid">Hybrid</option>
                <option value="Remote">Remote</option>
              </select>
            </div>
          </div>

          {(formData.workMode === 'Remote' || formData.workMode === 'Hybrid') && (
            <div>
              <label className="block text-sm font-medium mb-1">Remote Eligibility (e.g. "India only")</label>
              <input type="text" value={formData.remoteEligibility} onChange={e => setFormData({...formData, remoteEligibility: e.target.value})} className="w-full px-4 py-2 border rounded-lg" />
            </div>
          )}

          <div className="grid sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-1">Employment Type *</label>
              <select value={formData.employmentType} onChange={e => setFormData({...formData, employmentType: e.target.value})} className="w-full px-4 py-2 border rounded-lg">
                <option value="FULL_TIME">Full-time</option>
                <option value="PART_TIME">Part-time</option>
                <option value="INTERN">Internship</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Experience Level *</label>
              <select value={formData.experienceLevel} onChange={e => setFormData({...formData, experienceLevel: e.target.value})} className="w-full px-4 py-2 border rounded-lg">
                <option value="Fresher">Fresher</option>
                <option value="0-1 years">0-1 years</option>
                <option value="0-2 years">0-2 years</option>
              </select>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-1">Salary Min (INR)</label>
              <input type="number" value={formData.salaryMin} onChange={e => setFormData({...formData, salaryMin: e.target.value})} className="w-full px-4 py-2 border rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Salary Max (INR)</label>
              <input type="number" value={formData.salaryMax} onChange={e => setFormData({...formData, salaryMax: e.target.value})} className="w-full px-4 py-2 border rounded-lg" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Application URL/Email *</label>
            <input required type="text" value={formData.url} onChange={e => setFormData({...formData, url: e.target.value})} className="w-full px-4 py-2 border rounded-lg" />
          </div>

          <div className="grid sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-1">Date Posted</label>
              <input type="date" value={formData.postedAt} onChange={e => setFormData({...formData, postedAt: e.target.value})} className="w-full px-4 py-2 border rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Valid Through</label>
              <input type="date" value={formData.validThrough} onChange={e => setFormData({...formData, validThrough: e.target.value})} className="w-full px-4 py-2 border rounded-lg" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Tech Stack/Tags (comma separated)</label>
            <input type="text" placeholder="e.g. React, Python, SQL" value={formData.tags} onChange={e => setFormData({...formData, tags: e.target.value})} className="w-full px-4 py-2 border rounded-lg" />
          </div>

          <button type="submit" className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-3 rounded-xl transition-colors">
            Publish Job
          </button>
          
          {status && <p className="text-center font-medium mt-4">{status}</p>}
        </form>
      </div>
    </main>
  );
}
