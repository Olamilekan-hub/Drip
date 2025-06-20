import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  signInWithEmailAndPassword, 
  signInWithPopup, 
  GoogleAuthProvider,
  sendPasswordResetEmail
} from 'firebase/auth';
import { auth } from '../firebase/config';

function LoginForm() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showResetMessage, setShowResetMessage] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    try {
      await signInWithEmailAndPassword(auth, formData.email, formData.password);
      setShowSuccess(true);
      // Clear form
      setFormData({ email: '', password: '' });
      // Hide success message after 3 seconds
      setTimeout(() => setShowSuccess(false), 3000);
      if (userProfile?.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/dashboard");
      }
    } catch (error) {
      console.error('Login error:', error);
      setErrors({
        submit: error.code === 'auth/invalid-credential' 
          ? 'Invalid email or password' 
          : 'An error occurred. Please try again.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setErrors({});

    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
      if (userProfile?.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/dashboard");
      }
    } catch (error) {
      console.error('Google sign-in error:', error);
      setErrors({
        submit: 'Failed to sign in with Google. Please try again.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!formData.email) {
      setErrors({ email: 'Please enter your email address' });
      return;
    }

    try {
      await sendPasswordResetEmail(auth, formData.email);
      setShowResetMessage(true);
      setTimeout(() => setShowResetMessage(false), 5000);
    } catch (error) {
      console.error('Password reset error:', error);
      setErrors({
        submit: 'Failed to send reset email. Please try again.'
      });
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
      {/* Video background with enhanced overlay */}
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

      {/* Success Messages */}
      {showSuccess && (
        <div className="fixed z-50 px-6 py-3 font-sans text-white bg-green-500 rounded-lg shadow-lg top-4 right-4 animate-fade-in">
          Successfully logged in! Welcome back.
        </div>
      )}
      {showResetMessage && (
        <div className="fixed z-50 px-6 py-3 font-sans text-white bg-green-500 rounded-lg shadow-lg top-4 right-4 animate-fade-in">
          Password reset email sent. Please check your inbox.
        </div>
      )}

      <form 
        onSubmit={handleSubmit} 
        className="relative z-20 w-full max-w-md p-8 mt-8 space-y-6 md:mt-16"
        aria-label="Login form"
      >
        <div className="mt-6 mb-8 text-center">
          <p className="font-sans text-base tracking-wider text-zinc-300/80">login</p>
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
            autoComplete="email" 
            required
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? "email-error" : undefined}
          />
          {errors.email && (
            <p id="email-error" className="mt-1 font-sans text-xs text-red-400">{errors.email}</p>
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
            autoComplete="current-password" 
            required
            aria-invalid={!!errors.password}
            aria-describedby={errors.password ? "password-error" : undefined}
          />
          {errors.password && (
            <p id="password-error" className="mt-1 font-sans text-xs text-red-400">{errors.password}</p>
          )}
        </div>

        <div className="flex justify-end">
          <button
            type="button"
            onClick={handleForgotPassword}
            className="font-sans text-xs transition-colors duration-200 text-zinc-300/80 hover:text-white"
          >
            Forgot password?
          </button>
        </div>

        {errors.submit && (
          <p className="font-sans text-xs text-center text-red-400">{errors.submit}</p>
        )}

        <button 
          type="submit" 
          className={`w-full bg-white text-black font-semibold py-3.5 rounded-lg hover:bg-white/90 transition-all duration-200 text-sm tracking-wider uppercase font-sans ${
            isLoading ? 'opacity-75 cursor-not-allowed' : ''
          }`}
          disabled={isLoading}
        >
          {isLoading ? 'Signing in...' : 'Sign in'}
        </button>

        <div className="mt-4 text-center">
          <span className="font-sans text-xs text-zinc-300/80">Don't have an account? </span>
          <a href="/signup" className="font-sans text-xs font-bold text-white hover:underline">Sign up</a>
        </div>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/10"></div>
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="px-2 bg-black text-zinc-300/80">or continue with</span>
          </div>
        </div>

        <button 
          type="button"
          onClick={handleGoogleSignIn}
          className="w-full bg-white/5 text-white font-semibold py-3.5 rounded-lg hover:bg-white/10 transition-all duration-200 text-sm tracking-wider uppercase font-sans flex items-center justify-center space-x-2"
          disabled={isLoading}
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="currentColor"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="currentColor"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="currentColor"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          <span>Continue with Google</span>
        </button>
      </form>
    </div>
  );
}

export default LoginForm; 