import React from 'react';
import EmployeeLayout from '../../components/EmployeeLayout';
import { Bell, Calendar, Search, Filter } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useCompanyData } from '../../context/CompanyDataContext';

export default function EmployeeNotices() {
  const { theme } = useTheme();
  const { notices: allNotices } = useCompanyData();
  const isDark = theme === 'dark';

  const notices = allNotices.map(n => ({
    id: n.id,
    title: n.type,
    date: n.date,
    type: n.type,
    content: n.description,
    isNew: new Date(n.date) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  }));

  return (
    <EmployeeLayout>
      <div className="space-y-6 max-w-5xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Notice Board</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Stay updated with company announcements and events.</p>
          </div>
          
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search notices..." 
                className={`w-full pl-9 pr-4 py-2 border rounded-lg text-sm outline-none focus:ring-1 focus:ring-emerald-500 ${isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-900'}`}
              />
            </div>
            <button className={`p-2 border rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors ${isDark ? 'border-slate-700 text-slate-300' : 'border-slate-200 text-slate-600'}`}>
              <Filter className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="space-y-4">
          {notices.map((notice) => (
            <div key={notice.id} className={`p-6 rounded-xl border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} shadow-sm relative overflow-hidden transition-all hover:shadow-md`}>
              {notice.isNew && (
                <div className="absolute top-0 right-0">
                  <span className="bg-emerald-500 text-white text-[10px] font-bold px-2 py-1 rounded-bl-lg uppercase tracking-wider">New</span>
                </div>
              )}
              
              <div className="flex flex-col sm:flex-row gap-4">
                <div className={`p-3 rounded-xl shrink-0 h-fit flex items-center justify-center ${
                  notice.type === 'Event' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' :
                  notice.type === 'Policy' ? 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400' :
                  notice.type === 'Alert' ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' :
                  'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400'
                }`}>
                  <Bell className="w-6 h-6" />
                </div>
                
                <div className="flex-1">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 mb-2">
                    <div>
                      <h3 className="text-lg font-bold text-slate-800 dark:text-white">{notice.title}</h3>
                      <div className="flex items-center gap-3 mt-1">
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                          notice.type === 'Event' ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400' :
                          notice.type === 'Policy' ? 'bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400' :
                          notice.type === 'Alert' ? 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400' :
                          'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400'
                        }`}>
                          {notice.type}
                        </span>
                        <span className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                          <Calendar className="w-3.5 h-3.5" />
                          {notice.date}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed mt-3">
                    {notice.content}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </EmployeeLayout>
  );
}
