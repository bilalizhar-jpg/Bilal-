import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useTheme } from '../../../context/ThemeContext';
import { Download, Printer, Calendar, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import AdminLayout from '../../../components/AdminLayout';

export default function CashFlow() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const data = {
    operating: [
      { name: 'Receipts from Customers', amount: 52000.00 },
      { name: 'Payments to Suppliers', amount: -18000.00 },
      { name: 'Payments to Employees', amount: -15000.00 },
      { name: 'Other Operating Payments', amount: -2500.00 },
    ],
    investing: [
      { name: 'Purchase of Equipment', amount: -5000.00 },
      { name: 'Sale of Assets', amount: 1200.00 },
    ],
    financing: [
      { name: 'Proceeds from Bank Loan', amount: 25000.00 },
      { name: 'Repayment of Loan', amount: -2000.00 },
      { name: 'Dividends Paid', amount: -1000.00 },
    ]
  };

  const totalOperating = data.operating.reduce((sum, item) => sum + item.amount, 0);
  const totalInvesting = data.investing.reduce((sum, item) => sum + item.amount, 0);
  const totalFinancing = data.financing.reduce((sum, item) => sum + item.amount, 0);
  const netCashFlow = totalOperating + totalInvesting + totalFinancing;

  const renderRow = (name: string, amount: number, isTotal = false, isSubtotal = false) => (
    <div className={`flex justify-between py-2 px-4 ${isTotal ? 'font-bold border-t-2 border-slate-200 dark:border-slate-700 mt-2' : isSubtotal ? 'font-semibold italic' : 'text-sm'}`}>
      <span className={isDark ? 'text-slate-300' : 'text-slate-700'}>{name}</span>
      <span className={`${amount >= 0 ? 'text-emerald-500' : 'text-rose-500'} font-medium`}>
        {amount >= 0 ? '+' : '-'}${Math.abs(amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
      </span>
    </div>
  );

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>Cash Flow</h1>
            <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Statement of cash inflows and outflows</p>
          </div>
          <div className="flex gap-2">
            <button className={`flex items-center gap-2 px-4 py-2 rounded-md border transition-colors ${
              isDark ? 'border-slate-700 text-slate-300 hover:bg-slate-800' : 'border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}>
              <Calendar className="w-4 h-4" />
              This Quarter
            </button>
            <button className={`flex items-center gap-2 px-4 py-2 rounded-md border transition-colors ${
              isDark ? 'border-slate-700 text-slate-300 hover:bg-slate-800' : 'border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}>
              <Download className="w-4 h-4" />
              Export
            </button>
            <button className={`flex items-center gap-2 px-4 py-2 rounded-md border transition-colors ${
              isDark ? 'border-slate-700 text-slate-300 hover:bg-slate-800' : 'border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}>
              <Printer className="w-4 h-4" />
              Print
            </button>
          </div>
        </div>

        <div className={`p-8 rounded-xl border ${isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-200'} shadow-sm max-w-4xl mx-auto`}>
          <div className="text-center mb-10">
            <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>Statement of Cash Flows</h2>
            <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>For the period ending October 31, 2023</p>
          </div>

          <div className="space-y-8">
            {/* Operating Activities */}
            <div>
              <div className="flex items-center gap-2 mb-2 px-4">
                <ArrowUpRight className="w-4 h-4 text-emerald-500" />
                <span className={`font-bold uppercase tracking-wider text-xs ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`}>Cash Flow from Operating Activities</span>
              </div>
              <div className="space-y-1">
                {data.operating.map(item => renderRow(item.name, item.amount))}
                {renderRow('Net Cash from Operating Activities', totalOperating, false, true)}
              </div>
            </div>

            {/* Investing Activities */}
            <div>
              <div className="flex items-center gap-2 mb-2 px-4">
                <ArrowDownRight className="w-4 h-4 text-rose-500" />
                <span className={`font-bold uppercase tracking-wider text-xs ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`}>Cash Flow from Investing Activities</span>
              </div>
              <div className="space-y-1">
                {data.investing.map(item => renderRow(item.name, item.amount))}
                {renderRow('Net Cash from Investing Activities', totalInvesting, false, true)}
              </div>
            </div>

            {/* Financing Activities */}
            <div>
              <div className="flex items-center gap-2 mb-2 px-4">
                <ArrowUpRight className="w-4 h-4 text-emerald-500" />
                <span className={`font-bold uppercase tracking-wider text-xs ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`}>Cash Flow from Financing Activities</span>
              </div>
              <div className="space-y-1">
                {data.financing.map(item => renderRow(item.name, item.amount))}
                {renderRow('Net Cash from Financing Activities', totalFinancing, false, true)}
              </div>
            </div>

            <div className={`mt-10 p-6 rounded-lg border-2 border-dashed ${isDark ? 'border-indigo-500/30 bg-indigo-500/5' : 'border-indigo-200 bg-indigo-50/30'}`}>
              <div className="flex justify-between items-center">
                <div>
                  <span className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>Net Increase in Cash</span>
                  <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Total cash movement for the period</p>
                </div>
                <span className={`text-3xl font-black ${netCashFlow >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                  {netCashFlow >= 0 ? '+' : '-'}${Math.abs(netCashFlow).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
