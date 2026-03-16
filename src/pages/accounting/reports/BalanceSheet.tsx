import React, { useMemo } from 'react';
import AccountingLayout from '../../../components/accounting/AccountingLayout';
import { useTheme } from '../../../context/ThemeContext';
import { useAccounting } from '../../../context/AccountingContext';

export default function BalanceSheet() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const { accounts, journalLines } = useAccounting();

  const report = useMemo(() => {
    const getAccountBalance = (accountId: string, type: string) => {
      const account = accounts.find(a => a.id === accountId);
      if (!account) return 0;
      
      let debit = 0;
      let credit = 0;
      const lines = journalLines.filter(l => l.accountId === accountId);
      lines.forEach(line => {
        debit += line.debit;
        credit += line.credit;
      });

      const isDebitNormal = type === 'Asset' || type === 'Expense';
      if (isDebitNormal) {
        debit += account.openingBalance;
        return debit - credit;
      } else {
        credit += account.openingBalance;
        return credit - debit;
      }
    };

    const assets = accounts
      .filter(a => a.type === 'Asset')
      .map(a => ({ ...a, balance: getAccountBalance(a.id, a.type) }))
      .filter(a => a.balance !== 0);

    const liabilities = accounts
      .filter(a => a.type === 'Liability')
      .map(a => ({ ...a, balance: getAccountBalance(a.id, a.type) }))
      .filter(a => a.balance !== 0);

    const equity = accounts
      .filter(a => a.type === 'Equity')
      .map(a => ({ ...a, balance: getAccountBalance(a.id, a.type) }))
      .filter(a => a.balance !== 0);

    // Calculate Net Income to add to Retained Earnings
    const revenues = accounts
      .filter(a => a.type === 'Revenue')
      .map(a => getAccountBalance(a.id, a.type))
      .reduce((sum, bal) => sum + bal, 0);

    const expenses = accounts
      .filter(a => a.type === 'Expense')
      .map(a => getAccountBalance(a.id, a.type))
      .reduce((sum, bal) => sum + bal, 0);

    const netIncome = revenues - expenses;

    const totalAssets = assets.reduce((sum, a) => sum + a.balance, 0);
    const totalLiabilities = liabilities.reduce((sum, a) => sum + a.balance, 0);
    const totalEquity = equity.reduce((sum, a) => sum + a.balance, 0) + netIncome;

    return { assets, liabilities, equity, netIncome, totalAssets, totalLiabilities, totalEquity };
  }, [accounts, journalLines]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  return (
    <AccountingLayout>
      <div className="space-y-6 max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className={`text-3xl font-black uppercase tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Balance Sheet
          </h1>
          <p className={`text-sm mt-2 ${isDark ? 'text-[#B0B0C3]' : 'text-slate-500'}`}>
            Financial Position Report
          </p>
        </div>

        <div className={`p-8 rounded-2xl border shadow-sm ${isDark ? 'bg-[#2A2A3D] border-white/5' : 'bg-white border-slate-200'}`}>
          {/* Assets */}
          <div className="mb-8">
            <h2 className={`text-lg font-black uppercase tracking-widest border-b pb-2 mb-4 ${isDark ? 'text-[#00FFCC] border-white/10' : 'text-indigo-600 border-slate-200'}`}>
              Assets
            </h2>
            {report.assets.length === 0 ? (
              <p className={`text-sm italic ${isDark ? 'text-[#B0B0C3]' : 'text-slate-500'}`}>No asset transactions.</p>
            ) : (
              <div className="space-y-2">
                {report.assets.map(account => (
                  <div key={account.id} className="flex justify-between items-center py-1">
                    <span className={`text-sm ${isDark ? 'text-white' : 'text-slate-700'}`}>{account.name}</span>
                    <span className={`text-sm font-mono ${isDark ? 'text-[#B0B0C3]' : 'text-slate-600'}`}>{formatCurrency(account.balance)}</span>
                  </div>
                ))}
                <div className={`flex justify-between items-center py-2 mt-2 border-t ${isDark ? 'border-white/10' : 'border-slate-200'}`}>
                  <span className={`text-sm font-bold uppercase tracking-widest ${isDark ? 'text-white' : 'text-slate-900'}`}>Total Assets</span>
                  <span className={`text-sm font-mono font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{formatCurrency(report.totalAssets)}</span>
                </div>
              </div>
            )}
          </div>

          {/* Liabilities */}
          <div className="mb-8">
            <h2 className={`text-lg font-black uppercase tracking-widest border-b pb-2 mb-4 ${isDark ? 'text-[#00FFCC] border-white/10' : 'text-indigo-600 border-slate-200'}`}>
              Liabilities
            </h2>
            {report.liabilities.length === 0 ? (
              <p className={`text-sm italic ${isDark ? 'text-[#B0B0C3]' : 'text-slate-500'}`}>No liability transactions.</p>
            ) : (
              <div className="space-y-2">
                {report.liabilities.map(account => (
                  <div key={account.id} className="flex justify-between items-center py-1">
                    <span className={`text-sm ${isDark ? 'text-white' : 'text-slate-700'}`}>{account.name}</span>
                    <span className={`text-sm font-mono ${isDark ? 'text-[#B0B0C3]' : 'text-slate-600'}`}>{formatCurrency(account.balance)}</span>
                  </div>
                ))}
                <div className={`flex justify-between items-center py-2 mt-2 border-t ${isDark ? 'border-white/10' : 'border-slate-200'}`}>
                  <span className={`text-sm font-bold uppercase tracking-widest ${isDark ? 'text-white' : 'text-slate-900'}`}>Total Liabilities</span>
                  <span className={`text-sm font-mono font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{formatCurrency(report.totalLiabilities)}</span>
                </div>
              </div>
            )}
          </div>

          {/* Equity */}
          <div className="mb-8">
            <h2 className={`text-lg font-black uppercase tracking-widest border-b pb-2 mb-4 ${isDark ? 'text-[#00FFCC] border-white/10' : 'text-indigo-600 border-slate-200'}`}>
              Equity
            </h2>
            <div className="space-y-2">
              {report.equity.map(account => (
                <div key={account.id} className="flex justify-between items-center py-1">
                  <span className={`text-sm ${isDark ? 'text-white' : 'text-slate-700'}`}>{account.name}</span>
                  <span className={`text-sm font-mono ${isDark ? 'text-[#B0B0C3]' : 'text-slate-600'}`}>{formatCurrency(account.balance)}</span>
                </div>
              ))}
              <div className="flex justify-between items-center py-1">
                <span className={`text-sm ${isDark ? 'text-white' : 'text-slate-700'}`}>Current Year Earnings</span>
                <span className={`text-sm font-mono ${isDark ? 'text-[#B0B0C3]' : 'text-slate-600'}`}>{formatCurrency(report.netIncome)}</span>
              </div>
              <div className={`flex justify-between items-center py-2 mt-2 border-t ${isDark ? 'border-white/10' : 'border-slate-200'}`}>
                <span className={`text-sm font-bold uppercase tracking-widest ${isDark ? 'text-white' : 'text-slate-900'}`}>Total Equity</span>
                <span className={`text-sm font-mono font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{formatCurrency(report.totalEquity)}</span>
              </div>
            </div>
          </div>

          {/* Total Liabilities & Equity */}
          <div className={`flex justify-between items-center py-4 border-t-4 ${isDark ? 'border-white/20' : 'border-slate-800'}`}>
            <span className={`text-lg font-black uppercase tracking-widest ${isDark ? 'text-white' : 'text-slate-900'}`}>Total Liabilities & Equity</span>
            <span className={`text-xl font-mono font-black ${isDark ? 'text-[#00FFCC]' : 'text-indigo-600'}`}>
              {formatCurrency(report.totalLiabilities + report.totalEquity)}
            </span>
          </div>
        </div>
      </div>
    </AccountingLayout>
  );
}
