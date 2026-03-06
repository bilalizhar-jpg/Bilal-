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
      <div className="space-y-8">
        {/* Blinking Leave Notification */}
        <AnimatePresence>
          {showLeaveNotification && pendingLeave && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="glass-card border border-amber-500/20 bg-amber-500/5 p-4 flex items-center justify-between shadow-lg shadow-amber-500/5 animate-pulse"
            >
              <div className="flex items-center gap-4">
                <div className="bg-amber-500/10 p-2 rounded-xl border border-amber-500/20">
                  <AlertCircle className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <h4 className="text-[10px] font-black text-amber-400 uppercase tracking-widest">Priority Alert: Leave Protocol</h4>
                  <p className="text-xs text-amber-200/60 mt-0.5">{pendingLeave.employeeName} has initialized a leave request ({pendingLeave.days} days).</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Link to="/leave" className="text-[10px] font-black text-amber-400 uppercase tracking-widest hover:text-amber-300 transition-colors">Review Protocol</Link>
                <button onClick={() => setShowLeaveNotification(false)} className="p-1.5 hover:bg-white/5 rounded-lg transition-colors">
                  <X className="w-4 h-4 text-amber-500/50" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Top Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat) => (
            <motion.div 
              key={stat.label} 
              whileHover={{ y: -5 }}
              className="glass-card p-6 border border-white/5 flex justify-between items-center group"
            >
              <div>
                <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 group-hover:text-slate-400 transition-colors">{stat.label}</h3>
                <p className="text-4xl font-black text-white tracking-tighter">{stat.value}</p>
              </div>
              <div className={`p-4 rounded-2xl bg-white/5 border border-white/5 group-hover:border-white/10 transition-all`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Charts Area */}
          <div className="lg:col-span-3 space-y-8">
            {/* Attendance Chart */}
            <div className="glass-card p-8 border border-white/5">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-[10px] font-black text-white uppercase tracking-[0.2em]">Deployment Metrics (Departmental)</h2>
              </div>
              <div className="h-[400px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={deptAttendanceData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                    <XAxis 
                      dataKey="name" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 10, fill: '#64748b', fontWeight: 900 }} 
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 10, fill: '#64748b', fontWeight: 900 }} 
                      tickFormatter={(val) => `${val}%`} 
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'rgba(2, 2, 3, 0.9)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '12px',
                        color: '#fff'
                      }}
                      itemStyle={{ fontSize: '10px', fontWeight: 900, textTransform: 'uppercase' }}
                      cursor={{ fill: 'rgba(255,255,255,0.02)' }} 
                    />
                    <Legend 
                      verticalAlign="top" 
                      align="right" 
                      iconType="circle" 
                      wrapperStyle={{ paddingBottom: '30px', fontSize: '10px', fontWeight: 900, textTransform: 'uppercase' }} 
                    />
                    <Bar dataKey="leave" name="Leave" fill="rgba(244, 63, 94, 0.6)" radius={[4, 4, 0, 0]} barSize={32} />
                    <Bar dataKey="present" name="Present" fill="rgba(16, 185, 129, 0.6)" radius={[4, 4, 0, 0]} barSize={32} />
                    <Bar dataKey="absent" name="Absent" fill="rgba(245, 158, 11, 0.6)" radius={[4, 4, 0, 0]} barSize={32} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Recruitment Chart */}
            <div className="glass-card p-8 border border-white/5">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-[10px] font-black text-white uppercase tracking-[0.2em]">Recruitment Trajectory</h2>
                <select className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-[10px] font-black uppercase tracking-widest outline-none text-white hover:bg-white/10 transition-all">
                  <option className="bg-slate-900">Yearly Cycle</option>
                  <option className="bg-slate-900">Monthly Cycle</option>
                </select>
              </div>
              <div className="h-[250px] w-full flex items-center justify-center border-t border-white/5">
                <div className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em] italic">Data Stream: Inactive</div>
              </div>
            </div>

            {/* Awarded Chart */}
            <div className="glass-card p-8 border border-white/5">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-[10px] font-black text-white uppercase tracking-[0.2em]">Excellence Distribution</h2>
              </div>
              <div className="h-[200px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={awardedData} layout="vertical">
                    <XAxis type="number" hide />
                    <YAxis dataKey="name" type="category" hide />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'rgba(2, 2, 3, 0.9)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '12px'
                      }}
                    />
                    <Bar dataKey="value" fill="rgba(99, 102, 241, 0.6)" radius={[0, 4, 4, 0]} barSize={24} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Right Side Widgets */}
          <div className="space-y-8">
            {/* Leave Application */}
            <div className="glass-card border border-white/5 overflow-hidden">
              <div className="p-6 border-b border-white/5">
                <h2 className="text-[10px] font-black text-white uppercase tracking-[0.2em]">Leave Registry</h2>
              </div>
              <div className="p-6 space-y-6">
                {recentLeaves.map((app, i) => (
                  <div key={app.id} className="flex items-center justify-between gap-4 group">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-xs font-black text-indigo-400 group-hover:bg-white/10 transition-all">
                        {app.employeeName.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-black text-white uppercase tracking-tight truncate">{app.employeeName}</div>
                        <div className="text-[10px] text-slate-500 uppercase tracking-widest truncate mt-1">Reason: {app.reason}</div>
                      </div>
                    </div>
                    <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full border shrink-0 ${
                      app.status === 'Approved' ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' :
                      app.status === 'Rejected' ? 'text-red-400 bg-red-500/10 border-red-500/20' :
                      'text-amber-400 bg-amber-500/10 border-amber-500/20'
                    }`}>
                      {app.status}
                    </span>
                  </div>
                ))}
                {recentLeaves.length === 0 && (
                  <div className="text-center py-6 text-[10px] font-black text-slate-600 uppercase tracking-widest italic">Registry Empty</div>
                )}
                <Link to="/leave" className="block w-full text-center text-[10px] font-black text-indigo-400 uppercase tracking-widest mt-4 hover:text-indigo-300 transition-colors">Full Registry Access →</Link>
              </div>
            </div>

            {/* New Recruitment */}
            <div className="glass-card border border-white/5 overflow-hidden">
              <div className="p-6 border-b border-white/5">
                <h2 className="text-[10px] font-black text-white uppercase tracking-[0.2em]">New Personnel</h2>
              </div>
              <div className="p-6 space-y-6">
                {recentRecruits.map((rec, i) => (
                  <div key={rec.id} className="flex items-center justify-between gap-4 group">
                    <div className="flex items-center gap-4">
                      <img src={rec.avatar || `https://picsum.photos/seed/rec${i}/40/40`} className="w-10 h-10 rounded-xl object-cover border border-white/5 group-hover:border-white/20 transition-all" referrerPolicy="no-referrer" />
                      <div>
                        <div className="text-xs font-black text-white uppercase tracking-tight">{rec.name}</div>
                        <div className="text-[10px] text-slate-500 uppercase tracking-widest mt-1">Joined: {rec.joiningDate}</div>
                      </div>
                    </div>
                    <button className="text-[9px] font-black text-emerald-400 uppercase tracking-widest bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20 hover:bg-emerald-500/20 transition-all">Recruit</button>
                  </div>
                ))}
                {recentRecruits.length === 0 && (
                  <div className="text-center py-6 text-[10px] font-black text-slate-600 uppercase tracking-widest italic">No New Personnel</div>
                )}
                <button className="w-full text-center text-[10px] font-black text-slate-500 uppercase tracking-widest mt-4 hover:text-slate-400 transition-colors">Expand View</button>
              </div>
            </div>

            {/* Notice Board Widget */}
            <div className="glass-card border border-white/5 overflow-hidden">
              <div className="p-6 border-b border-white/5 flex justify-between items-center">
                <h2 className="text-[10px] font-black text-white uppercase tracking-[0.2em]">Notice Board</h2>
                <Link to="/notice" className="text-[10px] font-black text-indigo-400 uppercase tracking-widest hover:text-indigo-300 transition-colors">View All</Link>
              </div>
              <div className="p-6 space-y-6">
                {[
                  { type: 'Govt special', title: 'Eid Holiday', date: '2026-01-31' },
                  { type: 'General Meeting', title: 'Monthly Staff Meeting', date: '2025-04-06' },
                  { type: 'Policy', title: 'New Attendance Policy', date: '2025-01-16' },
                ].map((notice, i) => (
                  <div key={i} className="flex items-start gap-4 p-3 rounded-2xl hover:bg-white/5 transition-all cursor-pointer group">
                    <div className="bg-indigo-500/10 p-3 rounded-xl border border-indigo-500/20 group-hover:bg-indigo-500/20 transition-all">
                      <Bell className="w-4 h-4 text-indigo-400" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-black text-white uppercase tracking-tight truncate group-hover:text-indigo-400 transition-colors">{notice.title}</div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{notice.type}</span>
                        <span className="text-[9px] text-slate-700">•</span>
                        <span className="text-[9px] text-slate-500 uppercase tracking-widest">{notice.date}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Loan Payment Received */}
            <div className="glass-card border border-white/5 overflow-hidden">
              <div className="p-6 border-b border-white/5">
                <h2 className="text-[10px] font-black text-white uppercase tracking-[0.2em]">Financial Liquidity</h2>
              </div>
              <div className="p-8 flex flex-col items-center">
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
                        <Cell fill="rgba(16, 185, 129, 0.4)" stroke="rgba(16, 185, 129, 0.6)" />
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="text-center -mt-8">
                  <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Total Loan Volume</div>
                  <div className="text-3xl font-black text-white tracking-tighter">$0.00</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

