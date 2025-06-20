import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase/config';

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const logout = async () => {
    try {
      await signOut(auth);
      setCurrentUser(null);
      setUserProfile(null);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const fetchUserProfile = async (user) => {
    if (!user) {
      setUserProfile(null);
      return;
    }

    try {
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        setUserProfile({
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          ...userData,
          // Default role to 'user' if not specified
          role: userData.role || 'user'
        });
      } else {
        // If no profile exists, create a basic one
        setUserProfile({
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          role: 'user'
        });
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      // Fallback profile
      setUserProfile({
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        role: 'user'
      });
    }
  };

  const isAdmin = () => {
    return userProfile?.role === 'admin';
  };

  const isCreator = () => {
    return userProfile?.role === 'creator' || userProfile?.role === 'admin';
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        await fetchUserProfile(user);
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    userProfile,
    loading,
    logout,
    isAdmin,
    isCreator,
    refreshProfile: () => fetchUserProfile(currentUser)
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};