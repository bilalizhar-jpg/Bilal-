import React from 'react';
import AccountingLayout from '../../components/accounting/AccountingLayout';
import { motion } from 'motion/react';
import { DollarSign, TrendingUp, TrendingDown, Activity, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export default function AccountingDashboard() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const metrics = [
    { title: 'Total Assets', amount: '$124,500.00', trend: '+12.5%', isPositive: true, icon: DollarSign },
    { title: 'Total Liabilities', amount: '$45,200.00', trend: '-2.4%', isPositive: true, icon: Activity },
    { title: 'Net Income', amount: '$32,450.00', trend: '+8.2%', isPositive: true, icon: TrendingUp },
    { title: 'Total Expenses', amount: '$18,900.00', trend: '+4.1%', isPositive: false, icon: TrendingDown },
  ];

  return (
    <AccountingLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className={`text-2xl font-black uppercase tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Accounting Dashboard
            </h1>
            <p className={`text-sm ${isDark ? 'text-[#B0B0C3]' : 'text-slate-500'}`}>
              Overview of your financial status
            </p>
          </div>
          <div className="flex gap-2">
            <button className={`px-4 py-2 rounded-md font-bold text-sm uppercase tracking-widest transition-colors ${
              isDark 
                ? 'bg-[#00FFCC] text-[#1E1E2F] hover:bg-[#00D1FF] shadow-[0_0_8px_rgba(0,255,204,0.4)]' 
                : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md'
            }`}>
              New Journal Entry
            </button>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {metrics.map((metric, index) => {
            const Icon = metric.icon;
            return (
              <motion.div
                key={metric.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`p-6 rounded-2xl border ${
                  isDark 
                    ? 'bg-[#2A2A3D] border-white/5 shadow-[0_4px_20px_rgba(0,0,0,0.2)]' 
                    : 'bg-white border-slate-200 shadow-sm'
                }`}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className={`p-3 rounded-xl ${
                    isDark ? 'bg-[#1E1E2F]' : 'bg-slate-50'
                  }`}>
                    <Icon className={`w-6 h-6 ${isDark ? 'text-[#00FFCC]' : 'text-indigo-600'}`} />
                  </div>
                  <span className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${
                    metric.isPositive 
                      ? isDark ? 'bg-emerald-500/10 text-emerald-400' : 'bg-emerald-100 text-emerald-700'
                      : isDark ? 'bg-red-500/10 text-red-400' : 'bg-red-100 text-red-700'
                  }`}>
                    {metric.isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                    {metric.trend}
                  </span>
                </div>
                <h3 className={`text-sm font-bold uppercase tracking-widest mb-1 ${isDark ? 'text-[#B0B0C3]' : 'text-slate-500'}`}>
                  {metric.title}
                </h3>
                <p className={`text-2xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  {metric.amount}
                </p>
              </motion.div>
            );
          })}
        </div>

        {/* Placeholder for Charts/Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className={`lg:col-span-2 p-6 rounded-2xl border min-h-[400px] flex flex-col items-center justify-center ${
            isDark ? 'bg-[#2A2A3D] border-white/5' : 'bg-white border-slate-200'
          }`}>
            <p className={`text-sm font-bold uppercase tracking-widest ${isDark ? 'text-[#B0B0C3]' : 'text-slate-500'}`}>
              Cash Flow Chart (Coming Soon)
            </p>
          </div>
          <div className={`p-6 rounded-2xl border min-h-[400px] flex flex-col items-center justify-center ${
            isDark ? 'bg-[#2A2A3D] border-white/5' : 'bg-white border-slate-200'
          }`}>
            <p className={`text-sm font-bold uppercase tracking-widest ${isDark ? 'text-[#B0B0C3]' : 'text-slate-500'}`}>
              Recent Transactions (Coming Soon)
            </p>
          </div>
        </div>
      </div>
    </AccountingLayout>
  );
}
