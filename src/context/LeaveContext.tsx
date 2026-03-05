import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { 
  collection, 
  onSnapshot, 
  doc, 
  setDoc, 
  updateDoc, 
  query,
  where
} from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from './AuthContext';
import { handleFirestoreError, OperationType } from '../utils/firestoreErrorHandler';

export interface LeaveRequest {
  id: string;
  companyId: string;
  employeeId: string;
  employeeName: string;
  type: string;
  startDate: string;
  endDate: string;
  days: number;
  reason: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  appliedDate: string;
}

interface LeaveContextType {
  leaveRequests: LeaveRequest[];
  applyLeave: (request: Omit<LeaveRequest, 'id' | 'status' | 'appliedDate' | 'companyId'>) => void;
  updateLeaveStatus: (id: string, status: 'Approved' | 'Rejected' | 'Pending') => void;
  getEmployeeLeaves: (employeeId: string) => LeaveRequest[];
}

const LeaveContext = createContext<LeaveContextType | undefined>(undefined);

export const useLeaves = () => {
  const context = useContext(LeaveContext);
  if (!context) {
    throw new Error('useLeaves must be used within a LeaveProvider');
  }
  return context;
};

export const LeaveProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLeaveRequests([]);
      setLoading(false);
      return;
    }

    const q = query(collection(db, 'leaves'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const leavesData = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as LeaveRequest));
      setLeaveRequests(leavesData);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'leaves');
    });

    return () => unsubscribe();
  }, [user]);

  const applyLeave = async (request: Omit<LeaveRequest, 'id' | 'status' | 'appliedDate' | 'companyId'>) => {
    if (!user?.companyId) return;
    const id = Math.random().toString(36).substr(2, 9);
    const newRequest: LeaveRequest = {
      ...request,
      id,
      companyId: user.companyId,
      status: 'Pending',
      appliedDate: new Date().toISOString().split('T')[0]
    };
    
    try {
      await setDoc(doc(db, 'leaves', id), newRequest);
    } catch (error) {
      console.error("Error applying for leave:", error);
    }
  };

  const updateLeaveStatus = async (id: string, status: 'Approved' | 'Rejected' | 'Pending') => {
    try {
      await updateDoc(doc(db, 'leaves', id), { status });
    } catch (error) {
      console.error("Error updating leave status:", error);
    }
  };

  const getEmployeeLeaves = (employeeId: string) => {
    return leaveRequests.filter(req => req.employeeId === employeeId);
  };

  return (
    <LeaveContext.Provider value={{ leaveRequests, applyLeave, updateLeaveStatus, getEmployeeLeaves }}>
      {children}
    </LeaveContext.Provider>
  );
};
