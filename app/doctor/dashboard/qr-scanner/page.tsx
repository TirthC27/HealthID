'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/Toast';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { DoctorLayout } from '@/components/layout/DoctorLayout';
import { QRScanner } from '@/components/QRScanner';
import { Doctor, Patient, Consent } from '@/types';
import { findItemBy, pushItem } from '@/utils/storage';
import { generateId } from '@/utils/auth';
import { logAudit } from '@/utils/audit';
import { QrCode, Scan, User, Shield, Clock, CheckCircle, AlertCircle, Users, FileText } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function QRScannerPage() {
  const { session, isLoading } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scannedPatient, setScannedPatient] = useState<Patient | null>(null);
  const [patientConsent, setPatientConsent] = useState<Consent | null>(null);
  const [scanHistory, setScanHistory] = useState<any[]>([]);

  useEffect(() => {
    if (!isLoading && (!session || session.role !== 'DOCTOR')) {
      router.push('/doctor/login');
      return;
    }

    if (session) {
      const doctorData = findItemBy<Doctor>('doctors', d => d.userId === session.userId);
      if (doctorData) {
        setDoctor(doctorData);
        loadScanHistory();
      }
    }
  }, [session, isLoading, router]);

  const loadScanHistory = () => {
    const history = JSON.parse(localStorage.getItem('qr_scan_history') || '[]');
    setScanHistory(history.slice(-5)); // Show last 5 scans
  };

  const handleQRScan = (hcid: string) => {
    if (!session || !doctor) return;

    const patient = findItemBy<Patient>('patients', p => p.hcid === hcid);
    if (!patient) {
      showToast('error', 'Patient not found with scanned HCID');
      return;
    }

    // Log scan activity
    logAudit(session.userId, 'QR_SCANNED', `Scanned QR for patient ${hcid}`);
    
    // Add to scan history
    const scanRecord = {
      id: generateId(),
      patientHcid: hcid,
      patientName: patient.profile.name,
      timestamp: new Date().toISOString(),
      status: 'success'
    };
    
    const history = JSON.parse(localStorage.getItem('qr_scan_history') || '[]');
    history.push(scanRecord);
    localStorage.setItem('qr_scan_history', JSON.stringify(history));
    setScanHistory(history.slice(-5));

    checkPatientConsent(patient);
    setIsScanning(false);
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
      setScannedPatient(patient);
      setPatientConsent(consent);
      logAudit(session!.userId, 'READ_RECORD', `Accessed patient records for ${patient.hcid}`);
      showToast('success', `Access granted to ${patient.profile.name}'s records`);
    } else {
      showToast('error', 'No valid consent found. Requesting consent...');
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
    
    setScannedPatient(patient);
    setPatientConsent(newConsent);
    showToast('success', 'Consent automatically granted for demo purposes');
  };

  const clearPatientView = () => {
    setScannedPatient(null);
    setPatientConsent(null);
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  if (!doctor) {
    return <div className="flex justify-center items-center h-screen">Doctor data not found</div>;
  }

  return (
    <DoctorLayout doctor={doctor}>
      <div className="h-screen flex flex-col bg-gradient-to-br from-orange-50 via-white to-orange-50 overflow-hidden">
        {/* Header - Compact */}
        <div className="p-4 border-b border-orange-200 bg-gradient-to-r from-white to-orange-50 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <QrCode className="w-6 h-6 text-orange-600" />
              <h1 className="text-xl font-bold text-gray-900">QR Scanner</h1>
            </div>
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${
              isScanning ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
            }`}>
              {isScanning ? 'Active' : 'Ready'}
            </div>
          </div>
        </div>

        {/* Main Content - Single Viewport */}
        <div className="flex-1 p-4 overflow-hidden">
          <div className="grid lg:grid-cols-3 gap-4 h-full">
            {/* Left Column - Scanner (Larger) */}
            <div className="lg:col-span-2 flex flex-col">
              <Card className="flex-1 bg-white shadow-lg border-0 overflow-hidden">
                <CardContent className="p-4 h-full flex flex-col">
                  {!isScanning ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-center">
                      <div className="w-20 h-20 bg-gradient-to-r from-orange-100 to-orange-200 rounded-full flex items-center justify-center mb-4">
                        <QrCode className="w-10 h-10 text-orange-600" />
                      </div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-2">Ready to Scan</h4>
                      <p className="text-gray-600 mb-6 text-sm max-w-md">
                        Position patient QR code in front of camera to scan and access medical records
                      </p>
                      <Button 
                        onClick={() => setIsScanning(true)}
                        className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 flex items-center"
                      >
                        <Scan className="w-4 h-4 mr-2" />
                        Start Scanning
                      </Button>
                    </div>
                  ) : (
                    <div className="flex-1 flex flex-col min-h-0">
                      <div className="flex-1 bg-black rounded-lg overflow-hidden min-h-0">
                        <QRScanner onScanSuccess={handleQRScan} />
                      </div>
                      <div className="flex gap-2 mt-3">
                        <Button 
                          onClick={() => setIsScanning(false)}
                          variant="secondary"
                          className="flex-1"
                        >
                          Stop Scanning
                        </Button>
                        <Button 
                          onClick={() => router.push('/doctor/dashboard')}
                          className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700"
                        >
                          Dashboard
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Results & Stats */}
            <div className="flex flex-col gap-4 min-h-0">
              {/* Scanned Patient Result */}
              {scannedPatient ? (
                <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200 shadow-lg flex-shrink-0">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        <h3 className="font-semibold text-green-900">Patient Records</h3>
                      </div>
                      <Button onClick={clearPatientView} variant="secondary" size="sm">
                        Clear
                      </Button>
                    </div>
                    
                    {/* Patient Basic Info */}
                    <div className="space-y-3 mb-4">
                      <div className="bg-white rounded-lg p-3 border border-green-200">
                        <div className="flex items-center space-x-2 mb-2">
                          <User className="w-4 h-4 text-green-600" />
                          <span className="font-medium text-green-900 text-sm">Patient Information</span>
                        </div>
                        <div className="space-y-1 text-xs">
                          <div><span className="font-medium">Name:</span> {scannedPatient.profile.name}</div>
                          <div><span className="font-medium">DOB:</span> {scannedPatient.profile.dob}</div>
                          <div><span className="font-medium">Gender:</span> {scannedPatient.profile.gender}</div>
                          <div><span className="font-medium">HCID:</span> {scannedPatient.hcid}</div>
                        </div>
                      </div>

                      {/* Health Records */}
                      {scannedPatient.records && scannedPatient.records.length > 0 && (
                        <div className="bg-white rounded-lg p-3 border border-green-200">
                          <div className="flex items-center space-x-2 mb-2">
                            <FileText className="w-4 h-4 text-blue-600" />
                            <span className="font-medium text-green-900 text-sm">Recent Records</span>
                          </div>
                          <div className="space-y-1 max-h-20 overflow-y-auto">
                            {scannedPatient.records.slice(-2).map((record, index) => (
                              <div key={index} className="text-xs bg-blue-50 p-2 rounded border">
                                <div className="font-medium text-blue-900">{record.type}</div>
                                <div className="text-blue-700 truncate">{record.description}</div>
                                <div className="text-blue-600">{new Date(record.date).toLocaleDateString()}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Family/Parents Data */}
                      {scannedPatient.parents && scannedPatient.parents.length > 0 && (
                        <div className="bg-white rounded-lg p-3 border border-green-200">
                          <div className="flex items-center space-x-2 mb-2">
                            <Users className="w-4 h-4 text-purple-600" />
                            <span className="font-medium text-green-900 text-sm">Family History</span>
                          </div>
                          <div className="space-y-1 max-h-20 overflow-y-auto">
                            {scannedPatient.parents.map((parent, index) => (
                              <div key={index} className="text-xs bg-purple-50 p-2 rounded border">
                                <div className="font-medium text-purple-900">
                                  {parent.name} ({parent.relation})
                                </div>
                                <div className="text-purple-700">
                                  {[
                                    parent.conditions.diabetes && 'Diabetes',
                                    parent.conditions.hypertension && 'Hypertension', 
                                    parent.conditions.heartDisease && 'Heart Disease',
                                    parent.conditions.cancer && 'Cancer',
                                    parent.conditions.asthma && 'Asthma',
                                    parent.conditions.other
                                  ].filter(Boolean).join(', ') || 'No known conditions'}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex space-x-2">
                      <Button 
                        onClick={() => router.push(`/doctor/dashboard/patient/${scannedPatient.hcid}`)}
                        className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
                        size="sm"
                      >
                        View Details
                      </Button>
                      <Button 
                        onClick={() => router.push('/doctor/dashboard')}
                        variant="secondary"
                        size="sm"
                      >
                        Dashboard
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card className="bg-gradient-to-r from-gray-50 to-gray-100 border-gray-200 shadow-lg flex-shrink-0">
                  <CardContent className="p-4 text-center">
                    <div className="flex items-center justify-center mb-2">
                      <AlertCircle className="w-5 h-5 text-gray-400" />
                    </div>
                    <h3 className="font-semibold text-gray-700 text-sm mb-1">No Patient Scanned</h3>
                    <p className="text-xs text-gray-500">Scan a QR code to access patient records</p>
                  </CardContent>
                </Card>
              )}

              {/* Quick Stats */}
              <div className="grid grid-cols-2 gap-2 flex-shrink-0">
                <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200 shadow-lg">
                  <CardContent className="p-3 text-center">
                    <div className="text-xl font-bold text-orange-600">{scanHistory.length}</div>
                    <div className="text-xs text-orange-700">Total</div>
                  </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 shadow-lg">
                  <CardContent className="p-3 text-center">
                    <div className="text-xl font-bold text-green-600">
                      {scanHistory.filter(s => s.status === 'success').length}
                    </div>
                    <div className="text-xs text-green-700">Success</div>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Scans */}
              <Card className="flex-1 bg-white shadow-lg border-0 min-h-0">
                <CardHeader className="p-3 pb-2">
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-orange-600" />
                    <h3 className="text-sm font-semibold">Recent Scans</h3>
                  </div>
                </CardHeader>
                <CardContent className="p-3 pt-0 flex-1 min-h-0">
                  {scanHistory.length > 0 ? (
                    <div className="space-y-2 overflow-y-auto max-h-full">
                      {scanHistory.slice(-3).reverse().map((scan) => (
                        <div key={scan.id} className="flex items-center justify-between p-2 bg-orange-50 rounded border border-orange-200">
                          <div className="flex items-center space-x-2 min-w-0 flex-1">
                            <div className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                              <User className="w-3 h-3 text-orange-600" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="font-medium text-xs text-gray-900 truncate">{scan.patientName}</div>
                              <div className="text-xs text-gray-600 truncate">{scan.patientHcid}</div>
                            </div>
                          </div>
                          <div className="text-right flex-shrink-0 ml-2">
                            <div className="text-xs font-medium text-gray-900">{formatTime(scan.timestamp)}</div>
                            <div className={`text-xs ${
                              scan.status === 'success' ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {scan.status === 'success' ? 'Success' : 'Failed'}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <QrCode className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                      <h4 className="text-sm font-medium text-gray-900 mb-1">No scans yet</h4>
                      <p className="text-xs text-gray-500">Start scanning to see history</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </DoctorLayout>
  );
}
