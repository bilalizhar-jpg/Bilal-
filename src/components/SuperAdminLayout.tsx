import React, { useState} from 'react';
import { 
 Building2, Menu, Maximize2, RefreshCw, Search, ChevronRight, LayoutDashboard,
 Users, Settings, LogOut, ChevronDown, ArrowLeft, Home, CreditCard, Shield,
 Activity, User
} from 'lucide-react';
import { Link, useLocation, useNavigate} from 'react-router-dom';
import { motion, AnimatePresence} from 'motion/react';
import { useAuth} from '../context/AuthContext';
import { useSuperAdmin} from '../context/SuperAdminContext';
import { ADMIN_MENU_ITEMS} from '../constants';

interface SuperAdminLayoutProps {
 children: React.ReactNode;
}

export default function SuperAdminLayout({ children}: SuperAdminLayoutProps) {
 const [isSidebarOpen, setIsSidebarOpen] = useState(true);
 const [openMenus, setOpenMenus] = useState<string[]>([]);
 const location = useLocation();
 const navigate = useNavigate();
 const { logout, user, impersonateCompany} = useAuth();
 const { companies} = useSuperAdmin();

 const toggleMenu = (name: string) => {
 setOpenMenus(prev => 
 prev.includes(name) ? prev.filter(m => m !== name) : [...prev, name]
 );
};

 const handleLogout = () => {
 logout();
 navigate('/login');
};

 const SidebarItem = ({ item, depth = 0}: { item: any, depth?: number}) => {
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

 if (item.hasSub) {
 return (
 <div className="space-y-1">
 <button
 onClick={() => toggleMenu(item.name)}
 className={`w-full flex items-center justify-between px-4 py-3.5 rounded-2xl transition-all duration-300 group ${
 isActive 
 ? 'bg-indigo-50 text-indigo-700' 
 : 'text-gray-900 hover:bg-slate-100 hover:text-slate-900'
} ${depth === 1 ? 'pl-8' : depth === 2 ? 'pl-12' : depth === 3 ? 'pl-16' : ''}`}
 >
 <div className="flex items-center gap-4">
 {Icon && <Icon className={`w-5 h-5 transition-transform duration-300 group-hover:scale-110 ${isActive ? 'text-indigo-600' : ''}`} />}
 {isSidebarOpen && (
 <span className={`font-black uppercase tracking-[0.2em] ${depth > 0 ? 'text-[10px]' : 'text-xs'}`}>{item.name}</span>
 )}
 </div>
 {isSidebarOpen && (
 <motion.div
 animate={{ rotate: isOpen ? 180 : 0}}
 transition={{ duration: 0.3}}
 >
 <ChevronDown className="w-4 h-4 opacity-50"/>
 </motion.div>
 )}
 </button>
 <AnimatePresence>
 {isOpen && (
 <motion.ul 
 initial={{ height: 0, opacity: 0}}
 animate={{ height: 'auto', opacity: 1}}
 exit={{ height: 0, opacity: 0}}
 className={`overflow-hidden space-y-1 ${depth === 0 ? 'ml-6 border-l border-slate-200' : ''}`}
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
 ? 'bg-indigo-50 text-indigo-700' 
 : 'text-gray-900 hover:bg-slate-100 hover:text-slate-900'
} ${depth === 1 ? 'pl-10' : depth === 2 ? 'pl-14' : depth === 3 ? 'pl-18' : ''}`}
 >
 {Icon && <Icon className={`w-5 h-5 transition-transform duration-300 group-hover:scale-110 ${location.pathname === item.path ? 'text-indigo-600' : ''}`} />}
 {isSidebarOpen && <span className={`font-black uppercase tracking-[0.2em] ${depth > 0 ? 'text-[10px]' : 'text-xs'}`}>{item.name}</span>}
 </Link>
 );
};

 const menuItems = [
 { name: 'Dashboard', icon: LayoutDashboard, path: '/super-admin/dashboard'},
 { name: 'Companies', icon: Building2, path: '/super-admin/companies'},
 { name: 'Subscription Plans', icon: CreditCard, path: '/super-admin/subscription-plans'},
 { name: 'Employer Panel Permissions', icon: Shield, path: '/super-admin/employee-permissions'},
 ];

 return (
 <div className="min-h-screen flex relative overflow-hidden print:overflow-visible bg-[#f5f7fb] text-gray-900">
 {/* Background Atmosphere */}
 <div className="fixed inset-0 pointer-events-none overflow-hidden print:hidden z-0">
 <div className="absolute top-[-10%] left-[-5%] w-[50%] h-[50%] rounded-full bg-indigo-500/5 blur-[120px]"/>
 <div className="absolute bottom-[-10%] right-[-5%] w-[50%] h-[50%] rounded-full bg-emerald-500/5 blur-[120px]"/>
 </div>

 <aside className={`${isSidebarOpen ? 'w-72' : 'w-24'} relative z-30 flex flex-col transition-all duration-500 shrink-0 border-r print:hidden bg-white border-gray-200`}>
 <div className="p-6 flex items-center gap-4 border-b border-gray-100 h-20">
 <div className="bg-black p-1.5 rounded-xl shrink-0 overflow-hidden w-10 h-10 flex items-center justify-center shadow-md">
 <Shield className="w-6 h-6 text-white"/>
 </div>
 {isSidebarOpen && (
 <span className="font-display font-bold text-xl tracking-tight truncate uppercase text-black">
 Super Admin
 </span>
 )}
 </div>
 
 <nav className="flex-1 overflow-y-auto py-4 custom-scrollbar px-4">
 <div className="px-4 mb-6 text-[10px] font-bold text-gray-400 uppercase tracking-[0.3em]">
 {isSidebarOpen ?"Core Protocol":"CP"}
 </div>
 <ul className="space-y-2">
 {menuItems.map((item) => {
 const Icon = item.icon;
 const isActive = location.pathname === item.path;
 return (
 <li key={item.name}>
 <Link
 to={item.path}
 className={`relative flex items-center ${isSidebarOpen ? 'gap-4 px-4' : 'justify-center px-0'} py-3.5 rounded-lg transition-all duration-200 group ${
 isActive 
 ? 'bg-gray-100 text-gray-900' 
 : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
}`}
 >
 {isActive && (
 <motion.div 
 layoutId="activeIndicator"
 className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-black"
 />
 )}
 <Icon className={`w-5 h-5 transition-transform duration-200 group-hover:scale-110 ${isActive ? 'text-gray-900' : ''}`} />
 {isSidebarOpen && <span className="font-bold text-xs uppercase tracking-[0.2em]">{item.name}</span>}
 </Link>
 </li>
 );
})}
 </ul>

 <div className="mt-10 px-4 mb-6 text-[10px] font-bold text-gray-400 uppercase tracking-[0.3em]">
 {isSidebarOpen ?"Employer Modules":"EM"}
 </div>

 <div className="space-y-2 text-gray-900">
 {ADMIN_MENU_ITEMS.map((item) => (
 <SidebarItem key={item.name} item={item} />
 ))}
 </div>
 </nav>

 <div className="p-6 border-t border-gray-100">
 <button 
 onClick={handleLogout}
 className="w-full flex items-center gap-4 px-4 py-3.5 rounded-lg transition-all duration-300 group text-gray-600 hover:bg-gray-50 hover:text-gray-900"
 >
 <LogOut className="w-5 h-5 transition-transform group-hover:-translate-x-1"/>
 {isSidebarOpen && <span className="font-bold text-xs uppercase tracking-[0.2em]">Logout</span>}
 </button>
 </div>
 </aside>

 <main className="flex-1 flex flex-col min-w-0 overflow-hidden print:overflow-visible relative z-10">
 <header className="h-20 relative z-20 flex items-center justify-between px-8 border-b print:hidden bg-white border-gray-200">
 <div className="flex items-center gap-6">
 <motion.button 
 whileTap={{ scale: 0.9}}
 onClick={() => setIsSidebarOpen(!isSidebarOpen)}
 className="p-2.5 rounded-lg transition-all hover:bg-gray-100 text-gray-500 hover:text-gray-900"
 >
 <Menu className="w-5 h-5"/>
 </motion.button>
 
 {user?.companyId && (
 <motion.div 
 initial={{ opacity: 0, y: -10}}
 animate={{ opacity: 1, y: 0}}
 className="flex items-center gap-3 px-4 py-2 bg-gray-100 border border-gray-200 rounded-lg"
 >
 <Shield className="w-4 h-4 text-gray-900"/>
 <span className="text-[10px] font-bold uppercase tracking-widest text-gray-900">
 Impersonating: {companies.find(c => c.id === user.companyId)?.name}
 </span>
 <button 
 onClick={() => impersonateCompany(null)}
 className="ml-2 text-[9px] font-bold uppercase tracking-widest bg-black text-white px-3 py-1 rounded-lg hover:opacity-80 transition-opacity"
 >
 Terminate
 </button>
 </motion.div>
 )}
 </div>

 <div className="flex items-center gap-6">
 <motion.button 
 whileTap={{ scale: 0.9}}
 className="p-2.5 rounded-lg transition-all hover:bg-gray-100 text-gray-500 hover:text-gray-900"
 >
 <Maximize2 className="w-5 h-5"/>
 </motion.button>
 
 <div className="flex items-center gap-4 pl-6 border-l border-gray-200">
 <div className="text-right hidden sm:block">
 <p className="text-[10px] font-bold uppercase tracking-widest text-gray-900">{user?.name || 'Super Admin'}</p>
 <p className="text-[9px] uppercase tracking-widest text-gray-500">System Architect</p>
 </div>
 <div className="relative w-10 h-10 rounded-full p-0.5 bg-gray-200">
 <div className="w-full h-full rounded-full bg-white flex items-center justify-center overflow-hidden">
 {user?.avatar ? (
 <img 
 src={user.avatar} 
 alt=""
 className="w-full h-full object-cover"
 referrerPolicy="no-referrer"
 />
 ) : (
 <User className="w-5 h-5 text-gray-400"/>
 )}
 </div>
 </div>
 </div>
 </div>
 </header>

 <div className="flex-1 overflow-auto print:overflow-visible p-8 custom-scrollbar bg-white">
 <div className="max-w-[1600px] mx-auto">
 <AnimatePresence mode="wait">
 <motion.div
 key={location.pathname}
 initial={{ opacity: 0, y: 10}}
 animate={{ opacity: 1, y: 0}}
 exit={{ opacity: 0, y: -10}}
 transition={{ duration: 0.3}}
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
