import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from '../src/context/AuthContext';
import ProtectedRoute from '../src/components/ProtectedRoute';
import Navbar from '../src/components/Navbar';
import ScrollToTop from '../src/components/ScrollTop';
import Home from "../src/pages/Home";
import FindJob from "../src/pages/FindJob";
import PostJob from "../src/pages/PostJob";
import JobDashboard from "../src/pages/JobDashboard";
import Blog from "../src/pages/Blog";
import ContactUs from "../src/pages/ContactUs";
import JobDetail from "../src/pages/JobDetails";
import JobApplications from '../src/pages/JobApplications';
import Login from '../src/pages/Login';

function App() {
  return (

    <AuthProvider>
      <Navbar />
      <ScrollToTop />
      <div className="pt-16">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/FindJob" element={<FindJob />} />
          <Route path="/Blog" element={<Blog />} />
          <Route path="/ContactUs" element={<ContactUs />} />
          <Route path="/job/:id" element={<JobDetail />} />
          <Route path="/Login" element={<Login />} />
          
          {/* Protected Routes */}
          <Route 
            path="/PostJob" 
            element={
              <ProtectedRoute requiredRole="employer">
                <PostJob />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/JobDashboard" 
            element={
              <ProtectedRoute requiredRole="employer">
                <JobDashboard />
              </ProtectedRoute>
            } 
          />
          
          <Route
            path="/jobs/:jobId/applications"
            element={
              <ProtectedRoute allowedRoles={['employer', 'admin']}>
                <JobApplications />
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>
    </AuthProvider>
  );
}

export default App;