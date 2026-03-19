import { api } from '../services/api';

export interface AppraisalRecord {
  id: string;
  employeeName: string;
  employeeId: string;
  department: string;
  appraisalDate: string;
  period: string;
  score: number;
  status: 'Draft' | 'Completed';
  createdAt?: string;
}

const COLLECTION_NAME = 'appraisals';

export const saveAppraisal = async (appraisal: Omit<AppraisalRecord, 'id'>) => {
  const id = Math.random().toString(36).substr(2, 9);
  await api.post(COLLECTION_NAME, { ...appraisal, id, createdAt: new Date().toISOString() });
  return id;
};

export const getAppraisals = async (companyId?: string) => {
  try {
    const params = companyId ? { companyId } : {};
    const data = await api.get<AppraisalRecord[]>(COLLECTION_NAME, params);
    const list = Array.isArray(data) ? data : [];
    return list.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
  } catch (error) {
    console.error('Error getting appraisals:', error);
    return [];
  }
};

export const deleteAppraisal = async (id: string) => {
  await api.delete(COLLECTION_NAME, id);
};
