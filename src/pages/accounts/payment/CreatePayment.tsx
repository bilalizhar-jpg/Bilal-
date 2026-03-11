import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useNavigate, useParams } from 'react-router-dom';
import { useCompanyData } from '../../../context/CompanyDataContext';
import { useTheme } from '../../../context/ThemeContext';
import AdminLayout from '../../../components/AdminLayout';

export default function CreatePayment() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const navigate = useNavigate();
  const { type } = useParams<{ type: string }>(); // 'voucher' or 'invoice'
  const { addEntity, bankAccounts } = useCompanyData();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    type: type === 'voucher' ? 'Voucher' : 'Invoice',
    group: '',
    status: 'Unpaid',
    voucherNumber: `875`, // Example default from image
    accountId: '',
    paymentType: 'Cash',
    amount: '',
    date: '',
    reference: '',
    paymentNote: '',
    paymentReceipt: null as File | null
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await addEntity('accountPayments', {
        ...formData,
        amount: parseFloat(formData.amount) || 0,
        createdAt: new Date().toISOString()
      });
      navigate(`/accounts/payment/list/${type}`);
    } catch (error) {
      console.error('Error creating payment:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData({ ...formData, paymentReceipt: e.target.files[0] });
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>
            {formData.type}
          </h1>
        </div>

        <div className={`p-6 rounded-md border ${isDark ? 'bg-black/40 border-white/5' : 'bg-white border-slate-200'}`}>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Row 1 */}
              <div className="space-y-2">
                <label className={`text-sm font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Group</label>
                <select
                  value={formData.group}
                  onChange={(e) => setFormData({ ...formData, group: e.target.value })}
                  className={`w-full px-4 py-2.5 rounded-md border outline-none transition-all ${
                    isDark ? 'bg-white/5 border-white/10 text-white focus:border-[#6f42c1]' : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-[#6f42c1]'
                  }`}
                >
                  <option value="">Select Group</option>
                  <option value="Supplier">Supplier</option>
                  <option value="Customer">Customer</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className={`text-sm font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className={`w-full px-4 py-2.5 rounded-md border outline-none transition-all ${
                    isDark ? 'bg-white/5 border-white/10 text-white focus:border-[#6f42c1]' : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-[#6f42c1]'
                  }`}
                >
                  <option value="Unpaid">Unpaid</option>
                  <option value="Paid">Paid</option>
                  <option value="Partial">Partial</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className={`text-sm font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Voucher Number</label>
                <input
                  type="text"
                  value={formData.voucherNumber}
                  onChange={(e) => setFormData({ ...formData, voucherNumber: e.target.value })}
                  className={`w-full px-4 py-2.5 rounded-md border outline-none transition-all ${
                    isDark ? 'bg-white/5 border-white/10 text-white focus:border-[#6f42c1]' : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-[#6f42c1]'
                  }`}
                  placeholder="875"
                />
              </div>

              {/* Row 2 */}
              <div className="space-y-2">
                <label className={`text-sm font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Account</label>
                <select
                  value={formData.accountId}
                  onChange={(e) => setFormData({ ...formData, accountId: e.target.value })}
                  className={`w-full px-4 py-2.5 rounded-md border outline-none transition-all ${
                    isDark ? 'bg-white/5 border-white/10 text-white focus:border-[#6f42c1]' : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-[#6f42c1]'
                  }`}
                >
                  <option value="">Select Account</option>
                  {bankAccounts.map(bank => (
                    <option key={bank.id} value={bank.id}>{bank.bankName}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className={`text-sm font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Payment Type</label>
                <select
                  value={formData.paymentType}
                  onChange={(e) => setFormData({ ...formData, paymentType: e.target.value })}
                  className={`w-full px-4 py-2.5 rounded-md border outline-none transition-all ${
                    isDark ? 'bg-white/5 border-white/10 text-white focus:border-[#6f42c1]' : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-[#6f42c1]'
                  }`}
                >
                  <option value="Cash">Cash</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="Cheque">Cheque</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className={`text-sm font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Amount</label>
                <input
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className={`w-full px-4 py-2.5 rounded-md border outline-none transition-all ${
                    isDark ? 'bg-white/5 border-white/10 text-white focus:border-[#6f42c1]' : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-[#6f42c1]'
                  }`}
                  placeholder="4,470"
                />
              </div>

              {/* Row 3 */}
              <div className="space-y-2">
                <label className={`text-sm font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Date</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className={`w-full px-4 py-2.5 rounded-md border outline-none transition-all ${
                    isDark ? 'bg-white/5 border-white/10 text-white focus:border-[#6f42c1]' : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-[#6f42c1]'
                  }`}
                />
              </div>
              <div className="space-y-2">
                <label className={`text-sm font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Reference</label>
                <input
                  type="text"
                  value={formData.reference}
                  onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
                  className={`w-full px-4 py-2.5 rounded-md border outline-none transition-all ${
                    isDark ? 'bg-white/5 border-white/10 text-white focus:border-[#6f42c1]' : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-[#6f42c1]'
                  }`}
                  placeholder="52958956956"
                />
              </div>
              <div className="space-y-2">
                <label className={`text-sm font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Payment Receipt</label>
                <div className="flex">
                  <label className={`flex items-center justify-center px-4 py-2.5 border border-r-0 rounded-l-md cursor-pointer transition-all ${
                    isDark ? 'bg-white/10 border-white/10 text-slate-300 hover:bg-white/20' : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
                  }`}>
                    <span className="text-sm">Choose file</span>
                    <input type="file" className="hidden" onChange={handleFileChange} />
                  </label>
                  <div className={`flex-1 px-4 py-2.5 border rounded-r-md flex items-center ${
                    isDark ? 'bg-white/5 border-white/10 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-500'
                  }`}>
                    <span className="text-sm truncate">
                      {formData.paymentReceipt ? formData.paymentReceipt.name : 'No file chosen'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Row 4 */}
            <div className="space-y-2">
              <label className={`text-sm font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Payment Note</label>
              <textarea
                value={formData.paymentNote}
                onChange={(e) => setFormData({ ...formData, paymentNote: e.target.value })}
                rows={4}
                className={`w-full px-4 py-3 rounded-md border outline-none transition-all resize-y ${
                  isDark ? 'bg-white/5 border-white/10 text-white focus:border-[#6f42c1]' : 'bg-white border-slate-200 text-slate-900 focus:border-[#6f42c1]'
                }`}
                placeholder="Write a note.."
              />
            </div>

            <div className="flex justify-start pt-2">
              <button
                disabled={loading}
                type="submit"
                className={`px-6 py-2.5 bg-[#6f42c1] text-white rounded-md font-medium hover:bg-[#5a32a3] transition-all disabled:opacity-50`}
              >
                {loading ? 'Processing...' : 'Create Now'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </AdminLayout>
  );
}
