import React, { useState } from 'react';
import { motion } from 'motion/react';
import { BarChart3, Download, Printer, Calendar, Filter, PieChart, TrendingUp, TrendingDown, FileText, ChevronRight } from 'lucide-react';
import { useCompanyData } from '../../../context/CompanyDataContext';
import { useTheme } from '../../../context/ThemeContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart as RePieChart, Pie } from 'recharts';
import AdminLayout from '../../../components/AdminLayout';

const REPORT_CATEGORIES = [
  {
    title: 'Financial Statements',
    reports: ['Balance Sheet', 'Income Statement', 'Cash Flow', 'Trial Balance', 'Receipt & Payment']
  },
  {
    title: 'Ledgers & Books',
    reports: ['General Ledger', 'Ledger Report', 'Journal Report', 'Day Book', 'Cash Book', 'Bank Book', 'Bank Reconciliation']
  },
  {
    title: 'Sales & Customers',
    reports: ['Sales Register', 'Customer Statement', 'Aging Report', 'Outstanding Report', 'Salesman Report', 'Commission Report', 'Discount Report', 'Income Report']
  },
  {
    title: 'Purchases & Vendors',
    reports: ['Purchase Register', 'Vendor Statement', 'Expense Report', 'Voucher Report']
  },
  {
    title: 'Inventory',
    reports: ['Inventory Report', 'Stock Ledger', 'Item Valuation']
  },
  {
    title: 'Taxation',
    reports: ['Tax Report', 'Tax Summary', 'GST Report', 'TDS Report', 'TCS Report']
  }
];

