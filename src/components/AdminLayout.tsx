import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSuperAdmin } from '../context/SuperAdminContext';
import { 
  Building2, 
  Menu, 
  Maximize2, 
  RefreshCw, 
  Search,
  ChevronRight,
  LayoutDashboard,
  Calendar,
  Award,
  Users,
  UserMinus,
  CreditCard,
  Bell,
  DollarSign,
  Briefcase,
  ClipboardList,
  UserCheck,
  FileText,
  Target,
  Settings,
  MessageSquare,
  ChevronDown,
  Laptop,
  ArrowLeft,
  Home,
  Clock,
  GitGraph,
  Receipt,
  LogOut,
  Activity,
  User,
  Sun,
  Moon
} from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { useTheme } from '../context/ThemeContext';
import { ADMIN_MENU_ITEMS } from '../constants';
import SuperAdminLayout from './SuperAdminLayout';

import { getJobs, subscribeToJobs } from '../utils/jobStore';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [openMenus, setOpenMenus] = useState<string[]>([]);
  const location = useLocation();
  const navigate = useNavigate();
  const { theme, toggleTheme, portalDesign } = useTheme();
  const { logout, user } = useAuth();
  const { companies } = useSuperAdmin();
  const isDark = theme === 'dark';
  const isDashboard = location.pathname === '/dashboard';

  // Calculate live jobs count for Recruitment section
  const [liveJobsCount, setLiveJobsCount] = useState(0);

  React.useEffect(() => {
    const unsubscribe = subscribeToJobs((jobs) => {
      setLiveJobsCount(jobs.filter(j => j.status === 'published').length);
    }, user?.companyId);

    return () => unsubscribe();
  }, [user?.companyId]);

  // If Super Admin is impersonating, wrap in SuperAdminLayout instead
  if (user?.role === 'superadmin') {
    return <SuperAdminLayout>{children}</SuperAdminLayout>;
  }

  const company = companies.find(c => c.id === user?.companyId);
  const blockedMenus = company?.blockedMenus || [];

  const toggleMenu = (name: string) => {
    setOpenMenus(prev => 
      prev.includes(name) ? prev.filter(m => m !== name) : [...prev, name]
    );
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const filteredMenuItems = ADMIN_MENU_ITEMS.filter(item => !blockedMenus.includes(item.name));

  return (
    <div className={`min-h-screen flex relative overflow-hidden print:overflow-visible ${isDark ? 'bg-[#020203] text-white' : 'bg-slate-50 text-slate-900'}`}>
      {/* Immersive Background Atmosphere */}
      {isDark && (
        <div className="fixed inset-0 pointer-events-none overflow-hidden print:hidden z-0">
          {portalDesign === 'cosmic' && (
            <>
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
            </>
          )}

          {portalDesign === 'aurora' && (
            <>
              <motion.div 
                animate={{ 
                  scale: [1, 1.2, 1],
                  opacity: [0.3, 0.5, 0.3],
                  rotate: [0, 45, 0]
                }}
                transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-[-20%] right-[-10%] w-[70%] h-[70%] rounded-full bg-purple-600/20 blur-[100px]" 
              />
              <motion.div 
                animate={{ 
                  scale: [1.2, 1, 1.2],
                  opacity: [0.3, 0.5, 0.3],
                  rotate: [0, -45, 0]
                }}
                transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
                className="absolute bottom-[-20%] left-[-10%] w-[70%] h-[70%] rounded-full bg-cyan-500/20 blur-[100px]" 
              />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:24px_24px]" />
            </>
          )}

          {portalDesign === 'cyber' && (
            <>
              <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_800px_at_50%_200px,#3b82f615,transparent)]" />
              <motion.div
                animate={{ opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: 4, repeat: Infinity }}
                className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent"
              />
              <motion.div
                animate={{ opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: 4, repeat: Infinity, delay: 2 }}
                className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent"
              />
            </>
          )}
        </div>
      )}

      {/* Sidebar */}
      <aside className={`${isSidebarOpen ? 'w-80' : 'w-24'} relative z-30 flex flex-col transition-all duration-500 shrink-0 border-r print:hidden ${isDark ? 'bg-black/40 border-white/5 backdrop-blur-3xl' : 'bg-white/80 border-slate-200 backdrop-blur-xl'}`}>
        <div className={`p-6 flex items-center gap-4 border-b ${isDark ? 'border-white/5' : 'border-slate-100'} h-20`}>
          <motion.div 
            whileHover={{ rotate: 5, scale: 1.05 }}
            className="bg-gradient-to-tr from-indigo-500 to-emerald-500 p-0.5 rounded-xl shrink-0 overflow-hidden w-10 h-10 flex items-center justify-center shadow-lg"
          >
            <div className="w-full h-full rounded-[10px] bg-black flex items-center justify-center overflow-hidden">
              {company?.logo ? (
                <img src={company.logo} alt="Logo" className="w-full h-full object-cover" />
              ) : (
                <Building2 className="w-6 h-6 text-white" />
              )}
            </div>
          </motion.div>
          {isSidebarOpen && (
            <motion.span 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className={`font-display font-black text-xl tracking-tighter truncate uppercase ${isDark ? 'text-white' : 'text-slate-800'}`}
            >
              {company?.name || 'Employer Portal'}
            </motion.span>
          )}
        </div>
        
        <div className="p-6">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
            <input 
              type="text" 
              placeholder={isSidebarOpen ? "SEARCH PROTOCOL..." : ""} 
              className={`w-full pl-12 pr-4 py-3 ${isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'} border rounded-2xl text-[10px] font-black tracking-widest focus:ring-1 focus:ring-indigo-500 outline-none transition-all uppercase`}
            />
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 custom-scrollbar px-4">
          <ul className="space-y-2">
            {filteredMenuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path || (item.hasSub && item.subItems?.some(sub => location.pathname === sub.path));
              const isOpen = openMenus.includes(item.name);

              return (
                <li key={item.name}>
                  {item.hasSub ? (
                    <div className="space-y-1">
                      <button
                        onClick={() => toggleMenu(item.name)}
                        className={`w-full flex items-center justify-between px-4 py-3.5 rounded-2xl transition-all duration-300 group ${
                          isActive 
                            ? (isDark ? 'bg-white/10 text-white border border-white/10' : 'bg-indigo-50 text-indigo-700') 
                            : (isDark ? 'text-slate-500 hover:bg-white/5 hover:text-white' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900')
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <Icon className={`w-5 h-5 transition-transform duration-300 group-hover:scale-110 ${isActive ? (isDark ? 'text-indigo-400' : 'text-indigo-600') : ''}`} />
                          {isSidebarOpen && (
                            <div className="flex items-center gap-2 w-full justify-between">
                              <span className="font-black text-xs uppercase tracking-[0.2em]">{item.name}</span>
                              {item.name === 'Recruitment' && liveJobsCount > 0 && (
                                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${isDark ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-100 text-emerald-600'}`}>
                                  {liveJobsCount}
                                </span>
                              )}
                            </div>
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
                        {isSidebarOpen && isOpen && (
                          <motion.ul 
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden ml-6 border-l border-white/5 space-y-1"
                          >
                            {item.subItems?.map((subItem) => (
                              <li key={subItem.name}>
                                <Link
                                  to={subItem.path}
                                  className={`block px-6 py-2.5 text-xs font-black uppercase tracking-widest rounded-xl transition-all ${
                                    location.pathname === subItem.path
                                      ? (isDark ? 'text-indigo-400 bg-white/5' : 'text-indigo-700 bg-indigo-50/50')
                                      : (isDark ? 'text-slate-500 hover:text-slate-300 hover:bg-white/5' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50')
                                  }`}
                                >
                                  {subItem.name}
                                </Link>
                              </li>
                            ))}
                          </motion.ul>
                        )}
                      </AnimatePresence>
                    </div>
                  ) : (
                    <Link
                      to={item.path!}
                      className={`flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300 group ${
                        isActive 
                          ? (isDark ? 'bg-white/10 text-white border border-white/10 shadow-lg shadow-black/20' : 'bg-indigo-50 text-indigo-700') 
                          : (isDark ? 'text-slate-500 hover:bg-white/5 hover:text-white' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900')
                      }`}
                    >
                      <Icon className={`w-5 h-5 transition-transform duration-300 group-hover:scale-110 ${isActive ? (isDark ? 'text-indigo-400' : 'text-indigo-600') : ''}`} />
                      {isSidebarOpen && <span className="font-black text-xs uppercase tracking-[0.2em]">{item.name}</span>}
                    </Link>
                  )}
                </li>
              );
            })}
          </ul>
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

      {/* Main Content */}
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
            
            {/* Active Page Title */}
            <div className="hidden md:block">
              <h2 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>
                {(() => {
                  const activeItem = filteredMenuItems.find(item => 
                    location.pathname === item.path || 
                    (item.hasSub && item.subItems?.some(sub => location.pathname === sub.path)) ||
                    (item.name === 'Recruitment' && location.pathname.startsWith('/recruitment/'))
                  );
                  
                  if (activeItem?.name === 'Recruitment' || location.pathname.startsWith('/recruitment/')) {
                    return (
                      <span className="flex items-center gap-2">
                        Recruitment
                        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                          {liveJobsCount} Live Jobs
                        </span>
                      </span>
                    );
                  }
                  
                  return activeItem?.name || 'Dashboard';
                })()}
              </h2>
            </div>

            <div className="h-6 w-px bg-white/10 hidden md:block" />
            <div className="hidden md:flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500">
              <Activity className="w-3 h-3 text-emerald-500" />
              Employer Status: <span className="text-emerald-500 animate-pulse">Authorized</span>
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
                <p className={`text-[10px] font-black uppercase tracking-widest ${isDark ? 'text-white' : 'text-slate-700'}`}>{user?.name || 'Admin'}</p>
                <p className={`text-[9px] font-mono uppercase tracking-widest text-slate-500`}>{user?.role || 'Administrator'}</p>
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
                {!isDashboard && (
                  <div className="mb-10 flex items-center gap-4 no-print">
                    <motion.button
                      whileHover={{ x: -4 }}
                      onClick={() => navigate(-1)}
                      className={`flex items-center gap-3 px-5 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all border ${
                        isDark 
                          ? 'text-white bg-white/5 border-white/10 hover:bg-white/10' 
                          : 'text-slate-600 bg-white border-slate-200 hover:bg-slate-50'
                      } shadow-sm`}
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      Protocol Return
                    </motion.button>
                    <Link
                      to="/dashboard"
                      className={`flex items-center gap-3 px-5 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all border ${
                        isDark 
                          ? 'text-white bg-white/5 border-white/10 hover:bg-white/10' 
                          : 'text-slate-600 bg-white border-slate-200 hover:bg-slate-50'
                      } shadow-sm`}
                    >
                      <Home className="w-3.5 h-3.5" />
                      Main Terminal
                    </Link>
                  </div>
                )}
                {children}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </main>
    </div>
  );
}
