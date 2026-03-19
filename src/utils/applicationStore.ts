import { api } from '../services/api';

export interface Application {
  id: string;
  companyId: string;
  jobId: string;
  jobTitle: string;
  candidateName: string;
  email: string;
  phone: string;
  cvFileName: string;
  cvUrl?: string;
  stage: 'New Candidates' | 'Interested' | 'Shortlisted' | 'Client Submission' | 'Client Interview' | 'Offered' | 'Hired' | 'Dropped';
  appliedAt: string;
  matchPercentage?: number;
  skills?: string[];
  education?: string;
  university?: string;
  country?: string;
  currentJobTitle?: string;
  expectedSalary?: string;
  location?: string;
  cvText?: string;
  industry?: string;
  gender?: string;
  category?: string;
  customQuestionAnswer?: string;
  customQuestionAnswers?: { question: string; answer: string }[];
  mcqAnswers?: {
    questionId: string;
    question: string;
    selectedOptionId: string;
    selectedOptionText: string;
    isCorrect: boolean;
  }[];
}

const COLLECTION_NAME = 'hr_applications';

export const getApplications = async (companyId?: string): Promise<Application[]> => {
  const params = companyId ? { companyId } : {};
  const data = await api.get<Application[]>(COLLECTION_NAME, params);
  return Array.isArray(data) ? data : [];
};

export const subscribeToApplications = (callback: (applications: Application[]) => void, companyId?: string) => {
  const fetch = () => getApplications(companyId).then(callback);
  fetch();
  const interval = setInterval(fetch, 10000);
  return () => clearInterval(interval);
};

export const saveApplication = async (application: Omit<Application, 'id' | 'stage' | 'appliedAt'>) => {
  const id = Math.random().toString(36).substr(2, 9);
  const newApplication = {
    ...application,
    id,
    stage: 'New Candidates' as const,
    appliedAt: new Date().toISOString(),
    matchPercentage: application.matchPercentage ?? Math.floor(Math.random() * 60) + 40,
  };
  await api.post(COLLECTION_NAME, newApplication);
  return { ...newApplication, id };
};

export const updateApplicationStage = async (id: string, stage: Application['stage']) => {
  await api.put(COLLECTION_NAME, id, { stage });
};

const API_URL = '/api';
const getHeaders = () => {
  const token = localStorage.getItem('auth_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const uploadCV = async (companyId: string, jobId: string, file: File): Promise<string> => {
  const formData = new FormData();
  formData.append('file', file);
  const res = await fetch(`${API_URL}/upload`, {
    method: 'POST',
    headers: getHeaders(),
    body: formData,
  });
  if (!res.ok) throw new Error('Upload failed');
  const data = await res.json();
  const path = data.url || `/uploads/${data.filename}`;
  return path.startsWith('http') ? path : `${window.location.origin}${path.startsWith('/') ? '' : '/'}${path}`;
};
