import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function LoginForm() {
  console.log("LoginForm rendered");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showResetMessage, setShowResetMessage] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e) => {
    console.log("LoginForm handleChange", e.target.name, e.target.value);
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});
    try {
      // Call backend API for login
      const response = await axios.post(
        `${process.env.REACT_APP_API_BASE.replace(/\/$/, "")}/users/login`,
        {
          email: formData.email,
          password: formData.password,
        }
      );
      // Save token/user info as needed (e.g., localStorage)
      localStorage.setItem("token", response.data.token);
      setShowSuccess(true);
      setFormData({ email: "", password: "" });
      setTimeout(() => setShowSuccess(false), 3000);
      // Redirect based on user role if available
      if (response.data.user && response.data.user.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/dashboard");
      }
    } catch (error) {
      let errorMsg = "An error occurred. Please try again.";
      if (error.response && error.response.data && error.response.data.error) {
        errorMsg = error.response.data.error;
      }
      setErrors({
        submit: errorMsg,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Remove the forgot password button or add a stub handler to prevent runtime error
  const handleForgotPassword = () => {
    setShowResetMessage(true);
    setTimeout(() => setShowResetMessage(false), 3000);
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
          <p className="font-sans text-base tracking-wider text-zinc-300/80">
            login
          </p>
        </div>

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
            autoComplete="email"
            required
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? "email-error" : undefined}
          />
          {errors.email && (
            <p id="email-error" className="mt-1 font-sans text-xs text-red-400">
              {errors.email}
            </p>
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
            className={`w-full bg-white/5 backdrop-blur-md rounded-lg px-4 py-3.5 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30 transition-all duration-200 shadow-lg font-sans text-sm ${
              errors.password ? "ring-2 ring-red-500" : ""
            }`}
            autoComplete="current-password"
            required
            aria-invalid={!!errors.password}
            aria-describedby={errors.password ? "password-error" : undefined}
          />
          {errors.password && (
            <p
              id="password-error"
              className="mt-1 font-sans text-xs text-red-400"
            >
              {errors.password}
            </p>
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
          <p className="font-sans text-xs text-center text-red-400">
            {errors.submit}
          </p>
        )}

        <button
          type="submit"
          className={`w-full bg-white text-black font-semibold py-3.5 rounded-lg hover:bg-white/90 transition-all duration-200 text-sm tracking-wider uppercase font-sans ${
            isLoading ? "opacity-75 cursor-not-allowed" : ""
          }`}
          disabled={isLoading}
        >
          {isLoading ? "Signing in..." : "Sign in"}
        </button>

        <div className="mt-4 text-center">
          <span className="font-sans text-xs text-zinc-300/80">
            Don't have an account?{" "}
          </span>
          <a
            href="/signup"
            className="font-sans text-xs font-bold text-white hover:underline"
          >
            Sign up
          </a>
        </div>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/10"></div>
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="px-2 bg-black text-zinc-300/80">
              or continue with
            </span>
          </div>
        </div>
      </form>
    </div>
  );
}

export default LoginForm;
