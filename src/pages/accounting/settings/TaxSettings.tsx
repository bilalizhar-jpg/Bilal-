import React, { useState} from 'react';
import { motion, AnimatePresence} from 'motion/react';
import { Plus, Trash2, Edit2, Percent, Check, X, ShieldCheck} from 'lucide-react';
import { useSettings, TaxSetting} from '../../../context/SettingsContext';
import { useAccounting} from '../../../context/AccountingContext';
import AccountingLayout from '../../../components/accounting/AccountingLayout';

export default function TaxSettings() {
 const { taxSettings, addTaxSetting, updateTaxSetting, deleteTaxSetting, loading} = useSettings();
 const { accounts} = useAccounting();
 
 const [isAdding, setIsAdding] = useState(false);
 const [editingId, setEditingId] = useState<string | null>(null);
 const [formData, setFormData] = useState<Omit<TaxSetting, 'id' | 'companyId' | 'createdAt' | 'updatedAt'>>({
 name: '',
 rate: 0,
 type: 'Both',
 accountId: '',
 isActive: true
});

 const handleSubmit = async (e: React.FormEvent) => {
 e.preventDefault();
 if (editingId) {
 await updateTaxSetting(editingId, formData);
 setEditingId(null);
} else {
 await addTaxSetting(formData);
 setIsAdding(false);
}
 setFormData({ name: '', rate: 0, type: 'Both', accountId: '', isActive: true});
};

 const handleEdit = (tax: TaxSetting) => {
 setFormData({
 name: tax.name,
 rate: tax.rate,
 type: tax.type,
 accountId: tax.accountId || '',
 isActive: tax.isActive
});
 setEditingId(tax.id);
 setIsAdding(true);
};

 if (loading) return null;

 return (
 <AccountingLayout>
 <div className="max-w-5xl mx-auto space-y-8">
 <div className="flex justify-between items-end">
 <div>
 <h1 className={`text-3xl font-black uppercase tracking-tighter text-slate-900`}>
 Tax Configuration
 </h1>
 <p className={`text-sm text-slate-500`}>
 Manage sales and purchase tax rates for your transactions.
 </p>
 </div>
 <motion.button
 whileHover={{ scale: 1.05}}
 whileTap={{ scale: 0.95}}
 onClick={() => setIsAdding(true)}
 className="flex items-center gap-2 px-6 py-3 bg-[#00FFCC] text-[#1E1E2F] rounded-xl font-black uppercase tracking-widest text-xs shadow-lg shadow-[#00FFCC]/20"
 >
 <Plus className="w-4 h-4"/>
 Add Tax Rate
 </motion.button>
 </div>

 <AnimatePresence>
 {isAdding && (
 <motion.div
 initial={{ opacity: 0, y: -20}}
 animate={{ opacity: 1, y: 0}}
 exit={{ opacity: 0, y: -20}}
 className={`p-6 rounded-2xl border bg-white border-slate-200 shadow-xl`}
 >
 <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
 <div className="md:col-span-2">
 <label className={`block text-[10px] font-black uppercase tracking-widest mb-2 text-slate-500`}>
 Tax Name
 </label>
 <input
 type="text"
 required
 value={formData.name}
 onChange={(e) => setFormData({ ...formData, name: e.target.value})}
 className={`w-full px-4 py-2.5 rounded-xl border outline-none transition-all ${
 'bg-slate-50 border-slate-200 text-slate-900 focus:border-indigo-500'
}`}
 placeholder="e.g. Standard VAT"
 />
 </div>
 <div>
 <label className={`block text-[10px] font-black uppercase tracking-widest mb-2 text-slate-500`}>
 Rate (%)
 </label>
 <input
 type="number"
 step="0.01"
 required
 value={formData.rate}
 onChange={(e) => setFormData({ ...formData, rate: parseFloat(e.target.value)})}
 className={`w-full px-4 py-2.5 rounded-xl border outline-none transition-all ${
 'bg-slate-50 border-slate-200 text-slate-900 focus:border-indigo-500'
}`}
 />
 </div>
 <div>
 <label className={`block text-[10px] font-black uppercase tracking-widest mb-2 text-slate-500`}>
 Type
 </label>
 <select
 value={formData.type}
 onChange={(e) => setFormData({ ...formData, type: e.target.value as any})}
 className={`w-full px-4 py-2.5 rounded-xl border outline-none transition-all ${
 'bg-slate-50 border-slate-200 text-slate-900 focus:border-indigo-500'
}`}
 >
 <option value="Sales">Sales</option>
 <option value="Purchase">Purchase</option>
 <option value="Both">Both</option>
 </select>
 </div>
 <div className="flex gap-2">
 <button
 type="submit"
 className="flex-1 py-2.5 bg-[#00FFCC] text-[#1E1E2F] rounded-xl font-black uppercase text-[10px] tracking-widest shadow-lg shadow-[#00FFCC]/20"
 >
 {editingId ? 'Update' : 'Save'}
 </button>
 <button
 type="button"
 onClick={() => { setIsAdding(false); setEditingId(null);}}
 className={`p-2.5 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50`}
 >
 <X className="w-5 h-5"/>
 </button>
 </div>
 <div className="md:col-span-2">
 <label className={`block text-[10px] font-black uppercase tracking-widest mb-2 text-slate-500`}>
 Linked Ledger Account
 </label>
 <select
 value={formData.accountId}
 onChange={(e) => setFormData({ ...formData, accountId: e.target.value})}
 className={`w-full px-4 py-2.5 rounded-xl border outline-none transition-all ${
 'bg-slate-50 border-slate-200 text-slate-900 focus:border-indigo-500'
}`}
 >
 <option value="">Select Account</option>
 {accounts.filter(a => a.type === 'Liability').map(a => (
 <option key={a.id} value={a.id}>{a.code} - {a.name}</option>
 ))}
 </select>
 </div>
 </form>
 </motion.div>
 )}
 </AnimatePresence>

 <div className={`rounded-2xl border overflow-hidden bg-white border-slate-200 shadow-sm`}>
 <table className="w-full text-left border-collapse">
 <thead>
 <tr className={`border-b border-slate-100 bg-slate-50/50`}>
 <th className={`px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500`}>Tax Name</th>
 <th className={`px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500`}>Rate</th>
 <th className={`px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500`}>Type</th>
 <th className={`px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500`}>Status</th>
 <th className={`px-6 py-4 text-[10px] font-black uppercase tracking-widest text-right text-slate-500`}>Actions</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-white/5">
 {taxSettings.map((tax) => (
 <tr key={tax.id} className={`group transition-colors hover:bg-slate-50`}>
 <td className="px-6 py-4">
 <div className="flex items-center gap-3">
 <div className={`p-2 rounded-lg bg-indigo-50 text-indigo-600`}>
 <Percent className="w-4 h-4"/>
 </div>
 <span className={`font-bold text-slate-900`}>{tax.name}</span>
 </div>
 </td>
 <td className={`px-6 py-4 font-mono font-bold text-slate-900`}>
 {tax.rate}%
 </td>
 <td className="px-6 py-4">
 <span className={`px-2 py-1 rounded text-[10px] font-black uppercase tracking-wider ${
 'bg-slate-100 text-slate-600'
}`}>
 {tax.type}
 </span>
 </td>
 <td className="px-6 py-4">
 <div className="flex items-center gap-2">
 <div className={`w-2 h-2 rounded-full ${tax.isActive ? 'bg-[#00FFCC]' : 'bg-red-500'}`} />
 <span className={`text-xs font-medium text-slate-500`}>
 {tax.isActive ? 'Active' : 'Inactive'}
 </span>
 </div>
 </td>
 <td className="px-6 py-4 text-right">
 <div className="flex justify-end gap-2">
 <button
 onClick={() => handleEdit(tax)}
 className={`p-2 rounded-lg transition-all hover:bg-slate-100 text-slate-500 hover:text-indigo-600`}
 >
 <Edit2 className="w-4 h-4"/>
 </button>
 <button
 onClick={() => deleteTaxSetting(tax.id)}
 className={`p-2 rounded-lg transition-all hover:bg-slate-100 text-slate-500 hover:text-red-600`}
 >
 <Trash2 className="w-4 h-4"/>
 </button>
 </div>
 </td>
 </tr>
 ))}
 {taxSettings.length === 0 && (
 <tr>
 <td colSpan={5} className="px-6 py-12 text-center">
 <div className="flex flex-col items-center gap-2">
 <ShieldCheck className={`w-12 h-12 opacity-20 text-slate-900`} />
 <p className={`text-sm text-slate-500`}>No tax rates configured yet.</p>
 </div>
 </td>
 </tr>
 )}
 </tbody>
 </table>
 </div>
 </div>
 </AccountingLayout>
 );
}
