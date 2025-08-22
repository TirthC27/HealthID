'use client';

import React from 'react';
import { DoctorSidebar } from './DoctorSidebar';

interface DoctorLayoutProps {
  children: React.ReactNode;
  doctor: {
    name: string;
    specialization?: string;
  };
}

export function DoctorLayout({ children, doctor }: DoctorLayoutProps) {
  return (
    <div className="flex h-screen bg-gray-50">
      <DoctorSidebar doctor={doctor} />
      <main className="flex-1 overflow-auto">
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  );
}

