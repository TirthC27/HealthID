'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@/types';
import { getSession, clearSession } from '@/utils/auth';
import { findItem } from '@/utils/storage';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  isLoading: boolean;
  logout: () => void;
  refreshSession: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshSession = () => {
    const currentSession = getSession();
    setSession(currentSession);
    
    if (currentSession) {
      const userData = findItem<User>('users', currentSession.userId);
      setUser(userData);
    } else {
      setUser(null);
    }
    setIsLoading(false);
  };

  const logout = () => {
    clearSession();
    setSession(null);
    setUser(null);
  };

  useEffect(() => {
    refreshSession();
  }, []);

  return (
    <AuthContext.Provider value={{
      session,
      user,
      isLoading,
      logout,
      refreshSession
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
