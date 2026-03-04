import React from 'react';
import AdminLayout from '../../components/AdminLayout';
import { useTheme } from '../../context/ThemeContext';
import { Save, Settings } from 'lucide-react';

export default function ProcurementSettings() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className={`rounded-xl border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} shadow-sm overflow-hidden`}>
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
            <Settings className="w-5 h-5 text-indigo-600" />
            <h2 className="font-bold text-slate-800 dark:text-white">Procurement Settings</h2>
          </div>
          
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Approval Workflow</label>
                <select className={`w-full border rounded px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-indigo-500 ${isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200'}`}>
                  <option>Single Level (Admin)</option>
                  <option>Two Level (Dept Head {'->'} Admin)</option>
                  <option>Three Level (Dept Head {'->'} Finance {'->'} Admin)</option>
                </select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Maximum Request Amount (Auto-approve)</label>
                <input 
                  type="number" 
                  placeholder="e.g. 500"
                  className={`w-full border rounded px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-indigo-500 ${isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200'}`}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Notification Emails</label>
                <input 
                  type="text" 
                  placeholder="admin@company.com, finance@company.com"
                  className={`w-full border rounded px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-indigo-500 ${isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200'}`}
                />
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <button className="bg-indigo-600 text-white px-6 py-2 rounded text-sm font-bold hover:bg-indigo-700 flex items-center gap-2">
                <Save className="w-4 h-4" />
                Save Settings
              </button>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
