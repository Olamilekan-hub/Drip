import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const ProtectedRoute = ({ children, requiredRole, allowedRoles }) => {
  const { currentUser, userProfile, loading, hasRole, getDashboardRoute } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  // No user logged in
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  // If no role requirements, allow any authenticated user
  if (!requiredRole && !allowedRoles) {
    return children;
  }

  // Check specific role requirement
  if (requiredRole) {
    // Special handling for role hierarchy
    switch (requiredRole) {
      case "admin":
        if (userProfile?.role !== "admin") {
          return <Navigate to={getDashboardRoute()} replace />;
        }
        break;
      case "creator":
        if (!["creator", "admin"].includes(userProfile?.role)) {
          return <Navigate to={getDashboardRoute()} replace />;
        }
        break;
      case "user":
        if (!["user", "creator", "admin"].includes(userProfile?.role)) {
          return <Navigate to="/login" replace />;
        }
        break;
      default:
        if (userProfile?.role !== requiredRole) {
          return <Navigate to={getDashboardRoute()} replace />;
        }
    }
  }

  // Check allowed roles array
  if (allowedRoles && !allowedRoles.includes(userProfile?.role)) {
    return <Navigate to={getDashboardRoute()} replace />;
  }

  return children;
};

export default ProtectedRoute;