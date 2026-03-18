import React, { useState} from 'react';
import AccountingLayout from '../../components/accounting/AccountingLayout';
import { motion, AnimatePresence} from 'motion/react';
import { Plus, Search, X, AlertCircle, Trash2, FileText, Calendar, User, DollarSign} from 'lucide-react';
import { useBill} from '../../context/BillContext';
import { useVendor} from '../../context/VendorContext';
import { useAccounting} from '../../context/AccountingContext';
import { useSettings} from '../../context/SettingsContext';

export default function Bills() {
  const { formatCurrency} = useSettings();
 const { bills, billItems, loading, addBill, deleteBill} = useBill();
 const { vendors} = useVendor();
 const { accounts, addJournalEntry} = useAccounting();
 
 const [searchTerm, setSearchTerm] = useState('');
 const [isModalOpen, setIsModalOpen] = useState(false);
 const [errorMsg, setErrorMsg] = useState<string | null>(null);
 
 const [formData, setFormData] = useState({
 vendorId: '',
 billNumber: '',
 date: new Date().toISOString().split('T')[0],
 dueDate: new Date().toISOString().split('T')[0],
 expenseAccountId: '', // Default expense account for all items
 apAccountId: '', // Accounts Payable account
});

 const [items, setItems] = useState<any[]>([
 { item: '', quantity: 1, price: 0, tax: 0, total: 0}
 ]);

 const filteredBills = bills.filter(bill => {
 const vendor = vendors.find(v => v.id === bill.vendorId);
 return vendor?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
 bill.billNumber?.toLowerCase().includes(searchTerm.toLowerCase());
});

 const handleOpenModal = () => {
 const apAccount = accounts.find(a => a.type === 'Liability' && a.name.toLowerCase().includes('payable'))?.id || '';
 
 setFormData({
 vendorId: '',
 billNumber: '',
 date: new Date().toISOString().split('T')[0],
 dueDate: new Date().toISOString().split('T')[0],
 expenseAccountId: '',
 apAccountId: apAccount,
});
 setItems([{ item: '', quantity: 1, price: 0, tax: 0, total: 0}]);
 setErrorMsg(null);
 setIsModalOpen(true);
};

 const handleAddItem = () => {
 setItems([...items, { item: '', quantity: 1, price: 0, tax: 0, total: 0}]);
};

 const handleRemoveItem = (index: number) => {
 setItems(items.filter((_, i) => i !== index));
};

 const updateItem = (index: number, field: string, value: any) => {
 const newItems = [...items];
 newItems[index][field] = value;
 
 if (field === 'quantity' || field === 'price' || field === 'tax') {
 const qty = Number(newItems[index].quantity);
 const price = Number(newItems[index].price);
 const tax = Number(newItems[index].tax);
 newItems[index].total = (qty * price) + tax;
}
 
 setItems(newItems);
};

 const totalAmount = items.reduce((sum, item) => sum + item.total, 0);
 const totalTax = items.reduce((sum, item) => sum + Number(item.tax), 0);

 const handleSubmit = async (e: React.FormEvent) => {
 e.preventDefault();
 setErrorMsg(null);

 if (!formData.vendorId || !formData.apAccountId || !formData.expenseAccountId) {
 setErrorMsg('Please fill in all required fields and select accounts.');
 return;
}

 if (items.some(item => !item.item || item.total <= 0)) {
 setErrorMsg('Please ensure all items have a description and a total greater than 0.');
 return;
}

 try {
 const vendorName = vendors.find(v => v.id === formData.vendorId)?.name || 'Vendor';

 // 1. Create Bill and Items
 const billId = await addBill(
 {
 vendorId: formData.vendorId,
 billNumber: formData.billNumber,
 date: formData.date,
 dueDate: formData.dueDate,
 totalAmount,
 taxAmount: totalTax,
 status: 'open'
},
 items
 );

 // 2. Create Journal Entry
 // Debit Expense, Credit Accounts Payable
 await addJournalEntry(
 {
 date: formData.date,
 reference: formData.billNumber ||`BILL-${billId.substring(0, 6).toUpperCase()}`,
 description:`Purchase Bill from ${vendorName}`,
 totalDebit: totalAmount,
 totalCredit: totalAmount
},
 [
 { accountId: formData.expenseAccountId, description:`Purchase - ${vendorName}`, debit: totalAmount, credit: 0},
 { accountId: formData.apAccountId, description:`Accounts Payable - ${vendorName}`, debit: 0, credit: totalAmount}
 ]
 );

 setIsModalOpen(false);
} catch (error) {
 console.error('Error saving bill:', error);
 setErrorMsg('Failed to save bill. Please try again.');
}
};

 const handleDelete = async (id: string) => {
 if (window.confirm('Are you sure you want to delete this bill?')) {
 try {
 await deleteBill(id);
} catch (error) {
 console.error('Error deleting bill:', error);
 alert('Failed to delete bill');
}
}
};

 return (
 <AccountingLayout>
 <div className="space-y-6">
 <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
 <div>
 <h1 className={`text-2xl font-black uppercase tracking-tight text-slate-900`}>
 Purchase Bills
 </h1>
 <p className={`text-sm text-slate-500`}>
 Manage incoming bills from your vendors
 </p>
 </div>
 <button 
 onClick={handleOpenModal}
 className={`flex items-center gap-2 px-4 py-2 rounded-md font-bold text-sm uppercase tracking-widest transition-colors ${
 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md'
}`}
 >
 <Plus className="w-4 h-4"/>
 Create Bill
 </button>
 </div>

 <div className={`p-6 rounded-2xl border bg-white border-slate-200`}>
 <div className="relative mb-6 max-w-md">
 <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400`} />
 <input
 type="text"
 placeholder="Search bills by vendor or bill number..."
 value={searchTerm}
 onChange={(e) => setSearchTerm(e.target.value)}
 className={`w-full pl-10 pr-4 py-2 rounded-xl text-sm transition-all outline-none border ${
 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-indigo-500'
}`}
 />
 </div>

 <div className="overflow-x-auto">
 <table className="w-full text-left border-collapse">
 <thead>
 <tr className={`border-b border-slate-200`}>
 <th className={`py-3 px-4 text-xs font-black uppercase tracking-widest text-slate-500`}>Bill #</th>
 <th className={`py-3 px-4 text-xs font-black uppercase tracking-widest text-slate-500`}>Vendor</th>
 <th className={`py-3 px-4 text-xs font-black uppercase tracking-widest text-slate-500`}>Date</th>
 <th className={`py-3 px-4 text-xs font-black uppercase tracking-widest text-slate-500`}>Due Date</th>
 <th className={`py-3 px-4 text-xs font-black uppercase tracking-widest text-slate-500`}>Status</th>
 <th className={`py-3 px-4 text-xs font-black uppercase tracking-widest text-right text-slate-500`}>Total</th>
 <th className={`py-3 px-4 text-xs font-black uppercase tracking-widest text-right text-slate-500`}>Actions</th>
 </tr>
 </thead>
 <tbody>
 {loading ? (
 <tr>
 <td colSpan={7} className="py-8 text-center">
 <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
 </td>
 </tr>
 ) : filteredBills.length === 0 ? (
 <tr>
 <td colSpan={7} className={`py-8 text-center text-sm text-slate-500`}>
 No bills found.
 </td>
 </tr>
 ) : (
 filteredBills.map((bill) => {
 const vendor = vendors.find(v => v.id === bill.vendorId);
 return (
 <tr key={bill.id} className={`border-b transition-colors border-slate-100 hover:bg-slate-50`}>
 <td className={`py-3 px-4 text-sm font-mono text-slate-900`}>{bill.billNumber || 'N/A'}</td>
 <td className={`py-3 px-4 text-sm font-medium text-slate-900`}>{vendor?.name || 'Unknown Vendor'}</td>
 <td className={`py-3 px-4 text-sm text-slate-600`}>{bill.date}</td>
 <td className={`py-3 px-4 text-sm text-slate-600`}>{bill.dueDate}</td>
 <td className="py-3 px-4">
 <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
 bill.status === 'paid' ? ('bg-emerald-100 text-emerald-700') :
 bill.status === 'overdue' ? ('bg-red-100 text-red-700') :
 ('bg-indigo-100 text-indigo-700')
}`}>
 {bill.status}
 </span>
 </td>
 <td className={`py-3 px-4 text-sm font-mono text-right font-bold text-slate-900`}>
 {formatCurrency(bill.totalAmount)}
 </td>
 <td className="py-3 px-4 text-right">
 <button 
 onClick={() => handleDelete(bill.id)}
 className={`p-1.5 rounded-lg transition-colors hover:bg-red-100 text-red-600`}
 >
 <Trash2 className="w-4 h-4"/>
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

 {/* Create Bill Modal */}
 <AnimatePresence>
 {isModalOpen && (
 <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
 <motion.div 
 initial={{ opacity: 0}}
 animate={{ opacity: 1}}
 exit={{ opacity: 0}}
 className="absolute inset-0 bg-black/50 backdrop-blur-sm"
 onClick={() => setIsModalOpen(false)}
 />
 <motion.div 
 initial={{ opacity: 0, scale: 0.95, y: 20}}
 animate={{ opacity: 1, scale: 1, y: 0}}
 exit={{ opacity: 0, scale: 0.95, y: 20}}
 className={`relative w-full max-w-4xl max-h-[90vh] flex flex-col rounded-2xl shadow-2xl overflow-hidden bg-white`}
 >
 <div className={`p-6 border-b flex items-center justify-between shrink-0 border-slate-200`}>
 <div className="flex items-center gap-3">
 <div className={`p-2 rounded-lg bg-indigo-100 text-indigo-600`}>
 <FileText className="w-5 h-5"/>
 </div>
 <h2 className={`text-xl font-black uppercase tracking-tight text-slate-900`}>
 Create Purchase Bill
 </h2>
 </div>
 <button 
 onClick={() => setIsModalOpen(false)}
 className={`p-2 rounded-lg transition-colors hover:bg-slate-100 text-slate-500`}
 >
 <X className="w-5 h-5"/>
 </button>
 </div>

 <div className="p-6 overflow-y-auto flex-1">
 {errorMsg && (
 <div className={`mb-6 p-4 rounded-xl flex items-start gap-3 bg-red-50 border border-red-200 text-red-700`}>
 <AlertCircle className="w-5 h-5 shrink-0 mt-0.5"/>
 <p className="text-sm">{errorMsg}</p>
 </div>
 )}

 <form id="bill-form"onSubmit={handleSubmit} className="space-y-8">
 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
 <div>
 <label className={`block text-xs font-bold uppercase tracking-widest mb-2 text-slate-500`}>
 Vendor *
 </label>
 <select
 required
 value={formData.vendorId}
 onChange={(e) => setFormData({...formData, vendorId: e.target.value})}
 className={`w-full px-4 py-2.5 rounded-xl text-sm transition-all outline-none border ${
 'bg-slate-50 border-slate-200 text-slate-900 focus:border-indigo-500'
}`}
 >
 <option value="">Select Vendor</option>
 {vendors.map(v => (
 <option key={v.id} value={v.id}>{v.name}</option>
 ))}
 </select>
 </div>
 <div>
 <label className={`block text-xs font-bold uppercase tracking-widest mb-2 text-slate-500`}>
 Bill Number
 </label>
 <input
 type="text"
 value={formData.billNumber}
 onChange={(e) => setFormData({...formData, billNumber: e.target.value})}
 placeholder="e.g. INV-2024-001"
 className={`w-full px-4 py-2.5 rounded-xl text-sm transition-all outline-none border ${
 'bg-slate-50 border-slate-200 text-slate-900 focus:border-indigo-500'
}`}
 />
 </div>
 <div>
 <label className={`block text-xs font-bold uppercase tracking-widest mb-2 text-slate-500`}>
 Bill Date *
 </label>
 <input
 type="date"
 required
 value={formData.date}
 onChange={(e) => setFormData({...formData, date: e.target.value})}
 className={`w-full px-4 py-2.5 rounded-xl text-sm transition-all outline-none border ${
 'bg-slate-50 border-slate-200 text-slate-900 focus:border-indigo-500'
}`}
 />
 </div>
 <div>
 <label className={`block text-xs font-bold uppercase tracking-widest mb-2 text-slate-500`}>
 Due Date *
 </label>
 <input
 type="date"
 required
 value={formData.dueDate}
 onChange={(e) => setFormData({...formData, dueDate: e.target.value})}
 className={`w-full px-4 py-2.5 rounded-xl text-sm transition-all outline-none border ${
 'bg-slate-50 border-slate-200 text-slate-900 focus:border-indigo-500'
}`}
 />
 </div>
 </div>

 <div className="space-y-4">
 <div className="flex items-center justify-between">
 <h3 className={`text-sm font-black uppercase tracking-widest text-slate-900`}>
 Bill Items
 </h3>
 <button
 type="button"
 onClick={handleAddItem}
 className={`flex items-center gap-1 text-xs font-bold uppercase tracking-widest text-indigo-600`}
 >
 <Plus className="w-3 h-3"/>
 Add Item
 </button>
 </div>

 <div className="space-y-3">
 {items.map((item, index) => (
 <div key={index} className="grid grid-cols-12 gap-3 items-end">
 <div className="col-span-12 md:col-span-5">
 <label className={`block text-[10px] font-black uppercase tracking-widest mb-1 text-slate-500`}>Item Description</label>
 <input
 type="text"
 value={item.item}
 onChange={(e) => updateItem(index, 'item', e.target.value)}
 placeholder="Description"
 className={`w-full px-3 py-2 rounded-lg text-sm transition-all outline-none border ${
 'bg-slate-50 border-slate-200 text-slate-900 focus:border-indigo-500'
}`}
 />
 </div>
 <div className="col-span-3 md:col-span-1">
 <label className={`block text-[10px] font-black uppercase tracking-widest mb-1 text-slate-500`}>Qty</label>
 <input
 type="number"
 value={item.quantity}
 onChange={(e) => updateItem(index, 'quantity', e.target.value)}
 className={`w-full px-3 py-2 rounded-lg text-sm transition-all outline-none border ${
 'bg-slate-50 border-slate-200 text-slate-900 focus:border-indigo-500'
}`}
 />
 </div>
 <div className="col-span-4 md:col-span-2">
 <label className={`block text-[10px] font-black uppercase tracking-widest mb-1 text-slate-500`}>Price</label>
 <input
 type="number"
 value={item.price}
 onChange={(e) => updateItem(index, 'price', e.target.value)}
 className={`w-full px-3 py-2 rounded-lg text-sm transition-all outline-none border ${
 'bg-slate-50 border-slate-200 text-slate-900 focus:border-indigo-500'
}`}
 />
 </div>
 <div className="col-span-3 md:col-span-1">
 <label className={`block text-[10px] font-black uppercase tracking-widest mb-1 text-slate-500`}>Tax</label>
 <input
 type="number"
 value={item.tax}
 onChange={(e) => updateItem(index, 'tax', e.target.value)}
 className={`w-full px-3 py-2 rounded-lg text-sm transition-all outline-none border ${
 'bg-slate-50 border-slate-200 text-slate-900 focus:border-indigo-500'
}`}
 />
 </div>
 <div className="col-span-4 md:col-span-2">
 <label className={`block text-[10px] font-black uppercase tracking-widest mb-1 text-slate-500`}>Total</label>
 <div className={`w-full px-3 py-2 rounded-lg text-sm border font-mono ${
 'bg-slate-100 border-slate-200 text-indigo-600'
}`}>
 {formatCurrency(item.total)}
 </div>
 </div>
 <div className="col-span-1">
 <button
 type="button"
 onClick={() => handleRemoveItem(index)}
 className={`p-2 rounded-lg transition-colors text-red-600 hover:bg-red-50`}
 >
 <Trash2 className="w-4 h-4"/>
 </button>
 </div>
 </div>
 ))}
 </div>
 </div>

 <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t border-white/10">
 <div className="space-y-4">
 <h3 className={`text-xs font-bold uppercase tracking-widest text-slate-500`}>
 Accounting Posting
 </h3>
 <div className="space-y-4">
 <div>
 <label className={`block text-[10px] font-black uppercase tracking-widest mb-1 text-slate-500`}>Expense Account (Debit)</label>
 <select
 required
 value={formData.expenseAccountId}
 onChange={(e) => setFormData({...formData, expenseAccountId: e.target.value})}
 className={`w-full px-3 py-2 rounded-lg text-sm transition-all outline-none border ${
 'bg-slate-50 border-slate-200 text-slate-900 focus:border-indigo-500'
}`}
 >
 <option value="">Select Expense Account</option>
 {accounts.filter(a => a.type === 'Expense').map(a => (
 <option key={a.id} value={a.id}>{a.code} - {a.name}</option>
 ))}
 </select>
 </div>
 <div>
 <label className={`block text-[10px] font-black uppercase tracking-widest mb-1 text-slate-500`}>Accounts Payable (Credit)</label>
 <select
 required
 value={formData.apAccountId}
 onChange={(e) => setFormData({...formData, apAccountId: e.target.value})}
 className={`w-full px-3 py-2 rounded-lg text-sm transition-all outline-none border ${
 'bg-slate-50 border-slate-200 text-slate-900 focus:border-indigo-500'
}`}
 >
 <option value="">Select Payable Account</option>
 {accounts.filter(a => a.type === 'Liability').map(a => (
 <option key={a.id} value={a.id}>{a.code} - {a.name}</option>
 ))}
 </select>
 </div>
 </div>
 </div>

 <div className={`p-6 rounded-2xl space-y-3 bg-slate-50`}>
 <div className="flex justify-between text-sm">
 <span className={'text-slate-500'}>Subtotal</span>
 <span className={'text-slate-900'}>{formatCurrency(totalAmount - totalTax)}</span>
 </div>
 <div className="flex justify-between text-sm">
 <span className={'text-slate-500'}>Tax</span>
 <span className={'text-slate-900'}>{formatCurrency(totalTax)}</span>
 </div>
 <div className={`flex justify-between pt-3 border-t-2 border-slate-200`}>
 <span className={`text-lg font-black uppercase tracking-widest text-slate-900`}>Total Amount</span>
 <span className={`text-xl font-mono font-black text-indigo-600`}>{formatCurrency(totalAmount)}</span>
 </div>
 </div>
 </div>
 </form>
 </div>

 <div className={`p-6 border-t flex justify-end gap-3 shrink-0 border-slate-200`}>
 <button
 type="button"
 onClick={() => setIsModalOpen(false)}
 className={`px-4 py-2 rounded-lg font-bold text-sm uppercase tracking-widest transition-colors ${
 'hover:bg-slate-100 text-slate-900'
}`}
 >
 Cancel
 </button>
 <button
 type="submit"
 form="bill-form"
 className={`px-6 py-2 rounded-lg font-bold text-sm uppercase tracking-widest transition-colors ${
 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md'
}`}
 >
 Save Purchase Bill
 </button>
 </div>
 </motion.div>
 </div>
 )}
 </AnimatePresence>
 </AccountingLayout>
 );
}
