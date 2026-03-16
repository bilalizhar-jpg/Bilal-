import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Building2, 
  Plus, 
  Search, 
  MoreVertical, 
  Edit2, 
  Trash2, 
  ExternalLink,
  CreditCard,
  ArrowRightLeft,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import { useBank, BankAccount } from '../../context/BankContext';
import { useAccounting } from '../../context/AccountingContext';
import { useTheme } from '../../context/ThemeContext';

export default function BankAccounts() {
  const { bankAccounts, addBankAccount, updateBankAccount, deleteBankAccount, loading } = useBank();
  const { accounts } = useAccounting();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<BankAccount | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const [formData, setFormData] = useState({
    bankName: '',
    accountName: '',
    accountNumber: '',
    currency: 'USD',
    openingBalance: 0,
    accountId: ''
  });

  const filteredAccounts = bankAccounts.filter(acc => 
    acc.bankName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    acc.accountName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    acc.accountNumber.includes(searchTerm)
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingAccount) {
        await updateBankAccount(editingAccount.id, formData);
      } else {
        await addBankAccount(formData);
      }
      setIsModalOpen(false);
      setEditingAccount(null);
      setFormData({
        bankName: '',
        accountName: '',
        accountNumber: '',
        currency: 'USD',
        openingBalance: 0,
        accountId: ''
      });
    } catch (error) {
      console.error('Error saving bank account:', error);
    }
  };

  const handleEdit = (acc: BankAccount) => {
    setEditingAccount(acc);
    setFormData({
      bankName: acc.bankName,
      accountName: acc.accountName,
      accountNumber: acc.accountNumber,
      currency: acc.currency,
      openingBalance: acc.openingBalance,
      accountId: acc.accountId
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this bank account?')) {
      try {
        await deleteBankAccount(id);
      } catch (error) {
        console.error('Error deleting bank account:', error);
      }
    }
  };

  return (
    <div className={`p-6 min-h-screen ${isDark ? 'bg-[#0F0F12]' : 'bg-slate-50'}`}>
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className={`text-3xl font-black uppercase tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Bank Accounts
            </h1>
            <p className={`mt-1 text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Manage your company bank accounts and balances
            </p>
          </div>
          <button
            onClick={() => {
              setEditingAccount(null);
              setFormData({
                bankName: '',
                accountName: '',
                accountNumber: '',
                currency: 'USD',
                openingBalance: 0,
                accountId: ''
              });
              setIsModalOpen(true);
            }}
            className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold uppercase text-xs tracking-widest hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/20"
          >
            <Plus className="w-4 h-4" />
            Add Bank Account
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAccounts.map((acc) => (
            <motion.div
              key={acc.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-6 rounded-2xl border ${
                isDark ? 'bg-[#16161D] border-white/5' : 'bg-white border-slate-200'
              } shadow-sm group relative overflow-hidden`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-xl ${isDark ? 'bg-indigo-500/10' : 'bg-indigo-50'}`}>
                  <Building2 className={`w-6 h-6 ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`} />
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleEdit(acc)}
                    className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-white/5 text-slate-400' : 'hover:bg-slate-100 text-slate-500'}`}
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(acc.id)}
                    className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-red-500/10 text-slate-400 hover:text-red-400' : 'hover:bg-red-50 text-slate-500 hover:text-red-600'}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="mb-6">
                <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{acc.bankName}</h3>
                <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{acc.accountName}</p>
                <p className={`text-xs font-mono mt-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{acc.accountNumber}</p>
              </div>

              <div className="flex items-end justify-between">
                <div>
                  <p className={`text-[10px] font-black uppercase tracking-widest mb-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                    Current Balance
                  </p>
                  <p className={`text-2xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    {acc.currency} {(acc.currentBalance || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-dashed border-slate-200 dark:border-white/5 flex items-center justify-between gap-2">
                <button 
                  onClick={() => window.location.href = `/accounting/bank/transactions?id=${acc.id}`}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                    isDark ? 'bg-white/5 text-white hover:bg-white/10' : 'bg-slate-100 text-slate-900 hover:bg-slate-200'
                  }`}
                >
                  <ArrowRightLeft className="w-3 h-3" />
                  Transactions
                </button>
                <button 
                  onClick={() => window.location.href = `/accounting/bank/reconcile?id=${acc.id}`}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                    isDark ? 'bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20' : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'
                  }`}
                >
                  <CheckCircle2 className="w-3 h-3" />
                  Reconcile
                </button>
              </div>
            </motion.div>
          ))}
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
                <h2 className="text-2xl font-black uppercase tracking-tight mb-6">
                  {editingAccount ? 'Edit Bank Account' : 'Add Bank Account'}
                </h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Bank Name</label>
                    <input
                      required
                      type="text"
                      value={formData.bankName}
                      onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                      className={`w-full px-4 py-3 rounded-xl border ${isDark ? 'bg-white/5 border-white/10 focus:border-indigo-500' : 'bg-slate-50 border-slate-200 focus:border-indigo-600'} outline-none transition-all`}
                      placeholder="e.g. Chase Bank"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Account Name</label>
                    <input
                      required
                      type="text"
                      value={formData.accountName}
                      onChange={(e) => setFormData({ ...formData, accountName: e.target.value })}
                      className={`w-full px-4 py-3 rounded-xl border ${isDark ? 'bg-white/5 border-white/10 focus:border-indigo-500' : 'bg-slate-50 border-slate-200 focus:border-indigo-600'} outline-none transition-all`}
                      placeholder="e.g. Main Operating Account"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Account Number</label>
                      <input
                        required
                        type="text"
                        value={formData.accountNumber}
                        onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                        className={`w-full px-4 py-3 rounded-xl border ${isDark ? 'bg-white/5 border-white/10 focus:border-indigo-500' : 'bg-slate-50 border-slate-200 focus:border-indigo-600'} outline-none transition-all`}
                        placeholder="**** 1234"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Currency</label>
                      <select
                        value={formData.currency}
                        onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                        className={`w-full px-4 py-3 rounded-xl border ${isDark ? 'bg-white/5 border-white/10 focus:border-indigo-500' : 'bg-slate-50 border-slate-200 focus:border-indigo-600'} outline-none transition-all`}
                      >
                        <option value="USD">USD</option>
                        <option value="EUR">EUR</option>
                        <option value="GBP">GBP</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Linked Ledger Account</label>
                    <select
                      required
                      value={formData.accountId}
                      onChange={(e) => setFormData({ ...formData, accountId: e.target.value })}
                      className={`w-full px-4 py-3 rounded-xl border ${isDark ? 'bg-white/5 border-white/10 focus:border-indigo-500' : 'bg-slate-50 border-slate-200 focus:border-indigo-600'} outline-none transition-all`}
                    >
                      <option value="">Select Account</option>
                      {accounts.filter(a => a.type === 'Asset').map(a => (
                        <option key={a.id} value={a.id}>{a.code} - {a.name}</option>
                      ))}
                    </select>
                  </div>
                  {!editingAccount && (
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Opening Balance</label>
                      <input
                        required
                        type="number"
                        step="0.01"
                        value={formData.openingBalance}
                        onChange={(e) => setFormData({ ...formData, openingBalance: parseFloat(e.target.value) })}
                        className={`w-full px-4 py-3 rounded-xl border ${isDark ? 'bg-white/5 border-white/10 focus:border-indigo-500' : 'bg-slate-50 border-slate-200 focus:border-indigo-600'} outline-none transition-all`}
                      />
                    </div>
                  )}
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
                      {editingAccount ? 'Update' : 'Create'}
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
