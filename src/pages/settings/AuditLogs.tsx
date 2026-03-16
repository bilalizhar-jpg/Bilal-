import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Search, Filter, Clock, User, Activity, Database, AlertCircle, FileText, LogIn, LogOut, Settings, Trash2, Edit, Plus } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useAudit, AuditLog } from '../../context/AuditContext';
import AccountingLayout from '../../components/accounting/AccountingLayout';

export default function AuditLogs() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const { logs, loading } = useAudit();
  const [searchTerm, setSearchTerm] = useState('');
  const [moduleFilter, setModuleFilter] = useState('All');

  const modules = ['All', ...Array.from(new Set(logs.map(log => log.module)))];

  const filteredLogs = logs.filter(log => {
    const matchesSearch = 
      log.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesModule = moduleFilter === 'All' || log.module === moduleFilter;

    return matchesSearch && matchesModule;
  });

  const getActionIcon = (action: string) => {
    const a = action.toLowerCase();
    if (a.includes('login')) return <LogIn className="w-4 h-4 text-emerald-500" />;
    if (a.includes('logout')) return <LogOut className="w-4 h-4 text-amber-500" />;
    if (a.includes('create') || a.includes('add')) return <Plus className="w-4 h-4 text-indigo-500" />;
    if (a.includes('edit') || a.includes('update')) return <Edit className="w-4 h-4 text-blue-500" />;
    if (a.includes('delete') || a.includes('remove')) return <Trash2 className="w-4 h-4 text-red-500" />;
    return <Activity className="w-4 h-4 text-slate-500" />;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  return (
    <AccountingLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className={`text-2xl font-black uppercase tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Audit Logs
            </h1>
            <p className={`text-sm ${isDark ? 'text-[#B0B0C3]' : 'text-slate-500'}`}>
              Track system activities and user actions
            </p>
          </div>
        </div>

        <div className={`p-6 rounded-2xl border ${isDark ? 'bg-[#2A2A3D] border-white/5' : 'bg-white border-slate-200'}`}>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1 max-w-md">
              <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${isDark ? 'text-[#B0B0C3]' : 'text-slate-400'}`} />
              <input
                type="text"
                placeholder="Search by user, action or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full pl-10 pr-4 py-2 rounded-xl text-sm transition-all outline-none border ${
                  isDark 
                    ? 'bg-[#1E1E2F] border-white/10 text-white placeholder-[#B0B0C3] focus:border-[#00FFCC]' 
                    : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-indigo-500'
                }`}
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className={`w-4 h-4 ${isDark ? 'text-[#B0B0C3]' : 'text-slate-400'}`} />
              <select
                value={moduleFilter}
                onChange={(e) => setModuleFilter(e.target.value)}
                className={`px-4 py-2 rounded-xl text-sm transition-all outline-none border ${
                  isDark 
                    ? 'bg-[#1E1E2F] border-white/10 text-white focus:border-[#00FFCC]' 
                    : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-indigo-500'
                }`}
              >
                {modules.map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className={`border-b ${isDark ? 'border-white/10' : 'border-slate-200'}`}>
                  <th className={`py-3 px-4 text-xs font-black uppercase tracking-widest ${isDark ? 'text-[#B0B0C3]' : 'text-slate-500'}`}>Timestamp</th>
                  <th className={`py-3 px-4 text-xs font-black uppercase tracking-widest ${isDark ? 'text-[#B0B0C3]' : 'text-slate-500'}`}>User</th>
                  <th className={`py-3 px-4 text-xs font-black uppercase tracking-widest ${isDark ? 'text-[#B0B0C3]' : 'text-slate-500'}`}>Action</th>
                  <th className={`py-3 px-4 text-xs font-black uppercase tracking-widest ${isDark ? 'text-[#B0B0C3]' : 'text-slate-500'}`}>Module</th>
                  <th className={`py-3 px-4 text-xs font-black uppercase tracking-widest ${isDark ? 'text-[#B0B0C3]' : 'text-slate-500'}`}>Description</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
                    </td>
                  </tr>
                ) : filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className={`py-8 text-center text-sm ${isDark ? 'text-[#B0B0C3]' : 'text-slate-500'}`}>
                      No logs found.
                    </td>
                  </tr>
                ) : (
                  filteredLogs.map((log) => (
                    <tr key={log.id} className={`border-b transition-colors ${isDark ? 'border-white/5 hover:bg-white/5' : 'border-slate-100 hover:bg-slate-50'}`}>
                      <td className={`py-3 px-4 text-xs font-mono whitespace-nowrap ${isDark ? 'text-[#B0B0C3]' : 'text-slate-600'}`}>
                        <div className="flex items-center gap-2">
                          <Clock className="w-3 h-3 opacity-50" />
                          {formatDate(log.timestamp)}
                        </div>
                      </td>
                      <td className={`py-3 px-4 text-sm font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        <div className="flex items-center gap-2">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${isDark ? 'bg-white/10 text-white' : 'bg-slate-100 text-slate-600'}`}>
                            {log.userName.charAt(0)}
                          </div>
                          {log.userName}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          {getActionIcon(log.action)}
                          <span className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-white' : 'text-slate-900'}`}>
                            {log.action}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest ${isDark ? 'bg-indigo-500/20 text-indigo-400' : 'bg-indigo-50 text-indigo-700'}`}>
                          {log.module}
                        </span>
                      </td>
                      <td className={`py-3 px-4 text-sm ${isDark ? 'text-[#B0B0C3]' : 'text-slate-600'}`}>
                        {log.description}
                        {log.recordId && (
                          <span className="ml-2 opacity-50 font-mono text-[10px]">
                            ID: {log.recordId.substring(0, 8)}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AccountingLayout>
  );
}