export default function AccountReports() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const { bankAccounts, accountPayments, vouchers } = useCompanyData();
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [selectedReport, setSelectedReport] = useState<string | null>(null);

  // Data for charts based on real data
  const totalBalance = bankAccounts.reduce((sum, acc) => sum + (acc.balance || 0), 0);
  
  const paymentStats = [
    { name: 'Vouchers', value: accountPayments.filter(p => p.type === 'voucher').reduce((sum, p) => sum + p.amount, 0) },
    { name: 'Invoices', value: accountPayments.filter(p => p.type === 'invoice').reduce((sum, p) => sum + p.amount, 0) },
  ];

  const monthlyData = [
    { name: 'Jan', income: 0, expense: 0 },
    { name: 'Feb', income: 0, expense: 0 },
    { name: 'Mar', income: 0, expense: 0 },
    { name: 'Apr', income: 0, expense: 0 },
    { name: 'May', income: 0, expense: 0 },
    { name: 'Jun', income: 0, expense: 0 },
  ];

  const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444'];

  if (selectedReport) {
    return (
      <AdminLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setSelectedReport(null)}
                className={`p-2 rounded-xl transition-all ${isDark ? 'hover:bg-white/5 text-slate-400 hover:text-white' : 'hover:bg-slate-100 text-slate-500 hover:text-slate-700'}`}
              >
                <ChevronRight className="w-5 h-5 rotate-180" />
              </button>
              <div>
                <h1 className={`text-2xl font-black uppercase tracking-tighter ${isDark ? 'text-white' : 'text-slate-800'}`}>{selectedReport}</h1>
                <p className="text-slate-500 text-xs font-black uppercase tracking-widest">Report View</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button className={`p-2.5 rounded-xl transition-all ${isDark ? 'bg-white/5 text-slate-400 hover:text-white' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}`}>
                <Download className="w-4 h-4" />
              </button>
              <button className={`p-2.5 rounded-xl transition-all ${isDark ? 'bg-white/5 text-slate-400 hover:text-white' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}`}>
                <Printer className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className={`p-12 rounded-3xl border flex flex-col items-center justify-center text-center ${isDark ? 'bg-black/40 border-white/5' : 'bg-white border-slate-200 shadow-sm'}`}>
            <div className={`p-4 rounded-full mb-4 ${isDark ? 'bg-indigo-500/20 text-indigo-400' : 'bg-indigo-50 text-indigo-600'}`}>
              <FileText className="w-8 h-8" />
            </div>
            <h3 className={`text-xl font-black mb-2 ${isDark ? 'text-white' : 'text-slate-800'}`}>{selectedReport}</h3>
            <p className="text-slate-500 max-w-md">
              This report is currently under development. It will provide detailed insights and data for {selectedReport.toLowerCase()} in future updates.
            </p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-2xl ${isDark ? 'bg-indigo-500/20 text-indigo-400' : 'bg-indigo-100 text-indigo-600'}`}>
              <BarChart3 className="w-6 h-6" />
            </div>
            <div>
              <h1 className={`text-2xl font-black uppercase tracking-tighter ${isDark ? 'text-white' : 'text-slate-800'}`}>Financial Reports</h1>
              <p className="text-slate-500 text-xs font-black uppercase tracking-widest">Analyze your company's financial performance</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className={`p-6 rounded-3xl border ${isDark ? 'bg-black/40 border-white/5' : 'bg-white border-slate-200 shadow-sm'}`}>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Total Cash Balance</p>
            <h3 className={`text-2xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>${totalBalance.toLocaleString()}</h3>
            <div className="flex items-center gap-1 mt-2 text-emerald-500">
              <TrendingUp className="w-3 h-3" />
              <span className="text-[10px] font-black uppercase tracking-widest">+0.0%</span>
            </div>
          </div>
          <div className={`p-6 rounded-3xl border ${isDark ? 'bg-black/40 border-white/5' : 'bg-white border-slate-200 shadow-sm'}`}>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Monthly Income</p>
            <h3 className={`text-2xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>$0</h3>
            <div className="flex items-center gap-1 mt-2 text-emerald-500">
              <TrendingUp className="w-3 h-3" />
              <span className="text-[10px] font-black uppercase tracking-widest">+0.0%</span>
            </div>
          </div>
          <div className={`p-6 rounded-3xl border ${isDark ? 'bg-black/40 border-white/5' : 'bg-white border-slate-200 shadow-sm'}`}>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Monthly Expense</p>
            <h3 className={`text-2xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>$0</h3>
            <div className="flex items-center gap-1 mt-2 text-red-500">
              <TrendingDown className="w-3 h-3" />
              <span className="text-[10px] font-black uppercase tracking-widest">+0.0%</span>
            </div>
          </div>
          <div className={`p-6 rounded-3xl border ${isDark ? 'bg-black/40 border-white/5' : 'bg-white border-slate-200 shadow-sm'}`}>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Net Profit</p>
            <h3 className={`text-2xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>$0</h3>
            <div className="flex items-center gap-1 mt-2 text-emerald-500">
              <TrendingUp className="w-3 h-3" />
              <span className="text-[10px] font-black uppercase tracking-widest">+0.0%</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className={`p-8 rounded-3xl border ${isDark ? 'bg-black/40 border-white/5' : 'bg-white border-slate-200 shadow-sm'}`}>
            <div className="flex items-center justify-between mb-8">
              <h3 className={`text-sm font-black uppercase tracking-widest ${isDark ? 'text-white' : 'text-slate-800'}`}>Income vs Expense</h3>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Income</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Expense</span>
                </div>
              </div>
            </div>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? '#ffffff10' : '#00000010'} />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 10, fontWeight: 700, fill: isDark ? '#94a3b8' : '#64748b' }} 
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 10, fontWeight: 700, fill: isDark ? '#94a3b8' : '#64748b' }} 
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: isDark ? '#0f172a' : '#ffffff', 
                      border: 'none', 
                      borderRadius: '12px',
                      boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'
                    }} 
                  />
                  <Bar dataKey="income" fill="#6366f1" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="expense" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className={`p-8 rounded-3xl border ${isDark ? 'bg-black/40 border-white/5' : 'bg-white border-slate-200 shadow-sm'}`}>
            <h3 className={`text-sm font-black uppercase tracking-widest mb-8 ${isDark ? 'text-white' : 'text-slate-800'}`}>Payment Distribution</h3>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RePieChart>
                  <Pie
                    data={paymentStats}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {paymentStats.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </RePieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-6 mt-4">
              {paymentStats.map((stat, index) => (
                <div key={stat.name} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index] }}></div>
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{stat.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-8">
          <h2 className={`text-lg font-black uppercase tracking-widest mb-6 ${isDark ? 'text-white' : 'text-slate-800'}`}>Reports Directory</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {REPORT_CATEGORIES.map((category, idx) => (
              <div key={idx} className={`p-6 rounded-3xl border ${isDark ? 'bg-black/40 border-white/5' : 'bg-white border-slate-200 shadow-sm'}`}>
                <h3 className={`text-sm font-black uppercase tracking-widest mb-4 ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`}>
                  {category.title}
                </h3>
                <ul className="space-y-2">
                  {category.reports.map((report, rIdx) => (
                    <li key={rIdx}>
                      <button
                        onClick={() => setSelectedReport(report)}
                        className={`w-full flex items-center justify-between p-3 rounded-xl text-left transition-all ${
                          isDark 
                            ? 'hover:bg-white/5 text-slate-300 hover:text-white' 
                            : 'hover:bg-slate-50 text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <FileText className="w-4 h-4 opacity-50" />
                          <span className="text-sm font-medium">{report}</span>
                        </div>
                        <ChevronRight className="w-4 h-4 opacity-30" />
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
  );
}
