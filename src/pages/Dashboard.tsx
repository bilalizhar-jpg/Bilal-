import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, 
  UserCheck, 
  AlertCircle, 
  X,
  UserX,
  UserMinus,
  Bell
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import AdminLayout from '../components/AdminLayout';
import { useEmployees } from '../context/EmployeeContext';
import { useAttendance } from '../context/AttendanceContext';
import { useLeaves } from '../context/LeaveContext';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

export default function Dashboard() {
  const [showLeaveNotification, setShowLeaveNotification] = useState(true);
  const { theme } = useTheme();
  const { employees } = useEmployees();
  const { attendanceRecords } = useAttendance();
  const { leaveRequests } = useLeaves();

  const activeEmployees = useMemo(() => employees.filter(e => e.status === 'Active'), [employees]);
  
  const pendingLeave = useMemo(() => leaveRequests.find(r => r.status === 'Pending'), [leaveRequests]);
  const recentLeaves = useMemo(() => leaveRequests.slice(0, 4), [leaveRequests]);
  
  const awardedData = useMemo(() => {
    // Group active employees by department and count them as a mock for "awarded"
    // or just show top 5 departments
    const depts = Array.from(new Set(activeEmployees.map(e => e.department)));
    return depts.slice(0, 5).map(dept => ({
      name: dept,
      value: activeEmployees.filter(e => e.department === dept).length * 10 // Mock value
    }));
  }, [activeEmployees]);

  const today = new Date().toISOString().split('T')[0];
  const todayRecords = useMemo(() => attendanceRecords.filter(r => r.date === today), [attendanceRecords, today]);
  
  const stats = useMemo(() => {
    const total = activeEmployees.length;
    const present = todayRecords.filter(r => r.status === 'Present').length;
    const leave = todayRecords.filter(r => r.status === 'Leave').length;
    const absent = total - present - leave;
    
    return [
      { label: 'Total employee', value: total.toString(), icon: Users, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
      { label: 'Today presents', value: present.toString(), icon: UserCheck, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
      { label: 'Today absents', value: Math.max(0, absent).toString(), icon: UserX, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
      { label: 'Today leave', value: leave.toString(), icon: UserMinus, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
    ];
  }, [activeEmployees, todayRecords]);

  const deptAttendanceData = useMemo(() => {
    const depts = Array.from(new Set(activeEmployees.map(e => e.department)));
    return depts.map(dept => {
      const deptEmps = activeEmployees.filter(e => e.department === dept);
      const total = deptEmps.length;
      if (total === 0) return { name: dept, leave: 0, present: 0, absent: 0 };
      
      const deptRecords = todayRecords.filter(r => deptEmps.some(e => e.employeeId === r.employeeId));
      const present = deptRecords.filter(r => r.status === 'Present').length;
      const leave = deptRecords.filter(r => r.status === 'Leave').length;
      const absent = total - present - leave;
      
      return {
        name: dept,
        present: Math.round((present / total) * 100),
        leave: Math.round((leave / total) * 100),
        absent: Math.round((Math.max(0, absent) / total) * 100)
      };
    });
  }, [activeEmployees, todayRecords]);

  const recentRecruits = useMemo(() => {
    return [...activeEmployees]
      .sort((a, b) => new Date(b.joiningDate).getTime() - new Date(a.joiningDate).getTime())
      .slice(0, 3);
  }, [activeEmployees]);

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Blinking Leave Notification */}
        <AnimatePresence>
          {showLeaveNotification && pendingLeave && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-900/30 rounded-xl p-4 flex items-center justify-between shadow-sm animate-pulse"
            >
              <div className="flex items-center gap-3">
                <div className="bg-amber-100 dark:bg-amber-900/40 p-2 rounded-full">
                  <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-amber-800 dark:text-amber-200">New Leave Application</h4>
                  <p className="text-xs text-amber-600 dark:text-amber-400">{pendingLeave.employeeName} has applied for {pendingLeave.type} ({pendingLeave.days} days). Notification sent to HR & Dept Head.</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Link to="/leave" className="text-xs font-bold text-amber-700 dark:text-amber-300 hover:underline">Review Now</Link>
                <button onClick={() => setShowLeaveNotification(false)} className="p-1 hover:bg-amber-100 dark:hover:bg-amber-900/40 rounded-full">
                  <X className="w-4 h-4 text-amber-500 dark:text-amber-500" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Top Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat) => (
            <div key={stat.label} className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex justify-between items-center">
              <div>
                <h3 className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-1">{stat.label}</h3>
                <p className="text-3xl font-bold text-slate-800 dark:text-white">{stat.value}</p>
              </div>
              <div className={`${stat.bg} ${stat.color} p-3 rounded-xl`}>
                <stat.icon className="w-6 h-6" />
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Charts Area */}
          <div className="lg:col-span-3 space-y-6">
            {/* Attendance Chart */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <h2 className="font-bold text-slate-800 dark:text-white">Daily attendance statistic (department wise)</h2>
              </div>
              <div className="h-[350px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={deptAttendanceData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme === 'dark' ? '#1e293b' : '#f0f0f0'} />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: theme === 'dark' ? '#94a3b8' : '#64748b' }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: theme === 'dark' ? '#94a3b8' : '#64748b' }} tickFormatter={(val) => `${val}%`} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: theme === 'dark' ? '#0f172a' : '#ffffff',
                        borderColor: theme === 'dark' ? '#1e293b' : '#e2e8f0',
                        color: theme === 'dark' ? '#f8fafc' : '#0f172a'
                      }}
                      cursor={{ fill: theme === 'dark' ? '#1e293b' : '#f8fafc' }} 
                    />
                    <Legend verticalAlign="top" align="right" iconType="rect" wrapperStyle={{ paddingBottom: '20px' }} />
                    <Bar dataKey="leave" name="Leave %" fill="#FF4D4D" radius={[4, 4, 0, 0]} barSize={40} />
                    <Bar dataKey="present" name="Present %" fill="#00C49F" radius={[4, 4, 0, 0]} barSize={40} />
                    <Bar dataKey="absent" name="Absent %" fill="#FFBB28" radius={[4, 4, 0, 0]} barSize={40} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Recruitment Chart */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <h2 className="font-bold text-slate-800 dark:text-white">Position wise recruitment</h2>
                <select className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded px-3 py-1 text-xs outline-none text-slate-900 dark:text-white">
                  <option>Yearly</option>
                  <option>Monthly</option>
                </select>
              </div>
              <div className="h-[250px] w-full flex items-center justify-center border-t border-slate-50 dark:border-slate-800">
                <div className="text-slate-300 dark:text-slate-600 text-sm italic">No data available for the selected period</div>
              </div>
            </div>

            {/* Awarded Chart */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <h2 className="font-bold text-slate-800 dark:text-white">Awarded</h2>
              </div>
              <div className="h-[200px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={awardedData} layout="vertical">
                    <XAxis type="number" hide />
                    <YAxis dataKey="name" type="category" hide />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: theme === 'dark' ? '#0f172a' : '#ffffff',
                        borderColor: theme === 'dark' ? '#1e293b' : '#e2e8f0',
                        color: theme === 'dark' ? '#f8fafc' : '#0f172a'
                      }}
                    />
                    <Legend verticalAlign="top" align="right" iconType="rect" />
                    <Bar dataKey="value" fill="#0088FE" radius={[0, 4, 4, 0]} barSize={20} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Right Side Widgets */}
          <div className="space-y-6">
            {/* Leave Application */}
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-slate-100 dark:border-slate-800">
                <h2 className="font-bold text-slate-800 dark:text-white text-sm">Leave Application</h2>
              </div>
              <div className="p-4 space-y-4">
                {recentLeaves.map((app, i) => (
                  <div key={app.id} className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-[10px] font-bold text-slate-500">
                        {app.employeeName.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <div className="text-[11px] font-bold text-slate-800 dark:text-white truncate">{app.employeeName}</div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">Reason : {app.reason}</div>
                      </div>
                    </div>
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded border shrink-0 ${
                      app.status === 'Approved' ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 border-emerald-100 dark:border-emerald-900/30' :
                      app.status === 'Rejected' ? 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border-red-100 dark:border-red-900/30' :
                      'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 border-amber-100 dark:border-amber-900/30'
                    }`}>
                      {app.status}
                    </span>
                  </div>
                ))}
                {recentLeaves.length === 0 && (
                  <div className="text-center py-4 text-xs text-slate-400 italic">No recent leave applications</div>
                )}
                <Link to="/leave" className="block w-full text-center text-xs text-emerald-600 dark:text-emerald-400 font-bold mt-2 hover:underline">See All Request →</Link>
              </div>
            </div>

            {/* New Recruitment */}
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-slate-100 dark:border-slate-800">
                <h2 className="font-bold text-slate-800 dark:text-white text-sm">New recruitment</h2>
              </div>
              <div className="p-4 space-y-4">
                {recentRecruits.map((rec, i) => (
                  <div key={rec.id} className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <img src={rec.avatar || `https://picsum.photos/seed/rec${i}/40/40`} className="w-8 h-8 rounded-full object-cover" referrerPolicy="no-referrer" />
                      <div>
                        <div className="text-[11px] font-bold text-slate-800 dark:text-white">{rec.name}</div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400">Date : {rec.joiningDate}</div>
                      </div>
                    </div>
                    <button className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-0.5 rounded border border-emerald-100 dark:border-emerald-900/30 shrink-0">Recruit</button>
                  </div>
                ))}
                {recentRecruits.length === 0 && (
                  <div className="text-center py-4 text-xs text-slate-400 italic">No recent recruits</div>
                )}
                <button className="w-full text-center text-xs text-slate-500 dark:text-slate-400 font-bold mt-2 hover:underline">See More</button>
              </div>
            </div>

            {/* Notice Board Widget */}
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                <h2 className="font-bold text-slate-800 dark:text-white text-sm">Notice Board</h2>
                <Link to="/notice" className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline">View All</Link>
              </div>
              <div className="p-4 space-y-4">
                {[
                  { type: 'Govt special', title: 'Eid Holiday', date: '2026-01-31' },
                  { type: 'General Meeting', title: 'Monthly Staff Meeting', date: '2025-04-06' },
                  { type: 'Policy', title: 'New Attendance Policy', date: '2025-01-16' },
                ].map((notice, i) => (
                  <div key={i} className="flex items-start gap-3 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer">
                    <div className="bg-indigo-50 dark:bg-indigo-900/30 p-2 rounded-lg shrink-0">
                      <Bell className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-[11px] font-bold text-slate-800 dark:text-white truncate">{notice.title}</div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[9px] font-medium text-slate-500 dark:text-slate-400">{notice.type}</span>
                        <span className="text-[9px] text-slate-400 dark:text-slate-600">•</span>
                        <span className="text-[9px] text-slate-400 dark:text-slate-600">{notice.date}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Loan Payment Received */}
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-slate-100 dark:border-slate-800">
                <h2 className="font-bold text-slate-800 dark:text-white text-sm">Loan payment received</h2>
              </div>
              <div className="p-4 flex flex-col items-center">
                <div className="h-40 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[{ value: 100 }]}
                        cx="50%"
                        cy="100%"
                        startAngle={180}
                        endAngle={0}
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={0}
                        dataKey="value"
                      >
                        <Cell fill="#00C49F" />
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="text-center -mt-8">
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold">Total Loan Amount</div>
                  <div className="text-xl font-bold text-slate-800 dark:text-white">$0.00</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

