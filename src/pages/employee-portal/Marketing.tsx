import React from 'react';
import EmployeeLayout from '../../components/EmployeeLayout';
import { MessageSquare, Lock } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export default function EmployeeMarketing() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <EmployeeLayout>
      <div className="space-y-6 max-w-5xl mx-auto">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Marketing Campaigns</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Manage email marketing and campaigns.</p>
        </div>

        <div className={`rounded-xl border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} shadow-sm flex flex-col items-center justify-center py-20 px-4 text-center`}>
          <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 dark:text-slate-500 mb-4">
            <Lock className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-2">Access Restricted</h2>
          <p className="text-slate-500 dark:text-slate-400 max-w-md">
            You currently do not have permission to access the Marketing module. Please contact your administrator if you need access to this section.
          </p>
          <button className="mt-6 px-6 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors">
            Request Access
          </button>
        </div>
      </div>
    </EmployeeLayout>
  );
}
