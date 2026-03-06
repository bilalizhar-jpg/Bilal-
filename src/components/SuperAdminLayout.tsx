import React, { useState } from 'react';
import { 
  Building2, Menu, Maximize2, RefreshCw, Search, ChevronRight, LayoutDashboard,
  Users, Settings, LogOut, ChevronDown, ArrowLeft, Home, CreditCard, Shield
} from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
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
  const { theme } = useTheme();
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

  const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/super-admin/dashboard' },
    { name: 'Companies', icon: Building2, path: '/super-admin/companies' },
    { name: 'Subscription Plans', icon: CreditCard, path: '/super-admin/subscription-plans' },
  ];

  return (
    <div className={`min-h-screen flex ${isDark ? 'bg-slate-950 text-white' : 'bg-[#F0F2F5] text-slate-900'}`}>
      <aside className={`${isSidebarOpen ? 'w-64' : 'w-20'} ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} border-r flex flex-col transition-all duration-300 shrink-0 z-30`}>
        <div className={`p-4 flex items-center gap-2 border-b ${isDark ? 'border-slate-800' : 'border-slate-100'} h-16`}>
          <div className="bg-indigo-600 p-1.5 rounded-lg shrink-0">
            <Building2 className="w-6 h-6 text-white" />
          </div>
          {isSidebarOpen && <span className={`font-display font-bold text-xl tracking-tight ${isDark ? 'text-white' : 'text-slate-800'}`}>Super Admin</span>}
        </div>
        
        <nav className="flex-1 overflow-y-auto px-2 space-y-1 custom-scrollbar mt-4">
          <div className="px-3 mb-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
            Super Admin Portal
          </div>
          {menuItems.map((item) => (
            <Link
              key={item.name}
              to={item.path}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                location.pathname === item.path 
                  ? (isDark ? 'bg-indigo-500/20 text-indigo-400' : 'bg-[#E8F0FE] text-[#1A73E8]') 
                  : (isDark ? 'text-slate-400 hover:bg-slate-800 hover:text-white' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900')
              }`}
            >
              <item.icon className="w-5 h-5" />
              {isSidebarOpen && <span>{item.name}</span>}
            </Link>
          ))}

          <div className="mt-8 px-3 mb-2 text-sm font-bold text-slate-900 dark:text-white">
            Working
          </div>

          {/* Employer Portal Functions */}
          <div className="mt-2 space-y-1">
            {ADMIN_MENU_ITEMS.map((item) => {
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
          </div>
        </nav>

        <div className="p-4 border-t border-slate-200 dark:border-slate-800">
          <div className="mb-4">
            <label className="block text-[10px] text-slate-500 mb-1 font-bold">Select Company to Manage</label>
            <select 
              className={`w-full text-xs p-1.5 rounded border ${isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'}`}
              value={user?.companyId || ''}
              onChange={(e) => impersonateCompany(e.target.value || null)}
            >
              <option value="">-- Select Company --</option>
              {companies.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

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
        </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden">
        <header className={`h-16 ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} border-b flex items-center justify-between px-6 shrink-0 z-20`}>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className={`p-2 ${isDark ? 'text-slate-400 hover:bg-slate-800' : 'text-slate-500 hover:bg-slate-100'} rounded-md`}
            >
              <Menu className="w-5 h-5" />
            </button>
            {user?.companyId && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-900/30 rounded-lg">
                <Shield className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span className="text-xs font-bold text-amber-800 dark:text-amber-200">
                  Impersonating: {companies.find(c => c.id === user.companyId)?.name}
                </span>
                <button 
                  onClick={() => impersonateCompany(null)}
                  className="ml-2 text-[10px] bg-amber-200 dark:bg-amber-800 text-amber-900 dark:text-amber-100 px-2 py-0.5 rounded hover:opacity-80 transition-opacity"
                >
                  Stop
                </button>
              </div>
            )}
          </div>

          <div className="flex items-center gap-6">
            <button className={`p-2 ${isDark ? 'text-slate-400 hover:bg-slate-800' : 'text-slate-500 hover:bg-slate-100'} rounded-md`}>
              <Maximize2 className="w-5 h-5" />
            </button>
            <div className={`flex items-center gap-3 pl-4 border-l ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
              <div className="text-right">
                <div className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>{user?.name || 'Super Admin'}</div>
                <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Super Admin</div>
              </div>
              <div className={`h-9 w-9 rounded-full ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-200 border-slate-300'} overflow-hidden border`}>
                <img src={user?.avatar || "https://picsum.photos/seed/superadmin/100/100"} alt="Admin" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
          {children}
        </div>
      </main>
    </div>
  );
}
