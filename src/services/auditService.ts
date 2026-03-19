import { api } from './api';

export interface AuditLogData {
  companyId: string;
  userId: string;
  userName: string;
  action: string;
  module: string;
  recordId?: string;
  description: string;
  timestamp: string;
}

export const logAuditAction = async (data: Omit<AuditLogData, 'timestamp'>) => {
  const id = Math.random().toString(36).substr(2, 9);
  const log: AuditLogData = {
    ...data,
    id,
    timestamp: new Date().toISOString(),
  };

  try {
    await api.post('auditLogs', log);
  } catch (error) {
    console.error('Error saving audit log:', error);
  }
};
