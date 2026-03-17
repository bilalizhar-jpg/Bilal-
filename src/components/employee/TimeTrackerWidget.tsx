import React, { useState } from 'react';
import { useTimeTracking } from '../../context/TimeTrackingContext';
import { useAuth } from '../../context/AuthContext';
import { Camera, Clock, AlertCircle, Coffee } from 'lucide-react';

export const TimeTrackerWidget = () => {
  const { user } = useAuth();
  const { trackingData, setCaptureInterval } = useTimeTracking();
  const [interval, setInterval] = useState(30);
  const [consented, setConsented] = useState(false);

  const todayDate = new Date().toISOString().split('T')[0];
  const docId = `${user?.id}_${todayDate}`;
  const data = trackingData[docId];

  if (!user || !data) return null;

  const handleConsent = () => {
    setConsented(true);
    setCaptureInterval(user.id, interval);
  };

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h}h ${m}m ${s}s`;
  };

  return (
    <div className="glass-card p-6 border border-white/5 space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-[10px] font-black text-white uppercase tracking-[0.2em] flex items-center gap-2">
          <Clock className="w-4 h-4 text-indigo-400" />
          Time Tracking
        </h3>
        <div className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${
          data.status === 'Online' ? 'bg-emerald-500/20 text-emerald-400' :
          data.status === 'Idle' ? 'bg-amber-500/20 text-amber-400' :
          data.status === 'On Break' ? 'bg-blue-500/20 text-blue-400' :
          'bg-slate-500/20 text-slate-400'
        }`}>
          {data.status}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
          <p className="text-[10px] font-bold text-slate-400 uppercase mb-1 flex items-center gap-1">
            <Clock className="w-3 h-3" /> Working
          </p>
          <p className="text-xl font-mono font-bold text-white">{formatTime(data.workingTime)}</p>
        </div>
        <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
          <p className="text-[10px] font-bold text-slate-400 uppercase mb-1 flex items-center gap-1">
            <Coffee className="w-3 h-3" /> Idle/Break
          </p>
          <p className="text-xl font-mono font-bold text-amber-400">{formatTime(data.idleTime)}</p>
        </div>
      </div>

      {!consented && data.captureInterval === 0 ? (
        <div className="space-y-4 pt-4 border-t border-white/5">
          <p className="text-xs text-slate-400">
            Enable screen capture to improve productivity transparency.
          </p>
          <div className="flex items-center gap-4">
            <label className="text-xs text-slate-400">Interval (min):</label>
            <input 
              type="number" 
              value={interval} 
              onChange={(e) => setInterval(Number(e.target.value))}
              className="bg-white/5 border border-white/10 rounded-lg p-2 text-white w-16 text-xs"
            />
            <button 
              onClick={handleConsent}
              className="flex-1 px-4 py-2 bg-indigo-500 text-white text-xs font-bold rounded-lg hover:bg-indigo-600 transition-all"
            >
              Enable Capture
            </button>
          </div>
        </div>
      ) : (
        <div className="text-[10px] text-slate-500 flex items-center gap-2 pt-4 border-t border-white/5">
          <Camera className="w-3 h-3" />
          Screen capture active every {data.captureInterval} minutes
        </div>
      )}
    </div>
  );
};
