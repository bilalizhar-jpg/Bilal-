import React, { useState, useRef, useEffect, useMemo } from 'react';
import EmployeeLayout from '../../components/EmployeeLayout';
import { Camera, MapPin, Clock, Coffee, LogOut, CheckCircle2, AlertCircle, Monitor, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { useAttendance } from '../../context/AttendanceContext';
import { useTimeTracking } from '../../context/TimeTrackingContext';

type TabType = 'mark' | 'daily' | 'weekly' | 'monthly';

export default function EmployeeAttendance() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const { addLog, getEmployeeTodayRecord, attendanceRecords } = useAttendance();
  const { startTracking, stopTracking, updateTracking, trackingData } = useTimeTracking();
  const isDark = theme === 'dark';
  
  const [activeTab, setActiveTab] = useState<TabType>('mark');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [location, setLocation] = useState<{lat: number, lng: number} | null>(null);
  const [locationError, setLocationError] = useState('');
  const [isCameraActive, setIsCameraActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  
  const todayDate = new Date().toISOString().split('T')[0];
  const todayRecord = user ? getEmployeeTodayRecord(user.employeeId || user.id, todayDate) : undefined;
  
  const attendanceState = todayRecord?.currentState || 'not_checked_in';
  const logs = todayRecord?.logs || [];

  const empTracking = user ? trackingData[user.employeeId || user.id] : null;

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
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          setLocationError('');
        },
        (error) => {
          console.error("Geolocation error:", error);
          setLocationError('Unable to retrieve your location. Please check browser permissions.');
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    } else {
      setLocationError('Geolocation is not supported by your browser.');
    }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
      setIsCameraActive(true);
      
      // Wait for React to render the video element
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      }, 100);
    } catch (err) {
      console.error("Error accessing camera:", err);
      alert("Could not access camera. Please ensure permissions are granted in your browser settings.");
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      const tracks = stream.getTracks();
      tracks.forEach(track => track.stop());
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

  const handleAction = (action: 'check_in' | 'break_start' | 'break_end' | 'check_out') => {
    if (!user) return;
    
    if (!location) {
      alert("Location is required. Please click 'Get Location' and allow access in your browser.");
      getLocation();
      return;
    }
    
    if (action === 'check_in' && !capturedImage) {
      alert("Selfie verification is required. Please capture a photo first.");
      return;
    }

    const empId = user.employeeId || user.id;
    const timeStr = currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const locStr = `${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}`;
    
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

    addLog(user.companyId || '', empId, user.name, actionStr, locStr, timeStr, todayDate, newState);
  };

  return (
    <EmployeeLayout>
      <div className="space-y-6 max-w-5xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Daily Attendance</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Manage your attendance and view reports.</p>
          </div>
          
          <div className={`flex p-1 rounded-lg border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} shadow-sm`}>
            {[
              { id: 'mark', label: 'Mark Attendance', icon: Clock },
              { id: 'daily', label: 'Daily Report', icon: Calendar },
              { id: 'weekly', label: 'Weekly', icon: Calendar },
              { id: 'monthly', label: 'Monthly', icon: Calendar },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                  activeTab === tab.id
                    ? (isDark ? 'bg-emerald-900/40 text-emerald-400' : 'bg-emerald-50 text-emerald-700 shadow-sm')
                    : (isDark ? 'text-slate-400 hover:text-slate-200' : 'text-slate-500 hover:text-slate-800')
                }`}
              >
                <tab.icon className="w-3.5 h-3.5" />
                <span className={activeTab === tab.id ? '' : 'hidden sm:inline'}>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {activeTab === 'mark' ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Action Area */}
            <div className={`lg:col-span-2 rounded-xl border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} shadow-sm overflow-hidden`}>
              <div className="p-6 border-b border-slate-100 dark:border-slate-800 text-center">
                <h2 className="text-4xl font-bold text-slate-800 dark:text-white font-mono tracking-tight">
                  {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </h2>
                <p className="text-slate-500 dark:text-slate-400 mt-2">
                  {currentTime.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
              </div>

              <div className="p-6 space-y-6">
                {/* Auto Monitoring System */}
                {attendanceState === 'checked_in' && empTracking && (
                  <div className={`p-4 rounded-xl border-2 border-indigo-100 bg-indigo-50/50 dark:border-indigo-900/30 dark:bg-indigo-900/10 mb-6`}>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <Monitor className="w-5 h-5 text-indigo-600" />
                        <h3 className="font-bold text-slate-800 dark:text-white">Auto Monitoring System</h3>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full animate-pulse ${empTracking.status === 'Online' ? 'bg-emerald-500' : 'bg-amber-500'}`}></div>
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-500">{empTracking.status}</span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      <div className="bg-white dark:bg-slate-800 p-3 rounded-lg shadow-sm border border-slate-100 dark:border-slate-700">
                        <p className="text-[10px] font-bold text-slate-500 uppercase mb-1">Working Time</p>
                        <p className="text-lg font-mono font-bold text-indigo-600">
                          {Math.floor(empTracking.workingTime / 3600).toString().padStart(2, '0')}:
                          {Math.floor((empTracking.workingTime % 3600) / 60).toString().padStart(2, '0')}:
                          {(empTracking.workingTime % 60).toString().padStart(2, '0')}
                        </p>
                      </div>
                      <div className="bg-white dark:bg-slate-800 p-3 rounded-lg shadow-sm border border-slate-100 dark:border-slate-700">
                        <p className="text-[10px] font-bold text-slate-500 uppercase mb-1">Idle Time</p>
                        <p className="text-lg font-mono font-bold text-amber-600">
                          {Math.floor(empTracking.idleTime / 3600).toString().padStart(2, '0')}:
                          {Math.floor((empTracking.idleTime % 3600) / 60).toString().padStart(2, '0')}:
                          {(empTracking.idleTime % 60).toString().padStart(2, '0')}
                        </p>
                      </div>
                      <div className="bg-white dark:bg-slate-800 p-3 rounded-lg shadow-sm border border-slate-100 dark:border-slate-700">
                        <p className="text-[10px] font-bold text-slate-500 uppercase mb-1">Mouse Moves</p>
                        <p className="text-lg font-mono font-bold text-slate-800 dark:text-white">{empTracking.mouseMoves}</p>
                      </div>
                      <div className="bg-white dark:bg-slate-800 p-3 rounded-lg shadow-sm border border-slate-100 dark:border-slate-700">
                        <p className="text-[10px] font-bold text-slate-500 uppercase mb-1">Keyboard Clicks</p>
                        <p className="text-lg font-mono font-bold text-slate-800 dark:text-white">{empTracking.keyboardClicks}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Verification Steps */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Location */}
                  <div className={`p-4 rounded-lg border ${location ? 'border-emerald-200 bg-emerald-50 dark:border-emerald-900/50 dark:bg-emerald-900/20' : 'border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800/50'}`}>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <MapPin className={`w-5 h-5 ${location ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`} />
                        <h3 className="font-semibold text-slate-800 dark:text-white">Location</h3>
                      </div>
                      {location && <CheckCircle2 className="w-5 h-5 text-emerald-500" />}
                    </div>
                    
                    <div className="mt-3">
                      {location ? (
                        <p className="text-sm text-emerald-700 dark:text-emerald-400 font-mono">
                          {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
                        </p>
                      ) : (
                        <>
                          <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">Location access is required.</p>
                          <button 
                            onClick={getLocation}
                            className="text-sm bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 px-3 py-1.5 rounded hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors"
                          >
                            Get Location
                          </button>
                          {locationError && <p className="text-xs text-red-500 mt-2 flex items-center gap-1"><AlertCircle className="w-3 h-3"/> {locationError}</p>}
                        </>
                      )}
                    </div>
                  </div>

                  {/* Selfie */}
                  <div className={`p-4 rounded-lg border ${capturedImage ? 'border-emerald-200 bg-emerald-50 dark:border-emerald-900/50 dark:bg-emerald-900/20' : 'border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800/50'}`}>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <Camera className={`w-5 h-5 ${capturedImage ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`} />
                        <h3 className="font-semibold text-slate-800 dark:text-white">Selfie</h3>
                      </div>
                      {capturedImage && <CheckCircle2 className="w-5 h-5 text-emerald-500" />}
                    </div>
                    
                    <div className="mt-3">
                      {capturedImage ? (
                        <div className="relative w-24 h-24 rounded-lg overflow-hidden border-2 border-emerald-500">
                          <img src={capturedImage} alt="Selfie" className="w-full h-full object-cover" />
                          <button 
                            onClick={() => { setCapturedImage(null); startCamera(); }}
                            className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-[10px] py-1 text-center hover:bg-black/70"
                          >
                            Retake
                          </button>
                        </div>
                      ) : isCameraActive ? (
                        <div className="space-y-2">
                          <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-black">
                            <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                          </div>
                          <div className="flex gap-2">
                            <button 
                              onClick={capturePhoto}
                              className="flex-1 text-sm bg-emerald-600 text-white px-3 py-1.5 rounded hover:bg-emerald-700 transition-colors"
                            >
                              Capture
                            </button>
                            <button 
                              onClick={stopCamera}
                              className="flex-1 text-sm bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300 px-3 py-1.5 rounded hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">Selfie verification required.</p>
                          <button 
                            onClick={startCamera}
                            className="text-sm bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 px-3 py-1.5 rounded hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors"
                          >
                            Open Camera
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="pt-6 border-t border-slate-100 dark:border-slate-800">
                  {!location && (
                    <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-center gap-2 text-amber-700 text-sm dark:bg-amber-900/20 dark:border-amber-800 dark:text-amber-400">
                      <AlertCircle className="w-4 h-4" />
                      <span>Please click "Get Location" above to enable attendance buttons.</span>
                    </div>
                  )}
                  {!capturedImage && attendanceState === 'not_checked_in' && (
                    <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center gap-2 text-blue-700 text-sm dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-400">
                      <Camera className="w-4 h-4" />
                      <span>Please capture a selfie to enable Check In.</span>
                    </div>
                  )}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <button
                      onClick={() => handleAction('check_in')}
                      disabled={attendanceState !== 'not_checked_in' && attendanceState !== 'checked_out'}
                      className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${
                        attendanceState === 'not_checked_in' || attendanceState === 'checked_out'
                          ? 'border-emerald-500 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:hover:bg-emerald-900/40'
                          : 'border-slate-200 bg-slate-50 text-slate-400 cursor-not-allowed dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-500'
                      }`}
                    >
                      <Clock className="w-8 h-8 mb-2" />
                      <span className="font-bold text-sm">{attendanceState === 'checked_out' ? 'Re-Check In' : 'Check In'}</span>
                    </button>

                    <button
                      onClick={() => handleAction('break_start')}
                      disabled={attendanceState !== 'checked_in'}
                      className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${
                        attendanceState === 'checked_in'
                          ? 'border-amber-500 bg-amber-50 text-amber-700 hover:bg-amber-100 dark:bg-amber-900/20 dark:text-amber-400 dark:hover:bg-amber-900/40'
                          : 'border-slate-200 bg-slate-50 text-slate-400 cursor-not-allowed dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-500'
                      }`}
                    >
                      <Coffee className="w-8 h-8 mb-2" />
                      <span className="font-bold text-sm">Start Break</span>
                    </button>

                    <button
                      onClick={() => handleAction('break_end')}
                      disabled={attendanceState !== 'on_break'}
                      className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${
                        attendanceState === 'on_break'
                          ? 'border-blue-500 bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/40'
                          : 'border-slate-200 bg-slate-50 text-slate-400 cursor-not-allowed dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-500'
                      }`}
                    >
                      <CheckCircle2 className="w-8 h-8 mb-2" />
                      <span className="font-bold text-sm">End Break</span>
                    </button>

                    <button
                      onClick={() => handleAction('check_out')}
                      disabled={attendanceState === 'not_checked_in' || attendanceState === 'checked_out'}
                      className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${
                        attendanceState === 'checked_in' || attendanceState === 'on_break'
                          ? 'border-red-500 bg-red-50 text-red-700 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/40'
                          : 'border-slate-200 bg-slate-50 text-slate-400 cursor-not-allowed dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-500'
                      }`}
                    >
                      <LogOut className="w-8 h-8 mb-2" />
                      <span className="font-bold text-sm">Check Out</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Activity Log */}
            <div className={`rounded-xl border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} shadow-sm flex flex-col h-[calc(100vh-12rem)]`}>
              <div className="p-4 border-b border-slate-100 dark:border-slate-800">
                <h3 className="font-bold text-slate-800 dark:text-white">Today's Activity</h3>
              </div>
              <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                {logs.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-slate-400 dark:text-slate-500">
                    <Clock className="w-12 h-12 mb-2 opacity-20" />
                    <p className="text-sm">No activity recorded yet.</p>
                  </div>
                ) : (
                  <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-300 before:to-transparent dark:before:via-slate-700">
                    {logs.map((log, index) => (
                      <div key={index} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                        <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white dark:border-slate-900 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                          {log.action.includes('Check') ? <Clock className="w-4 h-4" /> : <Coffee className="w-4 h-4" />}
                        </div>
                        <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="font-bold text-slate-800 dark:text-white text-sm">{log.action}</h4>
                            <time className="text-xs font-medium text-indigo-500">{log.time}</time>
                          </div>
                          <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-2">
                            <MapPin className="w-3 h-3" />
                            <span className="truncate">{log.location}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className={`rounded-xl border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} shadow-sm overflow-hidden`}>
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
              <h3 className="font-bold text-slate-800 dark:text-white uppercase text-xs tracking-wider">
                {activeTab === 'daily' ? 'Daily Report' : activeTab === 'weekly' ? 'Weekly Report' : 'Monthly Report'}
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className={`border-b ${isDark ? 'border-slate-800 bg-slate-800/50' : 'border-slate-100 bg-slate-50'}`}>
                    <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Date</th>
                    <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Login</th>
                    <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Logout</th>
                    <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Working Hours</th>
                    <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredRecords.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-slate-500 dark:text-slate-400">
                        No records found for this period.
                      </td>
                    </tr>
                  ) : (
                    filteredRecords.map((record) => (
                      <tr key={record.id} className={`hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors`}>
                        <td className="p-4 text-sm font-medium text-slate-700 dark:text-slate-300">{record.date}</td>
                        <td className="p-4 text-sm text-slate-600 dark:text-slate-400">{record.loginTime || '-'}</td>
                        <td className="p-4 text-sm text-slate-600 dark:text-slate-400">{record.logoutTime || '-'}</td>
                        <td className="p-4 text-sm font-mono text-indigo-600 dark:text-indigo-400">{record.workingHours}</td>
                        <td className="p-4">
                          <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                            record.status === 'Present' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                            record.status === 'Leave' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                            'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
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
          </div>
        )}
      </div>
    </EmployeeLayout>
  );
}
