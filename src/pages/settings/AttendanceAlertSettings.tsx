import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Clock, 
  Bell, 
  Save, 
  AlertCircle, 
  CheckCircle2, 
  RefreshCw,
  MessageSquare,
  ShieldCheck,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface AlertSettings {
  company_id: string;
  office_time: string;
  grace_time: string;
  trigger_time: string;
  message_template: string;
  is_active: boolean;
}

const AttendanceAlertSettings = () => {
  const { user } = useAuth();
  const [settings, setSettings] = useState<AlertSettings>({
    company_id: user?.companyId || '',
    office_time: '09:00 AM',
    grace_time: '09:15 AM',
    trigger_time: '09:16 AM',
    message_template: 'Dear {{employee_name}}, you have not marked your attendance. Please mark it immediately.',
    is_active: false
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    if (user?.companyId) {
      fetchSettings();
    }
  }, [user]);

  const fetchSettings = async () => {
    try {
      const response = await fetch(`/api/attendance-alerts/${user?.companyId}`);
      if (response.ok) {
        const data = await response.json();
        setSettings({
          ...data,
          is_active: data.is_active === 1
        });
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);
    try {
      const response = await fetch('/api/attendance-alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...settings,
          company_id: user?.companyId
        })
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'Settings saved successfully!' });
      } else {
        throw new Error('Failed to save settings');
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error saving settings. Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <RefreshCw className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Bell className="w-6 h-6 text-indigo-500" />
          Attendance WhatsApp Alerts
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">
          Configure automated WhatsApp messages for employees who are late or haven't checked in.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main Settings */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white dark:bg-[#1E1E2F] rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-white/10">
            <h3 className="text-lg font-bold mb-6 flex items-center gap-2 dark:text-white">
              <Clock className="w-5 h-5 text-indigo-500" />
              Time Configuration
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                  Office Time
                </label>
                <input
                  type="text"
                  value={settings.office_time}
                  onChange={(e) => setSettings({ ...settings, office_time: e.target.value })}
                  placeholder="09:00 AM"
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-white/10 dark:bg-[#161625] dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                  Grace Time
                </label>
                <input
                  type="text"
                  value={settings.grace_time}
                  onChange={(e) => setSettings({ ...settings, grace_time: e.target.value })}
                  placeholder="09:15 AM"
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-white/10 dark:bg-[#161625] dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                  Trigger Time
                </label>
                <input
                  type="text"
                  value={settings.trigger_time}
                  onChange={(e) => setSettings({ ...settings, trigger_time: e.target.value })}
                  placeholder="09:16 AM"
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-white/10 dark:bg-[#161625] dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                />
              </div>
            </div>
            
            <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-100 dark:border-amber-900/30 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <p className="text-xs text-amber-800 dark:text-amber-200 leading-relaxed">
                <strong>Logic:</strong> If an employee has not checked in by <strong>{settings.grace_time}</strong>, 
                an automated alert will be sent at <strong>{settings.trigger_time}</strong>.
              </p>
            </div>
          </div>

          <div className="bg-white dark:bg-[#1E1E2F] rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-white/10">
            <h3 className="text-lg font-bold mb-6 flex items-center gap-2 dark:text-white">
              <MessageSquare className="w-5 h-5 text-indigo-500" />
              Message Template
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                  Template Content
                </label>
                <textarea
                  value={settings.message_template}
                  onChange={(e) => setSettings({ ...settings, message_template: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-white/10 dark:bg-[#161625] dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all resize-none"
                />
                <p className="text-[10px] text-slate-400 mt-2">
                  Available variables: <code className="bg-slate-100 dark:bg-white/5 px-1 rounded">{"{{employee_name}}"}</code>
                </p>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-100 dark:border-white/5">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Preview</p>
                <p className="text-sm text-slate-600 dark:text-slate-300 italic">
                  "{settings.message_template.replace('{{employee_name}}', user?.name || 'John Doe')}"
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Controls */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-[#1E1E2F] rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-white/10">
            <h3 className="text-sm font-bold mb-6 dark:text-white uppercase tracking-widest">Status</h3>
            
            <div className="flex items-center justify-between mb-8">
              <div>
                <p className="font-bold dark:text-white">{settings.is_active ? 'Active' : 'Disabled'}</p>
                <p className="text-[10px] text-slate-500">Enable automated alerts</p>
              </div>
              <button 
                onClick={() => setSettings({ ...settings, is_active: !settings.is_active })}
                className="transition-colors"
              >
                {settings.is_active ? (
                  <ToggleRight className="w-10 h-10 text-emerald-500" />
                ) : (
                  <ToggleLeft className="w-10 h-10 text-slate-300 dark:text-white/20" />
                )}
              </button>
            </div>

            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full flex items-center justify-center gap-2 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/20 transition-all"
            >
              {saving ? (
                <RefreshCw className="w-5 h-5 animate-spin" />
              ) : (
                <Save className="w-5 h-5" />
              )}
              Save Settings
            </button>

            {message && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`mt-4 p-3 rounded-xl flex items-center gap-2 text-xs font-medium ${
                  message.type === 'success' 
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' 
                    : 'bg-red-50 text-red-700 border border-red-100'
                }`}
              >
                {message.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                {message.text}
              </motion.div>
            )}
          </div>

          <div className="bg-indigo-600 rounded-2xl p-6 text-white shadow-xl shadow-indigo-500/30">
            <ShieldCheck className="w-8 h-8 mb-4 opacity-50" />
            <h3 className="font-bold mb-2">System Info</h3>
            <p className="text-xs text-indigo-100 leading-relaxed mb-4">
              This system runs every minute to check for late employees. Ensure your WhatsApp is connected for messages to be delivered.
            </p>
            <div className="pt-4 border-t border-white/20">
              <p className="text-[10px] text-indigo-200 uppercase tracking-widest">Last Updated</p>
              <p className="text-sm font-medium">Just now</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AttendanceAlertSettings;
