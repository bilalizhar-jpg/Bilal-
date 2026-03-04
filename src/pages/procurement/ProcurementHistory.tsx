import React, { useState } from 'react';
import { Search, Download, Filter } from 'lucide-react';
import AdminLayout from '../../components/AdminLayout';
import { useTheme } from '../../context/ThemeContext';

interface ProcurementHistoryRecord {
  id: string;
  itemName: string;
  quantity: number;
  requestDate: string;
  status: 'Approved' | 'Rejected' | 'Pending';
  department: string;
}

const initialHistory: ProcurementHistoryRecord[] = [
  { id: '1', itemName: 'MacBook Pro', quantity: 2, requestDate: '2026-02-15', status: 'Approved', department: 'Engineering' },
  { id: '2', itemName: 'Office Chairs', quantity: 10, requestDate: '2026-02-10', status: 'Approved', department: 'HR' },
  { id: '3', itemName: 'Whiteboard Markers', quantity: 50, requestDate: '2026-02-05', status: 'Rejected', department: 'Design' },
];

export default function ProcurementHistory() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className={`rounded-xl border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} shadow-sm overflow-hidden`}>
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
            <h2 className="font-bold text-slate-800 dark:text-white">Procurement Request History</h2>
            <div className="flex gap-2">
              <button className="bg-[#28A745] text-white px-3 py-1.5 rounded text-xs font-bold flex items-center gap-1.5 hover:bg-[#218838]">
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
                    <th className="px-4 py-3 text-xs font-bold text-slate-600 dark:text-slate-400 uppercase">Item Name</th>
                    <th className="px-4 py-3 text-xs font-bold text-slate-600 dark:text-slate-400 uppercase">Quantity</th>
                    <th className="px-4 py-3 text-xs font-bold text-slate-600 dark:text-slate-400 uppercase">Department</th>
                    <th className="px-4 py-3 text-xs font-bold text-slate-600 dark:text-slate-400 uppercase">Request Date</th>
                    <th className="px-4 py-3 text-xs font-bold text-slate-600 dark:text-slate-400 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {initialHistory.filter(h => h.itemName.toLowerCase().includes(searchTerm.toLowerCase())).map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="px-4 py-3 text-sm font-medium text-slate-800 dark:text-white">{item.itemName}</td>
                      <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400">{item.quantity}</td>
                      <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400">{item.department}</td>
                      <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400">{item.requestDate}</td>
                      <td className="px-4 py-3 text-sm">
                        <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${
                          item.status === 'Approved' ? 'bg-emerald-100 text-emerald-600' : 
                          item.status === 'Rejected' ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-600'
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
    </AdminLayout>
  );
}
