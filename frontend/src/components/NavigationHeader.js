// frontend/src/components/NavigationHeader.js
import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";

const NavigationHeader = ({ title = "drip", subtitle = "" }) => {
  const { currentUser, userProfile, logout, isAdmin, isCreator } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showDropdown, setShowDropdown] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const navigationItems = [
    {
      label: "Dashboard",
      path: "/dashboard",
      icon: "🏠",
      show: true,
    },
    {
      label: "Creator Studio",
      path: "/creator",
      icon: "🎨",
      show: isCreator(),
    },
    {
      label: "Admin Panel",
      path: "/admin",
      icon: "⚙️",
      show: isAdmin(),
    },
  ];

  const getCurrentPageInfo = () => {
    const path = location.pathname;
    if (path.includes('/admin')) return { title: 'Admin Panel', subtitle: 'Platform Management' };
    if (path.includes('/creator')) return { title: 'Creator Studio', subtitle: 'Content Management' };
    if (path.includes('/dashboard')) return { title: 'Dashboard', subtitle: 'Your Events' };
    if (path.includes('/stream')) return { title: 'Live Stream', subtitle: 'Now Playing' };
    return { title, subtitle };
  };

  const pageInfo = getCurrentPageInfo();

  return (
    <header className="sticky top-0 z-40 px-6 py-4 border-b border-zinc-800 bg-black/95 backdrop-blur-sm">
      <div className="flex items-center justify-between">
        {/* Left Side - Brand and Page Info */}
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/')}
            className="text-2xl font-bold tracking-widest text-white transition-colors hover:text-zinc-300"
          >
            drip
          </button>
          {pageInfo.subtitle && (
            <div className="items-center hidden space-x-2 sm:flex">
              <span className="text-zinc-400">•</span>
              <span className="text-sm text-zinc-400">{pageInfo.subtitle}</span>
            </div>
          )}
        </div>

        {/* Right Side - Navigation and User Menu */}
        <div className="flex items-center space-x-4">
          {/* Quick Navigation - Desktop */}
          <nav className="items-center hidden space-x-1 md:flex">
            {navigationItems
              .filter(item => item.show && item.path !== location.pathname)
              .map((item) => (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className="flex items-center px-3 py-2 space-x-2 text-sm transition-colors rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800"
                >
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              ))}
          </nav>

          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center px-3 py-2 space-x-3 text-sm transition-colors rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800"
            >
              <div className="flex items-center space-x-2">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-zinc-700">
                  <span className="text-xs font-medium text-white">
                    {userProfile?.name?.charAt(0)?.toUpperCase() || 'U'}
                  </span>
                </div>
                <div className="hidden text-left sm:block">
                  <div className="text-sm font-medium text-white">
                    {userProfile?.name || 'User'}
                  </div>
                  <div className="text-xs capitalize text-zinc-400">
                    {userProfile?.role || 'user'}
                  </div>
                </div>
              </div>
              <svg
                className={`w-4 h-4 transition-transform ${showDropdown ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Dropdown Menu */}
            {showDropdown && (
              <div className="absolute right-0 z-50 w-64 py-2 mt-2 border rounded-lg shadow-xl bg-zinc-900 border-zinc-800">
                {/* User Info */}
                <div className="px-4 py-3 border-b border-zinc-800">
                  <div className="font-medium text-white">{userProfile?.name}</div>
                  <div className="text-sm text-zinc-400">{userProfile?.email}</div>
                  <div className="mt-1 text-xs capitalize text-zinc-500">
                    {userProfile?.role} account
                  </div>
                </div>

                {/* Navigation Items - Mobile */}
                <div className="md:hidden">
                  {navigationItems
                    .filter(item => item.show)
                    .map((item) => (
                      <button
                        key={item.path}
                        onClick={() => {
                          navigate(item.path);
                          setShowDropdown(false);
                        }}
                        className={`w-full text-left px-4 py-2 text-sm hover:bg-zinc-800 transition-colors flex items-center space-x-3 ${
                          location.pathname === item.path 
                            ? 'text-white bg-zinc-800' 
                            : 'text-zinc-400'
                        }`}
                      >
                        <span>{item.icon}</span>
                        <span>{item.label}</span>
                      </button>
                    ))}
                  <div className="my-2 border-t border-zinc-800"></div>
                </div>

                {/* Profile Actions */}
                <button
                  onClick={() => {
                    navigate('/dashboard');
                    setActiveTab?.('profile');
                    setShowDropdown(false);
                  }}
                  className="w-full px-4 py-2 text-sm text-left transition-colors text-zinc-400 hover:text-white hover:bg-zinc-800"
                >
                  Edit Profile
                </button>

                <button
                  onClick={() => {
                    handleLogout();
                    setShowDropdown(false);
                  }}
                  className="w-full px-4 py-2 text-sm text-left transition-colors text-zinc-400 hover:text-white hover:bg-zinc-800"
                >
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Close dropdown when clicking outside */}
      {showDropdown && (
        <div
          className="fixed inset-0 z-30"
          onClick={() => setShowDropdown(false)}
        ></div>
      )}
    </header>
  );
};

export default NavigationHeader;