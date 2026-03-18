import React, { useState} from 'react';
import { motion, AnimatePresence} from 'motion/react';
import { 
 Search,
 Plus, 
 Download, 
 ChevronDown, 
 X, 
 CheckCircle2, 
 Trash2,
 Calendar,
 FileText,
 RefreshCw,
 Settings,
 MapPin
} from 'lucide-react';
import { Link} from 'react-router-dom';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

import { 
 BarChart, 
 Bar, 
 XAxis, 
 YAxis, 
 CartesianGrid, 
 Tooltip, 
 ResponsiveContainer,
 LineChart,
 Line,
 Legend
} from 'recharts';

import AdminLayout from '../components/AdminLayout';
import { useAttendance} from '../context/AttendanceContext';
import { useEmployees} from '../context/EmployeeContext';
import { useTimeTracking} from '../context/TimeTrackingContext';

type TabType = 'form' | 'daily-status' | 'monthly' | 'working-hours' | 'missing';

// Helper to format seconds to HH:MM
const formatSecondsToHM = (seconds: number) => {
 const h = Math.floor(seconds / 3600);
 const m = Math.floor((seconds % 3600) / 60);
 return`${String(h).padStart(2, '0')}h ${String(m).padStart(2, '0')}m`;
};

const workingHoursChartData = [
 { day: 'Mon', hours: 8.5},
 { day: 'Tue', hours: 9.0},
 { day: 'Wed', hours: 8.0},
 { day: 'Thu', hours: 9.5},
 { day: 'Fri', hours: 8.8},
 { day: 'Sat', hours: 4.0},
 { day: 'Sun', hours: 0},
];

