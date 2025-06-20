import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import AppRoutes from "./routes/AppRoutes";
import SignupForm from "./components/SignupForm";
import LoginForm from "./components/LoginForm";
import UserDashboard from "./components/UserDashboard";
import AdminPanel from "./components/AdminPanel";
import StreamingPage from "./components/StreamingPage";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;