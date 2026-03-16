import React, { useState } from 'react';
import AccountingLayout from '../../components/accounting/AccountingLayout';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Search, X, AlertCircle, Trash2, Receipt, Filter } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useExpense } from '../../context/ExpenseContext';
import { useVendor } from '../../context/VendorContext';
import { useAccounting } from '../../context/AccountingContext';
import { useSettings } from '../../context/SettingsContext';

export default function Expenses() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const { formatCurrency } = useSettings();
  const { expenses, loading, addExpense, deleteExpense } = useExpense();
  const { vendors } = useVendor();
  const { accounts, addJournalEntry } = useAccounting();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    vendorId: '',
    accountId: '', // Expense account
    bankAccountId: '', // Payment account
    amount: '',
    date: new Date().toISOString().split('T')[0],
    reference: '',
    description: '',
    category: 'General',
    department: '',
    paymentMethod: 'Bank Transfer'
  });

  const filteredExpenses = expenses.filter(expense => {
    const vendor = vendors.find(v => v.id === expense.vendorId);
    return vendor?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
           expense.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
           expense.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
           expense.reference?.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const handleOpenModal = () => {
    // Auto-select accounts if possible
    const bankAccount = accounts.find(a => a.type === 'Asset' && (a.name.toLowerCase().includes('bank') || a.name.toLowerCase().includes('cash')))?.id || '';
    
    setFormData({
      vendorId: '',
      accountId: '',
      bankAccountId: bankAccount,
      amount: '',
      date: new Date().toISOString().split('T')[0],
      reference: '',
      description: '',
      category: 'General',
      department: '',
      paymentMethod: 'Bank Transfer'
    });
    setErrorMsg(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const amount = Number(formData.amount);
    if (amount <= 0) {
      setErrorMsg('Expense amount must be greater than 0.');
      return;
    }

    if (!formData.accountId || !formData.bankAccountId) {
      setErrorMsg('Please select both an Expense account and a Payment account.');
      return;
    }

    try {
      const vendorName = vendors.find(v => v.id === formData.vendorId)?.name || 'Vendor';
      const expenseAccount = accounts.find(a => a.id === formData.accountId);
      const bankAccount = accounts.find(a => a.id === formData.bankAccountId);

      // 1. Create Expense
      const expenseId = await addExpense({
        vendorId: formData.vendorId,
        accountId: formData.accountId,
        amount,
        date: formData.date,
        reference: formData.reference,
        description: formData.description,
        category: formData.category,
        department: formData.department,
        paymentMethod: formData.paymentMethod
      });

      // 2. Create Journal Entry
      // Debit Expense, Credit Cash/Bank
      await addJournalEntry(
        {
          date: formData.date,
          reference: `EXP-${expenseId.substring(0, 6).toUpperCase()}`,
          description: `Expense: ${formData.description} (${vendorName})`,
          totalDebit: amount,
          totalCredit: amount
        },
        [
          { accountId: formData.accountId, description: `Expense - ${formData.description}`, debit: amount, credit: 0 },
          { accountId: formData.bankAccountId, description: `Payment - ${formData.paymentMethod}`, debit: 0, credit: amount }
        ]
      );

      setIsModalOpen(false);
    } catch (error) {
      console.error('Error saving expense:', error);
      setErrorMsg('Failed to save expense. Please try again.');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this expense? Note: This will not reverse the journal entry automatically.')) {
      try {
        await deleteExpense(id);
      } catch (error) {
        console.error('Error deleting expense:', error);
        alert('Failed to delete expense');
      }
    }
  };

  return (
    <AccountingLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className={`text-2xl font-black uppercase tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Expenses
            </h1>
            <p className={`text-sm ${isDark ? 'text-[#B0B0C3]' : 'text-slate-500'}`}>
              Record and track your business spending
            </p>
          </div>
          <button 
            onClick={handleOpenModal}
            className={`flex items-center gap-2 px-4 py-2 rounded-md font-bold text-sm uppercase tracking-widest transition-colors ${
              isDark 
                ? 'bg-[#00FFCC] text-[#1E1E2F] hover:bg-[#00D1FF] shadow-[0_0_8px_rgba(0,255,204,0.4)]' 
                : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md'
            }`}
          >
            <Plus className="w-4 h-4" />
            Record Expense
          </button>
        </div>

        <div className={`p-6 rounded-2xl border ${isDark ? 'bg-[#2A2A3D] border-white/5' : 'bg-white border-slate-200'}`}>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1 max-w-md">
              <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${isDark ? 'text-[#B0B0C3]' : 'text-slate-400'}`} />
              <input
                type="text"
                placeholder="Search expenses..."
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
                  <th className={`py-3 px-4 text-xs font-black uppercase tracking-widest ${isDark ? 'text-[#B0B0C3]' : 'text-slate-500'}`}>Vendor</th>
                  <th className={`py-3 px-4 text-xs font-black uppercase tracking-widest ${isDark ? 'text-[#B0B0C3]' : 'text-slate-500'}`}>Category</th>
                  <th className={`py-3 px-4 text-xs font-black uppercase tracking-widest ${isDark ? 'text-[#B0B0C3]' : 'text-slate-500'}`}>Description</th>
                  <th className={`py-3 px-4 text-xs font-black uppercase tracking-widest text-right ${isDark ? 'text-[#B0B0C3]' : 'text-slate-500'}`}>Amount</th>
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
                ) : filteredExpenses.length === 0 ? (
                  <tr>
                    <td colSpan={6} className={`py-8 text-center text-sm ${isDark ? 'text-[#B0B0C3]' : 'text-slate-500'}`}>
                      No expenses found.
                    </td>
                  </tr>
                ) : (
                  filteredExpenses.map((expense) => {
                    const vendor = vendors.find(v => v.id === expense.vendorId);
                    return (
                      <tr key={expense.id} className={`border-b transition-colors ${isDark ? 'border-white/5 hover:bg-white/5' : 'border-slate-100 hover:bg-slate-50'}`}>
                        <td className={`py-3 px-4 text-sm ${isDark ? 'text-[#B0B0C3]' : 'text-slate-600'}`}>{expense.date}</td>
                        <td className={`py-3 px-4 text-sm font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>
                          {vendor?.name || 'General Expense'}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${isDark ? 'bg-white/10 text-[#B0B0C3]' : 'bg-slate-100 text-slate-700'}`}>
                            {expense.category}
                          </span>
                        </td>
                        <td className={`py-3 px-4 text-sm ${isDark ? 'text-[#B0B0C3]' : 'text-slate-600'}`}>
                          {expense.description}
                        </td>
                        <td className={`py-3 px-4 text-sm font-mono text-right font-bold ${isDark ? 'text-red-400' : 'text-red-600'}`}>
                          {formatCurrency(expense.amount)}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button 
                            onClick={() => handleDelete(expense.id)}
                            className={`p-1.5 rounded-lg transition-colors ${isDark ? 'hover:bg-red-500/20 text-red-400' : 'hover:bg-red-100 text-red-600'}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Record Expense Modal */}
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
              className={`relative w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl shadow-2xl overflow-hidden ${isDark ? 'bg-[#1E1E2F] border border-white/10' : 'bg-white'}`}
            >
              <div className={`p-6 border-b flex items-center justify-between shrink-0 ${isDark ? 'border-white/10' : 'border-slate-200'}`}>
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${isDark ? 'bg-[#00FFCC]/20 text-[#00FFCC]' : 'bg-indigo-100 text-indigo-600'}`}>
                    <Receipt className="w-5 h-5" />
                  </div>
                  <h2 className={`text-xl font-black uppercase tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    Record Expense
                  </h2>
                </div>
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

                <form id="expense-form" onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                      <label className={`block text-xs font-bold uppercase tracking-widest mb-2 ${isDark ? 'text-[#B0B0C3]' : 'text-slate-500'}`}>
                        Vendor / Supplier
                      </label>
                      <select
                        value={formData.vendorId}
                        onChange={(e) => setFormData({...formData, vendorId: e.target.value})}
                        className={`w-full px-4 py-2.5 rounded-xl text-sm transition-all outline-none border ${
                          isDark 
                            ? 'bg-[#2A2A3D] border-white/10 text-white focus:border-[#00FFCC]' 
                            : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-indigo-500'
                        }`}
                      >
                        <option value="">Select Vendor (Optional)</option>
                        {vendors.map(v => (
                          <option key={v.id} value={v.id}>{v.name}</option>
                        ))}
                      </select>
                    </div>

                    <div className="md:col-span-2">
                      <label className={`block text-xs font-bold uppercase tracking-widest mb-2 ${isDark ? 'text-[#B0B0C3]' : 'text-slate-500'}`}>
                        Description *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.description}
                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                        placeholder="e.g. Office Supplies"
                        className={`w-full px-4 py-2.5 rounded-xl text-sm transition-all outline-none border ${
                          isDark 
                            ? 'bg-[#2A2A3D] border-white/10 text-white focus:border-[#00FFCC]' 
                            : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-indigo-500'
                        }`}
                      />
                    </div>

                    <div>
                      <label className={`block text-xs font-bold uppercase tracking-widest mb-2 ${isDark ? 'text-[#B0B0C3]' : 'text-slate-500'}`}>
                        Amount *
                      </label>
                      <input
                        type="number"
                        required
                        min="0.01"
                        step="0.01"
                        value={formData.amount}
                        onChange={(e) => setFormData({...formData, amount: e.target.value})}
                        placeholder="0.00"
                        className={`w-full px-4 py-2.5 rounded-xl text-sm transition-all outline-none border font-mono ${
                          isDark 
                            ? 'bg-[#2A2A3D] border-white/10 text-white focus:border-[#00FFCC]' 
                            : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-indigo-500'
                        }`}
                      />
                    </div>

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
                        Category
                      </label>
                      <select
                        value={formData.category}
                        onChange={(e) => setFormData({...formData, category: e.target.value})}
                        className={`w-full px-4 py-2.5 rounded-xl text-sm transition-all outline-none border ${
                          isDark 
                            ? 'bg-[#2A2A3D] border-white/10 text-white focus:border-[#00FFCC]' 
                            : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-indigo-500'
                        }`}
                      >
                        <option value="General">General</option>
                        <option value="Office Supplies">Office Supplies</option>
                        <option value="Travel">Travel</option>
                        <option value="Utilities">Utilities</option>
                        <option value="Rent">Rent</option>
                        <option value="Marketing">Marketing</option>
                        <option value="Software">Software</option>
                      </select>
                    </div>

                    <div>
                      <label className={`block text-xs font-bold uppercase tracking-widest mb-2 ${isDark ? 'text-[#B0B0C3]' : 'text-slate-500'}`}>
                        Payment Method
                      </label>
                      <select
                        value={formData.paymentMethod}
                        onChange={(e) => setFormData({...formData, paymentMethod: e.target.value})}
                        className={`w-full px-4 py-2.5 rounded-xl text-sm transition-all outline-none border ${
                          isDark 
                            ? 'bg-[#2A2A3D] border-white/10 text-white focus:border-[#00FFCC]' 
                            : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-indigo-500'
                        }`}
                      >
                        <option value="Bank Transfer">Bank Transfer</option>
                        <option value="Credit Card">Credit Card</option>
                        <option value="Cash">Cash</option>
                        <option value="Check">Check</option>
                      </select>
                    </div>
                  </div>

                  <div className={`p-4 rounded-xl border mt-6 ${isDark ? 'bg-white/5 border-white/10' : 'bg-slate-50 border-slate-200'}`}>
                    <h3 className={`text-xs font-bold uppercase tracking-widest mb-4 ${isDark ? 'text-[#B0B0C3]' : 'text-slate-500'}`}>
                      Accounting Configuration
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className={`block text-xs font-bold uppercase tracking-widest mb-2 ${isDark ? 'text-[#B0B0C3]' : 'text-slate-500'}`}>
                          Expense Account (Debit) *
                        </label>
                        <select
                          required
                          value={formData.accountId}
                          onChange={(e) => setFormData({...formData, accountId: e.target.value})}
                          className={`w-full px-4 py-2.5 rounded-xl text-sm transition-all outline-none border ${
                            isDark 
                              ? 'bg-[#2A2A3D] border-white/10 text-white focus:border-[#00FFCC]' 
                              : 'bg-white border-slate-200 text-slate-900 focus:border-indigo-500'
                          }`}
                        >
                          <option value="">Select Expense Account</option>
                          {accounts.filter(a => a.type === 'Expense').map(a => (
                            <option key={a.id} value={a.id}>{a.code} - {a.name}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className={`block text-xs font-bold uppercase tracking-widest mb-2 ${isDark ? 'text-[#B0B0C3]' : 'text-slate-500'}`}>
                          Payment Account (Credit) *
                        </label>
                        <select
                          required
                          value={formData.bankAccountId}
                          onChange={(e) => setFormData({...formData, bankAccountId: e.target.value})}
                          className={`w-full px-4 py-2.5 rounded-xl text-sm transition-all outline-none border ${
                            isDark 
                              ? 'bg-[#2A2A3D] border-white/10 text-white focus:border-[#00FFCC]' 
                              : 'bg-white border-slate-200 text-slate-900 focus:border-indigo-500'
                          }`}
                        >
                          <option value="">Select Bank/Cash Account</option>
                          {accounts.filter(a => a.type === 'Asset').map(a => (
                            <option key={a.id} value={a.id}>{a.code} - {a.name}</option>
                          ))}
                        </select>
                      </div>
                    </div>
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
                  form="expense-form"
                  className={`px-6 py-2 rounded-lg font-bold text-sm uppercase tracking-widest transition-colors ${
                    isDark 
                      ? 'bg-[#00FFCC] text-[#1E1E2F] hover:bg-[#00D1FF] shadow-[0_0_8px_rgba(0,255,204,0.4)]' 
                      : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md'
                  }`}
                >
                  Record Expense
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </AccountingLayout>
  );
}
