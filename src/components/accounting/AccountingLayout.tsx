import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { useTheme } from '../../context/ThemeContext';
import AccountingSidebar from './AccountingSidebar';
import AccountingNavbar from './AccountingNavbar';

interface AccountingLayoutProps {
  children: React.ReactNode;
}

export default function AccountingLayout({ children }: AccountingLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const location = useLocation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <div className={`min-h-screen flex relative overflow-hidden print:overflow-visible transition-colors duration-300 ${isDark ? 'bg-[#1E1E2F] text-white' : 'bg-slate-50 text-slate-900'}`}>
      {/* Background Atmosphere */}
      {isDark && (
        <div className="fixed inset-0 pointer-events-none overflow-hidden print:hidden z-0">
          <div className="absolute top-[-10%] left-[-5%] w-[50%] h-[50%] rounded-full bg-[#00FFCC]/5 blur-[120px]" />
          <div className="absolute bottom-[-10%] right-[-5%] w-[50%] h-[50%] rounded-full bg-[#00D1FF]/5 blur-[120px]" />
        </div>
      )}

      <AccountingSidebar isSidebarOpen={isSidebarOpen} />

      <main className="flex-1 flex flex-col min-w-0 overflow-hidden print:overflow-visible relative z-10">
        <AccountingNavbar isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />

        <div className="flex-1 overflow-auto print:overflow-visible p-8 custom-scrollbar">
          <div className="max-w-[1600px] mx-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                {children}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </main>
    </div>
  );
}
