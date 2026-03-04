import React, { useState } from 'react';
import EmployeeLayout from '../../components/EmployeeLayout';
import { Calendar, Plus, Clock, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useLeaves } from '../../context/LeaveContext';
import { useAuth } from '../../context/AuthContext';

export default function EmployeeLeaves() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const { applyLeave, getEmployeeLeaves } = useLeaves();
  const isDark = theme === 'dark';
  const [isApplying, setIsApplying] = useState(false);

  const [formData, setFormData] = useState({
    type: '',
    startDate: '',
    endDate: '',
    reason: ''
  });

  const leaveBalances = [
    { type: 'Annual Leave', total: 20, used: 8, available: 12, color: 'emerald' },
    { type: 'Sick Leave', total: 10, used: 2, available: 8, color: 'amber' },
    { type: 'Casual Leave', total: 5, used: 5, available: 0, color: 'blue' },
  ];

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
      type: formData.type === 'annual' ? 'Annual Leave' : formData.type === 'sick' ? 'Sick Leave' : 'Casual Leave',
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
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Leave Management</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">View your leave balances and apply for new leaves.</p>
          </div>
          <button 
            onClick={() => setIsApplying(true)}
            className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-emerald-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Apply Leave
          </button>
        </div>

        {/* Leave Balances */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {leaveBalances.map((balance, index) => (
            <div key={index} className={`p-6 rounded-xl border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} shadow-sm relative overflow-hidden`}>
              <div className={`absolute top-0 left-0 w-1 h-full bg-${balance.color}-500`}></div>
              <div className="flex justify-between items-start mb-4">
                <h3 className="font-bold text-slate-800 dark:text-white">{balance.type}</h3>
                <div className={`p-2 rounded-lg bg-${balance.color}-100 dark:bg-${balance.color}-900/30 text-${balance.color}-600 dark:text-${balance.color}-400`}>
                  <Calendar className="w-5 h-5" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-slate-800 dark:text-white">{balance.total}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Total</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-800 dark:text-white">{balance.used}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Used</p>
                </div>
                <div>
                  <p className={`text-2xl font-bold text-${balance.color}-600 dark:text-${balance.color}-400`}>{balance.available}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Available</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Leave Application Form (Modal/Inline) */}
        {isApplying && (
          <div className={`p-6 rounded-xl border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} shadow-sm`}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-slate-800 dark:text-white">Apply for Leave</h3>
              <button onClick={() => setIsApplying(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                <XCircle className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Leave Type</label>
                <select 
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className={`w-full p-2.5 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-emerald-500 ${isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'}`}
                >
                  <option value="">Select Leave Type</option>
                  <option value="annual">Annual Leave</option>
                  <option value="sick">Sick Leave</option>
                  <option value="casual">Casual Leave</option>
                </select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">From Date</label>
                  <input 
                    type="date" 
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className={`w-full p-2.5 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-emerald-500 ${isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'}`} 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">To Date</label>
                  <input 
                    type="date" 
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className={`w-full p-2.5 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-emerald-500 ${isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'}`} 
                  />
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Reason</label>
                <textarea 
                  rows={3} 
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  className={`w-full p-2.5 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-emerald-500 ${isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'}`}
                  placeholder="Please provide a brief reason for your leave request..."
                ></textarea>
              </div>

              <div className="md:col-span-2 flex justify-end gap-3">
                <button 
                  type="button"
                  onClick={() => setIsApplying(false)}
                  className="px-4 py-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors"
                >
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Leave History */}
        <div className={`rounded-xl border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} shadow-sm overflow-hidden`}>
          <div className="p-6 border-b border-slate-100 dark:border-slate-800">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white">Leave History</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className={`bg-slate-50 dark:bg-slate-800/50 border-b ${isDark ? 'border-slate-800 text-slate-400' : 'border-slate-200 text-slate-500'}`}>
                <tr>
                  <th className="px-6 py-4 font-medium">Leave Type</th>
                  <th className="px-6 py-4 font-medium">Duration</th>
                  <th className="px-6 py-4 font-medium">Days</th>
                  <th className="px-6 py-4 font-medium">Reason</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isDark ? 'divide-slate-800' : 'divide-slate-100'}`}>
                {leaveHistory.map((leave) => (
                  <tr key={leave.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">{leave.type}</td>
                    <td className="px-6 py-4 text-slate-500 dark:text-slate-400">
                      {leave.startDate} <span className="mx-2">to</span> {leave.endDate}
                    </td>
                    <td className="px-6 py-4 text-slate-500 dark:text-slate-400">{leave.days}</td>
                    <td className="px-6 py-4 text-slate-500 dark:text-slate-400 truncate max-w-[200px]">{leave.reason}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
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
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </EmployeeLayout>
  );
}
