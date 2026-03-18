import React, { createContext, useContext, useState, useEffect, ReactNode, useRef} from 'react';
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

export interface TrackingData {
 employeeId: string;
 employeeName: string;
 companyId?: string;
 date: string;
 status: 'Online' | 'Idle' | 'Offline' | 'On Break';
 workingTime: number; // in seconds
 idleTime: number; // in seconds
 mouseMoves: number;
 keyboardClicks: number;
 lastActive: number; // timestamp
 currentTask: string;
 screenshot?: string;
 captureInterval?: number; // in minutes
}

interface TimeTrackingContextType {
 trackingData: Record<string, TrackingData>;
 updateTracking: (employeeId: string, data: Partial<TrackingData>) => void;
 startTracking: (employeeId: string, employeeName: string, companyId: string) => void;
 stopTracking: (employeeId: string) => void;
 setCaptureInterval: (employeeId: string, interval: number) => void;
}

const TimeTrackingContext = createContext<TimeTrackingContextType | undefined>(undefined);

export const useTimeTracking = () => {
 const context = useContext(TimeTrackingContext);
 if (!context) {
 throw new Error('useTimeTracking must be used within a TimeTrackingProvider');
}
 return context;
};

export const TimeTrackingProvider = ({ children}: { children: ReactNode}) => {
 const { user} = useAuth();
 const [trackingData, setTrackingData] = useState<Record<string, TrackingData>>({});
 const lastUpdateRef = useRef<Record<string, number>>({});

 const todayDate = React.useMemo(() => new Date().toISOString().split('T')[0], []);
 const trackingDataRef = useRef<Record<string, TrackingData>>({});

 useEffect(() => {
 if (!user) {
 setTrackingData({});
 trackingDataRef.current = {};
 return;
}

 const q = query(collection(db, 'timeTracking'), where('date', '==', todayDate));
 const unsubscribe = onSnapshot(q, (snapshot) => {
 const data: Record<string, TrackingData> = {};
 snapshot.docs.forEach(doc => {
 data[doc.id] = doc.data() as TrackingData;
});
 setTrackingData(data);
 trackingDataRef.current = data;
}, (error) => {
 handleFirestoreError(error, OperationType.LIST, 'timeTracking');
});

 return () => unsubscribe();
}, [user, todayDate]);

 const updateTracking = React.useCallback(async (employeeId: string, data: Partial<TrackingData>) => {
 const docId =`${employeeId}_${todayDate}`;
 
 const current = trackingDataRef.current[docId];
 const updatedData = {
 ...(current || {}),
 ...data,
 employeeId,
 date: todayDate,
 companyId: user?.companyId,
 lastActive: data.lastActive || (data.status === 'Online' ? Date.now() : (current?.lastActive || Date.now()))
} as TrackingData;

 // Update ref and state
 trackingDataRef.current[docId] = updatedData;
 setTrackingData(prev => ({ ...prev, [docId]: updatedData}));

 // Throttle Firestore updates
 const now = Date.now();
 const lastUpdate = lastUpdateRef.current[docId] || 0;
 const statusChanged = data.status !== undefined && data.status !== current?.status;

 if (statusChanged || now - lastUpdate > 10000) {
 lastUpdateRef.current[docId] = now;
 setDoc(doc(db, 'timeTracking', docId), updatedData).catch(error => {
 console.error("Error updating time tracking:", error);
});
}
}, [user?.companyId, todayDate]);

 const startTracking = async (employeeId: string, employeeName: string, companyId: string) => {
 const docId =`${employeeId}_${todayDate}`;
 const existingData = trackingDataRef.current[docId];
 const newData: TrackingData = existingData ? {
 ...existingData,
 status: 'Online',
 lastActive: Date.now(),
 companyId
} : {
 employeeId,
 employeeName,
 companyId,
 date: todayDate,
 status: 'Online',
 workingTime: 0,
 idleTime: 0,
 mouseMoves: 0,
 keyboardClicks: 0,
 lastActive: Date.now(),
 currentTask: 'General Work'
};
 
 trackingDataRef.current[docId] = newData;
 setTrackingData(prev => ({ ...prev, [docId]: newData}));
 try {
 await setDoc(doc(db, 'timeTracking', docId), newData);
} catch (error) {
 console.error("Error starting tracking:", error);
}
};

 const stopTracking = async (employeeId: string) => {
 const docId =`${employeeId}_${todayDate}`;
 const current = trackingDataRef.current[docId];
 if (!current) return;
 const updatedData: TrackingData = {
 ...current,
 status: 'Offline'
};
 trackingDataRef.current[docId] = updatedData;
 setTrackingData(prev => ({ ...prev, [docId]: updatedData}));
 try {
 await setDoc(doc(db, 'timeTracking', docId), updatedData);
} catch (error) {
 console.error("Error stopping tracking:", error);
}
};

 const setCaptureInterval = (employeeId: string, interval: number) => {
 updateTracking(employeeId, { captureInterval: interval});
};

 // Global timer to increment working/idle time for the logged-in employee
 useEffect(() => {
 if (!user || user.role !== 'employee') return;

 const interval = setInterval(() => {
 const docId =`${user.id}_${todayDate}`;
 setTrackingData(prev => {
 const current = prev[docId];
 if (!current || current.status === 'Offline') return prev;

 const next = { ...current};
 if (next.status === 'Online') {
 next.workingTime += 1;
 // Auto-idle detection: if no activity for 2 minutes
 if (Date.now() - next.lastActive > 2 * 60 * 1000) {
 console.log(`[TimeTracking] Auto-idle detected for ${user.id}. Last active: ${new Date(next.lastActive).toLocaleTimeString()}`);
 next.status = 'Idle';
}
} else if (next.status === 'Idle' || next.status === 'On Break') {
 next.idleTime += 1;
 if (next.idleTime % 60 === 0) {
 console.log(`[TimeTracking] ${user.id} is ${next.status}. Idle time: ${Math.floor(next.idleTime / 60)}m`);
}
}

 // Update ref to keep it in sync with state for the syncInterval
 trackingDataRef.current[docId] = next;
 return { ...prev, [docId]: next};
});
}, 1000);

 // Periodically sync to Firestore (every 10 seconds) to ensure working/idle time is saved
 const syncInterval = setInterval(() => {
 const docId =`${user.id}_${todayDate}`;
 const current = trackingDataRef.current[docId];
 if (current && current.status !== 'Offline') {
 setDoc(doc(db, 'timeTracking', docId), current).catch(err => 
 console.error("Error syncing time tracking:", err)
 );
}
}, 10000);

 return () => {
 clearInterval(interval);
 clearInterval(syncInterval);
};
}, [user, todayDate]);

 return (
 <TimeTrackingContext.Provider value={{ trackingData, updateTracking, startTracking, stopTracking, setCaptureInterval}}>
 {children}
 </TimeTrackingContext.Provider>
 );
};
