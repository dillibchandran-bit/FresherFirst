import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { UserRole } from '../../types';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, profile, loading } = useAuth();
  const location = useLocation();

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
    return <Navigate to="/login" state={{ from: location }} replace />;
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
    // If they go somewhere they shouldn't, bounce them to their respective dashboard
    if (profile.role === 'candidate') return <Navigate to="/candidate/dashboard" replace />;
    if (profile.role === 'employer') return <Navigate to="/employer/dashboard" replace />;
    if (profile.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
