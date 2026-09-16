import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Briefcase, Loader2, AlertCircle, Shield, Info } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const navigate = useNavigate();
  const location = useLocation();
  const { profile } = useAuth();

  const searchParams = new URLSearchParams(location.search);
  const isAdminIntent = searchParams.get('role') === 'admin' || (location.state as any)?.from?.pathname?.startsWith('/admin');
  const infoMessage = (location.state as any)?.message;

  // If already logged in, redirect to dashboard
  React.useEffect(() => {
    if (profile) {
      const from = (location.state as any)?.from?.pathname;
      if (from) {
        navigate(from, { replace: true });
      } else {
        if (profile.role === 'employer') navigate('/employer/dashboard', { replace: true });
        else if (profile.role === 'admin') navigate('/admin/dashboard', { replace: true });
        else navigate('/candidate/dashboard', { replace: true });
      }
    }
  }, [profile, navigate, location]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) throw signInError;
      
      // Navigation is handled by the useEffect watching 'profile' above
    } catch (err: any) {
      setError(err.message || 'Failed to sign in. Please check your credentials.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
        <div className="text-center mb-8">
          {isAdminIntent ? (
            <div className="inline-flex bg-gray-900 p-2.5 rounded-xl mb-4 text-amber-400">
              <Shield className="w-6 h-6" />
            </div>
          ) : (
            <div className="inline-flex bg-amber-500 p-2 rounded-xl mb-4">
              <Briefcase className="w-6 h-6 text-white" />
            </div>
          )}

          {isAdminIntent && (
            <div className="block mb-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                <Shield className="w-3.5 h-3.5 text-amber-600" /> Admin Portal
              </span>
            </div>
          )}

          <h2 className="text-2xl font-bold text-gray-900">
            {isAdminIntent ? 'Admin Sign In' : 'Welcome back'}
          </h2>
          <p className="text-gray-500 mt-2 text-sm">
            {isAdminIntent 
              ? 'Sign in with your administrator credentials to access the Admin Dashboard' 
              : 'Log in to your Fresher First account'}
          </p>
        </div>

        {infoMessage && (
          <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl flex gap-3 text-amber-900 text-sm">
            <Info className="w-5 h-5 flex-shrink-0 text-amber-600 mt-0.5" />
            <p>{infoMessage}</p>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-lg flex gap-3 text-red-700">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p className="text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-sm font-medium text-gray-700">Password</label>
              <Link to="/forgot-password" className="text-sm text-amber-600 hover:text-amber-700 font-medium">
                Forgot password?
              </Link>
            </div>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gray-900 text-white py-2.5 rounded-lg font-medium hover:bg-gray-800 transition-colors flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Log in'}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-gray-100">
          <p className="text-center text-sm text-gray-600">
            Don't have an account?
          </p>
          <div className="mt-4 grid grid-cols-2 gap-4">
            <Link to="/register" className="text-center py-2 px-4 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
              I'm a Candidate
            </Link>
            <Link to="/employer/register" className="text-center py-2 px-4 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
              I'm an Employer
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
