import { doc, setDoc} from 'firebase/firestore';
import { db} from '../firebase';

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
 timestamp: new Date().toISOString(),
};

 try {
 await setDoc(doc(db, 'auditLogs', id), log);
} catch (error) {
 console.error('Error saving audit log:', error);
}
};