export default function Attendance() {
 const { attendanceRecords} = useAttendance();
 const { employees} = useEmployees();
 const { trackingData} = useTimeTracking();
 const [activeTab, setActiveTab] = useState<TabType>('form');
 const [selectedEmployee, setSelectedEmployee] = useState('');
 const [attendanceTime, setAttendanceTime] = useState('');
 const [searchTerm, setSearchTerm] = useState('');
 const [reportType, setReportType] = useState<'daily' | 'weekly' | 'monthly'>('daily');
 const [isCustomFieldModalOpen, setIsCustomFieldModalOpen] = useState(false);
 const [customFields, setCustomFields] = useState<{name: string, type: string}[]>([]);
 const [newFieldName, setNewFieldName] = useState('');
 const [startDate, setStartDate] = useState('');
 const [endDate, setEndDate] = useState('');
 const [isDownloading, setIsDownloading] = useState(false);
 const fileInputRef = React.useRef<HTMLInputElement>(null);

 const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
 const [selectedRecordForLogs, setSelectedRecordForLogs] = useState<any>(null);

 const dailyAttendanceData = attendanceRecords
 .filter(record => {
 const matchesDate = record.date === selectedDate;
 const employeeExists = employees.some(e => (e.employeeId === record.employeeId || e.id === record.employeeId) && e.status === 'Active');
 return matchesDate && employeeExists;
})
 .map(record => {
 const tracking = trackingData[record.employeeId];
 const realWorkingHours = tracking && record.date === new Date().toISOString().split('T')[0] 
 ? formatSecondsToHM(tracking.workingTime) 
 : (record.workingHours || '-');

 return {
 id: record.id,
 employeeName: record.employeeName,
 loginTime: record.loginTime || '-',
 logoutTime: record.logoutTime || '-',
 workingHours: realWorkingHours,
 date: record.date,
 logs: record.logs || []
};
});

 const handleDownload = (format: 'Excel' | 'PDF', period?: string) => {
 setIsDownloading(true);
 
 setTimeout(() => {
 try {
 let dataToExport: any[] = [];
 let filename = 'attendance_report';
 let columns: string[] = [];
 
 if (activeTab === 'daily-status') {
 dataToExport = dailyAttendanceData.filter(r => r.employeeName.toLowerCase().includes(searchTerm.toLowerCase())).map((r, i) => ({
 'Sl': i + 1,
 'Employee Name': r.employeeName,
 'Login Time': r.loginTime,
 'Logout Time': r.logoutTime,
 'Working Hours': r.workingHours,
 'Date': r.date
}));
 filename =`daily_attendance_${period || 'report'}`;
 columns = ['Sl', 'Employee Name', 'Login Time', 'Logout Time', 'Working Hours', 'Date'];
} else if (activeTab === 'monthly') {
 dataToExport = employees.map((emp, i) => ({
 'Employee': emp.name,
 'Total Days': 28,
 'Present': 22,
 'Absent': 2,
 'Leave': 4,
 'Total Hours': '198h'
}));
 filename = 'monthly_attendance';
 columns = ['Employee', 'Total Days', 'Present', 'Absent', 'Leave', 'Total Hours'];
} else if (activeTab === 'working-hours') {
 dataToExport = workingHoursChartData.map(d => ({
 'Day': d.day,
 'Hours': d.hours
}));
 filename = 'working_hours_report';
 columns = ['Day', 'Hours'];
}

 if (format === 'Excel') {
 const ws = XLSX.utils.json_to_sheet(dataToExport);
 const wb = XLSX.utils.book_new();
 XLSX.utils.book_append_sheet(wb, ws,"Report");
 XLSX.writeFile(wb,`${filename}.xlsx`);
} else if (format === 'PDF') {
 const doc = new jsPDF();
 doc.text(`Attendance Report - ${activeTab}`, 14, 15);
 
 const tableData = dataToExport.map(row => columns.map(col => row[col]));
 
 autoTable(doc, {
 head: [columns],
 body: tableData,
 startY: 20,
});
 
 doc.save(`${filename}.pdf`);
}
} catch (error) {
 console.error('Download error:', error);
 alert('Failed to generate report');
} finally {
 setIsDownloading(false);
}
}, 500);
};

 const handleBulkInsertClick = () => {
 fileInputRef.current?.click();
};

 const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
 const file = e.target.files?.[0];
 if (file) {
 alert(`File"${file.name}"uploaded successfully for bulk insert.`);
 if (fileInputRef.current) {
 fileInputRef.current.value = '';
}
}
};

 const handleAddCustomField = (e: React.FormEvent) => {
 e.preventDefault();
 if (newFieldName.trim()) {
 setCustomFields([...customFields, { name: newFieldName, type: 'text'}]);
 setNewFieldName('');
}
};

 return (
 <AdminLayout>
 <div className="space-y-6">
 {/* Tabs */}
 <div className="flex flex-wrap items-center gap-2 mb-6">
 <button 
 onClick={() => setActiveTab('form')}
 className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
 activeTab === 'form' ? 'bg-[#28A745] text-white' : 'bg-[#E9ECEF] text-slate-600 hover:bg-slate-200'
}`}
 >
 Attendance form
 </button>
 <button 
 onClick={() => setActiveTab('daily-status')}
 className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
 activeTab === 'daily-status' ? 'bg-[#28A745] text-white' : 'bg-[#E9ECEF] text-slate-600 hover:bg-slate-200'
}`}
 >
 Daily status
 </button>
 <button 
 onClick={() => setActiveTab('monthly')}
 className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
 activeTab === 'monthly' ? 'bg-[#28A745] text-white' : 'bg-[#E9ECEF] text-slate-600 hover:bg-slate-200'
}`}
 >
 Monthly attendance
 </button>
 <button 
 onClick={() => setActiveTab('working-hours')}
 className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
 activeTab === 'working-hours' ? 'bg-[#28A745] text-white' : 'bg-[#E9ECEF] text-slate-600 hover:bg-slate-200'
}`}
 >
 Working hours report
 </button>
 <button 
 onClick={() => setActiveTab('missing')}
 className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
 activeTab === 'missing' ? 'bg-[#28A745] text-white' : 'bg-[#E9ECEF] text-slate-600 hover:bg-slate-200'
}`}
 >
 Missing attendance
 </button>
 </div>

 {/* Main Card */}
 <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
 <div className="p-4 border-b border-slate-100 flex justify-between items-center">
 <h2 className="font-bold text-slate-800">
 {activeTab === 'form' && 'Take attendance'}
 {activeTab === 'daily-status' && 'Daily attendance status'}
 {activeTab === 'monthly' && 'Monthly attendance report'}
 {activeTab === 'working-hours' && 'Working hours report'}
 {activeTab === 'missing' && 'Missing attendance report'}
 </h2>
 <div className="flex gap-2">
 <button 
 onClick={() => setIsCustomFieldModalOpen(true)}
 className="bg-[#17A2B8] text-white px-3 py-1.5 rounded text-xs font-bold flex items-center gap-1.5 hover:bg-[#138496]"
 >
 <Settings className="w-3.5 h-3.5"/>
 Custom field
 </button>
 {activeTab === 'form' && (
 <>
 <input 
 type="file"
 ref={fileInputRef} 
 onChange={handleFileUpload} 
 accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
 className="hidden"
 />
 <button 
 onClick={handleBulkInsertClick}
 className="bg-[#28A745] text-white px-3 py-1.5 rounded text-xs font-bold flex items-center gap-1.5 hover:bg-[#218838]"
 >
 <Plus className="w-3.5 h-3.5"/>
 Bulk insert
 </button>
 </>
 )}
 {(activeTab === 'daily-status' || activeTab === 'monthly' || activeTab === 'working-hours') && (
 <div className="flex gap-1">
 <button 
 onClick={() => handleDownload('Excel')}
 className="bg-[#28A745] text-white px-3 py-1.5 rounded text-xs font-bold flex items-center gap-1.5 hover:bg-[#218838]"
 >
 <Download className="w-3.5 h-3.5"/>
 Excel
 </button>
 <button 
 onClick={() => handleDownload('PDF')}
 className="bg-red-600 text-white px-3 py-1.5 rounded text-xs font-bold flex items-center gap-1.5 hover:bg-red-700"
 >
 <FileText className="w-3.5 h-3.5"/>
 PDF
 </button>
 </div>
 )}
 </div>
 </div>

 <div className="p-8">
 {activeTab === 'form' && (
 <form className="max-w-2xl space-y-6">
 <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-4">
 <label className="text-sm font-bold text-slate-700">
 Employee <span className="text-red-500">*</span>
 </label>
 <div className="md:col-span-2">
 <select 
 value={selectedEmployee}
 onChange={(e) => setSelectedEmployee(e.target.value)}
 className="w-full border border-slate-200 rounded px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-indigo-500"
 >
 <option value="">Select one</option>
 {employees.map(emp => (
 <option key={emp.id} value={emp.name}>{emp.name}</option>
 ))}
 </select>
 </div>
 </div>

 <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-4">
 <label className="text-sm font-bold text-slate-700">
 Time <span className="text-red-500">*</span>
 </label>
 <div className="md:col-span-2">
 <input 
 type="datetime-local"
 value={attendanceTime}
 onChange={(e) => setAttendanceTime(e.target.value)}
 className="w-full border border-slate-200 rounded px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-indigo-500"
 />
 </div>
 </div>

 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
 <div className="hidden md:block"></div>
 <div className="md:col-span-2">
 <button 
 type="submit"
 className="bg-[#28A745] text-white px-6 py-2 rounded text-sm font-bold hover:bg-[#218838] transition-colors"
 >
 Submit
 </button>
 </div>
 </div>
 </form>
 )}

 {activeTab === 'daily-status' && (
 <div className="space-y-6">
 <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-50 p-4 rounded-lg border border-slate-100">
 <div className="flex items-center gap-4">
 <div className="relative">
 <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"/>
 <input 
 type="text"
 placeholder="Search employee..."
 value={searchTerm}
 onChange={(e) => setSearchTerm(e.target.value)}
 className="pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 w-64"
 />
 </div>
 <input 
 type="date"
 className="border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none"
 value={selectedDate}
 onChange={(e) => setSelectedDate(e.target.value)}
 />
 </div>
 
 <div className="flex flex-wrap items-center gap-4">
 <div className="flex items-center gap-2">
 <span className="text-xs font-bold text-slate-500 uppercase">Custom Range:</span>
 <input 
 type="date"
 value={startDate}
 onChange={(e) => setStartDate(e.target.value)}
 className="border border-slate-200 rounded-lg px-3 py-1.5 text-xs outline-none bg-white"
 />
 <span className="text-slate-400">to</span>
 <input 
 type="date"
 value={endDate}
 onChange={(e) => setEndDate(e.target.value)}
 className="border border-slate-200 rounded-lg px-3 py-1.5 text-xs outline-none bg-white"
 />
 <button 
 onClick={() => handleDownload('Excel', 'Custom')}
 disabled={!startDate || !endDate || isDownloading}
 className={`px-3 py-1.5 rounded text-[10px] font-bold flex items-center gap-1 transition-all ${
 !startDate || !endDate ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm'
}`}
 >
 <Download className="w-3 h-3"/>
 {isDownloading ? 'Processing...' : 'Download Range'}
 </button>
 </div>

 <div className="h-6 w-px bg-slate-200 mx-2 hidden md:block"></div>

 <div className="flex items-center gap-2">
 <span className="text-xs font-bold text-slate-500 uppercase">Quick Download:</span>
 <div className="flex gap-1">
 {['Weekly', 'Monthly', 'Quarterly'].map(period => (
 <button 
 key={period}
 onClick={() => handleDownload('Excel', period)}
 disabled={isDownloading}
 className="bg-white border border-slate-200 text-slate-600 px-3 py-1.5 rounded text-[10px] font-bold hover:bg-slate-50 transition-colors flex items-center gap-1"
 >
 <Download className="w-3 h-3"/>
 {period}
 </button>
 ))}
 </div>
 </div>
 </div>
 </div>

 <div className="overflow-x-auto border border-slate-100 rounded-lg">
 <table className="w-full text-left border-collapse">
 <thead>
 <tr className="bg-slate-50 border-b border-slate-100">
 <th className="px-4 py-3 text-xs font-bold text-slate-600 uppercase">Sl</th>
 <th className="px-4 py-3 text-xs font-bold text-slate-600 uppercase">Employee Name</th>
 <th className="px-4 py-3 text-xs font-bold text-slate-600 uppercase">Login Time</th>
 <th className="px-4 py-3 text-xs font-bold text-slate-600 uppercase">Logout Time</th>
 <th className="px-4 py-3 text-xs font-bold text-slate-600 uppercase">Working Hours</th>
 <th className="px-4 py-3 text-xs font-bold text-slate-600 uppercase">Date</th>
 <th className="px-4 py-3 text-xs font-bold text-slate-600 uppercase">Actions</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-slate-100">
 {dailyAttendanceData.filter(r => r.employeeName.toLowerCase().includes(searchTerm.toLowerCase())).map((record, idx) => (
 <tr key={record.id} className="hover:bg-slate-50/50 transition-colors">
 <td className="px-4 py-3 text-sm text-slate-600">{idx + 1}</td>
 <td className="px-4 py-3 text-sm font-medium text-slate-800">{record.employeeName}</td>
 <td className="px-4 py-3 text-sm text-emerald-600 font-bold">{record.loginTime}</td>
 <td className="px-4 py-3 text-sm text-amber-600 font-bold">{record.logoutTime}</td>
 <td className="px-4 py-3 text-sm text-indigo-600 font-bold">{record.workingHours}</td>
 <td className="px-4 py-3 text-sm text-slate-500">{record.date}</td>
 <td className="px-4 py-3 text-sm">
 <button 
 onClick={() => setSelectedRecordForLogs(record)}
 className="text-indigo-600 hover:text-indigo-800 font-bold text-xs flex items-center gap-1"
 >
 <FileText className="w-3.5 h-3.5"/>
 View Logs
 </button>
 </td>
 </tr>
 ))}
 {dailyAttendanceData.length === 0 && (
 <tr>
 <td colSpan={6} className="px-4 py-8 text-center text-slate-500 text-sm">
 No attendance records found.
 </td>
 </tr>
 )}
 </tbody>
 </table>
 </div>
 </div>
 )}

 {activeTab === 'monthly' && (
 <div className="space-y-8">
 <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end bg-slate-50 p-6 rounded-xl border border-slate-100">
 <div className="md:col-span-2">
 <label className="block text-sm font-bold text-slate-700 mb-2">Search Employee</label>
 <div className="relative">
 <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"/>
 <input 
 type="text"
 placeholder="Type employee name..."
 className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500/20"
 />
 </div>
 </div>
 <div>
 <label className="block text-sm font-bold text-slate-700 mb-2">Select Month</label>
 <input type="month"className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none"defaultValue="2026-02"/>
 </div>
 <button className="bg-indigo-600 text-white px-6 py-2 rounded-lg text-sm font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all">
 Generate Report
 </button>
 </div>

 <div className="overflow-x-auto border border-slate-100 rounded-lg">
 <table className="w-full text-left border-collapse">
 <thead>
 <tr className="bg-slate-50 border-b border-slate-100">
 <th className="px-4 py-3 text-xs font-bold text-slate-600 uppercase">Employee</th>
 <th className="px-4 py-3 text-xs font-bold text-slate-600 uppercase">Total Days</th>
 <th className="px-4 py-3 text-xs font-bold text-slate-600 uppercase">Present</th>
 <th className="px-4 py-3 text-xs font-bold text-slate-600 uppercase">Absent</th>
 <th className="px-4 py-3 text-xs font-bold text-slate-600 uppercase">Leave</th>
 <th className="px-4 py-3 text-xs font-bold text-slate-600 uppercase">Total Hours</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-slate-100">
 {employees
 .filter(emp => emp.status === 'Active')
 .map((emp, idx) => (
 <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
 <td className="px-4 py-3 text-sm font-medium text-slate-800">{emp.name}</td>
 <td className="px-4 py-3 text-sm text-slate-600">28</td>
 <td className="px-4 py-3 text-sm text-emerald-600 font-bold">22</td>
 <td className="px-4 py-3 text-sm text-red-600 font-bold">2</td>
 <td className="px-4 py-3 text-sm text-amber-600 font-bold">4</td>
 <td className="px-4 py-3 text-sm text-indigo-600 font-bold">198h</td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 </div>
 )}

 {activeTab === 'working-hours' && (
 <div className="space-y-8">
 <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end bg-slate-50 p-6 rounded-xl border border-slate-100">
 <div>
 <label className="block text-sm font-bold text-slate-700 mb-2">Select Employee</label>
 <select className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none bg-white">
 <option value="All">All Employees</option>
 {employees
 .filter(emp => emp.status === 'Active')
 .map(emp => <option key={emp.id} value={emp.name}>{emp.name}</option>)}
 </select>
 </div>
 <div>
 <label className="block text-sm font-bold text-slate-700 mb-2">Report Type</label>
 <select 
 value={reportType}
 onChange={(e) => setReportType(e.target.value as any)}
 className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none bg-white"
 >
 <option value="daily">Daily</option>
 <option value="weekly">Weekly</option>
 <option value="monthly">Monthly</option>
 </select>
 </div>
 <div>
 <label className="block text-sm font-bold text-slate-700 mb-2">Select Date/Month</label>
 <input 
 type={reportType === 'monthly' ? 'month' : 'date'} 
 className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none bg-white"
 />
 </div>
 <button className="bg-indigo-600 text-white px-6 py-2 rounded-lg text-sm font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all">
 View Report
 </button>
 </div>

 <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
 <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
 <h3 className="text-sm font-bold text-slate-800 mb-6">Working Hours Trend</h3>
 <div className="h-[300px] w-full">
 <ResponsiveContainer width="100%"height="100%">
 <BarChart data={workingHoursChartData}>
 <CartesianGrid strokeDasharray="3 3"vertical={false} stroke="#f1f5f9"/>
 <XAxis dataKey="day"axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b'}} />
 <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b'}} />
 <Tooltip cursor={{ fill: '#f8fafc'}} />
 <Bar dataKey="hours"fill="#4F46E5"radius={[4, 4, 0, 0]} barSize={30} />
 </BarChart>
 </ResponsiveContainer>
 </div>
 </div>

 <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
 <h3 className="text-sm font-bold text-slate-800 mb-6">Working Hours Details</h3>
 <div className="space-y-4">
 <div className="flex justify-between items-center p-3 bg-emerald-50 rounded-lg border border-emerald-100">
 <span className="text-xs font-bold text-emerald-700 uppercase">Total Hours (This Week)</span>
 <span className="text-xl font-bold text-emerald-600">43.8 Hours</span>
 </div>
 <div className="flex justify-between items-center p-3 bg-indigo-50 rounded-lg border border-indigo-100">
 <span className="text-xs font-bold text-indigo-700 uppercase">Average Daily Hours</span>
 <span className="text-xl font-bold text-indigo-600">8.76 Hours</span>
 </div>
 <div className="flex justify-between items-center p-3 bg-amber-50 rounded-lg border border-amber-100">
 <span className="text-xs font-bold text-amber-700 uppercase">Overtime Hours</span>
 <span className="text-xl font-bold text-amber-600">3.8 Hours</span>
 </div>
 <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg border border-red-100">
 <span className="text-xs font-bold text-red-700 uppercase">Shortfall Hours</span>
 <span className="text-xl font-bold text-red-600">0.0 Hours</span>
 </div>
 </div>
 </div>
 </div>
 </div>
 )}

 {activeTab === 'missing' && (
 <div className="text-center py-12">
 <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
 <Calendar className="w-8 h-8 text-slate-300"/>
 </div>
 <h3 className="text-slate-800 font-bold">No missing attendance records found</h3>
 <p className="text-slate-500 text-sm mt-1">All employee attendance records are up to date.</p>
 </div>
 )}
 </div>
 </div>

 <AnimatePresence>
 {selectedRecordForLogs && (
 <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
 <motion.div 
 initial={{ opacity: 0, scale: 0.95}}
 animate={{ opacity: 1, scale: 1}}
 exit={{ opacity: 0, scale: 0.95}}
 className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden"
 >
 <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
 <div>
 <h3 className="font-bold text-slate-800">Attendance Logs</h3>
 <p className="text-xs text-slate-500">{selectedRecordForLogs.employeeName} - {selectedRecordForLogs.date}</p>
 </div>
 <button onClick={() => setSelectedRecordForLogs(null)} className="p-1 hover:bg-slate-200 rounded-full transition-colors">
 <X className="w-5 h-5 text-slate-500"/>
 </button>
 </div>
 
 <div className="p-6 max-h-[60vh] overflow-y-auto">
 <div className="space-y-4">
 {selectedRecordForLogs.logs.length === 0 ? (
 <p className="text-center text-slate-500 py-8">No detailed logs available for this record.</p>
 ) : (
 selectedRecordForLogs.logs.map((log: any, idx: number) => (
 <div key={idx} className="flex gap-4 p-4 rounded-lg border border-slate-100 bg-slate-50/50">
 <div className="flex-1 space-y-2">
 <div className="flex items-center justify-between">
 <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
 log.action.includes('In') ? 'bg-emerald-100 text-emerald-700' :
 log.action.includes('Out') ? 'bg-red-100 text-red-700' :
 'bg-amber-100 text-amber-700'
}`}>
 {log.action}
 </span>
 <span className="text-xs font-mono text-slate-500">{log.time}</span>
 </div>
 <div className="flex items-center gap-1.5 text-xs text-slate-600">
 <MapPin className="w-3.5 h-3.5 text-slate-400"/>
 <span>{log.location}</span>
 </div>
 </div>
 {log.selfie && (
 <div className="w-20 h-20 rounded-lg border border-slate-200 overflow-hidden bg-white shrink-0">
 <img src={log.selfie} alt="Selfie"className="w-full h-full object-cover"/>
 </div>
 )}
 </div>
 ))
 )}
 </div>
 </div>

 <div className="p-4 border-t border-slate-100 flex justify-end bg-slate-50">
 <button 
 onClick={() => setSelectedRecordForLogs(null)}
 className="bg-slate-800 text-white px-6 py-2 rounded-lg text-sm font-bold hover:bg-slate-900"
 >
 Close
 </button>
 </div>
 </motion.div>
 </div>
 )}

 {isCustomFieldModalOpen && (
 <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
 <motion.div 
 initial={{ opacity: 0, scale: 0.95}}
 animate={{ opacity: 1, scale: 1}}
 exit={{ opacity: 0, scale: 0.95}}
 className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden"
 >
 <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
 <h3 className="font-bold text-slate-800">Manage Custom Fields</h3>
 <button onClick={() => setIsCustomFieldModalOpen(false)} className="p-1 hover:bg-slate-200 rounded-full transition-colors">
 <X className="w-5 h-5 text-slate-500"/>
 </button>
 </div>
 
 <div className="p-6 space-y-6">
 <form onSubmit={handleAddCustomField} className="flex gap-2">
 <input 
 type="text"
 placeholder="Field Name (e.g., Shift ID)"
 value={newFieldName}
 onChange={(e) => setNewFieldName(e.target.value)}
 className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500/20"
 />
 <button type="submit"className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-indigo-700">
 Add
 </button>
 </form>

 <div className="space-y-2">
 <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active Custom Fields</h4>
 {customFields.length === 0 ? (
 <p className="text-sm text-slate-400 italic">No custom fields added yet.</p>
 ) : (
 <div className="space-y-2">
 {customFields.map((field, idx) => (
 <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
 <span className="text-sm font-medium text-slate-700">{field.name}</span>
 <button 
 onClick={() => setCustomFields(customFields.filter((_, i) => i !== idx))}
 className="text-red-500 hover:text-red-700"
 >
 <Trash2 className="w-4 h-4"/>
 </button>
 </div>
 ))}
 </div>
 )}
 </div>
 </div>

 <div className="p-4 border-t border-slate-100 flex justify-end bg-slate-50">
 <button 
 onClick={() => setIsCustomFieldModalOpen(false)}
 className="bg-indigo-600 text-white px-6 py-2 rounded-lg text-sm font-bold hover:bg-indigo-700"
 >
 Done
 </button>
 </div>
 </motion.div>
 </div>
 )}
 </AnimatePresence>
 </div>
 </AdminLayout>
 );
}
