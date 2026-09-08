import React, { Suspense } from 'react';
import { HelmetProvider } from 'react-helmet-async';
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

// Dashboards & Profiles
const CandidateDashboard = React.lazy(() => import('./pages/candidate/Dashboard'));
const CandidateProfile = React.lazy(() => import('./pages/candidate/Profile'));
const CandidateApplications = React.lazy(() => import('./pages/candidate/Applications'));
const EmployerDashboard = React.lazy(() => import('./pages/employer/Dashboard'));
const ManageApplicants = React.lazy(() => import('./pages/employer/ManageApplicants'));
const PostJob = React.lazy(() => import('./pages/employer/PostJob'));
const AdminDashboard = React.lazy(() => import('./pages/admin/Dashboard'));

// Public Jobs / Companies
import JobList from './pages/jobs/JobList';
import JobDetails from './pages/jobs/JobDetails';

// Placeholder components
const Companies = () => <div className="min-h-screen py-20 text-center"><h1 className="text-3xl font-bold">Companies</h1></div>;

export default function App() {
  return (
    <HelmetProvider>
    <AuthProvider>
      <BrowserRouter>
        <div className="flex flex-col min-h-screen font-sans">
          <Navbar />
          <main className="flex-grow">
            <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-gray-500">Loading...</div>}>
            <Routes>
              <Route path="/" element={<Home />} />
              
              {/* Auth Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<RegisterCandidate />} />
              <Route path="/employer/register" element={<RegisterEmployer />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              
              {/* Public Jobs / Companies */}
              <Route path="/jobs" element={<JobList />} />
              <Route path="/jobs/:slug" element={<JobDetails />} />
              <Route path="/jobs/freshers" element={<JobList />} />
              <Route path="/locations/:location" element={<JobList />} />
              <Route path="/companies" element={<Companies />} />
              <Route path="/companies/:slug" element={<Companies />} />
              
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
              <Route 
                path="/candidate/applications" 
                element={
                  <ProtectedRoute allowedRoles={['candidate']}>
                    <CandidateApplications />
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
              <Route 
                path="/employer/post-job" 
                element={
                  <ProtectedRoute allowedRoles={['employer']}>
                    <PostJob />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/employer/jobs/:id/edit" 
                element={
                  <ProtectedRoute allowedRoles={['employer']}>
                    <PostJob />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/employer/jobs/:id/applicants" 
                element={
                  <ProtectedRoute allowedRoles={['employer']}>
                    <ManageApplicants />
                  </ProtectedRoute>
                } 
              />
              
              {/* Protected Admin Routes */}
              <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
              <Route 
                path="/admin/dashboard" 
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminDashboard />
                  </ProtectedRoute>
                } 
              />
              
            </Routes>
            </Suspense>
          </main>
          <Footer />
        </div>
      </BrowserRouter>
    </AuthProvider>
    </HelmetProvider>
  );
}
