import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  date: string;
  loginTime: string | null;
  logoutTime: string | null;
  workingHours: string;
  totalMinutes: number;
  lastCheckInMins?: number;
  status: 'Present' | 'Absent' | 'Leave' | 'Half Day';
  logs: { time: string; action: string; location: string }[];
  currentState: 'not_checked_in' | 'checked_in' | 'on_break' | 'checked_out';
}

interface AttendanceContextType {
  attendanceRecords: AttendanceRecord[];
  addLog: (employeeId: string, employeeName: string, action: string, location: string, time: string, date: string, newState: 'not_checked_in' | 'checked_in' | 'on_break' | 'checked_out') => void;
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

export const AttendanceProvider = ({ children }: { children: ReactNode }) => {
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>(() => {
    const saved = localStorage.getItem('attendanceRecords');
    if (saved) {
      return JSON.parse(saved);
    }
    return [
      {
        id: '1',
        employeeId: '000031',
        employeeName: 'Babara Patel',
        date: new Date().toISOString().split('T')[0],
        loginTime: '09:00 AM',
        logoutTime: '06:00 PM',
        workingHours: '9h 0m',
        status: 'Present',
        logs: [],
        currentState: 'checked_out'
      }
    ];
  });

  useEffect(() => {
    localStorage.setItem('attendanceRecords', JSON.stringify(attendanceRecords));
  }, [attendanceRecords]);

  const addLog = (employeeId: string, employeeName: string, action: string, location: string, time: string, date: string, newState: 'not_checked_in' | 'checked_in' | 'on_break' | 'checked_out') => {
    const parseTime = (t: string) => {
      const [timeStr, modifier] = t.split(' ');
      let [hours, minutes] = timeStr.split(':').map(Number);
      if (hours === 12) hours = 0;
      if (modifier === 'PM') hours += 12;
      return hours * 60 + minutes;
    };

    setAttendanceRecords(prev => {
      const existingRecordIndex = prev.findIndex(r => r.employeeId === employeeId && r.date === date);
      
      if (existingRecordIndex >= 0) {
        const updatedRecords = [...prev];
        const record = { ...updatedRecords[existingRecordIndex] };
        
        record.logs = [{ time, action, location }, ...record.logs];
        record.currentState = newState;
        
        if (action === 'Checked In') {
          if (!record.loginTime) {
            record.loginTime = time;
          }
          record.status = 'Present';
          record.logoutTime = null;
          record.lastCheckInMins = parseTime(time);
        } else if (action === 'Checked Out') {
          record.logoutTime = time;
          const checkInMins = record.lastCheckInMins || parseTime(record.loginTime || time);
          const checkOutMins = parseTime(time);
          const sessionMins = checkOutMins - checkInMins;
          
          if (sessionMins > 0) {
            record.totalMinutes = (record.totalMinutes || 0) + sessionMins;
            const h = Math.floor(record.totalMinutes / 60);
            const m = record.totalMinutes % 60;
            record.workingHours = `${h}h ${m}m`;
          }
        }
        
        updatedRecords[existingRecordIndex] = record;
        return updatedRecords;
      } else {
        const newRecord: AttendanceRecord = {
          id: Math.random().toString(36).substr(2, 9),
          employeeId,
          employeeName,
          date,
          loginTime: action === 'Checked In' ? time : null,
          logoutTime: action === 'Checked Out' ? time : null,
          workingHours: '0h 0m',
          totalMinutes: 0,
          lastCheckInMins: action === 'Checked In' ? parseTime(time) : undefined,
          status: 'Present',
          logs: [{ time, action, location }],
          currentState: newState
        };
        return [...prev, newRecord];
      }
    });
  };

  const getEmployeeTodayRecord = (employeeId: string, date: string) => {
    return attendanceRecords.find(r => r.employeeId === employeeId && r.date === date);
  };

  return (
    <AttendanceContext.Provider value={{ attendanceRecords, addLog, getEmployeeTodayRecord }}>
      {children}
    </AttendanceContext.Provider>
  );
};
