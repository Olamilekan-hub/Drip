import React, { useState } from "react";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth, db } from "../firebase/config";
import { doc, setDoc } from "firebase/firestore";

function SignupForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    country: "",
    city: "",
    consent: false,
    updates: false,
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

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
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      // Create user with Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      // Optionally update user profile with name
      await updateProfile(userCredential.user, { displayName: formData.name });
      // Store extra user data in Firestore
      await setDoc(doc(db, "users", userCredential.user.uid), {
        name: formData.name,
        email: formData.email,
        country: formData.country,
        city: formData.city,
        updates: formData.updates,
        createdAt: new Date().toISOString()
      });
      
      // Show success message
      setShowSuccess(true);
      // Clear form
      setFormData({ 
        name: "", 
        email: "", 
        password: "", 
        country: "", 
        city: "", 
        consent: false, 
        updates: false 
      });
      // Hide success message after 3 seconds
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (err) {
      console.error(err);
      let errorMsg = "Something went wrong. Please try again.";
      if (err.code === "auth/email-already-in-use") errorMsg = "Email is already in use.";
      if (err.code === "auth/invalid-email") errorMsg = "Invalid email address.";
      if (err.code === "auth/weak-password") errorMsg = "Password is too weak.";
      setErrors({ submit: errorMsg });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black relative overflow-hidden">
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
      {/* Video background with enhanced overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/70 z-10"></div>
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover z-0 opacity-70 pointer-events-none"
      >
        <source src="/blip3.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      {/* Success Toast */}
      {showSuccess && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-fade-in font-sans">
          Account created successfully! Welcome to Drip.live
        </div>
      )}

      <form 
        onSubmit={handleSubmit} 
        className="relative z-20 w-full max-w-md space-y-6 p-8 mt-8 md:mt-16"
        aria-label="Sign up form"
      >
        <div className="text-center mb-8 mt-6 w-full">
          <p className="text-zinc-300/80 text-base tracking-wider font-sans">join the frequency</p>
        </div>

        <div className="space-y-1">
          <input 
            id="name" 
            name="name" 
            type="text" 
            placeholder="name" 
            onChange={handleChange} 
            value={formData.name} 
            className={`w-full bg-white/5 backdrop-blur-md rounded-lg px-4 py-3.5 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30 transition-all duration-200 shadow-lg font-sans text-sm ${errors.name ? 'ring-2 ring-red-500' : ''}`}
            autoComplete="off" 
            required
            aria-invalid={!!errors.name}
            aria-describedby={errors.name ? "name-error" : undefined}
          />
          {errors.name && (
            <p id="name-error" className="text-red-400 text-xs mt-1 font-sans">{errors.name}</p>
          )}
        </div>

        <div className="space-y-1">
          <input 
            id="email" 
            name="email" 
            type="email" 
            placeholder="email address" 
            onChange={handleChange} 
            value={formData.email} 
            className={`w-full bg-white/5 backdrop-blur-md rounded-lg px-4 py-3.5 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30 transition-all duration-200 shadow-lg font-sans text-sm ${errors.email ? 'ring-2 ring-red-500' : ''}`}
            autoComplete="off" 
            required
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? "email-error" : undefined}
          />
          {errors.email && (
            <p id="email-error" className="text-red-400 text-xs mt-1 font-sans">{errors.email}</p>
          )}
        </div>

        <div className="space-y-1">
          <input 
            id="password" 
            name="password" 
            type="password" 
            placeholder="password" 
            onChange={handleChange} 
            value={formData.password} 
            className={`w-full bg-white/5 backdrop-blur-md rounded-lg px-4 py-3.5 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30 transition-all duration-200 shadow-lg font-sans text-sm ${errors.password ? 'ring-2 ring-red-500' : ''}`}
            autoComplete="off" 
            required
            aria-invalid={!!errors.password}
            aria-describedby={errors.password ? "password-error" : undefined}
          />
          {errors.password && (
            <p id="password-error" className="text-red-400 text-xs mt-1 font-sans">{errors.password}</p>
          )}
        </div>

        <div className="space-y-1">
          <input 
            id="country" 
            name="country" 
            type="text" 
            placeholder="country" 
            onChange={handleChange} 
            value={formData.country} 
            className={`w-full bg-white/5 backdrop-blur-md rounded-lg px-4 py-3.5 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30 transition-all duration-200 shadow-lg font-sans text-sm ${errors.country ? 'ring-2 ring-red-500' : ''}`}
            autoComplete="off" 
            required
            aria-invalid={!!errors.country}
            aria-describedby={errors.country ? "country-error" : undefined}
          />
          {errors.country && (
            <p id="country-error" className="text-red-400 text-xs mt-1 font-sans">{errors.country}</p>
          )}
        </div>

        <div className="space-y-1">
          <input 
            id="city" 
            name="city" 
            type="text" 
            placeholder="city" 
            onChange={handleChange} 
            value={formData.city} 
            className={`w-full bg-white/5 backdrop-blur-md rounded-lg px-4 py-3.5 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30 transition-all duration-200 shadow-lg font-sans text-sm ${errors.city ? 'ring-2 ring-red-500' : ''}`}
            autoComplete="off" 
            required
            aria-invalid={!!errors.city}
            aria-describedby={errors.city ? "city-error" : undefined}
          />
          {errors.city && (
            <p id="city-error" className="text-red-400 text-xs mt-1 font-sans">{errors.city}</p>
          )}
        </div>

        <div className="space-y-4">
          <div className="flex items-start">
            <input 
              id="consent" 
              name="consent" 
              type="checkbox" 
              checked={formData.consent} 
              onChange={handleChange} 
              className="accent-zinc-400 mr-3 mt-1 bg-transparent w-4 h-4 cursor-pointer" 
              required
              aria-invalid={!!errors.consent}
              aria-describedby={errors.consent ? "consent-error" : undefined}
            />
            <label htmlFor="consent" className="text-xs text-zinc-300/80 select-none cursor-pointer font-sans leading-relaxed">
              I agree to the{" "}
              <a href="/terms" className="underline hover:text-white transition-colors duration-200">Terms of Service</a>{" "}and{" "}
              <a href="/privacy" className="underline hover:text-white transition-colors duration-200">Privacy Policy</a>
            </label>
          </div>
          {errors.consent && (
            <p id="consent-error" className="text-red-400 text-xs mt-1 font-sans">{errors.consent}</p>
          )}

          <div className="flex items-start">
            <input 
              id="updates" 
              name="updates" 
              type="checkbox" 
              checked={formData.updates} 
              onChange={handleChange} 
              className="accent-zinc-400 mr-3 mt-1 bg-transparent w-4 h-4 cursor-pointer"
            />
            <label htmlFor="updates" className="text-xs text-zinc-300/80 select-none cursor-pointer font-sans leading-relaxed">
              Send me signals. I want updates on drops + events
            </label>
          </div>
        </div>

        {errors.submit && (
          <p className="text-red-400 text-xs text-center font-sans">{errors.submit}</p>
        )}

        <button 
          type="submit" 
          className={`w-full bg-white text-black font-semibold py-3.5 rounded-lg hover:bg-white/90 transition-all duration-200 text-sm tracking-wider uppercase font-sans ${
            isSubmitting ? 'opacity-75 cursor-not-allowed' : ''
          }`}
          disabled={isSubmitting}
        >
          Sign up
        </button>

        <div className="text-center mt-4">
          <span className="text-xs text-zinc-300/80 font-sans">Already have an account? </span>
          <a href="/login" className="text-xs font-bold text-white hover:underline font-sans">Log in</a>
        </div>
      </form>
    </div>
  );
}

export default SignupForm;
