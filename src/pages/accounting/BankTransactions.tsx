import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, 
  Plus, 
  Search, 
  Download, 
  Upload, 
  CheckCircle2, 
  XCircle,
  Filter,
  Calendar,
  Tag,
  FileText
} from 'lucide-react';
import { useBank, BankTransaction, BankAccount } from '../../context/BankContext';
import { useTheme } from '../../context/ThemeContext';

export default function BankTransactions() {
  const location = useLocation();
  const navigate = useNavigate();
  const { bankAccounts, bankTransactions, addBankTransaction, loading } = useBank();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const queryParams = new URLSearchParams(location.search);
  const bankAccountId = queryParams.get('id');

  const [selectedAccount, setSelectedAccount] = useState<BankAccount | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    reference: '',
    amount: 0,
    type: 'Debit' as 'Debit' | 'Credit',
    description: '',
    bankAccountId: bankAccountId || ''
  });

  useEffect(() => {
    if (bankAccountId) {
      const acc = bankAccounts.find(a => a.id === bankAccountId);
      if (acc) setSelectedAccount(acc);
    }
  }, [bankAccountId, bankAccounts]);

  const filteredTransactions = bankTransactions.filter(tx => 
    (!bankAccountId || tx.bankAccountId === bankAccountId) &&
    (tx.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
     tx.reference.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addBankTransaction(formData);
      setIsModalOpen(false);
      setFormData({
        date: new Date().toISOString().split('T')[0],
        reference: '',
        amount: 0,
        type: 'Debit',
        description: '',
        bankAccountId: bankAccountId || ''
      });
    } catch (error) {
      console.error('Error saving transaction:', error);
    }
  };

  if (!selectedAccount && bankAccountId) return <div>Loading account...</div>;

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
              {selectedAccount ? `${selectedAccount.bankName} - Transactions` : 'All Bank Transactions'}
            </h1>
            <p className={`mt-1 text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              {selectedAccount ? `Account: ${selectedAccount.accountNumber}` : 'View and manage all bank transactions'}
            </p>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
            <input
              type="text"
              placeholder="Search transactions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pl-12 pr-4 py-3 rounded-xl border ${isDark ? 'bg-[#16161D] border-white/5 text-white focus:border-indigo-500' : 'bg-white border-slate-200 text-slate-900 focus:border-indigo-600'} outline-none transition-all`}
            />
          </div>
          <div className="flex gap-2">
            <button className={`flex items-center gap-2 px-4 py-3 rounded-xl border font-bold uppercase text-[10px] tracking-widest transition-all ${isDark ? 'bg-[#16161D] border-white/5 text-white hover:bg-white/10' : 'bg-white border-slate-200 text-slate-900 hover:bg-slate-50'}`}>
              <Download className="w-4 h-4" />
              Export
            </button>
            <button className={`flex items-center gap-2 px-4 py-3 rounded-xl border font-bold uppercase text-[10px] tracking-widest transition-all ${isDark ? 'bg-[#16161D] border-white/5 text-white hover:bg-white/10' : 'bg-white border-slate-200 text-slate-900 hover:bg-slate-50'}`}>
              <Upload className="w-4 h-4" />
              Import Statement
            </button>
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold uppercase text-xs tracking-widest hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/20"
            >
              <Plus className="w-4 h-4" />
              Add Transaction
            </button>
          </div>
        </div>

        <div className={`rounded-2xl border overflow-hidden ${isDark ? 'bg-[#16161D] border-white/5' : 'bg-white border-slate-200'}`}>
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className={`border-b ${isDark ? 'border-white/5 bg-white/5' : 'border-slate-200 bg-slate-50'}`}>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Status</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Date</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Reference</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Description</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500 text-right">Debit</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500 text-right">Credit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-white/5">
              {filteredTransactions.map((tx) => (
                <tr key={tx.id} className={`group transition-colors ${isDark ? 'hover:bg-white/5' : 'hover:bg-slate-50'}`}>
                  <td className="px-6 py-4">
                    {tx.isReconciled ? (
                      <div className="flex items-center gap-2 text-emerald-500">
                        <CheckCircle2 className="w-4 h-4" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Reconciled</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-amber-500">
                        <XCircle className="w-4 h-4" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Unreconciled</span>
                      </div>
                    )}
                  </td>
                  <td className={`px-6 py-4 text-sm font-medium ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                    {new Date(tx.date).toLocaleDateString()}
                  </td>
                  <td className={`px-6 py-4 text-sm font-mono ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    {tx.reference}
                  </td>
                  <td className={`px-6 py-4 text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    {tx.description}
                  </td>
                  <td className="px-6 py-4 text-right">
                    {tx.type === 'Debit' && (
                      <span className="text-sm font-bold text-red-500">
                        ({(tx.amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })})
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    {tx.type === 'Credit' && (
                      <span className="text-sm font-bold text-emerald-500">
                        {(tx.amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
              {filteredTransactions.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <p className={`text-sm ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>No transactions found</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Modal */}
        <AnimatePresence>
          {isModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className={`w-full max-w-md p-8 rounded-3xl shadow-2xl ${isDark ? 'bg-[#16161D] text-white' : 'bg-white text-slate-900'}`}
              >
                <h2 className="text-2xl font-black uppercase tracking-tight mb-6">Add Transaction</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                  {!bankAccountId && (
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Bank Account</label>
                      <select
                        required
                        value={formData.bankAccountId}
                        onChange={(e) => setFormData({ ...formData, bankAccountId: e.target.value })}
                        className={`w-full px-4 py-3 rounded-xl border ${isDark ? 'bg-white/5 border-white/10 focus:border-indigo-500' : 'bg-slate-50 border-slate-200 focus:border-indigo-600'} outline-none transition-all`}
                      >
                        <option value="">Select Account</option>
                        {bankAccounts.map(acc => (
                          <option key={acc.id} value={acc.id}>{acc.bankName} - {acc.accountNumber}</option>
                        ))}
                      </select>
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Date</label>
                      <input
                        required
                        type="date"
                        value={formData.date}
                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                        className={`w-full px-4 py-3 rounded-xl border ${isDark ? 'bg-white/5 border-white/10 focus:border-indigo-500' : 'bg-slate-50 border-slate-200 focus:border-indigo-600'} outline-none transition-all`}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Reference</label>
                      <input
                        required
                        type="text"
                        value={formData.reference}
                        onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
                        className={`w-full px-4 py-3 rounded-xl border ${isDark ? 'bg-white/5 border-white/10 focus:border-indigo-500' : 'bg-slate-50 border-slate-200 focus:border-indigo-600'} outline-none transition-all`}
                        placeholder="e.g. CHK-101"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Type</label>
                      <select
                        value={formData.type}
                        onChange={(e) => setFormData({ ...formData, type: e.target.value as 'Debit' | 'Credit' })}
                        className={`w-full px-4 py-3 rounded-xl border ${isDark ? 'bg-white/5 border-white/10 focus:border-indigo-500' : 'bg-slate-50 border-slate-200 focus:border-indigo-600'} outline-none transition-all`}
                      >
                        <option value="Debit">Debit (Out)</option>
                        <option value="Credit">Credit (In)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Amount</label>
                      <input
                        required
                        type="number"
                        step="0.01"
                        value={formData.amount}
                        onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) })}
                        className={`w-full px-4 py-3 rounded-xl border ${isDark ? 'bg-white/5 border-white/10 focus:border-indigo-500' : 'bg-slate-50 border-slate-200 focus:border-indigo-600'} outline-none transition-all`}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Description</label>
                    <textarea
                      required
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className={`w-full px-4 py-3 rounded-xl border ${isDark ? 'bg-white/5 border-white/10 focus:border-indigo-500' : 'bg-slate-50 border-slate-200 focus:border-indigo-600'} outline-none transition-all h-24 resize-none`}
                      placeholder="Transaction details..."
                    />
                  </div>
                  <div className="flex gap-4 mt-8">
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className={`flex-1 px-6 py-3 rounded-xl font-bold uppercase text-xs tracking-widest transition-all ${isDark ? 'bg-white/5 text-white hover:bg-white/10' : 'bg-slate-100 text-slate-900 hover:bg-slate-200'}`}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold uppercase text-xs tracking-widest hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/20"
                    >
                      Save
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
