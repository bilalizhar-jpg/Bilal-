import React from 'react';
import EmployeeLayout from '../../components/EmployeeLayout';
import { Briefcase, Plus, Clock, CheckCircle2, XCircle } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export default function EmployeeProcurement() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const requests = [
    { id: 'REQ-001', item: 'MacBook Pro M3', date: 'Feb 20, 2026', status: 'Approved', cost: '$2,499.00' },
    { id: 'REQ-002', item: 'Ergonomic Chair', date: 'Mar 01, 2026', status: 'Pending', cost: '$350.00' },
    { id: 'REQ-003', item: 'Wireless Mouse', date: 'Jan 15, 2026', status: 'Rejected', cost: '$80.00' },
  ];

  return (
    <EmployeeLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Procurement Requests</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Manage your item requests and track their status.</p>
          </div>
          <button className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-emerald-700 transition-colors">
            <Plus className="w-4 h-4" />
            New Request
          </button>
        </div>

        <div className={`rounded-xl border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} shadow-sm overflow-hidden`}>
          <div className="p-6 border-b border-slate-100 dark:border-slate-800">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-emerald-500" />
              My Requests
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className={`bg-slate-50 dark:bg-slate-800/50 border-b ${isDark ? 'border-slate-800 text-slate-400' : 'border-slate-200 text-slate-500'}`}>
                <tr>
                  <th className="px-6 py-4 font-medium">Request ID</th>
                  <th className="px-6 py-4 font-medium">Item Name</th>
                  <th className="px-6 py-4 font-medium">Date Requested</th>
                  <th className="px-6 py-4 font-medium">Estimated Cost</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isDark ? 'divide-slate-800' : 'divide-slate-100'}`}>
                {requests.map((req) => (
                  <tr key={req.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">{req.id}</td>
                    <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">{req.item}</td>
                    <td className="px-6 py-4 text-slate-500 dark:text-slate-400">{req.date}</td>
                    <td className="px-6 py-4 text-slate-500 dark:text-slate-400">{req.cost}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                        req.status === 'Approved' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                        req.status === 'Pending' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                        'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                      }`}>
                        {req.status === 'Approved' && <CheckCircle2 className="w-3.5 h-3.5" />}
                        {req.status === 'Pending' && <Clock className="w-3.5 h-3.5" />}
                        {req.status === 'Rejected' && <XCircle className="w-3.5 h-3.5" />}
                        {req.status}
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
