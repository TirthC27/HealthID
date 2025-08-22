import { User, Session } from '@/types';
import { load, save, pushItem, findItemBy } from './storage';

export function hashPassword(password: string): string {
  // Simple hash for demo purposes - in real app use bcrypt
  return btoa(password);
}

export function verifyPassword(password: string, hash: string): boolean {
  return btoa(password) === hash;
}

export function generateId(): string {
  return Math.random().toString(36).substr(2, 9);
}

export function generateHCID(): string {
  const part1 = Math.random().toString(36).substr(2, 4).toUpperCase();
  const part2 = Math.random().toString(36).substr(2, 4).toUpperCase();
  return `HCID-${part1}-${part2}`;
}

export function generateToken(): string {
  // Generate a more unique token using timestamp + random
  const timestamp = Date.now().toString(36);
  const random1 = Math.random().toString(36).substr(2, 8);
  const random2 = Math.random().toString(36).substr(2, 8);
  return `${timestamp}-${random1}-${random2}`;
}

export function createSession(user: User): Session {
  const session: Session = {
    userId: user.id,
    role: user.role,
    email: user.email,
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
  };
  save('session', session);
  return session;
}

export function getSession(): Session | null {
  const session = load<Session | null>('session', null);
  if (session && new Date(session.expiresAt) > new Date()) {
    return session;
  }
  clearSession();
  return null;
}

export function clearSession() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('session');
  }
}

export function registerUser(email: string, password: string, role: 'PATIENT' | 'DOCTOR'): User {
  const existingUser = findItemBy<User>('users', user => user.email === email);
  if (existingUser) {
    throw new Error('User already exists');
  }

  const user: User = {
    id: generateId(),
    role,
    email,
    passwordHash: hashPassword(password),
    status: 'ACTIVE',
    createdAt: new Date().toISOString(),
  };

  pushItem('users', user);
  return user;
}

export function loginUser(email: string, password: string): User {
  const user = findItemBy<User>('users', u => u.email === email);
  if (!user || !verifyPassword(password, user.passwordHash)) {
    throw new Error('Invalid credentials');
  }
  if (user.status !== 'ACTIVE') {
    throw new Error('Account suspended');
  }
  return user;
}
