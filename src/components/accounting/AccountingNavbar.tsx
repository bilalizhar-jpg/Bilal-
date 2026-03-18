import React from 'react';
import { Menu, Search, Bell, User} from 'lucide-react';
import { motion} from 'motion/react';
import { useAuth} from '../../context/AuthContext';
import CompanySwitcher from '../CompanySwitcher';

interface AccountingNavbarProps {
 isSidebarOpen: boolean;
 setIsSidebarOpen: (isOpen: boolean) => void;
}

export default function AccountingNavbar({ isSidebarOpen, setIsSidebarOpen}: AccountingNavbarProps) {
 const { user} = useAuth();
 
 return (
 <header className={`h-20 relative z-20 flex items-center justify-between px-8 border-b print:hidden transition-colors duration-300 bg-white border-slate-200`}>
 <div className="flex items-center gap-6">
 <motion.button 
 whileTap={{ scale: 0.9}}
 onClick={() => setIsSidebarOpen(!isSidebarOpen)}
 className={`p-2.5 rounded-lg transition-all hover:bg-slate-100 text-slate-500 hover:text-slate-900`}
 >
 <Menu className="w-5 h-5"/>
 </motion.button>
 
 <div className="relative hidden md:block w-96">
 <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400`} />
 <input 
 type="text"
 placeholder="Search accounting records..."
 className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-sm transition-all outline-none ${
 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500'
} border`}
 />
 </div>
 </div>

 <div className="flex items-center gap-6">
 <CompanySwitcher />
 
 

 <motion.button 
 whileTap={{ scale: 0.9}}
 className={`p-2.5 rounded-lg transition-all relative hover:bg-slate-100 text-slate-500 hover:text-slate-900`}
 >
 <Bell className="w-5 h-5"/>
 <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
 </motion.button>
 
 <div className={`flex items-center gap-4 pl-6 border-l border-slate-200`}>
 <div className="text-right hidden sm:block">
 <p className={`text-[10px] font-black uppercase tracking-widest text-slate-900`}>{user?.name || 'Accountant'}</p>
 <p className={`text-[9px] font-mono uppercase tracking-widest text-slate-500`}>Finance Dept</p>
 </div>
 <div className={`relative w-10 h-10 rounded-full p-0.5 bg-gradient-to-tr from-indigo-500 to-purple-500`}>
 <div className={`w-full h-full rounded-full flex items-center justify-center overflow-hidden bg-white`}>
 {user?.avatar ? (
 <img src={user.avatar} alt=""className="w-full h-full object-cover"referrerPolicy="no-referrer"/>
 ) : (
 <User className={`w-5 h-5 text-slate-400`} />
 )}
 </div>
 </div>
 </div>
 </div>
 </header>
 );
}
