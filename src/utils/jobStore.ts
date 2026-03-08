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
import { db } from '../firebase';

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
  type: string; // Full-Time, Part-Time, etc.
  workplace: string; // On-Site, Remote, Hybrid
  salary: string;
  department?: string;
  description: string;
  gender?: string;
  nationality?: string;
  experience?: string;
  customQuestion?: string; // Kept for backward compatibility
  customQuestions?: CustomQuestion[];
  enableCustomQuestions?: boolean;
  googleFormLink?: string;
  testMcq?: string; // Kept for backward compatibility
  testMcqs?: MCQQuestion[];
  status: 'draft' | 'published';
  createdAt: string;
}

const COLLECTION_NAME = 'hr_jobs';

export const getJobs = async (companyId?: string): Promise<Job[]> => {
  const jobsRef = collection(db, COLLECTION_NAME);
  const q = companyId ? query(jobsRef, where('companyId', '==', companyId)) : jobsRef;
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({
    ...doc.data(),
    id: doc.id
  } as Job));
};

export const subscribeToJobs = (callback: (jobs: Job[]) => void, companyId?: string) => {
  const jobsRef = collection(db, COLLECTION_NAME);
  const q = companyId ? query(jobsRef, where('companyId', '==', companyId)) : jobsRef;
  
  return onSnapshot(q, (snapshot) => {
    const jobs = snapshot.docs.map(doc => ({
      ...doc.data(),
      id: doc.id
    } as Job));
    callback(jobs);
    
    // Maintain the event for legacy components if needed
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('jobUpdated'));
    }
  });
};

export const saveJob = async (job: Omit<Job, 'id' | 'createdAt'>) => {
  const newJob = {
    ...job,
    createdAt: new Date().toISOString(),
  };
  const docRef = await addDoc(collection(db, COLLECTION_NAME), newJob);
  
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('jobUpdated'));
  }
  
  return { ...newJob, id: docRef.id };
};

export const updateJob = async (id: string, job: Partial<Omit<Job, 'id' | 'createdAt'>>) => {
  const docRef = doc(db, COLLECTION_NAME, id);
  await updateDoc(docRef, job);
  
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('jobUpdated'));
  }
};

export const updateJobStatus = async (id: string, status: Job['status']) => {
  const docRef = doc(db, COLLECTION_NAME, id);
  await updateDoc(docRef, { status });
  
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('jobUpdated'));
  }
};
