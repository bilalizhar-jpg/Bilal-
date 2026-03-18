import React from 'react';
import { Shield, ChevronRight} from 'lucide-react';
import SuperAdminLayout from '../../components/SuperAdminLayout';
import { useSuperAdmin} from '../../context/SuperAdminContext';
import { ADMIN_MENU_ITEMS} from '../../constants';

export default function EmployeePermissions() {
 const { companies, toggleMenuAccess} = useSuperAdmin();
 
 return (
 <SuperAdminLayout>
 <div className="space-y-6">
 <div>
 <h2 className="text-2xl font-bold text-white flex items-center gap-2">
 <Shield className="w-6 h-6 text-indigo-500"/>
 Employer Panel Permissions
 </h2>
 <p className="text-sm text-slate-400 mt-1">Manage module access for companies.</p>
 </div>

 <div className={`rounded-xl border bg-white border-slate-200 shadow-sm overflow-hidden`}>
 <table className="w-full text-left text-sm">
 <thead className="bg-slate-800/50 border-b border-slate-800">
 <tr>
 <th className="px-4 py-3 font-semibold text-slate-300">Module Name</th>
 <th className="px-4 py-3 font-semibold text-slate-300">Access Granted</th>
 <th className="px-4 py-3 font-semibold text-slate-300">Access Restricted</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-slate-800">
 {ADMIN_MENU_ITEMS.map(menu => {
 const renderRow = (item: any, depth = 0) => {
 const granted = companies.filter(c => !c.blockedMenus?.includes(item.name));
 const restricted = companies.filter(c => c.blockedMenus?.includes(item.name));

 return (
 <React.Fragment key={item.name}>
 <tr className="hover:bg-slate-800/30 transition-colors">
 <td className="px-4 py-3 font-medium text-slate-200">
 <div className="flex items-center gap-2"style={{ paddingLeft:`${depth * 24}px`}}>
 {depth > 0 && <ChevronRight className="w-3 h-3 text-slate-500"/>}
 {item.name}
 </div>
 </td>
 <td className="px-4 py-3">
 <div className="flex flex-wrap gap-1">
 {granted.map(c => (
 <span key={c.id} className="bg-emerald-900/30 text-emerald-400 px-2 py-1 rounded text-xs flex items-center gap-1">
 {c.name}
 <button onClick={() => toggleMenuAccess(c.id, item.name)} className="text-emerald-600 hover:text-emerald-100">×</button>
 </span>
 ))}
 </div>
 </td>
 <td className="px-4 py-3">
 <div className="flex flex-wrap gap-1">
 {restricted.map(c => (
 <span key={c.id} className="bg-rose-900/30 text-rose-400 px-2 py-1 rounded text-xs flex items-center gap-1">
 {c.name}
 <button onClick={() => toggleMenuAccess(c.id, item.name)} className="text-rose-600 hover:text-rose-100">+</button>
 </span>
 ))}
 </div>
 </td>
 </tr>
 {item.hasSub && item.subItems?.map((sub: any) => renderRow(sub, depth + 1))}
 </React.Fragment>
 );
};

 return renderRow(menu);
})}
 </tbody>
 </table>
 </div>
 </div>
 </SuperAdminLayout>
 );
}
