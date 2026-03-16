import React, { useState } from 'react';
import AccountingLayout from '../../components/accounting/AccountingLayout';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Search, Edit2, Trash2, X, AlertCircle } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useAccounting, Account, AccountType } from '../../context/AccountingContext';

export default function ChartOfAccounts() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const { accounts, loading, addAccount, updateAccount, deleteAccount } = useAccounting();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    type: 'Asset' as AccountType,
    parentAccountId: '',
    openingBalance: 0,
    description: '',
    isActive: true
  });

  const accountTypes: AccountType[] = ['Asset', 'Liability', 'Equity', 'Revenue', 'Expense'];

  const filteredAccounts = accounts.filter(account => 
    account.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    account.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenModal = (account?: Account) => {
    if (account) {
      setEditingAccount(account);
      setFormData({
        code: account.code,
        name: account.name,
        type: account.type,
        parentAccountId: account.parentAccountId || '',
        openingBalance: account.openingBalance,
        description: account.description || '',
        isActive: account.isActive
      });
    } else {
      setEditingAccount(null);
      setFormData({
        code: '',
        name: '',
        type: 'Asset',
        parentAccountId: '',
        openingBalance: 0,
        description: '',
        isActive: true
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingAccount) {
        await updateAccount(editingAccount.id, {
          ...formData,
          parentAccountId: formData.parentAccountId || undefined
        });
      } else {
        await addAccount({
          ...formData,
          parentAccountId: formData.parentAccountId || undefined
        });
      }
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error saving account:', error);
      alert('Failed to save account');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this account?')) {
      try {
        await deleteAccount(id);
      } catch (error) {
        console.error('Error deleting account:', error);
        alert('Failed to delete account');
      }
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  return (
    <AccountingLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className={`text-2xl font-black uppercase tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Chart of Accounts
            </h1>
            <p className={`text-sm ${isDark ? 'text-[#B0B0C3]' : 'text-slate-500'}`}>
              Manage your general ledger accounts
            </p>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => handleOpenModal()}
              className={`flex items-center gap-2 px-4 py-2 rounded-md font-bold text-sm uppercase tracking-widest transition-colors ${
                isDark 
                  ? 'bg-[#00FFCC] text-[#1E1E2F] hover:bg-[#00D1FF] shadow-[0_0_8px_rgba(0,255,204,0.4)]' 
                  : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md'
              }`}
            >
              <Plus className="w-4 h-4" />
              Add Account
            </button>
          </div>
        </div>

        <div className={`p-6 rounded-2xl border ${isDark ? 'bg-[#2A2A3D] border-white/5' : 'bg-white border-slate-200'}`}>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1 max-w-md">
              <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${isDark ? 'text-[#B0B0C3]' : 'text-slate-400'}`} />
              <input
                type="text"
                placeholder="Search accounts by code or name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full pl-10 pr-4 py-2 rounded-xl text-sm transition-all outline-none border ${
                  isDark 
                    ? 'bg-[#1E1E2F] border-white/10 text-white placeholder-[#B0B0C3] focus:border-[#00FFCC]' 
                    : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-indigo-500'
                }`}
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className={`border-b ${isDark ? 'border-white/10' : 'border-slate-200'}`}>
                  <th className={`py-3 px-4 text-xs font-black uppercase tracking-widest ${isDark ? 'text-[#B0B0C3]' : 'text-slate-500'}`}>Code</th>
                  <th className={`py-3 px-4 text-xs font-black uppercase tracking-widest ${isDark ? 'text-[#B0B0C3]' : 'text-slate-500'}`}>Account Name</th>
                  <th className={`py-3 px-4 text-xs font-black uppercase tracking-widest ${isDark ? 'text-[#B0B0C3]' : 'text-slate-500'}`}>Type</th>
                  <th className={`py-3 px-4 text-xs font-black uppercase tracking-widest ${isDark ? 'text-[#B0B0C3]' : 'text-slate-500'}`}>Parent</th>
                  <th className={`py-3 px-4 text-xs font-black uppercase tracking-widest text-right ${isDark ? 'text-[#B0B0C3]' : 'text-slate-500'}`}>Balance</th>
                  <th className={`py-3 px-4 text-xs font-black uppercase tracking-widest text-right ${isDark ? 'text-[#B0B0C3]' : 'text-slate-500'}`}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
                    </td>
                  </tr>
                ) : filteredAccounts.length === 0 ? (
                  <tr>
                    <td colSpan={6} className={`py-8 text-center text-sm ${isDark ? 'text-[#B0B0C3]' : 'text-slate-500'}`}>
                      No accounts found.
                    </td>
                  </tr>
                ) : (
                  filteredAccounts.map((account) => (
                    <tr key={account.id} className={`border-b last:border-0 transition-colors ${isDark ? 'border-white/5 hover:bg-white/5' : 'border-slate-100 hover:bg-slate-50'}`}>
                      <td className={`py-3 px-4 text-sm font-mono ${isDark ? 'text-white' : 'text-slate-900'}`}>{account.code}</td>
                      <td className={`py-3 px-4 text-sm font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>{account.name}</td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                          account.type === 'Asset' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400' :
                          account.type === 'Liability' ? 'bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400' :
                          account.type === 'Equity' ? 'bg-purple-100 text-purple-700 dark:bg-purple-500/10 dark:text-purple-400' :
                          account.type === 'Revenue' ? 'bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400' :
                          'bg-orange-100 text-orange-700 dark:bg-orange-500/10 dark:text-orange-400'
                        }`}>
                          {account.type}
                        </span>
                      </td>
                      <td className={`py-3 px-4 text-sm ${isDark ? 'text-[#B0B0C3]' : 'text-slate-500'}`}>
                        {account.parentAccountId ? accounts.find(a => a.id === account.parentAccountId)?.name || 'Unknown' : '-'}
                      </td>
                      <td className={`py-3 px-4 text-sm font-mono text-right ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        {formatCurrency(account.currentBalance)}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={() => handleOpenModal(account)}
                            className={`p-1.5 rounded-lg transition-colors ${isDark ? 'hover:bg-white/10 text-[#B0B0C3] hover:text-white' : 'hover:bg-slate-200 text-slate-500 hover:text-slate-900'}`}
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDelete(account.id)}
                            className={`p-1.5 rounded-lg transition-colors ${isDark ? 'hover:bg-red-500/20 text-red-400 hover:text-red-300' : 'hover:bg-red-100 text-red-600 hover:text-red-700'}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setIsModalOpen(false)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className={`relative w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden ${isDark ? 'bg-[#1E1E2F] border border-white/10' : 'bg-white'}`}
            >
              <div className={`p-6 border-b flex items-center justify-between ${isDark ? 'border-white/10' : 'border-slate-200'}`}>
                <h2 className={`text-xl font-black uppercase tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  {editingAccount ? 'Edit Account' : 'Add New Account'}
                </h2>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-white/10 text-[#B0B0C3]' : 'hover:bg-slate-100 text-slate-500'}`}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-xs font-bold uppercase tracking-widest mb-2 ${isDark ? 'text-[#B0B0C3]' : 'text-slate-500'}`}>
                      Account Code *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.code}
                      onChange={(e) => setFormData({...formData, code: e.target.value})}
                      className={`w-full px-4 py-2.5 rounded-xl text-sm transition-all outline-none border ${
                        isDark 
                          ? 'bg-[#2A2A3D] border-white/10 text-white focus:border-[#00FFCC]' 
                          : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-indigo-500'
                      }`}
                      placeholder="e.g. 1000"
                    />
                  </div>
                  <div>
                    <label className={`block text-xs font-bold uppercase tracking-widest mb-2 ${isDark ? 'text-[#B0B0C3]' : 'text-slate-500'}`}>
                      Account Type *
                    </label>
                    <select
                      required
                      value={formData.type}
                      onChange={(e) => setFormData({...formData, type: e.target.value as AccountType})}
                      className={`w-full px-4 py-2.5 rounded-xl text-sm transition-all outline-none border ${
                        isDark 
                          ? 'bg-[#2A2A3D] border-white/10 text-white focus:border-[#00FFCC]' 
                          : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-indigo-500'
                      }`}
                    >
                      {accountTypes.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className={`block text-xs font-bold uppercase tracking-widest mb-2 ${isDark ? 'text-[#B0B0C3]' : 'text-slate-500'}`}>
                    Account Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className={`w-full px-4 py-2.5 rounded-xl text-sm transition-all outline-none border ${
                      isDark 
                        ? 'bg-[#2A2A3D] border-white/10 text-white focus:border-[#00FFCC]' 
                        : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-indigo-500'
                    }`}
                    placeholder="e.g. Cash in Bank"
                  />
                </div>

                <div>
                  <label className={`block text-xs font-bold uppercase tracking-widest mb-2 ${isDark ? 'text-[#B0B0C3]' : 'text-slate-500'}`}>
                    Parent Account (Optional)
                  </label>
                  <select
                    value={formData.parentAccountId}
                    onChange={(e) => setFormData({...formData, parentAccountId: e.target.value})}
                    className={`w-full px-4 py-2.5 rounded-xl text-sm transition-all outline-none border ${
                      isDark 
                        ? 'bg-[#2A2A3D] border-white/10 text-white focus:border-[#00FFCC]' 
                        : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-indigo-500'
                    }`}
                  >
                    <option value="">None (Top Level)</option>
                    {accounts.filter(a => a.id !== editingAccount?.id).map(account => (
                      <option key={account.id} value={account.id}>
                        {account.code} - {account.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={`block text-xs font-bold uppercase tracking-widest mb-2 ${isDark ? 'text-[#B0B0C3]' : 'text-slate-500'}`}>
                    Opening Balance
                  </label>
                  <div className="relative">
                    <span className={`absolute left-4 top-1/2 -translate-y-1/2 ${isDark ? 'text-[#B0B0C3]' : 'text-slate-400'}`}>$</span>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.openingBalance}
                      onChange={(e) => setFormData({...formData, openingBalance: parseFloat(e.target.value) || 0})}
                      disabled={!!editingAccount} // Cannot change opening balance after creation
                      className={`w-full pl-8 pr-4 py-2.5 rounded-xl text-sm transition-all outline-none border ${
                        isDark 
                          ? 'bg-[#2A2A3D] border-white/10 text-white focus:border-[#00FFCC] disabled:opacity-50' 
                          : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-indigo-500 disabled:opacity-50'
                      }`}
                    />
                  </div>
                  {editingAccount && (
                    <p className={`mt-1 text-xs flex items-center gap-1 ${isDark ? 'text-amber-400' : 'text-amber-600'}`}>
                      <AlertCircle className="w-3 h-3" />
                      Opening balance cannot be changed after creation. Use journal entries to adjust balance.
                    </p>
                  )}
                </div>

                <div className="pt-4 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className={`px-4 py-2 rounded-lg font-bold text-sm uppercase tracking-widest transition-colors ${
                      isDark ? 'hover:bg-white/10 text-white' : 'hover:bg-slate-100 text-slate-900'
                    }`}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className={`px-6 py-2 rounded-lg font-bold text-sm uppercase tracking-widest transition-colors ${
                      isDark 
                        ? 'bg-[#00FFCC] text-[#1E1E2F] hover:bg-[#00D1FF] shadow-[0_0_8px_rgba(0,255,204,0.4)]' 
                        : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md'
                    }`}
                  >
                    {editingAccount ? 'Save Changes' : 'Create Account'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </AccountingLayout>
  );
}
