'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { PatientLayout } from '@/components/layout/PatientLayout';
import { HealthMetrics } from '@/components/charts/HealthMetrics';
import { SimpleBarChart, CircularProgress, DonutChart } from '@/components/charts/SimpleChart';
import { Patient, Record } from '@/types';
import { findItemBy } from '@/utils/storage';
import { TrendingUp, BarChart3, PieChart, Activity, Calendar, Target } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function AnalyticsPage() {
  const { session, isLoading } = useAuth();
  const router = useRouter();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [records, setRecords] = useState<Record[]>([]);

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
      }
    }
  }, [session, isLoading, router]);

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  if (!patient) {
    return <div className="flex justify-center items-center h-screen">Patient data not found</div>;
  }

  // Generate sample health data for charts
  const healthTrendData = [
    { label: 'Jan', value: 85, color: 'bg-blue-500' },
    { label: 'Feb', value: 92, color: 'bg-green-500' },
    { label: 'Mar', value: 78, color: 'bg-yellow-500' },
    { label: 'Apr', value: 96, color: 'bg-purple-500' },
    { label: 'May', value: 89, color: 'bg-indigo-500' },
    { label: 'Jun', value: 94, color: 'bg-pink-500' }
  ];

  const recordTypeData = [
    { label: 'Blood Tests', value: records.filter(r => r.type.toLowerCase().includes('blood')).length || 3, color: '#EF4444' },
    { label: 'X-Rays', value: records.filter(r => r.type.toLowerCase().includes('x-ray')).length || 2, color: '#3B82F6' },
    { label: 'Prescriptions', value: records.filter(r => r.type.toLowerCase().includes('prescription')).length || 4, color: '#10B981' },
    { label: 'Checkups', value: records.filter(r => r.type.toLowerCase().includes('checkup')).length || 1, color: '#F59E0B' }
  ];

  const monthlyActivityData = [
    { label: 'Jul', value: 12, color: 'bg-blue-500' },
    { label: 'Aug', value: 8, color: 'bg-green-500' },
    { label: 'Sep', value: 15, color: 'bg-purple-500' },
    { label: 'Oct', value: 22, color: 'bg-orange-500' },
    { label: 'Nov', value: 18, color: 'bg-red-500' },
    { label: 'Dec', value: 25, color: 'bg-indigo-500' }
  ];

  return (
    <PatientLayout patient={patient}>
      <div className="max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Health Analytics</h1>
          <p className="text-gray-600">Visualize your health trends and insights</p>
        </div>

        {/* Health Metrics */}
        <div className="mb-8">
          <HealthMetrics />
        </div>

        {/* Charts Grid */}
        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          {/* Health Score Trends */}
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-3">
                <TrendingUp className="w-6 h-6 text-green-600" />
                <h3 className="text-xl font-semibold">Health Score Trends</h3>
              </div>
            </CardHeader>
            <CardContent>
              <SimpleBarChart 
                data={healthTrendData}
                title=""
                height={250}
              />
              <div className="mt-4 text-sm text-gray-600">
                <p>Your health score has improved by 12% over the last 6 months</p>
              </div>
            </CardContent>
          </Card>

          {/* Monthly Activity */}
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-3">
                <BarChart3 className="w-6 h-6 text-blue-600" />
                <h3 className="text-xl font-semibold">Monthly Activity</h3>
              </div>
            </CardHeader>
            <CardContent>
              <SimpleBarChart 
                data={monthlyActivityData}
                title=""
                height={250}
              />
              <div className="mt-4 text-sm text-gray-600">
                <p>Healthcare activities and record updates per month</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Progress Circles */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <Target className="w-6 h-6 text-green-500" />
                <h3 className="text-lg font-semibold">Overall Health</h3>
              </div>
              <div className="flex items-center justify-center">
                <CircularProgress 
                  percentage={85}
                  label="Health Score"
                  value="85/100"
                  color="#10B981"
                  size={120}
                />
              </div>
              <p className="text-sm text-gray-600 text-center mt-4">
                Excellent progress towards optimal health
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <Activity className="w-6 h-6 text-blue-500" />
                <h3 className="text-lg font-semibold">Activity Level</h3>
              </div>
              <div className="flex items-center justify-center">
                <CircularProgress 
                  percentage={72}
                  label="Activity"
                  value="72%"
                  color="#3B82F6"
                  size={120}
                />
              </div>
              <p className="text-sm text-gray-600 text-center mt-4">
                Good activity level, room for improvement
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <Calendar className="w-6 h-6 text-purple-500" />
                <h3 className="text-lg font-semibold">Compliance</h3>
              </div>
              <div className="flex items-center justify-center">
                <CircularProgress 
                  percentage={94}
                  label="Compliance"
                  value="94%"
                  color="#8B5CF6"
                  size={120}
                />
              </div>
              <p className="text-sm text-gray-600 text-center mt-4">
                Excellent medication and appointment compliance
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Record Distribution */}
        <div className="grid lg:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-3">
                <PieChart className="w-6 h-6 text-purple-600" />
                <h3 className="text-xl font-semibold">Records by Type</h3>
              </div>
            </CardHeader>
            <CardContent>
              <DonutChart 
                data={recordTypeData}
                title=""
                centerText={`${records.length} Total`}
              />
            </CardContent>
          </Card>

          {/* Health Insights */}
          <Card>
            <CardHeader>
              <h3 className="text-xl font-semibold">Health Insights</h3>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <h4 className="font-semibold text-green-900 mb-2">Positive Trends</h4>
                  <ul className="text-sm text-green-800 space-y-1">
                    <li>• Health score trending upward</li>
                    <li>• Consistent record keeping</li>
                    <li>• Good medication compliance</li>
                  </ul>
                </div>
                
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h4 className="font-semibold text-blue-900 mb-2">Recommendations</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Increase physical activity</li>
                    <li>• Schedule regular checkups</li>
                    <li>• Monitor family health history</li>
                  </ul>
                </div>
                
                <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                  <h4 className="font-semibold text-yellow-900 mb-2">Watch Points</h4>
                  <ul className="text-sm text-yellow-800 space-y-1">
                    <li>• Blood pressure levels</li>
                    <li>• Cholesterol tracking</li>
                    <li>• Stress management</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PatientLayout>
  );
}
