import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useTheme } from '../../../context/ThemeContext';
import { Search, Filter, Download, Calendar, ChevronDown, ChevronRight } from 'lucide-react';
import AdminLayout from '../../../components/AdminLayout';
import { useCompanyData } from '../../../context/CompanyDataContext';

export default function GeneralLedger() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedAccounts, setExpandedAccounts] = useState<string[]>([]);
  const { ledgers, ledgerGroups } = useCompanyData();

  const toggleAccount = (id: string) => {
    setExpandedAccounts(prev => 
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
  };

  const filteredLedgers = ledgers.filter(l => 
    l.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.code?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>General Ledger</h1>
            <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Detailed transaction history for all accounts</p>
          </div>
          <div className="flex gap-2">
            <button className={`flex items-center gap-2 px-4 py-2 rounded-md border transition-colors ${
              isDark ? 'border-slate-700 text-slate-300 hover:bg-slate-800' : 'border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}>
              <Calendar className="w-4 h-4" />
              This Month
            </button>
            <button className={`flex items-center gap-2 px-4 py-2 rounded-md border transition-colors ${
              isDark ? 'border-slate-700 text-slate-300 hover:bg-slate-800' : 'border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}>
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>
        </div>

        <div className={`p-6 rounded-xl border ${isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-200'} shadow-sm`}>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search accounts or transactions..."
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
          </div>

          <div className="space-y-4">
            {filteredLedgers.map((account) => (
              <div key={account.id} className={`border rounded-lg overflow-hidden ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
                <button 
                  onClick={() => toggleAccount(account.id)}
                  className={`w-full flex items-center justify-between p-4 transition-colors ${
                    isDark ? 'bg-slate-800/50 hover:bg-slate-800' : 'bg-slate-50 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {expandedAccounts.includes(account.id) ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                    <span className={`font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>{account.code} - {account.name}</span>
                  </div>
                  <div className="flex gap-8">
                    <div className="text-right">
                      <p className="text-[10px] uppercase tracking-wider text-slate-500">Debit</p>
                      <p className={`text-sm font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>${(account.totalDebit || 0).toLocaleString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] uppercase tracking-wider text-slate-500">Credit</p>
                      <p className={`text-sm font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>${(account.totalCredit || 0).toLocaleString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] uppercase tracking-wider text-slate-500">Balance</p>
                      <p className={`text-sm font-bold ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`}>${(account.finalBalance || 0).toLocaleString()}</p>
                    </div>
                  </div>
                </button>

                {expandedAccounts.includes(account.id) && (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className={`border-y text-xs uppercase tracking-wider ${isDark ? 'border-slate-700 bg-slate-900/50 text-slate-500' : 'border-slate-200 bg-white text-slate-500'}`}>
                          <th className="px-4 py-2 text-left">Date</th>
                          <th className="px-4 py-2 text-left">Reference</th>
                          <th className="px-4 py-2 text-left">Partner</th>
                          <th className="px-4 py-2 text-left">Label</th>
                          <th className="px-4 py-2 text-right">Debit</th>
                          <th className="px-4 py-2 text-right">Credit</th>
                          <th className="px-4 py-2 text-right">Balance</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                        {(account.transactions || []).map((tx: any, idx: number) => (
                          <tr key={idx} className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                            <td className="px-4 py-3 whitespace-nowrap">{tx.date}</td>
                            <td className="px-4 py-3 font-medium text-indigo-500">{tx.ref}</td>
                            <td className="px-4 py-3">{tx.partner}</td>
                            <td className="px-4 py-3">{tx.label}</td>
                            <td className="px-4 py-3 text-right">{(tx.debit || 0) > 0 ? `$${(tx.debit || 0).toLocaleString()}` : '-'}</td>
                            <td className="px-4 py-3 text-right">{(tx.credit || 0) > 0 ? `$${(tx.credit || 0).toLocaleString()}` : '-'}</td>
                            <td className="px-4 py-3 text-right font-medium text-slate-700 dark:text-slate-300">${(tx.balance || 0).toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
