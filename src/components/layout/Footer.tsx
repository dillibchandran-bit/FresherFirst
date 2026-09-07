import React from 'react';
import { Link } from 'react-router-dom';
import { Briefcase } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-100 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="col-span-1 md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="bg-amber-500 p-1.5 rounded-lg">
                <Briefcase className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-xl text-gray-900 tracking-tight">Fresher First</span>
            </Link>
            <p className="text-gray-500 text-sm leading-relaxed mb-6">
              Your first tech job starts here. Focused on the OMR IT corridor, dedicated to building careers.
            </p>
          </div>
          
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">For Candidates</h3>
            <ul className="space-y-3">
              <li><Link to="/jobs" className="text-gray-500 hover:text-amber-600 text-sm transition-colors">Find Jobs</Link></li>
              <li><Link to="/jobs/freshers" className="text-gray-500 hover:text-amber-600 text-sm transition-colors">Fresher Jobs</Link></li>
              <li><Link to="/companies" className="text-gray-500 hover:text-amber-600 text-sm transition-colors">Browse Companies</Link></li>
              <li><Link to="/register" className="text-gray-500 hover:text-amber-600 text-sm transition-colors">Create Profile</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Top Locations</h3>
            <ul className="space-y-3">
              <li><Link to="/locations/omr" className="text-gray-500 hover:text-amber-600 text-sm transition-colors">Jobs in OMR</Link></li>
              <li><Link to="/locations/sholinganallur" className="text-gray-500 hover:text-amber-600 text-sm transition-colors">Jobs in Sholinganallur</Link></li>
              <li><Link to="/locations/siruseri" className="text-gray-500 hover:text-amber-600 text-sm transition-colors">Jobs in Siruseri</Link></li>
              <li><Link to="/locations/navalur" className="text-gray-500 hover:text-amber-600 text-sm transition-colors">Jobs in Navalur</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 mb-4">For Employers</h3>
            <ul className="space-y-3">
              <li><Link to="/employer/post-job" className="text-gray-500 hover:text-amber-600 text-sm transition-colors">Post a Job</Link></li>
              <li><Link to="/employer/pricing" className="text-gray-500 hover:text-amber-600 text-sm transition-colors">Pricing</Link></li>
              <li><Link to="/employer/verify" className="text-gray-500 hover:text-amber-600 text-sm transition-colors">Get Verified</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-100 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-400 text-sm">
            © {new Date().getFullYear()} Fresher First. All rights reserved.
          </p>
          <div className="flex gap-6">
            <Link to="/privacy" className="text-gray-400 hover:text-gray-900 text-sm transition-colors">Privacy Policy</Link>
            <Link to="/terms" className="text-gray-400 hover:text-gray-900 text-sm transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
