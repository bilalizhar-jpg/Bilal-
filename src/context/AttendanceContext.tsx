import React, { createContext, useContext, useState, ReactNode, useEffect} from 'react';
import { 
 collection, 
 onSnapshot, 
 doc, 
 setDoc, 
 updateDoc, 
 query,
 where,
 getDoc
} from 'firebase/firestore';
import { db} from '../firebase';
import { useAuth} from './AuthContext';
import { handleFirestoreError, OperationType} from '../utils/firestoreErrorHandler';

export interface AttendanceRecord {
 id: string;
 companyId: string;
 employeeId: string;
 employeeName: string;
 date: string;
 loginTime: string | null;
 logoutTime: string | null;
 workingHours: string;
 totalMinutes: number;
 lastCheckInMins?: number;
 status: 'Present' | 'Absent' | 'Leave' | 'Half Day';
 logs: { time: string; action: string; location: string; selfie?: string}[];
 currentState: 'not_checked_in' | 'checked_in' | 'on_break' | 'checked_out';
}

interface AttendanceContextType {
 attendanceRecords: AttendanceRecord[];
 addLog: (companyId: string, employeeId: string, employeeName: string, action: string, location: string, time: string, date: string, newState: 'not_checked_in' | 'checked_in' | 'on_break' | 'checked_out', selfie?: string) => Promise<void>;
 getEmployeeTodayRecord: (employeeId: string, date: string) => AttendanceRecord | undefined;
}

const AttendanceContext = createContext<AttendanceContextType | undefined>(undefined);

export const useAttendance = () => {
 const context = useContext(AttendanceContext);
 if (!context) {
 throw new Error('useAttendance must be used within an AttendanceProvider');
}
 return context;
};

export const AttendanceProvider = ({ children}: { children: ReactNode}) => {
 const { user} = useAuth();
 const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
 const [loading, setLoading] = useState(true);

 useEffect(() => {
 if (!user?.companyId) {
 setAttendanceRecords([]);
 setLoading(false);
 return;
}

 const q = query(collection(db, 'attendance'), where('companyId', '==', user.companyId));
 const unsubscribe = onSnapshot(q, (snapshot) => {
 const recordsData = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id} as AttendanceRecord));
 setAttendanceRecords(recordsData);
 setLoading(false);
}, (error) => {
 handleFirestoreError(error, OperationType.LIST, 'attendance');
});

 return () => unsubscribe();
}, [user]);

 const addLog = async (companyId: string, employeeId: string, employeeName: string, action: string, location: string, time: string, date: string, newState: 'not_checked_in' | 'checked_in' | 'on_break' | 'checked_out', selfie?: string) => {
 const parseTime = (t: string) => {
 const [timeStr, modifier] = t.split(' ');
 let [hours, minutes] = timeStr.split(':').map(Number);
 if (hours === 12) hours = 0;
 if (modifier === 'PM') hours += 12;
 return hours * 60 + minutes;
};

 const recordId =`${employeeId}_${date}`;
 const docRef = doc(db, 'attendance', recordId);
 const docSnap = await getDoc(docRef);

 if (docSnap.exists()) {
 const record = docSnap.data() as AttendanceRecord;
 const logEntry: any = { time, action, location};
 if (selfie) logEntry.selfie = selfie;
 
 const updatedLogs = [logEntry, ...record.logs];
 const updates: any = {
 logs: updatedLogs,
 currentState: newState
};

 if (action === 'Checked In') {
 if (!record.loginTime) {
 updates.loginTime = time;
}
 updates.status = 'Present';
 updates.logoutTime = null;
 updates.lastCheckInMins = parseTime(time);
} else if (action === 'Checked Out') {
 updates.logoutTime = time;
 const checkInMins = record.lastCheckInMins !== undefined ? record.lastCheckInMins : parseTime(record.loginTime || time);
 const checkOutMins = parseTime(time);
 const sessionMins = checkOutMins - checkInMins;
 
 if (sessionMins > 0) {
 const totalMinutes = (record.totalMinutes || 0) + sessionMins;
 const h = Math.floor(totalMinutes / 60);
 const m = totalMinutes % 60;
 updates.totalMinutes = totalMinutes;
 updates.workingHours =`${h}h ${m}m`;
}
}

 try {
 await updateDoc(docRef, updates);
} catch (error) {
 console.error("Error updating attendance log:", error);
}
} else {
 const logEntry: any = { time, action, location};
 if (selfie) logEntry.selfie = selfie;

 const newRecord: any = {
 id: recordId,
 companyId,
 employeeId,
 employeeName,
 date,
 loginTime: action === 'Checked In' ? time : null,
 logoutTime: action === 'Checked Out' ? time : null,
 workingHours: '0h 0m',
 totalMinutes: 0,
 status: 'Present',
 logs: [logEntry],
 currentState: newState
};

 if (action === 'Checked In') {
 newRecord.lastCheckInMins = parseTime(time);
}

 try {
 await setDoc(docRef, newRecord);
} catch (error) {
 console.error("Error creating attendance log:", error);
}
}
};

 const getEmployeeTodayRecord = (employeeId: string, date: string) => {
 return attendanceRecords.find(r => r.employeeId === employeeId && r.date === date);
};

 return (
 <AttendanceContext.Provider value={{ attendanceRecords, addLog, getEmployeeTodayRecord}}>
 {children}
 </AttendanceContext.Provider>
 );
};
