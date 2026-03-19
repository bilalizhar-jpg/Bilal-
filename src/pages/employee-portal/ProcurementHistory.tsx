import React, { useState} from 'react';
import { Search, Download, Loader2} from 'lucide-react';
import EmployeeLayout from '../../components/EmployeeLayout';
import { useCompanyData} from '../../context/CompanyDataContext';
import { useAuth} from '../../context/AuthContext';
import * as XLSX from 'xlsx';

export default function ProcurementHistory() {
 const { procurementRequests, loading} = useCompanyData();
 const { user} = useAuth();
  const [searchTerm, setSearchTerm] = useState('');

 // Filter requests for the current employee
 const employeeRequests = procurementRequests.filter(req => req.employeeId === (user?.employeeId || user?.id) || req.employeeName === user?.name);

 const handleExport = () => {
 if (employeeRequests.length === 0) {
 alert("No data to export");
 return;
}

 const exportData = employeeRequests.map((req, idx) => ({
 'Sl': idx + 1,
 'Items': req.items.map((i: any) =>`${i.itemName} (${i.quantity})`).join(', '),
 'Date': req.requestDate,
 'Priority': req.priority,
 'Status': req.status
}));

 const ws = XLSX.utils.json_to_sheet(exportData);
 const wb = XLSX.utils.book_new();
 XLSX.utils.book_append_sheet(wb, ws,"Procurement History");
 XLSX.writeFile(wb,`My_Procurement_History_${new Date().toISOString().split('T')[0]}.xlsx`);
};

 return (
 <EmployeeLayout>
 <div className="space-y-8 max-w-6xl mx-auto">
 <div className="flex flex-col sm:flex-row justify-between items-end gap-4">
 <div>
 <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Procurement History</h1>
 <p className="text-slate-500 mt-2 text-lg">Track and manage your past procurement requests.</p>
 </div>
 
 <div className="flex items-center gap-3 w-full sm:w-auto">
 <div className="relative flex-1 sm:w-64">
 <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"/>
 <input 
 type="text"
 placeholder="Search history..."
 value={searchTerm}
 onChange={(e) => setSearchTerm(e.target.value)}
 className={`w-full pl-10 pr-4 py-2.5 border rounded-xl text-sm outline-none transition-all focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white border-slate-200 text-slate-900`}
 />
 </div>
 <button 
 onClick={handleExport}
 className="flex items-center gap-2 bg-emerald-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-emerald-700 shadow-lg shadow-emerald-500/20 transition-all active:scale-95"
 >
 <Download className="w-4 h-4"/>
 Export
 </button>
 </div>
 </div>

 <div className={`rounded-3xl border shadow-xl overflow-hidden bg-white border-slate-100`}>
 <div className="overflow-x-auto">
 <table className="w-full text-left border-collapse">
 <thead>
 <tr className="bg-slate-50 text-[10px] font-bold uppercase tracking-wider text-slate-500">
 <th className="p-6 border-b border-slate-100">Requested Items</th>
 <th className="p-6 border-b border-slate-100">Request Date</th>
 <th className="p-6 border-b border-slate-100">Priority</th>
 <th className="p-6 border-b border-slate-100">Status</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-slate-100">
 {loading ? (
 <tr>
 <td colSpan={4} className="p-20 text-center">
 <div className="flex flex-col items-center gap-4">
 <Loader2 className="w-10 h-10 text-indigo-600 animate-spin"/>
 <p className="text-slate-500 font-medium">Loading history...</p>
 </div>
 </td>
 </tr>
 ) : employeeRequests.length === 0 ? (
 <tr>
 <td colSpan={4} className="p-20 text-center">
 <div className="flex flex-col items-center gap-4 opacity-50">
 <Search className="w-12 h-12 text-slate-400"/>
 <p className="text-slate-500 font-medium text-lg">No procurement requests found.</p>
 </div>
 </td>
 </tr>
 ) : employeeRequests.filter(h => 
 h.items.some((i: any) => i.itemName.toLowerCase().includes(searchTerm.toLowerCase()))
 ).map((item) => (
 <tr key={item.id} className="group hover:bg-slate-50/50 transition-colors">
 <td className="p-6">
 <div className="space-y-1">
 <p className="text-slate-900 font-bold group-hover:text-indigo-500 transition-colors">
 {item.items.map((i: any) => i.itemName).join(', ')}
 </p>
 <p className="text-xs text-slate-500">
 {item.items.map((i: any) =>`${i.itemName} (${i.quantity})`).join(', ')}
 </p>
 </div>
 </td>
 <td className="p-6 text-sm text-slate-600 font-medium">{item.requestDate}</td>
 <td className="p-6">
 <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${
 item.priority === 'Urgent' ? 'bg-rose-100 text-rose-700 ' :
 item.priority === 'High' ? 'bg-amber-100 text-amber-700 ' :
 'bg-slate-100 text-slate-700 '
}`}>
 {item.priority}
 </span>
 </td>
 <td className="p-6">
 <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
 item.status === 'Approved' ? 'bg-emerald-100 text-emerald-700 ' : 
 item.status === 'Rejected' ? 'bg-rose-100 text-rose-700 ' : 
 item.status === 'Sent' ? 'bg-blue-100 text-blue-700 ' : 
 'bg-amber-100 text-amber-700 '
}`}>
 {item.status}
 </span>
 </td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 </div>
 </div>
 </EmployeeLayout>
 );
}
