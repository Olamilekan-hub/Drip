// frontend/src/contexts/AuthContext.js
import React, { createContext, useContext, useEffect, useState } from "react";
import { loginUser, registerUser, fetchUserProfile } from "../api/api";

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Login function with enhanced error handling
  const login = async (email, password) => {
    try {
      setError(null);
      const { data: response, error: loginError } = await loginUser({ email, password });
      
      if (loginError) {
        throw new Error(loginError);
      }

      const { token, user } = response;
      
      // Ensure role is always present with proper fallback
      const userWithRole = {
        ...user,
        role: user.role || "user"
      };
      
      localStorage.setItem("token", token);
      setCurrentUser(userWithRole);
      setUserProfile(userWithRole);
      
      return userWithRole;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Register function with enhanced error handling
  const register = async (userData) => {
    try {
      setError(null);
      const { data: response, error: registerError } = await registerUser(userData);
      
      if (registerError) {
        throw new Error(registerError);
      }

      const { token, user } = response;
      
      // Ensure role is always present
      const userWithRole = {
        ...user,
        role: user.role || "user"
      };
      
      localStorage.setItem("token", token);
      setCurrentUser(userWithRole);
      setUserProfile(userWithRole);
      
      return userWithRole;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Logout function with cleanup
  const logout = async () => {
    try {
      localStorage.removeItem("token");
      setCurrentUser(null);
      setUserProfile(null);
      setError(null);
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  // Refresh user profile
  const refreshProfile = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setUserProfile(null);
      setCurrentUser(null);
      setLoading(false);
      return;
    }
    
    try {
      const { data: user, error: profileError } = await fetchUserProfile();
      
      if (profileError) {
        console.error("Failed to fetch user profile:", profileError);
        // Clear invalid token
        localStorage.removeItem("token");
        setUserProfile(null);
        setCurrentUser(null);
        setError("Session expired. Please login again.");
      } else {
        // Ensure role is always present with proper fallback
        const userWithRole = {
          ...user,
          role: user.role || "user"
        };
        
        setUserProfile(userWithRole);
        setCurrentUser(userWithRole);
        setError(null);
      }
    } catch (error) {
      console.error("Profile fetch error:", error);
      localStorage.removeItem("token");
      setUserProfile(null);
      setCurrentUser(null);
      setError("Failed to load profile. Please login again.");
    }
    setLoading(false);
  };

  // Update user profile
  const updateProfile = async (updates) => {
    try {
      const { data: updatedUser, error: updateError } = await updateUserProfile(updates);
      
      if (updateError) {
        throw new Error(updateError);
      }

      const userWithRole = {
        ...updatedUser,
        role: updatedUser.role || userProfile.role || "user"
      };
      
      setUserProfile(userWithRole);
      setCurrentUser(userWithRole);
      
      return userWithRole;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Initialize auth state on app load
  useEffect(() => {
    refreshProfile();
  }, []);

  // Role checking functions with improved hierarchy
  const isAdmin = () => userProfile?.role === "admin";
  
  const isCreator = () => 
    userProfile?.role === "creator" || userProfile?.role === "admin";
  
  const isUser = () => 
    userProfile?.role === "user" || userProfile?.role === "creator" || userProfile?.role === "admin";

  // Check if user has specific role or higher
  const hasRole = (requiredRole) => {
    if (!userProfile?.role) return false;
    
    const roleHierarchy = {
      user: 1,
      creator: 2,
      admin: 3
    };
    
    const userLevel = roleHierarchy[userProfile.role] || 0;
    const requiredLevel = roleHierarchy[requiredRole] || 0;
    
    return userLevel >= requiredLevel;
  };

  // Get user's primary dashboard route based on role
  const getDashboardRoute = () => {
    if (!userProfile?.role) return "/dashboard";
    
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

  // Get available navigation options for user
  const getNavigationOptions = () => {
    const options = [
      {
        label: "Dashboard",
        path: "/dashboard",
        icon: "🏠",
        available: isUser(),
        primary: userProfile?.role === "user"
      }
    ];

    if (isCreator()) {
      options.push({
        label: "Creator Studio",
        path: "/creator",
        icon: "🎨",
        available: true,
        primary: userProfile?.role === "creator"
      });
    }

    if (isAdmin()) {
      options.push({
        label: "Admin Panel",
        path: "/admin",
        icon: "⚙️",
        available: true,
        primary: userProfile?.role === "admin"
      });
    }

    return options;
  };

  // Clear error function
  const clearError = () => setError(null);

  // Check if user is authenticated
  const isAuthenticated = () => Boolean(currentUser && userProfile);

  // Get user display info
  const getUserDisplayInfo = () => {
    if (!userProfile) return null;
    
    return {
      name: userProfile.name || "User",
      email: userProfile.email,
      role: userProfile.role || "user",
      initials: userProfile.name?.charAt(0)?.toUpperCase() || "U",
      avatar: userProfile.avatar || null,
      createdAt: userProfile.createdAt,
      lastLogin: userProfile.lastLogin
    };
  };

  const value = {
    // State
    currentUser,
    userProfile,
    loading,
    error,
    
    // Actions
    login,
    register,
    logout,
    updateProfile,
    refreshProfile,
    clearError,
    
    // Role checking
    isAdmin,
    isCreator,
    isUser,
    hasRole,
    isAuthenticated,
    
    // Navigation
    getDashboardRoute,
    getNavigationOptions,
    
    // Utilities
    getUserDisplayInfo,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};