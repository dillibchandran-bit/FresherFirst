const fs = require('fs');
let c = fs.readFileSync('src/App.tsx', 'utf8');

c = c.replace("import React from 'react';", "import React, { Suspense } from 'react';\nimport { HelmetProvider } from 'react-helmet-async';");

c = c.replace(/import CandidateDashboard from '\.\/pages\/candidate\/Dashboard';[\s\S]*?import AdminDashboard from '\.\/pages\/admin\/Dashboard';/, 
`const CandidateDashboard = React.lazy(() => import('./pages/candidate/Dashboard'));
const CandidateProfile = React.lazy(() => import('./pages/candidate/Profile'));
const CandidateApplications = React.lazy(() => import('./pages/candidate/Applications'));
const EmployerDashboard = React.lazy(() => import('./pages/employer/Dashboard'));
const ManageApplicants = React.lazy(() => import('./pages/employer/ManageApplicants'));
const PostJob = React.lazy(() => import('./pages/employer/PostJob'));
const AdminDashboard = React.lazy(() => import('./pages/admin/Dashboard'));`);

const loadingFallback = `<div className="min-h-screen flex items-center justify-center text-gray-500">Loading...</div>`;

c = c.replace(/<Routes>([\s\S]*)<\/Routes>/, `<Suspense fallback={${loadingFallback}}>\n            <Routes>$1</Routes>\n            </Suspense>`);

c = c.replace('<AuthProvider>', '<HelmetProvider>\n    <AuthProvider>');
c = c.replace('</AuthProvider>', '</AuthProvider>\n    </HelmetProvider>');

fs.writeFileSync('src/App.tsx', c);
