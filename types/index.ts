export interface User {
  id: string;
  role: "PATIENT" | "DOCTOR";
  email: string;
  passwordHash: string;
  status: "ACTIVE" | "SUSPENDED";
  createdAt: string;
}

export interface Patient {
  id: string;
  userId: string;
  hcid: string;
  profile: {
    name: string;
    dob: string;
    gender: string;
  };
  records: Record[];
  parents: Parent[];
}

export interface Parent {
  id: string;
  name: string;
  relation: "Father" | "Mother" | "Guardian";
  conditions: {
    diabetes?: boolean;
    hypertension?: boolean;
    heartDisease?: boolean;
    cancer?: boolean;
    asthma?: boolean;
    other?: string;
  };
}

export interface Doctor {
  id: string;
  userId: string;
  name: string;
  specialty: string;
}

export interface Record {
  id: string;
  type: string;
  description: string;
  notes: string;
  createdAt: string;
}

export interface Consent {
  id: string;
  patientId: string;
  doctorId: string;
  scopes: string[];
  expiresAt: string;
  createdAt: string;
  status: "ACTIVE" | "REVOKED";
}

export interface Prescription {
  id: string;
  patientId: string;
  doctorId: string;
  meds: {
    name: string;
    dose: string;
    duration: string;
  }[];
  createdAt: string;
}

export interface Appointment {
  id: string;
  patientId: string;
  doctorId: string;
  patientName: string;
  doctorName: string;
  date: string;
  time: string;
  reason: string;
  status: "SCHEDULED" | "COMPLETED" | "CANCELLED";
  notes?: string;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  action: "LOGIN" | "READ_RECORD" | "WRITE_PRESCRIPTION" | "CONSENT_GRANTED" | "CONSENT_REVOKED" | "QR_GENERATED" | "QR_SCANNED" | "APPOINTMENT_BOOKED" | "APPOINTMENT_CANCELLED";
  targetId?: string;
  details: string;
  timestamp: string;
}

export interface QRToken {
  token: string;
  hcid: string;
  expiresAt: string;
  createdAt: string;
}

export interface Session {
  userId: string;
  role: "PATIENT" | "DOCTOR";
  email: string;
  expiresAt: string;
}
