'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/Toast';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { DoctorLayout } from '@/components/layout/DoctorLayout';
import { QRScanner } from '@/components/QRScanner';
import { FamilyHistoryCard } from '@/components/FamilyHistoryCard';
import { ActivityFeed, generateDoctorActivities } from '@/components/dashboard/ActivityFeed';
import { Doctor, Patient, Consent, Prescription, Parent } from '@/types';
import { findItemBy, filterItems, pushItem, updateItem } from '@/utils/storage';
import { generateId } from '@/utils/auth';
import { logAudit } from '@/utils/audit';
import { Stethoscope, User, FileText, Pill, Search, Plus, Calendar, TrendingUp, Users, Clock, Sparkles, QrCode, Activity, Shield, UserCheck, CheckCircle, AlertCircle, Filter } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function DoctorDashboard() {
  const { session, isLoading } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [currentPatient, setCurrentPatient] = useState<Patient | null>(null);
  const [patientConsent, setPatientConsent] = useState<Consent | null>(null);
  const [hcidInput, setHcidInput] = useState('');
  const [showQRScanner, setShowQRScanner] = useState(false);
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

    if (session) {
      const doctorData = findItemBy<Doctor>('doctors', d => d.userId === session.userId);
      if (doctorData) {
        setDoctor(doctorData);
        const doctorPrescriptions = filterItems<Prescription>('prescriptions', p => p.doctorId === doctorData.id);
        setPrescriptions(doctorPrescriptions);
      }
    }
  }, [session, isLoading, router]);

  const handleHCIDSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const patient = findItemBy<Patient>('patients', p => p.hcid === hcidInput);
    if (!patient) {
      showToast('error', 'Patient not found with this HCID');
      return;
    }

    checkPatientConsent(patient);
  };

  const handleQRScan = (hcid: string) => {
    if (!session) return;

    const patient = findItemBy<Patient>('patients', p => p.hcid === hcid);
    if (!patient) {
      showToast('error', 'Patient not found');
      return;
    }

    logAudit(session.userId, 'QR_SCANNED', `Scanned QR for patient ${hcid}`);
    checkPatientConsent(patient);
    setShowQRScanner(false);
  };

  const checkPatientConsent = (patient: Patient) => {
    if (!doctor) return;

    const consent = findItemBy<Consent>('consents', c => 
      c.patientId === patient.id && 
      c.doctorId === doctor.id && 
      c.status === 'ACTIVE' && 
      new Date(c.expiresAt) > new Date()
    );

    if (consent) {
      setCurrentPatient(patient);
      setPatientConsent(consent);
      logAudit(session!.userId, 'READ_RECORD', `Accessed patient records for ${patient.hcid}`);
      showToast('success', `Access granted to ${patient.profile.name}'s records`);
    } else {
      showToast('error', 'No valid consent found. Please request consent from patient.');
      requestConsent(patient);
    }
  };

  const requestConsent = (patient: Patient) => {
    if (!doctor || !session) return;

    const newConsent: Consent = {
      id: generateId(),
      patientId: patient.id,
      doctorId: doctor.id,
      scopes: ['READ_RECORDS', 'WRITE_PRESCRIPTION'],
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
      createdAt: new Date().toISOString(),
      status: 'ACTIVE'
    };

    pushItem('consents', newConsent);
    logAudit(session.userId, 'CONSENT_GRANTED', `Consent granted for patient ${patient.hcid}`);
    
    setCurrentPatient(patient);
    setPatientConsent(newConsent);
    showToast('success', 'Consent automatically granted for demo purposes');
  };

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
    
    if (!currentPatient || !doctor || !session) return;

    const prescription: Prescription = {
      id: generateId(),
      patientId: currentPatient.id,
      doctorId: doctor.id,
      meds: newPrescription.medications.filter(med => med.name.trim() !== ''),
      createdAt: new Date().toISOString()
    };

    pushItem('prescriptions', prescription);
    setPrescriptions([...prescriptions, prescription]);
    
    logAudit(session.userId, 'WRITE_PRESCRIPTION', `Prescribed medication for patient ${currentPatient.hcid}`);
    setShowPrescriptionForm(false);
    setNewPrescription({ medications: [{ name: '', dose: '', duration: '' }] });
    showToast('success', 'Prescription saved successfully!');
  };

  const clearPatientView = () => {
    setCurrentPatient(null);
    setPatientConsent(null);
    setHcidInput('');
  };

  const handleAddDemoFamilyHistory = () => {
    if (!currentPatient || !session) return;

    const demoParents: Parent[] = [
      {
        id: generateId(),
        name: 'Ramesh Mehta',
        relation: 'Father',
        conditions: {
          diabetes: true,
          hypertension: true,
          heartDisease: false,
          cancer: false,
          asthma: false,
          other: ''
        }
      },
      {
        id: generateId(),
        name: 'Suman Mehta',
        relation: 'Mother',
        conditions: {
          diabetes: false,
          hypertension: false,
          heartDisease: false,
          cancer: false,
          asthma: true,
          other: 'Allergic to certain medications'
        }
      }
    ];

    const updatedPatient = { ...currentPatient, parents: demoParents };
    updateItem<Patient>('patients', currentPatient.id, { parents: demoParents });
    setCurrentPatient(updatedPatient);
    
    logAudit(session.userId, 'READ_RECORD', `Demo family history loaded for patient ${currentPatient.hcid}`);
  };

  const handleDemoPrescription = () => {
    setNewPrescription({
      medications: [
        { name: 'Lisinopril 10mg', dose: '1 tablet', duration: '30 days' },
        { name: 'Metformin 500mg', dose: '2 tablets daily', duration: '90 days' }
      ]
    });
    showToast('info', 'Demo prescription filled!');
  };

  const handleDemoHCID = () => {
    const patients = JSON.parse(localStorage.getItem('patients') || '[]');
    if (patients.length > 0) {
      setHcidInput(patients[0].hcid);
      showToast('info', 'Demo HCID filled! Click "Access Patient" to test.');
    } else {
      setHcidInput('HCID-001');
      showToast('info', 'Demo HCID filled! Register a patient first to test.');
    }
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  if (!doctor) {
    return <div className="flex justify-center items-center h-screen">Doctor data not found</div>;
  }

  const dashboardQuickActions = [
    {
      id: 'scan-qr',
      title: 'QR Scanner',
      description: 'Scan patient QR codes for quick access',
      icon: <QrCode className="w-6 h-6" />,
      onClick: () => router.push('/doctor/dashboard/qr-scanner')
    },
    {
      id: 'write-prescription',
      title: 'Write Prescription',
      description: 'Create new prescriptions',
      icon: <Pill className="w-6 h-6" />,
      onClick: () => setShowPrescriptionForm(true)
    },
    {
      id: 'patient-access',
      title: 'Patient Access',
      description: 'Access patient records via HCID',
      icon: <Users className="w-6 h-6" />,
      onClick: () => {
        const accessSection = document.getElementById('patient-access');
        accessSection?.scrollIntoView({ behavior: 'smooth' });
      }
    }
  ];

  return (
    <DoctorLayout doctor={doctor}>
      <div className="bg-gradient-to-br from-orange-50 via-white to-orange-50 min-h-screen">
        {/* Header */}
        <div className="p-6 border-b border-orange-200 bg-white/50">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Doctor's Dashboard</h1>
          <p className="text-gray-600">Welcome back, Dr. {doctor.name}</p>
        </div>

        {/* Main Content Grid */}
        <div className="p-6 grid lg:grid-cols-1 gap-6">
          {/* Main Column - Appointments & Stats */}
          <div className="space-y-6">
            {/* Today's Appointments */}
            <Card className="bg-white shadow-lg border-0">
              <CardHeader>
                <h3 className="text-xl font-semibold text-gray-900">Today's Appointments</h3>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-4">
                  {/* Routine Checkup */}
                  <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-4 text-white">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-medium">Routine Checkup</span>
                      <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                        <CheckCircle className="w-4 h-4" />
                      </div>
                    </div>
                    <div className="text-xs mb-2 text-green-100">Checked in</div>
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 bg-white/20 rounded-full"></div>
                      <span className="text-sm">Maria Rodriguez</span>
                    </div>
                    <div className="text-xs mt-1 text-green-100">9:30 • 45 mins</div>
                  </div>

                  {/* Heart Follow-up */}
                  <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg p-4 text-white">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-medium">Heart Follow-up</span>
                      <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                        <Clock className="w-4 h-4" />
                      </div>
                    </div>
                    <div className="text-xs mb-2 text-orange-100">In Progress</div>
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 bg-white/20 rounded-full"></div>
                      <span className="text-sm">John Smith</span>
                    </div>
                    <div className="text-xs mt-1 text-orange-100">10:30 • 45 mins</div>
                  </div>

                  {/* Consultation */}
                  <div className="bg-gray-100 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-medium text-gray-900">Consultation</span>
                      <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                        <Calendar className="w-4 h-4 text-gray-600" />
                      </div>
                    </div>
                    <div className="text-xs mb-2 text-gray-500">Scheduled</div>
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 bg-gray-200 rounded-full"></div>
                      <span className="text-sm text-gray-900">Emily Chen</span>
                    </div>
                    <div className="text-xs mt-1 text-gray-500">11:30 • 30 mins</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Stats Grid */}
            <div className="grid md:grid-cols-3 gap-4">
              <Card className="bg-white shadow-lg border-0">
                <CardContent className="p-4 text-center">
                  <div className="text-3xl font-bold text-gray-900 mb-1">247</div>
                  <div className="text-sm text-gray-600 mb-1">Active Patients</div>
                  <div className="text-xs text-green-600">+12 this week</div>
                </CardContent>
              </Card>

              <Card className="bg-white shadow-lg border-0">
                <CardContent className="p-4 text-center">
                  <div className="text-3xl font-bold text-gray-900 mb-1">3</div>
                  <div className="text-sm text-gray-600 mb-1">Critical Alerts</div>
                  <div className="text-xs text-red-600">-2 from yesterday</div>
                </CardContent>
              </Card>

              <Card className="bg-white shadow-lg border-0">
                <CardContent className="p-4 text-center">
                  <div className="text-3xl font-bold text-gray-900 mb-1">2</div>
                  <div className="text-sm text-gray-600 mb-1">Admissions Today</div>
                  <div className="text-xs text-blue-600">+2 from yesterday</div>
                </CardContent>
              </Card>
            </div>

            {/* Lab Results Section */}
            <Card className="bg-white shadow-lg border-0">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold text-gray-900">Lab Results</h3>
                  <div className="flex items-center space-x-2">
                    <Button variant="secondary" size="sm">
                      <Filter className="w-4 h-4 mr-2" />
                      All Status
                    </Button>
                    <Button variant="secondary" size="sm">
                      <Filter className="w-4 h-4 mr-2" />
                      All Priority
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                        <AlertCircle className="w-4 h-4 text-red-600" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">Maria Rodriguez</div>
                        <div className="text-sm text-gray-500">Complete Blood Count (CBC) • Hematology</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-red-600">Critical</div>
                      <div className="text-xs text-gray-500">P-2024-001</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">John Smith</div>
                        <div className="text-sm text-gray-500">Lipid Panel • Chemistry</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-green-600">Completed</div>
                      <div className="text-xs text-gray-500">P-2024-002</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>


        </div>

        {/* Current Patient Details Modal/Popup */}
        {currentPatient && patientConsent && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-white">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold">Patient Details - {currentPatient.profile.name}</h3>
                  <div className="flex items-center space-x-2">
                    <Button 
                      onClick={() => setShowPrescriptionForm(true)}
                      className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700"
                    >
                      <Pill className="w-4 h-4 mr-2" />
                      Write Prescription
                    </Button>
                    <Button onClick={clearPatientView} variant="secondary">×</Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-4">Basic Information</h4>
                    <div className="space-y-2 text-sm">
                      <div><span className="font-medium">Name:</span> {currentPatient.profile.name}</div>
                      <div><span className="font-medium">DOB:</span> {currentPatient.profile.dob}</div>
                      <div><span className="font-medium">Gender:</span> {currentPatient.profile.gender}</div>
                      <div><span className="font-medium">HCID:</span> {currentPatient.hcid}</div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-4">Health Records</h4>
                    {currentPatient.records && currentPatient.records.length > 0 ? (
                      <div className="space-y-2 max-h-40 overflow-y-auto">
                        {currentPatient.records.slice(-3).map((record) => (
                          <div key={record.id} className="p-2 bg-gray-50 rounded text-sm">
                            <div className="font-medium">{record.type}</div>
                            <div className="text-gray-600">{record.description}</div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">No records available</p>
                    )}
                  </div>
                </div>

                <div className="mt-6">
                  <FamilyHistoryCard 
                    parents={currentPatient.parents || []}
                    patientName={currentPatient.profile.name}
                    onAddDemo={handleAddDemoFamilyHistory}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* QR Scanner Modal */}
        {showQRScanner && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-md">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold">Scan Patient QR Code</h3>
                  <Button variant="secondary" onClick={() => setShowQRScanner(false)}>×</Button>
                </div>
              </CardHeader>
              <CardContent>
                <QRScanner onScanSuccess={handleQRScan} />
              </CardContent>
            </Card>
          </div>
        )}

        {/* Prescription Form Modal */}
        {showPrescriptionForm && currentPatient && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold">Write Prescription for {currentPatient.profile.name}</h3>
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
                              Remove
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
                    <Button type="submit" className="flex-1">Save Prescription</Button>
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