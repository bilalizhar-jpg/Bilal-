import React from 'react';
import AdminLayout from '../components/AdminLayout';
import { useTheme } from '../context/ThemeContext';
import { FileText, Download, BarChart2, ArrowLeft, Home } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Reports() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const reportTypes = [
    { title: 'Attendance Report', description: 'Daily and monthly attendance statistics.', icon: BarChart2, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20' },
    { title: 'Payroll Summary', description: 'Overview of company-wide salary distribution.', icon: FileText, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
    { title: 'Employee Performance', description: 'KPI and appraisal reports for all staff.', icon: BarChart2, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-900/20' },
    { title: 'Leave Statistics', description: 'Analysis of leave types and frequencies.', icon: FileText, color: 'text-indigo-500', bg: 'bg-indigo-50 dark:bg-indigo-900/20' },
    { title: 'Project Reports', description: 'Status and progress of ongoing projects.', icon: BarChart2, color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-900/20', link: '/project-management/reports' },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4 mb-2">
          <Link to="/" className="text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white flex items-center gap-1 transition-colors">
            <Home className="w-4 h-4" /> Back to Dashboard
          </Link>
        </div>
        
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Reports</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {reportTypes.map((report) => (
            report.link ? (
              <Link key={report.title} to={report.link} className={`p-6 rounded-xl border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} shadow-sm flex items-start gap-4 hover:shadow-md transition-shadow cursor-pointer`}>
                <div className={`${report.bg} ${report.color} p-3 rounded-xl`}>
                  <report.icon className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-slate-800 dark:text-white mb-1">{report.title}</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">{report.description}</p>
                  <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1 hover:underline">
                    <BarChart2 className="w-3.5 h-3.5" />
                    View Dashboard
                  </span>
                </div>
              </Link>
            ) : (
              <div key={report.title} className={`p-6 rounded-xl border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} shadow-sm flex items-start gap-4 hover:shadow-md transition-shadow cursor-pointer`}>
                <div className={`${report.bg} ${report.color} p-3 rounded-xl`}>
                  <report.icon className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-slate-800 dark:text-white mb-1">{report.title}</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">{report.description}</p>
                  <button className="text-xs font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1 hover:underline">
                    <Download className="w-3.5 h-3.5" />
                    Generate Report
                  </button>
                </div>
              </div>
            )
          ))}
        </div>
      </div>
    </AdminLayout>
  );
}
