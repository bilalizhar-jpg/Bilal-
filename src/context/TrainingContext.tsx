import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { 
  collection, 
  onSnapshot, 
  doc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query,
  where
} from 'firebase/firestore';
import { db } from '../firebase';
import { handleFirestoreError, OperationType } from '../utils/firestoreErrorHandler';

export interface TrainingProgram {
  id: string;
  companyId: string;
  name: string;
  trainingType: string;
  description: string;
  duration: string;
  cost: number;
  capacity: number;
  status: 'Active' | 'Inactive';
  materials?: string;
  prerequisites?: string;
  isMandatory: boolean;
  allowSelfEnrollment: boolean;
  selectedEmployees: string[];
  acceptedEmployees: string[];
}

interface TrainingContextType {
  programs: TrainingProgram[];
  addProgram: (program: Omit<TrainingProgram, 'companyId' | 'id'>) => void;
  updateProgram: (id: string, program: Partial<TrainingProgram>) => void;
  deleteProgram: (id: string) => void;
  acceptTraining: (programId: string, employeeId: string) => void;
  loading: boolean;
}

const TrainingContext = createContext<TrainingContextType | undefined>(undefined);

export const useTraining = () => {
  const context = useContext(TrainingContext);
  if (!context) {
    throw new Error('useTraining must be used within a TrainingProvider');
  }
  return context;
};

export const TrainingProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [allPrograms, setAllPrograms] = useState<TrainingProgram[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'trainingPrograms'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const programsData = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as TrainingProgram));
      setAllPrograms(programsData);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'trainingPrograms');
    });

    return () => unsubscribe();
  }, []);

  const programs = allPrograms.filter(p => p.companyId === user?.companyId);

  const addProgram = async (program: Omit<TrainingProgram, 'companyId' | 'id'>) => {
    if (!user?.companyId) return;
    const id = Date.now().toString();
    const newProgram: TrainingProgram = {
      ...program,
      id,
      companyId: user.companyId,
    };
    
    console.log("Adding training program:", newProgram);
    try {
      await setDoc(doc(db, 'trainingPrograms', id), newProgram);
      console.log("Training program added successfully");
    } catch (error) {
      console.error("Error adding training program:", error);
    }
  };

  const updateProgram = async (id: string, updatedFields: Partial<TrainingProgram>) => {
    try {
      await updateDoc(doc(db, 'trainingPrograms', id), updatedFields as any);
    } catch (error) {
      console.error("Error updating training program:", error);
    }
  };

  const acceptTraining = async (programId: string, employeeId: string) => {
    const program = allPrograms.find(p => p.id === programId);
    if (!program) return;
    
    const acceptedEmployees = program.acceptedEmployees || [];
    if (acceptedEmployees.includes(employeeId)) return;

    await updateProgram(programId, {
      acceptedEmployees: [...acceptedEmployees, employeeId]
    });
  };

  const deleteProgram = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'trainingPrograms', id));
    } catch (error) {
      console.error("Error deleting training program:", error);
    }
  };

  return (
    <TrainingContext.Provider value={{ programs, addProgram, updateProgram, deleteProgram, acceptTraining, loading }}>
      {children}
    </TrainingContext.Provider>
  );
};
