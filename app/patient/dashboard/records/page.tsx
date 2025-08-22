'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/Toast';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { PatientLayout } from '@/components/layout/PatientLayout';
import { Patient, Record } from '@/types';
import { findItemBy, updateItem } from '@/utils/storage';
import { generateId } from '@/utils/auth';
import { logAudit } from '@/utils/audit';
import { FileText, Plus, Search, Calendar, Filter, Download, Eye, Trash2, Heart, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function HealthRecordsPage() {
  const { session, isLoading } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [records, setRecords] = useState<Record[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<Record[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [showAddRecord, setShowAddRecord] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<Record | null>(null);
  const [newRecord, setNewRecord] = useState({
    type: '',
    description: '',
    notes: ''
  });

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
        setFilteredRecords(patientData.records || []);
      }
    }
  }, [session, isLoading, router]);

  useEffect(() => {
    let filtered = records;

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(record =>
        record.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
        record.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        record.notes?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by type
    if (filterType !== 'all') {
      filtered = filtered.filter(record =>
        record.type.toLowerCase().includes(filterType.toLowerCase())
      );
    }

    setFilteredRecords(filtered);
  }, [records, searchQuery, filterType]);

  const handleAddRecord = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!patient || !session) return;

    const record: Record = {
      id: generateId(),
      type: newRecord.type,
      description: newRecord.description,
      notes: newRecord.notes,
      createdAt: new Date().toISOString()
    };

    const updatedRecords = [...records, record];
    setRecords(updatedRecords);
    
    updateItem<Patient>('patients', patient.id, { records: updatedRecords });
    
    logAudit(session.userId, 'READ_RECORD', `Added new record: ${record.type}`);
    
    setNewRecord({ type: '', description: '', notes: '' });
    setShowAddRecord(false);
    showToast('success', 'Record added successfully!');
  };

  const handleDeleteRecord = (recordId: string) => {
    if (!patient || !session) return;

    const updatedRecords = records.filter(r => r.id !== recordId);
    setRecords(updatedRecords);
    
    updateItem<Patient>('patients', patient.id, { records: updatedRecords });
    
    logAudit(session.userId, 'READ_RECORD', `Deleted record: ${recordId}`);
    showToast('success', 'Record deleted successfully!');
  };

  const handleDemoHealthRecord = () => {
    setNewRecord({
      type: 'Blood Test',
      description: 'Complete Blood Count (CBC) and Lipid Profile',
      notes: 'All values within normal range. Cholesterol slightly elevated, recommend dietary changes.'
    });
    showToast('info', 'Demo health record filled!');
  };

  const recordTypes = ['all', 'blood test', 'x-ray', 'prescription', 'checkup', 'vaccination', 'surgery'];

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
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center">
                <FileText className="w-8 h-8 text-orange-600 mr-3" />
                Health Records
              </h1>
              <p className="text-orange-600">Manage your medical history and documents</p>
            </div>
            <Button onClick={() => setShowAddRecord(true)} className="flex items-center space-x-2 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700">
              <Plus className="w-5 h-5" />
              <span>Add Record</span>
            </Button>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search records by type, description, or notes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="w-5 h-5 text-gray-500" />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              >
                {recordTypes.map(type => (
                  <option key={type} value={type}>
                    {type === 'all' ? 'All Types' : type.charAt(0).toUpperCase() + type.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-0 shadow-lg">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-orange-600">{records.length}</div>
              <div className="text-sm text-gray-600">Total Records</div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-red-50 to-red-100 border-0 shadow-lg">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-red-600">
                {records.filter(r => r.type.toLowerCase().includes('blood')).length}
              </div>
              <div className="text-sm text-gray-600">Blood Tests</div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-0 shadow-lg">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">
                {records.filter(r => r.type.toLowerCase().includes('prescription')).length}
              </div>
              <div className="text-sm text-gray-600">Prescriptions</div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-0 shadow-lg">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">
                {records.filter(r => r.type.toLowerCase().includes('x-ray')).length}
              </div>
              <div className="text-sm text-gray-600">X-Rays</div>
            </CardContent>
          </Card>
        </div>

        {/* Records List - Non-scrollable Grid */}
        <Card className="bg-white shadow-lg border-0">
          <CardHeader>
            <h3 className="text-xl font-semibold flex items-center">
              <Heart className="w-6 h-6 text-orange-600 mr-2" />
              {filteredRecords.length} Record{filteredRecords.length !== 1 ? 's' : ''}
              {searchQuery && ` matching "${searchQuery}"`}
              {filterType !== 'all' && ` in ${filterType}`}
            </h3>
          </CardHeader>
          <CardContent>
            {filteredRecords.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h4 className="text-lg font-medium text-gray-900 mb-2">
                  {records.length === 0 ? 'No health records yet' : 'No records found'}
                </h4>
                <p className="text-gray-500 mb-4">
                  {records.length === 0 
                    ? 'Start building your health profile by adding your first record'
                    : 'Try adjusting your search or filter criteria'
                  }
                </p>
                {records.length === 0 && (
                  <Button onClick={() => setShowAddRecord(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Your First Record
                  </Button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {filteredRecords.slice(0, 6).map((record) => (
                  <div key={record.id} className="bg-gradient-to-r from-white to-gray-50 border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-3">
                          <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                            <Heart className="w-5 h-5 text-orange-600" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900 text-lg">{record.type}</h4>
                            <div className="flex items-center space-x-4 text-sm text-gray-500">
                              <div className="flex items-center space-x-1">
                                <Calendar className="w-4 h-4" />
                                <span>{new Date(record.createdAt).toLocaleDateString()}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <p className="text-gray-700 mb-3">{record.description}</p>
                        {record.notes && (
                          <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                            <p className="text-sm text-orange-800">{record.notes}</p>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center space-x-2 ml-4">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => setSelectedRecord(record)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => showToast('info', 'Download feature coming soon!')}
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleDeleteRecord(record.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Add Record Modal */}
        {showAddRecord && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-md">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold">Add Health Record</h3>
                  <div className="flex items-center space-x-2">
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={handleDemoHealthRecord}
                      size="sm"
                      className="flex items-center space-x-1"
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>Demo</span>
                    </Button>
                    <Button variant="secondary" onClick={() => setShowAddRecord(false)}>×</Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAddRecord}>
                  <Input
                    label="Record Type"
                    value={newRecord.type}
                    onChange={(value) => setNewRecord({ ...newRecord, type: value })}
                    placeholder="e.g., Blood Test, X-Ray, Prescription"
                    required
                  />
                  
                  <Input
                    label="Description"
                    value={newRecord.description}
                    onChange={(value) => setNewRecord({ ...newRecord, description: value })}
                    placeholder="Brief description of the record"
                    required
                  />
                  
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Notes
                    </label>
                    <textarea
                      value={newRecord.notes}
                      onChange={(e) => setNewRecord({ ...newRecord, notes: e.target.value })}
                      placeholder="Additional notes or details"
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  <div className="flex space-x-3">
                    <Button type="submit" className="flex-1">Add Record</Button>
                    <Button variant="secondary" onClick={() => setShowAddRecord(false)}>Cancel</Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Record Detail Modal */}
        {selectedRecord && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-2xl">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold">Record Details</h3>
                  <Button variant="secondary" onClick={() => setSelectedRecord(null)}>×</Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">{selectedRecord.type}</h4>
                    <p className="text-gray-600 text-sm">
                      Created on {new Date(selectedRecord.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  
                  <div>
                    <h5 className="font-medium text-gray-900 mb-2">Description</h5>
                    <p className="text-gray-700">{selectedRecord.description}</p>
                  </div>
                  
                  {selectedRecord.notes && (
                    <div>
                      <h5 className="font-medium text-gray-900 mb-2">Notes</h5>
                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                        <p className="text-gray-700">{selectedRecord.notes}</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </PatientLayout>
  );
}
