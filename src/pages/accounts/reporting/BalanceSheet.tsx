import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useTheme } from '../../../context/ThemeContext';
import { Download, Printer, Calendar, ChevronDown, ChevronRight } from 'lucide-react';
import AdminLayout from '../../../components/AdminLayout';

export default function BalanceSheet() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [expandedSections, setExpandedSections] = useState<string[]>(['Assets', 'Liabilities', 'Equity']);

  const toggleSection = (section: string) => {
    setExpandedSections(prev => 
      prev.includes(section) ? prev.filter(s => s !== section) : [...prev, section]
    );
  };

  const data = {
    assets: {
      current: [
        { name: 'Bank Account', amount: 45231.89 },
        { name: 'Petty Cash', amount: 5200.00 },
        { name: 'Account Receivable', amount: 12450.00 },
        { name: 'Inventory', amount: 25000.00 },
      ],
      fixed: [
        { name: 'Office Equipment', amount: 15000.00 },
        { name: 'Vehicles', amount: 35000.00 },
        { name: 'Accumulated Depreciation', amount: -5000.00 },
      ]
    },
    liabilities: {
      current: [
        { name: 'Account Payable', amount: 5400.00 },
        { name: 'Taxes Payable', amount: 1200.00 },
        { name: 'Salaries Payable', amount: 3500.00 },
      ],
      longTerm: [
        { name: 'Bank Loan', amount: 25000.00 },
      ]
    },
    equity: [
      { name: 'Capital', amount: 100000.00 },
      { name: 'Retained Earnings', amount: -2218.11 },
    ]
  };

  const totalCurrentAssets = data.assets.current.reduce((sum, item) => sum + item.amount, 0);
  const totalFixedAssets = data.assets.fixed.reduce((sum, item) => sum + item.amount, 0);
  const totalAssets = totalCurrentAssets + totalFixedAssets;

  const totalCurrentLiabilities = data.liabilities.current.reduce((sum, item) => sum + item.amount, 0);
  const totalLongTermLiabilities = data.liabilities.longTerm.reduce((sum, item) => sum + item.amount, 0);
  const totalLiabilities = totalCurrentLiabilities + totalLongTermLiabilities;

  const totalEquity = data.equity.reduce((sum, item) => sum + item.amount, 0);
  const totalLiabilitiesAndEquity = totalLiabilities + totalEquity;

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
            <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>Balance Sheet</h1>
            <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Snapshot of your financial position</p>
          </div>
          <div className="flex gap-2">
            <button className={`flex items-center gap-2 px-4 py-2 rounded-md border transition-colors ${
              isDark ? 'border-slate-700 text-slate-300 hover:bg-slate-800' : 'border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}>
              <Calendar className="w-4 h-4" />
              Today
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
            <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>Balance Sheet</h2>
            <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>As of October 31, 2023</p>
          </div>

          <div className="space-y-6">
            {/* Assets Section */}
            <div>
              <button 
                onClick={() => toggleSection('Assets')}
                className="flex items-center gap-2 w-full text-left mb-2"
              >
                {expandedSections.includes('Assets') ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                <span className={`font-bold uppercase tracking-wider text-xs ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`}>Assets</span>
              </button>
              {expandedSections.includes('Assets') && (
                <div className="ml-4 space-y-4">
                  <div>
                    <span className="text-xs font-semibold text-slate-400 uppercase ml-4">Current Assets</span>
                    {data.assets.current.map(item => renderRow(item.name, item.amount))}
                    {renderRow('Total Current Assets', totalCurrentAssets, false, true)}
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-slate-400 uppercase ml-4">Fixed Assets</span>
                    {data.assets.fixed.map(item => renderRow(item.name, item.amount))}
                    {renderRow('Total Fixed Assets', totalFixedAssets, false, true)}
                  </div>
                </div>
              )}
            </div>

            {renderRow('Total Assets', totalAssets, true)}

            {/* Liabilities Section */}
            <div>
              <button 
                onClick={() => toggleSection('Liabilities')}
                className="flex items-center gap-2 w-full text-left mb-2"
              >
                {expandedSections.includes('Liabilities') ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                <span className={`font-bold uppercase tracking-wider text-xs ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`}>Liabilities</span>
              </button>
              {expandedSections.includes('Liabilities') && (
                <div className="ml-4 space-y-4">
                  <div>
                    <span className="text-xs font-semibold text-slate-400 uppercase ml-4">Current Liabilities</span>
                    {data.liabilities.current.map(item => renderRow(item.name, item.amount))}
                    {renderRow('Total Current Liabilities', totalCurrentLiabilities, false, true)}
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-slate-400 uppercase ml-4">Long-term Liabilities</span>
                    {data.liabilities.longTerm.map(item => renderRow(item.name, item.amount))}
                    {renderRow('Total Long-term Liabilities', totalLongTermLiabilities, false, true)}
                  </div>
                </div>
              )}
            </div>

            {renderRow('Total Liabilities', totalLiabilities, true)}

            {/* Equity Section */}
            <div>
              <button 
                onClick={() => toggleSection('Equity')}
                className="flex items-center gap-2 w-full text-left mb-2"
              >
                {expandedSections.includes('Equity') ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                <span className={`font-bold uppercase tracking-wider text-xs ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`}>Equity</span>
              </button>
              {expandedSections.includes('Equity') && (
                <div className="ml-4 space-y-1">
                  {data.equity.map(item => renderRow(item.name, item.amount))}
                  {renderRow('Total Equity', totalEquity, false, true)}
                </div>
              )}
            </div>

            {renderRow('Total Liabilities and Equity', totalLiabilitiesAndEquity, true)}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
