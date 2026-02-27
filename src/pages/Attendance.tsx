import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Building2, 
  Menu, 
  Maximize2, 
  RefreshCw, 
  Search,
  ChevronRight,
  LayoutDashboard,
  Calendar,
  Award,
  Users,
  UserMinus,
  CreditCard,
  Bell,
  DollarSign,
  Briefcase,
  ClipboardList,
  UserCheck,
  FileText,
  Target,
  Settings,
  MessageSquare,
  Plus,
  Download,
  ChevronDown,
  X,
  CheckCircle2,
  Trash2
} from 'lucide-react';
import { Link } from 'react-router-dom';

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

type TabType = 'form' | 'daily-status' | 'monthly' | 'working-hours' | 'missing';

interface AttendanceRecord {
  id: string;
  employeeName: string;
  loginTime: string;
  logoutTime: string;
  workingHours: string;
  date: string;
}

const dailyAttendanceData: AttendanceRecord[] = [
  { id: '1', employeeName: 'Alex Thompson', loginTime: '09:00 AM', logoutTime: '06:00 PM', workingHours: '9h 0m', date: '2026-02-26' },
  { id: '2', employeeName: 'Sarah Jenkins', loginTime: '08:45 AM', logoutTime: '05:30 PM', workingHours: '8h 45m', date: '2026-02-26' },
  { id: '3', employeeName: 'Michael Chen', loginTime: '09:15 AM', logoutTime: '06:15 PM', workingHours: '9h 0m', date: '2026-02-26' },
  { id: '4', employeeName: 'Emma Wilson', loginTime: '09:00 AM', logoutTime: '05:00 PM', workingHours: '8h 0m', date: '2026-02-26' },
  { id: '5', employeeName: 'Honorato Imogene', loginTime: '08:30 AM', logoutTime: '05:30 PM', workingHours: '9h 0m', date: '2026-02-26' },
];

const workingHoursChartData = [
  { day: 'Mon', hours: 8.5 },
  { day: 'Tue', hours: 9.0 },
  { day: 'Wed', hours: 8.0 },
  { day: 'Thu', hours: 9.5 },
  { day: 'Fri', hours: 8.8 },
  { day: 'Sat', hours: 4.0 },
  { day: 'Sun', hours: 0 },
];

