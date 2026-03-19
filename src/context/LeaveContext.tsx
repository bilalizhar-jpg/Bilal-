import React, { createContext, useContext, useState, ReactNode, useEffect} from 'react';
import { api} from '../services/api';
import { useAuth} from './AuthContext';

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

export interface WeeklyHoliday {
  id: string;
  companyId: string;
  days: string[];
}

export interface Holiday {
  id: string;
  companyId: string;
  name: string;
  fromDate: string;
  toDate: string;
  totalDays: number;
}

export interface LeaveType {
  id: string;
  companyId: string;
  name: string;
  days: number;
  customFields?: { key: string; value: string}[];
}

interface LeaveContextType {
  leaveRequests: LeaveRequest[];
  holidays: Holiday[];
  weeklyHolidays: WeeklyHoliday | null;
  leaveTypes: LeaveType[];
  applyLeave: (request: Omit<LeaveRequest, 'id' | 'status' | 'appliedDate' | 'companyId'>) => Promise<void>;
  updateLeaveStatus: (id: string, status: 'Approved' | 'Rejected' | 'Pending') => Promise<void>;
  getEmployeeLeaves: (employeeId: string) => LeaveRequest[];
  addHoliday: (holiday: Omit<Holiday, 'id' | 'companyId'>) => Promise<void>;
  updateHoliday: (id: string, holiday: Partial<Holiday>) => Promise<void>;
  deleteHoliday: (id: string) => Promise<void>;
  updateWeeklyHoliday: (days: string[]) => Promise<void>;
  addLeaveType: (leaveType: Omit<LeaveType, 'id' | 'companyId'>) => Promise<void>;
  updateLeaveType: (id: string, leaveType: Partial<LeaveType>) => Promise<void>;
  deleteLeaveType: (id: string) => Promise<void>;
}

const LeaveContext = createContext<LeaveContextType | undefined>(undefined);

export const useLeaves = () => {
  const context = useContext(LeaveContext);
  if (!context) {
    throw new Error('useLeaves must be used within a LeaveProvider');
  }
  return context;
};

export const LeaveProvider = ({ children}: { children: ReactNode}) => {
  const { user } = useAuth();
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [weeklyHolidays, setWeeklyHolidays] = useState<WeeklyHoliday | null>(null);
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    if (!user?.companyId) {
      setLeaveRequests([]);
      setHolidays([]);
      setWeeklyHolidays(null);
      setLeaveTypes([]);
      setLoading(false);
      return;
    }

    const companyId = user.companyId;

    try {
      const [leavesData, holidaysData, weeklyData, typesData] = await Promise.all([
        api.get<LeaveRequest[]>('leaves', { companyId }),
        api.get<Holiday[]>('holidays', { companyId }),
        api.get<WeeklyHoliday[]>('weekly_holidays', { companyId }),
        api.get<LeaveType[]>('leave_types', { companyId })
      ]);

      setLeaveRequests(leavesData);
      setHolidays(holidaysData);
      setWeeklyHolidays(weeklyData[0] || null);
      setLeaveTypes(typesData);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching leave data:", error);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000); // Poll every 30 seconds
    return () => clearInterval(interval);
  }, [user?.companyId]);

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
      await api.post('leaves', newRequest);
      fetchData();
    } catch (error) {
      console.error("Error applying leave:", error);
    }
  };

  const updateLeaveStatus = async (id: string, status: 'Approved' | 'Rejected' | 'Pending') => {
    try {
      await api.put('leaves', id, { status});
      fetchData();
    } catch (error) {
      console.error("Error updating leave status:", error);
    }
  };

  const getEmployeeLeaves = (employeeId: string) => {
    return leaveRequests.filter(req => req.employeeId === employeeId);
  };

  const addHoliday = async (holiday: Omit<Holiday, 'id' | 'companyId'>) => {
    if (!user?.companyId) return;
    const id = Math.random().toString(36).substr(2, 9);
    try {
      await api.post('holidays', { ...holiday, id, companyId: user.companyId});
      fetchData();
    } catch (error) {
      console.error("Error adding holiday:", error);
    }
  };

  const updateHoliday = async (id: string, holiday: Partial<Holiday>) => {
    try {
      await api.put('holidays', id, holiday);
      fetchData();
    } catch (error) {
      console.error("Error updating holiday:", error);
    }
  };

  const deleteHoliday = async (id: string) => {
    try {
      await api.delete('holidays', id);
      fetchData();
    } catch (error) {
      console.error("Error deleting holiday:", error);
    }
  };

  const updateWeeklyHoliday = async (days: string[]) => {
    if (!user?.companyId) return;
    try {
      const id = weeklyHolidays?.id || Math.random().toString(36).substr(2, 9);
      if (weeklyHolidays?.id) {
        await api.put('weekly_holidays', id, { id, companyId: user.companyId, days});
      } else {
        await api.post('weekly_holidays', { id, companyId: user.companyId, days});
      }
      fetchData();
    } catch (error) {
      console.error("Error updating weekly holiday:", error);
    }
  };

  const addLeaveType = async (leaveType: Omit<LeaveType, 'id' | 'companyId'>) => {
    if (!user?.companyId) return;
    const id = Math.random().toString(36).substr(2, 9);
    try {
      await api.post('leave_types', { ...leaveType, id, companyId: user.companyId});
      fetchData();
    } catch (error) {
      console.error("Error adding leave type:", error);
    }
  };

  const updateLeaveType = async (id: string, leaveType: Partial<LeaveType>) => {
    try {
      await api.put('leave_types', id, leaveType);
      fetchData();
    } catch (error) {
      console.error("Error updating leave type:", error);
    }
  };

  const deleteLeaveType = async (id: string) => {
    try {
      await api.delete('leave_types', id);
      fetchData();
    } catch (error) {
      console.error("Error deleting leave type:", error);
    }
  };

  return (
    <LeaveContext.Provider value={{ 
      leaveRequests, 
      holidays,
      weeklyHolidays,
      leaveTypes,
      applyLeave, 
      updateLeaveStatus, 
      getEmployeeLeaves,
      addHoliday,
      updateHoliday,
      deleteHoliday,
      updateWeeklyHoliday,
      addLeaveType,
      updateLeaveType,
      deleteLeaveType
    }}>
      {children}
    </LeaveContext.Provider>
  );
};
