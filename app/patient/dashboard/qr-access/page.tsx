'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/Toast';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { PatientLayout } from '@/components/layout/PatientLayout';
import { QRCodeDisplay } from '@/components/QRCodeDisplay';
import { Patient, Consent } from '@/types';
import { findItemBy, filterItems, updateItem } from '@/utils/storage';
import { logAudit } from '@/utils/audit';
import { QrCode, Shield, Clock, User, CheckCircle, XCircle, AlertCircle, Smartphone } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function QRAccessPage() {
  const { session, isLoading } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [consents, setConsents] = useState<Consent[]>([]);
  const [activeConsents, setActiveConsents] = useState<Consent[]>([]);
  const [expiredConsents, setExpiredConsents] = useState<Consent[]>([]);

  useEffect(() => {
    if (!isLoading && (!session || session.role !== 'PATIENT')) {
      router.push('/patient/login');
      return;
    }

    if (session) {
      const patientData = findItemBy<Patient>('patients', p => p.userId === session.userId);
      if (patientData) {
        setPatient(patientData);
        
        const patientConsents = filterItems<Consent>('consents', c => c.patientId === patientData.id);
        setConsents(patientConsents);
        
        // Separate active and expired consents
        const now = new Date();
        const active = patientConsents.filter(c => 
          c.status === 'ACTIVE' && new Date(c.expiresAt) > now
        );
        const expired = patientConsents.filter(c => 
          c.status === 'REVOKED' || new Date(c.expiresAt) <= now
        );
        
        setActiveConsents(active);
        setExpiredConsents(expired);
      }
    }
  }, [session, isLoading, router]);

  const handleQRGenerate = () => {
    if (session) {
      logAudit(session.userId, 'QR_GENERATED', 'Generated QR code for health record access');
      showToast('success', 'QR code generated successfully!');
    }
  };

  const handleRevokeConsent = (consentId: string) => {
    updateItem<Consent>('consents', consentId, { status: 'REVOKED' });
    
    // Update local state
    const updatedConsents = consents.map(c => 
      c.id === consentId ? { ...c, status: 'REVOKED' as const } : c
    );
    setConsents(updatedConsents);
    
    // Re-filter active and expired
    const now = new Date();
    const active = updatedConsents.filter(c => 
      c.status === 'ACTIVE' && new Date(c.expiresAt) > now
    );
    const expired = updatedConsents.filter(c => 
      c.status === 'REVOKED' || new Date(c.expiresAt) <= now
    );
    
    setActiveConsents(active);
    setExpiredConsents(expired);
    
    if (session) {
      logAudit(session.userId, 'CONSENT_REVOKED', `Revoked consent: ${consentId}`);
    }
    
    showToast('success', 'Access permission revoked successfully');
  };

  const formatTimeRemaining = (expiresAt: string) => {
    const now = new Date();
    const expiry = new Date(expiresAt);
    const diff = expiry.getTime() - now.getTime();
    
    if (diff <= 0) return 'Expired';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 24) {
      const days = Math.floor(hours / 24);
      return `${days} day${days > 1 ? 's' : ''} remaining`;
    } else if (hours > 0) {
      return `${hours}h ${minutes}m remaining`;
    } else {
      return `${minutes}m remaining`;
    }
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  if (!patient) {
    return <div className="flex justify-center items-center h-screen">Patient data not found</div>;
  }

  return (
    <PatientLayout patient={patient}>
      <div className="max-w-6xl bg-gradient-to-br from-orange-50 via-white to-orange-50 min-h-screen">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center">
            <QrCode className="w-8 h-8 text-orange-600 mr-3" />
            QR Code & Access Management
          </h1>
          <p className="text-orange-600">Generate QR codes for secure access and manage doctor permissions</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-0 shadow-lg">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{activeConsents.length}</div>
              <div className="text-sm text-gray-600">Active Permissions</div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-red-50 to-red-100 border-0 shadow-lg">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-red-600">{expiredConsents.length}</div>
              <div className="text-sm text-gray-600">Expired/Revoked</div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-0 shadow-lg">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-orange-600">{consents.length}</div>
              <div className="text-sm text-gray-600">Total Requests</div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-0 shadow-lg">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">
                {activeConsents.filter(c => {
                  const expiry = new Date(c.expiresAt);
                  const now = new Date();
                  const diff = expiry.getTime() - now.getTime();
                  return diff <= 24 * 60 * 60 * 1000; // 24 hours
                }).length}
              </div>
              <div className="text-sm text-gray-600">Expiring Soon</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* QR Code Section */}
          <div className="space-y-6">
            <QRCodeDisplay hcid={patient.hcid} onGenerate={handleQRGenerate} />

            {/* QR Code Instructions */}
            <Card>
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <Smartphone className="w-6 h-6 text-orange-600" />
                  <h3 className="text-lg font-semibold">How to Use QR Code</h3>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm text-gray-700">
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-orange-600 font-semibold text-xs">1</span>
                    </div>
                    <p>Generate a QR code when visiting your doctor</p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-orange-600 font-semibold text-xs">2</span>
                    </div>
                    <p>Show the QR code to your healthcare provider</p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-orange-600 font-semibold text-xs">3</span>
                    </div>
                    <p>Doctor scans the code to request access to your records</p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-orange-600 font-semibold text-xs">4</span>
                    </div>
                    <p>Approve or deny the access request as needed</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Access Permissions */}
          <div className="space-y-6">
            {/* Active Permissions */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Shield className="w-6 h-6 text-green-600" />
                    <h3 className="text-lg font-semibold">Active Permissions</h3>
                  </div>
                  <span className="text-sm text-gray-500">{activeConsents.length} active</span>
                </div>
              </CardHeader>
              <CardContent>
                {activeConsents.length === 0 ? (
                  <div className="text-center py-8">
                    <Shield className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 text-sm">No active permissions</p>
                    <p className="text-gray-400 text-xs mt-1">Generate a QR code to grant doctor access</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {activeConsents.map((consent) => (
                      <div key={consent.id} className="p-4 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <CheckCircle className="w-4 h-4 text-green-600" />
                            <span className="font-medium text-green-900">Doctor Access Granted</span>
                          </div>
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => handleRevokeConsent(consent.id)}
                          >
                            Revoke
                          </Button>
                        </div>
                        <div className="text-sm text-green-700 space-y-1">
                          <div className="flex items-center space-x-2">
                            <Clock className="w-3 h-3" />
                            <span>{formatTimeRemaining(consent.expiresAt)}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <User className="w-3 h-3" />
                            <span>Doctor ID: {consent.doctorId}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Permission History */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Clock className="w-6 h-6 text-gray-600" />
                    <h3 className="text-lg font-semibold">Permission History</h3>
                  </div>
                  <span className="text-sm text-gray-500">{expiredConsents.length} total</span>
                </div>
              </CardHeader>
              <CardContent>
                {expiredConsents.length === 0 ? (
                  <div className="text-center py-6">
                    <Clock className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                    <p className="text-gray-500 text-sm">No permission history</p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {expiredConsents.slice(0, 10).map((consent) => (
                      <div key={consent.id} className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center space-x-2">
                            {consent.status === 'REVOKED' ? (
                              <XCircle className="w-4 h-4 text-red-500" />
                            ) : (
                              <AlertCircle className="w-4 h-4 text-orange-500" />
                            )}
                            <span className="font-medium text-gray-900 text-sm">
                              {consent.status === 'REVOKED' ? 'Revoked' : 'Expired'}
                            </span>
                          </div>
                          <span className="text-xs text-gray-500">
                            {new Date(consent.expiresAt).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="text-xs text-gray-600">
                          Doctor ID: {consent.doctorId}
                        </div>
                      </div>
                    ))}
                    {expiredConsents.length > 10 && (
                      <div className="text-center text-sm text-gray-500">
                        And {expiredConsents.length - 10} more...
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Security Notice */}
        <Card className="mt-8">
          <CardContent className="p-6">
            <div className="flex items-start space-x-3">
              <Shield className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Security & Privacy</h4>
                <div className="text-sm text-gray-700 space-y-2">
                  <p>
                    • QR codes are time-limited and expire automatically for your security
                  </p>
                  <p>
                    • You can revoke doctor access at any time from this page
                  </p>
                  <p>
                    • All access attempts are logged and can be reviewed in your activity log
                  </p>
                  <p>
                    • Never share QR codes or access tokens with unauthorized individuals
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </PatientLayout>
  );
}
