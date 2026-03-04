import React, { useState } from 'react';
import { 
  Building2, Menu, Maximize2, RefreshCw, Search, ChevronRight, LayoutDashboard,
  Users, Settings, LogOut, ChevronDown, ArrowLeft, Home, CreditCard
} from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

interface SuperAdminLayoutProps {
  children: React.ReactNode;
}

export default function SuperAdminLayout({ children }: SuperAdminLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { logout } = useAuth();
  const isDark = theme === 'dark';

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

      <main className="flex-1 flex flex-col overflow-hidden">
        <header className={`h-16 ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} border-b flex items-center justify-between px-6 shrink-0 z-20`}>
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className={`p-2 ${isDark ? 'text-slate-400 hover:bg-slate-800' : 'text-slate-500 hover:bg-slate-100'} rounded-md`}
          >
            <Menu className="w-5 h-5" />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
          {children}
        </div>
      </main>
    </div>
  );
}
