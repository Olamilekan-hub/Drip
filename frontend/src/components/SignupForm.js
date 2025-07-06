import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

function SignupForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    country: "",
    city: "",
    role: "user", // user, creator, admin
    consent: false,
    updates: false,
    isAdmin: false,
    adminCode: "",
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const navigate = useNavigate();
  const { register } = useAuth();

  const validateForm = () => {
    const newErrors = {};
    if (formData.name.length < 2) {
      newErrors.name = "Name must be at least 2 characters";
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }
    if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }
    if (formData.country.length < 2) {
      newErrors.country = "Please enter a valid country";
    }
    if (formData.city.length < 2) {
      newErrors.city = "Please enter a valid city";
    }
    if (!formData.consent) {
      newErrors.consent = "You must agree to the terms and conditions";
    }
    if (formData.isAdmin && formData.adminCode !== "DRIP2025") {
      newErrors.adminCode = "Invalid admin access code";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    
    // Handle role selection
    if (name === "role" || name === "isAdmin") {
      let newRole = name === "isAdmin" && checked ? "admin" : value;
      setFormData((prev) => ({
        ...prev,
        role: newRole,
        isAdmin: newRole === "admin"
      }));
    }
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    try {
      // Determine final role
      let finalRole = formData.role;
      if (formData.isAdmin && formData.adminCode === "DRIP2025") {
        finalRole = "admin";
      }

      const userData = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        country: formData.country,
        city: formData.city,
        role: finalRole,
        preferences: {
          notifications: formData.updates,
          newsletter: formData.updates
        }
      };

      // Use AuthContext register function
      const user = await register(userData);
      
      setShowSuccess(true);
      
      // Reset form
      setFormData({
        name: "",
        email: "",
        password: "",
        country: "",
        city: "",
        role: "user",
        consent: false,
        updates: false,
        isAdmin: false,
        adminCode: "",
      });

      // Redirect based on role
      setTimeout(() => {
        switch (user.role) {
          case "admin":
            navigate("/admin");
            break;
          case "creator":
            navigate("/creator");
            break;
          default:
            navigate("/dashboard");
        }
      }, 1500);

    } catch (err) {
      let errorMsg = "Something went wrong. Please try again.";
      if (err.response?.data?.error) {
        errorMsg = err.response.data.error;
      }
      setErrors({ submit: errorMsg });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative flex items-center justify-center min-h-screen overflow-hidden bg-black">
      <style>{`
        input:-webkit-autofill,
        input:-webkit-autofill:focus,
        input:-webkit-autofill:hover,
        input:-webkit-autofill:active {
          -webkit-box-shadow: 0 0 0 1000px #18181b inset !important;
          box-shadow: 0 0 0 1000px #18181b inset !important;
          -webkit-text-fill-color: #fff !important;
          color: #fff !important;
          caret-color: #fff !important;
        }
      `}</style>
      
      {/* Video background */}
      <div className="absolute inset-0 z-10 bg-gradient-to-b from-black/70 via-black/50 to-black/70"></div>
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 z-0 object-cover w-full h-full pointer-events-none opacity-70"
      >
        <source src="/blip3.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      {/* Success Toast */}
      {showSuccess && (
        <div className="fixed z-50 px-6 py-3 font-sans text-white bg-green-500 rounded-lg shadow-lg top-4 right-4 animate-fade-in">
          Account created successfully! Welcome to Drip.live
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="relative z-20 w-full max-w-md p-8 mt-8 space-y-6 md:mt-16"
        aria-label="Sign up form"
      >
        <div className="w-full mt-6 mb-8 text-center">
          <p className="font-sans text-base tracking-wider text-zinc-300/80">
            join the frequency
          </p>
        </div>

        {/* Name */}
        <div className="space-y-1">
          <input
            id="name"
            name="name"
            type="text"
            placeholder="name"
            onChange={handleChange}
            value={formData.name}
            className={`w-full bg-white/5 backdrop-blur-md rounded-lg px-4 py-3.5 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30 transition-all duration-200 shadow-lg font-sans text-sm ${
              errors.name ? "ring-2 ring-red-500" : ""
            }`}
            required
          />
          {errors.name && (
            <p className="mt-1 font-sans text-xs text-red-400">{errors.name}</p>
          )}
        </div>

        {/* Email */}
        <div className="space-y-1">
          <input
            id="email"
            name="email"
            type="email"
            placeholder="email address"
            onChange={handleChange}
            value={formData.email}
            className={`w-full bg-white/5 backdrop-blur-md rounded-lg px-4 py-3.5 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30 transition-all duration-200 shadow-lg font-sans text-sm ${
              errors.email ? "ring-2 ring-red-500" : ""
            }`}
            required
          />
          {errors.email && (
            <p className="mt-1 font-sans text-xs text-red-400">{errors.email}</p>
          )}
        </div>

        {/* Password */}
        <div className="space-y-1">
          <input
            id="password"
            name="password"
            type="password"
            placeholder="password"
            onChange={handleChange}
            value={formData.password}
            className={`w-full bg-white/5 backdrop-blur-md rounded-lg px-4 py-3.5 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30 transition-all duration-200 shadow-lg font-sans text-sm ${
              errors.password ? "ring-2 ring-red-500" : ""
            }`}
            required
          />
          {errors.password && (
            <p className="mt-1 font-sans text-xs text-red-400">{errors.password}</p>
          )}
        </div>

        {/* Country */}
        <div className="space-y-1">
          <input
            id="country"
            name="country"
            type="text"
            placeholder="country"
            onChange={handleChange}
            value={formData.country}
            className={`w-full bg-white/5 backdrop-blur-md rounded-lg px-4 py-3.5 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30 transition-all duration-200 shadow-lg font-sans text-sm ${
              errors.country ? "ring-2 ring-red-500" : ""
            }`}
            required
          />
          {errors.country && (
            <p className="mt-1 font-sans text-xs text-red-400">{errors.country}</p>
          )}
        </div>

        {/* City */}
        <div className="space-y-1">
          <input
            id="city"
            name="city"
            type="text"
            placeholder="city"
            onChange={handleChange}
            value={formData.city}
            className={`w-full bg-white/5 backdrop-blur-md rounded-lg px-4 py-3.5 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30 transition-all duration-200 shadow-lg font-sans text-sm ${
              errors.city ? "ring-2 ring-red-500" : ""
            }`}
            required
          />
          {errors.city && (
            <p className="mt-1 font-sans text-xs text-red-400">{errors.city}</p>
          )}
        </div>

        {/* Role Selection */}
        <div className="space-y-4">
          <div>
            <label className="block mb-3 font-sans text-sm text-zinc-300/80">
              Account Type
            </label>
            <div className="space-y-3">
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="role"
                  value="user"
                  checked={formData.role === "user"}
                  onChange={handleChange}
                  className="w-4 h-4 mr-3 accent-white"
                />
                <div>
                  <div className="font-sans text-sm text-white">Fan/Viewer</div>
                  <div className="font-sans text-xs text-zinc-400">Watch events and purchase tickets</div>
                </div>
              </label>
              
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="role"
                  value="creator"
                  checked={formData.role === "creator"}
                  onChange={handleChange}
                  className="w-4 h-4 mr-3 accent-white"
                />
                <div>
                  <div className="font-sans text-sm text-white">Creator</div>
                  <div className="font-sans text-xs text-zinc-400">Host events and manage content</div>
                </div>
              </label>
            </div>
          </div>

          {/* Admin option */}
          <div className="flex items-start">
            <input
              id="isAdmin"
              name="isAdmin"
              type="checkbox"
              checked={formData.isAdmin}
              onChange={handleChange}
              className="w-4 h-4 mt-1 mr-3 accent-zinc-400"
            />
            <label htmlFor="isAdmin" className="font-sans text-xs text-zinc-300/80">
              Sign up as admin (requires access code)
            </label>
          </div>

          {formData.isAdmin && (
            <div className="space-y-1">
              <input
                id="adminCode"
                name="adminCode"
                type="text"
                placeholder="Enter admin access code"
                value={formData.adminCode}
                onChange={handleChange}
                className={`w-full bg-white/5 backdrop-blur-md rounded-lg px-4 py-3.5 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30 shadow-lg font-sans text-sm ${
                  errors.adminCode ? "ring-2 ring-red-500" : ""
                }`}
                required={formData.isAdmin}
              />
              {errors.adminCode && (
                <p className="mt-1 font-sans text-xs text-red-400">
                  {errors.adminCode}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Consent */}
        <div className="space-y-4">
          <div className="flex items-start">
            <input
              id="consent"
              name="consent"
              type="checkbox"
              checked={formData.consent}
              onChange={handleChange}
              className="w-4 h-4 mt-1 mr-3 bg-transparent cursor-pointer accent-zinc-400"
              required
            />
            <label htmlFor="consent" className="font-sans text-xs leading-relaxed cursor-pointer select-none text-zinc-300/80">
              I agree to the{" "}
              <a href="/terms" className="underline transition-colors duration-200 hover:text-white">
                Terms of Service
              </a>{" "}
              and{" "}
              <a href="/privacy" className="underline transition-colors duration-200 hover:text-white">
                Privacy Policy
              </a>
            </label>
          </div>
          {errors.consent && (
            <p className="mt-1 font-sans text-xs text-red-400">{errors.consent}</p>
          )}

          <div className="flex items-start">
            <input
              id="updates"
              name="updates"
              type="checkbox"
              checked={formData.updates}
              onChange={handleChange}
              className="w-4 h-4 mt-1 mr-3 bg-transparent cursor-pointer accent-zinc-400"
            />
            <label htmlFor="updates" className="font-sans text-xs leading-relaxed cursor-pointer select-none text-zinc-300/80">
              Send me signals. I want updates on drops + events
            </label>
          </div>
        </div>

        {errors.submit && (
          <p className="font-sans text-xs text-center text-red-400">{errors.submit}</p>
        )}

        <button
          type="submit"
          className={`w-full bg-white text-black font-semibold py-3.5 rounded-lg hover:bg-white/90 transition-all duration-200 text-sm tracking-wider uppercase font-sans ${
            isSubmitting ? "opacity-75 cursor-not-allowed" : ""
          }`}
          disabled={isSubmitting}
        >
          {isSubmitting ? "Creating Account..." : "Join Drip"}
        </button>

        <div className="mt-4 text-center">
          <span className="font-sans text-xs text-zinc-300/80">
            Already have an account?{" "}
          </span>
          <a href="/login" className="font-sans text-xs font-bold text-white hover:underline">
            Log in
          </a>
        </div>
      </form>
    </div>
  );
}

export default SignupForm;