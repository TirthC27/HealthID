'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  FileText, 
  Users, 
  QrCode, 
  TrendingUp, 
  Activity,
  Shield,
  ChevronLeft,
  ChevronRight,
  User,
  Heart,
  Pill
} from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface SidebarItem {
  id: string;
  label: string;
  href: string;
  icon: React.ReactNode;
  description: string;
}

const sidebarItems: SidebarItem[] = [
  {
    id: 'overview',
    label: 'Overview',
    href: '/patient/dashboard',
    icon: <LayoutDashboard className="w-5 h-5" />,
    description: 'Dashboard & health metrics'
  },
  {
    id: 'health-records',
    label: 'Health Records',
    href: '/patient/dashboard/records',
    icon: <FileText className="w-5 h-5" />,
    description: 'Medical history & documents'
  },
  {
    id: 'prescriptions',
    label: 'Prescriptions',
    href: '/patient/dashboard/prescriptions',
    icon: <Pill className="w-5 h-5" />,
    description: 'Prescribed medications'
  },
  {
    id: 'family-data',
    label: 'Family Data',
    href: '/patient/dashboard/family',
    icon: <Users className="w-5 h-5" />,
    description: 'Parents & family history'
  },
  {
    id: 'qr-access',
    label: 'QR & Access',
    href: '/patient/dashboard/qr-access',
    icon: <QrCode className="w-5 h-5" />,
    description: 'QR codes & permissions'
  }
];

interface PatientSidebarProps {
  patient: {
    profile: { name: string };
    hcid: string;
  };
}

export function PatientSidebar({ patient }: PatientSidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();

  return (
    <div className={`bg-gradient-to-b from-white to-orange-50 border-r border-orange-200 transition-all duration-300 ${
      isCollapsed ? 'w-16' : 'w-64'
    } flex flex-col h-screen sticky top-0 shadow-lg`}>
      {/* Header */}
      <div className="p-4 border-b border-orange-200 bg-gradient-to-r from-orange-50 to-white">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full flex items-center justify-center shadow-md">
                <User className="w-5 h-5 text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="text-sm font-semibold text-gray-900 truncate">
                  {patient.profile.name}
                </h2>
                <p className="text-xs text-gray-500 font-mono">
                  {patient.hcid}
                </p>
              </div>
            </div>
          )}
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1.5 h-8 w-8 hover:bg-orange-100 border-orange-200"
          >
            {isCollapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronLeft className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1">
        {sidebarItems.map((item) => {
          const isActive = pathname === item.href;
          
          return (
            <Link
              key={item.id}
              href={item.href}
              className={`flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group ${
                isActive
                  ? 'bg-gradient-to-r from-orange-100 to-orange-50 text-orange-700 border border-orange-200 shadow-sm'
                  : 'text-gray-700 hover:bg-gradient-to-r hover:from-orange-50 hover:to-white hover:text-orange-600 hover:shadow-sm'
              }`}
            >
              <div className={`${isActive ? 'text-orange-600' : 'text-gray-400 group-hover:text-orange-500'}`}>
                {item.icon}
              </div>
              {!isCollapsed && (
                <div className="ml-3 min-w-0 flex-1">
                  <div className="font-medium">{item.label}</div>
                  <div className="text-xs text-gray-500 truncate">
                    {item.description}
                  </div>
                </div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-orange-200 bg-gradient-to-r from-white to-orange-50">
        {!isCollapsed && (
          <div className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-lg p-3 border border-orange-200 shadow-sm">
            <div className="flex items-center space-x-2 mb-2">
              <Heart className="w-4 h-4 text-orange-500" />
              <span className="text-sm font-medium text-gray-900">Health Score</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-600">Overall wellness</span>
              <span className="text-sm font-bold text-orange-600">85/100</span>
            </div>
            <div className="w-full bg-orange-200 rounded-full h-1.5 mt-2">
              <div className="bg-gradient-to-r from-orange-500 to-orange-600 h-1.5 rounded-full shadow-sm" style={{ width: '85%' }}></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
