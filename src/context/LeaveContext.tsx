import React, { createContext, useContext, useState, ReactNode, useEffect} from 'react';
import { 
 collection, 
 onSnapshot, 
 doc, 
 setDoc, 
 updateDoc, 
 query,
 where
} from 'firebase/firestore';
import { db} from '../firebase';
import { useAuth} from './AuthContext';
import { handleFirestoreError, OperationType} from '../utils/firestoreErrorHandler';

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
  const { user, isFirebaseReady } = useAuth();
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [weeklyHolidays, setWeeklyHolidays] = useState<WeeklyHoliday | null>(null);
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isFirebaseReady || !user?.companyId) {
      setLeaveRequests([]);
      setHolidays([]);
      setWeeklyHolidays(null);
      setLeaveTypes([]);
      setLoading(false);
      return;
    }

 const companyId = user.companyId;

 // Leave Requests
 const qLeaves = query(collection(db, 'leaves'), where('companyId', '==', companyId));
 const unsubscribeLeaves = onSnapshot(qLeaves, (snapshot) => {
 const leavesData = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id} as LeaveRequest));
 setLeaveRequests(leavesData);
}, (error) => {
 handleFirestoreError(error, OperationType.LIST, 'leaves');
});

 // Holidays
 const qHolidays = query(collection(db, 'holidays'), where('companyId', '==', companyId));
 const unsubscribeHolidays = onSnapshot(qHolidays, (snapshot) => {
 const holidaysData = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id} as Holiday));
 setHolidays(holidaysData);
}, (error) => {
 handleFirestoreError(error, OperationType.LIST, 'holidays');
});

 // Weekly Holidays
 const qWeekly = query(collection(db, 'weekly_holidays'), where('companyId', '==', companyId));
 const unsubscribeWeekly = onSnapshot(qWeekly, (snapshot) => {
 const weeklyData = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id} as WeeklyHoliday));
 setWeeklyHolidays(weeklyData[0] || null);
}, (error) => {
 handleFirestoreError(error, OperationType.LIST, 'weekly_holidays');
});

 // Leave Types
 const qTypes = query(collection(db, 'leave_types'), where('companyId', '==', companyId));
 const unsubscribeTypes = onSnapshot(qTypes, (snapshot) => {
 const typesData = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id} as LeaveType));
 setLeaveTypes(typesData);
}, (error) => {
 handleFirestoreError(error, OperationType.LIST, 'leave_types');
});

 setLoading(false);

  return () => {
    unsubscribeLeaves();
    unsubscribeHolidays();
    unsubscribeWeekly();
    unsubscribeTypes();
  };
}, [user?.companyId, isFirebaseReady]);

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
 handleFirestoreError(error, OperationType.CREATE, 'leaves');
}
};

 const updateLeaveStatus = async (id: string, status: 'Approved' | 'Rejected' | 'Pending') => {
 try {
 await updateDoc(doc(db, 'leaves', id), { status});
} catch (error) {
 handleFirestoreError(error, OperationType.UPDATE,`leaves/${id}`);
}
};

 const getEmployeeLeaves = (employeeId: string) => {
 return leaveRequests.filter(req => req.employeeId === employeeId);
};

 const addHoliday = async (holiday: Omit<Holiday, 'id' | 'companyId'>) => {
 if (!user?.companyId) return;
 const id = Math.random().toString(36).substr(2, 9);
 try {
 await setDoc(doc(db, 'holidays', id), { ...holiday, id, companyId: user.companyId});
} catch (error) {
 handleFirestoreError(error, OperationType.CREATE, 'holidays');
}
};

 const updateHoliday = async (id: string, holiday: Partial<Holiday>) => {
 try {
 await updateDoc(doc(db, 'holidays', id), holiday);
} catch (error) {
 handleFirestoreError(error, OperationType.UPDATE,`holidays/${id}`);
}
};

 const deleteHoliday = async (id: string) => {
 try {
 await setDoc(doc(db, 'holidays', id), { deleted: true}, { merge: true});
 // Actually delete it for real if you want, but merge:true is safer for now if we don't have deleteDoc imported correctly or want soft delete
 // Let's use deleteDoc since it's imported
 const { deleteDoc: firestoreDeleteDoc} = await import('firebase/firestore');
 await firestoreDeleteDoc(doc(db, 'holidays', id));
} catch (error) {
 handleFirestoreError(error, OperationType.DELETE,`holidays/${id}`);
}
};

 const updateWeeklyHoliday = async (days: string[]) => {
 if (!user?.companyId) return;
 try {
 const id = weeklyHolidays?.id || Math.random().toString(36).substr(2, 9);
 await setDoc(doc(db, 'weekly_holidays', id), { id, companyId: user.companyId, days});
} catch (error) {
 handleFirestoreError(error, OperationType.UPDATE, 'weekly_holidays');
}
};

 const addLeaveType = async (leaveType: Omit<LeaveType, 'id' | 'companyId'>) => {
 if (!user?.companyId) return;
 const id = Math.random().toString(36).substr(2, 9);
 try {
 await setDoc(doc(db, 'leave_types', id), { ...leaveType, id, companyId: user.companyId});
} catch (error) {
 handleFirestoreError(error, OperationType.CREATE, 'leave_types');
}
};

 const updateLeaveType = async (id: string, leaveType: Partial<LeaveType>) => {
 try {
 await updateDoc(doc(db, 'leave_types', id), leaveType);
} catch (error) {
 handleFirestoreError(error, OperationType.UPDATE,`leave_types/${id}`);
}
};

 const deleteLeaveType = async (id: string) => {
 try {
 const { deleteDoc: firestoreDeleteDoc} = await import('firebase/firestore');
 await firestoreDeleteDoc(doc(db, 'leave_types', id));
} catch (error) {
 handleFirestoreError(error, OperationType.DELETE,`leave_types/${id}`);
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
