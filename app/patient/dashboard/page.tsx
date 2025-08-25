'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/Toast';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { PatientLayout } from '@/components/layout/PatientLayout';
import { CircularProgress } from '@/components/charts/SimpleChart';
import { ActivityFeed, generatePatientActivities } from '@/components/dashboard/ActivityFeed';
import { QuickActions, generatePatientQuickActions } from '@/components/dashboard/QuickActions';
import { Patient, Record, Consent, AuditLog, Prescription, Doctor } from '@/types';
import { findItemBy, filterItems } from '@/utils/storage';
import { logAudit } from '@/utils/audit';
import { 
  User, 
  FileText, 
  Shield, 
  Activity, 
  Calendar, 
  TrendingUp, 
  Heart, 
  Users, 
  Plus, 
  Clock, 
  BarChart3, 
  ArrowRight,
  Stethoscope,
  Brain,
  Wind,
  Pill,
  AlertCircle,
  CheckCircle,
  Droplets,
  Zap,
  Target,
  LogOut,
  Settings,
  ChevronDown
} from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function PatientDashboard() {
  const { session, isLoading, logout } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [records, setRecords] = useState<Record[]>([]);
  const [consents, setConsents] = useState<Consent[]>([]);
  const [audits, setAudits] = useState<AuditLog[]>([]);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [recentPrescriptions, setRecentPrescriptions] = useState<Prescription[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (profileDropdownOpen && !target.closest('.profile-dropdown')) {
        setProfileDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [profileDropdownOpen]);

  useEffect(() => {
    if (!isLoading && (!session || session.role !== 'PATIENT')) {
      router.push('/patient/login');
      return;
    }

    if (session) {
      const patientData = findItemBy<Patient>('patients', p => p.userId === session.userId);
      if (patientData) {
        setPatient(patientData);
        setRecords(patientData.records || []);
        
        const patientConsents = filterItems<Consent>('consents', c => c.patientId === patientData.id);
        setConsents(patientConsents);
        
        const patientAudits = filterItems<AuditLog>('audits', a => a.userId === session.userId);
        setAudits(patientAudits);
        
        // Get recent prescriptions (last 7 days)
        const allPrescriptions = filterItems<Prescription>('prescriptions', p => p.patientId === patientData.id);
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const recent = allPrescriptions.filter(p => new Date(p.createdAt) > sevenDaysAgo);
        setRecentPrescriptions(recent);
        
        // Get doctors data
        const allDoctors = JSON.parse(localStorage.getItem('doctors') || '[]');
        setDoctors(allDoctors);
      }
    }
  }, [session, isLoading, router]);

  const handleLogout = () => {
    logout();
    showToast('success', 'Logged out successfully');
    router.push('/');
  };

  const dashboardQuickActions = [
    {
      id: 'view-records',
      title: 'Health Records',
      description: 'View and manage your medical records',
      icon: <FileText className="w-6 h-6 text-white" />,
      color: 'bg-blue-500',
      onClick: () => router.push('/patient/dashboard/records')
    },
    {
      id: 'family-data',
      title: 'Family Data',
      description: 'Manage family medical history',
      icon: <Users className="w-6 h-6 text-white" />,
      color: 'bg-purple-500',
      onClick: () => router.push('/patient/dashboard/family')
    },
    {
      id: 'qr-access',
      title: 'QR & Access',
      description: 'Generate QR codes and manage permissions',
      icon: <Shield className="w-6 h-6 text-white" />,
      color: 'bg-indigo-500',
      onClick: () => router.push('/patient/dashboard/qr-access')
    }
  ];

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto mb-4"></div>
            <Heart className="w-6 h-6 text-red-500 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
          </div>
          <p className="text-blue-700 font-medium text-lg">Loading your health dashboard...</p>
          <p className="text-blue-500 text-sm mt-2">Preparing your medical overview</p>
        </div>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
        <div className="text-center">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-10 h-10 text-red-500" />
          </div>
          <p className="text-gray-700 font-medium text-lg">Patient data not found</p>
          <p className="text-gray-500 text-sm mt-2">Please contact support if this issue persists</p>
        </div>
      </div>
    );
  }

  return (
    <PatientLayout patient={patient}>
      <div className="max-w-7xl bg-gradient-to-br from-orange-50 via-white to-orange-50 min-h-screen">
        {/* Header */}
        <div className="mb-8 p-6 bg-white rounded-xl shadow-sm border border-orange-100">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2 flex items-center">
                <Stethoscope className="w-8 h-8 text-orange-600 mr-3" />
                Good Morning, {patient.profile.name}
              </h1>
              <p className="text-orange-600 font-medium">You have a healthy day ahead • {new Date().toLocaleDateString()}</p>
            </div>
            <div className="hidden md:flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm text-gray-500">HCID</p>
                <p className="font-mono text-sm font-semibold text-orange-700">{patient.hcid}</p>
              </div>
              <div className="relative profile-dropdown">
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-shadow focus:outline-none focus:ring-2 focus:ring-orange-300"
                >
                  <User className="w-8 h-8 text-white" />
                </button>
                
                {profileDropdownOpen && (
                  <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900">{patient.profile.name}</p>
                      <p className="text-xs text-gray-500">{session?.email}</p>
                    </div>
                    
                    <button
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        // Add settings navigation here if needed
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                    >
                      <Settings className="w-4 h-4" />
                      <span>Settings</span>
                    </button>
                    
                    <button
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        handleLogout();
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Logout</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Patient Body Analysis - Main Feature */}
        <div className="mb-8">
          <div className="grid lg:grid-cols-4 gap-6">
            {/* Main Health Metrics */}
            <div className="lg:col-span-3">
              <Card className="bg-white shadow-lg border-0">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <BarChart3 className="w-6 h-6 text-orange-600" />
                      <h3 className="text-xl font-semibold text-gray-800">Patient Body Analysis</h3>
                      <span className="bg-orange-100 text-orange-700 text-xs px-2 py-1 rounded-full">Real Time</span>
                    </div>
                    
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Health Metrics in Horizontal Sequence */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    {/* Glucose Level */}
                    <div className="bg-gradient-to-r from-red-50 to-pink-50 p-4 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-600">Glucose</span>
                        <span className="text-xs text-gray-500">Goal</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="text-xl font-bold text-red-600">127</div>
                        <div className="text-xs text-gray-500">mg/dl</div>
                      </div>
                      <div className="text-xs text-red-600 font-medium">125mg/dl</div>
                      <div className="w-full bg-red-200 rounded-full h-2 mt-2">
                        <div className="bg-red-500 h-2 rounded-full" style={{width: '85%'}}></div>
                      </div>
                    </div>

                    {/* Cholesterol Level */}
                    <div className="bg-gradient-to-r from-orange-50 to-orange-100 p-4 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-600">Cholesterol</span>
                        <span className="text-xs text-gray-500">Goal</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="text-xl font-bold text-orange-600">164</div>
                        <div className="text-xs text-gray-500">mg/dl</div>
                      </div>
                      <div className="text-xs text-orange-600 font-medium">160mg/dl</div>
                      <div className="w-full bg-orange-200 rounded-full h-2 mt-2">
                        <div className="bg-orange-500 h-2 rounded-full" style={{width: '92%'}}></div>
                      </div>
                    </div>

                    {/* Paracetamol */}
                    <div className="bg-gradient-to-r from-purple-50 to-indigo-50 p-4 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-600">Paracetamol</span>
                        <span className="text-xs text-gray-500">Goal</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="text-xl font-bold text-purple-600">35</div>
                        <div className="text-xs text-gray-500">mg</div>
                      </div>
                      <div className="text-xs text-purple-600 font-medium">40mg/day</div>
                      <div className="w-full bg-purple-200 rounded-full h-2 mt-2">
                        <div className="bg-purple-500 h-2 rounded-full" style={{width: '70%'}}></div>
                      </div>
                    </div>

                    {/* Heart Rate */}
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <Heart className="w-4 h-4 text-red-500" />
                        <span className="text-xs text-gray-500">BPM</span>
                      </div>
                      <div className="text-xl font-bold text-gray-800 mb-1">120</div>
                      <div className="text-xs text-green-600 font-medium">Normal</div>
                      <div className="flex space-x-1 mt-2">
                        {[1,2,3,4,5,6,7,8].map((i) => (
                          <div key={i} className={`w-1 bg-red-400 rounded-full`} style={{height: `${Math.random() * 20 + 10}px`}}></div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Side Panel */}
            <div className="space-y-6">
              {/* Health Status Summary */}
              <Card className="bg-gradient-to-br from-orange-50 to-orange-100 shadow-lg border-0">
                <CardHeader className="pb-3">
                  <h3 className="font-semibold text-gray-800 flex items-center">
                    <CheckCircle className="w-5 h-5 text-orange-500 mr-2" />
                    Health Overview
                  </h3>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm text-gray-600">Overall Health</span>
                    </div>
                    <span className="text-sm font-semibold text-green-600">Excellent</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                      <span className="text-sm text-gray-600">Blood Pressure</span>
                    </div>
                    <span className="text-sm font-semibold text-orange-600">Monitor</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span className="text-sm text-gray-600">Medication</span>
                    </div>
                    <span className="text-sm font-semibold text-blue-600">On Track</span>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Prescriptions Notification */}
              
            </div>
          </div>
        </div>

        {/* Health Summary Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {/* Vital Signs */}
          <Card className="bg-gradient-to-br from-red-50 to-pink-50 border-0 shadow-lg hover:shadow-xl transition-all">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                  <Heart className="w-5 h-5 text-red-600" />
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-red-600">Normal</div>
                  <div className="text-xs text-red-500">120/80</div>
                </div>
              </div>
              <div className="text-sm font-medium text-gray-700">Vital Signs</div>
              <div className="text-xs text-gray-500">Blood pressure within range</div>
            </CardContent>
          </Card>

          {/* Health Records */}
          <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-0 shadow-lg hover:shadow-xl transition-all">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <FileText className="w-5 h-5 text-blue-600" />
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-blue-600">{records.length}</div>
                  <div className="text-xs text-blue-500">Records</div>
                </div>
              </div>
              <div className="text-sm font-medium text-gray-700">Health Records</div>
              <div className="text-xs text-gray-500">
                {records.length > 0 ? `Latest: ${records[records.length - 1]?.type}` : 'No records yet'}
              </div>
            </CardContent>
          </Card>

          {/* Medications */}
          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-0 shadow-lg hover:shadow-xl transition-all">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <Pill className="w-5 h-5 text-green-600" />
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-green-600">3</div>
                  <div className="text-xs text-green-500">Active</div>
                </div>
              </div>
              <div className="text-sm font-medium text-gray-700">Medications</div>
              <div className="text-xs text-gray-500">All medications on schedule</div>
            </CardContent>
          </Card>

          {/* Health Score */}
          <Card className="bg-gradient-to-br from-purple-50 to-indigo-50 border-0 shadow-lg hover:shadow-xl transition-all">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-purple-600" />
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-purple-600">85%</div>
                  <div className="text-xs text-purple-500">Excellent</div>
                </div>
              </div>
              <div className="text-sm font-medium text-gray-700">Health Score</div>
              <div className="text-xs text-gray-500">Above average wellness</div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity & Stats */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Recent Activity */}
          <div>
            <Card className="bg-white shadow-lg border-0">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                    <Activity className="w-5 h-5 text-orange-600 mr-2" />
                    Recent Activity
                  </h3>
                  <Button variant="secondary" size="sm">View All</Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <FileText className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-700">New health record added</div>
                      <div className="text-xs text-gray-500">Blood test results uploaded</div>
                    </div>
                    <div className="text-xs text-gray-400">2h ago</div>
                  </div>
                  
                  <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-700">Medication taken</div>
                      <div className="text-xs text-gray-500">Morning dose completed</div>
                    </div>
                    <div className="text-xs text-gray-400">4h ago</div>
                  </div>

                  <div className="flex items-center space-x-3 p-3 bg-purple-50 rounded-lg">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                      <Users className="w-4 h-4 text-purple-600" />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-700">Family history updated</div>
                      <div className="text-xs text-gray-500">Added parent medical information</div>
                    </div>
                    <div className="text-xs text-gray-400">1d ago</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Health Stats */}
          <div>
            {/* Quick Stats */}
            <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-0 shadow-lg">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-orange-600 mb-2">{audits.length + 15}</div>
                <div className="text-sm font-medium text-gray-700 mb-1">Total Health Points</div>
                <div className="text-xs text-gray-500">Keep up the great work!</div>
                <div className="mt-3">
                  <div className="w-full bg-orange-200 rounded-full h-2">
                    <div className="bg-orange-500 h-2 rounded-full" style={{width: '75%'}}></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </PatientLayout>
  );
}