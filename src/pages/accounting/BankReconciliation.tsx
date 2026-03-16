import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, 
  CheckCircle2, 
  XCircle,
  Search,
  ArrowRightLeft,
  AlertCircle,
  Check,
  X,
  Info
} from 'lucide-react';
import { useBank, BankTransaction, BankAccount } from '../../context/BankContext';
import { useAccounting } from '../../context/AccountingContext';
import { useTheme } from '../../context/ThemeContext';
import { useSettings } from '../../context/SettingsContext';

export default function BankReconciliation() {
  const location = useLocation();
  const navigate = useNavigate();
  const { bankAccounts, bankTransactions, reconcileTransaction, unreconcileTransaction } = useBank();
  const { journalEntries, journalLines, accounts } = useAccounting();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const { formatCurrency } = useSettings();

  const queryParams = new URLSearchParams(location.search);
  const bankAccountId = queryParams.get('id');

  const [selectedAccount, setSelectedAccount] = useState<BankAccount | null>(null);
  const [selectedBankTx, setSelectedBankTx] = useState<BankTransaction | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (bankAccountId) {
      const acc = bankAccounts.find(a => a.id === bankAccountId);
      if (acc) setSelectedAccount(acc);
    }
  }, [bankAccountId, bankAccounts]);

  // Filter bank transactions for this account that are NOT reconciled
  const unreconciledBankTxs = bankTransactions.filter(tx => 
    tx.bankAccountId === bankAccountId && !tx.isReconciled
  );

  // Filter journal entries that are linked to the ledger account of this bank account
  // and are not yet reconciled (we'd need a way to track this, for now we'll just show all relevant ones)
  const relevantJournalEntries = journalEntries.filter(entry => {
    const lines = journalLines.filter(l => l.journalEntryId === entry.id);
    return lines.some(l => l.accountId === selectedAccount?.accountId);
  }).filter(entry => {
    // Exclude entries already linked to a reconciled bank transaction
    return !bankTransactions.some(tx => tx.linkedJournalEntryId === entry.id && tx.isReconciled);
  });

  const handleMatch = async (bankTx: BankTransaction, journalEntryId: string) => {
    try {
      await reconcileTransaction(bankTx.id, journalEntryId);
      setSelectedBankTx(null);
    } catch (error) {
      console.error('Error reconciling:', error);
    }
  };

  if (!selectedAccount) return <div className="p-8 text-center">Loading account...</div>;

  return (
    <div className={`p-6 min-h-screen ${isDark ? 'bg-[#0F0F12]' : 'bg-slate-50'}`}>
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <button 
            onClick={() => navigate('/accounting/bank/accounts')}
            className={`p-2 rounded-xl transition-colors ${isDark ? 'hover:bg-white/5 text-slate-400' : 'hover:bg-slate-100 text-slate-500'}`}
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className={`text-3xl font-black uppercase tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Bank Reconciliation
            </h1>
            <p className={`mt-1 text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Match bank statement transactions with your ledger entries for {selectedAccount.bankName}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Side: Bank Transactions */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className={`text-sm font-black uppercase tracking-widest ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Statement Transactions ({unreconciledBankTxs.length})
              </h2>
            </div>
            
            <div className="space-y-3">
              {unreconciledBankTxs.map((tx) => (
                <motion.div
                  key={tx.id}
                  layoutId={tx.id}
                  onClick={() => setSelectedBankTx(tx)}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                    selectedBankTx?.id === tx.id
                      ? 'border-indigo-500 ring-2 ring-indigo-500/20 bg-indigo-500/5'
                      : isDark ? 'bg-[#16161D] border-white/5 hover:border-white/10' : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className={`text-[10px] font-black uppercase tracking-widest ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                      {new Date(tx.date).toLocaleDateString()}
                    </span>
                    <span className={`text-sm font-bold ${tx.type === 'Credit' ? 'text-emerald-500' : 'text-red-500'}`}>
                      {tx.type === 'Credit' ? '+' : '-'}{formatCurrency(tx.amount || 0)}
                    </span>
                  </div>
                  <p className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{tx.description}</p>
                  <p className={`text-xs mt-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Ref: {tx.reference}</p>
                </motion.div>
              ))}
              {unreconciledBankTxs.length === 0 && (
                <div className={`p-12 text-center rounded-2xl border border-dashed ${isDark ? 'border-white/10' : 'border-slate-200'}`}>
                  <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-3" />
                  <p className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>All caught up!</p>
                  <p className={`text-xs mt-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>No unreconciled transactions for this account.</p>
                </div>
              )}
            </div>
          </div>

          {/* Right Side: Matching Ledger Entries */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className={`text-sm font-black uppercase tracking-widest ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Matching Ledger Entries
              </h2>
              {selectedBankTx && (
                <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-indigo-500/10 text-indigo-400`}>
                  Matching: {formatCurrency(selectedBankTx.amount || 0)}
                </div>
              )}
            </div>

            {!selectedBankTx ? (
              <div className={`p-12 text-center rounded-2xl border border-dashed ${isDark ? 'border-white/10' : 'border-slate-200'}`}>
                <ArrowRightLeft className={`w-8 h-8 mx-auto mb-3 ${isDark ? 'text-slate-700' : 'text-slate-300'}`} />
                <p className={`text-sm font-bold ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Select a transaction from the left to find a match</p>
              </div>
            ) : (
              <div className="space-y-3">
                {relevantJournalEntries.map((entry) => {
                  const lines = journalLines.filter(l => l.journalEntryId === entry.id);
                  const bankLine = lines.find(l => l.accountId === selectedAccount.accountId);
                  const amount = bankLine ? (bankLine.debit || bankLine.credit) : 0;
                  const isExactMatch = Math.abs(amount - selectedBankTx.amount) < 0.01;

                  return (
                    <motion.div
                      key={entry.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={`p-4 rounded-2xl border group transition-all ${
                        isDark ? 'bg-[#16161D] border-white/5' : 'bg-white border-slate-200'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span className={`text-[10px] font-black uppercase tracking-widest ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                          {new Date(entry.date).toLocaleDateString()}
                        </span>
                        <div className="flex items-center gap-2">
                          {isExactMatch && (
                            <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 text-[8px] font-black uppercase tracking-widest">
                              Exact Match
                            </span>
                          )}
                          <span className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                            {formatCurrency(amount || 0)}
                          </span>
                        </div>
                      </div>
                      <p className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{entry.description}</p>
                      <p className={`text-xs mt-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Ref: {entry.reference}</p>
                      
                      <div className="mt-4 flex justify-end">
                        <button
                          onClick={() => handleMatch(selectedBankTx, entry.id)}
                          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg font-bold uppercase text-[10px] tracking-widest hover:bg-indigo-700 transition-all"
                        >
                          <Check className="w-3 h-3" />
                          Match
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
                {relevantJournalEntries.length === 0 && (
                  <div className={`p-12 text-center rounded-2xl border border-dashed ${isDark ? 'border-white/10' : 'border-slate-200'}`}>
                    <AlertCircle className="w-8 h-8 text-amber-500 mx-auto mb-3" />
                    <p className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>No matching entries found</p>
                    <p className={`text-xs mt-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>You may need to create a journal entry for this transaction first.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
