import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useTheme } from '../../../context/ThemeContext';
import { Download, Printer, Calendar, ChevronDown, ChevronRight, FileText } from 'lucide-react';
import AdminLayout from '../../../components/AdminLayout';

export default function ProfitAndLoss() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [expandedSections, setExpandedSections] = useState<string[]>(['Income', 'Expense']);

  const toggleSection = (section: string) => {
    setExpandedSections(prev => 
      prev.includes(section) ? prev.filter(s => s !== section) : [...prev, section]
    );
  };

  const data = {
    income: [
      { name: 'Product Sales', amount: 45000.00 },
      { name: 'Service Revenue', amount: 12500.00 },
      { name: 'Other Income', amount: 1200.00 },
    ],
    cogs: [
      { name: 'Cost of Goods Sold', amount: 12000.00 },
    ],
    expenses: [
      { name: 'Operating Expenses', amount: 8500.00 },
      { name: 'Salaries and Wages', amount: 15000.00 },
      { name: 'Rent and Utilities', amount: 3000.00 },
      { name: 'Marketing and Advertising', amount: 2500.00 },
      { name: 'Depreciation', amount: 1200.00 },
    ]
  };

  const totalIncome = data.income.reduce((sum, item) => sum + item.amount, 0);
  const totalCogs = data.cogs.reduce((sum, item) => sum + item.amount, 0);
  const grossProfit = totalIncome - totalCogs;
  const totalExpenses = data.expenses.reduce((sum, item) => sum + item.amount, 0);
  const netProfit = grossProfit - totalExpenses;

  const renderRow = (name: string, amount: number, isTotal = false, isSubtotal = false) => (
    <div className={`flex justify-between py-2 px-4 ${isTotal ? 'font-bold border-t-2 border-slate-200 dark:border-slate-700 mt-2' : isSubtotal ? 'font-semibold italic' : 'text-sm'}`}>
      <span className={isDark ? 'text-slate-300' : 'text-slate-700'}>{name}</span>
      <span className={isDark ? 'text-slate-300' : 'text-slate-700'}>
        ${amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
      </span>
    </div>
  );

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>Profit and Loss</h1>
            <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Income statement for the selected period</p>
          </div>
          <div className="flex gap-2">
            <button className={`flex items-center gap-2 px-4 py-2 rounded-md border transition-colors ${
              isDark ? 'border-slate-700 text-slate-300 hover:bg-slate-800' : 'border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}>
              <Calendar className="w-4 h-4" />
              This Fiscal Year
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
            <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>Profit and Loss Statement</h2>
            <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>As of October 31, 2023</p>
          </div>

          <div className="space-y-6">
            {/* Income Section */}
            <div>
              <button 
                onClick={() => toggleSection('Income')}
                className="flex items-center gap-2 w-full text-left mb-2"
              >
                {expandedSections.includes('Income') ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                <span className={`font-bold uppercase tracking-wider text-xs ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`}>Income</span>
              </button>
              {expandedSections.includes('Income') && (
                <div className="ml-4 space-y-1">
                  {data.income.map(item => renderRow(item.name, item.amount))}
                  {renderRow('Total Income', totalIncome, false, true)}
                </div>
              )}
            </div>

            {/* COGS Section */}
            <div>
              <button 
                onClick={() => toggleSection('COGS')}
                className="flex items-center gap-2 w-full text-left mb-2"
              >
                {expandedSections.includes('COGS') ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                <span className={`font-bold uppercase tracking-wider text-xs ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`}>Cost of Goods Sold</span>
              </button>
              {expandedSections.includes('COGS') && (
                <div className="ml-4 space-y-1">
                  {data.cogs.map(item => renderRow(item.name, item.amount))}
                  {renderRow('Total Cost of Goods Sold', totalCogs, false, true)}
                </div>
              )}
            </div>

            {renderRow('Gross Profit', grossProfit, true)}

            {/* Expenses Section */}
            <div>
              <button 
                onClick={() => toggleSection('Expense')}
                className="flex items-center gap-2 w-full text-left mb-2"
              >
                {expandedSections.includes('Expense') ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                <span className={`font-bold uppercase tracking-wider text-xs ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`}>Operating Expenses</span>
              </button>
              {expandedSections.includes('Expense') && (
                <div className="ml-4 space-y-1">
                  {data.expenses.map(item => renderRow(item.name, item.amount))}
                  {renderRow('Total Operating Expenses', totalExpenses, false, true)}
                </div>
              )}
            </div>

            <div className={`mt-10 p-4 rounded-lg ${isDark ? 'bg-indigo-500/10' : 'bg-indigo-50'}`}>
              <div className="flex justify-between items-center">
                <span className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>Net Profit</span>
                <span className={`text-2xl font-black ${netProfit >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                  ${netProfit.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
