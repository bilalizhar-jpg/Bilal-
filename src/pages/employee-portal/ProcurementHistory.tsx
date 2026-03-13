import React, { useState } from 'react';
import { Search, Download, Loader2 } from 'lucide-react';
import EmployeeLayout from '../../components/EmployeeLayout';
import { useTheme } from '../../context/ThemeContext';
import { useCompanyData } from '../../context/CompanyDataContext';
import { useAuth } from '../../context/AuthContext';
import * as XLSX from 'xlsx';

export default function ProcurementHistory() {
  const { theme } = useTheme();
  const { procurementRequests, loading } = useCompanyData();
  const { user } = useAuth();
  const isDark = theme === 'dark';
  const [searchTerm, setSearchTerm] = useState('');

  // Filter requests for the current employee
  const employeeRequests = procurementRequests.filter(req => req.employeeId === user?.id || req.employeeName === user?.name);

  const handleExport = () => {
    if (employeeRequests.length === 0) {
      alert("No data to export");
      return;
    }

    const exportData = employeeRequests.map((req, idx) => ({
      'Sl': idx + 1,
      'Items': req.items.map((i: any) => `${i.itemName} (${i.quantity})`).join(', '),
      'Date': req.requestDate,
      'Priority': req.priority,
      'Status': req.status
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Procurement History");
    XLSX.writeFile(wb, `My_Procurement_History_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  return (
    <EmployeeLayout>
      <div className="space-y-6">
        <div className={`rounded-xl border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} shadow-sm overflow-hidden`}>
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
            <h2 className="font-bold text-slate-800 dark:text-white">My Procurement Request History</h2>
            <div className="flex gap-2">
              <button 
                onClick={handleExport}
                className="bg-[#28A745] text-white px-3 py-1.5 rounded text-xs font-bold flex items-center gap-1.5 hover:bg-[#218838]"
              >
                <Download className="w-3.5 h-3.5" />
                Export
              </button>
            </div>
          </div>
          
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-end">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search history..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`pl-10 pr-4 py-2 border rounded-md text-sm outline-none focus:ring-1 focus:ring-indigo-500 ${isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200'}`}
              />
            </div>
          </div>

          <div className="p-6">
            <div className="overflow-x-auto border border-slate-100 dark:border-slate-800 rounded-lg">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className={`${isDark ? 'bg-slate-800/50' : 'bg-slate-50'} border-b border-slate-100 dark:border-slate-800`}>
                    <th className="px-4 py-3 text-xs font-bold text-slate-600 dark:text-slate-400 uppercase">Items</th>
                    <th className="px-4 py-3 text-xs font-bold text-slate-600 dark:text-slate-400 uppercase">Request Date</th>
                    <th className="px-4 py-3 text-xs font-bold text-slate-600 dark:text-slate-400 uppercase">Priority</th>
                    <th className="px-4 py-3 text-xs font-bold text-slate-600 dark:text-slate-400 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {loading ? (
                    <tr>
                      <td colSpan={4} className="px-4 py-8 text-center">
                        <div className="flex flex-col items-center gap-2">
                          <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
                          <p className="text-sm text-slate-500">Loading history...</p>
                        </div>
                      </td>
                    </tr>
                  ) : employeeRequests.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-4 py-8 text-center text-slate-500 text-sm">
                        No procurement requests found.
                      </td>
                    </tr>
                  ) : employeeRequests.filter(h => 
                      h.items.some((i: any) => i.itemName.toLowerCase().includes(searchTerm.toLowerCase()))
                    ).map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400">
                        <div className="max-w-xs truncate" title={item.items.map((i: any) => `${i.itemName} (${i.quantity})`).join(', ')}>
                          {item.items.map((i: any) => `${i.itemName} (${i.quantity})`).join(', ')}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400">{item.requestDate}</td>
                      <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400">{item.priority}</td>
                      <td className="px-4 py-3 text-sm">
                        <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${
                          item.status === 'Approved' ? 'bg-emerald-100 text-emerald-600' : 
                          item.status === 'Rejected' ? 'bg-red-100 text-red-600' : 
                          item.status === 'Sent' ? 'bg-blue-100 text-blue-600' : 'bg-amber-100 text-amber-600'
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
      </div>
    </EmployeeLayout>
  );
}
