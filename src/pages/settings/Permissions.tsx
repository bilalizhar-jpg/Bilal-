import React, { useState} from 'react';
import { Shield, Plus, UserPlus, ChevronRight} from 'lucide-react';
import AdminLayout from '../../components/AdminLayout';
import { useEmployees} from '../../context/EmployeeContext';
import { ADMIN_MENU_ITEMS} from '../../constants';

export default function Permissions() {
 const { employees, updateEmployee} = useEmployees();
 
 const [selectedEmployee, setSelectedEmployee] = useState<string>('');

 const grantAccess = (menuName: string, employeeId: string) => {
 const employee = employees.find(e => e.id === employeeId);
 if (!employee) return;

 const allowedMenus = employee.allowedMenus || [];
 if (!allowedMenus.includes(menuName)) {
 updateEmployee(employeeId, { allowedMenus: [...allowedMenus, menuName]});
}
};

 const revokeAccess = (menuName: string, employeeId: string) => {
 const employee = employees.find(e => e.id === employeeId);
 if (!employee) return;

 const allowedMenus = employee.allowedMenus || [];
 updateEmployee(employeeId, { allowedMenus: allowedMenus.filter(m => m !== menuName)});
};

 return (
 <AdminLayout>
 <div className="space-y-6">
 <div>
 <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
 <Shield className="w-6 h-6 text-indigo-500"/>
 Rules & Permissions
 </h2>
 <p className="text-sm text-slate-500 mt-1">Manage menu access for employees.</p>
 </div>

 <div className={`rounded-xl border bg-white border-slate-200 shadow-sm overflow-hidden`}>
 <table className="w-full text-left text-sm">
 <thead className="bg-slate-50 border-b border-slate-200">
 <tr>
 <th className="px-4 py-3 font-semibold text-slate-700">Menu Name</th>
 <th className="px-4 py-3 font-semibold text-slate-700">Permission Granted</th>
 <th className="px-4 py-3 font-semibold text-slate-700">Permission Not Granted</th>
 <th className="px-4 py-3 font-semibold text-slate-700">Grant Access</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-slate-100">
 {ADMIN_MENU_ITEMS.map(menu => {
 const renderRow = (item: any, depth = 0) => {
 const granted = employees.filter(e => e.allowedMenus?.includes(item.name));
 const notGranted = employees.filter(e => !e.allowedMenus?.includes(item.name));

 return (
 <React.Fragment key={item.name}>
 <tr className="hover:bg-slate-50/50 transition-colors">
 <td className="px-4 py-3 font-medium text-slate-800">
 <div className="flex items-center gap-2"style={{ paddingLeft:`${depth * 24}px`}}>
 {depth > 0 && <ChevronRight className="w-3 h-3 text-slate-400"/>}
 {item.name}
 </div>
 </td>
 <td className="px-4 py-3">
 <div className="flex flex-wrap gap-1">
 {granted.map(e => (
 <span key={e.id} className="bg-emerald-100 text-emerald-800 px-2 py-1 rounded text-xs flex items-center gap-1">
 {e.name}
 <button onClick={() => revokeAccess(item.name, e.id)} className="text-emerald-600 hover:text-emerald-900">×</button>
 </span>
 ))}
 </div>
 </td>
 <td className="px-4 py-3">
 <div className="flex flex-wrap gap-1">
 {notGranted.map(e => (
 <span key={e.id} className="bg-slate-100 text-slate-800 px-2 py-1 rounded text-xs">
 {e.name}
 </span>
 ))}
 </div>
 </td>
 <td className="px-4 py-3">
 <div className="flex items-center gap-2">
 <select 
 className={`border rounded px-2 py-1 text-xs bg-white border-slate-300`}
 onChange={(e) => setSelectedEmployee(e.target.value)}
 value={selectedEmployee}
 >
 <option value="">Select Employee</option>
 {notGranted.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
 </select>
 <button 
 onClick={() => {
 if (selectedEmployee) {
 grantAccess(item.name, selectedEmployee);
 setSelectedEmployee('');
}
}}
 className="bg-indigo-600 text-white p-1.5 rounded hover:bg-indigo-700"
 >
 <Plus className="w-4 h-4"/>
 </button>
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
 </AdminLayout>
 );
}
