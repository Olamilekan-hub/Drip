import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { AuthProvider } from "../contexts/AuthContext";
import SignupForm from "../components/SignupForm";
import LoginForm from "../components/LoginForm";
import UserDashboard from "../components/UserDashboard";
import AdminPanel from "../components/AdminPanel";
import StreamingPage from "../components/StreamingPage";
import ProtectedRoute from "../components/ProtectedRoute";

export default function AppRoutes() {
  const { currentUser, loading, userProfile } = useAuth();

  if (loading) return <div className="p-4 text-white">Loading...</div>;

  return (
    <Routes>
      {/* Default Route */}
      <Route path="/" element={
        currentUser && userProfile
            ? userProfile.role === "admin"
            ? <Navigate to="/admin" />
            : <Navigate to="/dashboard" />
            : <Navigate to="/login" />
        } />

      {/* Public */}
      <Route path="/login" element={<LoginForm />} />
      <Route path="/signup" element={<SignupForm />} />

      {/* Protected */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <UserDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin"
        element={
          <ProtectedRoute requiredRole="admin">
            <AdminPanel />
          </ProtectedRoute>
        }
      />
      <Route
        path="/stream/:eventId"
        element={
          <ProtectedRoute>
            <StreamingPage />
          </ProtectedRoute>
        }
      />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
