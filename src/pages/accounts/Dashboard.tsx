import React from 'react';
import { motion } from 'motion/react';
import { LayoutDashboard, TrendingUp, Users, FileText, DollarSign, ArrowUpRight, ArrowDownRight, CreditCard, Building2, CheckCircle2 } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useCompanyData } from '../../context/CompanyDataContext';

import AdminLayout from '../../components/AdminLayout';

export default function AccountingDashboard() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const { procurementRequests } = useCompanyData();

  const approvedRequests = procurementRequests.filter(req => req.status === 'Approved');

  const cards = [
    { title: 'Bank', balance: '$ 45,231.89', status: '12 to reconcile', icon: Building2, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { title: 'Cash', balance: '$ 5,200.00', status: '3 to reconcile', icon: DollarSign, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    { title: 'Customer Invoices', balance: '$ 12,450.00', status: '5 unpaid invoices', icon: FileText, color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
    { title: 'Vendor Bills', balance: '$ 8,230.00', status: '2 bills to pay', icon: CreditCard, color: 'text-rose-500', bg: 'bg-rose-500/10' },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>Accounting Dashboard</h1>
            <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Overview of your financial status</p>
          </div>
          <div className="flex gap-2">
            <button className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors text-sm font-medium">
              New Invoice
            </button>
            <button className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-md hover:bg-slate-50 transition-colors text-sm font-medium dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-700">
              New Bill
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {cards.map((card, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`p-6 rounded-xl border ${isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-200'} shadow-sm`}
            >
              <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-lg ${card.bg}`}>
                  <card.icon className={`w-6 h-6 ${card.color}`} />
                </div>
                <button className={`text-sm font-medium ${isDark ? 'text-indigo-400' : 'text-indigo-600'} hover:underline`}>
                  View
                </button>
              </div>
              <h3 className={`text-sm font-medium mb-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{card.title}</h3>
              <div className={`text-2xl font-bold mb-2 ${isDark ? 'text-white' : 'text-slate-800'}`}>{card.balance}</div>
              <div className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{card.status}</div>
              
              <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700 flex gap-2">
                <button className={`flex-1 py-1.5 text-xs font-medium rounded bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600 transition-colors`}>
                  New Transaction
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className={`p-6 rounded-xl border ${isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-200'} shadow-sm lg:col-span-2`}>
            <h3 className={`text-lg font-bold mb-4 ${isDark ? 'text-white' : 'text-slate-800'}`}>Recent Transactions</h3>
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors border border-transparent hover:border-slate-100 dark:hover:border-slate-700">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${i % 2 === 0 ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                      {i % 2 === 0 ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownRight className="w-5 h-5" />}
                    </div>
                    <div>
                      <div className={`font-medium ${isDark ? 'text-white' : 'text-slate-800'}`}>{i % 2 === 0 ? 'Customer Payment' : 'Vendor Bill'}</div>
                      <div className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Today, 10:42 AM</div>
                    </div>
                  </div>
                  <div className={`font-bold ${i % 2 === 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                    {i % 2 === 0 ? '+' : '-'}${(Math.random() * 1000).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className={`p-6 rounded-xl border ${isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-200'} shadow-sm`}>
            <h3 className={`text-lg font-bold mb-4 ${isDark ? 'text-white' : 'text-slate-800'}`}>Approved Procurement</h3>
            <div className="space-y-4">
              {approvedRequests.length === 0 ? (
                <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>No approved requests.</p>
              ) : (
                approvedRequests.map((req) => (
                  <div key={req.id} className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                    <div>
                      <div className={`font-medium text-sm ${isDark ? 'text-white' : 'text-slate-800'}`}>{req.employeeName}</div>
                      <div className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{req.items.length} items</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
