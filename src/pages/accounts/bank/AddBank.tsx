import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Landmark, Save, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import BackButton from '../../../components/BackButton';
import { useCompanyData } from '../../../context/CompanyDataContext';
import { useTheme } from '../../../context/ThemeContext';

export default function AddBank() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const navigate = useNavigate();
  const { addEntity } = useCompanyData();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    bankName: '',
    branch: '',
    accountName: '',
    accountHolder: '',
    accountNo: '',
    phone: '',
    initialBalance: 0,
    internetBankingUrl: '',
    status: 'Option 1'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await addEntity('bankAccounts', {
        ...formData,
        createdAt: new Date().toISOString()
      });
      navigate('/accounts/bank/list');
    } catch (error) {
      console.error('Error adding bank:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <BackButton />
          <div className={`p-3 rounded-2xl ${isDark ? 'bg-indigo-500/20 text-indigo-400' : 'bg-indigo-100 text-indigo-600'}`}>
            <Landmark className="w-6 h-6" />
          </div>
          <div>
            <h1 className={`text-2xl font-black uppercase tracking-tighter ${isDark ? 'text-white' : 'text-slate-800'}`}>Add Bank</h1>
          </div>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`p-8 rounded-3xl border ${isDark ? 'bg-black/40 border-white/5 backdrop-blur-xl' : 'bg-white border-slate-200 shadow-sm'}`}
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className={`text-[10px] font-black uppercase tracking-widest ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Bank Name</label>
              <input
                required
                type="text"
                value={formData.bankName}
                onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                className={`w-full px-4 py-3 rounded-xl border outline-none transition-all ${
                  isDark ? 'bg-white/5 border-white/10 text-white focus:border-indigo-500' : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-indigo-500'
                }`}
                placeholder="Enter bank name"
              />
            </div>
            <div className="space-y-2">
              <label className={`text-[10px] font-black uppercase tracking-widest ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Branch</label>
              <input
                required
                type="text"
                value={formData.branch}
                onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
                className={`w-full px-4 py-3 rounded-xl border outline-none transition-all ${
                  isDark ? 'bg-white/5 border-white/10 text-white focus:border-indigo-500' : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-indigo-500'
                }`}
                placeholder="Enter branch"
              />
            </div>
            <div className="space-y-2">
              <label className={`text-[10px] font-black uppercase tracking-widest ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Account Name</label>
              <input
                required
                type="text"
                value={formData.accountName}
                onChange={(e) => setFormData({ ...formData, accountName: e.target.value })}
                className={`w-full px-4 py-3 rounded-xl border outline-none transition-all ${
                  isDark ? 'bg-white/5 border-white/10 text-white focus:border-indigo-500' : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-indigo-500'
                }`}
                placeholder="Enter account name"
              />
            </div>
            <div className="space-y-2">
              <label className={`text-[10px] font-black uppercase tracking-widest ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Account Holder</label>
              <input
                required
                type="text"
                value={formData.accountHolder}
                onChange={(e) => setFormData({ ...formData, accountHolder: e.target.value })}
                className={`w-full px-4 py-3 rounded-xl border outline-none transition-all ${
                  isDark ? 'bg-white/5 border-white/10 text-white focus:border-indigo-500' : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-indigo-500'
                }`}
                placeholder="Enter account holder"
              />
            </div>
            <div className="space-y-2">
              <label className={`text-[10px] font-black uppercase tracking-widest ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Account No</label>
              <input
                required
                type="text"
                value={formData.accountNo}
                onChange={(e) => setFormData({ ...formData, accountNo: e.target.value })}
                className={`w-full px-4 py-3 rounded-xl border outline-none transition-all ${
                  isDark ? 'bg-white/5 border-white/10 text-white focus:border-indigo-500' : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-indigo-500'
                }`}
                placeholder="Enter account no"
              />
            </div>
            <div className="space-y-2">
              <label className={`text-[10px] font-black uppercase tracking-widest ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Phone</label>
              <input
                required
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className={`w-full px-4 py-3 rounded-xl border outline-none transition-all ${
                  isDark ? 'bg-white/5 border-white/10 text-white focus:border-indigo-500' : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-indigo-500'
                }`}
                placeholder="Enter phone"
              />
            </div>
            <div className="space-y-2">
              <label className={`text-[10px] font-black uppercase tracking-widest ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Initial Balance</label>
              <input
                required
                type="number"
                value={formData.initialBalance}
                onChange={(e) => setFormData({ ...formData, initialBalance: parseFloat(e.target.value) })}
                className={`w-full px-4 py-3 rounded-xl border outline-none transition-all ${
                  isDark ? 'bg-white/5 border-white/10 text-white focus:border-indigo-500' : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-indigo-500'
                }`}
                placeholder="0.00"
              />
            </div>
            <div className="space-y-2">
              <label className={`text-[10px] font-black uppercase tracking-widest ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Internet Banking URL</label>
              <input
                type="text"
                value={formData.internetBankingUrl}
                onChange={(e) => setFormData({ ...formData, internetBankingUrl: e.target.value })}
                className={`w-full px-4 py-3 rounded-xl border outline-none transition-all ${
                  isDark ? 'bg-white/5 border-white/10 text-white focus:border-indigo-500' : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-indigo-500'
                }`}
                placeholder="Enter URL"
              />
            </div>
            <div className="space-y-2">
              <label className={`text-[10px] font-black uppercase tracking-widest ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Status</label>
              <div className="flex gap-4 pt-2">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="status"
                    value="Option 1"
                    checked={formData.status === 'Option 1'}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  />
                  <span className={isDark ? 'text-white' : 'text-slate-900'}>Option 1</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="status"
                    value="Option 2"
                    checked={formData.status === 'Option 2'}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  />
                  <span className={isDark ? 'text-white' : 'text-slate-900'}>Option 2</span>
                </label>
              </div>
            </div>
          </div>

          <div className="flex justify-start pt-6">
            <button
              disabled={loading}
              type="submit"
              className={`flex items-center gap-2 px-8 py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/20 disabled:opacity-50`}
            >
              {loading ? 'Saving...' : 'Add Bank'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
