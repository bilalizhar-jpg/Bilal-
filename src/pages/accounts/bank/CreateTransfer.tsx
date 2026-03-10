import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowRightLeft, Save, ArrowLeft, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCompanyData } from '../../../context/CompanyDataContext';
import { useTheme } from '../../../context/ThemeContext';

export default function CreateTransfer() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const navigate = useNavigate();
  const { bankAccounts, addEntity, updateEntity } = useCompanyData();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    fromAccountId: '',
    toAccountId: '',
    amount: 0,
    date: new Date().toISOString().split('T')[0],
    reference: '',
    description: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (formData.fromAccountId === formData.toAccountId) {
      setError('Source and destination accounts cannot be the same.');
      return;
    }

    const fromAccount = bankAccounts.find(a => a.id === formData.fromAccountId);
    if (fromAccount && fromAccount.currentBalance < formData.amount) {
      setError('Insufficient balance in the source account.');
      return;
    }

    setLoading(true);
    try {
      // 1. Create Transfer Record
      await addEntity('bankTransfers', {
        ...formData,
        createdAt: new Date().toISOString()
      });

      // 2. Update Source Account Balance
      if (fromAccount) {
        await updateEntity('bankAccounts', fromAccount.id, {
          currentBalance: fromAccount.currentBalance - formData.amount
        });
      }

      // 3. Update Destination Account Balance
      const toAccount = bankAccounts.find(a => a.id === formData.toAccountId);
      if (toAccount) {
        await updateEntity('bankAccounts', toAccount.id, {
          currentBalance: (toAccount.currentBalance || 0) + formData.amount
        });
      }

      navigate('/accounts/bank/transfer/list');
    } catch (error) {
      console.error('Error creating transfer:', error);
      setError('Failed to process transfer. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className={`p-3 rounded-2xl ${isDark ? 'bg-indigo-500/20 text-indigo-400' : 'bg-indigo-100 text-indigo-600'}`}>
            <ArrowRightLeft className="w-6 h-6" />
          </div>
          <div>
            <h1 className={`text-2xl font-black uppercase tracking-tighter ${isDark ? 'text-white' : 'text-slate-800'}`}>Create Transfer</h1>
            <p className="text-slate-500 text-xs font-black uppercase tracking-widest">Transfer funds between bank accounts</p>
          </div>
        </div>
        <button
          onClick={() => navigate(-1)}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
            isDark ? 'bg-white/5 text-white hover:bg-white/10' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`p-4 rounded-2xl flex items-center gap-3 ${isDark ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-red-50 text-red-700 border border-red-100'}`}
        >
          <AlertCircle className="w-5 h-5" />
          <p className="text-xs font-bold">{error}</p>
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`p-8 rounded-3xl border ${isDark ? 'bg-black/40 border-white/5 backdrop-blur-xl' : 'bg-white border-slate-200 shadow-sm'}`}
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className={`text-[10px] font-black uppercase tracking-widest ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>From Account</label>
              <select
                required
                value={formData.fromAccountId}
                onChange={(e) => setFormData({ ...formData, fromAccountId: e.target.value })}
                className={`w-full px-4 py-3 rounded-xl border outline-none transition-all ${
                  isDark ? 'bg-white/5 border-white/10 text-white focus:border-indigo-500' : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-indigo-500'
                }`}
              >
                <option value="">Select Source Account</option>
                {bankAccounts.map(bank => (
                  <option key={bank.id} value={bank.id}>{bank.bankName} - {bank.accountNumber} (${bank.currentBalance?.toLocaleString()})</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className={`text-[10px] font-black uppercase tracking-widest ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>To Account</label>
              <select
                required
                value={formData.toAccountId}
                onChange={(e) => setFormData({ ...formData, toAccountId: e.target.value })}
                className={`w-full px-4 py-3 rounded-xl border outline-none transition-all ${
                  isDark ? 'bg-white/5 border-white/10 text-white focus:border-indigo-500' : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-indigo-500'
                }`}
              >
                <option value="">Select Destination Account</option>
                {bankAccounts.map(bank => (
                  <option key={bank.id} value={bank.id}>{bank.bankName} - {bank.accountNumber} (${bank.currentBalance?.toLocaleString()})</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className={`text-[10px] font-black uppercase tracking-widest ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Transfer Amount</label>
              <input
                required
                type="number"
                min="0.01"
                step="0.01"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) })}
                className={`w-full px-4 py-3 rounded-xl border outline-none transition-all ${
                  isDark ? 'bg-white/5 border-white/10 text-white focus:border-indigo-500' : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-indigo-500'
                }`}
                placeholder="0.00"
              />
            </div>
            <div className="space-y-2">
              <label className={`text-[10px] font-black uppercase tracking-widest ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Transfer Date</label>
              <input
                required
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className={`w-full px-4 py-3 rounded-xl border outline-none transition-all ${
                  isDark ? 'bg-white/5 border-white/10 text-white focus:border-indigo-500' : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-indigo-500'
                }`}
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className={`text-[10px] font-black uppercase tracking-widest ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Reference / Note</label>
              <input
                type="text"
                value={formData.reference}
                onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
                className={`w-full px-4 py-3 rounded-xl border outline-none transition-all ${
                  isDark ? 'bg-white/5 border-white/10 text-white focus:border-indigo-500' : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-indigo-500'
                }`}
                placeholder="Enter reference or transaction ID"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className={`text-[10px] font-black uppercase tracking-widest ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className={`w-full px-4 py-3 rounded-xl border outline-none transition-all ${
                  isDark ? 'bg-white/5 border-white/10 text-white focus:border-indigo-500' : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-indigo-500'
                }`}
                placeholder="Enter transfer details..."
              />
            </div>
          </div>

          <div className="flex justify-end pt-6">
            <button
              disabled={loading}
              type="submit"
              className={`flex items-center gap-2 px-8 py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/20 disabled:opacity-50`}
            >
              <ArrowRightLeft className="w-4 h-4" />
              {loading ? 'Processing...' : 'Execute Transfer'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
