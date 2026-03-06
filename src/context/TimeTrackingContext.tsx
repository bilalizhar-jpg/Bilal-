import React, { createContext, useContext, useState, useEffect, ReactNode, useRef } from 'react';
import { 
  collection, 
  onSnapshot, 
  doc, 
  setDoc, 
  updateDoc, 
  query
} from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from './AuthContext';
import { handleFirestoreError, OperationType } from '../utils/firestoreErrorHandler';

export interface TrackingData {
  employeeId: string;
  employeeName: string;
  status: 'Online' | 'Idle' | 'Offline';
  workingTime: number; // in seconds
  idleTime: number; // in seconds
  mouseMoves: number;
  keyboardClicks: number;
  lastActive: number; // timestamp
  currentTask: string;
  screenshot?: string;
}

interface TimeTrackingContextType {
  trackingData: Record<string, TrackingData>;
  updateTracking: (employeeId: string, data: Partial<TrackingData>) => void;
  startTracking: (employeeId: string, employeeName: string) => void;
  stopTracking: (employeeId: string) => void;
}

const TimeTrackingContext = createContext<TimeTrackingContextType | undefined>(undefined);

export const useTimeTracking = () => {
  const context = useContext(TimeTrackingContext);
  if (!context) {
    throw new Error('useTimeTracking must be used within a TimeTrackingProvider');
  }
  return context;
};

export const TimeTrackingProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [trackingData, setTrackingData] = useState<Record<string, TrackingData>>({});
  const lastUpdateRef = useRef<Record<string, number>>({});

  useEffect(() => {
    if (!user) {
      setTrackingData({});
      return;
    }

    const q = query(collection(db, 'timeTracking'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data: Record<string, TrackingData> = {};
      snapshot.docs.forEach(doc => {
        data[doc.id] = doc.data() as TrackingData;
      });
      setTrackingData(data);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'timeTracking');
    });

    return () => unsubscribe();
  }, [user]);

  const updateTracking = async (employeeId: string, data: Partial<TrackingData>) => {
    const updatedData = {
      ...trackingData[employeeId],
      ...data,
      lastActive: data.status === 'Online' ? Date.now() : (trackingData[employeeId]?.lastActive || Date.now())
    };

    // Update local state immediately
    setTrackingData(prev => ({ ...prev, [employeeId]: updatedData as TrackingData }));

    // Throttle Firestore updates (every 10 seconds or on status change)
    const now = Date.now();
    const lastUpdate = lastUpdateRef.current[employeeId] || 0;
    const statusChanged = data.status && data.status !== trackingData[employeeId]?.status;

    if (statusChanged || now - lastUpdate > 10000) {
      lastUpdateRef.current[employeeId] = now;
      try {
        await setDoc(doc(db, 'timeTracking', employeeId), updatedData);
      } catch (error) {
        console.error("Error updating time tracking:", error);
      }
    }
  };

  const startTracking = async (employeeId: string, employeeName: string) => {
    const existingData = trackingData[employeeId];
    const newData: TrackingData = existingData ? {
      ...existingData,
      status: 'Online',
      lastActive: Date.now()
    } : {
      employeeId,
      employeeName,
      status: 'Online',
      workingTime: 0,
      idleTime: 0,
      mouseMoves: 0,
      keyboardClicks: 0,
      lastActive: Date.now(),
      currentTask: 'General Work'
    };
    
    setTrackingData(prev => ({ ...prev, [employeeId]: newData }));
    try {
      await setDoc(doc(db, 'timeTracking', employeeId), newData);
    } catch (error) {
      console.error("Error starting tracking:", error);
    }
  };

  const stopTracking = async (employeeId: string) => {
    if (!trackingData[employeeId]) return;
    const updatedData: TrackingData = {
      ...trackingData[employeeId],
      status: 'Offline'
    };
    setTrackingData(prev => ({ ...prev, [employeeId]: updatedData }));
    try {
      await setDoc(doc(db, 'timeTracking', employeeId), updatedData);
    } catch (error) {
      console.error("Error stopping tracking:", error);
    }
  };

  // Global timer to increment working/idle time for active employees
  useEffect(() => {
    const interval = setInterval(() => {
      setTrackingData(prev => {
        const next = { ...prev };
        let changed = false;

        Object.keys(next).forEach(id => {
          const data = next[id];
          if (data.status === 'Online') {
            data.workingTime += 1;
            changed = true;
            
            // Auto-idle detection: if no activity for 5 minutes
            if (Date.now() - data.lastActive > 5 * 60 * 1000) {
              data.status = 'Idle';
            }
          } else if (data.status === 'Idle') {
            data.idleTime += 1;
            changed = true;

            // If activity resumed (this would be handled by updateTracking from client)
          }
        });

        return changed ? next : prev;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <TimeTrackingContext.Provider value={{ trackingData, updateTracking, startTracking, stopTracking }}>
      {children}
    </TimeTrackingContext.Provider>
  );
};
