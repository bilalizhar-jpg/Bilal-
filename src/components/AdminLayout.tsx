import React, { useState } from 'react';
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
  ChevronDown
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [openMenus, setOpenMenus] = useState<string[]>([]);
  const location = useLocation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const toggleMenu = (name: string) => {
    setOpenMenus(prev => 
      prev.includes(name) ? prev.filter(m => m !== name) : [...prev, name]
    );
  };

  const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { name: 'Attendance', icon: Calendar, path: '/attendance' },
    { name: 'Award', icon: Award, path: '/award' },
    { name: 'Department', icon: Building2, path: '/department' },
    { name: 'Employee', icon: Users, path: '/employee' },
    { name: 'Leave', icon: UserMinus, path: '/leave' },
    { name: 'Loan', icon: CreditCard, path: '/loan' },
    { name: 'Notice board', icon: Bell, path: '/notice' },
    { 
      name: 'Payroll', 
      icon: DollarSign, 
      hasSub: true,
      subItems: [
        { name: 'Salary advance', path: '/payroll/salary-advance' },
        { name: 'Salary generate', path: '/payroll/salary-generate' },
        { name: 'Manage employee salary', path: '/payroll/manage-salary' },
        { name: 'Sales tax format', path: '/payroll/sales-tax' }
      ]
    },
    { name: 'Procurement', icon: Briefcase, hasSub: true },
    { name: 'Project management', icon: ClipboardList, hasSub: true },
    { name: 'Recruitment', icon: UserCheck, hasSub: true },
    { name: 'Reports', icon: FileText, hasSub: true },
    { name: 'Reward points', icon: Target, hasSub: true },
    { name: 'Setup rules', icon: Settings, hasSub: true },
    { name: 'Settings', icon: Settings, hasSub: true },
    { name: 'Message', icon: MessageSquare, hasSub: true },
  ];

  return (
    <div className={`min-h-screen flex ${isDark ? 'bg-slate-950 text-white' : 'bg-[#F0F2F5] text-slate-900'}`}>
      {/* Sidebar */}
      <aside className={`${isSidebarOpen ? 'w-64' : 'w-20'} ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} border-r flex flex-col transition-all duration-300 shrink-0 z-30`}>
        <div className={`p-4 flex items-center gap-2 border-b ${isDark ? 'border-slate-800' : 'border-slate-100'} h-16`}>
          <div className="bg-indigo-600 p-1.5 rounded-lg shrink-0">
            <Building2 className="w-6 h-6 text-white" />
          </div>
          {isSidebarOpen && <span className={`font-display font-bold text-xl tracking-tight ${isDark ? 'text-white' : 'text-slate-800'}`}>HRM Pro</span>}
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
          {menuItems.map((item) => {
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
                <div className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>Admin Admin</div>
                <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Admin</div>
              </div>
              <div className={`h-9 w-9 rounded-full ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-200 border-slate-300'} overflow-hidden border`}>
                <img src="https://picsum.photos/seed/admin/100/100" alt="Admin" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
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
