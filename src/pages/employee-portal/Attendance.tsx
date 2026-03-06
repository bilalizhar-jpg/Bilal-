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
  const todayRecord = user ? getEmployeeTodayRecord(user.employeeId || user.id, todayDate) : undefined;
  
  const attendanceState = todayRecord?.currentState || 'not_checked_in';
  const logs = todayRecord?.logs || [];

  const empTracking = user ? trackingData[user.employeeId || user.id] : null;
  console.log("empTracking:", empTracking, "attendanceState:", attendanceState);

  const myRecords = useMemo(() => {
    if (!user) return [];
    const empId = user.employeeId || user.id;
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

  // Monitoring Logic
  useEffect(() => {
    if (attendanceState === 'checked_in' && user) {
      const empId = user.employeeId || user.id;
      
      const handleActivity = () => {
        updateTracking(empId, { status: 'Online' });
      };

      const handleMouseMove = () => {
        updateTracking(empId, { 
          status: 'Online',
          mouseMoves: (trackingData[empId]?.mouseMoves || 0) + 1 
        });
      };

      const handleKeyPress = () => {
        updateTracking(empId, { 
          status: 'Online',
          keyboardClicks: (trackingData[empId]?.keyboardClicks || 0) + 1 
        });
      };

      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('keydown', handleKeyPress);
      window.addEventListener('mousedown', handleActivity);
      window.addEventListener('touchstart', handleActivity);

      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('keydown', handleKeyPress);
        window.removeEventListener('mousedown', handleActivity);
        window.removeEventListener('touchstart', handleActivity);
      };
    }
  }, [attendanceState, user, updateTracking, trackingData]);

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

    const empId = user.employeeId || user.id;
    const timeStr = currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const locStr = `${loc.lat.toFixed(4)}, ${loc.lng.toFixed(4)}`;
    
    let actionStr = '';
    let newState: 'not_checked_in' | 'checked_in' | 'on_break' | 'checked_out' = 'not_checked_in';
    
    if (action === 'check_in') {
      newState = 'checked_in';
      actionStr = 'Checked In';
      startTracking(empId, user.name);
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
      <div className={`min-h-screen -m-4 md:-m-8 p-4 md:p-8 transition-colors duration-700 overflow-hidden relative ${isDark ? 'bg-[#020203] text-white' : 'bg-slate-50 text-slate-900'}`}>
        {/* Immersive Background Atmosphere */}
        {isDark && (
          <div className="fixed inset-0 pointer-events-none overflow-hidden">
            <motion.div 
              animate={{ 
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.5, 0.3],
                x: [0, 50, 0],
                y: [0, 30, 0]
              }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-indigo-600/10 blur-[150px]" 
            />
            <motion.div 
              animate={{ 
                scale: [1.2, 1, 1.2],
                opacity: [0.2, 0.4, 0.2],
                x: [0, -40, 0],
                y: [0, -20, 0]
              }}
              transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
              className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-emerald-600/10 blur-[150px]" 
            />
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay" />
            <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:40px_40px]" />
          </div>
        )}

        <div className="relative z-10 max-w-[1600px] mx-auto">
          {/* Top Navigation & Profile Bar */}
          <motion.div 
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="flex flex-col lg:flex-row items-center justify-between gap-8 mb-12"
          >
            <div className="flex items-center gap-8">
              <div className="relative">
                <motion.div 
                  animate={{ rotate: 360 }}
                  transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                  className="absolute -inset-4 border border-dashed border-white/10 rounded-full"
                />
                <div className="relative w-20 h-20 rounded-full p-1 bg-gradient-to-tr from-indigo-500 via-purple-500 to-emerald-500">
                  <div className="w-full h-full rounded-full bg-black flex items-center justify-center overflow-hidden">
                    {user?.avatar ? (
                      <img src={user.avatar} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    ) : (
                      <User className="w-8 h-8 text-white/40" />
                    )}
                  </div>
                </div>
              </div>
              <div>
                <motion.h1 
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="text-5xl font-black tracking-tighter uppercase leading-none"
                >
                  {user?.name || 'ALI RAZA'}
                </motion.h1>
                <div className="flex items-center gap-3 mt-2">
                  <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[10px] font-mono text-slate-500 tracking-widest uppercase">
                    ID: {user?.employeeId || 'SYS-001'}
                  </span>
                  <span className="w-1 h-1 rounded-full bg-slate-700" />
                  <span className="text-[10px] font-mono text-emerald-500 tracking-widest uppercase animate-pulse">
                    System Online
                  </span>
                </div>
              </div>
            </div>

            <div className="flex p-1 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl">
                  {[
                { id: 'mark', label: 'Terminal', icon: Monitor },
                { id: 'daily', label: 'Daily', icon: Calendar },
                { id: 'weekly', label: 'Weekly', icon: Calendar },
                { id: 'monthly', label: 'Monthly', icon: Calendar },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as TabType)}
                  className={`relative flex items-center gap-2 px-6 py-3 rounded-xl text-[10px] font-black transition-all duration-500 uppercase tracking-[0.2em] ${
                    activeTab === tab.id ? (isDark ? 'text-white' : 'text-slate-900') : (isDark ? 'text-slate-500 hover:text-white' : 'text-slate-500 hover:text-slate-900')
                  }`}
                >
                  {activeTab === tab.id && (
                    <motion.div 
                      layoutId="activeTab"
                      className={`absolute inset-0 ${isDark ? 'bg-white/10' : 'bg-slate-200'} rounded-xl border ${isDark ? 'border-white/20' : 'border-slate-300'}`}
                    />
                  )}
                  <tab.icon className="w-3.5 h-3.5 relative z-10" />
                  <span className="relative z-10">{tab.label}</span>
                </button>
              ))}
            </div>
          </motion.div>

          {activeTab === 'mark' ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Main Control Panel */}
              <div className="lg:col-span-8 space-y-8">
                {/* Time Tracking Metrics */}
                {empTracking && (
                  <motion.div 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className={`grid grid-cols-1 md:grid-cols-4 gap-6`}
                  >
                    <div className={`p-6 rounded-2xl ${isDark ? 'bg-white/5 border-white/10' : 'bg-slate-100 border-slate-200'}`}>
                      <div className="text-[10px] font-black uppercase tracking-widest text-slate-500">Mouse Moves</div>
                      <div className="text-2xl font-black mt-2">{empTracking.mouseMoves}</div>
                    </div>
                    <div className={`p-6 rounded-2xl ${isDark ? 'bg-white/5 border-white/10' : 'bg-slate-100 border-slate-200'}`}>
                      <div className="text-[10px] font-black uppercase tracking-widest text-slate-500">Keyboard Clicks</div>
                      <div className="text-2xl font-black mt-2">{empTracking.keyboardClicks}</div>
                    </div>
                    <div className={`p-6 rounded-2xl ${isDark ? 'bg-white/5 border-white/10' : 'bg-slate-100 border-slate-200'}`}>
                      <div className="text-[10px] font-black uppercase tracking-widest text-slate-500">Status</div>
                      <div className="text-2xl font-black mt-2">{empTracking.status}</div>
                    </div>
                    {empTracking.screenshot && (
                      <div className={`p-6 rounded-2xl ${isDark ? 'bg-white/5 border-white/10' : 'bg-slate-100 border-slate-200'}`}>
                        <div className="text-[10px] font-black uppercase tracking-widest text-slate-500">Latest Screen</div>
                        <img src={empTracking.screenshot} alt="Screen" className="w-full h-20 object-cover mt-2 rounded-lg" />
                      </div>
                    )}
                  </motion.div>
                )}

                {/* Hero Clock Section */}
                <motion.div 
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="relative group"
                >
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500/20 to-emerald-500/20 rounded-[3rem] blur-2xl opacity-0 group-hover:opacity-100 transition duration-1000" />
                  <div className={`relative rounded-[3rem] p-12 border ${isDark ? 'bg-black/40 border-white/10' : 'bg-white border-slate-200'} backdrop-blur-3xl overflow-hidden`}>
                    <div className="absolute top-0 right-0 p-8 opacity-10">
                      <Zap className="w-32 h-32 text-indigo-500" />
                    </div>
                    
                    <div className="flex flex-col md:flex-row items-center justify-between gap-12">
                      <div className="space-y-6 text-center md:text-left">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Temporal Sync Active</span>
                        </div>
                        <h2 className="text-8xl md:text-9xl font-black tracking-tighter font-mono leading-none flex items-baseline gap-2">
                          {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
                          <span className="text-3xl text-slate-700 animate-pulse">:</span>
                          <span className="text-4xl text-slate-500">{currentTime.toLocaleTimeString([], { second: '2-digit' })}</span>
                        </h2>
                        <p className="text-xl text-slate-400 font-light tracking-widest uppercase italic">
                          {currentTime.toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' })}
                        </p>
                      </div>

                      {attendanceState === 'checked_in' && empTracking && (
                        <motion.div 
                          initial={{ x: 20, opacity: 0 }}
                          animate={{ x: 0, opacity: 1 }}
                          className="flex flex-col items-center md:items-end"
                        >
                          <div className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em] mb-2">Session Duration</div>
                          <div className="text-6xl font-mono font-black tabular-nums text-transparent bg-clip-text bg-gradient-to-b from-white to-white/20">
                            {Math.floor(empTracking.workingTime / 3600).toString().padStart(2, '0')}:
                            {Math.floor((empTracking.workingTime % 3600) / 60).toString().padStart(2, '0')}:
                            {(empTracking.workingTime % 60).toString().padStart(2, '0')}
                          </div>
                          <div className="mt-4 flex gap-2">
                            <div className="w-1 h-8 bg-indigo-500/20 rounded-full overflow-hidden">
                              <motion.div 
                                animate={{ height: ['0%', '100%', '0%'] }}
                                transition={{ duration: 2, repeat: Infinity }}
                                className="w-full bg-indigo-500"
                              />
                            </div>
                            <div className="w-1 h-8 bg-emerald-500/20 rounded-full overflow-hidden">
                              <motion.div 
                                animate={{ height: ['100%', '0%', '100%'] }}
                                transition={{ duration: 2.5, repeat: Infinity }}
                                className="w-full bg-emerald-500"
                              />
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </div>
                  </div>
                </motion.div>

                {/* Verification & Action Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Verification Column */}
                  <div className="space-y-8">
                    {/* Geo-Sync Card */}
                    <motion.div 
                      whileHover={{ y: -5 }}
                      className={`p-8 rounded-[2.5rem] border backdrop-blur-2xl transition-all duration-500 ${location ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-white/10 bg-white/5'}`}
                    >
                      <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-4">
                          <div className={`p-4 rounded-2xl ${location ? 'bg-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.4)]' : 'bg-white/5 text-slate-500'}`}>
                            <MapPin className="w-6 h-6" />
                          </div>
                          <div>
                            <h3 className="text-xs font-black uppercase tracking-[0.2em]">Geo-Sync</h3>
                            <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-1">Satellite Verification</p>
                          </div>
                        </div>
                        {location && <Activity className="w-4 h-4 text-emerald-500 animate-pulse" />}
                      </div>

                      {location ? (
                        <div className="space-y-4">
                          <div className="p-4 rounded-2xl bg-black/40 border border-white/5 font-mono text-xs text-emerald-400 flex justify-between items-center">
                            <span>LAT: {location.lat.toFixed(6)}</span>
                            <span className="text-[10px] text-slate-600">|</span>
                            <span>LNG: {location.lng.toFixed(6)}</span>
                          </div>
                          <div className="flex items-center gap-2 text-[10px] text-emerald-500/60 font-black uppercase tracking-widest">
                            <Shield className="w-3 h-3" />
                            Secure Connection Established
                          </div>
                        </div>
                      ) : (
                        <button 
                          onClick={getLocation}
                          disabled={isGettingLocation}
                          className="w-full py-5 rounded-2xl bg-white text-black font-black uppercase text-[10px] tracking-[0.3em] hover:bg-emerald-400 transition-all disabled:opacity-50"
                        >
                          {isGettingLocation ? 'SYNCING...' : 'INITIALIZE SYNC'}
                        </button>
                      )}
                    </motion.div>

                    {/* Biometric Scan Card */}
                    <motion.div 
                      whileHover={{ y: -5 }}
                      className={`p-8 rounded-[2.5rem] border backdrop-blur-2xl transition-all duration-500 ${capturedImage ? 'border-indigo-500/30 bg-indigo-500/5' : 'border-white/10 bg-white/5'}`}
                    >
                      <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-4">
                          <div className={`p-4 rounded-2xl ${capturedImage ? 'bg-indigo-500 shadow-[0_0_20px_rgba(99,102,241,0.4)]' : 'bg-white/5 text-slate-500'}`}>
                            <Camera className="w-6 h-6" />
                          </div>
                          <div>
                            <h3 className="text-xs font-black uppercase tracking-[0.2em]">Visual ID</h3>
                            <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-1">Biometric Optional</p>
                          </div>
                        </div>
                        {capturedImage && <div className="w-2 h-2 rounded-full bg-indigo-500 animate-ping" />}
                      </div>

                      <AnimatePresence mode="wait">
                        {capturedImage ? (
                          <motion.div 
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="flex items-center gap-6"
                          >
                            <div className="relative w-28 h-28 rounded-3xl overflow-hidden border-2 border-indigo-500/30 group">
                              <img src={capturedImage} alt="" className="w-full h-full object-cover" />
                              <button 
                                onClick={() => { setCapturedImage(null); startCamera(); }}
                                className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-[10px] font-black uppercase tracking-widest text-white"
                              >
                                Reset
                              </button>
                            </div>
                            <div className="flex-1 space-y-3">
                              <div className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">ID Captured</div>
                              <button
                                onClick={async () => {
                                  if (capturedImage && user) {
                                    try {
                                      const empId = user.employeeId || user.id;
                                      await updateEmployee(empId, { avatar: capturedImage });
                                      login({ ...user, avatar: capturedImage });
                                      alert("Profile Synchronized");
                                    } catch (err) { console.error(err); }
                                  }
                                }}
                                className="w-full py-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-[10px] font-black uppercase tracking-widest transition-all"
                              >
                                Sync Profile
                              </button>
                            </div>
                          </motion.div>
                        ) : isCameraActive ? (
                          <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="space-y-4"
                          >
                            <div className="relative aspect-square rounded-3xl overflow-hidden bg-black border border-white/10">
                              <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover scale-x-[-1]" />
                              <div className="absolute inset-0 border-[30px] border-black/40 pointer-events-none flex items-center justify-center">
                                <div className="w-full h-full border border-white/20 rounded-2xl" />
                              </div>
                            </div>
                            <div className="flex gap-3">
                              <button onClick={capturePhoto} className="flex-1 py-4 rounded-2xl bg-indigo-600 text-white font-black uppercase text-[10px] tracking-[0.2em]">Capture</button>
                              <button onClick={stopCamera} className="flex-1 py-4 rounded-2xl bg-white/5 text-white font-black uppercase text-[10px] tracking-[0.2em]">Abort</button>
                            </div>
                          </motion.div>
                        ) : (
                          <button 
                            onClick={startCamera} 
                            className="w-full py-5 rounded-2xl bg-white/5 border border-white/10 text-white font-black uppercase text-[10px] tracking-[0.3em] hover:bg-white/10 transition-all"
                          >
                            Initialize Camera
                          </button>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  </div>

                  {/* Action Column */}
                  <div className="grid grid-cols-1 gap-6">
                    {[
                      { id: 'check_in', label: attendanceState === 'checked_out' ? 'RE-ENTRY' : 'CHECK IN', icon: Clock, color: 'emerald', active: attendanceState === 'not_checked_in' || attendanceState === 'checked_out' },
                      { id: 'break_start', label: 'START BREAK', icon: Coffee, color: 'amber', active: attendanceState === 'checked_in' },
                      { id: 'break_end', label: 'END BREAK', icon: CheckCircle2, color: 'blue', active: attendanceState === 'on_break' },
                      { id: 'check_out', label: 'CHECK OUT', icon: LogOut, color: 'red', active: attendanceState === 'checked_in' || attendanceState === 'on_break' },
                    ].map((action) => (
                      <motion.button
                        key={action.id}
                        whileHover={action.active && !isPerformingAction ? { x: 10 } : {}}
                        whileTap={action.active && !isPerformingAction ? { scale: 0.98 } : {}}
                        onClick={() => handleAction(action.id as any, !capturedImage)}
                        disabled={isPerformingAction || !action.active}
                        className={`relative flex items-center justify-between p-8 rounded-[2.5rem] border-2 transition-all duration-500 group overflow-hidden ${
                          action.active && !isPerformingAction
                            ? `border-${action.color}-500/30 bg-${action.color}-500/5 text-${action.color}-400`
                            : 'border-white/5 bg-white/5 text-slate-700 cursor-not-allowed'
                        }`}
                      >
                        <div className="flex items-center gap-6 relative z-10">
                          <div className={`p-4 rounded-2xl transition-all duration-500 ${
                            action.active && !isPerformingAction ? `bg-${action.color}-500 text-black shadow-[0_0_20px_rgba(0,0,0,0.2)]` : 'bg-white/5'
                          }`}>
                            {isPerformingAction ? <RefreshCw className="w-6 h-6 animate-spin" /> : <action.icon className="w-6 h-6" />}
                          </div>
                          <div className="text-left">
                            <span className="block font-black uppercase tracking-[0.3em] text-sm">{action.label}</span>
                            <span className="text-[10px] opacity-50 uppercase tracking-widest mt-1">Protocol {action.id.replace('_', ' ')}</span>
                          </div>
                        </div>
                        <ChevronRight className={`w-6 h-6 transition-transform duration-500 ${action.active ? 'group-hover:translate-x-2' : 'opacity-20'}`} />
                        
                        {/* Interactive Background Glow */}
                        {action.active && (
                          <div className={`absolute -right-20 -top-20 w-40 h-40 bg-${action.color}-500/10 blur-[60px] group-hover:bg-${action.color}-500/20 transition-all duration-700`} />
                        )}
                      </motion.button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column: Activity Stream */}
              <div className="lg:col-span-4">
                <motion.div 
                  initial={{ x: 20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  className={`sticky top-8 rounded-[3rem] border ${isDark ? 'bg-black/40 border-white/10' : 'bg-white border-slate-200'} backdrop-blur-3xl overflow-hidden flex flex-col h-[calc(100vh-12rem)]`}
                >
                  <div className="p-10 border-b border-white/5 flex items-center justify-between">
                    <div>
                      <h3 className="font-black uppercase tracking-[0.3em] text-xs">Activity Stream</h3>
                      <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-1">Real-time log</p>
                    </div>
                    <div className="px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-black tracking-widest">{logs.length} EVENTS</div>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto p-10 space-y-10 custom-scrollbar">
                    {logs.length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center text-slate-700">
                        <Activity className="w-20 h-20 mb-6 opacity-5" />
                        <p className="text-[10px] font-black uppercase tracking-[0.4em]">No Stream Data</p>
                      </div>
                    ) : (
                      <div className="space-y-12 relative before:absolute before:left-6 before:top-2 before:bottom-2 before:w-px before:bg-gradient-to-b before:from-indigo-500/50 before:via-white/10 before:to-transparent">
                        {logs.map((log, index) => (
                          <motion.div 
                            key={index}
                            initial={{ x: 10, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: index * 0.1 }}
                            className="relative pl-16 group"
                          >
                            <div className={`absolute left-0 top-0 w-12 h-12 rounded-2xl flex items-center justify-center z-10 transition-all duration-500 group-hover:scale-110 ${
                              log.action.includes('In') ? 'bg-emerald-500 text-black shadow-[0_0_15px_rgba(16,185,129,0.3)]' : 
                              log.action.includes('Out') ? 'bg-red-500 text-black shadow-[0_0_15px_rgba(239,68,68,0.3)]' : 
                              'bg-amber-500 text-black shadow-[0_0_15px_rgba(245,158,11,0.3)]'
                            }`}>
                              {log.action.includes('Check') ? <Clock className="w-5 h-5" /> : <Coffee className="w-5 h-5" />}
                            </div>
                            
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <h4 className="font-black uppercase tracking-tighter text-sm group-hover:text-white transition-colors">{log.action}</h4>
                                <time className="text-[10px] font-mono text-slate-600 tracking-widest">{log.time}</time>
                              </div>
                              
                              {log.selfie && (
                                <div className="w-24 h-24 rounded-2xl overflow-hidden border border-white/10 shadow-2xl group-hover:border-white/30 transition-all">
                                  <img src={log.selfie} alt="" className="w-full h-full object-cover" />
                                </div>
                              )}
                              
                              <div className="flex items-center gap-2 text-[10px] text-slate-500 font-mono bg-white/5 p-2 rounded-lg border border-white/5">
                                <MapPin className="w-3 h-3 text-indigo-400" />
                                <span className="truncate">{log.location}</span>
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
            /* Reports View - Ultra Modern Grid Table */
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className={`rounded-[3rem] border ${isDark ? 'bg-black/40 border-white/10' : 'bg-white border-slate-200'} backdrop-blur-3xl overflow-hidden`}
            >
              <div className="p-10 border-b border-white/5 flex items-center justify-between">
                <div>
                  <h3 className="font-black uppercase tracking-[0.3em] text-xs">
                    {activeTab === 'daily' ? 'Daily Archive' : activeTab === 'weekly' ? 'Weekly Protocol' : 'Monthly Protocol'}
                  </h3>
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-1">Historical Data Logs</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-[10px] font-black uppercase tracking-widest text-slate-500">{filteredRecords.length} Records</div>
                  <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                </div>
              </div>

              {activeTab === 'daily' && (
                <div className="p-10 border-b border-white/5">
                  {empTracking && (
                    <div className={`grid grid-cols-1 md:grid-cols-4 gap-6 mb-10`}>
                      <div className={`p-6 rounded-2xl ${isDark ? 'bg-white/5 border-white/10' : 'bg-slate-100 border-slate-200'}`}>
                        <div className="text-[10px] font-black uppercase tracking-widest text-slate-500">Mouse Moves</div>
                        <div className="text-2xl font-black mt-2">{empTracking.mouseMoves}</div>
                      </div>
                      <div className={`p-6 rounded-2xl ${isDark ? 'bg-white/5 border-white/10' : 'bg-slate-100 border-slate-200'}`}>
                        <div className="text-[10px] font-black uppercase tracking-widest text-slate-500">Keyboard Clicks</div>
                        <div className="text-2xl font-black mt-2">{empTracking.keyboardClicks}</div>
                      </div>
                      <div className={`p-6 rounded-2xl ${isDark ? 'bg-white/5 border-white/10' : 'bg-slate-100 border-slate-200'}`}>
                        <div className="text-[10px] font-black uppercase tracking-widest text-slate-500">Status</div>
                        <div className="text-2xl font-black mt-2">{empTracking.status}</div>
                      </div>
                      {empTracking.screenshot && (
                        <div className={`p-6 rounded-2xl ${isDark ? 'bg-white/5 border-white/10' : 'bg-slate-100 border-slate-200'}`}>
                          <div className="text-[10px] font-black uppercase tracking-widest text-slate-500">Latest Screen</div>
                          <img src={empTracking.screenshot} alt="Screen" className="w-full h-20 object-cover mt-2 rounded-lg" />
                        </div>
                      )}
                    </div>
                  )}

                  <h3 className="font-black uppercase tracking-[0.3em] text-xs mb-6">Attendance Logs</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-white/5">
                          {['Action', 'Time', 'Location', 'Selfie'].map((h) => (
                            <th key={h} className="p-4 text-[10px] font-black uppercase tracking-[0.4em] text-slate-600">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {logs.map((log, index) => (
                          <tr key={index} className="group hover:bg-white/[0.02] transition-colors">
                            <td className="p-4 text-xs font-mono">{log.action}</td>
                            <td className="p-4 text-xs font-mono text-slate-400">{log.time}</td>
                            <td className="p-4 text-xs font-mono text-slate-400">{log.location}</td>
                            <td className="p-4">
                              {log.selfie && <img src={log.selfie} alt="Selfie" className="w-10 h-10 object-cover rounded-lg" />}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
              
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-white/5">
                      {['Date', 'Entry', 'Exit', 'Duration', 'Status'].map((h) => (
                        <th key={h} className="p-8 text-[10px] font-black uppercase tracking-[0.4em] text-slate-600">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {filteredRecords.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="p-32 text-center">
                          <Activity className="w-16 h-16 mx-auto mb-6 opacity-5" />
                          <p className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-700">No Historical Data</p>
                        </td>
                      </tr>
                    ) : (
                      filteredRecords.map((record) => (
                        <tr key={record.id} className="group hover:bg-white/[0.02] transition-colors">
                          <td className="p-8">
                            <div className="text-sm font-black tracking-tighter uppercase">{record.date}</div>
                            <div className="text-[10px] text-slate-600 uppercase tracking-widest mt-1">Logged</div>
                          </td>
                          <td className="p-8">
                            <div className="text-xs font-mono text-slate-400">{record.loginTime || '--:--'}</div>
                          </td>
                          <td className="p-8">
                            <div className="text-xs font-mono text-slate-400">{record.logoutTime || '--:--'}</div>
                          </td>
                          <td className="p-8">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-indigo-500/10 border border-indigo-500/20">
                              <span className="text-xs font-mono font-black text-indigo-400">{record.workingHours}</span>
                            </div>
                          </td>
                          <td className="p-8">
                            <span className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] border ${
                              record.status === 'Present' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                              record.status === 'Leave' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                              'bg-red-500/10 text-red-400 border-red-500/20'
                            }`}>
                              {record.status}
                            </span>
                          </td>
                        </tr>
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
