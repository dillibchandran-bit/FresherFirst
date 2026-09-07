import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import Home from './pages/Home';

// Placeholder components for routing
const Jobs = () => <div className="min-h-screen py-20 text-center"><h1 className="text-3xl font-bold">Jobs Page</h1><p>Coming Soon</p></div>;
const JobDetails = () => <div className="min-h-screen py-20 text-center"><h1 className="text-3xl font-bold">Job Details</h1></div>;
const Companies = () => <div className="min-h-screen py-20 text-center"><h1 className="text-3xl font-bold">Companies</h1></div>;
const Login = () => <div className="min-h-screen py-20 text-center"><h1 className="text-3xl font-bold">Login</h1></div>;
const PostJob = () => <div className="min-h-screen py-20 text-center"><h1 className="text-3xl font-bold">Post a Job</h1></div>;

export default function App() {
  return (
    <BrowserRouter>
      <div className="flex flex-col min-h-screen font-sans">
        <Navbar />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            
            {/* Jobs Routes */}
            <Route path="/jobs" element={<Jobs />} />
            <Route path="/jobs/:slug" element={<JobDetails />} />
            <Route path="/jobs/freshers" element={<Jobs />} />
            
            {/* Location Routes */}
            <Route path="/locations/:location" element={<Jobs />} />
            
            {/* Companies Routes */}
            <Route path="/companies" element={<Companies />} />
            <Route path="/companies/:slug" element={<Companies />} />
            
            {/* Auth / Employer Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Login />} />
            <Route path="/employer/post-job" element={<PostJob />} />
            
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
}
