import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Hash, Save, RefreshCw, AlertCircle } from 'lucide-react';
import { useSettings, NumberSequence } from '../../../context/SettingsContext';
import { useTheme } from '../../../context/ThemeContext';
import AccountingLayout from '../../../components/accounting/AccountingLayout';

export default function NumberSequences() {
  const { numberSequences, updateNumberSequence, loading } = useSettings();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [localSequences, setLocalSequences] = useState<NumberSequence[]>([]);

  useEffect(() => {
    if (numberSequences) {
      setLocalSequences(numberSequences);
    }
  }, [numberSequences]);

  const handleUpdate = async (id: string, updates: Partial<NumberSequence>) => {
    await updateNumberSequence(id, updates);
    alert('Sequence updated successfully!');
  };

  const handleLocalChange = (id: string, field: keyof NumberSequence, value: any) => {
    setLocalSequences(prev => prev.map(seq => 
      seq.id === id ? { ...seq, [field]: value } : seq
    ));
  };

  if (loading) return null;

  return (
    <AccountingLayout>
      <div className="max-w-5xl mx-auto space-y-8">
        <div>
          <h1 className={`text-3xl font-black uppercase tracking-tighter ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Number Sequences
          </h1>
          <p className={`text-sm ${isDark ? 'text-[#B0B0C3]' : 'text-slate-500'}`}>
            Configure automatic numbering formats for invoices, bills, and other documents.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {localSequences.map((seq) => (
            <motion.div
              key={seq.id}
              layout
              className={`p-6 rounded-2xl border ${isDark ? 'bg-[#2A2A3D] border-white/5' : 'bg-white border-slate-200'} shadow-sm space-y-6`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${isDark ? 'bg-[#00FFCC]/10 text-[#00FFCC]' : 'bg-indigo-50 text-indigo-600'}`}>
                    <Hash className="w-5 h-5" />
                  </div>
                  <h2 className={`text-lg font-black uppercase tracking-wider ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    {seq.module}
                  </h2>
                </div>
                <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                  isDark ? 'bg-white/5 text-[#B0B0C3]' : 'bg-slate-100 text-slate-500'
                }`}>
                  Preview: {seq.prefix}{seq.nextNumber.toString().padStart(seq.padding, '0')}{seq.suffix}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-[10px] font-black uppercase tracking-widest mb-2 ${isDark ? 'text-[#B0B0C3]' : 'text-slate-500'}`}>
                    Prefix
                  </label>
                  <input
                    type="text"
                    value={seq.prefix}
                    onChange={(e) => handleLocalChange(seq.id, 'prefix', e.target.value)}
                    className={`w-full px-4 py-2.5 rounded-xl border outline-none transition-all ${
                      isDark ? 'bg-[#1E1E2F] border-white/10 text-white focus:border-[#00FFCC]' : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-indigo-500'
                    }`}
                  />
                </div>
                <div>
                  <label className={`block text-[10px] font-black uppercase tracking-widest mb-2 ${isDark ? 'text-[#B0B0C3]' : 'text-slate-500'}`}>
                    Suffix
                  </label>
                  <input
                    type="text"
                    value={seq.suffix}
                    onChange={(e) => handleLocalChange(seq.id, 'suffix', e.target.value)}
                    className={`w-full px-4 py-2.5 rounded-xl border outline-none transition-all ${
                      isDark ? 'bg-[#1E1E2F] border-white/10 text-white focus:border-[#00FFCC]' : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-indigo-500'
                    }`}
                  />
                </div>
                <div>
                  <label className={`block text-[10px] font-black uppercase tracking-widest mb-2 ${isDark ? 'text-[#B0B0C3]' : 'text-slate-500'}`}>
                    Next Number
                  </label>
                  <input
                    type="number"
                    value={seq.nextNumber}
                    onChange={(e) => handleLocalChange(seq.id, 'nextNumber', parseInt(e.target.value))}
                    className={`w-full px-4 py-2.5 rounded-xl border outline-none transition-all ${
                      isDark ? 'bg-[#1E1E2F] border-white/10 text-white focus:border-[#00FFCC]' : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-indigo-500'
                    }`}
                  />
                </div>
                <div>
                  <label className={`block text-[10px] font-black uppercase tracking-widest mb-2 ${isDark ? 'text-[#B0B0C3]' : 'text-slate-500'}`}>
                    Padding (Digits)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={seq.padding}
                    onChange={(e) => handleLocalChange(seq.id, 'padding', parseInt(e.target.value))}
                    className={`w-full px-4 py-2.5 rounded-xl border outline-none transition-all ${
                      isDark ? 'bg-[#1E1E2F] border-white/10 text-white focus:border-[#00FFCC]' : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-indigo-500'
                    }`}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <button
                  onClick={() => handleUpdate(seq.id, seq)}
                  className="flex items-center gap-2 px-4 py-2 bg-[#00FFCC] text-[#1E1E2F] rounded-xl font-black uppercase text-[10px] tracking-widest shadow-lg shadow-[#00FFCC]/20"
                >
                  <Save className="w-4 h-4" />
                  Save Changes
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        <div className={`p-6 rounded-2xl border ${isDark ? 'bg-[#2A2A3D] border-white/5' : 'bg-white border-slate-200'} shadow-sm`}>
          <div className="flex items-start gap-4">
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-500">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className={`font-bold mb-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>Important Note</h3>
              <p className={`text-sm ${isDark ? 'text-[#B0B0C3]' : 'text-slate-500'}`}>
                Changing the next number to a lower value may cause duplicate document numbers if the numbers have already been used. 
                Use this feature with caution when resetting sequences for a new fiscal year.
              </p>
            </div>
          </div>
        </div>
      </div>
    </AccountingLayout>
  );
}
