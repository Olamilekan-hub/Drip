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
    // Ensure role is always present
    if (!user.role) user.role = "user";
    localStorage.setItem("token", token);
    setCurrentUser(user);
    setUserProfile(user);
    setLoading(false);
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
      if (!user.role) user.role = "user";
      setUserProfile(user);
      setCurrentUser(user);
    } catch (error) {
      setUserProfile(null);
      setCurrentUser(null);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const isAdmin = () => userProfile?.role === "admin";
  const isCreator = () =>
    userProfile?.role === "creator" || userProfile?.role === "admin";

  const value = {
    currentUser,
    userProfile,
    loading,
    login,
    logout,
    isAdmin,
    isCreator,
    refreshProfile: fetchUserProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
