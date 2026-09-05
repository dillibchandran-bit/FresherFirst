import { useParams, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { ArrowLeft, CalendarDays, Loader2 } from 'lucide-react';

export default function BlogPost() {
  const { id } = useParams<{ id: string }>();
  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/blogs/${id}`)
      .then(res => {
        if (!res.ok) throw new Error('Not found');
        return res.json();
      })
      .then(data => {
        setPost(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-20 flex justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
      </main>
    );
  }

  if (!post) {
    return (
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <h2 className="font-serif text-3xl font-bold text-gray-900 mb-4">Post not found</h2>
        <p className="text-gray-600 mb-8">We couldn't find the article you're looking for.</p>
        <Link to="/blog" className="inline-flex items-center gap-2 text-amber-600 hover:text-amber-700 font-medium">
          <ArrowLeft className="w-4 h-4" /> Back to Blog
        </Link>
      </main>
    );
  }

  return (
    <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Link to="/blog" className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-900 font-medium mb-8 text-sm transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Blog
      </Link>
      
      <article className="bg-white rounded-3xl shadow-sm border border-gray-200 p-6 sm:p-12">
        <div className="flex items-center gap-2 mb-6 text-sm text-gray-500 font-mono">
          <CalendarDays className="w-4 h-4 text-amber-500" />
          <span>{new Date(post.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
        </div>
        
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-gray-900 mb-6 leading-tight">
          {post.title}
        </h1>
        
        <div className="prose prose-lg prose-amber max-w-none text-gray-700">
          {post.content.split('\n').map((paragraph: string, index: number) => {
            const trimmed = paragraph.trim();
            if (!trimmed) return null;
            
            if (trimmed.startsWith('### ')) {
              return <h3 key={index} className="text-2xl font-bold text-gray-900 mt-8 mb-4 font-serif">{trimmed.replace('### ', '')}</h3>;
            } else if (trimmed.startsWith('#### ')) {
              return <h4 key={index} className="text-xl font-bold text-gray-900 mt-6 mb-3 font-serif">{trimmed.replace('#### ', '')}</h4>;
            } else if (trimmed.startsWith('- ')) {
              const formattedText = trimmed.replace('- ', '').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
              return <li key={index} className="ml-6 mb-2 list-disc" dangerouslySetInnerHTML={{ __html: formattedText }} />;
            } else {
              const formattedText = trimmed.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
              return <p key={index} className="mb-4 leading-relaxed" dangerouslySetInnerHTML={{ __html: formattedText }} />;
            }
          })}
        </div>
      </article>
    </main>
  );
}
