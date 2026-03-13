import React, { useState, useRef, useEffect, useMemo } from 'react';
import EmployeeLayout from '../../components/EmployeeLayout';
import { Camera, MapPin, Clock, Coffee, LogOut, CheckCircle2, AlertCircle, Monitor, Calendar, ChevronLeft, ChevronRight, RefreshCw, User, Shield, Zap, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { useAttendance } from '../../context/AttendanceContext';
import { useTimeTracking } from '../../context/TimeTrackingContext';
import { useEmployees } from '../../context/EmployeeContext';

type TabType = 'mark' | 'daily' | 'weekly' | 'monthly';

export default function EmployeeAttendance() {
  const { theme } = useTheme();
  const { user, login } = useAuth();
  const { addLog, getEmployeeTodayRecord, attendanceRecords } = useAttendance();
  const { startTracking, stopTracking, updateTracking, trackingData } = useTimeTracking();
  const { updateEmployee } = useEmployees();
  const isDark = theme === 'dark';
  
  const [activeTab, setActiveTab] = useState<TabType>('mark');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [location, setLocation] = useState<{lat: number, lng: number} | null>(null);
  const [locationError, setLocationError] = useState('');
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isPerformingAction, setIsPerformingAction] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  
  const todayDate = new Date().toISOString().split('T')[0];
  const todayRecord = user ? getEmployeeTodayRecord(user.id, todayDate) : undefined;
  
  const attendanceState = todayRecord?.currentState || 'not_checked_in';
  const logs = todayRecord?.logs || [];

  const empTracking = user ? trackingData[`${user.id}_${todayDate}`] : null;
  console.log("empTracking:", empTracking, "attendanceState:", attendanceState);

  const myRecords = useMemo(() => {
    if (!user) return [];
    const empId = user.id;
    return attendanceRecords.filter(r => r.employeeId === empId).sort((a, b) => b.date.localeCompare(a.date));
  }, [attendanceRecords, user]);

  const filteredRecords = useMemo(() => {
    if (activeTab === 'mark') return [];
    
    const now = new Date();
    if (activeTab === 'daily') {
      return myRecords.filter(r => r.date === todayDate);
    } else if (activeTab === 'weekly') {
      const weekAgo = new Date();
      weekAgo.setDate(now.getDate() - 7);
      return myRecords.filter(r => new Date(r.date) >= weekAgo);
    } else if (activeTab === 'monthly') {
      const monthAgo = new Date();
      monthAgo.setMonth(now.getMonth() - 1);
      return myRecords.filter(r => new Date(r.date) >= monthAgo);
    }
    return myRecords;
  }, [myRecords, activeTab, todayDate]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    getLocation();
    return () => clearInterval(timer);
  }, []);

  // Monitoring Logic - Handled by ActivityTracker component in Layout
  useEffect(() => {
    if (attendanceState === 'checked_in' && user) {
      const empId = user.id;
      // We still want to ensure status is Online when they are on this page
      updateTracking(empId, { status: 'Online' });
    }
  }, [attendanceState, user, updateTracking]);

  const getLocation = () => {
    setIsGettingLocation(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          setLocationError('');
          setIsGettingLocation(false);
        },
        (error) => {
          console.error("Geolocation error:", error);
          let msg = 'Unable to retrieve your location.';
          if (error.code === 1) msg = 'Location permission denied. Please enable it in browser settings.';
          else if (error.code === 2) msg = 'Location unavailable.';
          else if (error.code === 3) msg = 'Location request timed out.';
          
          setLocationError(msg);
          setIsGettingLocation(false);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    } else {
      setLocationError('Geolocation is not supported by your browser.');
      setIsGettingLocation(false);
    }
  };

  const [stream, setStream] = useState<MediaStream | null>(null);

  const startCamera = async () => {
    console.log("startCamera called");
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("getUserMedia not supported");
      }
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
      console.log("Camera stream obtained");
      setStream(mediaStream);
      setIsCameraActive(true);
    } catch (err) {
      console.error("Error accessing camera:", err);
      alert("Could not access camera: " + (err instanceof Error ? err.message : String(err)));
    }
  };

  useEffect(() => {
    if (isCameraActive && videoRef.current && stream) {
      console.log("Attaching stream to video element in useEffect");
      videoRef.current.srcObject = stream;
    }
  }, [isCameraActive, stream]);

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  };

  const capturePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        setCapturedImage(canvas.toDataURL('image/jpeg'));
        stopCamera();
      }
    }
  };

  const handleAction = async (action: 'check_in' | 'break_start' | 'break_end' | 'check_out', skipSelfie: boolean = false) => {
    if (!user || isPerformingAction) return;
    
    if (!location) {
      setIsPerformingAction(true);
      // Try to get location one last time
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const loc = { lat: position.coords.latitude, lng: position.coords.longitude };
            setLocation(loc);
            await proceedWithAction(action, loc, skipSelfie);
            setIsPerformingAction(false);
          },
          (error) => {
            setIsPerformingAction(false);
            alert("Location is required. Please enable location permissions in your browser.");
            getLocation();
          },
          { enableHighAccuracy: true, timeout: 5000 }
        );
      } else {
        setIsPerformingAction(false);
        alert("Geolocation is not supported.");
      }
      return;
    }

    setIsPerformingAction(true);
    await proceedWithAction(action, location, skipSelfie);
    setIsPerformingAction(false);
  };

  const proceedWithAction = async (action: string, loc: {lat: number, lng: number}, skipSelfie: boolean = false) => {
    if (!user) return;

    const empId = user.id;
    const timeStr = currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const locStr = `${loc.lat.toFixed(4)}, ${loc.lng.toFixed(4)}`;
    
    let actionStr = '';
    let newState: 'not_checked_in' | 'checked_in' | 'on_break' | 'checked_out' = 'not_checked_in';
    
    if (action === 'check_in') {
      newState = 'checked_in';
      actionStr = 'Checked In';
      startTracking(empId, user.name, user.companyId || '');
    } else if (action === 'break_start') {
      newState = 'on_break';
      actionStr = 'Started Break';
      updateTracking(empId, { status: 'Idle' });
    } else if (action === 'break_end') {
      newState = 'checked_in';
      actionStr = 'Ended Break';
      updateTracking(empId, { status: 'Online' });
    } else if (action === 'check_out') {
      newState = 'checked_out';
      actionStr = 'Checked Out';
      stopTracking(empId);
    }

    try {
      await addLog(user.companyId || '', empId, user.name, actionStr, locStr, timeStr, todayDate, newState, skipSelfie ? undefined : (capturedImage || undefined));
      
      // Save selfie as profile picture if captured
      if (!skipSelfie && capturedImage && user) {
        try {
          await updateEmployee(empId, { avatar: capturedImage });
          login({ ...user, avatar: capturedImage });
        } catch (err) {
          console.error("Error saving profile picture:", err);
        }
      }

      if (action === 'check_in' || action === 'check_out') {
        setCapturedImage(null);
      }
    } catch (error) {
      console.error("Error performing attendance action:", error);
      alert("Failed to record attendance. Please try again.");
    }
  };

  return (
    <EmployeeLayout>
      <div className="min-h-screen -m-4 md:-m-8 p-4 md:p-8 transition-colors duration-500 bg-white text-black">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header Section */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-2"
            >
              <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl">
                Attendance <span className="text-indigo-600">Terminal</span>
              </h1>
              <p className="text-slate-500 dark:text-slate-400 text-lg max-w-md">
                Securely record your presence and track your professional hours in real-time.
              </p>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex p-1.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm backdrop-blur-md"
            >
              {[
                { id: 'mark', label: 'Terminal', icon: Monitor },
                { id: 'daily', label: 'Daily', icon: Activity },
                { id: 'weekly', label: 'Weekly', icon: Calendar },
                { id: 'monthly', label: 'Monthly', icon: Calendar },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as TabType)}
                  className={`relative flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${
                    activeTab === tab.id 
                      ? 'text-white bg-indigo-600 shadow-lg shadow-indigo-500/30' 
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </motion.div>
          </div>

          {activeTab === 'mark' ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Left Column: Clock and Actions */}
              <div className="lg:col-span-8 space-y-8">
                {/* Hero Clock Card */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`relative rounded-[2.5rem] p-12 border ${isDark ? 'bg-slate-900/40 border-slate-800' : 'bg-white border-slate-200 shadow-xl shadow-slate-200/50'} backdrop-blur-2xl overflow-hidden`}
                >
                  {/* Background Decorative Elements */}
                  <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl" />
                  <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl" />

                  <div className="relative flex flex-col md:flex-row items-center justify-between gap-12">
                    <div className="text-center md:text-left space-y-4">
                      <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">System Operational</span>
                      </div>
                      
                      <div className="flex items-baseline gap-3">
                        <span className="text-8xl font-black tracking-tighter text-slate-900 dark:text-white">
                          {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
                        </span>
                        <span className="text-4xl text-slate-400 font-bold tabular-nums">
                          {currentTime.toLocaleTimeString([], { second: '2-digit' })}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400 text-xl font-semibold">
                        <Calendar className="w-6 h-6 text-indigo-500" />
                        {currentTime.toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                      </div>
                    </div>

                    {attendanceState === 'checked_in' && empTracking && (
                      <motion.div 
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex flex-col items-center md:items-end p-8 rounded-3xl bg-indigo-600/5 border border-indigo-600/10"
                      >
                        <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest mb-2">Active Session</span>
                        <div className="text-5xl font-black tabular-nums text-slate-900 dark:text-white tracking-tight">
                          {Math.floor(empTracking.workingTime / 3600).toString().padStart(2, '0')}:
                          {Math.floor((empTracking.workingTime % 3600) / 60).toString().padStart(2, '0')}:
                          {(empTracking.workingTime % 60).toString().padStart(2, '0')}
                        </div>
                        <div className="flex gap-1.5 mt-5">
                          {[1, 2, 3, 4, 5].map(i => (
                            <motion.div 
                              key={i}
                              animate={{ height: [12, 32, 12] }}
                              transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.15 }}
                              className="w-1.5 bg-indigo-500 rounded-full"
                            />
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </div>
                </motion.div>

                {/* Verification Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Location Card */}
                  <motion.div 
                    whileHover={{ y: -5 }}
                    className={`p-8 rounded-3xl border transition-all duration-300 ${isDark ? 'bg-slate-900/40 border-slate-800 hover:border-slate-700' : 'bg-white border-slate-200 shadow-sm hover:shadow-md'}`}
                  >
                    <div className="flex items-center gap-5 mb-8">
                      <div className={`p-4 rounded-2xl ${location ? 'bg-emerald-500/10 text-emerald-600' : 'bg-slate-100 text-slate-400 dark:bg-slate-800'}`}>
                        <MapPin className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold">Geofencing</h3>
                        <p className="text-sm text-slate-500">Location-based verification</p>
                      </div>
                    </div>

                    {location ? (
                      <div className="space-y-4">
                        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 font-mono text-sm flex justify-between items-center">
                          <div className="space-y-1">
                            <span className="block text-[10px] uppercase font-bold text-slate-400">Latitude</span>
                            <span className="text-slate-700 dark:text-slate-300">{location.lat.toFixed(6)}</span>
                          </div>
                          <div className="w-px h-8 bg-slate-200 dark:bg-slate-700" />
                          <div className="space-y-1 text-right">
                            <span className="block text-[10px] uppercase font-bold text-slate-400">Longitude</span>
                            <span className="text-slate-700 dark:text-slate-300">{location.lng.toFixed(6)}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2.5 px-4 py-2 rounded-xl bg-emerald-500/5 text-xs text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-wider border border-emerald-500/10">
                          <Shield className="w-4 h-4" />
                          Location Secured
                        </div>
                      </div>
                    ) : (
                      <button 
                        onClick={getLocation}
                        disabled={isGettingLocation}
                        className="w-full py-4 rounded-2xl bg-indigo-600 text-white font-bold text-sm uppercase tracking-widest hover:bg-indigo-700 transition-all disabled:opacity-50 shadow-lg shadow-indigo-600/20"
                      >
                        {isGettingLocation ? (
                          <div className="flex items-center justify-center gap-2">
                            <RefreshCw className="w-4 h-4 animate-spin" />
                            <span>Locating...</span>
                          </div>
                        ) : 'Verify Position'}
                      </button>
                    )}
                  </motion.div>

                  {/* Camera Card */}
                  <motion.div 
                    whileHover={{ y: -5 }}
                    className={`p-8 rounded-3xl border transition-all duration-300 ${isDark ? 'bg-slate-900/40 border-slate-800 hover:border-slate-700' : 'bg-white border-slate-200 shadow-sm hover:shadow-md'}`}
                  >
                    <div className="flex items-center gap-5 mb-8">
                      <div className={`p-4 rounded-2xl ${capturedImage ? 'bg-indigo-500/10 text-indigo-600' : 'bg-slate-100 text-slate-400 dark:bg-slate-800'}`}>
                        <Camera className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold">Biometric Sync</h3>
                        <p className="text-sm text-slate-500">Visual identity check</p>
                      </div>
                    </div>

                    <AnimatePresence mode="wait">
                      {capturedImage ? (
                        <motion.div 
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="flex items-center gap-6"
                        >
                          <div className="relative w-24 h-24 rounded-2xl overflow-hidden border-4 border-indigo-500/10 group">
                            <img src={capturedImage} alt="" className="w-full h-full object-cover" />
                            <button 
                              onClick={() => { setCapturedImage(null); startCamera(); }}
                              className="absolute inset-0 bg-indigo-600/80 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-[10px] font-bold text-white uppercase gap-1"
                            >
                              <RefreshCw className="w-4 h-4" />
                              Retake
                            </button>
                          </div>
                          <div className="flex-1 space-y-3">
                            <div className="px-3 py-1 rounded-lg bg-indigo-500/10 text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest inline-block">
                              Identity Captured
                            </div>
                            <button
                              onClick={async () => {
                                if (capturedImage && user) {
                                  try {
                                    await updateEmployee(user.id, { avatar: capturedImage });
                                    login({ ...user, avatar: capturedImage });
                                    alert("Profile identity synchronized successfully.");
                                  } catch (err) { console.error(err); }
                                }
                              }}
                              className="w-full py-2.5 rounded-xl border border-indigo-200 dark:border-indigo-900/50 text-[10px] font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all"
                            >
                              Sync to Profile
                            </button>
                          </div>
                        </motion.div>
                      ) : isCameraActive ? (
                        <motion.div 
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="space-y-4"
                        >
                          <div className="relative aspect-video rounded-2xl overflow-hidden bg-black border-2 border-indigo-500/20">
                            <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover scale-x-[-1]" />
                            <div className="absolute inset-0 border-[20px] border-black/20 pointer-events-none" />
                          </div>
                          <div className="flex gap-3">
                            <button onClick={capturePhoto} className="flex-1 py-3 rounded-xl bg-indigo-600 text-white font-bold text-xs uppercase tracking-widest hover:bg-indigo-700 transition-all">Capture ID</button>
                            <button onClick={stopCamera} className="flex-1 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 font-bold text-xs uppercase tracking-widest text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all">Cancel</button>
                          </div>
                        </motion.div>
                      ) : (
                        <button 
                          onClick={startCamera} 
                          className="w-full py-4 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 font-bold text-xs uppercase tracking-widest text-slate-500 hover:text-indigo-600 hover:border-indigo-500/50 hover:bg-indigo-50/30 dark:hover:bg-indigo-900/10 transition-all flex flex-col items-center gap-2"
                        >
                          <Camera className="w-5 h-5" />
                          Enable Visual ID
                        </button>
                      )}
                    </AnimatePresence>
                  </motion.div>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  {[
                    { id: 'check_in', label: 'Check In', icon: Clock, color: 'emerald', active: attendanceState === 'not_checked_in' || attendanceState === 'checked_out' },
                    { id: 'break_start', label: 'Start Break', icon: Coffee, color: 'amber', active: attendanceState === 'checked_in' },
                    { id: 'break_end', label: 'End Break', icon: CheckCircle2, color: 'blue', active: attendanceState === 'on_break' },
                    { id: 'check_out', label: 'Check Out', icon: LogOut, color: 'red', active: attendanceState === 'checked_in' || attendanceState === 'on_break' },
                  ].map((action) => (
                    <motion.button
                      key={action.id}
                      whileHover={action.active && !isPerformingAction ? { scale: 1.02, y: -2 } : {}}
                      whileTap={action.active && !isPerformingAction ? { scale: 0.98 } : {}}
                      onClick={() => handleAction(action.id as any, !capturedImage)}
                      disabled={isPerformingAction || !action.active}
                      className={`flex flex-col items-center justify-center p-8 rounded-[2rem] border-2 transition-all duration-300 gap-4 group ${
                        action.active && !isPerformingAction
                          ? `border-${action.color}-500/20 bg-white dark:bg-slate-900 shadow-sm hover:shadow-xl hover:shadow-${action.color}-500/10`
                          : 'border-slate-100 dark:border-slate-900 bg-slate-50/50 dark:bg-slate-950/50 text-slate-300 dark:text-slate-700 cursor-not-allowed opacity-40'
                      }`}
                    >
                      <div className={`p-5 rounded-2xl transition-all duration-300 ${
                        action.active && !isPerformingAction 
                          ? `bg-${action.color}-500 text-white shadow-lg shadow-${action.color}-500/40 group-hover:scale-110` 
                          : 'bg-slate-200 dark:bg-slate-800'
                      }`}>
                        {isPerformingAction ? <RefreshCw className="w-6 h-6 animate-spin" /> : <action.icon className="w-6 h-6" />}
                      </div>
                      <span className={`text-xs font-black uppercase tracking-[0.2em] ${
                        action.active && !isPerformingAction ? `text-${action.color}-600 dark:text-${action.color}-400` : ''
                      }`}>
                        {action.label}
                      </span>
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Right Column: Activity Stream */}
              <div className="lg:col-span-4">
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`rounded-[2.5rem] border ${isDark ? 'bg-slate-900/40 border-slate-800' : 'bg-white border-slate-200 shadow-xl shadow-slate-200/50'} overflow-hidden flex flex-col h-[calc(100vh-16rem)] sticky top-8`}
                >
                  <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/20">
                    <div className="space-y-1">
                      <h3 className="font-black text-lg tracking-tight">Activity Log</h3>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em]">Real-time Stream</p>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-xs font-black">
                      <Zap className="w-3.5 h-3.5" />
                      {logs.length}
                    </div>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
                    {logs.length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center text-slate-300 dark:text-slate-700">
                        <div className="w-20 h-20 rounded-full bg-slate-50 dark:bg-slate-800/50 flex items-center justify-center mb-6">
                          <Activity className="w-10 h-10 opacity-20" />
                        </div>
                        <p className="text-sm font-bold uppercase tracking-widest">No activity detected</p>
                      </div>
                    ) : (
                      <div className="space-y-10 relative before:absolute before:left-[1.375rem] before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100 dark:before:bg-slate-800">
                        {logs.map((log, index) => (
                          <motion.div 
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            key={index} 
                            className="relative pl-12 group"
                          >
                            <div className={`absolute left-0 top-0 w-11 h-11 rounded-2xl flex items-center justify-center z-10 border-4 ${isDark ? 'border-slate-900' : 'border-white'} shadow-sm transition-transform group-hover:scale-110 ${
                              log.action.includes('In') ? 'bg-emerald-500 text-white shadow-emerald-500/20' : 
                              log.action.includes('Out') ? 'bg-red-500 text-white shadow-red-500/20' : 
                              'bg-amber-500 text-white shadow-amber-500/20'
                            }`}>
                              {log.action.includes('Check') ? <Clock className="w-5 h-5" /> : <Coffee className="w-5 h-5" />}
                            </div>
                            
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <h4 className="font-black text-sm tracking-tight text-slate-900 dark:text-white">{log.action}</h4>
                                <span className="text-[10px] font-black text-slate-400 bg-slate-50 dark:bg-slate-800 px-2 py-1 rounded-md">{log.time}</span>
                              </div>
                              
                              {log.selfie && (
                                <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-slate-100 dark:border-slate-800 shadow-sm">
                                  <img src={log.selfie} alt="" className="w-full h-full object-cover" />
                                </div>
                              )}
                              
                              <div className="flex items-center gap-2 text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                                <MapPin className="w-3.5 h-3.5 text-indigo-500" />
                                <span className="truncate max-w-[150px]">{log.location}</span>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              </div>
            </div>
          ) : (
            /* Reports View - Clean Professional Table */
            <motion.div 
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`rounded-[2.5rem] border ${isDark ? 'bg-slate-900/40 border-slate-800' : 'bg-white border-slate-200 shadow-xl shadow-slate-200/50'} overflow-hidden`}
            >
              <div className="p-10 border-b border-slate-100 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-slate-50/50 dark:bg-slate-800/20">
                <div className="space-y-1">
                  <h3 className="font-black text-2xl tracking-tight">
                    {activeTab === 'daily' ? 'Daily Report' : activeTab === 'weekly' ? 'Weekly Performance' : 'Monthly Overview'}
                  </h3>
                  <p className="text-slate-500 font-medium">Detailed historical attendance and productivity metrics.</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="px-4 py-2 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-black text-slate-600 dark:text-slate-400 shadow-sm">
                    {filteredRecords.length} Records Detected
                  </div>
                  <div className="w-3 h-3 rounded-full bg-indigo-500 animate-pulse shadow-lg shadow-indigo-500/50" />
                </div>
              </div>

              {activeTab === 'daily' && empTracking && (
                <div className="p-10 border-b border-slate-100 dark:border-slate-800 bg-indigo-600/[0.02]">
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
                    {[
                      { label: 'Mouse Precision', value: empTracking.mouseMoves, icon: Activity, color: 'indigo' },
                      { label: 'Keystroke Count', value: empTracking.keyboardClicks, icon: Zap, color: 'amber' },
                      { label: 'Idle Duration', value: `${Math.floor(empTracking.idleTime / 60)}m ${empTracking.idleTime % 60}s`, icon: Coffee, color: 'slate' },
                      { label: 'Live Status', value: empTracking.status, icon: Shield, color: empTracking.status === 'Online' ? 'emerald' : 'amber' },
                    ].map((stat, i) => (
                      <div key={i} className="space-y-3 p-6 rounded-3xl bg-white dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 shadow-sm">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg bg-${stat.color}-500/10 text-${stat.color}-600 dark:text-${stat.color}-400`}>
                            <stat.icon className="w-4 h-4" />
                          </div>
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{stat.label}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {stat.label === 'Live Status' && (
                            <div className={`w-2.5 h-2.5 rounded-full ${stat.value === 'Online' ? 'bg-emerald-500' : 'bg-amber-500'} shadow-lg shadow-current/50`} />
                          )}
                          <div className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">{stat.value}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/30">
                      {['Date', 'Entry Time', 'Exit Time', 'Working Hours', 'Status'].map((h) => (
                        <th key={h} className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                    {filteredRecords.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-10 py-32 text-center">
                          <div className="w-24 h-24 rounded-full bg-slate-50 dark:bg-slate-900/50 flex items-center justify-center mx-auto mb-8">
                            <Activity className="w-12 h-12 opacity-10" />
                          </div>
                          <p className="text-sm font-black uppercase tracking-widest text-slate-400">Archive Empty</p>
                        </td>
                      </tr>
                    ) : (
                      filteredRecords.map((record, idx) => (
                        <motion.tr 
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.05 }}
                          key={record.id} 
                          className="group hover:bg-indigo-600/[0.02] dark:hover:bg-indigo-600/[0.05] transition-colors"
                        >
                          <td className="px-10 py-7">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xs font-black text-slate-500 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                                {new Date(record.date).getDate()}
                              </div>
                              <span className="text-sm font-black text-slate-900 dark:text-white tracking-tight">{record.date}</span>
                            </div>
                          </td>
                          <td className="px-10 py-7">
                            <div className="flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 px-3 py-1.5 rounded-lg w-fit">
                              <Clock className="w-3.5 h-3.5 text-emerald-500" />
                              {record.loginTime || '--:--'}
                            </div>
                          </td>
                          <td className="px-10 py-7">
                            <div className="flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 px-3 py-1.5 rounded-lg w-fit">
                              <LogOut className="w-3.5 h-3.5 text-red-500" />
                              {record.logoutTime || '--:--'}
                            </div>
                          </td>
                          <td className="px-10 py-7">
                            <span className="px-4 py-2 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-xs font-black tracking-tight border border-indigo-100 dark:border-indigo-900/50">
                              {record.workingHours}
                            </span>
                          </td>
                          <td className="px-10 py-7">
                            <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border ${
                              record.status === 'Present' ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' :
                              record.status === 'Leave' ? 'bg-amber-500/10 text-amber-600 border-amber-500/20' :
                              'bg-red-500/10 text-red-600 border-red-500/20'
                            }`}>
                              <div className={`w-1.5 h-1.5 rounded-full ${
                                record.status === 'Present' ? 'bg-emerald-500' :
                                record.status === 'Leave' ? 'bg-amber-500' :
                                'bg-red-500'
                              }`} />
                              {record.status}
                            </span>
                          </td>
                        </motion.tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </EmployeeLayout>
  );
}
