// frontend/src/routes/AppRoutes.js
import React, { Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import ErrorBoundary from "../components/ErrorBoundary";
import { PageLoader } from "../components/LoadingSpinner";
import ProtectedRoute from "../components/ProtectedRoute";

// Lazy load components for better performance
const SignupForm = React.lazy(() => import("../components/SignupForm"));
const LoginForm = React.lazy(() => import("../components/LoginForm"));
const UserDashboard = React.lazy(() => import("../components/UserDashboard"));
const CreatorDashboard = React.lazy(() => import("../components/CreatorDashboard"));
const AdminPanel = React.lazy(() => import("../components/AdminPanel"));
const StreamingPage = React.lazy(() => import("../components/StreamingPage"));

// 404 Not Found Component
const NotFound = () => (
  <div className="flex items-center justify-center min-h-screen text-white bg-black">
    <div className="text-center">
      <h1 className="mb-4 text-6xl font-bold">404</h1>
      <p className="mb-6 text-xl">Page not found</p>
      <button
        onClick={() => window.history.back()}
        className="px-6 py-3 text-black transition-colors bg-white rounded-lg hover:bg-zinc-200"
      >
        Go Back
      </button>
    </div>
  </div>
);

// Loading fallback component
const RouteLoader = ({ message = "Loading page..." }) => (
  <PageLoader message={message} />
);

export default function AppRoutes() {
  const { currentUser, loading, userProfile, error } = useAuth();

  // Show loading spinner while authentication is being determined
  if (loading) {
    return <PageLoader message="Initializing..." />;
  }

  // Show error state if authentication fails
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen text-white bg-black">
        <div className="max-w-md text-center">
          <h2 className="mb-4 text-xl font-semibold">Authentication Error</h2>
          <p className="mb-6 text-zinc-400">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 text-black transition-colors bg-white rounded-lg hover:bg-zinc-200"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

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
    <ErrorBoundary>
      <Suspense fallback={<RouteLoader />}>
        <Routes>
          {/* Default Route - Redirect based on authentication and user role */}
          <Route
            path="/"
            element={<Navigate to={getDashboardRoute()} replace />}
          />

          {/* Public Routes - Only accessible when not logged in */}
          <Route 
            path="/login" 
            element={
              !currentUser ? (
                <Suspense fallback={<RouteLoader message="Loading login..." />}>
                  <LoginForm />
                </Suspense>
              ) : (
                <Navigate to={getDashboardRoute()} replace />
              )
            } 
          />
          <Route 
            path="/signup" 
            element={
              !currentUser ? (
                <Suspense fallback={<RouteLoader message="Loading signup..." />}>
                  <SignupForm />
                </Suspense>
              ) : (
                <Navigate to={getDashboardRoute()} replace />
              )
            } 
          />

          {/* Protected User Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute requiredRole="user">
                <Suspense fallback={<RouteLoader message="Loading dashboard..." />}>
                  <UserDashboard />
                </Suspense>
              </ProtectedRoute>
            }
          />

          {/* Protected Creator Routes */}
          <Route
            path="/creator"
            element={
              <ProtectedRoute requiredRole="creator">
                <Suspense fallback={<RouteLoader message="Loading creator studio..." />}>
                  <CreatorDashboard />
                </Suspense>
              </ProtectedRoute>
            }
          />
          <Route
            path="/creator/:tab"
            element={
              <ProtectedRoute requiredRole="creator">
                <Suspense fallback={<RouteLoader message="Loading creator studio..." />}>
                  <CreatorDashboard />
                </Suspense>
              </ProtectedRoute>
            }
          />

          {/* Protected Admin Routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute requiredRole="admin">
                <Suspense fallback={<RouteLoader message="Loading admin panel..." />}>
                  <AdminPanel />
                </Suspense>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/:tab"
            element={
              <ProtectedRoute requiredRole="admin">
                <Suspense fallback={<RouteLoader message="Loading admin panel..." />}>
                  <AdminPanel />
                </Suspense>
              </ProtectedRoute>
            }
          />

          {/* Streaming Route - Available to authenticated users with valid tickets */}
          <Route
            path="/stream/:eventId"
            element={
              <ProtectedRoute>
                <Suspense fallback={<RouteLoader message="Loading stream..." />}>
                  <StreamingPage />
                </Suspense>
              </ProtectedRoute>
            }
          />

          {/* Cross-role access routes */}
          <Route
            path="/user-view"
            element={
              <ProtectedRoute>
                <Suspense fallback={<RouteLoader message="Loading user view..." />}>
                  <UserDashboard />
                </Suspense>
              </ProtectedRoute>
            }
          />

          {/* Legacy routes for backward compatibility */}
          <Route
            path="/events"
            element={<Navigate to="/dashboard" replace />}
          />
          <Route
            path="/profile"
            element={<Navigate to="/dashboard" replace />}
          />

          {/* 404 Fallback */}
          <Route 
            path="*" 
            element={
              <Suspense fallback={<RouteLoader />}>
                <NotFound />
              </Suspense>
            } 
          />
        </Routes>
      </Suspense>
    </ErrorBoundary>
  );
}