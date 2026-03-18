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
    isCorrect: boolean 
  }[];
}

const COLLECTION_NAME = 'hr_applications';

export const getApplications = async (companyId?: string): Promise<Application[]> => {
  const appsRef = collection(db, COLLECTION_NAME);
  const q = companyId ? query(appsRef, where('companyId', '==', companyId)) : appsRef;
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({
    ...doc.data(),
    id: doc.id
  } as Application));
};

export const subscribeToApplications = (callback: (applications: Application[]) => void, companyId?: string) => {
  const appsRef = collection(db, COLLECTION_NAME);
  const q = companyId ? query(appsRef, where('companyId', '==', companyId)) : appsRef;
  
  return onSnapshot(q, (snapshot) => {
    const applications = snapshot.docs.map(doc => ({
      ...doc.data(),
      id: doc.id
    } as Application));
    callback(applications);
  });
};

export const saveApplication = async (application: Omit<Application, 'id' | 'stage' | 'appliedAt'>) => {
  const newApplication = {
    ...application,
    stage: 'New Candidates' as const,
    appliedAt: new Date().toISOString(),
    matchPercentage: application.matchPercentage || Math.floor(Math.random() * 60) + 40, // Mock 40-100%
  };
  const docRef = await addDoc(collection(db, COLLECTION_NAME), newApplication);
  return { ...newApplication, id: docRef.id };
};

export const updateApplicationStage = async (id: string, stage: Application['stage']) => {
  const docRef = doc(db, COLLECTION_NAME, id);
  await updateDoc(docRef, { stage });
};

export const uploadCV = async (companyId: string, jobId: string, file: File): Promise<string> => {
  console.log(`[Storage] Uploading ${file.name} to companies/${companyId}/jobs/${jobId}/applications/`);
  try {
    const fileRef = ref(storage, `companies/${companyId}/jobs/${jobId}/applications/${Date.now()}_${file.name}`);
    console.log(`[Storage] File reference created: ${fileRef.fullPath}`);
    await uploadBytes(fileRef, file, { contentType: file.type });
    console.log(`[Storage] Upload successful`);
    return getDownloadURL(fileRef);
  } catch (error) {
    console.error(`[Storage] Upload failed:`, error);
    throw error;
  }
};
