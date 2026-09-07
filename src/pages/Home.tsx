import React from 'react';
import { Link } from 'react-router-dom';
import { Search, MapPin, Code2, Database, ShieldCheck, ChevronRight } from 'lucide-react';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-white pt-20 pb-28 border-b border-gray-100 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] opacity-30"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-50 text-amber-700 font-medium text-sm mb-8 border border-amber-100">
              <MapPin className="w-4 h-4" />
              <span>Focused on Chennai's OMR IT Corridor</span>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 tracking-tight mb-6 leading-tight">
              Your first tech job <br className="hidden sm:block" />
              <span className="text-amber-500">starts here.</span>
            </h1>
            
            <p className="text-lg md:text-xl text-gray-600 mb-10 leading-relaxed max-w-2xl mx-auto">
              We connect fresh graduates with top startups and enterprise companies in Sholinganallur, Siruseri, Navalur, and beyond. Zero fake jobs, 100% verified.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/jobs" className="bg-gray-900 text-white px-8 py-4 rounded-xl font-medium text-lg hover:bg-gray-800 transition-colors shadow-sm flex items-center justify-center gap-2">
                Find Jobs <Search className="w-5 h-5" />
              </Link>
              <Link to="/employer/post-job" className="bg-white text-gray-900 border-2 border-gray-200 px-8 py-4 rounded-xl font-medium text-lg hover:border-gray-300 hover:bg-gray-50 transition-colors flex items-center justify-center">
                Post a Job
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Features */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
              <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center mb-6">
                <ShieldCheck className="w-6 h-6 text-amber-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Verified Employers</h3>
              <p className="text-gray-600 leading-relaxed">Every company is manually verified before they can post. No consultancies, no scams, just direct hiring.</p>
            </div>
            <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
              <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mb-6">
                <Code2 className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Freshers Welcome</h3>
              <p className="text-gray-600 leading-relaxed">Jobs that actually require 0-2 years of experience. We filter out the "entry-level" jobs asking for 5 years.</p>
            </div>
            <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
              <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center mb-6">
                <Database className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Salary Disclosed</h3>
              <p className="text-gray-600 leading-relaxed">We push employers to disclose salary ranges upfront so you don't waste time interviewing for low pay.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Categories */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Explore by Role</h2>
              <p className="text-gray-600 text-lg">Top technologies hiring in Chennai right now.</p>
            </div>
            <Link to="/jobs" className="hidden sm:flex items-center gap-1 text-amber-600 font-medium hover:text-amber-700">
              View all roles <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {['Java', 'Python', 'React / Frontend', 'Node.js / Backend', 'Full Stack', 'QA / Testing', 'Data Analytics', 'DevOps'].map((role) => (
              <Link key={role} to={`/jobs/${role.toLowerCase().replace(/ \/ | /g, '-')}`} className="group p-6 border border-gray-200 rounded-xl hover:border-amber-500 hover:shadow-md transition-all">
                <h3 className="font-semibold text-gray-900 group-hover:text-amber-600 transition-colors">{role}</h3>
                <p className="text-gray-500 text-sm mt-2">Explore jobs &rarr;</p>
              </Link>
            ))}
          </div>
          <Link to="/jobs" className="mt-8 flex sm:hidden items-center justify-center gap-1 text-amber-600 font-medium w-full">
            View all roles <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
