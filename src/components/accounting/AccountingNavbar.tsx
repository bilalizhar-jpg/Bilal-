import React from 'react';
import { Menu, Search, Bell, User, Sun, Moon } from 'lucide-react';
import { motion } from 'motion/react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import CompanySwitcher from '../CompanySwitcher';

interface AccountingNavbarProps {
  isSidebarOpen: boolean;
  setIsSidebarOpen: (isOpen: boolean) => void;
}

export default function AccountingNavbar({ isSidebarOpen, setIsSidebarOpen }: AccountingNavbarProps) {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <header className={`h-20 relative z-20 flex items-center justify-between px-8 border-b print:hidden transition-colors duration-300 ${isDark ? 'bg-[#1E1E2F] border-white/5' : 'bg-white border-slate-200'}`}>
      <div className="flex items-center gap-6">
        <motion.button 
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className={`p-2.5 rounded-lg transition-all ${isDark ? 'hover:bg-[#2A2A3D] text-[#B0B0C3] hover:text-white' : 'hover:bg-slate-100 text-slate-500 hover:text-slate-900'}`}
        >
          <Menu className="w-5 h-5" />
        </motion.button>
        
        <div className="relative hidden md:block w-96">
          <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${isDark ? 'text-[#B0B0C3]' : 'text-slate-400'}`} />
          <input 
            type="text" 
            placeholder="Search accounting records..." 
            className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-sm transition-all outline-none ${
              isDark 
                ? 'bg-[#2A2A3D] border-white/5 text-white placeholder-[#B0B0C3] focus:border-[#00FFCC] focus:ring-1 focus:ring-[#00FFCC]' 
                : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500'
            } border`}
          />
        </div>
      </div>

      <div className="flex items-center gap-6">
        <CompanySwitcher />
        
        <motion.button 
          whileTap={{ scale: 0.9 }}
          onClick={toggleTheme}
          className={`p-2.5 rounded-lg transition-all ${isDark ? 'hover:bg-[#2A2A3D] text-[#B0B0C3] hover:text-white' : 'hover:bg-slate-100 text-slate-500 hover:text-slate-900'}`}
        >
          {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </motion.button>

        <motion.button 
          whileTap={{ scale: 0.9 }}
          className={`p-2.5 rounded-lg transition-all relative ${isDark ? 'hover:bg-[#2A2A3D] text-[#B0B0C3] hover:text-white' : 'hover:bg-slate-100 text-slate-500 hover:text-slate-900'}`}
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-[#1E1E2F]"></span>
        </motion.button>
        
        <div className={`flex items-center gap-4 pl-6 border-l ${isDark ? 'border-white/5' : 'border-slate-200'}`}>
          <div className="text-right hidden sm:block">
            <p className={`text-[10px] font-black uppercase tracking-widest ${isDark ? 'text-white' : 'text-slate-900'}`}>{user?.name || 'Accountant'}</p>
            <p className={`text-[9px] font-mono uppercase tracking-widest ${isDark ? 'text-[#B0B0C3]' : 'text-slate-500'}`}>Finance Dept</p>
          </div>
          <div className={`relative w-10 h-10 rounded-full p-0.5 ${isDark ? 'bg-gradient-to-tr from-[#00FFCC] to-[#00D1FF]' : 'bg-gradient-to-tr from-indigo-500 to-purple-500'}`}>
            <div className={`w-full h-full rounded-full flex items-center justify-center overflow-hidden ${isDark ? 'bg-[#1E1E2F]' : 'bg-white'}`}>
              {user?.avatar ? (
                <img src={user.avatar} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              ) : (
                <User className={`w-5 h-5 ${isDark ? 'text-[#B0B0C3]' : 'text-slate-400'}`} />
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
