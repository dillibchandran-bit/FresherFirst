import React, { useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { UserRole } from '../../types';
import { Loader2, ShieldAlert, LogOut, ArrowLeft, Copy, Check } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, profile, loading, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <Loader2 className="w-8 h-8 text-amber-500 animate-spin mb-4" />
        <p className="text-gray-500 font-medium">Verifying session...</p>
      </div>
    );
  }

  // Not logged in
  if (!user) {
    const isTargetingAdmin = allowedRoles?.includes('admin') || location.pathname.startsWith('/admin');
    return (
      <Navigate 
        to={isTargetingAdmin ? "/login?role=admin" : "/login"} 
        state={{ 
          from: location, 
          message: isTargetingAdmin ? "Please log in with an administrator account to access the Admin Dashboard." : undefined 
        }} 
        replace 
      />
    );
  }

  // Missing profile record (should be rare due to triggers, but handle it gracefully)
  if (!profile) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
        <div className="bg-red-50 text-red-700 p-4 rounded-lg max-w-md w-full border border-red-100">
          <h3 className="font-bold mb-2">Profile Missing</h3>
          <p className="text-sm">We couldn't load your profile information. Please try logging out and logging back in.</p>
        </div>
      </div>
    );
  }

  // Role-based authorization
  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(profile.role)) {
    // If the user is trying to access the Admin Dashboard without the admin role
    if (allowedRoles.includes('admin')) {
      const sqlCommand = `UPDATE profiles SET role = 'admin' WHERE email = '${profile.email}';`;

      const handleCopySql = () => {
        navigator.clipboard.writeText(sqlCommand);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      };

      const handleSwitchAccount = async () => {
        await signOut();
        navigate('/login?role=admin');
      };

      const targetDashboard = profile.role === 'employer' ? '/employer/dashboard' : '/candidate/dashboard';

      return (
        <div className="min-h-[75vh] flex items-center justify-center px-4 py-12 bg-gray-50">
          <div className="max-w-xl w-full bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-8">
            <div className="flex items-center gap-3 text-red-600 mb-4">
              <div className="p-2.5 bg-red-50 rounded-xl">
                <ShieldAlert className="w-7 h-7 text-red-600" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Admin Privileges Required</h1>
                <p className="text-sm text-gray-500">Access Restricted</p>
              </div>
            </div>

            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 mb-6 text-sm">
              <p className="text-gray-700 mb-1">
                You are currently signed in as:
              </p>
              <div className="font-semibold text-gray-900 break-all">{profile.email}</div>
              <div className="mt-2 flex items-center gap-2">
                <span className="text-gray-500">Current Role:</span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 capitalize">
                  {profile.role}
                </span>
              </div>
            </div>

            <p className="text-gray-600 text-sm mb-6 leading-relaxed">
              This area is restricted exclusively to platform administrators. If you are the platform owner, you must grant your user account the <code className="bg-gray-100 px-1.5 py-0.5 rounded text-amber-700 font-mono text-xs">admin</code> role in Supabase.
            </p>

            <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-4 mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-amber-900 uppercase tracking-wider">
                  How to grant admin access in Supabase
                </span>
                <button
                  onClick={handleCopySql}
                  className="inline-flex items-center gap-1 text-xs font-medium text-amber-800 hover:text-amber-900 bg-amber-100 hover:bg-amber-200/80 px-2 py-1 rounded transition-colors"
                  title="Copy SQL query"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied!' : 'Copy SQL'}</span>
                </button>
              </div>
              <p className="text-xs text-gray-600 mb-2">
                Run this command in your <strong>Supabase Dashboard → SQL Editor</strong>:
              </p>
              <pre className="bg-gray-900 text-amber-300 p-3 rounded-lg text-xs font-mono overflow-x-auto select-all">
                {sqlCommand}
              </pre>
              <p className="text-xs text-gray-500 mt-2">
                After executing the command in Supabase, refresh this page to access the Admin Dashboard.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleSwitchAccount}
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium bg-gray-900 hover:bg-gray-800 text-white transition-colors shadow-sm"
              >
                <LogOut className="w-4 h-4" />
                Sign in with another account
              </button>
              <button
                onClick={() => navigate(targetDashboard)}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border border-gray-300 hover:bg-gray-100 text-gray-700 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Go to my dashboard
              </button>
            </div>
          </div>
        </div>
      );
    }

    // If they go somewhere else they shouldn't, bounce them to their respective dashboard
    if (profile.role === 'candidate') return <Navigate to="/candidate/dashboard" replace />;
    if (profile.role === 'employer') return <Navigate to="/employer/dashboard" replace />;
    if (profile.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
