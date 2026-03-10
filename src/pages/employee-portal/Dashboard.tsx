import React from 'react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import EmployeeLayout from '../../components/EmployeeLayout';
import { Clock, Calendar, FileText, Bell, CheckCircle2, User, Mail, Phone, MapPin, Briefcase, Hash } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { useEmployees } from '../../context/EmployeeContext';
import { useLeaves } from '../../context/LeaveContext';
import { useChat } from '../../context/ChatContext';
import { useCompanyData } from '../../context/CompanyDataContext';
import { TimeTrackerWidget } from '../../components/employee/TimeTrackerWidget';

export default function EmployeeDashboard() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { user } = useAuth();
  const { employees } = useEmployees();
  const { getEmployeeLeaves } = useLeaves();
  const { invitations, acceptInvitation, rejectInvitation } = useChat();
  const { notices, tasks } = useCompanyData();
  const isDark = theme === 'dark';

  const currentEmployee = employees.find(emp => emp.id === user?.id);
  const myLeaves = user ? getEmployeeLeaves(user.employeeId || user.id) : [];
  const latestLeave = myLeaves[0];

  const pendingTasksCount = tasks.filter(t => t.assignee === user?.name && t.status !== 'Done').length;
  const newNoticesCount = notices.filter(n => new Date(n.date) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length;
  const recentNotices = notices.slice(0, 3);

  return (
    <EmployeeLayout>
      <div className="space-y-8">
        <div>
          <h1 className={`text-3xl font-black ${isDark ? 'text-white' : 'text-slate-900'} uppercase tracking-tighter`}>Welcome back, {user?.name || 'Employee'}!</h1>
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mt-1">Terminal Status: Operational</p>
        </div>

        {/* Notifications */}
        {currentEmployee?.notifications && currentEmployee.notifications.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`glass-card p-6 border ${isDark ? 'border-white/5' : 'border-slate-200'}`}
          >
            <h3 className={`text-[10px] font-black ${isDark ? 'text-white' : 'text-slate-900'} uppercase tracking-[0.2em] mb-6 flex items-center gap-2`}>
              <Bell className="w-4 h-4 text-indigo-400" />
              System Notifications
            </h3>
            <div className="space-y-4">
              {currentEmployee.notifications.map((notification, idx) => (
                <div key={idx} className={`flex items-center justify-between p-4 ${isDark ? 'bg-white/5 border-white/5' : 'bg-slate-100 border-slate-200'} rounded-xl border group hover:bg-white/10 transition-all`}>
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                      <Bell className="w-5 h-5" />
                    </div>
                    <div>
                      <p className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        {notification}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Chat Invitations */}
        {invitations.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`glass-card p-6 border ${isDark ? 'border-white/5' : 'border-slate-200'}`}
          >
            <h3 className={`text-[10px] font-black ${isDark ? 'text-white' : 'text-slate-900'} uppercase tracking-[0.2em] mb-6 flex items-center gap-2`}>
              <Mail className="w-4 h-4 text-indigo-400" />
              Incoming Communications
            </h3>
            <div className="space-y-4">
              {invitations.map(invite => {
                const sender = employees.find(e => e.id === invite.fromUserId);
                return (
                  <div key={invite.id} className={`flex items-center justify-between p-4 ${isDark ? 'bg-white/5 border-white/5' : 'bg-slate-100 border-slate-200'} rounded-xl border group hover:bg-white/10 transition-all`}>
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 font-black text-xl">
                        {sender?.name?.charAt(0) || '?'}
                      </div>
                      <div>
                        <p className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                          {invite.type === 'group' 
                            ? `Invited to group "${invite.groupName || 'Unknown Group'}"` 
                            : `Message request from ${sender?.name || 'Unknown User'}`}
                        </p>
                        <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-1">
                          {invite.timestamp?.toDate ? new Date(invite.timestamp.toDate()).toLocaleDateString() : 'Just now'}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <button 
                        onClick={() => acceptInvitation(invite)}
                        className="px-4 py-2 text-[10px] font-black uppercase tracking-widest bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 rounded-lg border border-emerald-500/20 transition-all"
                      >
                        Accept
                      </button>
                      <button 
                        onClick={() => rejectInvitation(invite.id)}
                        className="px-4 py-2 text-[10px] font-black uppercase tracking-widest bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-lg border border-red-500/20 transition-all"
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

        {/* Employee Profile Card */}
        {currentEmployee && (
          <div className="glass-card p-8 border border-white/5">
            <h2 className="text-[10px] font-black text-white uppercase tracking-[0.2em] mb-8 flex items-center gap-2">
              <User className="w-4 h-4 text-indigo-400" />
              Identity Profile
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="space-y-2">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  <Hash className="w-3 h-3" /> Node ID
                </p>
                <p className="text-lg font-black text-white tracking-tight">{currentEmployee.employeeId}</p>
              </div>
              <div className="space-y-2">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  <Briefcase className="w-3 h-3" /> Sector
                </p>
                <p className="text-lg font-black text-white tracking-tight">{currentEmployee.department}</p>
              </div>
              <div className="space-y-2">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  <User className="w-3 h-3" /> Designation
                </p>
                <p className="text-lg font-black text-white tracking-tight">{currentEmployee.designation}</p>
              </div>
              <div className="space-y-2">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  <Calendar className="w-3 h-3" /> Initialization
                </p>
                <p className="text-lg font-black text-white tracking-tight">{currentEmployee.joiningDate}</p>
              </div>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <TimeTrackerWidget />
          <div className="glass-card p-8 border border-white/5">
            <h3 className="text-[10px] font-black text-white uppercase tracking-[0.2em] mb-8">Rapid Access</h3>
            <div className="grid grid-cols-2 gap-6">
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate('/employee-portal/attendance')}
                className="flex flex-col items-center justify-center p-6 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 text-emerald-400 hover:bg-emerald-500/10 transition-all"
              >
                <Clock className="w-8 h-8 mb-3" />
                <span className="text-[10px] font-black uppercase tracking-widest">Attendance</span>
              </motion.button>
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate('/employee-portal/leaves')}
                className="flex flex-col items-center justify-center p-6 rounded-2xl border border-blue-500/20 bg-blue-500/5 text-blue-400 hover:bg-blue-500/10 transition-all"
              >
                <Calendar className="w-8 h-8 mb-3" />
                <span className="text-[10px] font-black uppercase tracking-widest">Apply Leave</span>
              </motion.button>
            </div>
          </div>

          <div className="glass-card p-8 border border-white/5">
            <h3 className="text-[10px] font-black text-white uppercase tracking-[0.2em] mb-8">Daily Metrics</h3>
            <div className="grid grid-cols-2 gap-6">
              <div className="p-5 bg-white/5 rounded-2xl border border-white/5">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Active Tasks</p>
                <p className="text-3xl font-black text-white tracking-tighter">{pendingTasksCount}</p>
              </div>
              <div className="p-5 bg-white/5 rounded-2xl border border-white/5">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">New Notices</p>
                <p className="text-3xl font-black text-white tracking-tighter">{newNoticesCount}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Notices */}
          <div className="glass-card border border-white/5 overflow-hidden">
            <div className="p-6 border-b border-white/5 flex justify-between items-center">
              <h3 className="text-[10px] font-black text-white uppercase tracking-[0.2em]">Broadcast Feed</h3>
              <button onClick={() => navigate('/employee-portal/notices')} className="text-[10px] font-black text-indigo-400 uppercase tracking-widest hover:text-indigo-300">View All</button>
            </div>
            <div className="divide-y divide-white/[0.02]">
              {recentNotices.map((notice, i) => (
                <div key={i} className="p-6 hover:bg-white/[0.02] transition-colors cursor-pointer flex gap-5">
                  <div className={`p-3 rounded-xl shrink-0 h-fit border ${
                    notice.type === 'Event' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                    notice.type === 'Policy' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                    'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                  }`}>
                    <Bell className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-sm uppercase tracking-tight">{notice.type}</h4>
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-1">{notice.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* My Leave Status */}
          <div className="glass-card border border-white/5 overflow-hidden">
            <div className="p-6 border-b border-white/5 flex justify-between items-center">
              <h3 className="text-[10px] font-black text-white uppercase tracking-[0.2em]">Leave Protocol</h3>
              <button onClick={() => navigate('/employee-portal/leaves')} className="text-[10px] font-black text-indigo-400 uppercase tracking-widest hover:text-indigo-300">New Request</button>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {latestLeave ? (
                  <div className="flex items-center justify-between p-5 bg-white/5 border border-white/5 rounded-2xl">
                    <div className="flex items-center gap-4">
                      <div className={`w-3 h-3 rounded-full shadow-lg ${
                        latestLeave.status === 'Approved' ? 'bg-emerald-500 shadow-emerald-500/20' :
                        latestLeave.status === 'Rejected' ? 'bg-red-500 shadow-red-500/20' : 'bg-amber-500 shadow-amber-500/20'
                      }`}></div>
                      <div>
                        <p className="text-sm font-bold text-white uppercase tracking-tight">{latestLeave.type}</p>
                        <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-1">{latestLeave.startDate} — {latestLeave.endDate}</p>
                      </div>
                    </div>
                    <span className={`px-4 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-full border ${
                      latestLeave.status === 'Approved' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                      latestLeave.status === 'Rejected' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                      'bg-amber-500/10 text-amber-400 border-amber-500/20'
                    }`}>
                      {latestLeave.status}
                    </span>
                  </div>
                ) : (
                  <p className="text-[10px] text-slate-500 uppercase tracking-[0.2em] text-center py-8">No active protocols found.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </EmployeeLayout>
  );
}
