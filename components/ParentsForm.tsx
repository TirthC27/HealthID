'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from './ui/Card';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { useToast } from './ui/Toast';
import { Parent } from '@/types';
import { generateId } from '@/utils/auth';
import { Users, Plus, X, Sparkles } from 'lucide-react';

interface ParentsFormProps {
  onSave: (parent: Parent) => void;
  onClose: () => void;
}

export function ParentsForm({ onSave, onClose }: ParentsFormProps) {
  const { showToast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    relation: '' as Parent['relation'] | '',
    conditions: {
      diabetes: false,
      hypertension: false,
      heartDisease: false,
      cancer: false,
      asthma: false,
      other: ''
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.relation) {
      showToast('error', 'Please fill in all required fields');
      return;
    }

    const parent: Parent = {
      id: generateId(),
      name: formData.name.trim(),
      relation: formData.relation as Parent['relation'],
      conditions: formData.conditions
    };

    onSave(parent);
    showToast('success', 'Parent data added successfully!');
    
    // Reset form
    setFormData({
      name: '',
      relation: '',
      conditions: {
        diabetes: false,
        hypertension: false,
        heartDisease: false,
        cancer: false,
        asthma: false,
        other: ''
      }
    });
  };

  const handleDemoFill = () => {
    setFormData({
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
    });
    showToast('info', 'Demo data filled!');
  };

  const handleConditionChange = (condition: keyof Parent['conditions'], value: boolean | string) => {
    setFormData(prev => ({
      ...prev,
      conditions: {
        ...prev.conditions,
        [condition]: value
      }
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Users className="w-6 h-6 text-blue-600" />
              <h3 className="text-xl font-semibold">Add Parent Data</h3>
            </div>
            <Button variant="secondary" onClick={onClose} size="sm">
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Demo Button */}
            <div className="flex justify-end">
              <Button
                type="button"
                variant="secondary"
                onClick={handleDemoFill}
                className="flex items-center space-x-2"
                size="sm"
              >
                <Sparkles className="w-4 h-4" />
                <span>Demo Fill</span>
              </Button>
            </div>

            {/* Relation */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Relation <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.relation}
                onChange={(e) => setFormData({ ...formData, relation: e.target.value as Parent['relation'] })}
                required
                className="input-field"
              >
                <option value="">Select Relation</option>
                <option value="Father">Father</option>
                <option value="Mother">Mother</option>
                <option value="Guardian">Guardian</option>
              </select>
            </div>

            {/* Parent Name */}
            <Input
              label="Parent Name"
              value={formData.name}
              onChange={(value) => setFormData({ ...formData, name: value })}
              placeholder="Enter parent's full name"
              required
            />

            {/* Medical Conditions */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Medical Conditions
              </label>
              <div className="space-y-3">
                {[
                  { key: 'diabetes', label: 'Diabetes' },
                  { key: 'hypertension', label: 'Hypertension' },
                  { key: 'heartDisease', label: 'Heart Disease' },
                  { key: 'cancer', label: 'Cancer' },
                  { key: 'asthma', label: 'Asthma' }
                ].map(({ key, label }) => (
                  <div key={key} className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id={key}
                      checked={formData.conditions[key as keyof typeof formData.conditions] as boolean}
                      onChange={(e) => handleConditionChange(key as keyof Parent['conditions'], e.target.checked)}
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor={key} className="text-sm text-gray-700">
                      {label}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Other Conditions */}
            <Input
              label="Other Conditions"
              value={formData.conditions.other || ''}
              onChange={(value) => handleConditionChange('other', value)}
              placeholder="Specify any other medical conditions"
            />

            {/* Action Buttons */}
            <div className="flex space-x-3 pt-4">
              <Button type="submit" className="flex-1">
                <Plus className="w-4 h-4 mr-2" />
                Add Parent Data
              </Button>
              <Button variant="secondary" onClick={onClose}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

interface ParentsListProps {
  parents: Parent[];
  onAddNew: () => void;
  onRemove: (parentId: string) => void;
}

export function ParentsList({ parents, onAddNew, onRemove }: ParentsListProps) {
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

  const getRelationColor = (relation: Parent['relation']): string => {
    switch (relation) {
      case 'Father': return 'bg-blue-100 text-blue-800';
      case 'Mother': return 'bg-pink-100 text-pink-800';
      case 'Guardian': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Users className="w-6 h-6 text-blue-600" />
            <h3 className="text-xl font-semibold">Parents Data</h3>
          </div>
          <Button onClick={onAddNew} size="sm" className="flex items-center space-x-2">
            <Plus className="w-4 h-4" />
            <span>Add Parent</span>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {parents.length === 0 ? (
          <div className="text-center py-8">
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h4 className="text-lg font-medium text-gray-900 mb-2">No parent data yet</h4>
            <p className="text-gray-500 mb-4">Add your family medical history to help doctors provide better care</p>
            <Button onClick={onAddNew} className="flex items-center space-x-2">
              <Plus className="w-4 h-4" />
              <span>Add First Parent</span>
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {parents.map((parent) => (
              <div key={parent.id} className="bg-gradient-to-r from-white to-gray-50 border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRelationColor(parent.relation)}`}>
                        {parent.relation}
                      </span>
                      <h4 className="font-semibold text-gray-900">{parent.name}</h4>
                    </div>
                    <p className="text-sm text-gray-600">
                      <strong>Conditions:</strong> {getConditionsText(parent.conditions)}
                    </p>
                  </div>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => onRemove(parent.id)}
                    className="ml-4 text-red-600 hover:text-red-700"
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
  );
}



