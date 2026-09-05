import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CalendarDays, ArrowRight, Loader2 } from 'lucide-react';

export default function BlogList() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/blogs')
      .then(res => res.json())
      .then(data => {
        setPosts(data.blogs || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const sortedPosts = [...posts].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <h2 className="font-serif text-4xl sm:text-5xl font-bold text-gray-900 mb-4 tracking-tight">
          FresherFirst Blog
        </h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          No-nonsense advice, resume tips, and interview strategies tailored specifically for tech freshers in India.
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
        </div>
      ) : (
        <div className="space-y-6">
          {sortedPosts.map((post) => (
            <Link 
              key={post.id} 
              to={`/blog/${post.id}`}
              className="block group bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-8 hover:border-amber-300 hover:shadow-md transition-all"
            >
              <div className="flex items-center gap-2 mb-3 text-sm text-gray-500 font-mono">
                <CalendarDays className="w-4 h-4 text-amber-500" />
                <span>{new Date(post.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
              </div>
              <h3 className="font-serif text-2xl font-bold text-gray-900 mb-3 group-hover:text-amber-700 transition-colors">
                {post.title}
              </h3>
              <p className="text-gray-600 mb-4 leading-relaxed">
                {post.excerpt}
              </p>
              <div className="flex items-center gap-2 text-amber-600 font-medium text-sm">
                Read article <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
