import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Menu, 
  Search,
  LayoutDashboard,
  Calendar,
  UserMinus,
  CreditCard,
  Bell,
  DollarSign,
  Briefcase,
  ClipboardList,
  UserCheck,
  MessageSquare,
  FileText,
  ChevronDown,
  ChevronRight,
  ArrowLeft,
  Home,
  LogOut,
  User,
  Activity,
  Sun,
  Moon
} from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { useTheme } from '../context/ThemeContext';
import { useSettings } from '../context/SettingsContext';
import { useAuth } from '../context/AuthContext';
import { ScreenCapture } from './employee/ScreenCapture';
import { useEmployees } from '../context/EmployeeContext';
import { useSuperAdmin } from '../context/SuperAdminContext';

interface EmployeeLayoutProps {
  children: React.ReactNode;
}

export default function EmployeeLayout({ children }: EmployeeLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [openMenus, setOpenMenus] = useState<string[]>([]);
  const location = useLocation();
  const navigate = useNavigate();
  const { theme, toggleTheme, portalDesign } = useTheme();
  const { colorPalette, timeFormat } = useSettings();
  const { user, logout } = useAuth();
  const { employees } = useEmployees();
  const { companies } = useSuperAdmin();
  const isDark = theme === 'dark';
  const isDashboard = location.pathname === '/employee-portal/dashboard';

  // Apply color palette
  const layoutStyle = {
    backgroundColor: colorPalette.background,
    color: colorPalette.text
  };

  // Find the full employee details based on the logged-in user
  const currentEmployee = employees.find(emp => emp.id === user?.id);
  
  // Find the company to check for blocked menus
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

  const menuItems = [
    // Always visible
    { name: 'Dashboard', icon: LayoutDashboard, path: '/employee-portal/dashboard' },
    { name: 'Daily Attendance', icon: Calendar, path: '/employee-portal/attendance' },
    { name: 'Leaves', icon: UserMinus, path: '/employee-portal/leaves' },
    { 
      name: 'Payroll', 
      icon: DollarSign, 
      hasSub: true,
      subItems: [
        { name: 'Salary Slips', path: '/employee-portal/payroll/slips' },
        { name: 'Advance Salary', path: '/employee-portal/payroll/advance' },
        { name: 'Loan Request', path: '/employee-portal/payroll/loan' }
      ]
    },
    { name: 'Notice Board', icon: Bell, path: '/employee-portal/notices' },
    { name: 'Company Policies', icon: ClipboardList, path: '/employee-portal/policies' },
    { 
      name: 'Accounting', 
      icon: FileText, 
      hasSub: true,
      subItems: [
        {
          name: 'Dashboard',
          path: '/accounts/dashboard'
        },
        {
          name: 'Customers',
          hasSub: true,
          subItems: [
            { name: 'Invoices', path: '/accounts/customers/invoices' },
            { name: 'Credit Notes', path: '/accounts/customers/credit-notes' },
            { name: 'Payments', path: '/accounts/customers/payments' },
            { name: 'Customers', path: '/accounts/customers/list' }
          ]
        },
        {
          name: 'Vendors',
          hasSub: true,
          subItems: [
            { name: 'Bills', path: '/accounts/vendors/bills' },
            { name: 'Refunds', path: '/accounts/vendors/refunds' },
            { name: 'Payments', path: '/accounts/vendors/payments' },
            { name: 'Vendors', path: '/accounts/vendors/list' }
          ]
        },
        {
          name: 'Accounting',
          hasSub: true,
          subItems: [
            { name: 'Journal Entries', path: '/accounts/accounting/journal-entries' },
            { name: 'General Ledger', path: '/accounts/accounting/general-ledger' },
            { name: 'Vouchers', path: '/accounts/voucher/list' }
          ]
        },
        {
          name: 'Reporting',
          hasSub: true,
          subItems: [
            { name: 'Profit and Loss', path: '/accounts/reporting/profit-and-loss' },
            { name: 'Balance Sheet', path: '/accounts/reporting/balance-sheet' },
            { name: 'Executive Summary', path: '/accounts/reporting/executive-summary' },
            { name: 'Cash Flow', path: '/accounts/reporting/cash-flow' }
          ]
        },
        {
          name: 'Configuration',
          hasSub: true,
          subItems: [
            { name: 'Chart of Accounts', path: '/accounts/configuration/chart-of-accounts' },
            { name: 'Taxes', path: '/accounts/configuration/taxes' },
            { name: 'Journals', path: '/accounts/configuration/journals' },
            { name: 'Accounting Periods', path: '/accounts/configuration/accounting-periods' }
          ]
        }
      ]
    },

    // Permission-based
    { name: 'Projects', icon: ClipboardList, path: '/employee-portal/projects' },
    { name: 'Procurement', icon: Briefcase, path: '/employee-portal/procurement' },
    { name: 'Recruitment', icon: UserCheck, path: '/employee-portal/recruitment' },
    { name: 'Marketing', icon: MessageSquare, path: '/employee-portal/marketing' },
    { name: 'Message', icon: MessageSquare, path: '/employee-portal/messages' },
  ];

  const alwaysVisible = ['Dashboard', 'Daily Attendance', 'Leaves', 'Payroll', 'Notice Board', 'Company Policies'];

  const filteredMenuItems = menuItems.filter(item => {
    let checkName = item.name;
    if (item.name === 'Daily Attendance') checkName = 'Attendance';
    if (item.name === 'Company Policies') checkName = 'Org Chart';
    if (item.name === 'Message') checkName = 'Message';
    
    // Check company-wide blocked menus
    if (blockedMenus.includes(checkName)) return false;

    // Always visible items
    if (alwaysVisible.includes(item.name)) return true;

    // Permission-based items
    if (currentEmployee && currentEmployee.allowedMenus) {
      return currentEmployee.allowedMenus.includes(item.name);
    }

    return false;
  });

  return (
    <div className={`min-h-screen flex relative overflow-hidden print:overflow-visible ${isDark ? 'bg-[#020203] text-white' : 'bg-slate-50 text-slate-900'}`} style={layoutStyle}>
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
      <aside className={`${isSidebarOpen ? 'w-72 md:w-80 lg:w-96' : 'w-24 md:w-28'} relative z-30 flex flex-col transition-all duration-500 shrink-0 border-r print:hidden ${isDark ? 'bg-black/40 border-white/5 backdrop-blur-3xl' : 'bg-white/80 border-slate-200 backdrop-blur-xl'}`}>
        <div className={`p-6 flex items-center gap-4 border-b ${isDark ? 'border-white/5' : 'border-slate-100'} h-20`}>
          <motion.div 
            whileHover={{ rotate: 5, scale: 1.05 }}
            className="bg-gradient-to-tr from-indigo-500 to-emerald-500 p-0.5 rounded-xl shrink-0 overflow-hidden w-12 h-12 md:w-14 md:h-14 flex items-center justify-center shadow-lg"
          >
            <div className="w-full h-full rounded-[10px] bg-black flex items-center justify-center overflow-hidden">
              {company?.logo ? (
                <img src={company.logo} alt="Logo" className="w-full h-full object-cover" />
              ) : (
                <Building2 className="w-7 h-7 md:w-8 md:h-8 text-white" />
              )}
            </div>
          </motion.div>
          {isSidebarOpen && (
            <motion.span 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className={`font-display font-black text-xl md:text-2xl lg:text-3xl tracking-tighter truncate uppercase ${isDark ? 'text-white' : 'text-slate-800'}`}
            >
              {company?.name || 'Employee Portal'}
            </motion.span>
          )}
        </div>
        
        <div className="p-6">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
            <input 
              type="text" 
              placeholder={isSidebarOpen ? "SEARCH PROTOCOL..." : ""} 
              className={`w-full pl-12 pr-4 py-3 md:py-4 ${isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'} border rounded-2xl text-xs md:text-sm font-black tracking-widest focus:ring-1 focus:ring-indigo-500 outline-none transition-all uppercase`}
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
                        className={`relative w-full flex items-center justify-between px-4 py-4 md:py-5 rounded-2xl transition-all duration-300 group ${
                          isActive 
                            ? (isDark ? 'bg-white/5 text-white border border-white/10' : 'bg-white text-indigo-700 shadow-sm border border-slate-200') 
                            : (isDark ? 'text-slate-500 hover:bg-white/5 hover:text-white' : 'text-slate-600 hover:bg-white hover:text-slate-900 hover:shadow-sm')
                        }`}
                      >
                        {isActive && (
                          <motion.div 
                            layoutId="activeIndicator"
                            className={`absolute left-0 top-2 bottom-2 w-1 rounded-r-full ${isDark ? 'bg-indigo-500' : 'bg-indigo-600'}`}
                          />
                        )}
                        <div className="flex items-center gap-4 md:gap-6">
                          <Icon className={`w-6 h-6 md:w-7 md:h-7 transition-transform duration-300 group-hover:scale-110 ${isActive ? (isDark ? 'text-indigo-400' : 'text-indigo-600') : ''}`} />
                          {isSidebarOpen && <span className="font-black text-sm md:text-base lg:text-lg uppercase tracking-[0.15em]">{item.name}</span>}
                        </div>
                        {isSidebarOpen && (
                          <motion.div
                            animate={{ rotate: isOpen ? 180 : 0 }}
                            transition={{ duration: 0.3 }}
                          >
                            <ChevronDown className="w-5 h-5 md:w-6 md:h-6 opacity-50" />
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
                                  className={`block px-6 py-3 md:py-4 text-sm md:text-base lg:text-lg font-black uppercase tracking-widest rounded-xl transition-all ${
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
                      className={`relative flex items-center gap-4 md:gap-6 px-4 py-4 md:py-5 rounded-2xl transition-all duration-300 group ${
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
                      <Icon className={`w-6 h-6 md:w-7 md:h-7 transition-transform duration-300 group-hover:scale-110 ${isActive ? (isDark ? 'text-indigo-400' : 'text-indigo-600') : ''}`} />
                      {isSidebarOpen && <span className="font-black text-sm md:text-base lg:text-lg uppercase tracking-[0.15em]">{item.name}</span>}
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
            className={`w-full flex items-center gap-4 md:gap-6 px-4 py-4 md:py-5 rounded-2xl transition-all duration-300 group ${isDark ? 'text-red-400 hover:bg-red-500/10' : 'text-red-600 hover:bg-red-50'}`}
          >
            <LogOut className="w-6 h-6 md:w-7 md:h-7 transition-transform group-hover:-translate-x-1" />
            {isSidebarOpen && <span className="font-black text-sm md:text-base lg:text-lg uppercase tracking-[0.15em]">Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <ScreenCapture />
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
            <div className="h-6 w-px bg-white/10 hidden md:block" />
            <div className="hidden md:flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-500">
              <Activity className="w-4 h-4 text-emerald-500" />
              System Status: <span className="text-emerald-500 animate-pulse">Operational</span>
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
            <div className="flex items-center gap-4 pl-6 border-l border-white/10">
              <div className="text-right hidden sm:block">
                <p className={`text-xs md:text-sm font-black uppercase tracking-widest ${isDark ? 'text-white' : 'text-slate-700'}`}>{currentEmployee?.name || user?.name || 'Employee'}</p>
                <p className={`text-[10px] md:text-xs font-mono uppercase tracking-widest ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>{currentEmployee?.designation || 'Protocol Officer'}</p>
              </div>
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-tr from-indigo-500 to-emerald-500 rounded-full blur opacity-25 group-hover:opacity-50 transition duration-500" />
                <div className="relative w-10 h-10 rounded-full p-0.5 bg-white/10">
                  <div className="w-full h-full rounded-full bg-black flex items-center justify-center overflow-hidden border border-white/10">
                    {currentEmployee?.avatar || user?.avatar ? (
                      <img 
                        src={currentEmployee?.avatar || user?.avatar} 
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
                      className={`flex items-center gap-3 px-5 py-2.5 text-xs font-black uppercase tracking-widest rounded-xl transition-all border ${
                        isDark 
                          ? 'text-white bg-white/5 border-white/10 hover:bg-white/10' 
                          : 'text-slate-600 bg-white border-slate-200 hover:bg-slate-50'
                      } shadow-sm`}
                    >
                      <ArrowLeft className="w-4 h-4" />
                      Protocol Return
                    </motion.button>
                    <Link
                      to="/employee-portal/dashboard"
                      className={`flex items-center gap-3 px-5 py-2.5 text-xs font-black uppercase tracking-widest rounded-xl transition-all border ${
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
