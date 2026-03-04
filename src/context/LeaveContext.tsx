import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

export interface LeaveRequest {
  id: string;
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
  applyLeave: (request: Omit<LeaveRequest, 'id' | 'status' | 'appliedDate'>) => void;
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
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>(() => {
    const saved = localStorage.getItem('leaveRequests');
    if (saved) {
      const parsed = JSON.parse(saved);
      // Cleanup: Remove "Test Candidate" leave requests
      return parsed.filter((req: LeaveRequest) => req.employeeName !== 'Test Candidate');
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem('leaveRequests', JSON.stringify(leaveRequests));
  }, [leaveRequests]);

  const applyLeave = (request: Omit<LeaveRequest, 'id' | 'status' | 'appliedDate'>) => {
    const newRequest: LeaveRequest = {
      ...request,
      id: Math.random().toString(36).substr(2, 9),
      status: 'Pending',
      appliedDate: new Date().toISOString().split('T')[0]
    };
    setLeaveRequests(prev => [newRequest, ...prev]);
  };

  const updateLeaveStatus = (id: string, status: 'Approved' | 'Rejected' | 'Pending') => {
    setLeaveRequests(prev => prev.map(req => 
      req.id === id ? { ...req, status } : req
    ));
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
