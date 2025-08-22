'use client';

import React from 'react';
import { Card, CardContent, CardHeader } from './ui/Card';
import { Button } from './ui/Button';
import { useToast } from './ui/Toast';
import { Parent } from '@/types';
import { Users, Sparkles, AlertCircle, Heart } from 'lucide-react';

interface FamilyHistoryCardProps {
  parents: Parent[];
  patientName: string;
  onAddDemo?: () => void;
}

export function FamilyHistoryCard({ parents, patientName, onAddDemo }: FamilyHistoryCardProps) {
  const { showToast } = useToast();

  const getConditionsText = (conditions: Parent['conditions']): string => {
    const activeConditions = [];
    
    if (conditions.diabetes) activeConditions.push('Diabetes');
    if (conditions.hypertension) activeConditions.push('Hypertension');
    if (conditions.heartDisease) activeConditions.push('Heart Disease');
    if (conditions.cancer) activeConditions.push('Cancer');
    if (conditions.asthma) activeConditions.push('Asthma');
    if (conditions.other) activeConditions.push(conditions.other);
    
    return activeConditions.length > 0 ? activeConditions.join(', ') : 'No known conditions';
  };

  const getRelationIcon = (relation: Parent['relation']) => {
    switch (relation) {
      case 'Father': return '👨';
      case 'Mother': return '👩';
      case 'Guardian': return '👤';
      default: return '👤';
    }
  };

  const getConditionSeverity = (conditions: Parent['conditions']): 'low' | 'medium' | 'high' => {
    const highRiskConditions = ['diabetes', 'hypertension', 'heartDisease', 'cancer'];
    const activeHighRisk = highRiskConditions.filter(condition => 
      conditions[condition as keyof Parent['conditions']]
    );
    
    if (activeHighRisk.length >= 2) return 'high';
    if (activeHighRisk.length === 1) return 'medium';
    return 'low';
  };

  const getSeverityColor = (severity: 'low' | 'medium' | 'high'): string => {
    switch (severity) {
      case 'high': return 'border-l-red-500 bg-red-50';
      case 'medium': return 'border-l-yellow-500 bg-yellow-50';
      case 'low': return 'border-l-green-500 bg-green-50';
    }
  };

  const handleDemoFill = () => {
    if (onAddDemo) {
      onAddDemo();
      showToast('info', 'Demo family history loaded for testing');
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Users className="w-6 h-6 text-purple-600" />
            <h3 className="text-xl font-semibold">Family Medical History</h3>
          </div>
          {parents.length === 0 && onAddDemo && (
            <Button
              onClick={handleDemoFill}
              variant="secondary"
              size="sm"
              className="flex items-center space-x-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>Load Demo</span>
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {parents.length === 0 ? (
          <div className="text-center py-8">
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h4 className="text-lg font-medium text-gray-900 mb-2">No Family History Available</h4>
            <p className="text-gray-500 mb-4">
              {patientName} hasn't provided family medical history yet
            </p>
            {onAddDemo && (
              <Button onClick={handleDemoFill} variant="secondary" className="flex items-center space-x-2">
                <Sparkles className="w-4 h-4" />
                <span>Load Demo Data</span>
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center space-x-2">
                <AlertCircle className="w-5 h-5 text-blue-600" />
                <p className="text-sm text-blue-800">
                  <strong>Family medical history for {patientName}</strong> - Consider genetic predispositions when making treatment decisions
                </p>
              </div>
            </div>

            {parents.map((parent) => {
              const severity = getConditionSeverity(parent.conditions);
              return (
                <div 
                  key={parent.id} 
                  className={`border-l-4 rounded-lg p-4 ${getSeverityColor(severity)} transition-all hover:shadow-md`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <span className="text-2xl">{getRelationIcon(parent.relation)}</span>
                        <div>
                          <h4 className="font-semibold text-gray-900 text-lg">
                            {parent.relation} ({parent.name})
                          </h4>
                          <p className="text-sm text-gray-600">Family Member</p>
                        </div>
                      </div>
                      
                      <div className="ml-11">
                        <div className="flex items-start space-x-2 mb-2">
                          <Heart className="w-4 h-4 text-red-500 mt-1 flex-shrink-0" />
                          <div>
                            <p className="text-sm font-medium text-gray-700">Medical Conditions:</p>
                            <p className="text-sm text-gray-600">{getConditionsText(parent.conditions)}</p>
                          </div>
                        </div>

                        {/* Specific condition highlights */}
                        <div className="mt-3 flex flex-wrap gap-2">
                          {parent.conditions.diabetes && (
                            <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                              🩸 Diabetes
                            </span>
                          )}
                          {parent.conditions.hypertension && (
                            <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full">
                              💓 Hypertension
                            </span>
                          )}
                          {parent.conditions.heartDisease && (
                            <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                              ❤️ Heart Disease
                            </span>
                          )}
                          {parent.conditions.cancer && (
                            <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
                              🎗️ Cancer
                            </span>
                          )}
                          {parent.conditions.asthma && (
                            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                              🫁 Asthma
                            </span>
                          )}
                          {parent.conditions.other && (
                            <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">
                              ℹ️ {parent.conditions.other}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Risk indicator */}
                    <div className="ml-4">
                      <div className={`w-3 h-3 rounded-full ${
                        severity === 'high' ? 'bg-red-500' : 
                        severity === 'medium' ? 'bg-yellow-500' : 
                        'bg-green-500'
                      }`} title={`${severity} risk profile`}></div>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Risk Summary */}
            <div className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-200">
              <h4 className="font-semibold text-purple-900 mb-2">Clinical Notes</h4>
              <ul className="text-sm text-purple-800 space-y-1">
                <li>• Monitor for genetic predispositions based on family history</li>
                <li>• Consider preventive screening for hereditary conditions</li>
                <li>• Family history may influence treatment protocols</li>
              </ul>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}



