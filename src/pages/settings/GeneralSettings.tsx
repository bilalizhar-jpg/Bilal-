import React from 'react';
import AdminLayout from '../../components/AdminLayout';
import { useTheme } from '../../context/ThemeContext';
import { Save, Building2, Globe, Mail, Phone, MapPin } from 'lucide-react';

export default function GeneralSettings() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className={`rounded-xl border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} shadow-sm overflow-hidden`}>
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-indigo-600" />
            <h2 className="font-bold text-slate-800 dark:text-white">Company Profile</h2>
          </div>
          
          <div className="p-6 space-y-6">
            <div className="flex items-center gap-6 pb-6 border-b border-slate-100 dark:border-slate-800">
              <div className="w-24 h-24 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center border-2 border-dashed border-slate-200 dark:border-slate-700">
                <Building2 className="w-8 h-8 text-slate-400" />
              </div>
              <div>
                <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-indigo-700">
                  Change Logo
                </button>
                <p className="text-xs text-slate-500 mt-2">Recommended size: 200x200px. Max 2MB.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-slate-400" /> Company Name
                </label>
                <input 
                  type="text" 
                  defaultValue="HRM Pro Solutions"
                  className={`w-full border rounded px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-indigo-500 ${isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200'}`}
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  <Globe className="w-4 h-4 text-slate-400" /> Website
                </label>
                <input 
                  type="url" 
                  defaultValue="https://hrmpro.com"
                  className={`w-full border rounded px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-indigo-500 ${isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200'}`}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  <Mail className="w-4 h-4 text-slate-400" /> Official Email
                </label>
                <input 
                  type="email" 
                  defaultValue="contact@hrmpro.com"
                  className={`w-full border rounded px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-indigo-500 ${isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200'}`}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  <Phone className="w-4 h-4 text-slate-400" /> Phone Number
                </label>
                <input 
                  type="tel" 
                  defaultValue="+1 (555) 000-0000"
                  className={`w-full border rounded px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-indigo-500 ${isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200'}`}
                />
              </div>

              <div className="md:col-span-2 space-y-2">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-slate-400" /> Address
                </label>
                <textarea 
                  defaultValue="123 Business Ave, Suite 100, Tech City, TC 12345"
                  className={`w-full border rounded px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-indigo-500 h-24 ${isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200'}`}
                />
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <button className="bg-indigo-600 text-white px-6 py-2 rounded text-sm font-bold hover:bg-indigo-700 flex items-center gap-2">
                <Save className="w-4 h-4" />
                Save Changes
              </button>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
