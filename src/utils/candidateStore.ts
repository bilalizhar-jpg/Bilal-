import { 
  collection, 
  addDoc, 
  updateDoc, 
  doc, 
  getDocs, 
  query, 
  where,
  onSnapshot
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../firebase';

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
    isCorrect: boolean 
  }[];
}

const COLLECTION_NAME = 'candidates';

// Placeholder for CV parsing system
export const parseCV = async (cvText: string): Promise<Partial<Candidate>> => {
  // In a real system, this would call an AI/OCR service to extract fields.
  // For now, we simulate extraction.
  const skills = ['React', 'TypeScript', 'Firebase', 'Node.js'].filter(skill => 
    cvText.toLowerCase().includes(skill.toLowerCase())
  );
  
  return {
    skills,
    // Add more extraction logic here
  };
};

export const getCandidates = async (companyId?: string): Promise<Candidate[]> => {
  const candidatesRef = collection(db, COLLECTION_NAME);
  const q = companyId ? query(candidatesRef, where('companyId', '==', companyId)) : candidatesRef;
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({
    ...doc.data(),
    id: doc.id
  } as Candidate));
};

export const subscribeToCandidates = (callback: (candidates: Candidate[]) => void, companyId?: string) => {
  const candidatesRef = collection(db, COLLECTION_NAME);
  const q = companyId ? query(candidatesRef, where('companyId', '==', companyId)) : candidatesRef;
  
  return onSnapshot(q, (snapshot) => {
    const candidates = snapshot.docs.map(doc => ({
      ...doc.data(),
      id: doc.id
    } as Candidate));
    callback(candidates);
  });
};

export const saveCandidate = async (candidate: Omit<Candidate, 'id' | 'stage' | 'appliedAt'>) => {
  const parsedData = candidate.cvText ? await parseCV(candidate.cvText) : {};
  
  const newCandidate = {
    ...candidate,
    ...parsedData,
    stage: 'New Candidates' as const,
    appliedAt: new Date().toISOString(),
    matchPercentage: candidate.matchPercentage || Math.floor(Math.random() * 60) + 40,
  };
  const docRef = await addDoc(collection(db, COLLECTION_NAME), newCandidate);
  return { ...newCandidate, id: docRef.id };
};

export const updateCandidateStage = async (id: string, stage: Candidate['stage']) => {
  const docRef = doc(db, COLLECTION_NAME, id);
  await updateDoc(docRef, { stage });
};

export const uploadCV = async (companyId: string, file: File): Promise<string> => {
  console.log(`[Storage] Uploading ${file.name} to companies/${companyId}/candidates/`);
  try {
    const fileRef = ref(storage, `companies/${companyId}/candidates/${Date.now()}_${file.name}`);
    console.log(`[Storage] File reference created: ${fileRef.fullPath}`);
    await uploadBytes(fileRef, file, { contentType: file.type });
    console.log(`[Storage] Upload successful`);
    return getDownloadURL(fileRef);
  } catch (error) {
    console.error(`[Storage] Upload failed:`, error);
    throw error;
  }
};
