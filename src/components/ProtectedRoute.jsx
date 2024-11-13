import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Role mapping object
const ROLE_MAP = {
  'user': 'jobseeker',     // Regular users are treated as jobseekers
  'employer': 'employer',  // Keep employer as is
  'admin': 'admin'        // Keep admin as is
};

const ProtectedRoute = ({ children, requiredRole, allowedRoles = [] }) => {
  const { isAuthenticated, loading, user } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Map the user's role to our application role
  const userRole = ROLE_MAP[user?.role?.toLowerCase()] || 'jobseeker';

  // For employer-only routes, block access for non-employers
  if (requiredRole === 'employer' && userRole !== 'employer') {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Access Denied! </strong>
          <span className="block sm:inline">
            This page is restricted to employers only. Please register as an employer to access this feature.
          </span>
        </div>
      </div>
    );
  }

  // For routes with specific allowed roles
  if (allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Access Denied! </strong>
          <span className="block sm:inline">
            You don't have permission to access this page. This page is restricted to 
            {' ' + allowedRoles.join(' or ')} only.
          </span>
        </div>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;