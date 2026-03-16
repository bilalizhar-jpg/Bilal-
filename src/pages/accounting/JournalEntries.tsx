import React, { useState } from 'react';
import AccountingLayout from '../../components/accounting/AccountingLayout';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Search, X, AlertCircle, Trash2 } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useAccounting } from '../../context/AccountingContext';
import { useSettings } from '../../context/SettingsContext';

export default function JournalEntries() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const { formatCurrency } = useSettings();
  const { accounts, journalEntries, journalLines, loading, addJournalEntry, isPeriodClosed } = useAccounting();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    reference: '',
    description: ''
  });

  const isClosed = isPeriodClosed(formData.date);

  const [lines, setLines] = useState([
    { accountId: '', description: '', debit: 0, credit: 0 },
    { accountId: '', description: '', debit: 0, credit: 0 }
  ]);

  const filteredEntries = journalEntries.filter(entry => 
    entry.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
    entry.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddLine = () => {
    setLines([...lines, { accountId: '', description: '', debit: 0, credit: 0 }]);
  };

  const handleRemoveLine = (index: number) => {
    if (lines.length <= 2) return; // Minimum 2 lines
    const newLines = [...lines];
    newLines.splice(index, 1);
    setLines(newLines);
  };

  const handleLineChange = (index: number, field: string, value: any) => {
    const newLines = [...lines];
    newLines[index] = { ...newLines[index], [field]: value };
    
    // If setting debit, clear credit and vice versa to prevent both having values
    if (field === 'debit' && value > 0) {
      newLines[index].credit = 0;
    } else if (field === 'credit' && value > 0) {
      newLines[index].debit = 0;
    }
    
    setLines(newLines);
  };

  const totalDebit = lines.reduce((sum, line) => sum + (Number(line.debit) || 0), 0);
  const totalCredit = lines.reduce((sum, line) => sum + (Number(line.credit) || 0), 0);
  const isBalanced = totalDebit === totalCredit && totalDebit > 0;

  const handleOpenModal = () => {
    setFormData({
      date: new Date().toISOString().split('T')[0],
      reference: '',
      description: ''
    });
    setLines([
      { accountId: '', description: '', debit: 0, credit: 0 },
      { accountId: '', description: '', debit: 0, credit: 0 }
    ]);
    setErrorMsg(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    // Validations
    if (!isBalanced) {
      setErrorMsg('Total debits must equal total credits and be greater than 0.');
      return;
    }

    const validLines = lines.filter(l => l.accountId && (l.debit > 0 || l.credit > 0));
    if (validLines.length < 2) {
      setErrorMsg('A journal entry must have at least two valid lines.');
      return;
    }

    try {
      await addJournalEntry(
        {
          date: formData.date,
          reference: formData.reference,
          description: formData.description,
          totalDebit,
          totalCredit
        },
        validLines.map(l => ({
          accountId: l.accountId,
          description: l.description || formData.description,
          debit: Number(l.debit) || 0,
          credit: Number(l.credit) || 0
        }))
      );
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error saving journal entry:', error);
      setErrorMsg('Failed to save journal entry. Please try again.');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <AccountingLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className={`text-2xl font-black uppercase tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Journal Entries
            </h1>
            <p className={`text-sm ${isDark ? 'text-[#B0B0C3]' : 'text-slate-500'}`}>
              Record and view manual journal entries
            </p>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={handleOpenModal}
              className={`flex items-center gap-2 px-4 py-2 rounded-md font-bold text-sm uppercase tracking-widest transition-colors ${
                isDark 
                  ? 'bg-[#00FFCC] text-[#1E1E2F] hover:bg-[#00D1FF] shadow-[0_0_8px_rgba(0,255,204,0.4)]' 
                  : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md'
              }`}
            >
              <Plus className="w-4 h-4" />
              New Entry
            </button>
          </div>
        </div>

        <div className={`p-6 rounded-2xl border ${isDark ? 'bg-[#2A2A3D] border-white/5' : 'bg-white border-slate-200'}`}>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1 max-w-md">
              <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${isDark ? 'text-[#B0B0C3]' : 'text-slate-400'}`} />
              <input
                type="text"
                placeholder="Search entries by reference or description..."
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
                  <th className={`py-3 px-4 text-xs font-black uppercase tracking-widest ${isDark ? 'text-[#B0B0C3]' : 'text-slate-500'}`}>Date</th>
                  <th className={`py-3 px-4 text-xs font-black uppercase tracking-widest ${isDark ? 'text-[#B0B0C3]' : 'text-slate-500'}`}>Reference</th>
                  <th className={`py-3 px-4 text-xs font-black uppercase tracking-widest ${isDark ? 'text-[#B0B0C3]' : 'text-slate-500'}`}>Description</th>
                  <th className={`py-3 px-4 text-xs font-black uppercase tracking-widest text-right ${isDark ? 'text-[#B0B0C3]' : 'text-slate-500'}`}>Amount</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={4} className="py-8 text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
                    </td>
                  </tr>
                ) : filteredEntries.length === 0 ? (
                  <tr>
                    <td colSpan={4} className={`py-8 text-center text-sm ${isDark ? 'text-[#B0B0C3]' : 'text-slate-500'}`}>
                      No journal entries found.
                    </td>
                  </tr>
                ) : (
                  filteredEntries.map((entry) => (
                    <React.Fragment key={entry.id}>
                      <tr className={`border-b transition-colors ${isDark ? 'border-white/5 hover:bg-white/5' : 'border-slate-100 hover:bg-slate-50'}`}>
                        <td className={`py-3 px-4 text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>{formatDate(entry.date)}</td>
                        <td className={`py-3 px-4 text-sm font-mono ${isDark ? 'text-white' : 'text-slate-900'}`}>{entry.reference || '-'}</td>
                        <td className={`py-3 px-4 text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>{entry.description}</td>
                        <td className={`py-3 px-4 text-sm font-mono text-right font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                          {formatCurrency(entry.totalDebit)}
                        </td>
                      </tr>
                      {/* Optional: Expandable rows to show lines could go here */}
                    </React.Fragment>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add Entry Modal */}
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
              className={`relative w-full max-w-4xl max-h-[90vh] flex flex-col rounded-2xl shadow-2xl overflow-hidden ${isDark ? 'bg-[#1E1E2F] border border-white/10' : 'bg-white'}`}
            >
              <div className={`p-6 border-b flex items-center justify-between shrink-0 ${isDark ? 'border-white/10' : 'border-slate-200'}`}>
                <h2 className={`text-xl font-black uppercase tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  New Journal Entry
                </h2>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-white/10 text-[#B0B0C3]' : 'hover:bg-slate-100 text-slate-500'}`}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 overflow-y-auto flex-1">
                {errorMsg && (
                  <div className={`mb-6 p-4 rounded-xl flex items-start gap-3 ${isDark ? 'bg-red-500/10 border border-red-500/20 text-red-400' : 'bg-red-50 border border-red-200 text-red-700'}`}>
                    <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                    <p className="text-sm">{errorMsg}</p>
                  </div>
                )}

                <form id="journal-form" onSubmit={handleSubmit} className="space-y-6">
                  {isClosed && (
                    <div className={`p-4 rounded-xl flex items-center gap-3 ${isDark ? 'bg-amber-500/10 border border-amber-500/20 text-amber-400' : 'bg-amber-50 border border-amber-200 text-amber-700'}`}>
                      <AlertCircle className="w-5 h-5 shrink-0" />
                      <p className="text-sm font-bold uppercase tracking-tight">This date falls within a closed fiscal period. Transactions are locked.</p>
                    </div>
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className={`block text-xs font-bold uppercase tracking-widest mb-2 ${isDark ? 'text-[#B0B0C3]' : 'text-slate-500'}`}>
                        Date *
                      </label>
                      <input
                        type="date"
                        required
                        value={formData.date}
                        onChange={(e) => setFormData({...formData, date: e.target.value})}
                        className={`w-full px-4 py-2.5 rounded-xl text-sm transition-all outline-none border ${
                          isDark 
                            ? 'bg-[#2A2A3D] border-white/10 text-white focus:border-[#00FFCC]' 
                            : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-indigo-500'
                        }`}
                      />
                    </div>
                    <div>
                      <label className={`block text-xs font-bold uppercase tracking-widest mb-2 ${isDark ? 'text-[#B0B0C3]' : 'text-slate-500'}`}>
                        Reference
                      </label>
                      <input
                        type="text"
                        value={formData.reference}
                        onChange={(e) => setFormData({...formData, reference: e.target.value})}
                        placeholder="e.g. JE-2023-001"
                        className={`w-full px-4 py-2.5 rounded-xl text-sm transition-all outline-none border ${
                          isDark 
                            ? 'bg-[#2A2A3D] border-white/10 text-white focus:border-[#00FFCC]' 
                            : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-indigo-500'
                        }`}
                      />
                    </div>
                    <div>
                      <label className={`block text-xs font-bold uppercase tracking-widest mb-2 ${isDark ? 'text-[#B0B0C3]' : 'text-slate-500'}`}>
                        Description *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.description}
                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                        placeholder="Entry description"
                        className={`w-full px-4 py-2.5 rounded-xl text-sm transition-all outline-none border ${
                          isDark 
                            ? 'bg-[#2A2A3D] border-white/10 text-white focus:border-[#00FFCC]' 
                            : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-indigo-500'
                        }`}
                      />
                    </div>
                  </div>

                  <div className="mt-8">
                    <h3 className={`text-sm font-bold uppercase tracking-widest mb-4 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      Transaction Lines
                    </h3>
                    
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse min-w-[600px]">
                        <thead>
                          <tr className={`border-b ${isDark ? 'border-white/10' : 'border-slate-200'}`}>
                            <th className={`py-2 px-2 text-xs font-black uppercase tracking-widest w-1/3 ${isDark ? 'text-[#B0B0C3]' : 'text-slate-500'}`}>Account</th>
                            <th className={`py-2 px-2 text-xs font-black uppercase tracking-widest w-1/3 ${isDark ? 'text-[#B0B0C3]' : 'text-slate-500'}`}>Description</th>
                            <th className={`py-2 px-2 text-xs font-black uppercase tracking-widest text-right w-1/6 ${isDark ? 'text-[#B0B0C3]' : 'text-slate-500'}`}>Debit</th>
                            <th className={`py-2 px-2 text-xs font-black uppercase tracking-widest text-right w-1/6 ${isDark ? 'text-[#B0B0C3]' : 'text-slate-500'}`}>Credit</th>
                            <th className="w-10"></th>
                          </tr>
                        </thead>
                        <tbody>
                          {lines.map((line, index) => (
                            <tr key={index} className={`border-b ${isDark ? 'border-white/5' : 'border-slate-100'}`}>
                              <td className="py-2 px-2">
                                <select
                                  required
                                  value={line.accountId}
                                  onChange={(e) => handleLineChange(index, 'accountId', e.target.value)}
                                  className={`w-full px-3 py-2 rounded-lg text-sm transition-all outline-none border ${
                                    isDark 
                                      ? 'bg-[#2A2A3D] border-white/10 text-white focus:border-[#00FFCC]' 
                                      : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-indigo-500'
                                  }`}
                                >
                                  <option value="">Select Account</option>
                                  {accounts.map(acc => (
                                    <option key={acc.id} value={acc.id}>
                                      {acc.code} - {acc.name}
                                    </option>
                                  ))}
                                </select>
                              </td>
                              <td className="py-2 px-2">
                                <input
                                  type="text"
                                  value={line.description}
                                  onChange={(e) => handleLineChange(index, 'description', e.target.value)}
                                  placeholder="Line description"
                                  className={`w-full px-3 py-2 rounded-lg text-sm transition-all outline-none border ${
                                    isDark 
                                      ? 'bg-[#2A2A3D] border-white/10 text-white focus:border-[#00FFCC]' 
                                      : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-indigo-500'
                                  }`}
                                />
                              </td>
                              <td className="py-2 px-2">
                                <input
                                  type="number"
                                  min="0"
                                  step="0.01"
                                  value={line.debit || ''}
                                  onChange={(e) => handleLineChange(index, 'debit', parseFloat(e.target.value) || 0)}
                                  className={`w-full px-3 py-2 rounded-lg text-sm transition-all outline-none border text-right font-mono ${
                                    isDark 
                                      ? 'bg-[#2A2A3D] border-white/10 text-white focus:border-[#00FFCC]' 
                                      : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-indigo-500'
                                  }`}
                                />
                              </td>
                              <td className="py-2 px-2">
                                <input
                                  type="number"
                                  min="0"
                                  step="0.01"
                                  value={line.credit || ''}
                                  onChange={(e) => handleLineChange(index, 'credit', parseFloat(e.target.value) || 0)}
                                  className={`w-full px-3 py-2 rounded-lg text-sm transition-all outline-none border text-right font-mono ${
                                    isDark 
                                      ? 'bg-[#2A2A3D] border-white/10 text-white focus:border-[#00FFCC]' 
                                      : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-indigo-500'
                                  }`}
                                />
                              </td>
                              <td className="py-2 px-2 text-center">
                                <button
                                  type="button"
                                  onClick={() => handleRemoveLine(index)}
                                  disabled={lines.length <= 2}
                                  className={`p-1.5 rounded-lg transition-colors disabled:opacity-30 ${
                                    isDark ? 'hover:bg-red-500/20 text-red-400' : 'hover:bg-red-100 text-red-600'
                                  }`}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot>
                          <tr>
                            <td colSpan={2} className="py-4 px-2">
                              <button
                                type="button"
                                onClick={handleAddLine}
                                className={`flex items-center gap-2 text-sm font-bold uppercase tracking-widest transition-colors ${
                                  isDark ? 'text-[#00FFCC] hover:text-[#00D1FF]' : 'text-indigo-600 hover:text-indigo-700'
                                }`}
                              >
                                <Plus className="w-4 h-4" />
                                Add Line
                              </button>
                            </td>
                            <td className={`py-4 px-2 text-right font-mono font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                              {formatCurrency(totalDebit)}
                            </td>
                            <td className={`py-4 px-2 text-right font-mono font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                              {formatCurrency(totalCredit)}
                            </td>
                            <td></td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                    
                    {!isBalanced && (totalDebit > 0 || totalCredit > 0) && (
                      <div className={`mt-2 text-sm font-medium flex items-center justify-end gap-2 ${isDark ? 'text-amber-400' : 'text-amber-600'}`}>
                        <AlertCircle className="w-4 h-4" />
                        Difference: {formatCurrency(Math.abs(totalDebit - totalCredit))}
                      </div>
                    )}
                  </div>
                </form>
              </div>

              <div className={`p-6 border-t flex justify-end gap-3 shrink-0 ${isDark ? 'border-white/10' : 'border-slate-200'}`}>
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
                  form="journal-form"
                  disabled={!isBalanced || isClosed}
                  className={`px-6 py-2 rounded-lg font-bold text-sm uppercase tracking-widest transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                    isDark 
                      ? 'bg-[#00FFCC] text-[#1E1E2F] hover:bg-[#00D1FF] shadow-[0_0_8px_rgba(0,255,204,0.4)]' 
                      : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md'
                  }`}
                >
                  Save Entry
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </AccountingLayout>
  );
}
