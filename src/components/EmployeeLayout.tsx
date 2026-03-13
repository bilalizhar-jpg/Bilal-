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
  Activity
} from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { useTheme } from '../context/ThemeContext';
import { useSettings } from '../context/SettingsContext';
import { useAuth } from '../context/AuthContext';
import { ScreenCapture } from './employee/ScreenCapture';
import { ActivityTracker } from './employee/ActivityTracker';
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
  const { theme, portalDesign } = useTheme();
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
    { name: 'Project Management', icon: ClipboardList, path: '/employee-portal/projects' },
    { 
      name: 'Procurement', 
      icon: Briefcase, 
      hasSub: true,
      subItems: [
        { name: 'New Request', path: '/employee-portal/procurement' },
        { name: 'Request History', path: '/employee-portal/procurement/history' }
      ]
    },
    { name: 'Recruitment', icon: UserCheck, path: '/employee-portal/recruitment' },
    { name: 'Marketing', icon: MessageSquare, path: '/employee-portal/marketing' },
    { name: 'Message', icon: MessageSquare, path: '/employee-portal/messages' },
  ];

  const alwaysVisible = ['Dashboard', 'Daily Attendance', 'Leaves', 'Payroll', 'Notice Board', 'Company Policies'];

  const filterMenu = (items: any[]): any[] => {
    return items
      .map(item => {
        if (item.hasSub && item.subItems) {
          return { ...item, subItems: filterMenu(item.subItems) };
        }
        return item;
      })
      .filter(item => {
        let checkName = item.name;
        if (item.name === 'Daily Attendance') checkName = 'Attendance';
        if (item.name === 'Company Policies') checkName = 'Org Chart';
        if (item.name === 'Message') checkName = 'Message';
        
        // Check company-wide blocked menus
        if (blockedMenus.includes(checkName)) return false;

        // Always visible items
        if (alwaysVisible.includes(item.name)) return true;

        // Special handling for Accounting
        if (item.name === 'Accounting') {
          return currentEmployee?.allowedMenus?.includes('Accounting');
        }

        // If it has sub-items, it's visible if any sub-item is visible
        if (item.hasSub && item.subItems && item.subItems.length > 0) {
          return item.subItems.length > 0;
        }

        // Permission-based items
        return currentEmployee?.allowedMenus?.includes(item.name);
      });
  };

  const filteredMenuItems = filterMenu(menuItems);

  return (
    <div className={`min-h-screen flex relative overflow-hidden print:overflow-visible ${isDark ? 'bg-slate-950 text-white' : 'bg-slate-50 text-slate-900'}`} style={layoutStyle}>
      {/* Sidebar */}
      <aside className={`${isSidebarOpen ? 'w-72 md:w-80' : 'w-24'} relative z-30 flex flex-col transition-all duration-500 shrink-0 border-r print:hidden ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
        <div className={`p-6 flex items-center gap-4 border-b ${isDark ? 'border-slate-800' : 'border-slate-100'} h-20`}>
          <div className="bg-indigo-600 p-2 rounded-xl shrink-0 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            {company?.logo ? (
              <img src={company.logo} alt="Logo" className="w-8 h-8 object-cover rounded-md" />
            ) : (
              <Building2 className="w-6 h-6 text-white" />
            )}
          </div>
          {isSidebarOpen && (
            <motion.span 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="font-bold text-lg tracking-tight truncate"
            >
              {company?.name || 'Employee Portal'}
            </motion.span>
          )}
        </div>
        
        <div className="p-4">
          <div className="relative group">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input 
              type="text" 
              placeholder={isSidebarOpen ? "Search menu..." : ""} 
              className={`w-full pl-10 pr-4 py-2.5 ${isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'} border rounded-xl text-xs outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all`}
            />
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto py-2 custom-scrollbar px-3">
          <ul className="space-y-1">
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
                        className={`w-full flex items-center ${isSidebarOpen ? 'justify-between px-4' : 'justify-center px-0'} py-2.5 rounded-xl transition-all duration-200 group ${
                          isActive 
                            ? (isDark ? 'bg-indigo-500/10 text-indigo-400' : 'bg-indigo-50 text-indigo-700') 
                            : (isDark ? 'text-slate-400 hover:bg-slate-800 hover:text-white' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900')
                        }`}
                      >
                        <div className={`flex items-center ${isSidebarOpen ? 'gap-3' : 'justify-center'}`}>
                          <Icon className={`w-4 h-4 ${isActive ? (isDark ? 'text-indigo-400' : 'text-indigo-600') : ''}`} />
                          {isSidebarOpen && <span className="font-bold text-xs uppercase tracking-wider">{item.name}</span>}
                        </div>
                        {isSidebarOpen && (
                          <ChevronDown className={`w-4 h-4 opacity-50 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
                        )}
                      </button>
                      <AnimatePresence>
                        {isSidebarOpen && isOpen && (
                          <motion.ul 
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden ml-4 border-l border-slate-200 dark:border-slate-800 space-y-1"
                          >
                            {item.subItems?.map((subItem) => (
                              <li key={subItem.name}>
                                <Link
                                  to={subItem.path}
                                  className={`block px-6 py-2 text-xs font-bold uppercase tracking-wider transition-all ${
                                    location.pathname === subItem.path
                                      ? (isDark ? 'text-indigo-400' : 'text-indigo-700')
                                      : (isDark ? 'text-slate-500 hover:text-slate-300' : 'text-slate-500 hover:text-slate-900')
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
                      className={`flex items-center ${isSidebarOpen ? 'gap-3 px-4' : 'justify-center px-0'} py-2.5 rounded-xl transition-all duration-200 group ${
                        isActive 
                          ? (isDark ? 'bg-indigo-500/10 text-indigo-400' : 'bg-indigo-50 text-indigo-700') 
                          : (isDark ? 'text-slate-400 hover:bg-slate-800 hover:text-white' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900')
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${isActive ? (isDark ? 'text-indigo-400' : 'text-indigo-600') : ''}`} />
                      {isSidebarOpen && <span className="font-bold text-xs uppercase tracking-wider">{item.name}</span>}
                    </Link>
                  )}
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="p-4 border-t border-slate-200 dark:border-slate-800">
          <button 
            onClick={handleLogout}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-300 group ${isDark ? 'text-red-400 hover:bg-red-500/10' : 'text-red-600 hover:bg-red-50'}`}
          >
            <LogOut className="w-4 h-4" />
            {isSidebarOpen && <span className="font-bold text-xs uppercase tracking-wider">Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <ScreenCapture />
      <ActivityTracker />
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden print:overflow-visible relative z-10">
        <header className={`h-20 relative z-20 flex items-center justify-between px-8 border-b print:hidden ${isDark ? 'bg-slate-900/50 border-slate-800 backdrop-blur-xl' : 'bg-white/80 border-slate-200 backdrop-blur-xl'}`}>
          <div className="flex items-center gap-6">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className={`p-2 rounded-xl transition-all ${isDark ? 'hover:bg-slate-800 text-slate-400 hover:text-white' : 'hover:bg-slate-100 text-slate-600'}`}
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="h-6 w-px bg-slate-200 dark:bg-slate-800 hidden md:block" />
            <div className="hidden md:flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-500">
              <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
              System Status: <span className="text-emerald-500">Operational</span>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold">{currentEmployee?.name || user?.name || 'Employee'}</p>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{currentEmployee?.designation || 'Staff member'}</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center overflow-hidden shadow-lg shadow-indigo-500/20">
                {currentEmployee?.avatar || user?.avatar ? (
                  <img 
                    src={currentEmployee?.avatar || user?.avatar} 
                    alt="" 
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <User className="w-5 h-5 text-white" />
                )}
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-auto print:overflow-visible p-8 custom-scrollbar">
          <div className="max-w-7xl mx-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                {!isDashboard && (
                  <div className="mb-8 flex items-center gap-4 no-print">
                    <button
                      onClick={() => navigate(-1)}
                      className={`flex items-center gap-2 px-4 py-2 text-[10px] font-bold uppercase tracking-widest rounded-xl transition-all border ${
                        isDark 
                          ? 'text-white bg-slate-800 border-slate-700 hover:bg-slate-700' 
                          : 'text-slate-600 bg-white border-slate-200 hover:bg-slate-50 shadow-sm'
                      }`}
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      Back
                    </button>
                    <Link
                      to="/employee-portal/dashboard"
                      className={`flex items-center gap-2 px-4 py-2 text-[10px] font-bold uppercase tracking-widest rounded-xl transition-all border ${
                        isDark 
                          ? 'text-white bg-slate-800 border-slate-700 hover:bg-slate-700' 
                          : 'text-slate-600 bg-white border-slate-200 hover:bg-slate-50 shadow-sm'
                      }`}
                    >
                      <Home className="w-3.5 h-3.5" />
                      Dashboard
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
