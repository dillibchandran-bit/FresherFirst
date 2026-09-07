import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import NotificationCenter from './NotificationCenter';
import { Briefcase, Menu, X, User } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, profile } = useAuth();
  
  const getDashboardLink = () => {
    if (!profile) return '/login';
    if (profile.role === 'employer') return '/employer/dashboard';
    if (profile.role === 'admin') return '/admin/dashboard';
    return '/candidate/dashboard';
  };

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="bg-amber-500 p-1.5 rounded-lg group-hover:bg-amber-600 transition-colors">
                <Briefcase className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-xl text-gray-900 tracking-tight">Fresher First</span>
            </Link>
          </div>
          
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/jobs" className="text-gray-600 hover:text-amber-600 font-medium transition-colors">Find Jobs</Link>
            <Link to="/companies" className="text-gray-600 hover:text-amber-600 font-medium transition-colors">Companies</Link>
            <div className="flex items-center gap-4 border-l border-gray-200 pl-8">
              {user ? (
                <>
                  <NotificationCenter />
                  <Link to={getDashboardLink()} className="flex items-center gap-2 bg-gray-50 hover:bg-gray-100 text-gray-900 px-4 py-2 rounded-lg font-medium transition-colors border border-gray-200">
                    <User className="w-4 h-4" />
                    Dashboard
                  </Link>
                </>
              ) : (
                <>
                  <Link to="/login" className="text-gray-900 hover:text-amber-600 font-medium transition-colors">Log in</Link>
                  <Link to="/employer/post-job" className="bg-gray-900 text-white px-4 py-2 rounded-lg font-medium hover:bg-gray-800 transition-colors">
                    Post a Job
                  </Link>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center md:hidden gap-2">
            {user && <NotificationCenter />}
            <button onClick={() => setIsOpen(!isOpen)} className="text-gray-600 hover:text-gray-900">
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link to="/jobs" className="block px-3 py-2 text-base font-medium text-gray-900 hover:bg-gray-50 rounded-md">Find Jobs</Link>
            <Link to="/companies" className="block px-3 py-2 text-base font-medium text-gray-900 hover:bg-gray-50 rounded-md">Companies</Link>
            {user ? (
              <Link to={getDashboardLink()} className="block px-3 py-2 text-base font-medium text-amber-600 hover:bg-amber-50 rounded-md">Dashboard</Link>
            ) : (
              <>
                <Link to="/login" className="block px-3 py-2 text-base font-medium text-gray-900 hover:bg-gray-50 rounded-md">Log in</Link>
                <Link to="/employer/post-job" className="block px-3 py-2 text-base font-medium text-amber-600 hover:bg-amber-50 rounded-md">Post a Job</Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
