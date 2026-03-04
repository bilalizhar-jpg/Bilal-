import React from 'react';
import EmployeeLayout from '../../components/EmployeeLayout';
import { MessageSquare, Search, Send } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export default function EmployeeMessages() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <EmployeeLayout>
      <div className={`h-[calc(100vh-8rem)] rounded-xl border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} shadow-sm flex overflow-hidden`}>
        {/* Sidebar */}
        <div className={`w-80 border-r ${isDark ? 'border-slate-800' : 'border-slate-200'} flex flex-col`}>
          <div className="p-4 border-b border-slate-100 dark:border-slate-800">
            <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Messages</h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search messages..." 
                className={`w-full pl-9 pr-4 py-2 border rounded-lg text-sm outline-none focus:ring-1 focus:ring-emerald-500 ${isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'}`}
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {[
              { name: 'HR Department', msg: 'Please submit your timesheet.', time: '10:30 AM', unread: true },
              { name: 'John Smith', msg: 'Can we meet at 2 PM?', time: 'Yesterday', unread: false },
              { name: 'Team Alpha', msg: 'Project deployed successfully!', time: 'Monday', unread: false },
            ].map((chat, i) => (
              <div key={i} className={`p-4 border-b ${isDark ? 'border-slate-800 hover:bg-slate-800/50' : 'border-slate-100 hover:bg-slate-50'} cursor-pointer flex gap-3 ${chat.unread ? (isDark ? 'bg-emerald-900/10' : 'bg-emerald-50/50') : ''}`}>
                <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-bold shrink-0">
                  {chat.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline mb-1">
                    <h3 className={`font-medium text-sm truncate ${chat.unread ? 'text-slate-900 dark:text-white font-bold' : 'text-slate-700 dark:text-slate-300'}`}>{chat.name}</h3>
                    <span className="text-[10px] text-slate-500 shrink-0">{chat.time}</span>
                  </div>
                  <p className={`text-xs truncate ${chat.unread ? 'text-slate-800 dark:text-slate-200 font-medium' : 'text-slate-500 dark:text-slate-400'}`}>{chat.msg}</p>
                </div>
                {chat.unread && (
                  <div className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 shrink-0"></div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col bg-slate-50/50 dark:bg-slate-900/50">
          <div className={`p-4 border-b ${isDark ? 'border-slate-800 bg-slate-900' : 'border-slate-200 bg-white'} flex items-center gap-3`}>
            <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-bold">
              H
            </div>
            <div>
              <h2 className="font-bold text-slate-800 dark:text-white">HR Department</h2>
              <p className="text-xs text-emerald-600 dark:text-emerald-400">Online</p>
            </div>
          </div>
          
          <div className="flex-1 p-6 overflow-y-auto custom-scrollbar space-y-6">
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-bold shrink-0 text-xs">
                H
              </div>
              <div className={`p-3 rounded-2xl rounded-tl-none max-w-[80%] ${isDark ? 'bg-slate-800 text-slate-200' : 'bg-white border border-slate-200 text-slate-700'}`}>
                <p className="text-sm">Hello! Just a reminder to submit your timesheet for this week by Friday 5 PM.</p>
                <span className="text-[10px] text-slate-400 mt-1 block">10:30 AM</span>
              </div>
            </div>
            
            <div className="flex gap-3 flex-row-reverse">
              <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center text-white font-bold shrink-0 text-xs">
                EU
              </div>
              <div className="p-3 rounded-2xl rounded-tr-none max-w-[80%] bg-emerald-600 text-white">
                <p className="text-sm">Hi! Yes, I will submit it by tomorrow morning.</p>
                <span className="text-[10px] text-emerald-200 mt-1 block text-right">10:35 AM</span>
              </div>
            </div>
          </div>
          
          <div className={`p-4 border-t ${isDark ? 'border-slate-800 bg-slate-900' : 'border-slate-200 bg-white'}`}>
            <div className="relative">
              <input 
                type="text" 
                placeholder="Type your message..." 
                className={`w-full pl-4 pr-12 py-3 border rounded-full text-sm outline-none focus:ring-1 focus:ring-emerald-500 ${isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'}`}
              />
              <button className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-emerald-600 text-white rounded-full flex items-center justify-center hover:bg-emerald-700 transition-colors">
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </EmployeeLayout>
  );
}
