import React, { useState} from 'react';
import { useAuth} from '../context/AuthContext';
import { useSuperAdmin} from '../context/SuperAdminContext';
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
 User
} from 'lucide-react';
import { Link, useLocation, useNavigate} from 'react-router-dom';
import { motion, AnimatePresence} from 'motion/react';
import { ADMIN_MENU_ITEMS} from '../constants';
import SuperAdminLayout from './SuperAdminLayout';

import { getJobs, subscribeToJobs} from '../utils/jobStore';

interface AdminLayoutProps {
 children: React.ReactNode;
}

const SidebarItem = ({ item, depth = 0, isSidebarOpen, location, openMenus, toggleMenu, liveJobsCount}: { 
 item: any, 
 depth?: number,
 isSidebarOpen: boolean,
 location: any,
 openMenus: string[],
 toggleMenu: (name: string) => void,
 liveJobsCount: number
}) => {
 const Icon = item.icon;
 
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
 className={`w-full flex items-center ${isSidebarOpen ? 'justify-between px-4' : 'justify-center px-0'} py-2.5 rounded-md transition-colors duration-200 group ${
 isActive 
 ? 'bg-gray-100 text-gray-900 font-medium' 
 : 'text-gray-900 hover:bg-gray-50 hover:text-gray-900'
} ${isSidebarOpen ? (depth === 1 ? 'pl-8' : depth === 2 ? 'pl-12' : depth === 3 ? 'pl-16' : '') : ''}`}
 >
 <div className={`flex items-center ${isSidebarOpen ? 'gap-3' : 'justify-center'}`}>
 {Icon && <Icon className={`w-5 h-5 ${isActive ? 'text-gray-900' : 'text-gray-500 group-hover:text-gray-700'}`} />}
 {isSidebarOpen && (
 <div className="flex items-center gap-2 w-full justify-between">
 <span className={`text-sm ${depth > 0 ? 'text-sm' : 'text-sm'}`}>{item.name}</span>
 {item.name === 'Recruitment' && liveJobsCount > 0 && (
 <span className={`text-xs font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 border border-gray-200`}>
 {liveJobsCount}
 </span>
 )}
 </div>
 )}
 </div>
 {isSidebarOpen && (
 <div className={`transform transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>
 <ChevronDown className="w-4 h-4 text-gray-400"/>
 </div>
 )}
 </button>
 {isSidebarOpen && isOpen && (
 <ul className={`space-y-1 mt-1 ${depth === 0 ? 'ml-6 border-l border-gray-200' : ''}`}>
 {item.subItems?.map((subItem: any) => (
 <SidebarItem 
 key={subItem.name} 
 item={subItem} 
 depth={depth + 1} 
 isSidebarOpen={isSidebarOpen}
 location={location}
 openMenus={openMenus}
 toggleMenu={toggleMenu}
 liveJobsCount={liveJobsCount}
 />
 ))}
 </ul>
 )}
 </div>
 );
}

 return (
 <Link
 to={item.path!}
 className={`flex items-center ${isSidebarOpen ? 'gap-3 px-4' : 'justify-center px-0'} py-2.5 rounded-md transition-colors duration-200 group ${
 location.pathname === item.path
 ? 'bg-gray-100 text-gray-900 font-medium' 
 : 'text-gray-900 hover:bg-gray-50 hover:text-gray-900'
} ${isSidebarOpen ? (depth === 1 ? 'pl-10' : depth === 2 ? 'pl-14' : depth === 3 ? 'pl-18' : '') : ''}`}
 >
 {Icon && <Icon className={`w-5 h-5 ${location.pathname === item.path ? 'text-gray-900' : 'text-gray-500 group-hover:text-gray-700'}`} />}
 {isSidebarOpen && <span className={`text-sm ${depth > 0 ? 'text-sm' : 'text-sm'}`}>{item.name}</span>}
 </Link>
 );
};

export default function AdminLayout({ children}: AdminLayoutProps) {
 const [isSidebarOpen, setIsSidebarOpen] = useState(true);
 const [openMenus, setOpenMenus] = useState<string[]>([]);
 const location = useLocation();
 const navigate = useNavigate();
 const { logout, user} = useAuth();
 const { companies} = useSuperAdmin();
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
 <div className={`min-h-screen flex relative overflow-hidden print:overflow-visible bg-white text-gray-900`}>
 {/* Sidebar */}
 <aside className={`${isSidebarOpen ? 'w-64' : 'w-20'} relative z-30 flex flex-col transition-all duration-300 shrink-0 border-r border-gray-200 bg-white print:hidden`}>
 <div className={`p-4 flex items-center gap-3 border-b border-gray-200 h-16`}>
 <div className="bg-black p-1.5 rounded-md shrink-0 overflow-hidden w-8 h-8 flex items-center justify-center">
 {company?.logo ? (
 <img src={company.logo} alt="Logo"className="w-full h-full object-cover"/>
 ) : (
 <Building2 className="w-5 h-5 text-white"/>
 )}
 </div>
 {isSidebarOpen && (
 <span className="font-semibold text-black truncate">
 {company?.name || 'Employer Portal'}
 </span>
 )}
 </div>
 
 <div className="p-4">
 <div className="relative group">
 <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"/>
 <input 
 type="text"
 placeholder={isSidebarOpen ?"Search...":""} 
 className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 text-gray-900 rounded-md text-sm focus:ring-1 focus:ring-black focus:border-black outline-none transition-colors"
 />
 </div>
 </div>

 <nav className="flex-1 overflow-y-auto py-2 custom-scrollbar px-3">
 <ul className="space-y-1">
 {filteredMenuItems.map((item) => (
 <SidebarItem 
 key={item.name} 
 item={item} 
 isSidebarOpen={isSidebarOpen}
 location={location}
 openMenus={openMenus}
 toggleMenu={toggleMenu}
 liveJobsCount={liveJobsCount}
 />
 ))}
 </ul>
 </nav>

 <div className="p-4 border-t border-gray-200">
 <button 
 onClick={handleLogout}
 className="w-full flex items-center gap-3 px-3 py-2 rounded-md transition-colors text-gray-900 hover:bg-gray-50 hover:text-gray-900"
 >
 <LogOut className="w-5 h-5"/>
 {isSidebarOpen && <span className="text-sm font-medium">Logout</span>}
 </button>
 </div>
 </aside>

 {/* Main Content */}
 <main className="flex-1 flex flex-col min-w-0 overflow-hidden print:overflow-visible relative z-10">
 <header className="h-16 relative z-20 flex items-center justify-between px-6 border-b border-gray-200 bg-white print:hidden">
 <div className="flex items-center gap-4">
 <button 
 onClick={() => setIsSidebarOpen(!isSidebarOpen)}
 className="p-2 rounded-md text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition-colors"
 >
 <Menu className="w-5 h-5"/>
 </button>
 
 {/* Active Page Title */}
 <div className="hidden md:block">
 <h2 className="text-lg font-semibold text-gray-900">
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
 <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 border border-gray-200">
 {liveJobsCount} Live Jobs
 </span>
 </span>
 );
}
 
 return activeItem?.name || 'Dashboard';
})()}
 </h2>
 </div>
 </div>
 
 <div className="flex items-center gap-4">
 <button 
 className="p-2 rounded-md text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition-colors"
 >
 <Maximize2 className="w-5 h-5"/>
 </button>
 <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
 <div className="text-right hidden sm:block">
 <p className="text-sm font-medium text-gray-900">{user?.name || 'Admin'}</p>
 <p className="text-xs text-gray-500">{user?.role || 'Administrator'}</p>
 </div>
 <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden border border-gray-200">
 {user?.avatar ? (
 <img 
 src={user.avatar} 
 alt=""
 className="w-full h-full object-cover"
 referrerPolicy="no-referrer"
 />
 ) : (
 <User className="w-4 h-4 text-gray-400"/>
 )}
 </div>
 </div>
 </div>
 </header>

 <div className="flex-1 overflow-auto print:overflow-visible p-6 custom-scrollbar bg-white">
 <div className="max-w-[1600px] mx-auto">
 {!isDashboard && (
 <div className="mb-6 flex items-center gap-3 no-print">
 <button
 onClick={() => navigate(-1)}
 className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-md hover:bg-gray-50 transition-colors"
 >
 <ArrowLeft className="w-4 h-4"/>
 Back
 </button>
 <Link
 to={location.pathname.startsWith('/accounts/') ? '/accounts/dashboard' : '/dashboard'}
 className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-md hover:bg-gray-50 transition-colors"
 >
 <Home className="w-4 h-4"/>
 {location.pathname.startsWith('/accounts/') ? 'Accounting' : 'Dashboard'}
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
