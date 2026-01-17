"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Shield, Mail, Lock, User } from "lucide-react";
import { supabase } from "@/lib/supabase/client";

export default function SignupPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    agreeToGuidelines: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Optimized validation function
  const validateForm = useCallback(() => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.fullName.trim()) {
      newErrors.fullName = "Full name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    if (!formData.agreeToGuidelines) {
      newErrors.guidelines = "Please agree to the community safety guidelines";
    }

    return newErrors;
  }, [formData]);

  // Optimized form submission
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Fast validation
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      const { error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName,
            created_at: new Date().toISOString(),
            avatar_url: null,
          },
          emailRedirectTo: `${window.location.origin}/login?verified=true`,
        },
      });

      if (error) {
        // Fast error handling
        if (error.message.toLowerCase().includes("already")) {
          setErrors({ email: "Email already exists. Please login." });
        } else if (error.message.toLowerCase().includes("rate limit")) {
          setErrors({ general: "Too many attempts. Please wait." });
        } else {
          setErrors({ general: error.message });
        }
        setLoading(false);
        return;
      }

      // Immediate redirect with optimistic update
      router.push("/login?message=Account created. Check your email.");
      
    } catch (error) {
      console.error("Signup error:", error);
      setErrors({
        general: "Something went wrong. Please try again.",
      });
      setLoading(false);
    }
  }, [formData, validateForm, router]);

  // Optimized input change handler
  const handleChange = useCallback((
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value, type, checked } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    // Clear error for this field immediately
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  }, [errors]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header - Optimized for fast rendering */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center h-16 w-16 bg-emerald-600 rounded-2xl mb-4">
            <Shield className="h-9 w-9 text-white" />
          </div>
          <h1 className="text-3xl text-gray-900 mb-2">
            Join Banzara
          </h1>
          <p className="text-gray-600">
            Share experiences. Travel smarter. Stay safe.
          </p>
        </div>

        {/* Signup Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
          {/* Quick error display */}
          {errors.general && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800 text-center">
                {errors.general}
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Full Name - Optimized */}
            <div>
              <label className="block text-sm text-gray-700 mb-2">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  required
                  placeholder="Your full name"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-colors"
                  autoComplete="name"
                />
              </div>
              {errors.fullName && (
                <p className="text-sm text-red-600 mt-1">
                  {errors.fullName}
                </p>
              )}
            </div>

            {/* Email - Optimized */}
            <div>
              <label className="block text-sm text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="you@example.com"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-colors"
                  autoComplete="email"
                />
              </div>
              {errors.email && (
                <p className="text-sm text-red-600 mt-1">
                  {errors.email}
                </p>
              )}
            </div>

            {/* Password - Optimized */}
            <div>
              <label className="block text-sm text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  placeholder="Minimum 8 characters"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-colors"
                  autoComplete="new-password"
                />
              </div>
              {errors.password && (
                <p className="text-sm text-red-600 mt-1">
                  {errors.password}
                </p>
              )}
            </div>

            {/* Confirm Password - Optimized */}
            <div>
              <label className="block text-sm text-gray-700 mb-2">
                Confirm Password
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                placeholder="Re-enter password"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-colors"
                autoComplete="new-password"
              />
              {errors.confirmPassword && (
                <p className="text-sm text-red-600 mt-1">
                  {errors.confirmPassword}
                </p>
              )}
            </div>

            {/* Agreement Checkbox - Optimized */}
            <div className="flex items-start space-x-3">
              <input
                type="checkbox"
                name="agreeToGuidelines"
                checked={formData.agreeToGuidelines}
                onChange={handleChange}
                className="mt-1 h-4 w-4 accent-emerald-600 cursor-pointer"
                id="guidelines-checkbox"
              />
              <label htmlFor="guidelines-checkbox" className="text-sm text-gray-700 cursor-pointer select-none">
                I agree to Banzara's{" "}
                <Link
                  href="/guidelines"
                  className="text-emerald-600 hover:text-emerald-700 font-medium"
                  prefetch={false}
                >
                  community safety guidelines
                </Link>
              </label>
            </div>

            {errors.guidelines && (
              <p className="text-sm text-red-600">
                {errors.guidelines}
              </p>
            )}

            {/* Submit Button - Optimized loading state */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors ${
                loading ? 'opacity-80 cursor-not-allowed' : ''
              }`}
            >
              {loading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Creating account...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center space-x-2">
                  <Shield className="h-5 w-5" />
                  <span>Create Account</span>
                </div>
              )}
            </button>
          </form>
        </div>

        {/* Login link - Optimized */}
        <p className="text-center mt-6 text-gray-600">
          Already have an account?{" "}
          <Link
            href="/login"
            className="text-emerald-600 hover:text-emerald-700 font-medium transition-colors"
            prefetch={true}
          >
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}