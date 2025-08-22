import { AuditLog } from '@/types';
import { pushItem } from './storage';
import { generateId } from './auth';

export function logAudit(
  userId: string,
  action: AuditLog['action'],
  details: string,
  targetId?: string
) {
  const auditLog: AuditLog = {
    id: generateId(),
    userId,
    action,
    targetId,
    details,
    timestamp: new Date().toISOString(),
  };
  
  pushItem('audits', auditLog);
}
