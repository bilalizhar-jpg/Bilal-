import { api } from '../services/api';

export interface CustomQuestion {
  id: string;
  question: string;
  type: 'text' | 'boolean';
}

export interface MCQOption {
  id: string;
  text: string;
  isCorrect: boolean;
}

export interface MCQQuestion {
  id: string;
  question: string;
  options: MCQOption[];
}

export interface Job {
  id: string;
  companyId: string;
  title: string;
  location: string;
  type: string;
  workplace: string;
  salary: string;
  department?: string;
  description: string;
  gender?: string;
  nationality?: string;
  experience?: string;
  customQuestion?: string;
  customQuestions?: CustomQuestion[];
  enableCustomQuestions?: boolean;
  googleFormLink?: string;
  testMcq?: string;
  testMcqs?: MCQQuestion[];
  status: 'draft' | 'published';
  createdAt: string;
}

const COLLECTION_NAME = 'hr_jobs';

export const getJobs = async (companyId?: string): Promise<Job[]> => {
  const params = companyId ? { companyId } : {};
  const data = await api.get<Job[]>(COLLECTION_NAME, params);
  return Array.isArray(data) ? data : [];
};

export const subscribeToJobs = (callback: (jobs: Job[]) => void, companyId?: string) => {
  const fetch = () => getJobs(companyId).then(callback);
  fetch();
  const interval = setInterval(fetch, 15000);
  return () => clearInterval(interval);
};

export const saveJob = async (job: Omit<Job, 'id' | 'createdAt'>) => {
  const id = Math.random().toString(36).substr(2, 9);
  const newJob = { ...job, id, createdAt: new Date().toISOString() };
  await api.post(COLLECTION_NAME, newJob);
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('jobUpdated'));
  }
  return { ...newJob, id };
};

export const updateJob = async (id: string, job: Partial<Omit<Job, 'id' | 'createdAt'>>) => {
  await api.put(COLLECTION_NAME, id, job);
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('jobUpdated'));
  }
};

export const updateJobStatus = async (id: string, status: Job['status']) => {
  await api.put(COLLECTION_NAME, id, { status });
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('jobUpdated'));
  }
};
