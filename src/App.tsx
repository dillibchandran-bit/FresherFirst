import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';

import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import Home from './pages/Home';

// Auth Pages
import Login from './pages/auth/Login';
import RegisterCandidate from './pages/auth/RegisterCandidate';
import RegisterEmployer from './pages/auth/RegisterEmployer';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';

// Dashboards
import CandidateDashboard from './pages/candidate/Dashboard';
import CandidateProfile from './pages/candidate/Profile';
import EmployerDashboard from './pages/employer/Dashboard';
import AdminDashboard from './pages/admin/Dashboard';

// Placeholder components
const Jobs = () => <div className="min-h-screen py-20 text-center"><h1 className="text-3xl font-bold">Jobs Page</h1></div>;
const JobDetails = () => <div className="min-h-screen py-20 text-center"><h1 className="text-3xl font-bold">Job Details</h1></div>;
const Companies = () => <div className="min-h-screen py-20 text-center"><h1 className="text-3xl font-bold">Companies</h1></div>;

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="flex flex-col min-h-screen font-sans">
          <Navbar />
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<Home />} />
              
              {/* Auth Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<RegisterCandidate />} />
              <Route path="/employer/register" element={<RegisterEmployer />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              
              {/* Public Jobs / Companies */}
              <Route path="/jobs" element={<Jobs />} />
              <Route path="/jobs/:slug" element={<JobDetails />} />
              <Route path="/jobs/freshers" element={<Jobs />} />
              <Route path="/locations/:location" element={<Jobs />} />
              <Route path="/companies" element={<Companies />} />
              <Route path="/companies/:slug" element={<Companies />} />
              
              {/* Legacy Employer Route Redirect */}
              <Route path="/employer/post-job" element={<Navigate to="/employer/register" replace />} />
              
              {/* Protected Candidate Routes */}
              <Route 
                path="/candidate/dashboard" 
                element={
                  <ProtectedRoute allowedRoles={['candidate']}>
                    <CandidateDashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/candidate/profile" 
                element={
                  <ProtectedRoute allowedRoles={['candidate']}>
                    <CandidateProfile />
                  </ProtectedRoute>
                } 
              />
              
              {/* Protected Employer Routes */}
              <Route 
                path="/employer/dashboard" 
                element={
                  <ProtectedRoute allowedRoles={['employer']}>
                    <EmployerDashboard />
                  </ProtectedRoute>
                } 
              />
              
              {/* Protected Admin Routes */}
              <Route 
                path="/admin/dashboard" 
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminDashboard />
                  </ProtectedRoute>
                } 
              />
              
            </Routes>
          </main>
          <Footer />
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}
