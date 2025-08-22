'use client';

import React from 'react';
import { PatientSidebar } from './PatientSidebar';

interface PatientLayoutProps {
  children: React.ReactNode;
  patient: {
    profile: { name: string };
    hcid: string;
  };
}

export function PatientLayout({ children, patient }: PatientLayoutProps) {
  return (
    <div className="flex h-screen bg-gray-50">
      <PatientSidebar patient={patient} />
      <main className="flex-1 overflow-auto">
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  );
}
