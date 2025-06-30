import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const ProtectedRoute = ({ children, requiredRole }) => {
  console.log("ProtectedRoute rendered", { requiredRole });
  const { currentUser, userProfile, loading } = useAuth();

  if (loading) {
    return <div className="mt-10 text-center text-white">Loading...</div>;
  }

  if (!currentUser) {
    console.log("ProtectedRoute: No currentUser, redirecting to /login");
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && userProfile?.role !== requiredRole) {
    console.log("ProtectedRoute: Role mismatch, redirecting to /");
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
