import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function AdminBlogNew() {
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    content: '',
    excerpt: '',
    featuredImage: '',
    tags: '',
    date: new Date().toISOString().split('T')[0],
    status: 'Published'
  });
  const [status, setStatus] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password) setIsAuthenticated(true);
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value;
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    setFormData({ ...formData, title, slug });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('Submitting...');
    
    const finalExcerpt = formData.excerpt.trim() || (formData.content.substring(0, 160) + '...');
    
    const blogPayload = {
      id: formData.slug || formData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''),
      title: formData.title,
      date: formData.date,
      excerpt: finalExcerpt,
      content: formData.content,
      featuredImage: formData.featuredImage,
      tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
      status: formData.status
    };

    try {
      const res = await fetch('/api/admin/blogs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${password}`
        },
        body: JSON.stringify(blogPayload)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to add blog');
      setStatus('Blog added successfully!');
      setTimeout(() => navigate('/blog'), 1500);
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
        <h1 className="font-serif text-3xl font-bold text-gray-900 mb-8">Post a New Article</h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-1">Title *</label>
            <input required type="text" value={formData.title} onChange={handleTitleChange} className="w-full px-4 py-2 border rounded-lg" />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Slug / URL</label>
            <input required type="text" value={formData.slug} onChange={e => setFormData({...formData, slug: e.target.value})} className="w-full px-4 py-2 border rounded-lg bg-gray-50" />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Content (Markdown supported) *</label>
            <textarea required rows={12} value={formData.content} onChange={e => setFormData({...formData, content: e.target.value})} className="w-full px-4 py-2 border rounded-lg font-mono text-sm"></textarea>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Excerpt (Optional - auto-generated if blank)</label>
            <textarea rows={3} value={formData.excerpt} onChange={e => setFormData({...formData, excerpt: e.target.value})} className="w-full px-4 py-2 border rounded-lg"></textarea>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Featured Image URL</label>
            <input type="text" value={formData.featuredImage} onChange={e => setFormData({...formData, featuredImage: e.target.value})} className="w-full px-4 py-2 border rounded-lg" placeholder="https://..." />
          </div>

          <div className="grid sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-1">Date Published</label>
              <input type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="w-full px-4 py-2 border rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Status</label>
              <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} className="w-full px-4 py-2 border rounded-lg">
                <option value="Draft">Draft</option>
                <option value="Published">Published</option>
              </select>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Tags (comma separated)</label>
            <input type="text" placeholder="e.g. resumes, interviews, tech" value={formData.tags} onChange={e => setFormData({...formData, tags: e.target.value})} className="w-full px-4 py-2 border rounded-lg" />
          </div>

          <button type="submit" className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-3 rounded-xl transition-colors">
            Save Article
          </button>
          
          {status && <p className="text-center font-medium mt-4">{status}</p>}
        </form>
      </div>
    </main>
  );
}
