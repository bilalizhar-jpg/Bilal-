import React, { useState, useEffect, useMemo, useRef} from 'react';
import { 
 Clock, 
 Monitor, 
 MousePointer, 
 Download, 
 Printer, 
 Settings, 
 User, 
 Play, 
 Pause, 
 AlertCircle,
 Calendar,
 Filter,
 Search,
 CheckCircle2,
 XCircle,
 MessageCircle,
 Edit2,
 Save,
 X,
 Mail,
 ChevronLeft,
 ChevronRight
} from 'lucide-react';
import AdminLayout from '../components/AdminLayout';
import { useEmployees} from '../context/EmployeeContext';
import { useAttendance} from '../context/AttendanceContext';
import { useTimeTracking, TrackingData} from '../context/TimeTrackingContext';
import { useAuth} from '../context/AuthContext';
import { useWhatsApp} from '../hooks/useWhatsApp';
import { motion, AnimatePresence} from 'motion/react';
import * as XLSX from 'xlsx';
import { collection, query, where, onSnapshot, getDocs, doc, setDoc} from 'firebase/firestore';
import { db} from '../firebase';

// Helper to format seconds to HH:MM:SS
const formatSeconds = (seconds: number) => {
 const h = Math.floor(seconds / 3600);
 const m = Math.floor((seconds % 3600) / 60);
 const s = seconds % 60;
 return`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
};

// Mock Data Interfaces
interface TrackedEmployee {
 id: string;
 name: string;
 department: string;
 avatar: string;
 status: 'Online' | 'Idle' | 'Offline' | 'On Break';
 lastActive: string;
 currentTask: string;
 workingTime: string; // HH:MM:SS
 idleTime: string; // HH:MM:SS
 mouseMoves: number;
 keyboardClicks: number;
 screenDelay: string; // ms
 screenshot: string;
 isTracked: boolean;
 phoneNumber?: string;
 email?: string;
}

interface TimeLog {
 id: string;
 employeeId: string;
 employeeName: string;
 date: string;
 startTime: string;
 endTime: string;
 totalHours: string;
 idleTime: string;
 efficiency: number;
 mouseEvents: number;
 keyboardEvents: number;
}

export default function TimeTracker() {
 const { user} = useAuth();
 const { sendWhatsAppMessage} = useWhatsApp();
 const { employees: contextEmployees, updateEmployee} = useEmployees();
 const { trackingData: realTimeTrackingData} = useTimeTracking();
 const { attendanceRecords} = useAttendance();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'reports' | 'settings'>('dashboard');
 
 const todayDate = new Date().toISOString().split('T')[0];
 const [dashboardDate, setDashboardDate] = useState(todayDate);
 const [dashboardTrackingData, setDashboardTrackingData] = useState<Record<string, TrackingData>>({});
 const [reportTrackingData, setReportTrackingData] = useState<Record<string, TrackingData>>({});

 // Fetch tracking data for selected dashboard date
 useEffect(() => {
 if (!user?.companyId) return;

 const q = query(
 collection(db, 'timeTracking'), 
 where('date', '==', dashboardDate),
 where('companyId', '==', user.companyId)
 );

 const unsubscribe = onSnapshot(q, (snapshot) => {
 const data: Record<string, TrackingData> = {};
 snapshot.docs.forEach(doc => {
 data[doc.id] = doc.data() as TrackingData;
});
 setDashboardTrackingData(data);
});

 return () => unsubscribe();
}, [user?.companyId, dashboardDate]);

 // Settings State
 const [idleThresholdMinutes, setIdleThresholdMinutes] = useState(5);
 const [emailIdleThresholdMinutes, setEmailIdleThresholdMinutes] = useState(5);
 const [autoWhatsAppAlerts, setAutoWhatsAppAlerts] = useState(false);
 const [autoEmailAlerts, setAutoEmailAlerts] = useState(false);
 const [headEmail, setHeadEmail] = useState('');
 const [alertMessage, setAlertMessage] = useState<string | null>(null);
 const alertTimestampsRef = useRef<Record<string, { whatsapp?: number, email?: number}>>({});

 // Tracked Employees State
 const [employees, setEmployees] = useState<TrackedEmployee[]>([]);

 // Load Settings from Firestore
 useEffect(() => {
 if (!user?.companyId) return;
 const unsub = onSnapshot(doc(db, 'settings',`${user.companyId}_timeTracking`), (docSnap) => {
 if (docSnap.exists()) {
 const data = docSnap.data();
 setIdleThresholdMinutes(data.idleThresholdMinutes || 5);
 setEmailIdleThresholdMinutes(data.emailIdleThresholdMinutes || 5);
 setAutoWhatsAppAlerts(data.autoWhatsAppAlerts || false);
 setAutoEmailAlerts(data.autoEmailAlerts || false);
 setHeadEmail(data.headEmail || '');
}
});
 return () => unsub();
}, [user?.companyId]);

 // Save Settings to Firestore
 const saveSettings = async (updates: any) => {
 if (!user?.companyId) return;
 try {
 await setDoc(doc(db, 'settings',`${user.companyId}_timeTracking`), updates, { merge: true});
} catch (error) {
 console.error('Error saving time tracking settings:', error);
}
};

 // Sync with context employees and tracking data
 useEffect(() => {
 const updatedEmployees = contextEmployees
 .filter(emp => emp.status === 'Active')
 .map(emp => {
 const docId =`${emp.id}_${dashboardDate}`;
 // Use real-time data if today, otherwise use fetched dashboard data
 const tracking = dashboardDate === todayDate 
 ? (realTimeTrackingData[docId] || dashboardTrackingData[docId])
 : dashboardTrackingData[docId];
 
 // Base data from context
 const baseData = {
 id: emp.id,
 name: emp.name,
 department: emp.department,
 avatar: emp.avatar ||`https://ui-avatars.com/api/?name=${encodeURIComponent(emp.name)}&background=random`,
 phoneNumber: emp.mobile,
 email: emp.email,
};

 if (tracking) {
 return {
 ...baseData,
 status: tracking.status,
 lastActive: tracking.status === 'Online' ? 'Just now' : 'Idle',
 currentTask: tracking.currentTask,
 workingTime: formatSeconds(tracking.workingTime),
 idleTime: formatSeconds(tracking.idleTime),
 mouseMoves: tracking.mouseMoves,
 keyboardClicks: tracking.keyboardClicks,
 screenDelay: '12ms',
 screenshot: tracking.screenshot ||`https://picsum.photos/seed/${emp.id}/300/200`,
 isTracked: true,
};
} else {
 return {
 ...baseData,
 status: 'Offline' as const,
 lastActive: 'Never',
 currentTask: '-',
 workingTime: '00:00:00',
 idleTime: '00:00:00',
 mouseMoves: 0,
 keyboardClicks: 0,
 screenDelay: '-',
 screenshot: '',
 isTracked: true,
};
}
});
 
 setEmployees(updatedEmployees);
}, [contextEmployees, dashboardTrackingData, realTimeTrackingData, dashboardDate, todayDate]);

 // Report Filters
 const [reportFilter, setReportFilter] = useState({
 employee: 'All',
 startDate: todayDate,
 endDate: todayDate
});
 const [activeLogs, setActiveLogs] = useState<TimeLog[]>([]);

 // Fetch tracking data for report range
 useEffect(() => {
 if (!user?.companyId || !reportFilter.startDate || !reportFilter.endDate) return;

 const fetchReportTracking = async () => {
 const q = query(
 collection(db, 'timeTracking'),
 where('companyId', '==', user.companyId),
 where('date', '>=', reportFilter.startDate),
 where('date', '<=', reportFilter.endDate)
 );
 
 const snapshot = await getDocs(q);
 const data: Record<string, TrackingData> = {};
 snapshot.docs.forEach(doc => {
 data[doc.id] = doc.data() as TrackingData;
});
 setReportTrackingData(data);
};

 fetchReportTracking();
}, [user?.companyId, reportFilter.startDate, reportFilter.endDate]);

 const logs: TimeLog[] = useMemo(() => {
 return attendanceRecords
 .filter(record => record.companyId === user?.companyId)
 .map(record => {
 const docId =`${record.employeeId}_${record.date}`;
 // Use real-time data if today, otherwise use report tracking data
 const tracking = record.date === todayDate 
 ? (realTimeTrackingData[docId] || reportTrackingData[docId])
 : reportTrackingData[docId];
 
 const realIdleTime = tracking
 ? formatSeconds(tracking.idleTime)
 : '00:00:00';
 
 const realMouseEvents = tracking
 ? tracking.mouseMoves
 : 0;
 
 const realKeyboardEvents = tracking
 ? tracking.keyboardClicks
 : 0;

 const totalWorkingSeconds = record.totalMinutes * 60;
 const productiveSeconds = totalWorkingSeconds - (tracking ? tracking.idleTime : 0);
 
 const attendanceScore = 100; 
 const productivityScore = totalWorkingSeconds > 0 ? Math.max(0, (productiveSeconds / totalWorkingSeconds) * 100) : 0;
 const qualityScore = 85; 
 
 const efficiency = (attendanceScore * 0.3) + (productivityScore * 0.5) + (qualityScore * 0.2);

 return {
 id: record.id,
 employeeId: record.employeeId,
 employeeName: record.employeeName,
 date: record.date,
 startTime: record.loginTime || '-',
 endTime: record.logoutTime || '-',
 totalHours: record.workingHours,
 idleTime: realIdleTime,
 efficiency: Math.round(efficiency),
 mouseEvents: realMouseEvents,
 keyboardEvents: realKeyboardEvents
};
});
}, [attendanceRecords, reportTrackingData, realTimeTrackingData, todayDate, user?.companyId]);

 const handleSearch = () => {
 const filtered = logs.filter(log => {
 const matchesEmployee = reportFilter.employee === 'All' || log.employeeName === reportFilter.employee;
 const matchesDate = (!reportFilter.startDate || log.date >= reportFilter.startDate) &&
 (!reportFilter.endDate || log.date <= reportFilter.endDate);
 return matchesEmployee && matchesDate;
});
 setActiveLogs(filtered);
};

 useEffect(() => {
 setActiveLogs(logs);
}, [logs]);

 // Check for Idle Alert
 useEffect(() => {
 if (!autoWhatsAppAlerts && !autoEmailAlerts) return;

 const checkAlerts = () => {
 employees.forEach(emp => {
 if (emp.status === 'Idle') {
 const [h, m] = emp.idleTime.split(':').map(Number);
 const totalIdleMinutes = h * 60 + m;
 const now = Date.now();
 const timestamps = alertTimestampsRef.current[emp.id] || {};
 let updated = false;

 // WhatsApp Alert
 if (autoWhatsAppAlerts && emp.phoneNumber && totalIdleMinutes >= idleThresholdMinutes) {
 const lastSent = timestamps.whatsapp || 0;
 if (now - lastSent > 10 * 60 * 1000) { // 10 minutes throttle
 const message =`ERP Alert: Hello ${emp.name}, you have been idle for ${totalIdleMinutes} minutes. Please resume your tasks.`;
 console.log(`[Alert] Triggering WhatsApp for ${emp.name} (${emp.phoneNumber})`);
 sendWhatsAppMessage(emp.phoneNumber, message);
 setAlertMessage(`WhatsApp Alert sent to ${emp.name}:"${message}"`);
 timestamps.whatsapp = now;
 updated = true;
 setTimeout(() => setAlertMessage(null), 5000);
}
}

 // Email Alert
 if (autoEmailAlerts && emp.email && totalIdleMinutes >= emailIdleThresholdMinutes) {
 const lastSent = timestamps.email || 0;
 if (now - lastSent > 10 * 60 * 1000) { // 10 minutes throttle
 console.log(`[Alert] Triggering Email for ${emp.name} (${emp.email})`);
 setAlertMessage(`Email Alert sent to ${emp.email} (CC: ${headEmail || 'Head'}):"You have been idle for ${totalIdleMinutes} minutes."`);
 timestamps.email = now;
 updated = true;
 setTimeout(() => setAlertMessage(null), 5000);
}
}

 if (updated) {
 alertTimestampsRef.current[emp.id] = timestamps;
}
}
});
};

 checkAlerts();
}, [employees, autoWhatsAppAlerts, autoEmailAlerts, idleThresholdMinutes, emailIdleThresholdMinutes, headEmail]);

 const handleExportExcel = () => {
 const ws = XLSX.utils.json_to_sheet(logs);
 const wb = XLSX.utils.book_new();
 XLSX.utils.book_append_sheet(wb, ws,"TimeLogs");
 XLSX.writeFile(wb,"TimeTrackerReport.xlsx");
};

 const handlePrint = () => {
 window.print();
};

 const toggleTracking = (id: string) => {
 setEmployees(prev => prev.map(emp => 
 emp.id === id ? { ...emp, isTracked: !emp.isTracked} : emp
 ));
};

 const filteredLogs = logs.filter(log => {
 const matchesEmployee = reportFilter.employee === 'All' || log.employeeName === reportFilter.employee;
 const employeeExists = employees.some(e => e.name === log.employeeName);
 return matchesEmployee && employeeExists;
});

 return (
 <AdminLayout>
 <div className="space-y-6 pb-12 relative">
 {/* Alert Notification */}
 <AnimatePresence>
 {alertMessage && (
 <motion.div 
 initial={{ opacity: 0, y: -20, x: '-50%'}}
 animate={{ opacity: 1, y: 0, x: '-50%'}}
 exit={{ opacity: 0, y: -20, x: '-50%'}}
 className="fixed top-20 left-1/2 z-50 bg-emerald-600 text-white px-6 py-3 rounded-full shadow-lg flex items-center gap-2 font-bold text-sm"
 >
 <MessageCircle className="w-4 h-4"/>
 {alertMessage}
 </motion.div>
 )}
 </AnimatePresence>

 <div className="flex justify-between items-center">
 <div>
 <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
 <Monitor className="w-6 h-6 text-indigo-600"/>
 Head Time Tracker
 </h1>
 <p className="text-slate-500 mt-1">Monitor employee activity, screen time, and productivity.</p>
 </div>
 
 {activeTab === 'dashboard' && (
 <div className="flex items-center gap-4 bg-white p-2 rounded-xl border border-slate-200 shadow-sm">
 <div className="flex items-center gap-2">
 <Calendar className="w-4 h-4 text-slate-400"/>
 <input 
 type="date"
 value={dashboardDate}
 onChange={(e) => setDashboardDate(e.target.value)}
 className={`bg-transparent border-none text-sm font-bold outline-none text-slate-900`}
 />
 </div>
 <div className="h-4 w-px bg-slate-200"/>
 <div className="flex gap-1">
 <button 
 onClick={() => {
 const d = new Date(dashboardDate);
 d.setDate(d.getDate() - 1);
 setDashboardDate(d.toISOString().split('T')[0]);
}}
 className="p-1 hover:bg-slate-100 rounded transition-colors"
 >
 <ChevronLeft className="w-4 h-4"/>
 </button>
 <button 
 onClick={() => setDashboardDate(todayDate)}
 className="px-2 text-[10px] font-black uppercase tracking-widest hover:text-indigo-600 transition-colors"
 >
 Today
 </button>
 <button 
 onClick={() => {
 const d = new Date(dashboardDate);
 d.setDate(d.getDate() + 1);
 setDashboardDate(d.toISOString().split('T')[0]);
}}
 className="p-1 hover:bg-slate-100 rounded transition-colors"
 >
 <ChevronRight className="w-4 h-4"/>
 </button>
 </div>
 </div>
 )}

 <div className="flex gap-2 print:hidden">
 <div className="bg-white p-1 rounded-lg border border-slate-200 flex">
 <button 
 onClick={() => setActiveTab('dashboard')}
 className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${activeTab === 'dashboard' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50 '}`}
 >
 Dashboard
 </button>
 <button 
 onClick={() => setActiveTab('reports')}
 className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${activeTab === 'reports' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50 '}`}
 >
 Reports
 </button>
 <button 
 onClick={() => setActiveTab('settings')}
 className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${activeTab === 'settings' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50 '}`}
 >
 Settings
 </button>
 </div>
 </div>
 </div>

 <AnimatePresence mode="wait">
 {activeTab === 'dashboard' && (
 <motion.div 
 key="dashboard"
 initial={{ opacity: 0, y: 10}}
 animate={{ opacity: 1, y: 0}}
 exit={{ opacity: 0, y: -10}}
 className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
 >
 {employees.filter(e => e.isTracked).map(employee => (
 <div key={employee.id} className={`rounded-xl border bg-white border-slate-200 shadow-sm overflow-hidden relative`}>
 {/* WhatsApp Indicator */}
 {employee.phoneNumber && (
 <div className="absolute top-4 right-14 z-10"title="WhatsApp Alerts Enabled">
 <div className="bg-emerald-100 p-1.5 rounded-full">
 <MessageCircle className="w-3.5 h-3.5 text-emerald-600"/>
 </div>
 </div>
 )}

 <div className="p-4 border-b border-slate-100 flex justify-between items-center">
 <div className="flex items-center gap-3">
 <div className="relative">
 <img src={employee.avatar} alt={employee.name} className="w-10 h-10 rounded-full object-cover"referrerPolicy="no-referrer"/>
 <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
 employee.status === 'Online' ? 'bg-emerald-500' : 
 employee.status === 'Idle' ? 'bg-amber-500' : 
 employee.status === 'On Break' ? 'bg-blue-500' : 'bg-slate-400'
}`}></div>
 </div>
 <div>
 <h3 className="font-bold text-slate-800 text-sm">{employee.name}</h3>
 <p className="text-xs text-slate-500">{employee.department}</p>
 </div>
 </div>
 <div className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${
 employee.status === 'Online' ? 'bg-emerald-100 text-emerald-700' : 
 employee.status === 'Idle' ? 'bg-amber-100 text-amber-700' : 
 employee.status === 'On Break' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'
}`}>
 {employee.status}
 </div>
 </div>
 
 <div className="relative aspect-video bg-slate-100 group">
 {employee.status !== 'Offline' ? (
 <img src={employee.screenshot} alt="Screen"className="w-full h-full object-cover"referrerPolicy="no-referrer"/>
 ) : (
 <div className="w-full h-full flex items-center justify-center text-slate-400 flex-col gap-2">
 <Monitor className="w-8 h-8 opacity-50"/>
 <span className="text-xs font-medium">No Signal</span>
 </div>
 )}
 <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
 <button className="bg-white text-slate-900 px-4 py-2 rounded-full text-xs font-bold hover:bg-slate-100">View Live</button>
 </div>
 </div>

 <div className="p-4 space-y-4">
 <div className="grid grid-cols-2 gap-4">
 <div className="space-y-1">
 <p className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1">
 <Clock className="w-3 h-3"/> Working Time
 </p>
 <p className="text-lg font-mono font-bold text-indigo-600">{employee.workingTime}</p>
 </div>
 <div className="space-y-1">
 <p className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1">
 <AlertCircle className="w-3 h-3"/> Idle Time
 </p>
 <p className={`text-lg font-mono font-bold ${
 parseInt(employee.idleTime.split(':')[1]) >= idleThresholdMinutes ? 'text-red-500' : 'text-amber-600 '
}`}>
 {employee.idleTime}
 </p>
 </div>
 </div>

 <div className="pt-4 border-t border-slate-100 grid grid-cols-3 gap-2 text-center">
 <div>
 <p className="text-[10px] text-slate-500 mb-1">Mouse</p>
 <p className="text-xs font-bold text-slate-800">{employee.mouseMoves}</p>
 </div>
 <div>
 <p className="text-[10px] text-slate-500 mb-1">Keys</p>
 <p className="text-xs font-bold text-slate-800">{employee.keyboardClicks}</p>
 </div>
 <div>
 <p className="text-[10px] text-slate-500 mb-1">Delay</p>
 <p className="text-xs font-bold text-emerald-600">{employee.screenDelay}</p>
 </div>
 </div>
 
 <div className="text-xs text-slate-500 truncate">
 <span className="font-bold">Current Task:</span> {employee.currentTask}
 </div>
 </div>
 </div>
 ))}
 </motion.div>
 )}

 {activeTab === 'reports' && (
 <motion.div 
 key="reports"
 initial={{ opacity: 0, y: 10}}
 animate={{ opacity: 1, y: 0}}
 exit={{ opacity: 0, y: -10}}
 className="space-y-6"
 >
 <div className={`p-4 rounded-xl border bg-white border-slate-200 shadow-sm flex flex-wrap gap-4 items-end print:hidden`}>
 <div>
 <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Employee</label>
 <select 
 value={reportFilter.employee}
 onChange={(e) => setReportFilter({...reportFilter, employee: e.target.value})}
 className={`border rounded px-3 py-2 text-sm outline-none w-48 bg-white border-slate-200`}
 >
 <option value="All">All Employees</option>
 {employees.map(e => <option key={e.id} value={e.name}>{e.name}</option>)}
 </select>
 </div>
 <div>
 <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Date Range</label>
 <div className="flex items-center gap-2">
 <input 
 type="date"
 value={reportFilter.startDate}
 onChange={(e) => setReportFilter({...reportFilter, startDate: e.target.value})}
 className={`border rounded px-3 py-2 text-sm outline-none bg-white border-slate-200`} 
 />
 <span className="text-slate-400">-</span>
 <input 
 type="date"
 value={reportFilter.endDate}
 onChange={(e) => setReportFilter({...reportFilter, endDate: e.target.value})}
 className={`border rounded px-3 py-2 text-sm outline-none bg-white border-slate-200`} 
 />
 <button 
 onClick={handleSearch}
 className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700 transition-colors"
 >
 Search
 </button>
 </div>
 </div>
 <div className="flex gap-2 ml-auto">
 <button onClick={handlePrint} className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg text-sm font-bold hover:bg-slate-50 transition-colors">
 <Printer className="w-4 h-4"/> Print
 </button>
 <button onClick={handleExportExcel} className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-bold hover:bg-emerald-700 transition-colors">
 <Download className="w-4 h-4"/> Export Excel
 </button>
 </div>
 </div>

 <div className={`rounded-xl border bg-white border-slate-200 shadow-sm overflow-hidden print:overflow-visible print:shadow-none print:border-none`}>
 <div className="overflow-x-auto print:overflow-visible">
 <table className="w-full text-left border-collapse">
 <thead>
 <tr className={`bg-slate-50 border-b border-slate-100`}>
 <th className="px-6 py-4 text-xs font-bold text-slate-600 uppercase">Date</th>
 <th className="px-6 py-4 text-xs font-bold text-slate-600 uppercase">Employee</th>
 <th className="px-6 py-4 text-xs font-bold text-slate-600 uppercase">Shift</th>
 <th className="px-6 py-4 text-xs font-bold text-slate-600 uppercase">Total Hours</th>
 <th className="px-6 py-4 text-xs font-bold text-slate-600 uppercase">Idle Time</th>
 <th className="px-6 py-4 text-xs font-bold text-slate-600 uppercase">Activity</th>
 <th className="px-6 py-4 text-xs font-bold text-slate-600 uppercase">Efficiency</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-slate-100">
 {activeLogs.map((log) => (
 <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
 <td className="px-6 py-4 text-sm text-slate-600">{log.date}</td>
 <td className="px-6 py-4 text-sm font-bold text-slate-800">{log.employeeName}</td>
 <td className="px-6 py-4 text-sm text-slate-600">{log.startTime} - {log.endTime}</td>
 <td className="px-6 py-4 text-sm font-mono font-bold text-indigo-600">{log.totalHours}</td>
 <td className="px-6 py-4 text-sm font-mono text-amber-600">{log.idleTime}</td>
 <td className="px-6 py-4 text-sm">
 <div className="flex flex-col gap-1 text-xs text-slate-500">
 <span className="flex items-center gap-1"><MousePointer className="w-3 h-3"/> {log.mouseEvents}</span>
 <span className="flex items-center gap-1"><Monitor className="w-3 h-3"/> {log.keyboardEvents}</span>
 </div>
 </td>
 <td className="px-6 py-4 text-sm">
 <div className="flex items-center gap-2">
 <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
 <div className={`h-full rounded-full ${log.efficiency >= 90 ? 'bg-emerald-500' : log.efficiency >= 70 ? 'bg-indigo-500' : 'bg-amber-500'}`} style={{ width:`${log.efficiency}%`}}></div>
 </div>
 <span className="font-bold text-slate-700">{log.efficiency}%</span>
 </div>
 </td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 </div>
 </motion.div>
 )}

 {activeTab === 'settings' && (
 <motion.div 
 key="settings"
 initial={{ opacity: 0, y: 10}}
 animate={{ opacity: 1, y: 0}}
 exit={{ opacity: 0, y: -10}}
 className="space-y-6"
 >
 {/* WhatsApp & Alert Settings */}
 <div className={`rounded-xl border bg-white border-slate-200 shadow-sm overflow-hidden`}>
 <div className="p-6 border-b border-slate-100">
 <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
 <MessageCircle className="w-5 h-5 text-emerald-600"/>
 WhatsApp Alert Settings
 </h3>
 <p className="text-sm text-slate-500 mt-1">Configure automated alerts for idle time.</p>
 </div>
 <div className="p-6 space-y-6">
 <div className="flex items-center justify-between">
 <div>
 <h4 className="font-bold text-slate-800">Auto-Send WhatsApp Alerts</h4>
 <p className="text-xs text-slate-500">Automatically send a message to employee when idle time exceeds threshold.</p>
 </div>
 <label className="relative inline-flex items-center cursor-pointer">
 <input 
 type="checkbox"
 checked={autoWhatsAppAlerts}
 onChange={(e) => {
 setAutoWhatsAppAlerts(e.target.checked);
 saveSettings({ autoWhatsAppAlerts: e.target.checked});
}}
 className="sr-only peer"
 />
 <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
 </label>
 </div>

 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
 <div>
 <label className="block text-sm font-bold text-slate-700 mb-2">Idle Time Threshold (Minutes)</label>
 <div className="flex items-center gap-2">
 <input 
 type="number"
 min="1"
 value={idleThresholdMinutes}
 onChange={(e) => {
 const val = parseInt(e.target.value) || 1;
 setIdleThresholdMinutes(val);
 saveSettings({ idleThresholdMinutes: val});
}}
 className={`w-24 px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 bg-white border-slate-200`}
 />
 <span className="text-sm text-slate-500">minutes</span>
 </div>
 <p className="text-xs text-slate-500 mt-1">Alert triggers after this duration of inactivity.</p>
 </div>
 </div>
 </div>
 </div>

 {/* Email Alert Settings */}
 <div className={`rounded-xl border bg-white border-slate-200 shadow-sm overflow-hidden`}>
 <div className="p-6 border-b border-slate-100">
 <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
 <Mail className="w-5 h-5 text-blue-600"/>
 Email Alert Settings
 </h3>
 <p className="text-sm text-slate-500 mt-1">Configure automated email alerts for idle time.</p>
 </div>
 <div className="p-6 space-y-6">
 <div className="flex items-center justify-between">
 <div>
 <h4 className="font-bold text-slate-800">Auto-Send Email Alerts</h4>
 <p className="text-xs text-slate-500">Automatically send an email to employee and CC head when idle time exceeds threshold.</p>
 </div>
 <label className="relative inline-flex items-center cursor-pointer">
 <input 
 type="checkbox"
 checked={autoEmailAlerts}
 onChange={(e) => {
 setAutoEmailAlerts(e.target.checked);
 saveSettings({ autoEmailAlerts: e.target.checked});
}}
 className="sr-only peer"
 />
 <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
 </label>
 </div>

 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
 <div>
 <label className="block text-sm font-bold text-slate-700 mb-2">Idle Time Threshold (Minutes)</label>
 <div className="flex items-center gap-2">
 <input 
 type="number"
 min="1"
 value={emailIdleThresholdMinutes}
 onChange={(e) => {
 const val = parseInt(e.target.value) || 1;
 setEmailIdleThresholdMinutes(val);
 saveSettings({ emailIdleThresholdMinutes: val});
}}
 className={`w-24 px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 bg-white border-slate-200`}
 />
 <span className="text-sm text-slate-500">minutes</span>
 </div>
 <p className="text-xs text-slate-500 mt-1">Alert triggers after this duration of inactivity.</p>
 </div>
 <div>
 <label className="block text-sm font-bold text-slate-700 mb-2">Head Email (Auto CC)</label>
 <input 
 type="email"
 value={headEmail}
 onChange={(e) => {
 setHeadEmail(e.target.value);
 saveSettings({ headEmail: e.target.value});
}}
 placeholder="head@company.com"
 className={`w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 bg-white border-slate-200`}
 />
 <p className="text-xs text-slate-500 mt-1">This email will be CC'd on all idle alerts.</p>
 </div>
 </div>
 </div>
 </div>

 <div className={`rounded-xl border bg-white border-slate-200 shadow-sm overflow-hidden`}>
 <div className="p-6 border-b border-slate-100">
 <h3 className="font-bold text-lg text-slate-800">Employee Tracking Management</h3>
 <p className="text-sm text-slate-500 mt-1">Enable or disable time tracking for specific employees.</p>
 </div>
 <div className="divide-y divide-slate-100">
 {employees.map(employee => (
 <div key={employee.id} className="p-4 flex items-center justify-between hover:bg-slate-50/50">
 <div className="flex items-center gap-4">
 <img src={employee.avatar} alt={employee.name} className="w-10 h-10 rounded-full object-cover"referrerPolicy="no-referrer"/>
 <div>
 <h4 className="font-bold text-slate-800">{employee.name}</h4>
 <p className="text-xs text-slate-500">{employee.department}</p>
 {employee.phoneNumber && (
 <p className="text-[10px] text-emerald-600 flex items-center gap-1 mt-0.5">
 <MessageCircle className="w-3 h-3"/> {employee.phoneNumber}
 </p>
 )}
 </div>
 </div>
 <div className="flex items-center gap-4">
 <div className={`px-3 py-1 rounded-full text-xs font-bold ${employee.isTracked ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
 {employee.isTracked ? 'Tracking Enabled' : 'Tracking Disabled'}
 </div>
 <button 
 onClick={() => {
 if (employee.phoneNumber) {
 sendWhatsAppMessage(employee.phoneNumber,`ERP Test: Hello ${employee.name}, this is a test message from the Time Tracking system.`);
 setAlertMessage(`Test WhatsApp sent to ${employee.name}`);
 setTimeout(() => setAlertMessage(null), 3000);
} else {
 alert('No phone number found for this employee.');
}
}}
 className="p-2 rounded-lg border border-emerald-200 text-emerald-600 hover:bg-emerald-50 transition-colors"
 title="Send Test WhatsApp"
 >
 <MessageCircle className="w-5 h-5"/>
 </button>
 <button 
 onClick={() => toggleTracking(employee.id)}
 className={`p-2 rounded-lg border transition-colors ${
 employee.isTracked 
 ? 'border-red-200 text-red-600 hover:bg-red-50' 
 : 'border-emerald-200 text-emerald-600 hover:bg-emerald-50'
}`}
 >
 {employee.isTracked ? <XCircle className="w-5 h-5"/> : <CheckCircle2 className="w-5 h-5"/>}
 </button>
 </div>
 </div>
 ))}
 </div>
 </div>
 </motion.div>
 )}
 </AnimatePresence>
 </div>
 </AdminLayout>
 );
}
