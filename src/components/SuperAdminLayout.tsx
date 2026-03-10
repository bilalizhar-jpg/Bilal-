import React, { useState } from 'react';
import { 
  Building2, Menu, Maximize2, RefreshCw, Search, ChevronRight, LayoutDashboard,
  Users, Settings, LogOut, ChevronDown, ArrowLeft, Home, CreditCard, Shield,
  Activity, User, Sun, Moon
} from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useSuperAdmin } from '../context/SuperAdminContext';
import { ADMIN_MENU_ITEMS } from '../constants';

interface SuperAdminLayoutProps {
  children: React.ReactNode;
}

export default function SuperAdminLayout({ children }: SuperAdminLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [openMenus, setOpenMenus] = useState<string[]>([]);
  const location = useLocation();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const { logout, user, impersonateCompany } = useAuth();
  const { companies } = useSuperAdmin();
  const isDark = theme === 'dark';

  const toggleMenu = (name: string) => {
    setOpenMenus(prev => 
      prev.includes(name) ? prev.filter(m => m !== name) : [...prev, name]
    );
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const SidebarItem = ({ item, depth = 0 }: { item: any, depth?: number }) => {
    const Icon = item.icon;
    
    // Helper function to recursively check if any sub-item is active
    const checkIsActive = (menuItem: any): boolean => {
      if (menuItem.path && location.pathname === menuItem.path) return true;
      if (menuItem.hasSub && menuItem.subItems) {
        return menuItem.subItems.some((sub: any) => checkIsActive(sub));
      }
      return false;
    };
    
    const isActive = checkIsActive(item);
    const isOpen = openMenus.includes(item.name);
    const isDark = theme === 'dark';

    if (item.hasSub) {
      return (
        <div className="space-y-1">
          <button
            onClick={() => toggleMenu(item.name)}
            className={`w-full flex items-center justify-between px-4 py-3.5 rounded-2xl transition-all duration-300 group ${
              isActive 
                ? (isDark ? 'bg-white/10 text-white border border-white/10' : 'bg-indigo-50 text-indigo-700') 
                : (isDark ? 'text-slate-500 hover:bg-white/5 hover:text-white' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900')
            } ${depth === 1 ? 'pl-8' : depth === 2 ? 'pl-12' : depth === 3 ? 'pl-16' : ''}`}
          >
            <div className="flex items-center gap-4">
              {Icon && <Icon className={`w-5 h-5 transition-transform duration-300 group-hover:scale-110 ${isActive ? (isDark ? 'text-indigo-400' : 'text-indigo-600') : ''}`} />}
              {isSidebarOpen && (
                <span className={`font-black uppercase tracking-[0.2em] ${depth > 0 ? 'text-[10px]' : 'text-xs'}`}>{item.name}</span>
              )}
            </div>
            {isSidebarOpen && (
              <motion.div
                animate={{ rotate: isOpen ? 180 : 0 }}
                transition={{ duration: 0.3 }}
              >
                <ChevronDown className="w-4 h-4 opacity-50" />
              </motion.div>
            )}
          </button>
          <AnimatePresence>
            {isOpen && (
              <motion.ul 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className={`overflow-hidden space-y-1 ${depth === 0 ? 'ml-6 border-l border-white/5' : ''}`}
              >
                {item.subItems?.map((subItem: any) => (
                  <SidebarItem key={subItem.name} item={subItem} depth={depth + 1} />
                ))}
              </motion.ul>
            )}
          </AnimatePresence>
        </div>
      );
    }

    return (
      <Link
        to={item.path || '#'}
        className={`flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300 group ${
          location.pathname === item.path
            ? (isDark ? 'bg-white/10 text-white border border-white/10 shadow-lg shadow-black/20' : 'bg-indigo-50 text-indigo-700') 
            : (isDark ? 'text-slate-500 hover:bg-white/5 hover:text-white' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900')
        } ${depth === 1 ? 'pl-10' : depth === 2 ? 'pl-14' : depth === 3 ? 'pl-18' : ''}`}
      >
        {Icon && <Icon className={`w-5 h-5 transition-transform duration-300 group-hover:scale-110 ${location.pathname === item.path ? (isDark ? 'text-indigo-400' : 'text-indigo-600') : ''}`} />}
        {isSidebarOpen && <span className={`font-black uppercase tracking-[0.2em] ${depth > 0 ? 'text-[10px]' : 'text-xs'}`}>{item.name}</span>}
      </Link>
    );
  };

  const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/super-admin/dashboard' },
    { name: 'Companies', icon: Building2, path: '/super-admin/companies' },
    { name: 'Subscription Plans', icon: CreditCard, path: '/super-admin/subscription-plans' },
  ];

  return (
    <div className={`min-h-screen flex relative overflow-hidden print:overflow-visible ${isDark ? 'bg-[#020203] text-white' : 'bg-slate-50 text-slate-900'}`}>
      {/* Immersive Background Atmosphere */}
      {isDark && (
        <div className="fixed inset-0 pointer-events-none overflow-hidden print:hidden z-0">
          <motion.div 
            animate={{ 
              scale: [1, 1.1, 1],
              opacity: [0.2, 0.3, 0.2],
              x: [0, 30, 0],
              y: [0, 20, 0]
            }}
            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
            className="absolute top-[-10%] left-[-5%] w-[50%] h-[50%] rounded-full bg-indigo-600/10 blur-[120px]" 
          />
          <motion.div 
            animate={{ 
              scale: [1.1, 1, 1.1],
              opacity: [0.1, 0.2, 0.1],
              x: [0, -20, 0],
              y: [0, -10, 0]
            }}
            transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
            className="absolute bottom-[-10%] right-[-5%] w-[50%] h-[50%] rounded-full bg-emerald-600/10 blur-[120px]" 
          />
          <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:32px_32px]" />
        </div>
      )}

      <aside className={`${isSidebarOpen ? 'w-72' : 'w-24'} relative z-30 flex flex-col transition-all duration-500 shrink-0 border-r print:hidden ${isDark ? 'bg-black/40 border-white/5 backdrop-blur-3xl' : 'bg-white/80 border-slate-200 backdrop-blur-xl'}`}>
        <div className={`p-6 flex items-center gap-4 border-b ${isDark ? 'border-white/5' : 'border-slate-100'} h-20`}>
          <motion.div 
            whileHover={{ rotate: 5, scale: 1.05 }}
            className="bg-gradient-to-tr from-indigo-500 to-emerald-500 p-0.5 rounded-xl shrink-0 overflow-hidden w-10 h-10 flex items-center justify-center shadow-lg"
          >
            <div className="w-full h-full rounded-[10px] bg-black flex items-center justify-center overflow-hidden">
              <Shield className="w-6 h-6 text-white" />
            </div>
          </motion.div>
          {isSidebarOpen && (
            <motion.span 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className={`font-display font-black text-xl tracking-tighter truncate uppercase ${isDark ? 'text-white' : 'text-slate-800'}`}
            >
              Super Admin
            </motion.span>
          )}
        </div>
        
        <nav className="flex-1 overflow-y-auto py-4 custom-scrollbar px-4">
          <div className="px-4 mb-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">
            {isSidebarOpen ? "Core Protocol" : "CP"}
          </div>
          <ul className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <li key={item.name}>
                  <Link
                    to={item.path}
                    className={`relative flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300 group ${
                      isActive 
                        ? (isDark ? 'bg-white/5 text-white border border-white/10 shadow-lg shadow-indigo-500/10' : 'bg-white text-indigo-700 shadow-sm border border-slate-200') 
                        : (isDark ? 'text-slate-500 hover:bg-white/5 hover:text-white' : 'text-slate-600 hover:bg-white hover:text-slate-900 hover:shadow-sm')
                    }`}
                  >
                    {isActive && (
                      <motion.div 
                        layoutId="activeIndicator"
                        className={`absolute left-0 top-2 bottom-2 w-1 rounded-r-full ${isDark ? 'bg-indigo-500' : 'bg-indigo-600'}`}
                      />
                    )}
                    <Icon className={`w-5 h-5 transition-transform duration-300 group-hover:scale-110 ${isActive ? (isDark ? 'text-indigo-400' : 'text-indigo-600') : ''}`} />
                    {isSidebarOpen && <span className="font-black text-xs uppercase tracking-[0.2em]">{item.name}</span>}
                  </Link>
                </li>
              );
            })}
          </ul>

          <div className="mt-10 px-4 mb-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">
            {isSidebarOpen ? "Employer Modules" : "EM"}
          </div>

          <div className="space-y-2">
            {ADMIN_MENU_ITEMS.map((item) => (
              <SidebarItem key={item.name} item={item} />
            ))}
          </div>
        </nav>

        <div className="p-6 border-t border-white/5">
          <button 
            onClick={handleLogout}
            className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300 group ${isDark ? 'text-red-400 hover:bg-red-500/10' : 'text-red-600 hover:bg-red-50'}`}
          >
            <LogOut className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
            {isSidebarOpen && <span className="font-black text-xs uppercase tracking-[0.2em]">Logout</span>}
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0 overflow-hidden print:overflow-visible relative z-10">
        <header className={`h-20 relative z-20 flex items-center justify-between px-8 border-b print:hidden ${isDark ? 'bg-black/20 border-white/5 backdrop-blur-3xl' : 'bg-white/80 border-slate-200 backdrop-blur-xl'}`}>
          <div className="flex items-center gap-6">
            <motion.button 
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className={`p-2.5 rounded-xl transition-all ${isDark ? 'hover:bg-white/5 text-slate-400 hover:text-white' : 'hover:bg-slate-100 text-slate-600'}`}
            >
              <Menu className="w-5 h-5" />
            </motion.button>
            
            {user?.companyId && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-3 px-4 py-2 bg-amber-500/10 border border-amber-500/20 rounded-xl"
              >
                <Shield className="w-4 h-4 text-amber-500" />
                <span className="text-[10px] font-black uppercase tracking-widest text-amber-500">
                  Impersonating: {companies.find(c => c.id === user.companyId)?.name}
                </span>
                <button 
                  onClick={() => impersonateCompany(null)}
                  className="ml-2 text-[9px] font-black uppercase tracking-widest bg-amber-500 text-black px-3 py-1 rounded-lg hover:opacity-80 transition-opacity"
                >
                  Terminate
                </button>
              </motion.div>
            )}

            <div className="h-6 w-px bg-white/10 hidden md:block" />
            <div className="hidden md:flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500">
              <Activity className="w-3 h-3 text-emerald-500" />
              Admin Status: <span className="text-emerald-500 animate-pulse">Elevated</span>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <motion.button 
              whileTap={{ scale: 0.9 }}
              onClick={toggleTheme}
              className={`p-2.5 rounded-xl transition-all ${isDark ? 'hover:bg-white/5 text-slate-400 hover:text-white' : 'hover:bg-slate-100 text-slate-600'}`}
              aria-label="Toggle theme"
            >
              {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            </motion.button>
            <motion.button 
              whileTap={{ scale: 0.9 }}
              className={`p-2.5 rounded-xl transition-all ${isDark ? 'hover:bg-white/5 text-slate-400 hover:text-white' : 'hover:bg-slate-100 text-slate-600'}`}
            >
              <Maximize2 className="w-5 h-5" />
            </motion.button>
            
            <div className="flex items-center gap-4 pl-6 border-l border-white/10">
              <div className="text-right hidden sm:block">
                <p className={`text-[10px] font-black uppercase tracking-widest ${isDark ? 'text-white' : 'text-slate-700'}`}>{user?.name || 'Super Admin'}</p>
                <p className={`text-[9px] font-mono uppercase tracking-widest text-slate-500`}>System Architect</p>
              </div>
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-tr from-indigo-500 to-emerald-500 rounded-full blur opacity-25 group-hover:opacity-50 transition duration-500" />
                <div className="relative w-10 h-10 rounded-full p-0.5 bg-white/10">
                  <div className="w-full h-full rounded-full bg-black flex items-center justify-center overflow-hidden border border-white/10">
                    {user?.avatar ? (
                      <img 
                        src={user.avatar} 
                        alt="" 
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <User className="w-5 h-5 text-white/40" />
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

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
