import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import SignupForm from "../components/SignupForm";
import LoginForm from "../components/LoginForm";
import UserDashboard from "../components/UserDashboard";
import CreatorDashboard from "../components/CreatorDashboard";
import AdminPanel from "../components/AdminPanel";
import StreamingPage from "../components/StreamingPage";
import ProtectedRoute from "../components/ProtectedRoute";

export default function AppRoutes() {
  const { currentUser, loading, userProfile } = useAuth();

  if (loading) return <div className="p-4 text-white">Loading...</div>;

  const getDashboardRoute = () => {
    if (!currentUser || !userProfile) return "/login";
    
    switch (userProfile.role) {
      case "admin":
        return "/admin";
      case "creator":
        return "/creator";
      case "user":
      default:
        return "/dashboard";
    }
  };

  return (
    <Routes>
      {/* Default Route - Redirect based on user role */}
      <Route
        path="/"
        element={<Navigate to={getDashboardRoute()} replace />}
      />

      {/* Public Routes */}
      <Route 
        path="/login" 
        element={!currentUser ? <LoginForm /> : <Navigate to={getDashboardRoute()} />} 
      />
      <Route 
        path="/signup" 
        element={!currentUser ? <SignupForm /> : <Navigate to={getDashboardRoute()} />} 
      />

      {/* Protected User Routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute requiredRole="user">
            <UserDashboard />
          </ProtectedRoute>
        }
      />

      {/* Protected Creator Routes */}
      <Route
        path="/creator"
        element={
          <ProtectedRoute requiredRole="creator">
            <CreatorDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/creator/events"
        element={
          <ProtectedRoute requiredRole="creator">
            <CreatorDashboard activeTab="events" />
          </ProtectedRoute>
        }
      />
      <Route
        path="/creator/analytics"
        element={
          <ProtectedRoute requiredRole="creator">
            <CreatorDashboard activeTab="analytics" />
          </ProtectedRoute>
        }
      />

      {/* Protected Admin Routes */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute requiredRole="admin">
            <AdminPanel />
          </ProtectedRoute>
        }
      />

      {/* Streaming Route - Available to all authenticated users */}
      <Route
        path="/stream/:eventId"
        element={
          <ProtectedRoute>
            <StreamingPage />
          </ProtectedRoute>
        }
      />

      {/* Cross-role access routes */}
      <Route
        path="/user-view"
        element={
          <ProtectedRoute>
            <UserDashboard />
          </ProtectedRoute>
        }
      />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}