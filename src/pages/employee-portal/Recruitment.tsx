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
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Employee Referrals</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Refer candidates for open positions and track their progress.</p>
          </div>
          <button className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-emerald-700 transition-colors">
            <Plus className="w-4 h-4" />
            Refer Candidate
          </button>
        </div>

        <div className={`rounded-xl border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} shadow-sm overflow-hidden`}>
          <div className="p-6 border-b border-slate-100 dark:border-slate-800">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-emerald-500" />
              My Referrals
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className={`bg-slate-50 dark:bg-slate-800/50 border-b ${isDark ? 'border-slate-800 text-slate-400' : 'border-slate-200 text-slate-500'}`}>
                <tr>
                  <th className="px-6 py-4 font-medium">Referral ID</th>
                  <th className="px-6 py-4 font-medium">Candidate Name</th>
                  <th className="px-6 py-4 font-medium">Position</th>
                  <th className="px-6 py-4 font-medium">Date Referred</th>
                  <th className="px-6 py-4 font-medium">Referral Bonus</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isDark ? 'divide-slate-800' : 'divide-slate-100'}`}>
                {referrals.map((ref) => (
                  <tr key={ref.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">{ref.id}</td>
                    <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">{ref.candidate}</td>
                    <td className="px-6 py-4 text-slate-500 dark:text-slate-400">{ref.position}</td>
                    <td className="px-6 py-4 text-slate-500 dark:text-slate-400">{ref.date}</td>
                    <td className="px-6 py-4 text-slate-500 dark:text-slate-400">{ref.bonus}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
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