export default function Attendance() {
  const [activeTab, setActiveTab] = useState<TabType>('form');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
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

  const handleDownload = (format: 'Excel' | 'PDF', period?: string) => {
    setIsDownloading(true);
    
    // Simulate a delay for "working" feel
    setTimeout(() => {
      let msg = '';
      if (period === 'Custom' && startDate && endDate) {
        msg = `Downloading Attendance Report from ${startDate} to ${endDate} in ${format} format...`;
      } else if (period) {
        msg = `Downloading ${period} Attendance Report in ${format} format...`;
      } else {
        msg = `Downloading Attendance Report in ${format} format...`;
      }
      
      alert(msg);
      setIsDownloading(false);
    }, 1000);
  };

  const handleAddCustomField = (e: React.FormEvent) => {
    e.preventDefault();
    if (newFieldName.trim()) {
      setCustomFields([...customFields, { name: newFieldName, type: 'text' }]);
      setNewFieldName('');
    }
  };

  const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { name: 'Attendance', icon: Calendar, active: true, hasSub: true, path: '/attendance' },
    { name: 'Award', icon: Award, hasSub: true },
    { name: 'Department', icon: Building2, hasSub: true },
    { name: 'Employee', icon: Users, hasSub: true },
    { name: 'Leave', icon: UserMinus, hasSub: true },
    { name: 'Loan', icon: CreditCard, hasSub: true },
    { name: 'Notice board', icon: Bell, hasSub: true, path: '/notice' },
    { name: 'Payroll', icon: DollarSign, hasSub: true },
    { name: 'Procurement', icon: Briefcase, hasSub: true },
    { name: 'Project management', icon: ClipboardList, hasSub: true },
    { name: 'Recruitment', icon: UserCheck, hasSub: true },
    { name: 'Reports', icon: FileText, hasSub: true },
    { name: 'Reward points', icon: Target, hasSub: true },
    { name: 'Setup rules', icon: Settings, hasSub: true },
    { name: 'Settings', icon: Settings, hasSub: true },
    { name: 'Message', icon: MessageSquare, hasSub: true },
  ];

  const employees = [
    'Alex Thompson',
    'Sarah Jenkins',
    'Michael Chen',
    'Emma Wilson',
    'Honorato Imogene',
    'Amy Aphrodite'
  ];

  return (
    <div className="min-h-screen bg-[#F0F2F5] flex">
      {/* Sidebar */}
      <aside className={`${isSidebarOpen ? 'w-64' : 'w-20'} bg-white border-r border-slate-200 flex flex-col transition-all duration-300 shrink-0`}>
        <div className="p-4 flex items-center gap-2 border-b border-slate-100 h-16">
          <div className="bg-indigo-600 p-1.5 rounded-lg shrink-0">
            <Building2 className="w-6 h-6 text-white" />
          </div>
          {isSidebarOpen && <span className="font-display font-bold text-xl tracking-tight text-slate-800">HRM Pro</span>}
        </div>
        
        <div className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder={isSidebarOpen ? "Menu Search..." : ""} 
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-md text-sm focus:ring-1 focus:ring-indigo-500 outline-none"
            />
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto px-2 space-y-1 custom-scrollbar">
          {menuItems.map((item) => (
            <Link
              key={item.name}
              to={item.name === 'Dashboard' ? '/dashboard' : item.name === 'Attendance' ? '/attendance' : item.name === 'Award' ? '/award' : item.name === 'Department' ? '/department' : item.name === 'Employee' ? '/employee' : item.name === 'Leave' ? '/leave' : item.name === 'Loan' ? '/loan' : item.name === 'Notice board' ? '/notice' : '#'}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                item.active 
                  ? 'bg-[#E8F0FE] text-[#1A73E8]' 
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center gap-3">
                <item.icon className={`w-5 h-5 ${item.active ? 'text-[#1A73E8]' : 'text-slate-500'}`} />
                {isSidebarOpen && <span>{item.name}</span>}
              </div>
              {isSidebarOpen && item.hasSub && <ChevronRight className="w-4 h-4 text-slate-400" />}
            </Link>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 text-slate-500 hover:bg-slate-100 rounded-md"
            >
              <Menu className="w-5 h-5" />
            </button>
            <button className="flex items-center gap-2 px-3 py-1.5 bg-[#F8F9FA] border border-slate-200 rounded text-xs font-medium text-slate-600 hover:bg-slate-100">
              <RefreshCw className="w-3.5 h-3.5 text-emerald-500" />
              Cache clear
            </button>
          </div>
          
          <div className="flex items-center gap-6">
            <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-md">
              <Maximize2 className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
              <div className="text-right">
                <div className="text-sm font-bold text-slate-800">Admin Admin</div>
                <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Admin</div>
              </div>
              <div className="h-9 w-9 rounded-full bg-slate-200 overflow-hidden border border-slate-300">
                <img src="https://picsum.photos/seed/admin/100/100" alt="Admin" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
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
                  <Settings className="w-3.5 h-3.5" />
                  Custom field
                </button>
                {activeTab === 'form' && (
                  <button className="bg-[#28A745] text-white px-3 py-1.5 rounded text-xs font-bold flex items-center gap-1.5 hover:bg-[#218838]">
                    <Plus className="w-3.5 h-3.5" />
                    Bulk insert
                  </button>
                )}
                {(activeTab === 'daily-status' || activeTab === 'monthly' || activeTab === 'working-hours') && (
                  <div className="flex gap-1">
                    <button 
                      onClick={() => handleDownload('Excel')}
                      className="bg-[#28A745] text-white px-3 py-1.5 rounded text-xs font-bold flex items-center gap-1.5 hover:bg-[#218838]"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Excel
                    </button>
                    <button 
                      onClick={() => handleDownload('PDF')}
                      className="bg-red-600 text-white px-3 py-1.5 rounded text-xs font-bold flex items-center gap-1.5 hover:bg-red-700"
                    >
                      <FileText className="w-3.5 h-3.5" />
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
                          <option key={emp} value={emp}>{emp}</option>
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
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input 
                          type="text" 
                          placeholder="Search employee..." 
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 w-64"
                        />
                      </div>
                      <input type="date" className="border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none" defaultValue="2026-02-26" />
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
                          <Download className="w-3 h-3" />
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
                              <Download className="w-3 h-3" />
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
                          </tr>
                        ))}
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
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input 
                          type="text" 
                          placeholder="Type employee name..." 
                          className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500/20"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Select Month</label>
                      <input type="month" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none" defaultValue="2026-02" />
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
                        {employees.map((emp, idx) => (
                          <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                            <td className="px-4 py-3 text-sm font-medium text-slate-800">{emp}</td>
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
                        {employees.map(emp => <option key={emp}>{emp}</option>)}
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
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={workingHoursChartData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                            <Tooltip cursor={{ fill: '#f8fafc' }} />
                            <Bar dataKey="hours" fill="#4F46E5" radius={[4, 4, 0, 0]} barSize={30} />
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
                    <Calendar className="w-8 h-8 text-slate-300" />
                  </div>
                  <h3 className="text-slate-800 font-bold">No missing attendance records found</h3>
                  <p className="text-slate-500 text-sm mt-1">All employee attendance records are up to date.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Custom Field Modal */}
        <AnimatePresence>
          {isCustomFieldModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden"
              >
                <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                  <h3 className="font-bold text-slate-800">Manage Custom Fields</h3>
                  <button onClick={() => setIsCustomFieldModalOpen(false)} className="p-1 hover:bg-slate-200 rounded-full transition-colors">
                    <X className="w-5 h-5 text-slate-500" />
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
                    <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-indigo-700">
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
                              <Trash2 className="w-4 h-4" />
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

        {/* Footer */}
        <footer className="h-12 bg-white border-t border-slate-200 flex items-center justify-between px-6 shrink-0 text-[11px] text-slate-500">
          <div>© 2026 BDTASK. All Rights Reserved.</div>
          <div>Designed by: <span className="text-indigo-600 font-bold">Bdtask</span></div>
        </footer>
      </main>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>
    </div>
  );
}
