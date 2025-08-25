'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { PatientLayout } from '@/components/layout/PatientLayout';
import { Patient, Prescription, Doctor } from '@/types';
import { findItemBy, filterItems } from '@/utils/storage';
import { Pill, Calendar, User, Clock, Download, Search, Filter, AlertCircle, CheckCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function PrescriptionsPage() {
  const { session, isLoading } = useAuth();
  const router = useRouter();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'recent' | 'old'>('all');

  useEffect(() => {
    if (!isLoading && (!session || session.role !== 'PATIENT')) {
      router.push('/patient/login');
      return;
    }

    if (session) {
      const patientData = findItemBy<Patient>('patients', p => p.userId === session.userId);
      if (patientData) {
        setPatient(patientData);
        
        // Get all prescriptions for this patient
        const patientPrescriptions = filterItems<Prescription>('prescriptions', p => p.patientId === patientData.id);
        setPrescriptions(patientPrescriptions);
        
        // Get all doctors for doctor names
        const allDoctors = JSON.parse(localStorage.getItem('doctors') || '[]');
        setDoctors(allDoctors);
      }
    }
  }, [session, isLoading, router]);

  const getDoctorName = (doctorId: string) => {
    const doctor = doctors.find(d => d.id === doctorId);
    return doctor ? `Dr. ${doctor.name}` : 'Unknown Doctor';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const isRecentPrescription = (dateString: string) => {
    const prescriptionDate = new Date(dateString);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return prescriptionDate > thirtyDaysAgo;
  };

  const filteredPrescriptions = prescriptions
    .filter(prescription => {
      const matchesSearch = searchTerm === '' || 
        prescription.meds.some(med => 
          med.name.toLowerCase().includes(searchTerm.toLowerCase())
        ) ||
        getDoctorName(prescription.doctorId).toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesFilter = 
        filterStatus === 'all' ||
        (filterStatus === 'recent' && isRecentPrescription(prescription.createdAt)) ||
        (filterStatus === 'old' && !isRecentPrescription(prescription.createdAt));
      
      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  if (!patient) {
    return <div className="flex justify-center items-center h-screen">Patient data not found</div>;
  }

  return (
    <PatientLayout patient={patient}>
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50">
        {/* Header */}
        <div className="p-6 border-b border-orange-200 bg-gradient-to-r from-white to-orange-50">
          <div className="flex items-center space-x-3 mb-4">
            <Pill className="w-8 h-8 text-orange-600" />
            <h1 className="text-3xl font-bold text-gray-900">My Prescriptions</h1>
          </div>
          <p className="text-gray-600">View and manage your prescribed medications</p>
        </div>

        <div className="p-6">
          {/* Stats Cards */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <Card className="bg-white shadow-lg border-0">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold text-orange-600 mb-1">{prescriptions.length}</div>
                    <p className="text-gray-600 text-sm">Total Prescriptions</p>
                  </div>
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                    <Pill className="w-6 h-6 text-orange-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white shadow-lg border-0">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold text-green-600 mb-1">
                      {prescriptions.filter(p => isRecentPrescription(p.createdAt)).length}
                    </div>
                    <p className="text-gray-600 text-sm">Recent (30 days)</p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white shadow-lg border-0">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold text-orange-600 mb-1">
                      {prescriptions.reduce((total, p) => total + p.meds.length, 0)}
                    </div>
                    <p className="text-gray-600 text-sm">Total Medications</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Search and Filter */}
          <Card className="bg-white shadow-lg border-0 mb-6">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search prescriptions or doctors..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    variant={filterStatus === 'all' ? 'primary' : 'secondary'}
                    onClick={() => setFilterStatus('all')}
                    size="sm"
                    className={filterStatus === 'all' ? 'bg-orange-600 hover:bg-orange-700' : ''}
                  >
                    All
                  </Button>
                  <Button
                    variant={filterStatus === 'recent' ? 'primary' : 'secondary'}
                    onClick={() => setFilterStatus('recent')}
                    size="sm"
                    className={filterStatus === 'recent' ? 'bg-orange-600 hover:bg-orange-700' : ''}
                  >
                    Recent
                  </Button>
                  <Button
                    variant={filterStatus === 'old' ? 'primary' : 'secondary'}
                    onClick={() => setFilterStatus('old')}
                    size="sm"
                    className={filterStatus === 'old' ? 'bg-orange-600 hover:bg-orange-700' : ''}
                  >
                    Older
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Prescriptions List */}
          {filteredPrescriptions.length > 0 ? (
            <div className="grid gap-6">
              {filteredPrescriptions.map((prescription) => (
                <Card key={prescription.id} className="bg-white shadow-lg border-0 hover:shadow-xl transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                          <Pill className="w-5 h-5 text-orange-600" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            Prescription from {getDoctorName(prescription.doctorId)}
                          </h3>
                          <div className="flex items-center space-x-4 text-sm text-gray-600">
                            <div className="flex items-center space-x-1">
                              <Calendar className="w-4 h-4" />
                              <span>{formatDate(prescription.createdAt)}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Clock className="w-4 h-4" />
                              <span>{formatTime(prescription.createdAt)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {isRecentPrescription(prescription.createdAt) && (
                          <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                            Recent
                          </span>
                        )}
                        
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <h4 className="font-medium text-gray-900 mb-3">Medications:</h4>
                      {prescription.meds.map((med, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-orange-50 rounded-lg border border-orange-200">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                              <Pill className="w-4 h-4 text-orange-600" />
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">{med.name}</div>
                              <div className="text-sm text-gray-600">
                                <span className="font-medium">Dosage:</span> {med.dose} • 
                                <span className="font-medium ml-1">Duration:</span> {med.duration}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="bg-white shadow-lg border-0">
              <CardContent className="p-12 text-center">
                <Pill className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No prescriptions found</h3>
                <p className="text-gray-600 mb-6">
                  {searchTerm || filterStatus !== 'all' 
                    ? 'Try adjusting your search or filter criteria'
                    : 'You don\'t have any prescriptions yet. Visit a doctor to get your first prescription.'
                  }
                </p>
                {searchTerm || filterStatus !== 'all' ? (
                  <Button
                    onClick={() => {
                      setSearchTerm('');
                      setFilterStatus('all');
                    }}
                    className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700"
                  >
                    Clear Filters
                  </Button>
                ) : null}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </PatientLayout>
  );
}
