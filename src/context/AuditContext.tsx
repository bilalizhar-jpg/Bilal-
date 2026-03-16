import React, { createContext, useContext, useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, doc, setDoc, orderBy, limit } from 'firebase/firestore';
import { db } from '../firebase';
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
  const { user } = useAuth();
  const activeCompanyId = user?.currentCompanyId || user?.companyId;

  useEffect(() => {
    if (!activeCompanyId) {
      setLogs([]);
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, 'auditLogs'),
      where('companyId', '==', activeCompanyId),
      orderBy('timestamp', 'desc'),
      limit(1000)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const logsData = snapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id
      })) as AuditLog[];
      setLogs(logsData);
      setLoading(false);
    }, (err) => {
      console.error('Error fetching audit logs:', err);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [activeCompanyId]);

  const logAction = async (action: string, module: string, description: string, recordId?: string) => {
    if (!user) return;

    const id = Math.random().toString(36).substr(2, 9);
    const log: AuditLog = {
      id,
      companyId: activeCompanyId || 'system',
      userId: user.id,
      userName: user.name,
      action,
      module,
      recordId,
      description,
      timestamp: new Date().toISOString(),
    };

    try {
      await setDoc(doc(db, 'auditLogs', id), log);
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
