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
  ChevronDown,
  ChevronRight,
  ArrowLeft,
  Home,
  LogOut
} from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
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
  const { theme } = useTheme();
  const { user, logout } = useAuth();
  const { employees } = useEmployees();
  const { companies } = useSuperAdmin();
  const isDark = theme === 'dark';
  const isDashboard = location.pathname === '/employee-portal/dashboard';

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
    { name: 'Project Management', icon: ClipboardList, path: '/employee-portal/projects' },
    { name: 'Procurement', icon: Briefcase, path: '/employee-portal/procurement' },
    { name: 'Recruitment', icon: UserCheck, path: '/employee-portal/recruitment' },
    { name: 'Marketing', icon: MessageSquare, path: '/employee-portal/marketing' },
    { name: 'Messages', icon: MessageSquare, path: '/employee-portal/messages' },
  ];

  const filteredMenuItems = menuItems.filter(item => {
    let checkName = item.name;
    if (item.name === 'Daily Attendance') checkName = 'Attendance';
    if (item.name === 'Company Policies') checkName = 'Org Chart'; // Policies are usually under Org Chart/Policies
    if (item.name === 'Messages') checkName = 'Message';
    
    return !blockedMenus.includes(checkName);
  });

  return (
    <div className={`min-h-screen flex ${isDark ? 'bg-slate-950 text-white' : 'bg-[#F0F2F5] text-slate-900'}`}>
      {/* Sidebar */}
      <aside className={`${isSidebarOpen ? 'w-64' : 'w-20'} ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} border-r flex flex-col transition-all duration-300 shrink-0 z-30`}>
        <div className={`p-4 flex items-center gap-2 border-b ${isDark ? 'border-slate-800' : 'border-slate-100'} h-16`}>
          <div className="bg-emerald-600 p-1.5 rounded-lg shrink-0 overflow-hidden w-9 h-9 flex items-center justify-center">
             {company?.logo ? (
               <img src={company.logo} alt="Logo" className="w-full h-full object-cover" />
             ) : (
               <Building2 className="w-6 h-6 text-white" />
             )}
          </div>
          {isSidebarOpen && <span className={`font-display font-bold text-xl tracking-tight truncate ${isDark ? 'text-white' : 'text-slate-800'}`}>{company?.name || 'Employee Portal'}</span>}
        </div>
        
        <div className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder={isSidebarOpen ? "Menu Search..." : ""} 
              className={`w-full pl-10 pr-4 py-2 ${isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'} border rounded-md text-sm focus:ring-1 focus:ring-emerald-500 outline-none`}
            />
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 custom-scrollbar">
          <ul className="space-y-1 px-3">
            {filteredMenuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path || (item.hasSub && item.subItems?.some(sub => location.pathname === sub.path));
              const isOpen = openMenus.includes(item.name);

              return (
                <li key={item.name}>
                  {item.hasSub ? (
                    <div>
                      <button
                        onClick={() => toggleMenu(item.name)}
                        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-colors ${
                          isActive 
                            ? (isDark ? 'bg-emerald-900/40 text-emerald-400' : 'bg-emerald-50 text-emerald-700') 
                            : (isDark ? 'text-slate-400 hover:bg-slate-800 hover:text-slate-200' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900')
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Icon className={`w-5 h-5 ${isActive ? (isDark ? 'text-emerald-400' : 'text-emerald-600') : ''}`} />
                          {isSidebarOpen && <span className="font-medium text-sm">{item.name}</span>}
                        </div>
                        {isSidebarOpen && (
                          isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />
                        )}
                      </button>
                      {isSidebarOpen && isOpen && (
                        <ul className="mt-1 mb-2 space-y-1 px-3 ml-4 border-l border-slate-200 dark:border-slate-700">
                          {item.subItems?.map((subItem) => (
                            <li key={subItem.name}>
                              <Link
                                to={subItem.path}
                                className={`block px-4 py-2 text-sm rounded-lg transition-colors ${
                                  location.pathname === subItem.path
                                    ? (isDark ? 'bg-emerald-900/40 text-emerald-400' : 'bg-emerald-50 text-emerald-700 font-medium')
                                    : (isDark ? 'text-slate-400 hover:bg-slate-800 hover:text-slate-200' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900')
                                }`}
                              >
                                {subItem.name}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ) : (
                    <Link
                      to={item.path!}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                        isActive 
                          ? (isDark ? 'bg-emerald-900/40 text-emerald-400' : 'bg-emerald-50 text-emerald-700') 
                          : (isDark ? 'text-slate-400 hover:bg-slate-800 hover:text-slate-200' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900')
                      }`}
                    >
                      <Icon className={`w-5 h-5 ${isActive ? (isDark ? 'text-emerald-400' : 'text-emerald-600') : ''}`} />
                      {isSidebarOpen && <span className="font-medium text-sm">{item.name}</span>}
                    </Link>
                  )}
                </li>
              );
            })}
          </ul>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className={`h-16 ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} border-b flex items-center justify-between px-4 shrink-0 z-20`}>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className={`p-2 rounded-lg ${isDark ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-100 text-slate-600'}`}
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 pl-4 border-l border-slate-200 dark:border-slate-700">
              <div className="text-right hidden sm:block">
                <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-slate-700'}`}>{currentEmployee?.name || user?.name || 'Employee'}</p>
                <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{currentEmployee?.designation || 'Employee'}</p>
              </div>
              {currentEmployee?.avatar || user?.avatar ? (
                <img 
                  src={currentEmployee?.avatar || user?.avatar} 
                  alt={currentEmployee?.name || user?.name} 
                  className="w-9 h-9 rounded-full object-cover border border-emerald-200 dark:border-emerald-800"
                />
              ) : (
                <div className="w-9 h-9 rounded-full bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-200 dark:border-emerald-800">
                  {(currentEmployee?.name || user?.name || 'E').charAt(0)}
                </div>
              )}
              
              <button 
                onClick={handleLogout}
                className={`p-2 rounded-lg ${isDark ? 'hover:bg-slate-800 text-red-400' : 'hover:bg-red-50 text-red-600'} transition-colors ml-2`}
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-auto p-6 custom-scrollbar">
          <div className="max-w-7xl mx-auto">
            {!isDashboard && (
              <div className="mb-6 flex items-center gap-3 no-print">
                <button
                  onClick={() => navigate(-1)}
                  className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                    isDark 
                      ? 'text-slate-300 bg-slate-800 border-slate-700 hover:bg-slate-700' 
                      : 'text-slate-600 bg-white border-slate-200 hover:bg-slate-50'
                  } border shadow-sm`}
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </button>
                <Link
                  to="/employee-portal/dashboard"
                  className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                    isDark 
                      ? 'text-slate-300 bg-slate-800 border-slate-700 hover:bg-slate-700' 
                      : 'text-slate-600 bg-white border-slate-200 hover:bg-slate-50'
                  } border shadow-sm`}
                >
                  <Home className="w-4 h-4" />
                  Dashboard
                </Link>
              </div>
            )}
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
