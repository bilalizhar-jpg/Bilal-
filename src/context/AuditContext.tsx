import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from './AuthContext';

export interface AuditLog {
  id: string;
  companyId: string;
  userId: string;
  userName: string;
  action: string;
  module: string;
  recordId?: string;
  description: string;
  timestamp: string;
}

interface AuditContextType {
  logs: AuditLog[];
  loading: boolean;
  logAction: (action: string, module: string, description: string, recordId?: string) => Promise<void>;
}

const AuditContext = createContext<AuditContextType | undefined>(undefined);

export function AuditProvider({ children }: { children: React.ReactNode }) {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, isAuthReady } = useAuth();
  const activeCompanyId = user?.currentCompanyId || user?.companyId;

  useEffect(() => {
    if (!isAuthReady || !activeCompanyId) {
      setLogs([]);
      setLoading(false);
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const data = await api.get<AuditLog[]>('auditLogs', { companyId: activeCompanyId });
        if (!cancelled) {
          const sorted = (Array.isArray(data) ? data : []).sort(
            (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
          );
          setLogs(sorted.slice(0, 1000));
        }
      } catch (e) {
        if (!cancelled) setLogs([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [activeCompanyId, isAuthReady]);

  const logAction = async (action: string, module: string, description: string, recordId?: string) => {
    if (!user || !activeCompanyId) return;

    const id = Math.random().toString(36).substr(2, 9);
    const log: AuditLog = {
      id,
      companyId: activeCompanyId,
      userId: user.id,
      userName: user.name,
      action,
      module,
      recordId,
      description,
      timestamp: new Date().toISOString(),
    };

    try {
      await api.post('auditLogs', log);
      setLogs((prev) => [log, ...prev].slice(0, 1000));
    } catch (error) {
      console.error('Error saving audit log:', error);
    }
  };

  return (
    <AuditContext.Provider value={{ logs, loading, logAction }}>
      {children}
    </AuditContext.Provider>
  );
}

export function useAudit() {
  const context = useContext(AuditContext);
  if (context === undefined) {
    throw new Error('useAudit must be used within an AuditProvider');
  }
  return context;
}
