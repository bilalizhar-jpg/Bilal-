import React, { useMemo } from 'react';
import AccountingLayout from '../../../components/accounting/AccountingLayout';
import { useTheme } from '../../../context/ThemeContext';
import { useAccounting } from '../../../context/AccountingContext';

export default function CashFlow() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const { accounts, journalEntries, journalLines } = useAccounting();

  const report = useMemo(() => {
    // Find cash accounts
    const cashAccounts = accounts.filter(a => 
      a.type === 'Asset' && 
      (a.name.toLowerCase().includes('cash') || a.name.toLowerCase().includes('bank'))
    );
    const cashAccountIds = cashAccounts.map(a => a.id);

    let totalInflows = 0;
    let totalOutflows = 0;
    const inflows: { description: string; amount: number; date: string }[] = [];
    const outflows: { description: string; amount: number; date: string }[] = [];

    // Find all journal entries that hit a cash account
    const cashLines = journalLines.filter(l => cashAccountIds.includes(l.accountId));

    cashLines.forEach(cashLine => {
      const entry = journalEntries.find(e => e.id === cashLine.journalEntryId);
      if (!entry) return;

      if (cashLine.debit > 0) {
        // Cash received (Inflow)
        inflows.push({
          description: entry.description || cashLine.description,
          amount: cashLine.debit,
          date: entry.date
        });
        totalInflows += cashLine.debit;
      } else if (cashLine.credit > 0) {
        // Cash paid (Outflow)
        outflows.push({
          description: entry.description || cashLine.description,
          amount: cashLine.credit,
          date: entry.date
        });
        totalOutflows += cashLine.credit;
      }
    });

    // Sort by date descending
    inflows.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    outflows.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const netCashFlow = totalInflows - totalOutflows;
    
    // Calculate beginning and ending balance
    const beginningBalance = cashAccounts.reduce((sum, a) => sum + a.openingBalance, 0);
    const endingBalance = beginningBalance + netCashFlow;

    return { inflows, outflows, totalInflows, totalOutflows, netCashFlow, beginningBalance, endingBalance };
  }, [accounts, journalEntries, journalLines]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  return (
    <AccountingLayout>
      <div className="space-y-6 max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className={`text-3xl font-black uppercase tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Statement of Cash Flows
          </h1>
          <p className={`text-sm mt-2 ${isDark ? 'text-[#B0B0C3]' : 'text-slate-500'}`}>
            Cash Inflows and Outflows
          </p>
        </div>

        <div className={`p-8 rounded-2xl border shadow-sm ${isDark ? 'bg-[#2A2A3D] border-white/5' : 'bg-white border-slate-200'}`}>
          {/* Beginning Balance */}
          <div className="flex justify-between items-center py-2 mb-6">
            <span className={`text-sm font-bold uppercase tracking-widest ${isDark ? 'text-white' : 'text-slate-900'}`}>Beginning Cash Balance</span>
            <span className={`text-sm font-mono font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{formatCurrency(report.beginningBalance)}</span>
          </div>

          {/* Cash Inflows */}
          <div className="mb-8">
            <h2 className={`text-lg font-black uppercase tracking-widest border-b pb-2 mb-4 ${isDark ? 'text-[#00FFCC] border-white/10' : 'text-emerald-600 border-slate-200'}`}>
              Cash Inflows
            </h2>
            {report.inflows.length === 0 ? (
              <p className={`text-sm italic ${isDark ? 'text-[#B0B0C3]' : 'text-slate-500'}`}>No cash inflows.</p>
            ) : (
              <div className="space-y-2">
                {report.inflows.map((item, i) => (
                  <div key={i} className="flex justify-between items-center py-1">
                    <div className="flex flex-col">
                      <span className={`text-sm ${isDark ? 'text-white' : 'text-slate-700'}`}>{item.description}</span>
                      <span className={`text-xs ${isDark ? 'text-[#B0B0C3]' : 'text-slate-500'}`}>{item.date}</span>
                    </div>
                    <span className={`text-sm font-mono ${isDark ? 'text-[#00FFCC]' : 'text-emerald-600'}`}>{formatCurrency(item.amount)}</span>
                  </div>
                ))}
                <div className={`flex justify-between items-center py-2 mt-2 border-t ${isDark ? 'border-white/10' : 'border-slate-200'}`}>
                  <span className={`text-sm font-bold uppercase tracking-widest ${isDark ? 'text-white' : 'text-slate-900'}`}>Total Inflows</span>
                  <span className={`text-sm font-mono font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{formatCurrency(report.totalInflows)}</span>
                </div>
              </div>
            )}
          </div>

          {/* Cash Outflows */}
          <div className="mb-8">
            <h2 className={`text-lg font-black uppercase tracking-widest border-b pb-2 mb-4 ${isDark ? 'text-[#00FFCC] border-white/10' : 'text-red-600 border-slate-200'}`}>
              Cash Outflows
            </h2>
            {report.outflows.length === 0 ? (
              <p className={`text-sm italic ${isDark ? 'text-[#B0B0C3]' : 'text-slate-500'}`}>No cash outflows.</p>
            ) : (
              <div className="space-y-2">
                {report.outflows.map((item, i) => (
                  <div key={i} className="flex justify-between items-center py-1">
                    <div className="flex flex-col">
                      <span className={`text-sm ${isDark ? 'text-white' : 'text-slate-700'}`}>{item.description}</span>
                      <span className={`text-xs ${isDark ? 'text-[#B0B0C3]' : 'text-slate-500'}`}>{item.date}</span>
                    </div>
                    <span className={`text-sm font-mono ${isDark ? 'text-red-400' : 'text-red-600'}`}>({formatCurrency(item.amount)})</span>
                  </div>
                ))}
                <div className={`flex justify-between items-center py-2 mt-2 border-t ${isDark ? 'border-white/10' : 'border-slate-200'}`}>
                  <span className={`text-sm font-bold uppercase tracking-widest ${isDark ? 'text-white' : 'text-slate-900'}`}>Total Outflows</span>
                  <span className={`text-sm font-mono font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>({formatCurrency(report.totalOutflows)})</span>
                </div>
              </div>
            )}
          </div>

          {/* Net Cash Flow */}
          <div className={`flex justify-between items-center py-4 border-t-2 ${isDark ? 'border-white/20' : 'border-slate-300'}`}>
            <span className={`text-sm font-black uppercase tracking-widest ${isDark ? 'text-white' : 'text-slate-900'}`}>Net Cash Flow</span>
            <span className={`text-lg font-mono font-black ${report.netCashFlow >= 0 ? (isDark ? 'text-[#00FFCC]' : 'text-emerald-600') : (isDark ? 'text-red-400' : 'text-red-600')}`}>
              {formatCurrency(report.netCashFlow)}
            </span>
          </div>

          {/* Ending Balance */}
          <div className={`flex justify-between items-center py-4 border-t-4 ${isDark ? 'border-white/20' : 'border-slate-800'}`}>
            <span className={`text-lg font-black uppercase tracking-widest ${isDark ? 'text-white' : 'text-slate-900'}`}>Ending Cash Balance</span>
            <span className={`text-xl font-mono font-black ${isDark ? 'text-[#00FFCC]' : 'text-indigo-600'}`}>
              {formatCurrency(report.endingBalance)}
            </span>
          </div>
        </div>
      </div>
    </AccountingLayout>
  );
}
