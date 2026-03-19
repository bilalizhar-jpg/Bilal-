import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from './AuthContext';

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
  const { user, isAuthReady } = useAuth();
  const [allPrograms, setAllPrograms] = useState<TrainingProgram[]>([]);
  const [loading, setLoading] = useState(true);
  const companyId = user?.currentCompanyId || user?.companyId;

  useEffect(() => {
    if (!isAuthReady || !user) {
      setLoading(false);
      return;
    }
    const params = user.role === 'superadmin' ? {} : { companyId };
    api
      .get<TrainingProgram[]>('trainingPrograms', params)
      .then((data) => setAllPrograms(Array.isArray(data) ? data : []))
      .catch(() => setAllPrograms([]))
      .finally(() => setLoading(false));
  }, [user?.id, companyId, user?.role, isAuthReady]);

  const programs = allPrograms.filter((p) => p.companyId === companyId);

  const addProgram = async (program: Omit<TrainingProgram, 'companyId' | 'id'>) => {
    if (!companyId) return;
    const id = Date.now().toString();
    const newProgram: TrainingProgram = { ...program, id, companyId };
    try {
      await api.post('trainingPrograms', newProgram);
      setAllPrograms((prev) => [...prev, newProgram]);
    } catch (error) {
      console.error('Error adding training program:', error);
    }
  };

  const updateProgram = async (id: string, updatedFields: Partial<TrainingProgram>) => {
    try {
      await api.put('trainingPrograms', id, updatedFields);
      setAllPrograms((prev) => prev.map((p) => (p.id === id ? { ...p, ...updatedFields } : p)));
    } catch (error) {
      console.error('Error updating training program:', error);
    }
  };

  const deleteProgram = async (id: string) => {
    try {
      await api.delete('trainingPrograms', id);
      setAllPrograms((prev) => prev.filter((p) => p.id !== id));
    } catch (error) {
      console.error('Error deleting training program:', error);
    }
  };

  const acceptTraining = async (programId: string, employeeId: string) => {
    const program = allPrograms.find((p) => p.id === programId);
    if (!program) return;
    const acceptedEmployees = program.acceptedEmployees || [];
    if (acceptedEmployees.includes(employeeId)) return;
    await updateProgram(programId, { acceptedEmployees: [...acceptedEmployees, employeeId] });
  };

  return (
    <TrainingContext.Provider value={{ programs, addProgram, updateProgram, deleteProgram, acceptTraining, loading }}>
      {children}
    </TrainingContext.Provider>
  );
};
