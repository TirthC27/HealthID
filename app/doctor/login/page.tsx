'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useToast } from '@/components/ui/Toast';
import { useAuth } from '@/contexts/AuthContext';
import { loginUser, createSession } from '@/utils/auth';
import { logAudit } from '@/utils/audit';
import { Stethoscope, Sparkles, Heart, Shield, Activity, ArrowLeft, ArrowRight, LogIn, GraduationCap, Eye, EyeOff, Phone } from 'lucide-react';

export default function DoctorLogin() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const { showToast } = useToast();
  const { refreshSession } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
  
    try {
      // Call your backend API to verify doctor
      const res = await fetch("/api/auth/doctor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password, // optional if you want to keep
        }),
      });
  
      const data = await res.json();
  
      if (!res.ok) {
        showToast("error", data.error || "Login failed");
        return;
      }
  
      // Success: create session
      logAudit(data.doctor.id, "LOGIN", "Doctor logged in");
      createSession(data.doctor);
      refreshSession();
  
      showToast("success", "Welcome back!");
      router.push("/doctor/dashboard");
    } catch (error) {
      showToast("error", "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };
  

  const handleDemoFill = () => {
    setFormData({
      email: 'dr.priya.sharma@hospital.com',
      password: 'doctor123'
    });
    showToast('info', 'Demo doctor credentials filled! Click sign in to test.');
  };

  return (
    <div className="h-screen bg-gradient-to-br from-orange-50 via-white to-orange-100 flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 items-center justify-center p-8">
        <div className="max-w-md">
          <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center mb-6">
            <Stethoscope className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Doctor Portal
          </h1>
          <p className="text-gray-600 mb-6">
            Manage your medical practice, access patient records, and provide quality healthcare through our secure platform.
          </p>
          <div className="flex space-x-2">
            <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
            <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
            <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome Back, Doctor</h2>
            <p className="text-gray-600">Sign in to your medical practice</p>
          </div>

          <Card className="shadow-lg border-0">
            <CardContent className="p-6">
              <div className="flex justify-end mb-4">
                <button
                  type="button"
                  onClick={handleDemoFill}
                  className="flex items-center space-x-2 text-xs bg-orange-50 hover:bg-orange-100 text-orange-700 px-3 py-1 rounded-full transition-colors"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>Demo Fill</span>
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Professional Email
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="doctor@hospital.com"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      placeholder="Enter your password"
                      className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-lg font-medium transition-all"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                      <span>Signing in...</span>
                    </div>
                  ) : (
                    "Sign In"
                  )}
                </Button>
              </form>

              <div className="mt-6 pt-4 border-t border-gray-100">
                <div className="text-center space-y-2">
                  <p className="text-sm text-gray-600">
                    Don't have an account?{' '}
                    <Link href="/doctor/register" className="text-orange-600 hover:text-orange-700 font-medium">
                      Register here
                    </Link>
                  </p>
                  <div className="flex justify-center space-x-4 text-xs text-gray-500">
                    <Link href="/patient/login" className="hover:text-gray-700">
                      Patient Portal
                    </Link>
                    <span>•</span>
                    <Link href="/" className="hover:text-gray-700">
                      Home
                    </Link>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}