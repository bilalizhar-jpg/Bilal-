import React, { useState } from 'react';
import { useTimeTracking } from '../../context/TimeTrackingContext';
import { useAuth } from '../../context/AuthContext';
import { Camera, Settings } from 'lucide-react';

export const TimeTrackerWidget = () => {
  const { user } = useAuth();
  const { trackingData, setCaptureInterval } = useTimeTracking();
  const [interval, setInterval] = useState(30);
  const [consented, setConsented] = useState(false);

  if (!user || !trackingData[user.id]) return null;

  const handleConsent = () => {
    setConsented(true);
    setCaptureInterval(user.id, interval);
  };

  return (
    <div className="glass-card p-6 border border-white/5">
      <h3 className="text-[10px] font-black text-white uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
        <Camera className="w-4 h-4 text-indigo-400" />
        Time Tracking Settings
      </h3>
      {!consented ? (
        <div className="space-y-4">
          <p className="text-sm text-slate-400">
            To improve productivity, we offer a transparent time tracking feature that captures screen previews.
            This is entirely optional and requires your consent.
          </p>
          <div className="flex items-center gap-4">
            <label className="text-sm text-slate-400">Capture interval (minutes):</label>
            <input 
              type="number" 
              value={interval} 
              onChange={(e) => setInterval(Number(e.target.value))}
              className="bg-white/5 border border-white/10 rounded-lg p-2 text-white w-20"
            />
          </div>
          <button 
            onClick={handleConsent}
            className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-all"
          >
            I Consent to Screen Capture
          </button>
        </div>
      ) : (
        <div className="text-sm text-emerald-400">
          Screen capture is active every {trackingData[user.id].captureInterval} minutes.
        </div>
      )}
    </div>
  );
};
