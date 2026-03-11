import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useTheme } from '../../../context/ThemeContext';
import { Search, Plus, Filter, Download, Calendar, FileText, Edit2, Trash2 } from 'lucide-react';
import AdminLayout from '../../../components/AdminLayout';
import { useCompanyData } from '../../../context/CompanyDataContext';

export default function Invoices() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [searchTerm, setSearchTerm] = useState('');
  const { accountInvoices, deleteEntity } = useCompanyData();

  const filteredInvoices = accountInvoices.filter(i => 
    i.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
    i.customer?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>Customer Invoices</h1>
            <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Manage your accounts receivable</p>
          </div>
          <div className="flex gap-2">
            <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors text-sm font-medium">
              <Plus className="w-4 h-4" />
              New Invoice
            </button>
          </div>
        </div>

        <div className={`p-6 rounded-xl border ${isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-200'} shadow-sm`}>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search invoices..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full pl-9 pr-4 py-2 rounded-md border outline-none transition-all ${
                  isDark ? 'bg-slate-900 border-slate-700 text-white focus:border-indigo-500' : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-indigo-500'
                }`}
              />
            </div>
            <button className={`flex items-center gap-2 px-4 py-2 rounded-md border transition-colors ${
              isDark ? 'border-slate-700 text-slate-300 hover:bg-slate-800' : 'border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}>
              <Filter className="w-4 h-4" />
              Filter
            </button>
            <button className={`flex items-center gap-2 px-4 py-2 rounded-md border transition-colors ${
              isDark ? 'border-slate-700 text-slate-300 hover:bg-slate-800' : 'border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}>
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className={`border-b ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
                  <th className={`px-4 py-3 text-left text-sm font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Number</th>
                  <th className={`px-4 py-3 text-left text-sm font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Customer</th>
                  <th className={`px-4 py-3 text-left text-sm font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Invoice Date</th>
                  <th className={`px-4 py-3 text-left text-sm font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Due Date</th>
                  <th className={`px-4 py-3 text-right text-sm font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Total</th>
                  <th className={`px-4 py-3 text-center text-sm font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Status</th>
                  <th className={`px-4 py-3 text-center text-sm font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                {filteredInvoices.map((invoice, index) => (
                  <motion.tr 
                    key={invoice.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`group transition-colors ${isDark ? 'hover:bg-slate-800/50' : 'hover:bg-slate-50'}`}
                  >
                    <td className="px-4 py-3">
                      <span className={`text-sm font-medium ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`}>{invoice.id}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-sm font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{invoice.customer}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-slate-400" />
                        <span className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{invoice.date}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-slate-400" />
                        <span className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{invoice.dueDate}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className={`text-sm font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                        ${invoice.total?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        invoice.status === 'Paid' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400' :
                        invoice.status === 'Open' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' :
                        invoice.status === 'Overdue' ? 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400' :
                        'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-400'
                      }`}>
                        {invoice.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button className={`p-1.5 rounded-md transition-colors ${isDark ? 'text-slate-400 hover:bg-slate-700 hover:text-white' : 'text-slate-500 hover:bg-slate-200 hover:text-slate-900'}`}>
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => deleteEntity('accountInvoices', invoice.id)}
                          className={`p-1.5 rounded-md transition-colors ${isDark ? 'text-red-400 hover:bg-red-900/50 hover:text-white' : 'text-red-500 hover:bg-red-100 hover:text-red-900'}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
                {filteredInvoices.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center">
                      <div className="flex flex-col items-center gap-3 opacity-50">
                        <FileText className="w-12 h-12" />
                        <p className="text-sm font-medium">No invoices found</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
