import React, { useState } from 'react';
import { motion } from 'motion/react';
import { FileText, Save, ArrowLeft, Plus, Trash2 } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useCompanyData } from '../../../context/CompanyDataContext';
import { useTheme } from '../../../context/ThemeContext';

export default function CreateVoucher() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const navigate = useNavigate();
  const { type } = useParams<{ type: string }>(); // 'debit', 'credit', 'journal'
  const { addEntity, ledgers } = useCompanyData();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    voucherType: type?.charAt(0).toUpperCase() + type?.slice(1) || 'Debit',
    voucherNumber: `VCH-${Date.now().toString().slice(-6)}`,
    date: new Date().toISOString().split('T')[0],
    description: '',
    items: [{ ledgerId: '', debit: 0, credit: 0, note: '' }]
  });

  const addItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { ledgerId: '', debit: 0, credit: 0, note: '' }]
    });
  };

  const removeItem = (index: number) => {
    setFormData({
      ...formData,
      items: formData.items.filter((_, i) => i !== index)
    });
  };

  const updateItem = (index: number, field: string, value: any) => {
    const newItems = [...formData.items];
    newItems[index] = { ...newItems[index], [field]: value };
    setFormData({ ...formData, items: newItems });
  };

  const totalDebit = formData.items.reduce((sum, item) => sum + (item.debit || 0), 0);
  const totalCredit = formData.items.reduce((sum, item) => sum + (item.credit || 0), 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (totalDebit !== totalCredit) {
      alert('Total Debit must equal Total Credit');
      return;
    }

    setLoading(true);
    try {
      await addEntity('vouchers', {
        ...formData,
        amount: totalDebit,
        createdAt: new Date().toISOString()
      });
      navigate(`/accounts/voucher/${type}/list`);
    } catch (error) {
      console.error('Error creating voucher:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className={`p-3 rounded-2xl ${isDark ? 'bg-indigo-500/20 text-indigo-400' : 'bg-indigo-100 text-indigo-600'}`}>
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h1 className={`text-2xl font-black uppercase tracking-tighter ${isDark ? 'text-white' : 'text-slate-800'}`}>
              Create {formData.voucherType} Voucher
            </h1>
            <p className="text-slate-500 text-xs font-black uppercase tracking-widest">Record a new financial voucher</p>
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

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`p-8 rounded-3xl border ${isDark ? 'bg-black/40 border-white/5 backdrop-blur-xl' : 'bg-white border-slate-200 shadow-sm'}`}
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className={`text-[10px] font-black uppercase tracking-widest ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Voucher Number</label>
              <input
                readOnly
                type="text"
                value={formData.voucherNumber}
                className={`w-full px-4 py-3 rounded-xl border outline-none transition-all ${
                  isDark ? 'bg-white/10 border-white/10 text-slate-400' : 'bg-slate-100 border-slate-200 text-slate-500'
                }`}
              />
            </div>
            <div className="space-y-2">
              <label className={`text-[10px] font-black uppercase tracking-widest ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Date</label>
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
            <div className="space-y-2">
              <label className={`text-[10px] font-black uppercase tracking-widest ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Description</label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className={`w-full px-4 py-3 rounded-xl border outline-none transition-all ${
                  isDark ? 'bg-white/5 border-white/10 text-white focus:border-indigo-500' : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-indigo-500'
                }`}
                placeholder="Enter voucher description"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className={`text-xs font-black uppercase tracking-widest ${isDark ? 'text-white' : 'text-slate-800'}`}>Voucher Items</h3>
              <button
                type="button"
                onClick={addItem}
                className="flex items-center gap-2 px-3 py-1.5 bg-indigo-600/10 text-indigo-500 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all"
              >
                <Plus className="w-3 h-3" />
                Add Row
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className={`border-b ${isDark ? 'border-white/5' : 'border-slate-100'}`}>
                    <th className="px-2 py-3 text-left text-[10px] font-black text-slate-500 uppercase tracking-widest">Ledger Account</th>
                    <th className="px-2 py-3 text-left text-[10px] font-black text-slate-500 uppercase tracking-widest">Note</th>
                    <th className="px-2 py-3 text-left text-[10px] font-black text-slate-500 uppercase tracking-widest w-32">Debit</th>
                    <th className="px-2 py-3 text-left text-[10px] font-black text-slate-500 uppercase tracking-widest w-32">Credit</th>
                    <th className="px-2 py-3 text-right text-[10px] font-black text-slate-500 uppercase tracking-widest w-16"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {formData.items.map((item, index) => (
                    <tr key={index}>
                      <td className="px-2 py-3">
                        <select
                          required
                          value={item.ledgerId}
                          onChange={(e) => updateItem(index, 'ledgerId', e.target.value)}
                          className={`w-full px-3 py-2 rounded-lg border outline-none transition-all text-xs ${
                            isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                          }`}
                        >
                          <option value="">Select Ledger</option>
                          {ledgers.map(l => (
                            <option key={l.id} value={l.id}>{l.name}</option>
                          ))}
                        </select>
                      </td>
                      <td className="px-2 py-3">
                        <input
                          type="text"
                          value={item.note}
                          onChange={(e) => updateItem(index, 'note', e.target.value)}
                          className={`w-full px-3 py-2 rounded-lg border outline-none transition-all text-xs ${
                            isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                          }`}
                          placeholder="Note"
                        />
                      </td>
                      <td className="px-2 py-3">
                        <input
                          type="number"
                          value={item.debit}
                          onChange={(e) => updateItem(index, 'debit', parseFloat(e.target.value))}
                          className={`w-full px-3 py-2 rounded-lg border outline-none transition-all text-xs ${
                            isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                          }`}
                        />
                      </td>
                      <td className="px-2 py-3">
                        <input
                          type="number"
                          value={item.credit}
                          onChange={(e) => updateItem(index, 'credit', parseFloat(e.target.value))}
                          className={`w-full px-3 py-2 rounded-lg border outline-none transition-all text-xs ${
                            isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                          }`}
                        />
                      </td>
                      <td className="px-2 py-3 text-right">
                        {formData.items.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeItem(index)}
                            className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                  <tr className={`border-t ${isDark ? 'border-white/10' : 'border-slate-200'}`}>
                    <td colSpan={2} className="px-2 py-4 text-right text-[10px] font-black uppercase tracking-widest text-slate-500">Total</td>
                    <td className={`px-2 py-4 text-xs font-black ${totalDebit === totalCredit ? 'text-emerald-400' : 'text-red-400'}`}>
                      ${totalDebit.toLocaleString()}
                    </td>
                    <td className={`px-2 py-4 text-xs font-black ${totalDebit === totalCredit ? 'text-emerald-400' : 'text-red-400'}`}>
                      ${totalCredit.toLocaleString()}
                    </td>
                    <td></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex justify-end pt-6">
            <button
              disabled={loading}
              type="submit"
              className={`flex items-center gap-2 px-8 py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/20 disabled:opacity-50`}
            >
              <Save className="w-4 h-4" />
              {loading ? 'Saving...' : 'Save Voucher'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
