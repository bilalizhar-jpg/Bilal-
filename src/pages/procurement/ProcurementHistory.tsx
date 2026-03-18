import React, { useState} from 'react';
import { Search, Download, Filter, Loader2, Trash2} from 'lucide-react';
import AdminLayout from '../../components/AdminLayout';
import { useCompanyData} from '../../context/CompanyDataContext';
import * as XLSX from 'xlsx';

export default function ProcurementHistory() {
 const { procurementRequests, loading, deleteEntity} = useCompanyData();
  const [searchTerm, setSearchTerm] = useState('');

 const handleDelete = async (id: string) => {
 if (window.confirm('Are you sure you want to delete this request?')) {
 try {
 await deleteEntity('procurementRequests', id);
} catch (error) {
 console.error("Error deleting request:", error);
 alert("Failed to delete request");
}
}
};

 const handleExport = () => {
 if (procurementRequests.length === 0) {
 alert("No data to export");
 return;
}

 const exportData = procurementRequests.map((req, idx) => ({
 'Sl': idx + 1,
 'Employee': req.employeeName,
 'Department': req.department,
 'Items': req.items.map((i: any) =>`${i.itemName} (${i.quantity})`).join(', '),
 'Date': req.requestDate,
 'Priority': req.priority,
 'Status': req.status
}));

 const ws = XLSX.utils.json_to_sheet(exportData);
 const wb = XLSX.utils.book_new();
 XLSX.utils.book_append_sheet(wb, ws,"Procurement History");
 XLSX.writeFile(wb,`Procurement_History_${new Date().toISOString().split('T')[0]}.xlsx`);
};

 return (
 <AdminLayout>
 <div className="space-y-6">
 <div className={`rounded-xl border bg-white border-slate-200 shadow-sm overflow-hidden`}>
 <div className="p-4 border-b border-slate-100 flex justify-between items-center">
 <h2 className="font-bold text-slate-800">Procurement Request History</h2>
 <div className="flex gap-2">
 <button 
 onClick={handleExport}
 className="bg-[#28A745] text-white px-3 py-1.5 rounded text-xs font-bold flex items-center gap-1.5 hover:bg-[#218838]"
 >
 <Download className="w-3.5 h-3.5"/>
 Export
 </button>
 </div>
 </div>
 
 <div className="p-4 border-b border-slate-100 flex justify-end">
 <div className="relative">
 <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"/>
 <input 
 type="text"
 placeholder="Search history..."
 value={searchTerm}
 onChange={(e) => setSearchTerm(e.target.value)}
 className={`pl-10 pr-4 py-2 border rounded-md text-sm outline-none focus:ring-1 focus:ring-indigo-500 bg-white border-slate-200`}
 />
 </div>
 </div>

 <div className="p-6">
 <div className="overflow-x-auto border border-slate-100 rounded-lg">
 <table className="w-full text-left border-collapse">
 <thead>
 <tr className={`bg-slate-50 border-b border-slate-100`}>
 <th className="px-4 py-3 text-xs font-bold text-slate-600 uppercase">Employee</th>
 <th className="px-4 py-3 text-xs font-bold text-slate-600 uppercase">Department</th>
 <th className="px-4 py-3 text-xs font-bold text-slate-600 uppercase">Items</th>
 <th className="px-4 py-3 text-xs font-bold text-slate-600 uppercase">Request Date</th>
 <th className="px-4 py-3 text-xs font-bold text-slate-600 uppercase">Status</th>
 <th className="px-4 py-3 text-xs font-bold text-slate-600 uppercase text-right">Action</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-slate-100">
 {loading ? (
 <tr>
 <td colSpan={6} className="px-4 py-8 text-center">
 <div className="flex flex-col items-center gap-2">
 <Loader2 className="w-8 h-8 text-indigo-600 animate-spin"/>
 <p className="text-sm text-slate-500">Loading history...</p>
 </div>
 </td>
 </tr>
 ) : procurementRequests.length === 0 ? (
 <tr>
 <td colSpan={6} className="px-4 py-8 text-center text-slate-500 text-sm">
 No procurement requests found.
 </td>
 </tr>
 ) : procurementRequests.filter(h => 
 h.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
 h.department.toLowerCase().includes(searchTerm.toLowerCase())
 ).map((item) => (
 <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
 <td className="px-4 py-3 text-sm font-medium text-slate-800">{item.employeeName}</td>
 <td className="px-4 py-3 text-sm text-slate-600">{item.department}</td>
 <td className="px-4 py-3 text-sm text-slate-600">
 <div className="max-w-xs truncate"title={item.items.map((i: any) =>`${i.itemName} (${i.quantity})`).join(', ')}>
 {item.items.map((i: any) =>`${i.itemName} (${i.quantity})`).join(', ')}
 </div>
 </td>
 <td className="px-4 py-3 text-sm text-slate-600">{item.requestDate}</td>
 <td className="px-4 py-3 text-sm">
 <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${
 item.status === 'Approved' ? 'bg-emerald-100 text-emerald-600' : 
 item.status === 'Rejected' ? 'bg-red-100 text-red-600' : 
 item.status === 'Sent' ? 'bg-blue-100 text-blue-600' : 'bg-amber-100 text-amber-600'
}`}>
 {item.status}
 </span>
 </td>
 <td className="px-4 py-3 text-sm text-right">
 <button 
 onClick={() => handleDelete(item.id)}
 className="p-1.5 text-red-500 hover:bg-red-50 rounded"
 >
 <Trash2 className="w-4 h-4"/>
 </button>
 </td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 </div>
 </div>
 </div>
 </AdminLayout>
 );
}
