import { api } from '../services/api';

export interface Candidate {
  id: string;
  companyId: string;
  jobId?: string;
  jobTitle?: string;
  candidateName: string;
  email: string;
  phone?: string;
  cvFileName?: string;
  cvUrl?: string;
  cvText?: string;
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

const COLLECTION_NAME = 'candidates';

export const parseCV = async (cvText: string): Promise<Partial<Candidate>> => {
  const skills = ['React', 'TypeScript', 'Node.js', 'MongoDB'].filter((skill) =>
    cvText.toLowerCase().includes(skill.toLowerCase())
  );
  return { skills };
};

export const getCandidates = async (companyId?: string): Promise<Candidate[]> => {
  const params = companyId ? { companyId } : {};
  const data = await api.get<Candidate[]>(COLLECTION_NAME, params);
  return Array.isArray(data) ? data : [];
};

export const subscribeToCandidates = (callback: (candidates: Candidate[]) => void, companyId?: string) => {
  const fetch = () => getCandidates(companyId).then(callback);
  fetch();
  const interval = setInterval(fetch, 10000);
  return () => clearInterval(interval);
};

export const saveCandidate = async (candidate: Omit<Candidate, 'id' | 'stage' | 'appliedAt'>) => {
  const parsedData = candidate.cvText ? await parseCV(candidate.cvText) : {};
  const id = Math.random().toString(36).substr(2, 9);
  const newCandidate = {
    ...candidate,
    ...parsedData,
    id,
    stage: 'New Candidates' as const,
    appliedAt: new Date().toISOString(),
    matchPercentage: candidate.matchPercentage ?? Math.floor(Math.random() * 60) + 40,
  };
  await api.post(COLLECTION_NAME, newCandidate);
  return { ...newCandidate, id };
};

export const updateCandidateStage = async (id: string, stage: Candidate['stage']) => {
  await api.put(COLLECTION_NAME, id, { stage });
};

const API_URL = '/api';
const getHeaders = () => {
  const token = localStorage.getItem('auth_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const uploadCV = async (companyId: string, file: File): Promise<string> => {
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
