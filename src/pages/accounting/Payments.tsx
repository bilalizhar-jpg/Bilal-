import React, { useState } from 'react';
import AccountingLayout from '../../components/accounting/AccountingLayout';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Search, X, AlertCircle, Trash2, CreditCard } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { usePayment } from '../../context/PaymentContext';
import { useCustomer } from '../../context/CustomerContext';
import { useAccounting } from '../../context/AccountingContext';

export default function Payments() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const { payments, loading, addPayment, deletePayment } = usePayment();
  const { customers } = useCustomer();
  const { accounts, addJournalEntry } = useAccounting();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    customerId: '',
    amount: '',
    paymentMethod: 'Bank Transfer',
    date: new Date().toISOString().split('T')[0],
    reference: '',
    bankAccountId: '',
    arAccountId: ''
  });

  const filteredPayments = payments.filter(payment => {
    const customer = customers.find(c => c.id === payment.customerId);
    return customer?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
           payment.reference?.toLowerCase().includes(searchTerm.toLowerCase()) ||
           payment.paymentMethod.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const handleOpenModal = () => {
    // Auto-select accounts if possible
    const bankAccount = accounts.find(a => a.type === 'Asset' && (a.name.toLowerCase().includes('bank') || a.name.toLowerCase().includes('cash')))?.id || '';
    const arAccount = accounts.find(a => a.type === 'Asset' && a.name.toLowerCase().includes('receivable'))?.id || '';

    setFormData({
      customerId: '',
      amount: '',
      paymentMethod: 'Bank Transfer',
      date: new Date().toISOString().split('T')[0],
      reference: '',
      bankAccountId: bankAccount,
      arAccountId: arAccount
    });
    setErrorMsg(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const amount = Number(formData.amount);
    if (amount <= 0) {
      setErrorMsg('Payment amount must be greater than 0.');
      return;
    }

    if (!formData.bankAccountId || !formData.arAccountId) {
      setErrorMsg('Please select both Cash/Bank and Accounts Receivable accounts.');
      return;
    }

    try {
      const customerName = customers.find(c => c.id === formData.customerId)?.name || 'Customer';

      // 1. Create Payment
      const paymentId = await addPayment({
        customerId: formData.customerId,
        amount,
        paymentMethod: formData.paymentMethod,
        date: formData.date,
        reference: formData.reference
      });

      // 2. Create Journal Entry
      const journalEntryId = await addJournalEntry(
        {
          date: formData.date,
          reference: `PAY-${paymentId.substring(0, 6).toUpperCase()}`,
          description: `Payment received from ${customerName} via ${formData.paymentMethod}`,
          totalDebit: amount,
          totalCredit: amount
        },
        [
          { accountId: formData.bankAccountId, description: `Cash/Bank - ${customerName}`, debit: amount, credit: 0 },
          { accountId: formData.arAccountId, description: `Accounts Receivable - ${customerName}`, debit: 0, credit: amount }
        ]
      );

      // 3. Link Journal Entry to Payment (optional, but good practice)
      // We would need to update the payment with the journalEntryId if we want to keep track
      // Assuming updatePayment is available in context, or we can just let it be.
      
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error saving payment:', error);
      setErrorMsg('Failed to save payment. Please try again.');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this payment? Note: This will not reverse the journal entry automatically.')) {
      try {
        await deletePayment(id);
      } catch (error) {
        console.error('Error deleting payment:', error);
        alert('Failed to delete payment');
      }
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
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
              Payments Received
            </h1>
            <p className={`text-sm ${isDark ? 'text-[#B0B0C3]' : 'text-slate-500'}`}>
              Record and manage customer payments
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
              Record Payment
            </button>
          </div>
        </div>

        <div className={`p-6 rounded-2xl border ${isDark ? 'bg-[#2A2A3D] border-white/5' : 'bg-white border-slate-200'}`}>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1 max-w-md">
              <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${isDark ? 'text-[#B0B0C3]' : 'text-slate-400'}`} />
              <input
                type="text"
                placeholder="Search payments by customer, ref, or method..."
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
                  <th className={`py-3 px-4 text-xs font-black uppercase tracking-widest ${isDark ? 'text-[#B0B0C3]' : 'text-slate-500'}`}>Customer</th>
                  <th className={`py-3 px-4 text-xs font-black uppercase tracking-widest ${isDark ? 'text-[#B0B0C3]' : 'text-slate-500'}`}>Method</th>
                  <th className={`py-3 px-4 text-xs font-black uppercase tracking-widest ${isDark ? 'text-[#B0B0C3]' : 'text-slate-500'}`}>Reference</th>
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
                ) : filteredPayments.length === 0 ? (
                  <tr>
                    <td colSpan={6} className={`py-8 text-center text-sm ${isDark ? 'text-[#B0B0C3]' : 'text-slate-500'}`}>
                      No payments found.
                    </td>
                  </tr>
                ) : (
                  filteredPayments.map((payment) => {
                    const customer = customers.find(c => c.id === payment.customerId);
                    return (
                      <tr key={payment.id} className={`border-b transition-colors ${isDark ? 'border-white/5 hover:bg-white/5' : 'border-slate-100 hover:bg-slate-50'}`}>
                        <td className={`py-3 px-4 text-sm ${isDark ? 'text-[#B0B0C3]' : 'text-slate-600'}`}>{formatDate(payment.date)}</td>
                        <td className={`py-3 px-4 text-sm font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>
                          {customer?.name || 'Unknown Customer'}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${isDark ? 'bg-white/10 text-[#B0B0C3]' : 'bg-slate-100 text-slate-700'}`}>
                            {payment.paymentMethod}
                          </span>
                        </td>
                        <td className={`py-3 px-4 text-sm ${isDark ? 'text-[#B0B0C3]' : 'text-slate-600'}`}>
                          {payment.reference || '-'}
                        </td>
                        <td className={`py-3 px-4 text-sm font-mono text-right font-bold ${isDark ? 'text-[#00FFCC]' : 'text-indigo-600'}`}>
                          {formatCurrency(payment.amount)}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button 
                            onClick={() => handleDelete(payment.id)}
                            className={`p-1.5 rounded-lg transition-colors ${isDark ? 'hover:bg-red-500/20 text-red-400 hover:text-red-300' : 'hover:bg-red-100 text-red-600 hover:text-red-700'}`}
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

      {/* Record Payment Modal */}
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
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <h2 className={`text-xl font-black uppercase tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    Record Payment
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

                <form id="payment-form" onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                      <label className={`block text-xs font-bold uppercase tracking-widest mb-2 ${isDark ? 'text-[#B0B0C3]' : 'text-slate-500'}`}>
                        Customer *
                      </label>
                      <select
                        required
                        value={formData.customerId}
                        onChange={(e) => setFormData({...formData, customerId: e.target.value})}
                        className={`w-full px-4 py-2.5 rounded-xl text-sm transition-all outline-none border ${
                          isDark 
                            ? 'bg-[#2A2A3D] border-white/10 text-white focus:border-[#00FFCC]' 
                            : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-indigo-500'
                        }`}
                      >
                        <option value="">Select Customer</option>
                        {customers.map(c => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
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
                        Payment Date *
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
                        Payment Method *
                      </label>
                      <select
                        required
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

                    <div>
                      <label className={`block text-xs font-bold uppercase tracking-widest mb-2 ${isDark ? 'text-[#B0B0C3]' : 'text-slate-500'}`}>
                        Reference / Check No.
                      </label>
                      <input
                        type="text"
                        value={formData.reference}
                        onChange={(e) => setFormData({...formData, reference: e.target.value})}
                        placeholder="e.g. CHK-12345"
                        className={`w-full px-4 py-2.5 rounded-xl text-sm transition-all outline-none border ${
                          isDark 
                            ? 'bg-[#2A2A3D] border-white/10 text-white focus:border-[#00FFCC]' 
                            : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-indigo-500'
                        }`}
                      />
                    </div>
                  </div>

                  <div className={`p-4 rounded-xl border mt-6 ${isDark ? 'bg-white/5 border-white/10' : 'bg-slate-50 border-slate-200'}`}>
                    <h3 className={`text-xs font-bold uppercase tracking-widest mb-4 ${isDark ? 'text-[#B0B0C3]' : 'text-slate-500'}`}>
                      Accounting Configuration
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className={`block text-xs font-bold uppercase tracking-widest mb-2 ${isDark ? 'text-[#B0B0C3]' : 'text-slate-500'}`}>
                          Cash/Bank Account (Debit) *
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
                      <div>
                        <label className={`block text-xs font-bold uppercase tracking-widest mb-2 ${isDark ? 'text-[#B0B0C3]' : 'text-slate-500'}`}>
                          Accounts Receivable (Credit) *
                        </label>
                        <select
                          required
                          value={formData.arAccountId}
                          onChange={(e) => setFormData({...formData, arAccountId: e.target.value})}
                          className={`w-full px-4 py-2.5 rounded-xl text-sm transition-all outline-none border ${
                            isDark 
                              ? 'bg-[#2A2A3D] border-white/10 text-white focus:border-[#00FFCC]' 
                              : 'bg-white border-slate-200 text-slate-900 focus:border-indigo-500'
                          }`}
                        >
                          <option value="">Select AR Account</option>
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
                  form="payment-form"
                  className={`px-6 py-2 rounded-lg font-bold text-sm uppercase tracking-widest transition-colors ${
                    isDark 
                      ? 'bg-[#00FFCC] text-[#1E1E2F] hover:bg-[#00D1FF] shadow-[0_0_8px_rgba(0,255,204,0.4)]' 
                      : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md'
                  }`}
                >
                  Record Payment
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </AccountingLayout>
  );
}
