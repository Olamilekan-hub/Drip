import React, { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";

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

  // Login: set token and fetch user profile
  const login = async (email, password) => {
    const response = await axios.post(
      `${process.env.REACT_APP_API_BASE.replace(/\/$/, "")}/users/login`,
      { email, password }
    );
    let { token, user } = response.data;
    
    // Ensure role is always present with proper fallback
    if (!user.role) user.role = "user";
    
    localStorage.setItem("token", token);
    setCurrentUser(user);
    setUserProfile(user);
    setLoading(false);
    return user;
  };

  // Register: create account and auto-login
  const register = async (userData) => {
    const response = await axios.post(
      `${process.env.REACT_APP_API_BASE.replace(/\/$/, "")}/users`,
      userData
    );
    let { token, user } = response.data;
    
    // Ensure role is always present
    if (!user.role) user.role = "user";
    
    localStorage.setItem("token", token);
    setCurrentUser(user);
    setUserProfile(user);
    return user;
  };

  // Logout: clear token and user
  const logout = async () => {
    localStorage.removeItem("token");
    setCurrentUser(null);
    setUserProfile(null);
  };

  // Fetch user profile from backend
  const fetchUserProfile = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setUserProfile(null);
      setCurrentUser(null);
      setLoading(false);
      return;
    }
    
    try {
      const response = await axios.get(
        process.env.REACT_APP_API_BASE + "/users/me",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      let user = response.data;
      
      // Ensure role is always present with proper fallback
      if (!user.role) user.role = "user";
      
      setUserProfile(user);
      setCurrentUser(user);
    } catch (error) {
      console.error("Failed to fetch user profile:", error);
      // Clear invalid token
      localStorage.removeItem("token");
      setUserProfile(null);
      setCurrentUser(null);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUserProfile();
  }, []);

  // Role checking functions
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

  // Get user's primary dashboard route
  const getDashboardRoute = () => {
    switch (userProfile?.role) {
      case "admin":
        return "/admin";
      case "creator":
        return "/creator";
      case "user":
      default:
        return "/dashboard";
    }
  };

  const value = {
    currentUser,
    userProfile,
    loading,
    login,
    register,
    logout,
    isAdmin,
    isCreator,
    isUser,
    hasRole,
    getDashboardRoute,
    refreshProfile: fetchUserProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};