import React, { useState, useEffect} from 'react';
import { motion} from 'motion/react';
import { useNavigate} from 'react-router-dom';
import EmployeeLayout from '../../components/EmployeeLayout';
import { Clock, Calendar, FileText, Bell, CheckCircle2, User, Mail, Phone, MapPin, Briefcase, Hash, Check, X} from 'lucide-react';
import { useAuth} from '../../context/AuthContext';
import { useEmployees} from '../../context/EmployeeContext';
import { useLeaves} from '../../context/LeaveContext';
import { useChat} from '../../context/ChatContext';
import { useCompanyData} from '../../context/CompanyDataContext';
import { TimeTrackerWidget} from '../../components/employee/TimeTrackerWidget';
import { DashboardNotes, Note} from '../../components/employee/DashboardNotes';
import { DashboardCalendar} from '../../components/employee/DashboardCalendar';

export default function EmployeeDashboard() {
 const navigate = useNavigate();
 const { user} = useAuth();
 const { employees, updateEmployee} = useEmployees();
 const { getEmployeeLeaves} = useLeaves();
 const { invitations, acceptInvitation, rejectInvitation} = useChat();
 const { notices, tasks, clearNotices, tickets, updateEntity} = useCompanyData();
 
 // Notes state
 const [notes, setNotes] = useState<Note[]>(() => {
 const saved = localStorage.getItem(`employee_notes_${user?.id}`);
 return saved ? JSON.parse(saved) : [];
});

 useEffect(() => {
 if (user?.id) {
 localStorage.setItem(`employee_notes_${user.id}`, JSON.stringify(notes));
}
}, [notes, user?.id]);

 const handleClearNotices = async () => {
 if (window.confirm('Are you sure you want to clear all notices?')) {
 await clearNotices();
}
};

 const handleAccept = async (notification: string) => {
 if (!currentEmployee) return;
 const updatedNotifications = currentEmployee.notifications?.filter(n => n !== notification) || [];
 await updateEmployee(currentEmployee.id, { notifications: updatedNotifications});
};

 const handleReject = async (notification: string) => {
 if (!currentEmployee) return;
 const updatedNotifications = currentEmployee.notifications?.filter(n => n !== notification) || [];
 await updateEmployee(currentEmployee.id, { notifications: updatedNotifications});
};

 const currentEmployee = employees.find(emp => emp.id === user?.id);
 const myLeaves = user ? getEmployeeLeaves(user.employeeId || user.id) : [];
 const latestLeave = myLeaves[0];

 const pendingTasksCount = tasks.filter(t => t.assignee === user?.name && t.status !== 'Done').length;
 const myTickets = tickets.filter(t => t.assignedTo === user?.name && t.status !== 'Resolved' && t.status !== 'Closed');
 
 const handleSolveTicket = async (ticketId: string) => {
 await updateEntity('tickets', ticketId, { status: 'Resolved'});
};
 const newNoticesCount = notices.filter(n => new Date(n.date) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length;
 const recentNotices = notices.slice(0, 3);

 return (
 <EmployeeLayout>
 <div className="space-y-10">
 {/* Welcome Section - SaaS Style */}
 <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 pb-8 border-b border-slate-100">
 <div className="space-y-2">
 <h1 className={`text-4xl font-bold tracking-tight text-slate-900`}>
 Welcome back, <span className="text-indigo-600">{user?.name?.split(' ')[0] || 'Employee'}</span>!
 </h1>
 <p className="text-slate-500 font-medium text-lg">Here's what's happening with your workspace today.</p>
 </div>
 <div className="flex items-center gap-4">
 <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border bg-emerald-50 border-emerald-100 text-emerald-600 text-xs font-bold uppercase tracking-wider`}>
 <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
 System Operational
 </div>
 <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border bg-slate-50 border-slate-100 text-slate-600 text-xs font-bold uppercase tracking-wider`}>
 <Clock className="w-4 h-4"/>
 {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric'})}
 </div>
 </div>
 </div>

 {/* Notifications & Invitations */}
 {(currentEmployee?.notifications?.length || 0) > 0 || invitations.length > 0 ? (
 <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
 {currentEmployee?.notifications && currentEmployee.notifications.length > 0 && (
 <motion.div 
 initial={{ opacity: 0, y: 10}}
 animate={{ opacity: 1, y: 0}}
 className={`p-8 rounded-3xl border bg-white border-slate-100 shadow-xl shadow-slate-200/50`}
 >
 <div className="flex items-center justify-between mb-8">
 <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
 <Bell className="w-4 h-4 text-indigo-500"/>
 Recent Notifications
 </h3>
 <span className="px-2 py-1 rounded-lg bg-indigo-500/10 text-indigo-600 text-[10px] font-bold">{currentEmployee.notifications.length}</span>
 </div>
 <div className="space-y-4">
 {currentEmployee.notifications.map((notification, idx) => (
 <div key={idx} className={`flex items-center justify-between p-5 rounded-2xl border transition-all bg-slate-50/50 border-slate-100 hover:border-indigo-500/30`}>
 <div className="flex items-center gap-4">
 <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-500">
 <Bell className="w-5 h-5"/>
 </div>
 <p className={`text-sm font-bold text-slate-700`}>{notification}</p>
 </div>
 <div className="flex gap-2">
 <button onClick={() => handleAccept(notification)} className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 transition-all">
 <Check className="w-5 h-5"/>
 </button>
 <button onClick={() => handleReject(notification)} className="p-2 rounded-xl bg-rose-500/10 text-rose-600 hover:bg-rose-500/20 transition-all">
 <X className="w-5 h-5"/>
 </button>
 </div>
 </div>
 ))}
 </div>
 </motion.div>
 )}

 {invitations.length > 0 && (
 <motion.div 
 initial={{ opacity: 0, y: 10}}
 animate={{ opacity: 1, y: 0}}
 className={`p-8 rounded-3xl border bg-white border-slate-100 shadow-xl shadow-slate-200/50`}
 >
 <div className="flex items-center justify-between mb-8">
 <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
 <Mail className="w-4 h-4 text-indigo-500"/>
 Message Requests
 </h3>
 <span className="px-2 py-1 rounded-lg bg-indigo-500/10 text-indigo-600 text-[10px] font-bold">{invitations.length}</span>
 </div>
 <div className="space-y-4">
 {invitations.map(invite => {
 const sender = employees.find(e => e.id === invite.fromUserId);
 return (
 <div key={invite.id} className={`flex items-center justify-between p-5 rounded-2xl border transition-all bg-slate-50/50 border-slate-100 hover:border-indigo-500/30`}>
 <div className="flex items-center gap-4">
 <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold text-xl shadow-lg shadow-indigo-500/20">
 {sender?.name?.charAt(0) || '?'}
 </div>
 <div>
 <p className={`text-sm font-bold text-slate-700`}>
 {invite.type === 'group' 
 ?`Group: ${invite.groupName || 'Unknown'}`
 : sender?.name || 'Unknown User'}
 </p>
 <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">
 {invite.timestamp?.toDate ? new Date(invite.timestamp.toDate()).toLocaleDateString() : 'Just now'}
 </p>
 </div>
 </div>
 <div className="flex gap-2">
 <button 
 onClick={() => acceptInvitation(invite)}
 className="px-5 py-2 text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-700 rounded-xl transition-all shadow-lg shadow-indigo-500/20 active:scale-95"
 >
 Accept
 </button>
 <button 
 onClick={() => rejectInvitation(invite.id)}
 className={`px-5 py-2 text-xs font-bold rounded-xl transition-all bg-slate-100 text-slate-600 hover:bg-slate-200`}
 >
 Reject
 </button>
 </div>
 </div>
 );
})}
 </div>
 </motion.div>
 )}
 </div>
 ) : null}

 {/* Profile & Metrics Grid */}
 <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
 {/* Profile Card */}
 {currentEmployee && (
 <div className={`lg:col-span-2 p-10 rounded-3xl border bg-white border-slate-100 shadow-xl shadow-slate-200/50 relative overflow-hidden group`}>
 <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/5 rounded-full -mr-48 -mt-48 blur-3xl group-hover:bg-indigo-600/10 transition-colors"></div>
 <div className="flex items-center justify-between mb-10">
 <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
 <User className="w-4 h-4 text-indigo-500"/>
 Employee Profile
 </h2>
 <div className="flex items-center gap-3">
 <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400">
 <Briefcase className="w-6 h-6"/>
 </div>
 <div>
 <p className={`text-sm font-bold text-slate-900`}>{currentEmployee.designation}</p>
 <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{currentEmployee.department}</p>
 </div>
 </div>
 </div>
 <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
 <div className="space-y-1">
 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Employee ID</p>
 <p className={`text-xl font-bold tracking-tight text-slate-900`}>{currentEmployee.employeeId}</p>
 </div>
 <div className="space-y-1">
 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Office Location</p>
 <p className={`text-xl font-bold tracking-tight text-slate-900`}>{currentEmployee.location || 'Main HQ'}</p>
 </div>
 <div className="space-y-1">
 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Reporting To</p>
 <p className={`text-xl font-bold tracking-tight text-slate-900`}>Admin</p>
 </div>
 <div className="space-y-1">
 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Joining Date</p>
 <p className={`text-xl font-bold tracking-tight text-slate-900`}>{currentEmployee.joiningDate}</p>
 </div>
 </div>
 </div>
 )}

 {/* Metrics Widget */}
 <div className={`p-10 rounded-3xl border bg-white border-slate-100 shadow-xl shadow-slate-200/50`}>
 <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-10">Daily Metrics</h3>
 <div className="grid grid-cols-1 gap-6">
 <div className={`p-6 rounded-2xl border flex items-center justify-between bg-slate-50/50 border-slate-100`}>
 <div>
 <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Active Tasks</p>
 <p className={`text-4xl font-bold tracking-tighter text-slate-900`}>{pendingTasksCount}</p>
 </div>
 <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
 <CheckCircle2 className="w-6 h-6"/>
 </div>
 </div>
 <div className={`p-6 rounded-2xl border flex items-center justify-between bg-slate-50/50 border-slate-100`}>
 <div>
 <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">New Notices</p>
 <p className={`text-4xl font-bold tracking-tighter text-slate-900`}>{newNoticesCount}</p>
 </div>
 <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
 <Bell className="w-6 h-6"/>
 </div>
 </div>
 </div>
 </div>
 </div>

 {/* Quick Access & Time Tracker */}
 <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
 <TimeTrackerWidget />
 
 <div className={`p-10 rounded-3xl border bg-white border-slate-100 shadow-xl shadow-slate-200/50`}>
 <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-10">Quick Access</h3>
 <div className="grid grid-cols-2 gap-6">
 <motion.button 
 whileHover={{ scale: 1.05, y: -4}}
 whileTap={{ scale: 0.95}}
 onClick={() => navigate('/employee-portal/attendance')}
 className={`flex flex-col items-center justify-center p-8 rounded-2xl border transition-all group bg-indigo-50 border-indigo-100 text-indigo-600 hover:bg-indigo-100`}
 >
 <Clock className="w-10 h-10 mb-4 group-hover:scale-110 transition-transform"/>
 <span className="text-[10px] font-bold uppercase tracking-widest">Attendance</span>
 </motion.button>
 <motion.button 
 whileHover={{ scale: 1.05, y: -4}}
 whileTap={{ scale: 0.95}}
 onClick={() => navigate('/employee-portal/leaves')}
 className={`flex flex-col items-center justify-center p-8 rounded-2xl border transition-all group bg-blue-50 border-blue-100 text-blue-600 hover:bg-blue-100`}
 >
 <Calendar className="w-10 h-10 mb-4 group-hover:scale-110 transition-transform"/>
 <span className="text-[10px] font-bold uppercase tracking-widest">Leaves</span>
 </motion.button>
 </div>
 </div>

 <div className={`p-10 rounded-3xl border bg-white border-slate-100 shadow-xl shadow-slate-200/50 relative overflow-hidden group`}>
 <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
 <Bell className="w-20 h-20 text-slate-400"/>
 </div>
 <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-10">Notice Board</h3>
 <div className="space-y-6">
 {recentNotices.map((notice, i) => (
 <div key={i} className="flex items-start gap-4 group/item cursor-pointer"onClick={() => navigate('/employee-portal/notices')}>
 <div className={`w-2 h-2 rounded-full mt-2 shrink-0 ${
 notice.type === 'Event' ? 'bg-blue-500' :
 notice.type === 'Policy' ? 'bg-amber-500' : 'bg-emerald-500'
}`}></div>
 <div>
 <h4 className={`text-sm font-bold leading-tight group-hover/item:text-indigo-600 transition-colors text-slate-800`}>{notice.type}</h4>
 <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">{notice.date}</p>
 </div>
 </div>
 ))}
 <button 
 onClick={() => navigate('/employee-portal/notices')}
 className={`w-full mt-6 py-4 text-[10px] font-bold uppercase tracking-[0.2em] border-t transition-all flex items-center justify-center gap-2 border-slate-100 text-indigo-600 hover:text-indigo-700`}
 >
 View All Notices
 <CheckCircle2 className="w-4 h-4"/>
 </button>
 </div>
 </div>
 </div>

 {/* Notes & Calendar Section */}
 <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
 <div className="lg:col-span-2">
 <DashboardNotes notes={notes} setNotes={setNotes} />
 </div>
 <div className="lg:col-span-1">
 <DashboardCalendar notes={notes} />
 </div>
 </div>

 {/* Leave Status Section */}
 <div className={`p-10 rounded-3xl border bg-white border-slate-100 shadow-xl shadow-slate-200/50`}>
 <div className="flex items-center justify-between mb-10">
 <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Leave Status</h3>
 <button onClick={() => navigate('/employee-portal/leaves')} className="text-[10px] font-bold uppercase tracking-widest text-indigo-600 hover:text-indigo-700">View History</button>
 </div>
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
 {latestLeave ? (
 <div className={`flex items-center justify-between p-8 rounded-2xl border transition-all bg-slate-50/50 border-slate-100 hover:border-indigo-500/30`}>
 <div className="flex items-center gap-5">
 <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
 latestLeave.status === 'Approved' ? 'bg-emerald-500/10 text-emerald-600' :
 latestLeave.status === 'Rejected' ? 'bg-rose-500/10 text-rose-600' : 'bg-amber-500/10 text-amber-600'
}`}>
 <Calendar className="w-6 h-6"/>
 </div>
 <div>
 <p className={`text-sm font-bold text-slate-900`}>{latestLeave.type}</p>
 <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">{latestLeave.startDate} — {latestLeave.endDate}</p>
 </div>
 </div>
 <span className={`px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest rounded-full border ${
 latestLeave.status === 'Approved' ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' :
 latestLeave.status === 'Rejected' ? 'bg-rose-500/10 text-rose-600 border-rose-500/20' :
 'bg-amber-500/10 text-amber-600 border-amber-500/20'
}`}>
 {latestLeave.status}
 </span>
 </div>
 ) : (
 <div className="lg:col-span-3 py-16 text-center border-2 border-dashed border-slate-100 rounded-3xl">
 <Calendar className="w-10 h-10 mx-auto mb-4 text-slate-300"/>
 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">No active leave requests</p>
 </div>
 )}
 </div>
 </div>

 {/* Tickets Section */}
 <div className={`p-10 rounded-3xl border bg-white border-slate-100 shadow-xl shadow-slate-200/50`}>
 <div className="flex items-center justify-between mb-10">
 <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">My Tickets</h3>
 </div>
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
 {myTickets.length > 0 ? myTickets.map(ticket => (
 <div key={ticket.id} className={`flex items-center justify-between p-8 rounded-2xl border transition-all bg-slate-50/50 border-slate-100 hover:border-indigo-500/30`}>
 <div className="flex items-center gap-5">
 <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-600 flex items-center justify-center">
 <FileText className="w-6 h-6"/>
 </div>
 <div>
 <p className={`text-sm font-bold text-slate-900`}>{ticket.ticketId}</p>
 <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">{ticket.status}</p>
 </div>
 </div>
 <button 
 onClick={() => handleSolveTicket(ticket.id)}
 className="px-4 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors text-xs font-bold"
 >
 Solved
 </button>
 </div>
 )) : (
 <div className="lg:col-span-3 py-16 text-center border-2 border-dashed border-slate-100 rounded-3xl">
 <FileText className="w-10 h-10 mx-auto mb-4 text-slate-300"/>
 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">No tickets assigned</p>
 </div>
 )}
 </div>
 </div>
 </div>
 </EmployeeLayout>
 );
}
