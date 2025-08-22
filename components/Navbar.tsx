'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from './ui/Button';
import { Heart, LogOut, User, Stethoscope } from 'lucide-react';

export function Navbar() {
  const { session, logout } = useAuth();

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <Heart className="w-8 h-8 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">Health Record Portal</span>
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            {session ? (
              <>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  {session.role === 'PATIENT' ? (
                    <User className="w-4 h-4" />
                  ) : (
                    <Stethoscope className="w-4 h-4" />
                  )}
                  <span>{session.email}</span>
                </div>
                
                <Link href={`/${session.role.toLowerCase()}/dashboard`}>
                  <Button variant="secondary" className="text-sm">
                    Dashboard
                  </Button>
                </Link>
                
                <Button
                  variant="secondary"
                  onClick={logout}
                  className="text-sm flex items-center space-x-1"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </Button>
              </>
            ) : (
              <div className="flex items-center space-x-2">
                <Link href="/patient/login">
                  <Button variant="secondary" className="text-sm">
                    Patient Login
                  </Button>
                </Link>
                <Link href="/doctor/login">
                  <Button variant="primary" className="text-sm">
                    Doctor Login
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
