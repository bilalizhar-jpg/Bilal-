import { useEffect, useRef} from 'react';
import { ref, uploadString, getDownloadURL} from 'firebase/storage';
import { storage} from '../../firebase';
import { useTimeTracking} from '../../context/TimeTrackingContext';
import { useAuth} from '../../context/AuthContext';

export const ScreenCapture = () => {
 const { user} = useAuth();
 const { trackingData, updateTracking} = useTimeTracking();
 const streamRef = useRef<MediaStream | null>(null);

 useEffect(() => {
 const todayDate = new Date().toISOString().split('T')[0];
 const docId =`${user?.id}_${todayDate}`;
 
 if (!user || !trackingData[docId] || !trackingData[docId].captureInterval) return;

 const intervalMinutes = trackingData[docId].captureInterval!;
 const intervalMs = intervalMinutes * 60 * 1000;

 const capture = async () => {
 try {
 if (!streamRef.current) {
 streamRef.current = await navigator.mediaDevices.getDisplayMedia({ video: true});
}

 const video = document.createElement('video');
 video.srcObject = streamRef.current;
 await video.play();

 const canvas = document.createElement('canvas');
 canvas.width = video.videoWidth;
 canvas.height = video.videoHeight;
 canvas.getContext('2d')?.drawImage(video, 0, 0);

 const dataUrl = canvas.toDataURL('image/jpeg');
 
 // Upload to Firebase Storage
 const storageRef = ref(storage,`screenshots/${user.employeeId || user.id}/${Date.now()}.jpg`);
 await uploadString(storageRef, dataUrl, 'data_url');
 const downloadUrl = await getDownloadURL(storageRef);

 // Update Firestore
 updateTracking(user.employeeId || user.id, { screenshot: downloadUrl});

 // Stop video
 video.pause();
 video.srcObject = null;
} catch (error) {
 console.error("Error capturing screen:", error);
}
};

 const intervalId = setInterval(capture, intervalMs);
 return () => clearInterval(intervalId);
}, [user, trackingData]);

 return null;
};
