import React from 'react';
import { useNavigate } from 'react-router-dom';
import EmployeeLayout from '../../components/EmployeeLayout';
import { Clock, Calendar, FileText, Bell, CheckCircle2, User, Mail, Phone, MapPin, Briefcase, Hash } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { useEmployees } from '../../context/EmployeeContext';
import { useLeaves } from '../../context/LeaveContext';

export default function EmployeeDashboard() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { user } = useAuth();
  const { employees } = useEmployees();
  const { getEmployeeLeaves } = useLeaves();
  const isDark = theme === 'dark';

  const currentEmployee = employees.find(emp => emp.id === user?.id);
  const myLeaves = user ? getEmployeeLeaves(user.employeeId || user.id) : [];
  const latestLeave = myLeaves[0];

  return (
    <EmployeeLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Welcome back, {user?.name || 'Employee'}!</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Here is what's happening today.</p>
        </div>

        {/* Employee Profile Card */}
        {currentEmployee && (
          <div className={`p-6 rounded-xl border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} shadow-sm`}>
            <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-indigo-500" />
              My Profile
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="space-y-1">
                <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                  <Hash className="w-3 h-3" /> Employee ID
                </p>
                <p className="font-medium text-slate-900 dark:text-white">{currentEmployee.employeeId}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                  <Briefcase className="w-3 h-3" /> Department
                </p>
                <p className="font-medium text-slate-900 dark:text-white">{currentEmployee.department}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                  <User className="w-3 h-3" /> Designation
                </p>
                <p className="font-medium text-slate-900 dark:text-white">{currentEmployee.designation}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                  <Calendar className="w-3 h-3" /> Joining Date
                </p>
                <p className="font-medium text-slate-900 dark:text-white">{currentEmployee.joiningDate}</p>
              </div>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className={`p-6 rounded-xl border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} shadow-sm`}>
            <h3 className="font-bold text-slate-800 dark:text-white mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={() => navigate('/employee-portal/attendance')}
                className="flex flex-col items-center justify-center p-4 rounded-xl border border-emerald-100 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-all dark:bg-emerald-900/20 dark:border-emerald-800 dark:text-emerald-400 dark:hover:bg-emerald-900/40"
              >
                <Clock className="w-6 h-6 mb-2" />
                <span className="text-sm font-bold">Daily Attendance</span>
              </button>
              <button 
                onClick={() => navigate('/employee-portal/leaves')}
                className="flex flex-col items-center justify-center p-4 rounded-xl border border-blue-100 bg-blue-50 text-blue-700 hover:bg-blue-100 transition-all dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-400 dark:hover:bg-blue-900/40"
              >
                <Calendar className="w-6 h-6 mb-2" />
                <span className="text-sm font-bold">Apply Leave</span>
              </button>
            </div>
          </div>

          <div className={`p-6 rounded-xl border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} shadow-sm`}>
            <h3 className="font-bold text-slate-800 dark:text-white mb-4">Today's Stats</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-100 dark:border-slate-700">
                <p className="text-xs text-slate-500 dark:text-slate-400">Pending Tasks</p>
                <p className="text-xl font-bold text-slate-900 dark:text-white">5</p>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-100 dark:border-slate-700">
                <p className="text-xs text-slate-500 dark:text-slate-400">Unread Notices</p>
                <p className="text-xl font-bold text-slate-900 dark:text-white">2</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Notices */}
          <div className={`rounded-xl border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} shadow-sm overflow-hidden`}>
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <h3 className="font-bold text-slate-800 dark:text-white">Recent Notices</h3>
              <button className="text-sm text-emerald-600 dark:text-emerald-400 hover:underline">View All</button>
            </div>
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {[
                { title: 'Company Townhall Meeting', date: 'Today, 2:00 PM', type: 'Event' },
                { title: 'Updated Leave Policy', date: 'Yesterday', type: 'Policy' },
                { title: 'Public Holiday Announcement', date: '2 days ago', type: 'Announcement' }
              ].map((notice, i) => (
                <div key={i} className="p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer flex gap-4">
                  <div className={`p-2 rounded-lg shrink-0 h-fit ${
                    notice.type === 'Event' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' :
                    notice.type === 'Policy' ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400' :
                    'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400'
                  }`}>
                    <Bell className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-medium text-slate-800 dark:text-white text-sm">{notice.title}</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{notice.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* My Leave Status */}
          <div className={`rounded-xl border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} shadow-sm overflow-hidden`}>
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <h3 className="font-bold text-slate-800 dark:text-white">My Leave Status</h3>
              <button onClick={() => navigate('/employee-portal/leaves')} className="text-sm text-emerald-600 dark:text-emerald-400 hover:underline">Apply Leave</button>
            </div>
            <div className="p-4">
              <div className="space-y-4">
                {latestLeave ? (
                  <div className="flex items-center justify-between p-3 border border-slate-200 dark:border-slate-700 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${
                        latestLeave.status === 'Approved' ? 'bg-emerald-500' :
                        latestLeave.status === 'Rejected' ? 'bg-red-500' : 'bg-amber-500'
                      }`}></div>
                      <div>
                        <p className="text-sm font-medium text-slate-800 dark:text-white">{latestLeave.type}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{latestLeave.startDate} - {latestLeave.endDate}</p>
                      </div>
                    </div>
                    <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${
                      latestLeave.status === 'Approved' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                      latestLeave.status === 'Rejected' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                      'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                    }`}>
                      {latestLeave.status}
                    </span>
                  </div>
                ) : (
                  <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-4">No leave requests found.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </EmployeeLayout>
  );
}
