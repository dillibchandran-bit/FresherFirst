import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { Compass, Wrench } from 'lucide-react';
import Home from './pages/Home';
import BlogList from './pages/BlogList';
import BlogPost from './pages/BlogPost';
import About from './pages/About';
import PrivacyPolicy from './pages/PrivacyPolicy';
import Contact from './pages/Contact';
import TermsOfService from './pages/TermsOfService';
import Disclaimer from './pages/Disclaimer';
import CTCCalculator from './pages/CTCCalculator';
import AdminJobNew from './pages/AdminJobNew';
import AdminBlogNew from './pages/AdminBlogNew';
import ResumeChecker from './pages/ResumeChecker';
import { useState } from 'react';

function Navbar() {
  const [toolsOpen, setToolsOpen] = useState(false);

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="bg-amber-500 p-1.5 rounded-lg">
            <Compass className="w-5 h-5 text-white" />
          </div>
          <h1 className="font-serif text-xl font-bold text-gray-900 tracking-tight">FresherFirst</h1>
        </Link>
        <nav className="flex items-center gap-6">
          <Link to="/" className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors">Jobs</Link>
          <Link to="/blog" className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors">Blog</Link>
          <div 
            className="relative"
            onMouseEnter={() => setToolsOpen(true)}
            onMouseLeave={() => setToolsOpen(false)}
          >
            <button className="flex items-center gap-1 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors py-2">
              <Wrench className="w-4 h-4" />
              Tools
            </button>
            {toolsOpen && (
              <div className="absolute top-full right-0 mt-0 w-48 bg-white border border-gray-100 rounded-xl shadow-lg overflow-hidden flex flex-col z-50">
                <Link to="/tools/ctc-calculator" className="px-4 py-3 text-sm text-gray-700 hover:bg-amber-50 hover:text-amber-700 transition-colors border-b border-gray-50">CTC Calculator</Link>
                <Link to="/tools/resume-checker" className="px-4 py-3 text-sm text-gray-700 hover:bg-amber-50 hover:text-amber-700 transition-colors">Resume Checker</Link>
              </div>
            )}
          </div>
          <Link to="/about" className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors">About</Link>
        </nav>
      </div>
    </header>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col bg-[#FAFAFA] font-sans selection:bg-amber-200">
        <Navbar />

        <div className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/blog" element={<BlogList />} />
            <Route path="/blog/:id" element={<BlogPost />} />
            <Route path="/tools/ctc-calculator" element={<CTCCalculator />} />
            <Route path="/tools/resume-checker" element={<ResumeChecker />} />
            <Route path="/admin/jobs/new" element={<AdminJobNew />} />
            <Route path="/admin/blog/new" element={<AdminBlogNew />} />
            <Route path="/about" element={<About />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/terms-of-service" element={<TermsOfService />} />
            <Route path="/disclaimer" element={<Disclaimer />} />
          </Routes>
        </div>
        
        <footer className="border-t border-gray-200 bg-white mt-auto">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-500">
            <p>© {new Date().getFullYear()} FresherFirst. Built for tech newcomers.</p>
            <div className="flex items-center gap-4 flex-wrap">
              <Link to="/about" className="hover:text-gray-900">About</Link>
              <Link to="/contact" className="hover:text-gray-900">Contact</Link>
              <Link to="/privacy-policy" className="hover:text-gray-900">Privacy Policy</Link>
              <Link to="/terms-of-service" className="hover:text-gray-900">Terms of Service</Link>
              <Link to="/disclaimer" className="hover:text-gray-900">Disclaimer</Link>
            </div>
          </div>
        </footer>
      </div>
    </BrowserRouter>
  );
}

