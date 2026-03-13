import React from 'react';
import EmployeeLayout from '../../components/EmployeeLayout';
import { UserCheck, Plus, CheckCircle2, Clock, XCircle } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export default function EmployeeRecruitment() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const referrals = [
    { id: 'REF-001', candidate: 'Jane Doe', position: 'Senior Frontend Developer', date: 'Feb 15, 2026', status: 'Hired', bonus: '$1,000' },
    { id: 'REF-002', candidate: 'John Smith', position: 'Product Manager', date: 'Mar 02, 2026', status: 'Interviewing', bonus: 'Pending' },
    { id: 'REF-003', candidate: 'Alice Johnson', position: 'UX Designer', date: 'Jan 10, 2026', status: 'Rejected', bonus: '-' },
  ];

  return (
    <EmployeeLayout>
      <div className="space-y-8 max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-end gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Employee Referrals</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-2 text-lg">Refer candidates for open positions and track their progress.</p>
          </div>
          <button className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-indigo-700 shadow-lg shadow-indigo-500/20 transition-all active:scale-95">
            <Plus className="w-5 h-5" />
            Refer Candidate
          </button>
        </div>

        <div className={`rounded-3xl border shadow-xl overflow-hidden ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
          <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
              <UserCheck className="w-6 h-6 text-indigo-600" />
              My Referrals
            </h3>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Total: {referrals.length}</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/50 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  <th className="p-6 border-b border-slate-100 dark:border-slate-800">Referral ID</th>
                  <th className="p-6 border-b border-slate-100 dark:border-slate-800">Candidate Name</th>
                  <th className="p-6 border-b border-slate-100 dark:border-slate-800">Position</th>
                  <th className="p-6 border-b border-slate-100 dark:border-slate-800">Date Referred</th>
                  <th className="p-6 border-b border-slate-100 dark:border-slate-800">Referral Bonus</th>
                  <th className="p-6 border-b border-slate-100 dark:border-slate-800">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {referrals.map((ref) => (
                  <tr key={ref.id} className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="p-6 text-sm font-bold text-slate-900 dark:text-white group-hover:text-indigo-500 transition-colors">{ref.id}</td>
                    <td className="p-6 text-sm font-bold text-slate-900 dark:text-white">{ref.candidate}</td>
                    <td className="p-6 text-sm text-slate-600 dark:text-slate-400 font-medium">{ref.position}</td>
                    <td className="p-6 text-sm text-slate-600 dark:text-slate-400">{ref.date}</td>
                    <td className="p-6 text-sm text-slate-600 dark:text-slate-400 font-bold">{ref.bonus}</td>
                    <td className="p-6">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        ref.status === 'Hired' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                        ref.status === 'Interviewing' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                        'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400'
                      }`}>
                        {ref.status === 'Hired' && <CheckCircle2 className="w-3.5 h-3.5" />}
                        {ref.status === 'Interviewing' && <Clock className="w-3.5 h-3.5" />}
                        {ref.status === 'Rejected' && <XCircle className="w-3.5 h-3.5" />}
                        {ref.status}
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
