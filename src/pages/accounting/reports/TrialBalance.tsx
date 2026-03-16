import React, { useMemo } from 'react';
import AccountingLayout from '../../../components/accounting/AccountingLayout';
import { useTheme } from '../../../context/ThemeContext';
import { useAccounting } from '../../../context/AccountingContext';

export default function TrialBalance() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const { accounts, journalLines } = useAccounting();

  const trialBalance = useMemo(() => {
    const balances = accounts.map(account => {
      let debit = 0;
      let credit = 0;
      
      const lines = journalLines.filter(l => l.accountId === account.id);
      lines.forEach(line => {
        debit += line.debit;
        credit += line.credit;
      });

      // Include opening balance
      const isDebitNormal = account.type === 'Asset' || account.type === 'Expense';
      if (isDebitNormal) {
        debit += account.openingBalance;
      } else {
        credit += account.openingBalance;
      }

      const netBalance = debit - credit;
      
      return {
        ...account,
        netDebit: netBalance > 0 ? netBalance : 0,
        netCredit: netBalance < 0 ? Math.abs(netBalance) : 0,
      };
    }).filter(a => a.netDebit > 0 || a.netCredit > 0);

    balances.sort((a, b) => a.code.localeCompare(b.code));
    return balances;
  }, [accounts, journalLines]);

  const totalDebit = trialBalance.reduce((sum, a) => sum + a.netDebit, 0);
  const totalCredit = trialBalance.reduce((sum, a) => sum + a.netCredit, 0);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  return (
    <AccountingLayout>
      <div className="space-y-6">
        <div>
          <h1 className={`text-2xl font-black uppercase tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Trial Balance
          </h1>
          <p className={`text-sm ${isDark ? 'text-[#B0B0C3]' : 'text-slate-500'}`}>
            Summary of all account balances
          </p>
        </div>

        <div className={`p-6 rounded-2xl border ${isDark ? 'bg-[#2A2A3D] border-white/5' : 'bg-white border-slate-200'}`}>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className={`border-b ${isDark ? 'border-white/10' : 'border-slate-200'}`}>
                  <th className={`py-3 px-4 text-xs font-black uppercase tracking-widest ${isDark ? 'text-[#B0B0C3]' : 'text-slate-500'}`}>Account Code</th>
                  <th className={`py-3 px-4 text-xs font-black uppercase tracking-widest ${isDark ? 'text-[#B0B0C3]' : 'text-slate-500'}`}>Account Name</th>
                  <th className={`py-3 px-4 text-xs font-black uppercase tracking-widest text-right ${isDark ? 'text-[#B0B0C3]' : 'text-slate-500'}`}>Debit</th>
                  <th className={`py-3 px-4 text-xs font-black uppercase tracking-widest text-right ${isDark ? 'text-[#B0B0C3]' : 'text-slate-500'}`}>Credit</th>
                </tr>
              </thead>
              <tbody>
                {trialBalance.length === 0 ? (
                  <tr>
                    <td colSpan={4} className={`py-8 text-center text-sm ${isDark ? 'text-[#B0B0C3]' : 'text-slate-500'}`}>
                      No account balances found.
                    </td>
                  </tr>
                ) : (
                  trialBalance.map((account) => (
                    <tr key={account.id} className={`border-b transition-colors ${isDark ? 'border-white/5 hover:bg-white/5' : 'border-slate-100 hover:bg-slate-50'}`}>
                      <td className={`py-3 px-4 text-sm font-mono ${isDark ? 'text-white' : 'text-slate-900'}`}>{account.code}</td>
                      <td className={`py-3 px-4 text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>{account.name}</td>
                      <td className={`py-3 px-4 text-sm font-mono text-right ${isDark ? 'text-[#B0B0C3]' : 'text-slate-600'}`}>
                        {account.netDebit > 0 ? formatCurrency(account.netDebit) : '-'}
                      </td>
                      <td className={`py-3 px-4 text-sm font-mono text-right ${isDark ? 'text-[#B0B0C3]' : 'text-slate-600'}`}>
                        {account.netCredit > 0 ? formatCurrency(account.netCredit) : '-'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
              <tfoot>
                <tr className={`border-t-2 ${isDark ? 'border-white/20' : 'border-slate-300'}`}>
                  <td colSpan={2} className={`py-4 px-4 text-sm font-black uppercase tracking-widest text-right ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    Total
                  </td>
                  <td className={`py-4 px-4 text-sm font-mono font-black text-right ${isDark ? 'text-[#00FFCC]' : 'text-indigo-600'}`}>
                    {formatCurrency(totalDebit)}
                  </td>
                  <td className={`py-4 px-4 text-sm font-mono font-black text-right ${isDark ? 'text-[#00FFCC]' : 'text-indigo-600'}`}>
                    {formatCurrency(totalCredit)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>
    </AccountingLayout>
  );
}
