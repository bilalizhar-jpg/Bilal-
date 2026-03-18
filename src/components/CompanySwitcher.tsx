import React, { useState, useRef, useEffect} from 'react';
import { Building2, ChevronDown, Check} from 'lucide-react';
import { motion, AnimatePresence} from 'motion/react';
import { useAuth} from '../context/AuthContext';
import { useCompanyData} from '../context/CompanyDataContext';

export default function CompanySwitcher() {
 const { user, switchCompany} = useAuth();
 const { companies} = useCompanyData();
  const [isOpen, setIsOpen] = useState(false);
 const dropdownRef = useRef<HTMLDivElement>(null);

 const activeCompanyId = user?.currentCompanyId || user?.companyId;
 const activeCompany = companies.find(c => c.id === activeCompanyId);

 useEffect(() => {
 const handleClickOutside = (event: MouseEvent) => {
 if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
 setIsOpen(false);
}
};
 document.addEventListener('mousedown', handleClickOutside);
 return () => document.removeEventListener('mousedown', handleClickOutside);
}, []);

 if (user?.role !== 'superadmin' && companies.length <= 1) {
 return (
 <div className={`flex items-center gap-3 px-4 py-2 rounded-xl border bg-slate-50 border-slate-200 text-slate-900`}>
 <Building2 className="w-4 h-4 text-[#00FFCC]"/>
 <span className="text-sm font-black uppercase tracking-wider truncate max-w-[150px]">
 {activeCompany?.name || 'Default Company'}
 </span>
 </div>
 );
}

 return (
 <div className="relative"ref={dropdownRef}>
 <button
 onClick={() => setIsOpen(!isOpen)}
 className={`flex items-center gap-3 px-4 py-2 rounded-xl border transition-all ${
 'bg-slate-50 border-slate-200 text-slate-900 hover:bg-slate-100'
}`}
 >
 <Building2 className="w-4 h-4 text-[#00FFCC]"/>
 <span className="text-sm font-black uppercase tracking-wider truncate max-w-[150px]">
 {activeCompany?.name || 'Select Company'}
 </span>
 <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
 </button>

 <AnimatePresence>
 {isOpen && (
 <motion.div
 initial={{ opacity: 0, y: 10}}
 animate={{ opacity: 1, y: 0}}
 exit={{ opacity: 0, y: 10}}
 className={`absolute top-full left-0 mt-2 w-64 rounded-xl border shadow-2xl z-50 overflow-hidden ${
 'bg-white border-slate-200'
}`}
 >
 <div className={`px-4 py-2 text-[10px] font-black uppercase tracking-[0.2em] border-b text-slate-400 border-slate-100`}>
 Switch Company
 </div>
 <div className="max-h-64 overflow-y-auto custom-scrollbar">
 {companies.map((company) => (
 <button
 key={company.id}
 onClick={() => {
 switchCompany(company.id);
 setIsOpen(false);
}}
 className={`w-full flex items-center justify-between px-4 py-3 text-sm transition-colors ${
 activeCompanyId === company.id
 ? 'bg-indigo-50 text-indigo-700'
 : 'text-slate-700 hover:bg-slate-50'
}`}
 >
 <span className="font-medium">{company.name}</span>
 {activeCompanyId === company.id && <Check className="w-4 h-4"/>}
 </button>
 ))}
 </div>
 </motion.div>
 )}
 </AnimatePresence>
 </div>
 );
}
