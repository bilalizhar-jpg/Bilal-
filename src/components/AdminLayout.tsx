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
  LogOut
} from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [openMenus, setOpenMenus] = useState<string[]>([]);
  const location = useLocation();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { logout, user } = useAuth();
  const { companies } = useSuperAdmin();
  const isDark = theme === 'dark';
  const isDashboard = location.pathname === '/dashboard';

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
    { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { name: 'Time Track', icon: Clock, path: '/time-tracker' },
    { 
      name: 'Org Chart', 
      icon: GitGraph, 
      hasSub: true,
      subItems: [
        { name: 'Organization Chart', path: '/org-chart' },
        { name: 'Company Policy', path: '/org-chart/policies' }
      ]
    },
    { name: 'Attendance', icon: Calendar, path: '/attendance' },
    { name: 'Award', icon: Award, path: '/award' },
    { name: 'Department', icon: Building2, path: '/department' },
    { name: 'Employee', icon: Users, path: '/employee' },
    {
      name: 'Onboarding',
      icon: UserCheck,
      hasSub: true,
      subItems: [
        { name: 'Offer Letter', path: '/onboarding/offer-letter' },
        { name: 'Contact Letter', path: '/onboarding/contact-letter' },
        { name: 'Warning Letter', path: '/onboarding/warning-letter' },
        { name: 'Termination Letter', path: '/onboarding/termination-letter' },
        { name: 'Complaint Letter', path: '/onboarding/complaint-letter' },
        { name: 'Custom Letter', path: '/onboarding/custom-letter' },
      ]
    },
    {
      name: 'Offboarding',
      icon: UserMinus,
      hasSub: true,
      subItems: [
        { name: 'Warning Letter', path: '/offboarding/warning-letter' },
        { name: 'Resignation Letter', path: '/offboarding/resignation-letter' },
        { name: 'Termination Letter', path: '/offboarding/termination-letter' },
        { name: 'Complaint Letter', path: '/offboarding/complaint-letter' },
        { name: 'Custom Letter', path: '/offboarding/custom-letter' },
      ]
    },
    { name: 'Leaves', icon: UserMinus, path: '/leave' },
    { name: 'Notice Board', icon: Bell, path: '/notice' },
    { name: 'Payroll', icon: DollarSign, hasSub: true, subItems: [
        { name: 'Company Payroll', path: '/payroll/company-payroll' },
        { name: 'Salary advance', path: '/payroll/salary-advance' },
        { name: 'Salary generate', path: '/payroll/salary-generate' },
        { name: 'Manage employee salary', path: '/payroll/manage-salary' },
        { name: 'Sales tax format', path: '/payroll/sales-tax' }
      ]
    },
    { name: 'Invoice', icon: Receipt, path: '/invoice' },
    { name: 'Performance', icon: Target, hasSub: true, subItems: [
        { name: 'KPI Templates', path: '/performance/kpis' },
        { name: 'Appraisal List', path: '/performance/appraisal-list' },
        { name: 'Appraisal Report', path: '/performance/appraisal-report' }
      ]
    },
    { name: 'Assets', icon: Laptop, path: '/assets/management' },
    { name: 'Project Management', icon: ClipboardList, path: '/project-management' },
    { name: 'Marketing', icon: MessageSquare, hasSub: true, subItems: [
        { name: 'Email Database', path: '/marketing/lists' },
        { name: 'Campaigns', path: '/marketing/campaigns' },
        { name: 'Templates', path: '/marketing/templates' },
        { name: 'Campaign Logs', path: '/marketing/logs' }
      ]
    },
    { name: 'Reports', icon: FileText, path: '/reports' },
    { name: 'Reward Points', icon: Target, path: '/reward-points' },
    { name: 'Setup Rules', icon: Settings, path: '/setup-rules' },
    { name: 'Message', icon: MessageSquare, path: '/message' },
    { name: 'Supply Chain Management', icon: Briefcase, path: '#' },
    { name: 'Procurement', icon: Briefcase, hasSub: true, subItems: [
        { name: 'Item Request', path: '/procurement/request' },
        { name: 'Request History', path: '/procurement/history' },
        { name: 'Procurement Settings', path: '/procurement/settings' }
      ]
    },
    { name: 'Accounts', icon: FileText, path: '#' },
    { name: 'CRM', icon: Users, path: '#' },
    { name: 'Purchase Dep', icon: Briefcase, path: '#' },
    { name: 'Settings', icon: Settings, hasSub: true, subItems: [
        { name: 'General Settings', path: '/settings' },
        { name: 'Roles & Permissions', path: '/settings/roles' }
      ]
    }
  ];

  const filteredMenuItems = menuItems.filter(item => !blockedMenus.includes(item.name));

  return (
    <div className={`min-h-screen flex ${isDark ? 'bg-slate-950 text-white' : 'bg-[#F0F2F5] text-slate-900'}`}>
      {/* Sidebar */}
      <aside className={`${isSidebarOpen ? 'w-64' : 'w-20'} ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} border-r flex flex-col transition-all duration-300 shrink-0 z-30`}>
        <div className={`p-4 flex items-center gap-2 border-b ${isDark ? 'border-slate-800' : 'border-slate-100'} h-16`}>
          <div className="bg-indigo-600 p-1.5 rounded-lg shrink-0 overflow-hidden w-9 h-9 flex items-center justify-center">
            {company?.logo ? (
              <img src={company.logo} alt="Logo" className="w-full h-full object-cover" />
            ) : (
              <Building2 className="w-6 h-6 text-white" />
            )}
          </div>
          {isSidebarOpen && <span className={`font-display font-bold text-xl tracking-tight truncate ${isDark ? 'text-white' : 'text-slate-800'}`}>{company?.name || 'HRM Pro'}</span>}
        </div>
        
        <div className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder={isSidebarOpen ? "Menu Search..." : ""} 
              className={`w-full pl-10 pr-4 py-2 ${isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'} border rounded-md text-sm focus:ring-1 focus:ring-indigo-500 outline-none`}
            />
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto px-2 space-y-1 custom-scrollbar">
          {filteredMenuItems.map((item) => {
            const isActive = location.pathname === item.path || (item.subItems?.some(sub => location.pathname === sub.path));
            const isOpen = openMenus.includes(item.name);

            return (
              <div key={item.name}>
                {item.hasSub ? (
                  <button
                    onClick={() => toggleMenu(item.name)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                      isActive 
                        ? (isDark ? 'bg-indigo-500/20 text-indigo-400' : 'bg-[#E8F0FE] text-[#1A73E8]') 
                        : (isDark ? 'text-slate-400 hover:bg-slate-800 hover:text-white' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900')
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon className={`w-5 h-5 ${isActive ? (isDark ? 'text-indigo-400' : 'text-[#1A73E8]') : 'text-slate-500'}`} />
                      {isSidebarOpen && <span>{item.name}</span>}
                    </div>
                    {isSidebarOpen && (isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />)}
                  </button>
                ) : (
                  <Link
                    to={item.path || '#'}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                      location.pathname === item.path 
                        ? (isDark ? 'bg-indigo-500/20 text-indigo-400' : 'bg-[#E8F0FE] text-[#1A73E8]') 
                        : (isDark ? 'text-slate-400 hover:bg-slate-800 hover:text-white' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900')
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon className={`w-5 h-5 ${location.pathname === item.path ? (isDark ? 'text-indigo-400' : 'text-[#1A73E8]') : 'text-slate-500'}`} />
                      {isSidebarOpen && <span>{item.name}</span>}
                    </div>
                  </Link>
                )}

                {isSidebarOpen && item.hasSub && isOpen && (
                  <div className="mt-1 ml-4 space-y-1 border-l border-slate-200 dark:border-slate-800 pl-4">
                    {item.subItems?.map(sub => (
                      <Link
                        key={sub.name}
                        to={sub.path}
                        className={`block px-3 py-2 rounded-md text-xs font-medium transition-colors ${
                          location.pathname === sub.path
                            ? (isDark ? 'text-indigo-400' : 'text-[#1A73E8]')
                            : (isDark ? 'text-slate-500 hover:text-white' : 'text-slate-500 hover:text-slate-900')
                        }`}
                      >
                        {sub.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          })}

          <button
            onClick={handleLogout}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors mt-4 border-t ${
              isDark 
                ? 'text-red-400 hover:bg-red-500/10 border-slate-800' 
                : 'text-red-600 hover:bg-red-50 border-slate-100'
            }`}
          >
            <LogOut className="w-5 h-5" />
            {isSidebarOpen && <span>Log out</span>}
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className={`h-16 ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} border-b flex items-center justify-between px-6 shrink-0 z-20`}>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className={`p-2 ${isDark ? 'text-slate-400 hover:bg-slate-800' : 'text-slate-500 hover:bg-slate-100'} rounded-md`}
            >
              <Menu className="w-5 h-5" />
            </button>
            <button className={`flex items-center gap-2 px-3 py-1.5 ${isDark ? 'bg-slate-800 border-slate-700 text-slate-300' : 'bg-[#F8F9FA] border-slate-200 text-slate-600'} border rounded text-xs font-medium hover:opacity-80`}>
              <RefreshCw className="w-3.5 h-3.5 text-emerald-500" />
              Cache clear
            </button>
          </div>
          
          <div className="flex items-center gap-6">
            <button className={`p-2 ${isDark ? 'text-slate-400 hover:bg-slate-800' : 'text-slate-500 hover:bg-slate-100'} rounded-md`}>
              <Maximize2 className="w-5 h-5" />
            </button>
            <div className={`flex items-center gap-3 pl-4 border-l ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
              <div className="text-right">
                <div className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>{user?.name || 'Admin'}</div>
                <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">{user?.role || 'Admin'}</div>
              </div>
              <div className={`h-9 w-9 rounded-full ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-200 border-slate-300'} overflow-hidden border`}>
                <img src={user?.avatar || "https://picsum.photos/seed/admin/100/100"} alt="Admin" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
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
                to="/dashboard"
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

        {/* Footer */}
        <footer className={`h-12 ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} border-t flex items-center justify-between px-6 shrink-0 text-[11px] text-slate-500`}>
          <div>© 2026 BDTASK. All Rights Reserved.</div>
          <div>Designed by: <span className="text-indigo-600 font-bold">Bdtask</span></div>
        </footer>
      </main>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: ${isDark ? '#334155' : '#cbd5e1'};
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: ${isDark ? '#475569' : '#94a3b8'};
        }
      `}</style>
    </div>
  );
}
