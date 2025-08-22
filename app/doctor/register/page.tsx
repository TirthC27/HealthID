'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useToast } from '@/components/ui/Toast';
import { useAuth } from '@/contexts/AuthContext';
import { registerUser, createSession, generateId } from '@/utils/auth';
import { pushItem } from '@/utils/storage';
import { logAudit } from '@/utils/audit';
import { Doctor } from '@/types';
import { Stethoscope, Sparkles, Heart, Shield, Activity, ArrowLeft, UserCheck, GraduationCap } from 'lucide-react';

export default function DoctorRegister() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    specialty: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { showToast } = useToast();
  const { refreshSession } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      showToast('error', 'Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      showToast('error', 'Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);
    
    try {
      // Register user
      const user = registerUser(formData.email, formData.password, 'DOCTOR');
      
      // Create doctor profile
      const doctor: Doctor = {
        id: generateId(),
        userId: user.id,
        name: formData.name,
        specialty: formData.specialty
      };
      
      pushItem('doctors', doctor);
      
      // Log audit
      logAudit(user.id, 'LOGIN', 'Doctor account created and logged in');
      
      // Create session
      createSession(user);
      refreshSession();
      
      showToast('success', 'Account created successfully!');
      router.push('/doctor/dashboard');
    } catch (error) {
      showToast('error', error instanceof Error ? error.message : 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoFill = () => {
    setFormData({
      name: 'Dr. Priya Sharma',
      email: 'dr.priya.sharma@hospital.com',
      password: 'doctor123',
      confirmPassword: 'doctor123',
      specialty: 'Cardiology'
    });
    showToast('info', 'Demo doctor data filled! Ready to register.');
  };

  return (
    <div className="h-screen bg-gradient-to-br from-orange-50 via-white to-orange-100 flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 items-center justify-center p-8">
        <div className="max-w-md">
          <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center mb-6">
            <GraduationCap className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Join Medical Network
          </h1>
          <p className="text-gray-600 mb-6">
            Create your doctor account to start practicing digitally and connect with patients through our secure healthcare platform.
          </p>
          <div className="flex space-x-2">
            <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
            <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
            <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
          </div>
        </div>
      </div>

      {/* Right Side - Register Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="text-center mb-6">
            <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <UserCheck className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Create Doctor Account</h2>
            <p className="text-gray-600">Join our healthcare network</p>
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
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Dr. Your Full Name"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Professional Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="doctor@hospital.com"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Medical Specialty
                  </label>
                  <input
                    type="text"
                    value={formData.specialty}
                    onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
                    placeholder="e.g., Cardiology, Pediatrics"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Password
                    </label>
                    <input
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      placeholder="Password"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Confirm Password
                    </label>
                    <input
                      type="password"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      placeholder="Confirm"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all"
                      required
                    />
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
                      <span>Creating Account...</span>
                    </div>
                  ) : (
                    'Create Doctor Account'
                  )}
                </Button>
              </form>
              
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="text-center space-y-2">
                  <p className="text-sm text-gray-600">
                    Already have an account?{' '}
                    <Link href="/doctor/login" className="text-orange-600 hover:text-orange-700 font-medium">
                      Sign in here
                    </Link>
                  </p>
                  <div className="flex justify-center space-x-4 text-xs text-gray-500">
                    <Link href="/patient/register" className="hover:text-gray-700">
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