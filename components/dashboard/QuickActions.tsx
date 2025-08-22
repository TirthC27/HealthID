'use client';

import React from 'react';
import { Card, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Plus, QrCode, FileText, Calendar, Users, Pill, Search, Bell } from 'lucide-react';

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  onClick: () => void;
}

interface QuickActionsProps {
  actions: QuickAction[];
  title: string;
  columns?: number;
}

export function QuickActions({ actions, title, columns = 2 }: QuickActionsProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <h3 className="text-lg font-semibold mb-4">{title}</h3>
        <div className={`grid grid-cols-1 ${columns === 2 ? 'md:grid-cols-2' : 'md:grid-cols-3'} gap-4`}>
          {actions.map((action) => (
            <button
              key={action.id}
              onClick={action.onClick}
              className="p-4 rounded-lg border-2 border-gray-100 hover:border-blue-200 hover:bg-blue-50 transition-all duration-200 text-left group"
            >
              <div className="flex items-start space-x-3">
                <div className={`flex-shrink-0 w-10 h-10 rounded-lg ${action.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                  {action.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium text-gray-900 group-hover:text-blue-900">
                    {action.title}
                  </h4>
                  <p className="text-xs text-gray-500 mt-1 group-hover:text-blue-700">
                    {action.description}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// Quick action generators
export function generatePatientQuickActions(callbacks: {
  onAddRecord: () => void;
  onGenerateQR: () => void;
  onViewRecords: () => void;
  onScheduleAppointment: () => void;
}): QuickAction[] {
  return [
    {
      id: 'add-record',
      title: 'Add Health Record',
      description: 'Log new medical information',
      icon: <Plus className="w-5 h-5 text-white" />,
      color: 'bg-blue-500',
      onClick: callbacks.onAddRecord
    },
    {
      id: 'generate-qr',
      title: 'Generate QR Code',
      description: 'Share access with doctors',
      icon: <QrCode className="w-5 h-5 text-white" />,
      color: 'bg-purple-500',
      onClick: callbacks.onGenerateQR
    },
    {
      id: 'view-records',
      title: 'View All Records',
      description: 'Browse your health history',
      icon: <FileText className="w-5 h-5 text-white" />,
      color: 'bg-green-500',
      onClick: callbacks.onViewRecords
    },
    {
      id: 'schedule',
      title: 'Schedule Appointment',
      description: 'Book with your doctor',
      icon: <Calendar className="w-5 h-5 text-white" />,
      color: 'bg-orange-500',
      onClick: callbacks.onScheduleAppointment
    }
  ];
}

export function generateDoctorQuickActions(callbacks: {
  onScanQR: () => void;
  onViewPatients: () => void;
  onWritePrescription: () => void;
  onViewSchedule: () => void;
}): QuickAction[] {
  return [
    {
      id: 'scan-qr',
      title: 'Scan Patient QR',
      description: 'Access patient records',
      icon: <QrCode className="w-5 h-5 text-white" />,
      color: 'bg-blue-500',
      onClick: callbacks.onScanQR
    },
    {
      id: 'view-patients',
      title: 'Patient List',
      description: 'View all patients',
      icon: <Users className="w-5 h-5 text-white" />,
      color: 'bg-green-500',
      onClick: callbacks.onViewPatients
    },
    {
      id: 'prescribe',
      title: 'Write Prescription',
      description: 'Create new prescription',
      icon: <Pill className="w-5 h-5 text-white" />,
      color: 'bg-purple-500',
      onClick: callbacks.onWritePrescription
    },
    {
      id: 'schedule',
      title: 'Today\'s Schedule',
      description: 'View appointments',
      icon: <Calendar className="w-5 h-5 text-white" />,
      color: 'bg-orange-500',
      onClick: callbacks.onViewSchedule
    }
  ];
}
