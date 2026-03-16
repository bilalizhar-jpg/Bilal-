import React, { useMemo } from 'react';
import AccountingLayout from '../../../components/accounting/AccountingLayout';
import { useTheme } from '../../../context/ThemeContext';
import { useAccounting } from '../../../context/AccountingContext';

export default function IncomeStatement() {
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

    const revenues = accounts
      .filter(a => a.type === 'Revenue')
      .map(a => ({ ...a, balance: getAccountBalance(a.id, a.type) }))
      .filter(a => a.balance !== 0);

    const expenses = accounts
      .filter(a => a.type === 'Expense')
      .map(a => ({ ...a, balance: getAccountBalance(a.id, a.type) }))
      .filter(a => a.balance !== 0);

    const totalRevenue = revenues.reduce((sum, a) => sum + a.balance, 0);
    const totalExpense = expenses.reduce((sum, a) => sum + a.balance, 0);
    const netIncome = totalRevenue - totalExpense;

    return { revenues, expenses, totalRevenue, totalExpense, netIncome };
  }, [accounts, journalLines]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  return (
    <AccountingLayout>
      <div className="space-y-6 max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className={`text-3xl font-black uppercase tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Income Statement
          </h1>
          <p className={`text-sm mt-2 ${isDark ? 'text-[#B0B0C3]' : 'text-slate-500'}`}>
            Profit and Loss Report
          </p>
        </div>

        <div className={`p-8 rounded-2xl border shadow-sm ${isDark ? 'bg-[#2A2A3D] border-white/5' : 'bg-white border-slate-200'}`}>
          {/* Revenues */}
          <div className="mb-8">
            <h2 className={`text-lg font-black uppercase tracking-widest border-b pb-2 mb-4 ${isDark ? 'text-[#00FFCC] border-white/10' : 'text-indigo-600 border-slate-200'}`}>
              Revenues
            </h2>
            {report.revenues.length === 0 ? (
              <p className={`text-sm italic ${isDark ? 'text-[#B0B0C3]' : 'text-slate-500'}`}>No revenue transactions.</p>
            ) : (
              <div className="space-y-2">
                {report.revenues.map(account => (
                  <div key={account.id} className="flex justify-between items-center py-1">
                    <span className={`text-sm ${isDark ? 'text-white' : 'text-slate-700'}`}>{account.name}</span>
                    <span className={`text-sm font-mono ${isDark ? 'text-[#B0B0C3]' : 'text-slate-600'}`}>{formatCurrency(account.balance)}</span>
                  </div>
                ))}
                <div className={`flex justify-between items-center py-2 mt-2 border-t ${isDark ? 'border-white/10' : 'border-slate-200'}`}>
                  <span className={`text-sm font-bold uppercase tracking-widest ${isDark ? 'text-white' : 'text-slate-900'}`}>Total Revenue</span>
                  <span className={`text-sm font-mono font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{formatCurrency(report.totalRevenue)}</span>
                </div>
              </div>
            )}
          </div>

          {/* Expenses */}
          <div className="mb-8">
            <h2 className={`text-lg font-black uppercase tracking-widest border-b pb-2 mb-4 ${isDark ? 'text-[#00FFCC] border-white/10' : 'text-indigo-600 border-slate-200'}`}>
              Expenses
            </h2>
            {report.expenses.length === 0 ? (
              <p className={`text-sm italic ${isDark ? 'text-[#B0B0C3]' : 'text-slate-500'}`}>No expense transactions.</p>
            ) : (
              <div className="space-y-2">
                {report.expenses.map(account => (
                  <div key={account.id} className="flex justify-between items-center py-1">
                    <span className={`text-sm ${isDark ? 'text-white' : 'text-slate-700'}`}>{account.name}</span>
                    <span className={`text-sm font-mono ${isDark ? 'text-[#B0B0C3]' : 'text-slate-600'}`}>{formatCurrency(account.balance)}</span>
                  </div>
                ))}
                <div className={`flex justify-between items-center py-2 mt-2 border-t ${isDark ? 'border-white/10' : 'border-slate-200'}`}>
                  <span className={`text-sm font-bold uppercase tracking-widest ${isDark ? 'text-white' : 'text-slate-900'}`}>Total Expenses</span>
                  <span className={`text-sm font-mono font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{formatCurrency(report.totalExpense)}</span>
                </div>
              </div>
            )}
          </div>

          {/* Net Income */}
          <div className={`flex justify-between items-center py-4 border-t-4 ${isDark ? 'border-white/20' : 'border-slate-800'}`}>
            <span className={`text-lg font-black uppercase tracking-widest ${isDark ? 'text-white' : 'text-slate-900'}`}>Net Income</span>
            <span className={`text-xl font-mono font-black ${report.netIncome >= 0 ? (isDark ? 'text-[#00FFCC]' : 'text-emerald-600') : (isDark ? 'text-red-400' : 'text-red-600')}`}>
              {formatCurrency(report.netIncome)}
            </span>
          </div>
        </div>
      </div>
    </AccountingLayout>
  );
}
