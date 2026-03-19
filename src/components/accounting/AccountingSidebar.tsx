import React, { useState} from 'react';
import { Link, useLocation, useNavigate} from 'react-router-dom';
import { motion, AnimatePresence} from 'motion/react';
import { 
 LayoutDashboard, 
 BookOpen, 
 FileText, 
 PieChart, 
 Settings, 
 LogOut, 
 ChevronDown,
 ArrowLeft,
 Calculator,
 Users,
 Receipt,
 CreditCard
} from 'lucide-react';
import { useAuth} from '../../context/AuthContext';

interface AccountingSidebarProps {
 isSidebarOpen: boolean;
}

export const ACCOUNTING_MENU_ITEMS = [
 { name: 'Dashboard', icon: LayoutDashboard, path: '/accounting/dashboard'},
 { name: 'Sales', icon: Users, hasSub: true, subItems: [
 { name: 'Customers', path: '/accounting/customers'},
 { name: 'Invoices', path: '/accounting/invoices'},
 { name: 'Payments', path: '/accounting/payments'},
 ]},
 { name: 'Purchases', icon: Receipt, hasSub: true, subItems: [
 { name: 'Vendors', path: '/accounting/vendors'},
 { name: 'Bills', path: '/accounting/bills'},
 { name: 'Expenses', path: '/accounting/expenses'},
 ]},
 { name: 'Banking', icon: CreditCard, hasSub: true, subItems: [
 { name: 'Bank Accounts', path: '/accounting/bank/accounts'},
 { name: 'Transactions', path: '/accounting/bank/transactions'},
 ]},
 { name: 'Chart of Accounts', icon: BookOpen, path: '/accounting/chart-of-accounts'},
 { name: 'Journal Entries', icon: FileText, path: '/accounting/journal-entries'},
 { name: 'Reports', icon: PieChart, hasSub: true, subItems: [
 { name: 'General Ledger', path: '/accounting/reports/general-ledger'},
 { name: 'Trial Balance', path: '/accounting/reports/trial-balance'},
 { name: 'Balance Sheet', path: '/accounting/reports/balance-sheet'},
 { name: 'Income Statement', path: '/accounting/reports/income-statement'},
 { name: 'Cash Flow', path: '/accounting/reports/cash-flow'},
 ]},
 { name: 'Settings', icon: Settings, hasSub: true, subItems: [
 { name: 'Financial Settings', path: '/accounting/settings'},
 { name: 'Fiscal Years', path: '/accounting/fiscal-years'},
 { name: 'Tax Settings', path: '/accounting/settings/taxes'},
 { name: 'Number Sequences', path: '/accounting/settings/sequences'},
 { name: 'Audit Logs', path: '/settings/audit-logs'},
 ]}
];

export default function AccountingSidebar({ isSidebarOpen}: AccountingSidebarProps) {
 const [openMenus, setOpenMenus] = useState<string[]>([]);
 const location = useLocation();
 const navigate = useNavigate();
 const { logout} = useAuth();
 
 const toggleMenu = (name: string) => {
 setOpenMenus(prev => prev.includes(name) ? prev.filter(m => m !== name) : [...prev, name]);
};

 const handleLogout = () => {
 logout();
 navigate('/login');
};

 const SidebarItem = ({ item, depth = 0}: { item: any, depth?: number}) => {
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
 className={`w-full flex items-center justify-between px-4 py-3.5 rounded-2xl transition-all duration-300 group ${
 isActive 
 ? 'bg-indigo-50 text-indigo-700' 
 : 'text-slate-900 hover:bg-slate-100 hover:text-slate-900'
} ${depth === 1 ? 'pl-8' : depth === 2 ? 'pl-12' : ''}`}
 >
 <div className="flex items-center gap-4">
 {Icon && <Icon className={`w-5 h-5 transition-transform duration-300 group-hover:scale-110 ${isActive ? 'text-indigo-600' : ''}`} />}
 {isSidebarOpen && (
 <span className={`font-black uppercase tracking-[0.2em] ${depth > 0 ? 'text-[10px]' : 'text-xs'}`}>{item.name}</span>
 )}
 </div>
 {isSidebarOpen && (
 <motion.div animate={{ rotate: isOpen ? 180 : 0}} transition={{ duration: 0.3}}>
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
 className={`overflow-hidden space-y-1 ${depth === 0 ? 'ml-6 border-l ' + ('border-slate-200') : ''}`}
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
 : 'text-slate-900 hover:bg-slate-100 hover:text-slate-900'
} ${depth === 1 ? 'pl-10' : depth === 2 ? 'pl-14' : ''}`}
 >
 {Icon && <Icon className={`w-5 h-5 transition-transform duration-300 group-hover:scale-110 ${location.pathname === item.path ? 'text-indigo-600' : ''}`} />}
 {isSidebarOpen && <span className={`font-black uppercase tracking-[0.2em] ${depth > 0 ? 'text-[10px]' : 'text-xs'}`}>{item.name}</span>}
 </Link>
 );
};

 return (
 <aside className={`${isSidebarOpen ? 'w-72' : 'w-24'} relative z-30 flex flex-col transition-all duration-500 shrink-0 border-r print:hidden bg-white border-slate-200`}>
 <div className={`p-6 flex items-center gap-4 border-b h-20 border-slate-200`}>
 <div className="bg-black p-1.5 rounded-xl shrink-0 overflow-hidden w-10 h-10 flex items-center justify-center shadow-md">
 <Calculator className="w-6 h-6 text-white"/>
 </div>
 {isSidebarOpen && (
 <span className={`font-display font-black text-xl tracking-tighter truncate uppercase text-black`}>
 Accounting
 </span>
 )}
 </div>
 
 <nav className="flex-1 overflow-y-auto py-4 custom-scrollbar px-4">
 <div className={`px-4 mb-6 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400`}>
 {isSidebarOpen ?"Main Menu":"Menu"}
 </div>
 <div className="space-y-2">
 {ACCOUNTING_MENU_ITEMS.map((item) => (
 <SidebarItem key={item.name} item={item} />
 ))}
 </div>
 </nav>

 <div className={`p-6 border-t border-slate-200`}>
 <Link 
 to="/dashboard"
 className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-lg transition-all duration-300 group mb-2 text-slate-900 hover:bg-slate-100 hover:text-slate-900`}
 >
 <ArrowLeft className="w-5 h-5 transition-transform group-hover:-translate-x-1"/>
 {isSidebarOpen && <span className="font-black text-xs uppercase tracking-[0.2em]">Back to Main</span>}
 </Link>
 <button 
 onClick={handleLogout}
 className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-lg transition-all duration-300 group text-slate-900 hover:bg-slate-100 hover:text-slate-900`}
 >
 <LogOut className="w-5 h-5 transition-transform group-hover:-translate-x-1"/>
 {isSidebarOpen && <span className="font-black text-xs uppercase tracking-[0.2em]">Logout</span>}
 </button>
 </div>
 </aside>
 );
}
