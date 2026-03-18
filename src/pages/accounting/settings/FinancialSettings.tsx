import React, { useState, useEffect} from 'react';
import { motion} from 'motion/react';
import { Save, Globe, Landmark, DollarSign} from 'lucide-react';
import { useSettings} from '../../../context/SettingsContext';
import { useAccounting} from '../../../context/AccountingContext';
import AccountingLayout from '../../../components/accounting/AccountingLayout';

export default function FinancialSettings() {
 const { financialSettings, updateFinancialSettings, loading} = useSettings();
 const { accounts} = useAccounting();
 
 const [formData, setFormData] = useState({
 currency: { code: 'USD', symbol: '$', name: 'US Dollar'},
 defaultAccounts: {
 retainedEarningsId: '',
 accountsReceivableId: '',
 accountsPayableId: '',
 salesTaxPayableId: '',
 bankAccountId: ''
}
});

 const [successMsg, setSuccessMsg] = useState<string | null>(null);
 const [errorMsg, setErrorMsg] = useState<string | null>(null);

 useEffect(() => {
 if (financialSettings) {
 setFormData({
 currency: financialSettings.currency,
 defaultAccounts: {
 retainedEarningsId: financialSettings.defaultAccounts.retainedEarningsId || '',
 accountsReceivableId: financialSettings.defaultAccounts.accountsReceivableId || '',
 accountsPayableId: financialSettings.defaultAccounts.accountsPayableId || '',
 salesTaxPayableId: financialSettings.defaultAccounts.salesTaxPayableId || '',
 bankAccountId: financialSettings.defaultAccounts.bankAccountId || ''
}
});
}
}, [financialSettings]);

 const handleSubmit = async (e: React.FormEvent) => {
 e.preventDefault();
 setSuccessMsg(null);
 setErrorMsg(null);
 try {
 await updateFinancialSettings(formData);
 setSuccessMsg('Settings updated successfully!');
 setTimeout(() => setSuccessMsg(null), 3000);
} catch (error) {
 setErrorMsg('Failed to update settings. Please try again.');
}
};

 if (loading) return null;

 return (
 <AccountingLayout>
 <div className="max-w-4xl mx-auto space-y-8">
 <div>
 <h1 className={`text-3xl font-black uppercase tracking-tighter text-slate-900`}>
 Financial Settings
 </h1>
 <p className={`text-sm text-slate-500`}>
 Configure your base currency and default accounting mappings.
 </p>
 </div>

 {successMsg && (
 <div className={`p-4 rounded-xl flex items-center gap-3 bg-emerald-50 border border-emerald-200 text-emerald-700`}>
 <p className="text-sm font-bold">{successMsg}</p>
 </div>
 )}
 {errorMsg && (
 <div className={`p-4 rounded-xl flex items-center gap-3 bg-red-50 border border-red-200 text-red-700`}>
 <p className="text-sm font-bold">{errorMsg}</p>
 </div>
 )}

 <form onSubmit={handleSubmit} className="space-y-6">
 {/* Currency Settings */}
 <div className={`p-6 rounded-2xl border bg-white border-slate-200 shadow-sm`}>
 <div className="flex items-center gap-3 mb-6">
 <div className={`p-2 rounded-lg bg-indigo-50 text-indigo-600`}>
 <Globe className="w-5 h-5"/>
 </div>
 <h2 className={`text-lg font-black uppercase tracking-wider text-slate-900`}>
 Currency Configuration
 </h2>
 </div>

 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
 <div>
 <label className={`block text-[10px] font-black uppercase tracking-widest mb-2 text-slate-500`}>
 Currency Code
 </label>
 <input
 type="text"
 value={formData.currency.code}
 onChange={(e) => setFormData({ ...formData, currency: { ...formData.currency, code: e.target.value.toUpperCase()}})}
 className={`w-full px-4 py-3 rounded-xl border outline-none transition-all ${
 'bg-slate-50 border-slate-200 text-slate-900 focus:border-indigo-500'
}`}
 placeholder="e.g. USD"
 />
 </div>
 <div>
 <label className={`block text-[10px] font-black uppercase tracking-widest mb-2 text-slate-500`}>
 Symbol
 </label>
 <input
 type="text"
 value={formData.currency.symbol}
 onChange={(e) => setFormData({ ...formData, currency: { ...formData.currency, symbol: e.target.value}})}
 className={`w-full px-4 py-3 rounded-xl border outline-none transition-all ${
 'bg-slate-50 border-slate-200 text-slate-900 focus:border-indigo-500'
}`}
 placeholder="e.g. $"
 />
 </div>
 <div>
 <label className={`block text-[10px] font-black uppercase tracking-widest mb-2 text-slate-500`}>
 Currency Name
 </label>
 <input
 type="text"
 value={formData.currency.name}
 onChange={(e) => setFormData({ ...formData, currency: { ...formData.currency, name: e.target.value}})}
 className={`w-full px-4 py-3 rounded-xl border outline-none transition-all ${
 'bg-slate-50 border-slate-200 text-slate-900 focus:border-indigo-500'
}`}
 placeholder="e.g. US Dollar"
 />
 </div>
 </div>
 </div>

 {/* Default Accounts */}
 <div className={`p-6 rounded-2xl border bg-white border-slate-200 shadow-sm`}>
 <div className="flex items-center gap-3 mb-6">
 <div className={`p-2 rounded-lg bg-indigo-50 text-indigo-600`}>
 <Landmark className="w-5 h-5"/>
 </div>
 <h2 className={`text-lg font-black uppercase tracking-wider text-slate-900`}>
 Default Account Mappings
 </h2>
 </div>

 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
 <div>
 <label className={`block text-[10px] font-black uppercase tracking-widest mb-2 text-slate-500`}>
 Retained Earnings Account
 </label>
 <select
 value={formData.defaultAccounts.retainedEarningsId}
 onChange={(e) => setFormData({ ...formData, defaultAccounts: { ...formData.defaultAccounts, retainedEarningsId: e.target.value}})}
 className={`w-full px-4 py-3 rounded-xl border outline-none transition-all ${
 'bg-slate-50 border-slate-200 text-slate-900 focus:border-indigo-500'
}`}
 >
 <option value="">Select Account</option>
 {accounts.filter(a => a.type === 'Equity').map(a => (
 <option key={a.id} value={a.id}>{a.code} - {a.name}</option>
 ))}
 </select>
 </div>
 <div>
 <label className={`block text-[10px] font-black uppercase tracking-widest mb-2 text-slate-500`}>
 Accounts Receivable
 </label>
 <select
 value={formData.defaultAccounts.accountsReceivableId}
 onChange={(e) => setFormData({ ...formData, defaultAccounts: { ...formData.defaultAccounts, accountsReceivableId: e.target.value}})}
 className={`w-full px-4 py-3 rounded-xl border outline-none transition-all ${
 'bg-slate-50 border-slate-200 text-slate-900 focus:border-indigo-500'
}`}
 >
 <option value="">Select Account</option>
 {accounts.filter(a => a.type === 'Asset').map(a => (
 <option key={a.id} value={a.id}>{a.code} - {a.name}</option>
 ))}
 </select>
 </div>
 <div>
 <label className={`block text-[10px] font-black uppercase tracking-widest mb-2 text-slate-500`}>
 Accounts Payable
 </label>
 <select
 value={formData.defaultAccounts.accountsPayableId}
 onChange={(e) => setFormData({ ...formData, defaultAccounts: { ...formData.defaultAccounts, accountsPayableId: e.target.value}})}
 className={`w-full px-4 py-3 rounded-xl border outline-none transition-all ${
 'bg-slate-50 border-slate-200 text-slate-900 focus:border-indigo-500'
}`}
 >
 <option value="">Select Account</option>
 {accounts.filter(a => a.type === 'Liability').map(a => (
 <option key={a.id} value={a.id}>{a.code} - {a.name}</option>
 ))}
 </select>
 </div>
 <div>
 <label className={`block text-[10px] font-black uppercase tracking-widest mb-2 text-slate-500`}>
 Sales Tax Payable
 </label>
 <select
 value={formData.defaultAccounts.salesTaxPayableId}
 onChange={(e) => setFormData({ ...formData, defaultAccounts: { ...formData.defaultAccounts, salesTaxPayableId: e.target.value}})}
 className={`w-full px-4 py-3 rounded-xl border outline-none transition-all ${
 'bg-slate-50 border-slate-200 text-slate-900 focus:border-indigo-500'
}`}
 >
 <option value="">Select Account</option>
 {accounts.filter(a => a.type === 'Liability').map(a => (
 <option key={a.id} value={a.id}>{a.code} - {a.name}</option>
 ))}
 </select>
 </div>
 </div>
 </div>

 <div className="flex justify-end">
 <motion.button
 whileHover={{ scale: 1.02}}
 whileTap={{ scale: 0.98}}
 type="submit"
 className="flex items-center gap-2 px-8 py-4 bg-[#00FFCC] text-[#1E1E2F] rounded-2xl font-black uppercase tracking-widest shadow-lg shadow-[#00FFCC]/20 hover:bg-[#00D1FF] transition-all"
 >
 <Save className="w-5 h-5"/>
 Save Configuration
 </motion.button>
 </div>
 </form>
 </div>
 </AccountingLayout>
 );
}
