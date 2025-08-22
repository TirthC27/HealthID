'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { PatientLayout } from '@/components/layout/PatientLayout';
import { ActivityFeed, generatePatientActivities } from '@/components/dashboard/ActivityFeed';
import { Patient, AuditLog } from '@/types';
import { findItemBy, filterItems } from '@/utils/storage';
import { Activity, Clock, Filter, Download, Search, Calendar } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function ActivityLogPage() {
  const { session, isLoading } = useAuth();
  const router = useRouter();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [audits, setAudits] = useState<AuditLog[]>([]);
  const [filteredAudits, setFilteredAudits] = useState<AuditLog[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [dateRange, setDateRange] = useState('7'); // days

  useEffect(() => {
    if (!isLoading && (!session || session.role !== 'PATIENT')) {
      router.push('/patient/login');
      return;
    }

    if (session) {
      const patientData = findItemBy<Patient>('patients', p => p.userId === session.userId);
      if (patientData) {
        setPatient(patientData);
        
        const patientAudits = filterItems<AuditLog>('audits', a => a.userId === session.userId);
        setAudits(patientAudits);
        setFilteredAudits(patientAudits);
      }
    }
  }, [session, isLoading, router]);

  useEffect(() => {
    let filtered = audits;

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(audit =>
        audit.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
        audit.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by action type
    if (filterType !== 'all') {
      filtered = filtered.filter(audit =>
        audit.action === filterType
      );
    }

    // Filter by date range
    const daysAgo = parseInt(dateRange);
    if (daysAgo > 0) {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysAgo);
      filtered = filtered.filter(audit =>
        new Date(audit.timestamp) >= cutoffDate
      );
    }

    setFilteredAudits(filtered);
  }, [audits, searchQuery, filterType, dateRange]);

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'LOGIN':
        return '🔐';
      case 'READ_RECORD':
        return '📖';
      case 'WRITE_PRESCRIPTION':
        return '💊';
      case 'CONSENT_GRANTED':
        return '✅';
      case 'CONSENT_REVOKED':
        return '❌';
      case 'QR_GENERATED':
        return '📱';
      default:
        return '📝';
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'LOGIN':
        return 'bg-blue-100 text-blue-800';
      case 'READ_RECORD':
        return 'bg-green-100 text-green-800';
      case 'WRITE_PRESCRIPTION':
        return 'bg-purple-100 text-purple-800';
      case 'CONSENT_GRANTED':
        return 'bg-emerald-100 text-emerald-800';
      case 'CONSENT_REVOKED':
        return 'bg-red-100 text-red-800';
      case 'QR_GENERATED':
        return 'bg-indigo-100 text-indigo-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const actionTypes = ['all', 'LOGIN', 'READ_RECORD', 'WRITE_PRESCRIPTION', 'CONSENT_GRANTED', 'CONSENT_REVOKED', 'QR_GENERATED'];
  const dateRanges = [
    { value: '7', label: 'Last 7 days' },
    { value: '30', label: 'Last 30 days' },
    { value: '90', label: 'Last 3 months' },
    { value: '0', label: 'All time' }
  ];

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  if (!patient) {
    return <div className="flex justify-center items-center h-screen">Patient data not found</div>;
  }

  return (
    <PatientLayout patient={patient}>
      <div className="max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Activity Log</h1>
              <p className="text-gray-600">Track all activities and access to your health records</p>
            </div>
            <Button className="flex items-center space-x-2">
              <Download className="w-5 h-5" />
              <span>Export Log</span>
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="grid md:grid-cols-3 gap-4">
              {/* Search */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Search Activities</label>
                <div className="relative">
                  <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by action or description..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Action Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Action</label>
                <div className="flex items-center space-x-2">
                  <Filter className="w-5 h-5 text-gray-500" />
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {actionTypes.map(type => (
                      <option key={type} value={type}>
                        {type === 'all' ? 'All Actions' : type.replace('_', ' ')}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Date Range */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
                <div className="flex items-center space-x-2">
                  <Calendar className="w-5 h-5 text-gray-500" />
                  <select
                    value={dateRange}
                    onChange={(e) => setDateRange(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {dateRanges.map(range => (
                      <option key={range.value} value={range.value}>
                        {range.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{filteredAudits.length}</div>
              <div className="text-sm text-gray-600">Total Activities</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">
                {filteredAudits.filter(a => a.action === 'READ_RECORD').length}
              </div>
              <div className="text-sm text-gray-600">Record Access</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">
                {filteredAudits.filter(a => a.action === 'CONSENT_GRANTED').length}
              </div>
              <div className="text-sm text-gray-600">Consents Granted</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-indigo-600">
                {filteredAudits.filter(a => a.action === 'QR_GENERATED').length}
              </div>
              <div className="text-sm text-gray-600">QR Codes Generated</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Activity Timeline */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <Activity className="w-6 h-6 text-blue-600" />
                  <h3 className="text-xl font-semibold">Activity Timeline</h3>
                </div>
              </CardHeader>
              <CardContent>
                {filteredAudits.length === 0 ? (
                  <div className="text-center py-12">
                    <Activity className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h4 className="text-lg font-medium text-gray-900 mb-2">No activities found</h4>
                    <p className="text-gray-500">
                      {audits.length === 0 
                        ? 'No activities recorded yet'
                        : 'Try adjusting your search or filter criteria'
                      }
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {filteredAudits.map((audit) => (
                      <div key={audit.id} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                        <div className="text-2xl">{getActionIcon(audit.action)}</div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getActionColor(audit.action)}`}>
                              {audit.action.replace('_', ' ')}
                            </span>
                            <div className="flex items-center text-sm text-gray-500">
                              <Clock className="w-4 h-4 mr-1" />
                              {new Date(audit.timestamp).toLocaleString()}
                            </div>
                          </div>
                          <p className="text-gray-700">{audit.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity Summary */}
          <div>
            <Card>
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <Clock className="w-6 h-6 text-green-600" />
                  <h3 className="text-xl font-semibold">Recent Summary</h3>
                </div>
              </CardHeader>
              <CardContent>
                <ActivityFeed 
                  activities={generatePatientActivities().slice(0, 5)}
                  title=""
                  showPriority={true}
                />
              </CardContent>
            </Card>

            {/* Security Overview */}
            <Card className="mt-6">
              <CardHeader>
                <h3 className="text-lg font-semibold">Security Overview</h3>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Last Login</span>
                    <span className="font-medium">Today</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Active Sessions</span>
                    <span className="font-medium">1</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Data Access</span>
                    <span className="font-medium text-green-600">Secure</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Privacy Level</span>
                    <span className="font-medium text-blue-600">High</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </PatientLayout>
  );
}

