import React, { useState, useMemo } from 'react';
import EmployeeLayout from '../../components/EmployeeLayout';
import { Calendar, Plus, Clock, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useLeaves } from '../../context/LeaveContext';
import { useAuth } from '../../context/AuthContext';

export default function EmployeeLeaves() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const { applyLeave, getEmployeeLeaves, leaveTypes, leaveRequests } = useLeaves();
  const isDark = theme === 'dark';
  const [isApplying, setIsApplying] = useState(false);

  const [formData, setFormData] = useState({
    type: '',
    startDate: '',
    endDate: '',
    reason: ''
  });

  const leaveBalances = useMemo(() => {
    if (!user) return [];
    
    const colors = ['emerald', 'amber', 'blue', 'purple', 'pink', 'indigo', 'cyan', 'teal'];
    
    return leaveTypes.map((type, index) => {
      const used = leaveRequests
        .filter(req => (req.employeeId === (user.employeeId || user.id)) && req.type === type.name && req.status === 'Approved')
        .reduce((acc, req) => acc + req.days, 0);
      
      return {
        type: type.name,
        total: type.days,
        used,
        available: type.days - used,
        color: colors[index % colors.length]
      };
    });
  }, [leaveTypes, leaveRequests, user]);

  const leaveHistory = user ? getEmployeeLeaves(user.employeeId || user.id) : [];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!formData.type || !formData.startDate || !formData.endDate || !formData.reason) {
      alert('Please fill in all fields');
      return;
    }

    const start = new Date(formData.startDate);
    const end = new Date(formData.endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    applyLeave({
      employeeId: user.employeeId || user.id,
      employeeName: user.name,
      type: formData.type,
      startDate: formData.startDate,
      endDate: formData.endDate,
      days: diffDays,
      reason: formData.reason
    });

    alert('Leave request submitted successfully!');
    setIsApplying(false);
    setFormData({ type: '', startDate: '', endDate: '', reason: '' });
  };

  return (
    <EmployeeLayout>
      <div className={`min-h-screen -m-4 md:-m-8 p-4 md:p-8 transition-colors duration-500 ${isDark ? 'bg-slate-950 text-white' : 'bg-slate-50 text-slate-900'}`}>
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header Section */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Leave Management</h1>
              <p className="text-slate-500 dark:text-slate-400 mt-1">Manage your leave requests and track your available balances.</p>
            </div>
            <button 
              onClick={() => setIsApplying(true)}
              className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/20"
            >
              <Plus className="w-4 h-4" />
              Apply for Leave
            </button>
          </div>

          {/* Leave Balances */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {leaveBalances.map((balance, index) => (
              <div key={index} className={`p-6 rounded-2xl border ${isDark ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-200 shadow-sm'} relative overflow-hidden group hover:border-indigo-500/30 transition-all duration-300`}>
                <div className={`absolute top-0 left-0 w-1.5 h-full bg-${balance.color}-500 opacity-50 group-hover:opacity-100 transition-opacity`}></div>
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="font-bold text-slate-800 dark:text-white uppercase tracking-wider text-xs">{balance.type}</h3>
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-1">Annual Allocation</p>
                  </div>
                  <div className={`p-2.5 rounded-xl bg-${balance.color}-500/10 text-${balance.color}-600 dark:text-${balance.color}-400`}>
                    <Calendar className="w-5 h-5" />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="text-center p-2 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                    <p className="text-lg font-bold">{balance.total}</p>
                    <p className="text-[10px] text-slate-500 uppercase tracking-tighter">Total</p>
                  </div>
                  <div className="text-center p-2 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                    <p className="text-lg font-bold">{balance.used}</p>
                    <p className="text-[10px] text-slate-500 uppercase tracking-tighter">Used</p>
                  </div>
                  <div className={`text-center p-2 rounded-lg bg-${balance.color}-500/5 border border-${balance.color}-500/10`}>
                    <p className={`text-lg font-bold text-${balance.color}-600 dark:text-${balance.color}-400`}>{balance.available}</p>
                    <p className="text-[10px] text-slate-500 uppercase tracking-tighter">Left</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Leave Application Form */}
          {isApplying && (
            <div className={`p-8 rounded-3xl border ${isDark ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-200 shadow-sm'} backdrop-blur-xl`}>
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h3 className="text-xl font-bold">New Leave Request</h3>
                  <p className="text-sm text-slate-500">Please provide the details for your leave application.</p>
                </div>
                <button onClick={() => setIsApplying(false)} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                  <XCircle className="w-6 h-6 text-slate-400" />
                </button>
              </div>
              
              <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Leave Category</label>
                  <select 
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className={`w-full p-3.5 border rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition-all ${isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-900'}`}
                  >
                    <option value="">Choose Category</option>
                    {leaveTypes.map(type => (
                      <option key={type.id} value={type.name}>{type.name}</option>
                    ))}
                  </select>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Start Date</label>
                    <input 
                      type="date" 
                      value={formData.startDate}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                      className={`w-full p-3.5 border rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition-all ${isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-900'}`} 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">End Date</label>
                    <input 
                      type="date" 
                      value={formData.endDate}
                      onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                      className={`w-full p-3.5 border rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition-all ${isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-900'}`} 
                    />
                  </div>
                </div>

                <div className="md:col-span-2 space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Reason for Leave</label>
                  <textarea 
                    rows={4} 
                    value={formData.reason}
                    onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                    className={`w-full p-4 border rounded-2xl text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition-all ${isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-900'}`}
                    placeholder="Describe the reason for your leave request..."
                  ></textarea>
                </div>

                <div className="md:col-span-2 flex justify-end gap-4 pt-4">
                  <button 
                    type="button"
                    onClick={() => setIsApplying(false)}
                    className="px-6 py-3 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 rounded-xl text-sm font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
                  >
                    Discard
                  </button>
                  <button 
                    type="submit"
                    className="px-8 py-3 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/20"
                  >
                    Submit Application
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Leave History Table */}
          <div className={`rounded-3xl border ${isDark ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-200 shadow-sm'} overflow-hidden`}>
            <div className="p-8 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold">Leave History</h3>
                <p className="text-sm text-slate-500">A record of your past and pending leave requests.</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-500">{leaveHistory.length} Total Requests</span>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
                    {['Category', 'Duration', 'Days', 'Reason', 'Status'].map((h) => (
                      <th key={h} className="px-8 py-4 text-[10px] font-bold uppercase tracking-wider text-slate-500">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {leaveHistory.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-8 py-20 text-center">
                        <Calendar className="w-12 h-12 mx-auto mb-4 opacity-10" />
                        <p className="text-sm font-medium text-slate-400">No leave history found</p>
                      </td>
                    </tr>
                  ) : (
                    leaveHistory.map((leave) => (
                      <tr key={leave.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                        <td className="px-8 py-5">
                          <span className="text-sm font-bold">{leave.type}</span>
                        </td>
                        <td className="px-8 py-5">
                          <div className="flex items-center gap-2 text-xs text-slate-500">
                            <span className="font-mono">{leave.startDate}</span>
                            <span className="text-slate-300">→</span>
                            <span className="font-mono">{leave.endDate}</span>
                          </div>
                        </td>
                        <td className="px-8 py-5">
                          <span className="px-2 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-xs font-bold font-mono">
                            {leave.days}d
                          </span>
                        </td>
                        <td className="px-8 py-5">
                          <p className="text-xs text-slate-600 dark:text-slate-400 truncate max-w-[240px]">{leave.reason}</p>
                        </td>
                        <td className="px-8 py-5">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            leave.status === 'Approved' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                            leave.status === 'Pending' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                            'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                          }`}>
                            {leave.status === 'Approved' && <CheckCircle2 className="w-3.5 h-3.5" />}
                            {leave.status === 'Pending' && <Clock className="w-3.5 h-3.5" />}
                            {leave.status === 'Rejected' && <XCircle className="w-3.5 h-3.5" />}
                            {leave.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </EmployeeLayout>
  );
}
