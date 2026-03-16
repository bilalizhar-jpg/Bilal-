import React, { useState } from 'react';
import AccountingLayout from '../../components/accounting/AccountingLayout';
import { useTheme } from '../../context/ThemeContext';
import { useAccounting, FiscalYear } from '../../context/AccountingContext';
import { 
  Calendar, 
  Plus, 
  Lock, 
  Unlock, 
  ChevronRight, 
  AlertCircle,
  CheckCircle2,
  Clock,
  ArrowRightLeft
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function FiscalYears() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const { fiscalYears, accounts, addFiscalYear, closeFiscalYear, loading } = useAccounting();
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isCloseModalOpen, setIsCloseModalOpen] = useState(false);
  const [selectedFY, setSelectedFY] = useState<FiscalYear | null>(null);
  const [retainedEarningsAccountId, setRetainedEarningsAccountId] = useState('');
  
  const [newFY, setNewFY] = useState({
    name: '',
    startDate: '',
    endDate: ''
  });

  const handleAddFY = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addFiscalYear(newFY);
      setIsAddModalOpen(false);
      setNewFY({ name: '', startDate: '', endDate: '' });
    } catch (err) {
      console.error(err);
      alert('Failed to add fiscal year');
    }
  };

  const handleCloseFY = async () => {
    if (!selectedFY || !retainedEarningsAccountId) return;
    try {
      await closeFiscalYear(selectedFY.id, retainedEarningsAccountId);
      setIsCloseModalOpen(false);
      setSelectedFY(null);
      setRetainedEarningsAccountId('');
    } catch (err) {
      console.error(err);
      alert('Failed to close fiscal year');
    }
  };

  const equityAccounts = accounts.filter(a => a.type === 'Equity');

  return (
    <AccountingLayout>
      <div className="space-y-6 max-w-5xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className={`text-3xl font-black uppercase tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Fiscal Years
            </h1>
            <p className={`text-sm mt-1 ${isDark ? 'text-[#B0B0C3]' : 'text-slate-500'}`}>
              Manage financial periods and year-end closing
            </p>
          </div>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm uppercase tracking-widest transition-all ${
              isDark 
                ? 'bg-[#00FFCC] text-black hover:bg-[#00E6B8] shadow-[0_0_15px_rgba(0,255,204,0.3)]' 
                : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg'
            }`}
          >
            <Plus size={18} />
            New Fiscal Year
          </button>
        </div>

        <div className="grid gap-4">
          {fiscalYears.length === 0 && !loading && (
            <div className={`p-12 text-center rounded-2xl border border-dashed ${isDark ? 'border-white/10 text-[#B0B0C3]' : 'border-slate-200 text-slate-500'}`}>
              <Calendar size={48} className="mx-auto mb-4 opacity-20" />
              <p className="font-bold uppercase tracking-widest text-xs">No fiscal years defined</p>
              <p className="text-sm mt-2">Create your first fiscal year to start managing periods.</p>
            </div>
          )}

          {fiscalYears.map((fy) => (
            <motion.div
              key={fy.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-6 rounded-2xl border flex flex-col md:flex-row md:items-center justify-between gap-6 transition-all ${
                isDark 
                  ? 'bg-[#2A2A3D] border-white/5 hover:border-[#00FFCC]/30' 
                  : 'bg-white border-slate-200 hover:border-indigo-300'
              }`}
            >
              <div className="flex items-center gap-6">
                <div className={`p-4 rounded-2xl ${
                  fy.status === 'Open' 
                    ? isDark ? 'bg-emerald-500/10 text-emerald-400' : 'bg-emerald-50 text-emerald-600'
                    : isDark ? 'bg-rose-500/10 text-rose-400' : 'bg-rose-50 text-rose-600'
                }`}>
                  {fy.status === 'Open' ? <Unlock size={24} /> : <Lock size={24} />}
                </div>
                
                <div>
                  <h3 className={`text-lg font-black uppercase tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    {fy.name}
                  </h3>
                  <div className="flex items-center gap-4 mt-1">
                    <div className="flex items-center gap-1.5 text-xs opacity-60">
                      <Calendar size={12} />
                      <span>{fy.startDate} to {fy.endDate}</span>
                    </div>
                    <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${
                      fy.status === 'Open'
                        ? isDark ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-100 text-emerald-700'
                        : isDark ? 'bg-rose-500/20 text-rose-400' : 'bg-rose-100 text-rose-700'
                    }`}>
                      {fy.status}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {fy.status === 'Open' && (
                  <button
                    onClick={() => {
                      setSelectedFY(fy);
                      setIsCloseModalOpen(true);
                    }}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                      isDark 
                        ? 'bg-rose-500/10 text-rose-400 hover:bg-rose-500/20' 
                        : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                    }`}
                  >
                    <Lock size={14} />
                    Close Year
                  </button>
                )}
                {fy.status === 'Closed' && (
                  <div className="flex items-center gap-2 text-xs font-bold opacity-40">
                    <CheckCircle2 size={14} className="text-emerald-500" />
                    Year Closed
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Add Modal */}
        <AnimatePresence>
          {isAddModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className={`w-full max-w-md p-8 rounded-3xl shadow-2xl ${isDark ? 'bg-[#1F1F2E] border border-white/10' : 'bg-white'}`}
              >
                <h2 className={`text-2xl font-black uppercase tracking-tight mb-6 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  New Fiscal Year
                </h2>
                <form onSubmit={handleAddFY} className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-[0.2em] mb-2 opacity-50">Year Name</label>
                    <input
                      type="text"
                      required
                      value={newFY.name}
                      onChange={e => setNewFY({ ...newFY, name: e.target.value })}
                      placeholder="e.g. FY 2024"
                      className={`w-full px-4 py-3 rounded-xl border focus:ring-2 outline-none transition-all ${
                        isDark ? 'bg-[#2A2A3D] border-white/10 text-white focus:ring-[#00FFCC]/30' : 'bg-slate-50 border-slate-200 focus:ring-indigo-500/30'
                      }`}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-[0.2em] mb-2 opacity-50">Start Date</label>
                      <input
                        type="date"
                        required
                        value={newFY.startDate}
                        onChange={e => setNewFY({ ...newFY, startDate: e.target.value })}
                        className={`w-full px-4 py-3 rounded-xl border focus:ring-2 outline-none transition-all ${
                          isDark ? 'bg-[#2A2A3D] border-white/10 text-white focus:ring-[#00FFCC]/30' : 'bg-slate-50 border-slate-200 focus:ring-indigo-500/30'
                        }`}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-[0.2em] mb-2 opacity-50">End Date</label>
                      <input
                        type="date"
                        required
                        value={newFY.endDate}
                        onChange={e => setNewFY({ ...newFY, endDate: e.target.value })}
                        className={`w-full px-4 py-3 rounded-xl border focus:ring-2 outline-none transition-all ${
                          isDark ? 'bg-[#2A2A3D] border-white/10 text-white focus:ring-[#00FFCC]/30' : 'bg-slate-50 border-slate-200 focus:ring-indigo-500/30'
                        }`}
                      />
                    </div>
                  </div>
                  <div className="flex gap-3 mt-8">
                    <button
                      type="button"
                      onClick={() => setIsAddModalOpen(false)}
                      className={`flex-1 px-6 py-3 rounded-xl font-bold text-sm uppercase tracking-widest transition-all ${
                        isDark ? 'bg-white/5 text-white hover:bg-white/10' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className={`flex-1 px-6 py-3 rounded-xl font-bold text-sm uppercase tracking-widest transition-all ${
                        isDark ? 'bg-[#00FFCC] text-black hover:bg-[#00E6B8]' : 'bg-indigo-600 text-white hover:bg-indigo-700'
                      }`}
                    >
                      Create
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Close Modal */}
        <AnimatePresence>
          {isCloseModalOpen && selectedFY && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className={`w-full max-w-md p-8 rounded-3xl shadow-2xl ${isDark ? 'bg-[#1F1F2E] border border-white/10' : 'bg-white'}`}
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 rounded-2xl bg-rose-500/10 text-rose-500">
                    <AlertCircle size={24} />
                  </div>
                  <h2 className={`text-2xl font-black uppercase tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    Close Fiscal Year
                  </h2>
                </div>
                
                <p className="text-sm opacity-70 mb-6">
                  Closing <strong>{selectedFY.name}</strong> will zero out all revenue and expense accounts and transfer the net profit to retained earnings. This action is permanent and will lock all transactions for this period.
                </p>

                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-[0.2em] mb-2 opacity-50">Select Retained Earnings Account</label>
                    <select
                      required
                      value={retainedEarningsAccountId}
                      onChange={e => setRetainedEarningsAccountId(e.target.value)}
                      className={`w-full px-4 py-3 rounded-xl border focus:ring-2 outline-none transition-all ${
                        isDark ? 'bg-[#2A2A3D] border-white/10 text-white focus:ring-[#00FFCC]/30' : 'bg-slate-50 border-slate-200 focus:ring-indigo-500/30'
                      }`}
                    >
                      <option value="">Select an account...</option>
                      {equityAccounts.map(a => (
                        <option key={a.id} value={a.id}>{a.code} - {a.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex gap-3 mt-8">
                    <button
                      type="button"
                      onClick={() => setIsCloseModalOpen(false)}
                      className={`flex-1 px-6 py-3 rounded-xl font-bold text-sm uppercase tracking-widest transition-all ${
                        isDark ? 'bg-white/5 text-white hover:bg-white/10' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleCloseFY}
                      disabled={!retainedEarningsAccountId}
                      className={`flex-1 px-6 py-3 rounded-xl font-bold text-sm uppercase tracking-widest transition-all disabled:opacity-50 ${
                        isDark ? 'bg-rose-500 text-white hover:bg-rose-600' : 'bg-rose-600 text-white hover:bg-rose-700'
                      }`}
                    >
                      Confirm Close
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </AccountingLayout>
  );
}
