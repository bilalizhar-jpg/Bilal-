import React, { useState } from 'react';
import { Search, Loader2, CheckCircle2, XCircle } from 'lucide-react';
import AdminLayout from '../../components/AdminLayout';
import { useTheme } from '../../context/ThemeContext';
import { useCompanyData } from '../../context/CompanyDataContext';

export default function ProcurementReceived() {
  const { theme } = useTheme();
  const { procurementRequests, loading, updateEntity } = useCompanyData();
  const isDark = theme === 'dark';
  const [searchTerm, setSearchTerm] = useState('');

  const pendingRequests = procurementRequests.filter(req => req.status === 'Pending' || req.status === 'Sent');

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      await updateEntity('procurementRequests', id, { status: newStatus });
      alert(`Request ${newStatus} successfully!`);
    } catch (error) {
      console.error("Error updating request status:", error);
      alert("Failed to update request status");
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className={`rounded-xl border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} shadow-sm overflow-hidden`}>
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
            <h2 className="font-bold text-slate-800 dark:text-white">Item Request Received</h2>
          </div>
          
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-end">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search requests..." 
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
                    <th className="px-4 py-3 text-xs font-bold text-slate-600 dark:text-slate-400 uppercase">Employee</th>
                    <th className="px-4 py-3 text-xs font-bold text-slate-600 dark:text-slate-400 uppercase">Items</th>
                    <th className="px-4 py-3 text-xs font-bold text-slate-600 dark:text-slate-400 uppercase">Request Date</th>
                    <th className="px-4 py-3 text-xs font-bold text-slate-600 dark:text-slate-400 uppercase text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {loading ? (
                    <tr>
                      <td colSpan={4} className="px-4 py-8 text-center">
                        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mx-auto" />
                      </td>
                    </tr>
                  ) : pendingRequests.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-4 py-8 text-center text-slate-500 text-sm">
                        No pending requests received.
                      </td>
                    </tr>
                  ) : pendingRequests.filter(h => 
                      h.employeeName.toLowerCase().includes(searchTerm.toLowerCase())
                    ).map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="px-4 py-3 text-sm font-medium text-slate-800 dark:text-white">{item.employeeName}</td>
                      <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400">
                        {item.items.map((i: any) => `${i.itemName} (${i.quantity})`).join(', ')}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400">{item.requestDate}</td>
                      <td className="px-4 py-3 text-sm text-right flex justify-end gap-2">
                        <button 
                          onClick={() => handleStatusChange(item.id, 'Approved')}
                          className="p-1.5 text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded"
                          title="Approve"
                        >
                          <CheckCircle2 className="w-5 h-5" />
                        </button>
                        <button 
                          onClick={() => handleStatusChange(item.id, 'Rejected')}
                          className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                          title="Reject"
                        >
                          <XCircle className="w-5 h-5" />
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
