import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

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
  const [trackingData, setTrackingData] = useState<Record<string, TrackingData>>(() => {
    const saved = localStorage.getItem('timeTrackingData');
    return saved ? JSON.parse(saved) : {};
  });

  useEffect(() => {
    localStorage.setItem('timeTrackingData', JSON.stringify(trackingData));
  }, [trackingData]);

  const updateTracking = (employeeId: string, data: Partial<TrackingData>) => {
    setTrackingData(prev => ({
      ...prev,
      [employeeId]: {
        ...prev[employeeId],
        ...data,
        lastActive: data.status === 'Online' ? Date.now() : (prev[employeeId]?.lastActive || Date.now())
      }
    }));
  };

  const startTracking = (employeeId: string, employeeName: string) => {
    setTrackingData(prev => ({
      ...prev,
      [employeeId]: prev[employeeId] || {
        employeeId,
        employeeName,
        status: 'Online',
        workingTime: 0,
        idleTime: 0,
        mouseMoves: 0,
        keyboardClicks: 0,
        lastActive: Date.now(),
        currentTask: 'General Work'
      }
    }));
  };

  const stopTracking = (employeeId: string) => {
    setTrackingData(prev => {
      if (!prev[employeeId]) return prev;
      return {
        ...prev,
        [employeeId]: {
          ...prev[employeeId],
          status: 'Offline'
        }
      };
    });
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
