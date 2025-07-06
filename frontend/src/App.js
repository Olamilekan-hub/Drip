// frontend/src/App.js
import React, { useEffect } from "react";
import { BrowserRouter as Router } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import AppRoutes from "./routes/AppRoutes";
import ErrorBoundary from "./components/ErrorBoundary";

function App() {
  useEffect(() => {
    // Set up global error handler
    const handleGlobalError = (event) => {
      console.error('Global error:', event.error);
      // In production, you might want to send this to an error tracking service
    };

    const handleUnhandledRejection = (event) => {
      console.error('Unhandled promise rejection:', event.reason);
      // In production, you might want to send this to an error tracking service
    };

    window.addEventListener('error', handleGlobalError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    // Cleanup event listeners
    return () => {
      window.removeEventListener('error', handleGlobalError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  // Add any app-level configuration here
  useEffect(() => {
    // Set document title
    document.title = "Drip - Live Streaming Platform";

    // Add meta tags for SEO
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Drip - Premium live streaming platform for exclusive events and experiences');
    }

    // Add viewport meta tag if not present
    const metaViewport = document.querySelector('meta[name="viewport"]');
    if (!metaViewport) {
      const viewport = document.createElement('meta');
      viewport.name = 'viewport';
      viewport.content = 'width=device-width, initial-scale=1.0';
      document.head.appendChild(viewport);
    }

    // Set theme color for mobile browsers
    const themeColor = document.querySelector('meta[name="theme-color"]');
    if (!themeColor) {
      const theme = document.createElement('meta');
      theme.name = 'theme-color';
      theme.content = '#000000';
      document.head.appendChild(theme);
    }
  }, []);

  return (
    <ErrorBoundary>
      <AuthProvider>
        <Router>
          <div className="App">
            <AppRoutes />
          </div>
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;