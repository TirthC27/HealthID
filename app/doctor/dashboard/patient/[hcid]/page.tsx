'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/Toast';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { DoctorLayout } from '@/components/layout/DoctorLayout';
import { Doctor, Patient, Prescription, Consent } from '@/types';
import { findItemBy, pushItem, filterItems } from '@/utils/storage';
import { generateId } from '@/utils/auth';
import { logAudit } from '@/utils/audit';
import { 
  User, 
  FileText, 
  Users, 
  Pill, 
  Calendar,
  Clock,
  Heart,
  Activity,
  TrendingUp,
  Plus,
  X,
  CheckCircle,
  AlertCircle,
  Sparkles,
  ArrowLeft,
  Shield
} from 'lucide-react';
import { useRouter, useParams } from 'next/navigation';

export default function PatientDetailPage() {
  const { session, isLoading } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();
  const params = useParams();
  const hcid = params.hcid as string;
  
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [patient, setPatient] = useState<Patient | null>(null);
  const [patientConsent, setPatientConsent] = useState<Consent | null>(null);
  const [showPrescriptionForm, setShowPrescriptionForm] = useState(false);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [newPrescription, setNewPrescription] = useState({
    medications: [{ name: '', dose: '', duration: '' }]
  });

  useEffect(() => {
    if (!isLoading && (!session || session.role !== 'DOCTOR')) {
      router.push('/doctor/login');
      return;
    }

    if (session && hcid) {
      const doctorData = findItemBy<Doctor>('doctors', d => d.userId === session.userId);
      if (doctorData) {
        setDoctor(doctorData);
        
        // Find patient by HCID
        const patientData = findItemBy<Patient>('patients', p => p.hcid === hcid);
        if (patientData) {
          setPatient(patientData);
          
          // Check consent
          const consent = findItemBy<Consent>('consents', c => 
            c.patientId === patientData.id && 
            c.doctorId === doctorData.id && 
            c.status === 'ACTIVE' && 
            new Date(c.expiresAt) > new Date()
          );
          
          if (consent) {
            setPatientConsent(consent);
          } else {
            // Auto-grant consent for demo
            const newConsent: Consent = {
              id: generateId(),
              patientId: patientData.id,
              doctorId: doctorData.id,
              scopes: ['READ_RECORDS', 'WRITE_PRESCRIPTION'],
              expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
              createdAt: new Date().toISOString(),
              status: 'ACTIVE'
            };
            pushItem('consents', newConsent);
            setPatientConsent(newConsent);
          }
          
          // Load patient's prescriptions
          const patientPrescriptions = filterItems<Prescription>('prescriptions', p => p.patientId === patientData.id);
          setPrescriptions(patientPrescriptions);
        }
      }
    }
  }, [session, isLoading, router, hcid]);

  const addMedication = () => {
    setNewPrescription({
      medications: [...newPrescription.medications, { name: '', dose: '', duration: '' }]
    });
  };

  const updateMedication = (index: number, field: string, value: string) => {
    const updated = newPrescription.medications.map((med, i) => 
      i === index ? { ...med, [field]: value } : med
    );
    setNewPrescription({ medications: updated });
  };

  const removeMedication = (index: number) => {
    if (newPrescription.medications.length > 1) {
      const updated = newPrescription.medications.filter((_, i) => i !== index);
      setNewPrescription({ medications: updated });
    }
  };

  const handlePrescriptionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!patient || !doctor || !session) return;

    const prescription: Prescription = {
      id: generateId(),
      patientId: patient.id,
      doctorId: doctor.id,
      meds: newPrescription.medications.filter(med => med.name.trim() !== ''),
      createdAt: new Date().toISOString()
    };

    pushItem('prescriptions', prescription);
    setPrescriptions([...prescriptions, prescription]);
    
    logAudit(session.userId, 'WRITE_PRESCRIPTION', `Prescribed medication for patient ${patient.hcid}`);
    setShowPrescriptionForm(false);
    setNewPrescription({ medications: [{ name: '', dose: '', duration: '' }] });
    showToast('success', 'Prescription saved successfully!');
  };

  const handleDemoPrescription = () => {
    setNewPrescription({
      medications: [
        { name: 'Lisinopril 10mg', dose: '1 tablet daily', duration: '30 days' },
        { name: 'Metformin 500mg', dose: '2 tablets daily', duration: '90 days' }
      ]
    });
    showToast('info', 'Demo prescription filled!');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  if (!doctor) {
    return <div className="flex justify-center items-center h-screen">Doctor data not found</div>;
  }

  if (!patient) {
    return (
      <DoctorLayout doctor={doctor}>
        <div className="flex justify-center items-center h-screen">
          <div className="text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Patient Not Found</h2>
            <p className="text-gray-600 mb-4">No patient found with HCID: {hcid}</p>
            <Button onClick={() => router.push('/doctor/dashboard')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </div>
        </div>
      </DoctorLayout>
    );
  }

  return (
    <DoctorLayout doctor={doctor}>
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50">
        {/* Header */}
        <div className="p-6 border-b border-orange-200 bg-gradient-to-r from-white to-orange-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button 
                onClick={() => router.push('/doctor/dashboard')}
                variant="secondary"
                size="sm"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                  <User className="w-8 h-8 text-orange-600 mr-3" />
                  {patient.profile.name}
                </h1>
                <p className="text-gray-600">HCID: {patient.hcid} • DOB: {patient.profile.dob} • {patient.profile.gender}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              {patientConsent && (
                <div className="flex items-center space-x-2 bg-green-100 px-3 py-1 rounded-full">
                  <Shield className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-medium text-green-700">Access Granted</span>
                </div>
              )}
              <Button 
                onClick={() => setShowPrescriptionForm(true)}
                className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700"
              >
                <Pill className="w-4 h-4 mr-2" />
                Write Prescription
              </Button>
            </div>
          </div>
        </div>

        <div className="p-6">
          {/* Patient Overview Stats */}
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            <Card className="bg-white shadow-lg border-0">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold text-blue-600 mb-1">
                      {patient.records ? patient.records.length : 0}
                    </div>
                    <p className="text-gray-600 text-sm">Medical Records</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <FileText className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white shadow-lg border-0">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold text-purple-600 mb-1">
                      {patient.parents ? patient.parents.length : 0}
                    </div>
                    <p className="text-gray-600 text-sm">Family Members</p>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Users className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white shadow-lg border-0">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold text-orange-600 mb-1">
                      {prescriptions.length}
                    </div>
                    <p className="text-gray-600 text-sm">Prescriptions</p>
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
                    <div className="text-2xl font-bold text-green-600 mb-1">Active</div>
                    <p className="text-gray-600 text-sm">Patient Status</p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <Activity className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Grid */}
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-6">
              {/* Medical Records */}
              <Card className="bg-white shadow-lg border-0">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <FileText className="w-6 h-6 text-blue-600" />
                    <h3 className="text-xl font-semibold">Medical Records</h3>
                  </div>
                </CardHeader>
                <CardContent>
                  {patient.records && patient.records.length > 0 ? (
                    <div className="space-y-4">
                      {patient.records.map((record, index) => (
                        <div key={index} className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-semibold text-blue-900">{record.type}</h4>
                            <span className="text-sm text-blue-600">{formatDate(record.date)}</span>
                          </div>
                          <p className="text-blue-800 text-sm">{record.description}</p>
                          {record.diagnosis && (
                            <div className="mt-2 p-2 bg-blue-100 rounded">
                              <p className="text-xs font-medium text-blue-900">Diagnosis:</p>
                              <p className="text-xs text-blue-800">{record.diagnosis}</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <h4 className="text-lg font-medium text-gray-900 mb-2">No Medical Records</h4>
                      <p className="text-gray-500">No medical records found for this patient</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Family History */}
              <Card className="bg-white shadow-lg border-0">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <Users className="w-6 h-6 text-purple-600" />
                    <h3 className="text-xl font-semibold">Family Medical History</h3>
                  </div>
                </CardHeader>
                <CardContent>
                  {patient.parents && patient.parents.length > 0 ? (
                    <div className="space-y-4">
                      {patient.parents.map((parent, index) => (
                        <div key={index} className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-semibold text-purple-900">{parent.name}</h4>
                            <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded-full text-xs font-medium">
                              {parent.relation}
                            </span>
                          </div>
                          <div className="space-y-1">
                            <p className="text-sm font-medium text-purple-800">Medical Conditions:</p>
                            <div className="flex flex-wrap gap-1">
                              {parent.conditions.diabetes && (
                                <span className="bg-red-100 text-red-700 px-2 py-1 rounded text-xs">Diabetes</span>
                              )}
                              {parent.conditions.hypertension && (
                                <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded text-xs">Hypertension</span>
                              )}
                              {parent.conditions.heartDisease && (
                                <span className="bg-red-100 text-red-700 px-2 py-1 rounded text-xs">Heart Disease</span>
                              )}
                              {parent.conditions.cancer && (
                                <span className="bg-pink-100 text-pink-700 px-2 py-1 rounded text-xs">Cancer</span>
                              )}
                              {parent.conditions.asthma && (
                                <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs">Asthma</span>
                              )}
                              {parent.conditions.other && (
                                <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">{parent.conditions.other}</span>
                              )}
                              {!Object.values(parent.conditions).some(condition => condition) && (
                                <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs">No known conditions</span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <h4 className="text-lg font-medium text-gray-900 mb-2">No Family History</h4>
                      <p className="text-gray-500">No family medical history available</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Prescriptions */}
              <Card className="bg-white shadow-lg border-0">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Pill className="w-6 h-6 text-orange-600" />
                      <h3 className="text-xl font-semibold">Prescriptions</h3>
                    </div>
                    <Button 
                      onClick={() => setShowPrescriptionForm(true)}
                      size="sm"
                      className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      New
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {prescriptions.length > 0 ? (
                    <div className="space-y-4">
                      {prescriptions.slice(-5).reverse().map((prescription) => (
                        <div key={prescription.id} className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="font-semibold text-orange-900">
                              Prescription #{prescription.id.slice(-6)}
                            </h4>
                            <span className="text-sm text-orange-600">{formatDate(prescription.createdAt)}</span>
                          </div>
                          <div className="space-y-2">
                            {prescription.meds.map((med, index) => (
                              <div key={index} className="bg-white p-2 rounded border">
                                <div className="font-medium text-gray-900 text-sm">{med.name}</div>
                                <div className="text-xs text-gray-600">
                                  <span className="font-medium">Dose:</span> {med.dose} • 
                                  <span className="font-medium ml-1">Duration:</span> {med.duration}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Pill className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <h4 className="text-lg font-medium text-gray-900 mb-2">No Prescriptions</h4>
                      <p className="text-gray-500">No prescriptions written for this patient yet</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Prescription Form Modal */}
        {showPrescriptionForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold">Write Prescription for {patient.profile.name}</h3>
                  <div className="flex items-center space-x-2">
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={handleDemoPrescription}
                      size="sm"
                      className="flex items-center space-x-1"
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>Demo</span>
                    </Button>
                    <Button variant="secondary" onClick={() => setShowPrescriptionForm(false)}>×</Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <form onSubmit={handlePrescriptionSubmit}>
                  <div className="space-y-4">
                    {newPrescription.medications.map((medication, index) => (
                      <div key={index} className="p-4 border border-gray-200 rounded-lg">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-medium">Medication {index + 1}</h4>
                          {newPrescription.medications.length > 1 && (
                            <Button
                              type="button"
                              variant="danger"
                              size="sm"
                              onClick={() => removeMedication(index)}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                        
                        <div className="grid md:grid-cols-3 gap-3">
                          <Input
                            label="Medication Name"
                            value={medication.name}
                            onChange={(value) => updateMedication(index, 'name', value)}
                            placeholder="e.g., Lisinopril 10mg"
                            required
                          />
                          
                          <Input
                            label="Dosage"
                            value={medication.dose}
                            onChange={(value) => updateMedication(index, 'dose', value)}
                            placeholder="e.g., 1 tablet daily"
                            required
                          />
                          
                          <Input
                            label="Duration"
                            value={medication.duration}
                            onChange={(value) => updateMedication(index, 'duration', value)}
                            placeholder="e.g., 30 days"
                            required
                          />
                        </div>
                      </div>
                    ))}
                    
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={addMedication}
                      className="w-full"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Another Medication
                    </Button>
                  </div>
                  
                  <div className="flex space-x-3 mt-6">
                    <Button type="submit" className="flex-1 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700">
                      Save Prescription
                    </Button>
                    <Button variant="secondary" onClick={() => setShowPrescriptionForm(false)}>Cancel</Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </DoctorLayout>
  );
}

