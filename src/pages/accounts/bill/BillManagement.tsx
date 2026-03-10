import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { FileText, Plus, Search, Trash2, Edit2, Calendar, User, DollarSign } from 'lucide-react';
import { useCompanyData } from '../../../context/CompanyDataContext';
import { useTheme } from '../../../context/ThemeContext';

export default function BillManagement() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const { accountBills, accountPeople, addEntity, deleteEntity } = useCompanyData();
  const [activeTab, setActiveTab] = useState<'Vendor' | 'Customer'>('Vendor');
  const [showAddModal, setShowAddModal] = useState(false);

  const [formData, setFormData] = useState({
    billNumber: `BILL-${Date.now().toString().slice(-6)}`,
    personId: '',
    date: new Date().toISOString().split('T')[0],
    dueDate: '',
    amount: 0,
    status: 'Pending',
    items: [{ description: '', quantity: 1, price: 0 }]
  });

  const handleAddBill = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addEntity('accountBills', {
        ...formData,
        billType: activeTab,
        createdAt: new Date().toISOString()
      });
      setShowAddModal(false);
      setFormData({
        billNumber: `BILL-${Date.now().toString().slice(-6)}`,
        personId: '',
        date: new Date().toISOString().split('T')[0],
        dueDate: '',
        amount: 0,
        status: 'Pending',
        items: [{ description: '', quantity: 1, price: 0 }]
      });
    } catch (error) {
      console.error('Error adding bill:', error);
    }
  };

  const getPersonName = (id: string) => {
    return accountPeople.find(p => p.id === id)?.name || 'Unknown';
  };

  const filteredBills = accountBills.filter(b => b.billType === activeTab);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className={`p-3 rounded-2xl ${isDark ? 'bg-indigo-500/20 text-indigo-400' : 'bg-indigo-100 text-indigo-600'}`}>
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h1 className={`text-2xl font-black uppercase tracking-tighter ${isDark ? 'text-white' : 'text-slate-800'}`}>{activeTab} Bills</h1>
            <p className="text-slate-500 text-xs font-black uppercase tracking-widest">Manage your {activeTab.toLowerCase()} bills and invoices</p>
          </div>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/20"
        >
          <Plus className="w-4 h-4" />
          Add Bill
        </button>
      </div>

      <div className="flex gap-2 p-1 bg-slate-200/50 dark:bg-white/5 rounded-2xl w-fit">
        <button
          onClick={() => setActiveTab('Vendor')}
          className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
            activeTab === 'Vendor' 
              ? (isDark ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'bg-white text-indigo-600 shadow-sm') 
              : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          Vendor Bills
        </button>
        <button
          onClick={() => setActiveTab('Customer')}
          className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
            activeTab === 'Customer' 
              ? (isDark ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'bg-white text-indigo-600 shadow-sm') 
              : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          Customer Bills
        </button>
      </div>

      <div className={`p-6 rounded-3xl border ${isDark ? 'bg-black/40 border-white/5 backdrop-blur-xl' : 'bg-white border-slate-200 shadow-sm'}`}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className={`border-b ${isDark ? 'border-white/5' : 'border-slate-100'}`}>
                <th className="px-4 py-4 text-left text-[10px] font-black text-slate-500 uppercase tracking-widest">Bill #</th>
                <th className="px-4 py-4 text-left text-[10px] font-black text-slate-500 uppercase tracking-widest">{activeTab}</th>
                <th className="px-4 py-4 text-left text-[10px] font-black text-slate-500 uppercase tracking-widest">Date</th>
                <th className="px-4 py-4 text-left text-[10px] font-black text-slate-500 uppercase tracking-widest">Due Date</th>
                <th className="px-4 py-4 text-left text-[10px] font-black text-slate-500 uppercase tracking-widest">Amount</th>
                <th className="px-4 py-4 text-left text-[10px] font-black text-slate-500 uppercase tracking-widest">Status</th>
                <th className="px-4 py-4 text-right text-[10px] font-black text-slate-500 uppercase tracking-widest">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredBills.map((bill) => (
                <tr key={bill.id} className={`group transition-colors ${isDark ? 'hover:bg-white/5' : 'hover:bg-slate-50'}`}>
                  <td className="px-4 py-4">
                    <span className={`text-xs font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>{bill.billNumber}</span>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <User className="w-3.5 h-3.5 text-slate-500" />
                      <span className="text-xs font-medium text-slate-500">{getPersonName(bill.personId)}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-xs font-medium text-slate-500">{bill.date}</td>
                  <td className="px-4 py-4 text-xs font-medium text-slate-500">{bill.dueDate}</td>
                  <td className="px-4 py-4">
                    <span className={`text-xs font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      ${bill.amount?.toLocaleString()}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <span className={`px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${
                      bill.status === 'Paid' 
                        ? (isDark ? 'bg-emerald-500/10 text-emerald-400' : 'bg-emerald-100 text-emerald-700')
                        : (isDark ? 'bg-yellow-500/10 text-yellow-400' : 'bg-yellow-100 text-yellow-700')
                    }`}>
                      {bill.status}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className={`p-2 rounded-lg transition-all ${isDark ? 'hover:bg-white/10 text-slate-400 hover:text-white' : 'hover:bg-slate-200 text-slate-600'}`}>
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button 
                        onClick={() => deleteEntity('accountBills', bill.id)}
                        className={`p-2 rounded-lg transition-all ${isDark ? 'hover:bg-red-500/10 text-red-400' : 'hover:bg-red-50 text-red-600'}`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Bill Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`w-full max-w-2xl p-8 rounded-3xl border ${isDark ? 'bg-slate-900 border-white/10' : 'bg-white border-slate-200 shadow-2xl'}`}
            >
              <h2 className={`text-xl font-black uppercase tracking-tighter mb-6 ${isDark ? 'text-white' : 'text-slate-800'}`}>Add {activeTab} Bill</h2>
              <form onSubmit={handleAddBill} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Bill Number</label>
                    <input
                      readOnly
                      type="text"
                      value={formData.billNumber}
                      className={`w-full px-4 py-3 rounded-xl border outline-none transition-all ${
                        isDark ? 'bg-white/10 border-white/10 text-slate-400' : 'bg-slate-100 border-slate-200 text-slate-500'
                      }`}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Select {activeTab}</label>
                    <select
                      required
                      value={formData.personId}
                      onChange={(e) => setFormData({ ...formData, personId: e.target.value })}
                      className={`w-full px-4 py-3 rounded-xl border outline-none transition-all ${
                        isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-slate-50 border-slate-200'
                      }`}
                    >
                      <option value="">Select {activeTab}</option>
                      {accountPeople.filter(p => p.type === activeTab).map(p => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Bill Date</label>
                    <input
                      required
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      className={`w-full px-4 py-3 rounded-xl border outline-none transition-all ${
                        isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-slate-50 border-slate-200'
                      }`}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Due Date</label>
                    <input
                      required
                      type="date"
                      value={formData.dueDate}
                      onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                      className={`w-full px-4 py-3 rounded-xl border outline-none transition-all ${
                        isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-slate-50 border-slate-200'
                      }`}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Total Amount</label>
                    <input
                      required
                      type="number"
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) })}
                      className={`w-full px-4 py-3 rounded-xl border outline-none transition-all ${
                        isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-slate-50 border-slate-200'
                      }`}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Status</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className={`w-full px-4 py-3 rounded-xl border outline-none transition-all ${
                        isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-slate-50 border-slate-200'
                      }`}
                    >
                      <option value="Pending">Pending</option>
                      <option value="Paid">Paid</option>
                      <option value="Partial">Partial</option>
                      <option value="Overdue">Overdue</option>
                    </select>
                  </div>
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className={`flex-1 px-6 py-3 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all ${
                      isDark ? 'bg-white/5 text-white hover:bg-white/10' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/20"
                  >
                    Save Bill
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
