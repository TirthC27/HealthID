'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/Toast';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { PatientLayout } from '@/components/layout/PatientLayout';
import { ParentsForm, ParentsList } from '@/components/ParentsForm';
import { Patient, Parent } from '@/types';
import { findItemBy, updateItem } from '@/utils/storage';
import { logAudit } from '@/utils/audit';
import { Users, Plus, Heart, AlertTriangle, Activity, TrendingUp, X } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function FamilyDataPage() {
  const { session, isLoading } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [showParentsForm, setShowParentsForm] = useState(false);

  useEffect(() => {
    if (!isLoading && (!session || session.role !== 'PATIENT')) {
      router.push('/patient/login');
      return;
    }

    if (session) {
      const patientData = findItemBy<Patient>('patients', p => p.userId === session.userId);
      if (patientData) {
        setPatient(patientData);
        
        // Ensure parents array exists (for backward compatibility)
        if (!patientData.parents) {
          const updatedPatient = { ...patientData, parents: [] };
          updateItem<Patient>('patients', patientData.id, { parents: [] });
          setPatient(updatedPatient);
        }
      }
    }
  }, [session, isLoading, router]);

  const handleAddParent = (parent: Parent) => {
    if (!patient || !session) return;

    const updatedParents = [...(patient.parents || []), parent];
    updateItem<Patient>('patients', patient.id, { parents: updatedParents });
    
    setPatient({ ...patient, parents: updatedParents });
    logAudit(session.userId, 'READ_RECORD', `Added parent data: ${parent.name} (${parent.relation})`);
    
    setShowParentsForm(false);
    showToast('success', 'Family member added successfully!');
  };

  const handleRemoveParent = (parentId: string) => {
    if (!patient || !session) return;

    const updatedParents = (patient.parents || []).filter(p => p.id !== parentId);
    updateItem<Patient>('patients', patient.id, { parents: updatedParents });
    
    setPatient({ ...patient, parents: updatedParents });
    logAudit(session.userId, 'READ_RECORD', 'Removed parent data');
    showToast('success', 'Family member removed successfully!');
  };

  const getAllConditions = (parents: Parent[]) => {
    const conditionCounts: { [key: string]: number } = {};
    
    parents.forEach(parent => {
      Object.entries(parent.conditions).forEach(([condition, hasCondition]) => {
        if (hasCondition && condition !== 'other') {
          conditionCounts[condition] = (conditionCounts[condition] || 0) + 1;
        }
      });
    });
    
    return conditionCounts;
  };

  const getRiskFactors = (parents: Parent[]) => {
    const conditions = getAllConditions(parents);
    const riskFactors = [];
    
    if (conditions.diabetes) {
      riskFactors.push({
        condition: 'Diabetes',
        count: conditions.diabetes,
        risk: 'High',
        color: 'text-red-600',
        bgColor: 'bg-red-50',
        recommendation: 'Regular blood sugar monitoring recommended'
      });
    }
    
    if (conditions.hypertension) {
      riskFactors.push({
        condition: 'Hypertension',
        count: conditions.hypertension,
        risk: 'Moderate',
        color: 'text-orange-600',
        bgColor: 'bg-orange-50',
        recommendation: 'Regular blood pressure checks advised'
      });
    }
    
    if (conditions.heartDisease) {
      riskFactors.push({
        condition: 'Heart Disease',
        count: conditions.heartDisease,
        risk: 'High',
        color: 'text-red-600',
        bgColor: 'bg-red-50',
        recommendation: 'Cardiovascular screening recommended'
      });
    }
    
    if (conditions.cancer) {
      riskFactors.push({
        condition: 'Cancer',
        count: conditions.cancer,
        risk: 'Moderate',
        color: 'text-purple-600',
        bgColor: 'bg-purple-50',
        recommendation: 'Regular cancer screening advised'
      });
    }
    
    if (conditions.asthma) {
      riskFactors.push({
        condition: 'Asthma',
        count: conditions.asthma,
        risk: 'Low',
        color: 'text-blue-600',
        bgColor: 'bg-blue-50',
        recommendation: 'Monitor respiratory health'
      });
    }
    
    return riskFactors;
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  if (!patient) {
    return <div className="flex justify-center items-center h-screen">Patient data not found</div>;
  }

  const parents = patient.parents || [];
  const riskFactors = getRiskFactors(parents);
  const totalConditions = Object.values(getAllConditions(parents)).reduce((sum, count) => sum + count, 0);

  return (
    <PatientLayout patient={patient}>
      <div className="max-w-6xl bg-gradient-to-br from-orange-50 via-white to-orange-50 min-h-screen">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center">
                <Users className="w-8 h-8 text-orange-600 mr-3" />
                Family Medical History
              </h1>
              <p className="text-orange-600">Manage your family's health information and genetic risk factors</p>
            </div>
            <Button onClick={() => setShowParentsForm(true)} className="flex items-center space-x-2 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700">
              <Plus className="w-5 h-5" />
              <span>Add Family Member</span>
            </Button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{parents.length}</div>
              <div className="text-sm text-gray-600">Family Members</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-orange-600">{totalConditions}</div>
              <div className="text-sm text-gray-600">Total Conditions</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-red-600">{riskFactors.filter(r => r.risk === 'High').length}</div>
              <div className="text-sm text-gray-600">High Risk Factors</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">
                {parents.length > 0 ? Math.round((parents.length - riskFactors.length) / parents.length * 100) : 100}%
              </div>
              <div className="text-sm text-gray-600">Health Score</div>
            </CardContent>
          </Card>
        </div>

        {/* Risk Factors Analysis */}
        {riskFactors.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <AlertTriangle className="w-6 h-6 text-orange-500" />
                <h3 className="text-xl font-semibold">Genetic Risk Factors</h3>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {riskFactors.map((factor, index) => (
                  <div key={index} className={`p-4 rounded-lg border ${factor.bgColor} border-opacity-50`}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-3">
                        <Heart className={`w-5 h-5 ${factor.color}`} />
                        <h4 className="font-semibold text-gray-900">{factor.condition}</h4>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${factor.color} ${factor.bgColor}`}>
                          {factor.risk} Risk
                        </span>
                      </div>
                      <span className="text-sm text-gray-600">
                        {factor.count} family member{factor.count > 1 ? 's' : ''} affected
                      </span>
                    </div>
                    <p className="text-sm text-gray-700">{factor.recommendation}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Family Members List */}
        <Card className="mb-8 bg-white shadow-lg border-0">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Users className="w-6 h-6 text-orange-600" />
                <h3 className="text-xl font-semibold">Family Members</h3>
              </div>
              <Button onClick={() => setShowParentsForm(true)} size="sm" className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700">
                <Plus className="w-4 h-4 mr-2" />
                {parents.length === 0 ? 'Add First Member' : 'Add Member'}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {parents.length === 0 ? (
              <div className="text-center py-8">
                <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h4 className="text-lg font-medium text-gray-900 mb-2">No family members yet</h4>
                <p className="text-gray-500 mb-4">Add your family medical history to help doctors provide better care</p>
                <Button onClick={() => setShowParentsForm(true)} className="flex items-center space-x-2 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700">
                  <Plus className="w-4 h-4" />
                  <span>Add First Member</span>
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {parents.map((parent) => (
                  <div key={parent.id} className="bg-gradient-to-r from-orange-50 to-orange-100 border border-orange-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            parent.relation === 'Father' ? 'bg-blue-100 text-blue-800' :
                            parent.relation === 'Mother' ? 'bg-pink-100 text-pink-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {parent.relation}
                          </span>
                          <h4 className="font-semibold text-gray-900">{parent.name}</h4>
                        </div>
                        <p className="text-sm text-gray-600">
                          <strong>Medical Conditions:</strong> {
                            (() => {
                              const activeConditions = [];
                              if (parent.conditions.diabetes) activeConditions.push('Diabetes');
                              if (parent.conditions.hypertension) activeConditions.push('Hypertension');
                              if (parent.conditions.heartDisease) activeConditions.push('Heart Disease');
                              if (parent.conditions.cancer) activeConditions.push('Cancer');
                              if (parent.conditions.asthma) activeConditions.push('Asthma');
                              if (parent.conditions.other) activeConditions.push(parent.conditions.other);
                              return activeConditions.length > 0 ? activeConditions.join(', ') : 'No known conditions';
                            })()
                          }
                        </p>
                      </div>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleRemoveParent(parent.id)}
                        className="ml-4 text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Health Insights */}
        {parents.length > 0 && (
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-3">
                <TrendingUp className="w-6 h-6 text-green-600" />
                <h3 className="text-xl font-semibold">Health Insights</h3>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h4 className="font-semibold text-blue-900 mb-2">Preventive Care Recommendations</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Regular health screenings based on family history</li>
                    <li>• Lifestyle modifications to reduce genetic risk factors</li>
                    <li>• Discuss family history with your healthcare provider</li>
                    <li>• Consider genetic counseling if multiple risk factors present</li>
                  </ul>
                </div>
                
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <h4 className="font-semibold text-green-900 mb-2">Family Health Strengths</h4>
                  <p className="text-sm text-green-800">
                    Your family medical history helps healthcare providers make informed decisions about your care.
                    Keep this information updated and share it during medical consultations.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Parents Form Modal */}
        {showParentsForm && (
          <ParentsForm 
            onSave={handleAddParent}
            onClose={() => setShowParentsForm(false)}
          />
        )}
      </div>
    </PatientLayout>
  );
}
