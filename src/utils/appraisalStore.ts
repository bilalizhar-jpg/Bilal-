import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  deleteDoc, 
  doc, 
  updateDoc,
  orderBy,
  Timestamp
} from 'firebase/firestore';
import { db } from '../firebase';

export interface AppraisalRecord {
  id: string;
  employeeName: string;
  employeeId: string;
  department: string;
  appraisalDate: string;
  period: string;
  score: number;
  status: 'Draft' | 'Completed';
  createdAt?: any;
}

const COLLECTION_NAME = 'appraisals';

export const saveAppraisal = async (appraisal: Omit<AppraisalRecord, 'id'>) => {
  try {
    const docRef = await addDoc(collection(db, COLLECTION_NAME), {
      ...appraisal,
      createdAt: Timestamp.now()
    });
    return docRef.id;
  } catch (error) {
    console.error("Error saving appraisal:", error);
    throw error;
  }
};

export const getAppraisals = async (companyId?: string) => {
  try {
    const q = query(
      collection(db, COLLECTION_NAME),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as AppraisalRecord[];
  } catch (error) {
    console.error("Error getting appraisals:", error);
    return [];
  }
};

export const deleteAppraisal = async (id: string) => {
  try {
    await deleteDoc(doc(db, COLLECTION_NAME, id));
  } catch (error) {
    console.error("Error deleting appraisal:", error);
    throw error;
  }
};
