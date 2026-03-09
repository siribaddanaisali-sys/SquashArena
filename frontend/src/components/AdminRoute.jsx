import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function AdminRoute({ children }) {
  const { user, token } = useAuth();

  // Check if user is authenticated and has admin role
  if (!token) {
    return <Navigate to="/login" />;
  }

  // Allow 'regulator' role for admin access
  if (user?.role !== 'regulator' && user?.role !== 'organiser') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-squash-light">
        <div className="card text-center max-w-md">
          <h1 className="text-3xl font-bold text-red-600 mb-4">🔒 Access Denied</h1>
          <p className="text-gray-600 mb-6">
            You do not have permission to access the Developer Resource Zone. 
            Only admin users can view this section.
          </p>
          <a href="/" className="btn-primary">
            Return to Home
          </a>
        </div>
      </div>
    );
  }

  return children;
}
