import { useEffect, useRef} from 'react';
import { useTimeTracking} from '../../context/TimeTrackingContext';
import { useAuth} from '../../context/AuthContext';

export const ActivityTracker = () => {
 const { user} = useAuth();
 const { trackingData, updateTracking} = useTimeTracking();
 const activityRef = useRef({ mouseMoves: 0, keyboardClicks: 0});
 const trackingDataRef = useRef(trackingData);

 // Keep trackingDataRef up to date
 useEffect(() => {
 trackingDataRef.current = trackingData;
}, [trackingData]);

 useEffect(() => {
 if (!user || user.role !== 'employee') return;

 const todayDate = new Date().toISOString().split('T')[0];
 const docId =`${user.id}_${todayDate}`;

 const handleActivity = () => {
 const currentData = trackingDataRef.current[docId];
 if (!currentData || currentData.status === 'Offline') return;
 
 // If they were idle, mark them as online
 if (currentData.status === 'Idle') {
 updateTracking(user.id, { status: 'Online'});
}
};

 const handleMouseMove = () => {
 handleActivity();
 activityRef.current.mouseMoves += 1;
};

 const handleKeyDown = () => {
 handleActivity();
 activityRef.current.keyboardClicks += 1;
};

 const handleMouseClick = () => {
 handleActivity();
 // We can count clicks as mouse moves or separate them, 
 // but for now let's just count them as activity
 activityRef.current.mouseMoves += 1;
};

 window.addEventListener('mousemove', handleMouseMove);
 window.addEventListener('keydown', handleKeyDown);
 window.addEventListener('mousedown', handleMouseClick);
 window.addEventListener('touchstart', handleActivity);
 window.addEventListener('scroll', handleActivity);

 // Sync activity to context/Firestore every 10 seconds
 const syncInterval = setInterval(() => {
 const currentData = trackingDataRef.current[docId];
 if (!currentData || currentData.status === 'Offline') return;
 
 if (activityRef.current.mouseMoves > 0 || activityRef.current.keyboardClicks > 0) {
 updateTracking(user.id, {
 mouseMoves: (currentData.mouseMoves || 0) + activityRef.current.mouseMoves,
 keyboardClicks: (currentData.keyboardClicks || 0) + activityRef.current.keyboardClicks,
 lastActive: Date.now()
});
 
 // Reset local counters after sync
 activityRef.current = { mouseMoves: 0, keyboardClicks: 0};
}
}, 10000);

 return () => {
 window.removeEventListener('mousemove', handleMouseMove);
 window.removeEventListener('keydown', handleKeyDown);
 window.removeEventListener('mousedown', handleMouseClick);
 window.removeEventListener('touchstart', handleActivity);
 window.removeEventListener('scroll', handleActivity);
 clearInterval(syncInterval);
};
}, [user, updateTracking]);

 return null;
};
