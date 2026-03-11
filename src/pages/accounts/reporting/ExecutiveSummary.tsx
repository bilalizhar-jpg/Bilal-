import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useTheme } from '../../../context/ThemeContext';
import { Download, Printer, Calendar, TrendingUp, TrendingDown, DollarSign, PieChart } from 'lucide-react';
import AdminLayout from '../../../components/AdminLayout';

export default function ExecutiveSummary() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const stats = [
    { label: 'Net Profit', value: 12450.00, trend: '+12.5%', isPositive: true },
    { label: 'Gross Margin', value: 65.4, isPercent: true, trend: '+2.1%', isPositive: true },
    { label: 'Operating Expenses', value: 8900.00, trend: '-5.2%', isPositive: true },
    { label: 'Net Cash Flow', value: 15200.00, trend: '+8.4%', isPositive: true },
  ];

  const sections = [
    {
      title: 'Profitability',
      metrics: [
        { name: 'Revenue', current: 45000.00, previous: 40000.00, change: 12.5 },
        { name: 'Cost of Sales', current: 15000.00, previous: 14000.00, change: 7.1 },
        { name: 'Gross Profit', current: 30000.00, previous: 26000.00, change: 15.4 },
      ]
    },
    {
      title: 'Efficiency',
      metrics: [
        { name: 'Operating Expenses', current: 8900.00, previous: 9500.00, change: -6.3 },
        { name: 'Net Profit Margin', current: 27.6, previous: 24.1, change: 14.5, isPercent: true },
      ]
    }
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>Executive Summary</h1>
            <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>High-level overview of financial performance</p>
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.1 }}
              className={`p-6 rounded-xl border ${isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-200'} shadow-sm`}
            >
              <p className="text-sm text-slate-500 mb-1">{stat.label}</p>
              <div className="flex items-end justify-between">
                <h3 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>
                  {stat.isPercent ? `${stat.value}%` : `$${stat.value.toLocaleString()}`}
                </h3>
                <div className={`flex items-center gap-1 text-xs font-medium ${stat.isPositive ? 'text-emerald-500' : 'text-rose-500'}`}>
                  {stat.isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  {stat.trend}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {sections.map((section, idx) => (
            <div key={idx} className={`p-6 rounded-xl border ${isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-200'} shadow-sm`}>
              <h3 className={`text-lg font-bold mb-6 flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-800'}`}>
                {idx === 0 ? <PieChart className="w-5 h-5 text-indigo-500" /> : <DollarSign className="w-5 h-5 text-emerald-500" />}
                {section.title}
              </h3>
              <div className="space-y-4">
                {section.metrics.map((metric, mIdx) => (
                  <div key={mIdx} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className={isDark ? 'text-slate-400' : 'text-slate-600'}>{metric.name}</span>
                      <span className={`font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>
                        {metric.isPercent ? `${metric.current}%` : `$${metric.current.toLocaleString()}`}
                      </span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(100, (metric.current / (metric.current + metric.previous)) * 100)}%` }}
                        className={`h-full rounded-full ${idx === 0 ? 'bg-indigo-500' : 'bg-emerald-500'}`}
                      />
                    </div>
                    <div className="flex justify-between text-[10px] uppercase tracking-wider text-slate-500">
                      <span>Previous: {metric.isPercent ? `${metric.previous}%` : `$${metric.previous.toLocaleString()}`}</span>
                      <span className={metric.change >= 0 ? 'text-emerald-500' : 'text-rose-500'}>
                        {metric.change >= 0 ? '+' : ''}{metric.change}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
}
