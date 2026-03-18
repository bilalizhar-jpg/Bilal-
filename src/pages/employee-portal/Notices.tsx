import React from 'react';
import EmployeeLayout from '../../components/EmployeeLayout';
import { Bell, Calendar, Search, Filter} from 'lucide-react';
import { motion} from 'motion/react';
import { useCompanyData} from '../../context/CompanyDataContext';

export default function EmployeeNotices() {
 const { notices: allNotices} = useCompanyData();
 
 const notices = allNotices.map(n => ({
 id: n.id,
 title: n.type,
 date: n.date,
 type: n.type,
 content: n.description,
 isNew: new Date(n.date) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
}));

 return (
 <EmployeeLayout>
 <div className="space-y-10 max-w-5xl mx-auto">
 <div className="flex flex-col sm:flex-row justify-between items-end gap-6 pb-8 border-b border-slate-100">
 <div className="space-y-2">
 <h1 className={`text-4xl font-bold tracking-tight text-slate-900`}>Notice Board</h1>
 <p className="text-slate-500 font-medium text-lg">Stay updated with the latest company announcements and events.</p>
 </div>
 
 <div className="flex items-center gap-3 w-full sm:w-auto">
 <div className="relative flex-1 sm:w-72">
 <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"/>
 <input 
 type="text"
 placeholder="Search announcements..."
 className={`w-full pl-11 pr-4 py-3 border rounded-2xl text-sm outline-none transition-all focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 bg-white border-slate-200 text-slate-900`}
 />
 </div>
 </div>
 </div>

 <div className="space-y-6">
 {notices.map((notice) => (
 <motion.div 
 key={notice.id} 
 initial={{ opacity: 0, y: 20}}
 whileInView={{ opacity: 1, y: 0}}
 viewport={{ once: true}}
 className={`group p-10 rounded-3xl border transition-all hover:shadow-2xl hover:shadow-indigo-500/5 ${
 'bg-white border-slate-100 hover:border-indigo-500/20 shadow-xl shadow-slate-200/40'
}`}
 >
 <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-8">
 <div className="space-y-3">
 <div className="flex items-center gap-4">
 <h3 className={`text-2xl font-bold tracking-tight group-hover:text-indigo-600 transition-colors text-slate-900`}>{notice.title}</h3>
 {notice.isNew && (
 <span className="px-3 py-1 rounded-lg bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest animate-pulse">
 New
 </span>
 )}
 </div>
 <div className="flex flex-wrap items-center gap-6 text-sm">
 <span className="flex items-center gap-2 text-slate-500 font-bold uppercase tracking-widest text-[10px]">
 <Calendar className="w-4 h-4 text-indigo-500"/>
 {notice.date}
 </span>
 <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${
 notice.type === 'Event' ? 'bg-blue-500/10 text-blue-600' :
 notice.type === 'Policy' ? 'bg-purple-500/10 text-purple-600' :
 notice.type === 'Alert' ? 'bg-rose-500/10 text-rose-600' :
 'bg-emerald-500/10 text-emerald-600'
}`}>
 {notice.type}
 </span>
 </div>
 </div>
 <div className={`p-4 rounded-2xl transition-all group-hover:scale-110 ${
 'bg-indigo-50 text-indigo-600 group-hover:bg-indigo-100'
}`}>
 <Bell className="w-7 h-7"/>
 </div>
 </div>
 
 <p className={`leading-relaxed text-lg font-medium text-slate-600`}>
 {notice.content}
 </p>

 <div className="mt-8 pt-8 border-t border-slate-100 flex items-center justify-between">
 <div className="flex -space-x-2">
 {[1,2,3].map(i => (
 <div key={i} className={`w-8 h-8 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-400`}>
 U{i}
 </div>
 ))}
 <div className={`w-8 h-8 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-400`}>
 +12
 </div>
 </div>
 <button className="text-xs font-bold uppercase tracking-widest text-indigo-600 hover:text-indigo-700 transition-colors">
 Acknowledge Receipt
 </button>
 </div>
 </motion.div>
 ))}
 
 {notices.length === 0 && (
 <div className={`py-24 text-center rounded-3xl border-2 border-dashed ${
 'border-slate-200 text-slate-400'
}`}>
 <div className="inline-flex p-6 rounded-3xl bg-slate-100 mb-6">
 <Bell className="w-10 h-10 opacity-50"/>
 </div>
 <h3 className={`text-xl font-bold mb-2 text-slate-900`}>No notices found</h3>
 <p className="text-sm font-medium">Stay tuned for future updates and announcements.</p>
 </div>
 )}
 </div>
 </div>
 </EmployeeLayout>
 );
}
