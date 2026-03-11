import React, { useState } from 'react';
import { motion } from 'motion/react';
import { AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCompanyData } from '../../../context/CompanyDataContext';
import { useTheme } from '../../../context/ThemeContext';
import AdminLayout from '../../../components/AdminLayout';

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
    if (fromAccount && (fromAccount.initialBalance || 0) < formData.amount) {
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
          initialBalance: (fromAccount.initialBalance || 0) - formData.amount
        });
      }

      // 3. Update Destination Account Balance
      const toAccount = bankAccounts.find(a => a.id === formData.toAccountId);
      if (toAccount) {
        await updateEntity('bankAccounts', toAccount.id, {
          initialBalance: (toAccount.initialBalance || 0) + formData.amount
        });
      }

      navigate('/accounts/bank/transfer-list');
    } catch (error) {
      console.error('Error creating transfer:', error);
      setError('Failed to process transfer. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>Create Transfer</h1>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`p-4 rounded-md flex items-center gap-3 ${isDark ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-red-50 text-red-700 border border-red-100'}`}
          >
            <AlertCircle className="w-5 h-5" />
            <p className="text-sm font-medium">{error}</p>
          </motion.div>
        )}

        <div className={`p-6 rounded-md border ${isDark ? 'bg-black/40 border-white/5' : 'bg-white border-slate-200'}`}>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className={`text-sm font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>From Account</label>
                <select
                  required
                  value={formData.fromAccountId}
                  onChange={(e) => setFormData({ ...formData, fromAccountId: e.target.value })}
                  className={`w-full px-4 py-2.5 rounded-md border outline-none transition-all ${
                    isDark ? 'bg-white/5 border-white/10 text-white focus:border-[#6f42c1]' : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-[#6f42c1]'
                  }`}
                >
                  <option value="">Select Account</option>
                  {bankAccounts.map(bank => (
                    <option key={bank.id} value={bank.id}>{bank.bankName} ({bank.accountNo})</option>
                  ))}
                </select>
              </div>
              
              <div className="space-y-2">
                <label className={`text-sm font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>To Account</label>
                <select
                  required
                  value={formData.toAccountId}
                  onChange={(e) => setFormData({ ...formData, toAccountId: e.target.value })}
                  className={`w-full px-4 py-2.5 rounded-md border outline-none transition-all ${
                    isDark ? 'bg-white/5 border-white/10 text-white focus:border-[#6f42c1]' : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-[#6f42c1]'
                  }`}
                >
                  <option value="">Select Account</option>
                  {bankAccounts.map(bank => (
                    <option key={bank.id} value={bank.id}>{bank.bankName} ({bank.accountNo})</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className={`text-sm font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Initial Balance</label>
                <input
                  required
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={formData.amount || ''}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value ? parseFloat(e.target.value) : 0 })}
                  className={`w-full px-4 py-2.5 rounded-md border outline-none transition-all ${
                    isDark ? 'bg-white/5 border-white/10 text-white focus:border-[#6f42c1]' : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-[#6f42c1]'
                  }`}
                  placeholder="$57,200"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className={`text-sm font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Note</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                className={`w-full px-4 py-3 rounded-md border outline-none transition-all resize-y ${
                  isDark ? 'bg-white/5 border-white/10 text-white focus:border-[#6f42c1]' : 'bg-white border-slate-200 text-slate-900 focus:border-[#6f42c1]'
                }`}
                placeholder="Write a transfer note...."
              />
            </div>

            <div className="flex justify-start pt-2">
              <button
                disabled={loading}
                type="submit"
                className={`px-6 py-2.5 bg-[#6f42c1] text-white rounded-md font-medium hover:bg-[#5a32a3] transition-all disabled:opacity-50`}
              >
                {loading ? 'Processing...' : 'Create Transfer'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </AdminLayout>
  );
}
