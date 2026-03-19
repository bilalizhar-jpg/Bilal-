import { useEffect, useRef } from 'react';
import { useTimeTracking } from '../../context/TimeTrackingContext';
import { useAuth } from '../../context/AuthContext';

const API_URL = '/api';
const getHeaders = () => {
  const token = localStorage.getItem('auth_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

async function uploadDataUrl(dataUrl: string): Promise<string> {
  const res = await fetch(dataUrl);
  const blob = await res.blob();
  const file = new File([blob], `screenshot_${Date.now()}.jpg`, { type: 'image/jpeg' });
  const formData = new FormData();
  formData.append('file', file);
  const uploadRes = await fetch(`${API_URL}/upload`, {
    method: 'POST',
    headers: getHeaders(),
    body: formData,
  });
  if (!uploadRes.ok) throw new Error('Upload failed');
  const data = await uploadRes.json();
  const path = data.url || `/uploads/${data.filename}`;
  return path.startsWith('http') ? path : `${window.location.origin}${path.startsWith('/') ? '' : '/'}${path}`;
}

export const ScreenCapture = () => {
  const { user } = useAuth();
  const { trackingData, updateTracking } = useTimeTracking();
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    const todayDate = new Date().toISOString().split('T')[0];
    const docId = `${user?.id}_${todayDate}`;

    if (!user || !trackingData[docId] || !trackingData[docId].captureInterval) return;

    const intervalMinutes = trackingData[docId].captureInterval!;
    const intervalMs = intervalMinutes * 60 * 1000;

    const capture = async () => {
      try {
        if (!streamRef.current) {
          streamRef.current = await navigator.mediaDevices.getDisplayMedia({ video: true });
        }

        const video = document.createElement('video');
        video.srcObject = streamRef.current;
        await video.play();

        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        canvas.getContext('2d')?.drawImage(video, 0, 0);

        const dataUrl = canvas.toDataURL('image/jpeg');
        const downloadUrl = await uploadDataUrl(dataUrl);

        updateTracking(user.employeeId || user.id, { screenshot: downloadUrl });

        video.pause();
        video.srcObject = null;
      } catch (error) {
        console.error('Error capturing screen:', error);
      }
    };

    const intervalId = setInterval(capture, intervalMs);
    return () => clearInterval(intervalId);
  }, [user, trackingData, updateTracking]);

  return null;
};
