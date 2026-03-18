import { useState, useMemo} from 'react';
import { motion, AnimatePresence} from 'motion/react';
import { 
 Users, 
 UserCheck, 
 AlertCircle, 
 X,
 UserX,
 UserMinus,
 Bell,
 TrendingUp,
 Building2
} from 'lucide-react';
import { Link} from 'react-router-dom';
import AdminLayout from '../components/AdminLayout';
import Card from '../components/ui/Card';
import { useEmployees} from '../context/EmployeeContext';
import { useAttendance} from '../context/AttendanceContext';
import { useLeaves} from '../context/LeaveContext';
import { useCompanyData} from '../context/CompanyDataContext';
import { useSettings} from '../context/SettingsContext';
import { useAuth} from '../context/AuthContext';
import { useSuperAdmin} from '../context/SuperAdminContext';
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
 Cell,
 AreaChart,
 Area
} from 'recharts';

export default function Dashboard() {
 const [showLeaveNotification, setShowLeaveNotification] = useState(true);
 const { formatCurrency} = useSettings();
 const { user} = useAuth();
 const { companies} = useSuperAdmin();
 const { employees} = useEmployees();
 const { attendanceRecords} = useAttendance();
 const { leaveRequests} = useLeaves();
 const { awards, notices, loans} = useCompanyData();

 const company = useMemo(() => companies.find(c => c.id === user?.companyId), [companies, user?.companyId]);

 const activeEmployees = useMemo(() => employees.filter(e => e.status === 'Active'), [employees]);
 
 const pendingLeaves = useMemo(() => leaveRequests.filter(r => r.status === 'Pending'), [leaveRequests]);
 const upcomingBirthdays = useMemo(() => {
 const today = new Date();
 return activeEmployees.filter(emp => {
 if (!emp.dob) return false;
 const dob = new Date(emp.dob);
 return dob.getMonth() === today.getMonth() && dob.getDate() >= today.getDate();
}).slice(0, 3);
}, [activeEmployees]);

 const notifications = useMemo(() => {
 const list = [];
 pendingLeaves.forEach(leave => {
 list.push({
 id:`leave-${leave.id}`,
 type: 'leave',
 title: 'Pending Leave',
 message:`${leave.employeeName} requested ${leave.days} days`,
 link: '/leave',
 color: 'amber'
});
});
 upcomingBirthdays.forEach(emp => {
 list.push({
 id:`bday-${emp.id}`,
 type: 'birthday',
 title: 'Upcoming Birthday',
 message:`${emp.name}'s birthday is coming up!`,
 link: '/employee',
 color: 'emerald'
});
});
 notices.slice(0, 2).forEach(notice => {
 list.push({
 id:`notice-${notice.id}`,
 type: 'notice',
 title: 'New Notice',
 message: notice.description,
 link: '/notice',
 color: 'indigo'
});
});
 return list;
}, [pendingLeaves, upcomingBirthdays, notices]);

 const departmentDistribution = useMemo(() => {
 const counts: Record<string, number> = {};
 activeEmployees.forEach(emp => {
 counts[emp.department] = (counts[emp.department] || 0) + 1;
});
 return Object.entries(counts).map(([name, value]) => ({ name, value}));
}, [activeEmployees]);

 const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

 const recentLeaves = useMemo(() => leaveRequests.slice(0, 4), [leaveRequests]);
 
 const awardedData = useMemo(() => {
 const awardCounts: Record<string, number> = {};
 awards.forEach(a => {
 awardCounts[a.awardName] = (awardCounts[a.awardName] || 0) + 1;
});
 return Object.entries(awardCounts).map(([name, value]) => ({ name, value})).slice(0, 5);
}, [awards]);

 const today = new Date().toISOString().split('T')[0];
 const todayRecords = useMemo(() => attendanceRecords.filter(r => r.date === today), [attendanceRecords, today]);
 
 const stats = useMemo(() => {
 const total = activeEmployees.length;
 const present = todayRecords.filter(r => r.status === 'Present').length;
 const leave = todayRecords.filter(r => r.status === 'Leave').length;
 const absent = total - present - leave;
 
 return [
 { label: 'Total employee', value: total.toString(), icon: Users, color: 'text-emerald-500', bg: 'bg-emerald-50 '},
 { label: 'Today presents', value: present.toString(), icon: UserCheck, color: 'text-emerald-500', bg: 'bg-emerald-50 '},
 { label: 'Today absents', value: Math.max(0, absent).toString(), icon: UserX, color: 'text-emerald-500', bg: 'bg-emerald-50 '},
 { label: 'Today leave', value: leave.toString(), icon: UserMinus, color: 'text-emerald-500', bg: 'bg-emerald-50 '},
 ];
}, [activeEmployees, todayRecords]);

 const deptAttendanceData = useMemo(() => {
 const depts = Array.from(new Set(activeEmployees.map(e => e.department)));
 return depts.map(dept => {
 const deptEmps = activeEmployees.filter(e => e.department === dept);
 const total = deptEmps.length;
 if (total === 0) return { name: dept, leave: 0, present: 0, absent: 0};
 
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

 const recruitmentTrajectory = useMemo(() => {
 const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
 const currentYear = new Date().getFullYear();
 const data = months.map((month, index) => {
 const count = employees.filter(e => {
 const joinDate = new Date(e.joiningDate);
 return joinDate.getFullYear() === currentYear && joinDate.getMonth() === index;
}).length;
 return { name: month, count};
});
 return data;
}, [employees]);

 const totalLoanAmount = useMemo(() => {
 return loans.reduce((sum, loan) => sum + (Number(loan.amount) || 0), 0);
}, [loans]);

 const recentRecruits = useMemo(() => {
 return [...activeEmployees]
 .sort((a, b) => new Date(b.joiningDate).getTime() - new Date(a.joiningDate).getTime())
 .slice(0, 3);
}, [activeEmployees]);

 const recentNotices = useMemo(() => notices.slice(0, 3), [notices]);

 return (
 <AdminLayout>
 <div className="space-y-8">
 {/* Welcome Header */}
 <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
 <div className="flex items-center gap-6">
 <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-500 to-emerald-500 p-0.5 shadow-lg shadow-indigo-500/20">
 <div className="w-full h-full rounded-[14px] bg-black flex items-center justify-center overflow-hidden">
 {company?.logo ? (
 <img src={company.logo} alt={company.name} className="w-full h-full object-cover"/>
 ) : (
 <Building2 className="w-8 h-8 text-white"/>
 )}
 </div>
 </div>
 <div>
 <h1 className="text-2xl font-black text-white tracking-tighter uppercase">{company?.name || 'Enterprise Terminal'}</h1>
 <div className="flex items-center gap-3 mt-1">
 <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">Active Node</span>
 <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric'})}</span>
 </div>
 </div>
 </div>
 <div className="flex items-center gap-4">
 <div className="text-right">
 <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">System Operator</p>
 <p className="text-xs font-black text-white uppercase tracking-tight">{user?.name}</p>
 </div>
 <div className="w-10 h-10 rounded-xl border border-white/10 bg-white/5 flex items-center justify-center">
 <Users className="w-5 h-5 text-indigo-400"/>
 </div>
 </div>
 </div>

 {/* Notifications Bar */}
 <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
 <AnimatePresence>
 {notifications.slice(0, 3).map((notif, idx) => (
 <motion.div 
 key={notif.id}
 initial={{ opacity: 0, y: -20}}
 animate={{ opacity: 1, y: 0}}
 exit={{ opacity: 0, y: -20}}
 transition={{ delay: idx * 0.1}}
 className={`glass-card border border-${notif.color}-500/20 bg-${notif.color}-500/5 p-4 flex items-center justify-between shadow-lg shadow-${notif.color}-500/5`}
 >
 <div className="flex items-center gap-4">
 <div className={`bg-${notif.color}-500/10 p-2 rounded-xl border border-${notif.color}-500/20`}>
 <Bell className={`w-4 h-4 text-${notif.color}-400`} />
 </div>
 <div className="min-w-0">
 <h4 className={`text-[9px] font-black text-${notif.color}-400 uppercase tracking-widest`}>{notif.title}</h4>
 <p className={`text-[11px] text-${notif.color}-200/60 mt-0.5 truncate`}>{notif.message}</p>
 </div>
 </div>
 <Link to={notif.link} className={`text-[9px] font-black text-${notif.color}-400 uppercase tracking-widest hover:text-${notif.color}-300 transition-colors shrink-0 ml-4`}>View</Link>
 </motion.div>
 ))}
 </AnimatePresence>
 </div>

 {/* Top Stats Cards */}
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
 {stats.map((stat) => (
 <Card key={stat.label} className="flex justify-between items-center group hover:border-indigo-500/30 transition-all">
 <div>
 <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 group-hover:text-slate-400 transition-colors">{stat.label}</h3>
 <p className="text-4xl font-black text-slate-900 tracking-tighter">{stat.value}</p>
 </div>
 <div className={`p-4 rounded-2xl bg-slate-100 border border-slate-200 group-hover:border-indigo-500/20 transition-all`}>
 <stat.icon className={`w-6 h-6 ${stat.color}`} />
 </div>
 </Card>
 ))}
 </div>

 <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
 {/* Main Charts Area */}
 <div className="lg:col-span-3 space-y-8">
 {/* Attendance Chart */}
 <Card variant="glass"className="p-8 border border-white/5">
 <div className="flex justify-between items-center mb-8">
 <h2 className="text-[10px] font-black text-white uppercase tracking-[0.2em]">Deployment Metrics (Departmental)</h2>
 </div>
 <div className="h-[400px] w-full">
 <ResponsiveContainer width="100%"height="100%">
 <BarChart data={deptAttendanceData} margin={{ top: 20, right: 30, left: 20, bottom: 5}}>
 <CartesianGrid strokeDasharray="3 3"vertical={false} stroke="rgba(255,255,255,0.05)"/>
 <XAxis 
 dataKey="name"
 axisLine={false} 
 tickLine={false} 
 tick={{ fontSize: 10, fill: '#64748b', fontWeight: 900}} 
 />
 <YAxis 
 axisLine={false} 
 tickLine={false} 
 tick={{ fontSize: 10, fill: '#64748b', fontWeight: 900}} 
 tickFormatter={(val) =>`${val}%`} 
 />
 <Tooltip 
 contentStyle={{ 
 backgroundColor: 'rgba(2, 2, 3, 0.9)',
 backdropFilter: 'blur(10px)',
 border: '1px solid rgba(255, 255, 255, 0.1)',
 borderRadius: '12px',
 color: '#fff'
}}
 itemStyle={{ fontSize: '10px', fontWeight: 900, textTransform: 'uppercase'}}
 cursor={{ fill: 'rgba(255,255,255,0.02)'}} 
 />
 <Legend 
 verticalAlign="top"
 align="right"
 iconType="circle"
 wrapperStyle={{ paddingBottom: '30px', fontSize: '10px', fontWeight: 900, textTransform: 'uppercase'}} 
 />
 <Bar dataKey="leave"name="Leave"fill="rgba(244, 63, 94, 0.6)"radius={[4, 4, 0, 0]} barSize={32} />
 <Bar dataKey="present"name="Present"fill="rgba(16, 185, 129, 0.6)"radius={[4, 4, 0, 0]} barSize={32} />
 <Bar dataKey="absent"name="Absent"fill="rgba(245, 158, 11, 0.6)"radius={[4, 4, 0, 0]} barSize={32} />
 </BarChart>
 </ResponsiveContainer>
 </div>
 </Card>

 {/* Recruitment Chart */}
 <Card variant="glass"className="p-8 border border-white/5">
 <div className="flex justify-between items-center mb-8">
 <h2 className="text-[10px] font-black text-white uppercase tracking-[0.2em]">Recruitment Trajectory</h2>
 <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-lg border border-white/10">
 <TrendingUp className="w-3 h-3 text-emerald-400"/>
 <span className="text-[10px] font-black text-white uppercase tracking-widest">Active Stream</span>
 </div>
 </div>
 <div className="h-[250px] w-full">
 <ResponsiveContainer width="100%"height="100%">
 <AreaChart data={recruitmentTrajectory}>
 <defs>
 <linearGradient id="colorCount"x1="0"y1="0"x2="0"y2="1">
 <stop offset="5%"stopColor="#6366f1"stopOpacity={0.3}/>
 <stop offset="95%"stopColor="#6366f1"stopOpacity={0}/>
 </linearGradient>
 </defs>
 <CartesianGrid strokeDasharray="3 3"vertical={false} stroke="rgba(255,255,255,0.05)"/>
 <XAxis dataKey="name"axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b', fontWeight: 900}} />
 <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b', fontWeight: 900}} />
 <Tooltip 
 contentStyle={{ 
 backgroundColor: 'rgba(2, 2, 3, 0.9)',
 backdropFilter: 'blur(10px)',
 border: '1px solid rgba(255, 255, 255, 0.1)',
 borderRadius: '12px'
}}
 />
 <Area type="monotone"dataKey="count"stroke="#6366f1"fillOpacity={1} fill="url(#colorCount)"/>
 </AreaChart>
 </ResponsiveContainer>
 </div>
 </Card>

 {/* Department Distribution */}
 <Card variant="glass"className="p-8 border border-white/5">
 <div className="flex justify-between items-center mb-8">
 <h2 className="text-[10px] font-black text-white uppercase tracking-[0.2em]">Departmental Distribution</h2>
 </div>
 <div className="h-[300px] w-full flex items-center">
 <ResponsiveContainer width="100%"height="100%">
 <PieChart>
 <Pie
 data={departmentDistribution}
 cx="50%"
 cy="50%"
 innerRadius={60}
 outerRadius={100}
 paddingAngle={5}
 dataKey="value"
 >
 {departmentDistribution.map((entry, index) => (
 <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="rgba(255,255,255,0.1)"/>
 ))}
 </Pie>
 <Tooltip 
 contentStyle={{ 
 backgroundColor: 'rgba(2, 2, 3, 0.9)',
 backdropFilter: 'blur(10px)',
 border: '1px solid rgba(255, 255, 255, 0.1)',
 borderRadius: '12px'
}}
 />
 <Legend 
 verticalAlign="middle"
 align="right"
 layout="vertical"
 iconType="circle"
 wrapperStyle={{ fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', paddingLeft: '20px'}} 
 />
 </PieChart>
 </ResponsiveContainer>
 </div>
 </Card>

 {/* Awarded Chart */}
 <Card variant="glass"className="p-8 border border-white/5">
 <div className="flex justify-between items-center mb-8">
 <h2 className="text-[10px] font-black text-white uppercase tracking-[0.2em]">Excellence Distribution</h2>
 </div>
 <div className="h-[200px] w-full">
 {awardedData.length > 0 ? (
 <ResponsiveContainer width="100%"height="100%">
 <BarChart data={awardedData} layout="vertical">
 <XAxis type="number"hide />
 <YAxis dataKey="name"type="category"hide />
 <Tooltip 
 contentStyle={{ 
 backgroundColor: 'rgba(2, 2, 3, 0.9)',
 backdropFilter: 'blur(10px)',
 border: '1px solid rgba(255, 255, 255, 0.1)',
 borderRadius: '12px'
}}
 />
 <Bar dataKey="value"fill="rgba(99, 102, 241, 0.6)"radius={[0, 4, 4, 0]} barSize={24} />
 </BarChart>
 </ResponsiveContainer>
 ) : (
 <div className="h-full flex items-center justify-center text-[10px] font-black text-slate-600 uppercase tracking-[0.3em] italic">No Awards Recorded</div>
 )}
 </div>
 </Card>
 </div>

 {/* Right Side Widgets */}
 <div className="space-y-8">
 {/* Leave Application */}
 <Card variant="glass"className="border border-white/5 overflow-hidden p-0">
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
 <Link to="/leave"className="block w-full text-center text-[10px] font-black text-indigo-400 uppercase tracking-widest mt-4 hover:text-indigo-300 transition-colors">Full Registry Access →</Link>
 </div>
 </Card>

 {/* New Recruitment */}
 <Card variant="glass"className="border border-white/5 overflow-hidden p-0">
 <div className="p-6 border-b border-white/5">
 <h2 className="text-[10px] font-black text-white uppercase tracking-[0.2em]">New Personnel</h2>
 </div>
 <div className="p-6 space-y-6">
 {recentRecruits.map((rec, i) => (
 <div key={rec.id} className="flex items-center justify-between gap-4 group">
 <div className="flex items-center gap-4">
 <img src={rec.avatar ||`https://picsum.photos/seed/rec${rec.id}/40/40`} className="w-10 h-10 rounded-xl object-cover border border-white/5 group-hover:border-white/20 transition-all"referrerPolicy="no-referrer"/>
 <div>
 <div className="text-xs font-black text-white uppercase tracking-tight">{rec.name}</div>
 <div className="text-[10px] text-slate-500 uppercase tracking-widest mt-1">Joined: {rec.joiningDate}</div>
 </div>
 </div>
 <Link to="/employees"className="text-[9px] font-black text-emerald-400 uppercase tracking-widest bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20 hover:bg-emerald-500/20 transition-all">Profile</Link>
 </div>
 ))}
 {recentRecruits.length === 0 && (
 <div className="text-center py-6 text-[10px] font-black text-slate-600 uppercase tracking-widest italic">No New Personnel</div>
 )}
 <Link to="/employees"className="block w-full text-center text-[10px] font-black text-slate-500 uppercase tracking-widest mt-4 hover:text-slate-400 transition-colors">Expand View</Link>
 </div>
 </Card>

 {/* Notice Board Widget */}
 <Card variant="glass"className="border border-white/5 overflow-hidden p-0">
 <div className="p-6 border-b border-white/5 flex justify-between items-center">
 <h2 className="text-[10px] font-black text-white uppercase tracking-[0.2em]">Notice Board</h2>
 <Link to="/notice"className="text-[10px] font-black text-indigo-400 uppercase tracking-widest hover:text-indigo-300 transition-colors">View All</Link>
 </div>
 <div className="p-6 space-y-6">
 {recentNotices.map((notice, i) => (
 <div key={notice.id} className="flex items-start gap-4 p-3 rounded-2xl hover:bg-white/5 transition-all cursor-pointer group">
 <div className="bg-indigo-500/10 p-3 rounded-xl border border-indigo-500/20 group-hover:bg-indigo-500/20 transition-all">
 <Bell className="w-4 h-4 text-indigo-400"/>
 </div>
 <div className="min-w-0">
 <div className="text-xs font-black text-white uppercase tracking-tight truncate group-hover:text-indigo-400 transition-colors">{notice.description}</div>
 <div className="flex items-center gap-2 mt-1">
 <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{notice.type}</span>
 <span className="text-[9px] text-slate-700">•</span>
 <span className="text-[9px] text-slate-500 uppercase tracking-widest">{notice.date}</span>
 </div>
 </div>
 </div>
 ))}
 {recentNotices.length === 0 && (
 <div className="text-center py-6 text-[10px] font-black text-slate-600 uppercase tracking-widest italic">No Active Notices</div>
 )}
 </div>
 </Card>

 {/* Loan Payment Received */}
 <Card variant="glass"className="border border-white/5 overflow-hidden p-0">
 <div className="p-6 border-b border-white/5">
 <h2 className="text-[10px] font-black text-white uppercase tracking-[0.2em]">Financial Liquidity</h2>
 </div>
 <div className="p-8 flex flex-col items-center">
 <div className="h-40 w-full">
 <ResponsiveContainer width="100%"height="100%">
 <PieChart>
 <Pie
 data={[{ value: totalLoanAmount || 1}]}
 cx="50%"
 cy="100%"
 startAngle={180}
 endAngle={0}
 innerRadius={60}
 outerRadius={80}
 paddingAngle={0}
 dataKey="value"
 >
 <Cell fill="rgba(16, 185, 129, 0.4)"stroke="rgba(16, 185, 129, 0.6)"/>
 </Pie>
 </PieChart>
 </ResponsiveContainer>
 </div>
 <div className="text-center -mt-8">
 <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Total Loan Volume</div>
 <div className="text-3xl font-black text-white tracking-tighter">{formatCurrency(totalLoanAmount || 0)}</div>
 </div>
 </div>
 </Card>
 </div>
 </div>
 </div>
 </AdminLayout>
 );
}

