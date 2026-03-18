import React, { useState} from 'react';
import AccountingLayout from '../../components/accounting/AccountingLayout';
import { motion, AnimatePresence} from 'motion/react';
import { Plus, Search, X, AlertCircle, Trash2, FileText} from 'lucide-react';
import { useInvoice} from '../../context/InvoiceContext';
import { useCustomer} from '../../context/CustomerContext';
import { useAccounting} from '../../context/AccountingContext';
import { useSettings} from '../../context/SettingsContext';

export default function Invoices() {
  const { formatCurrency, financialSettings} = useSettings();
 const { invoices, loading, addInvoice, updateInvoice, deleteInvoice} = useInvoice();
 const { customers} = useCustomer();
 const { accounts, addJournalEntry, isPeriodClosed} = useAccounting();
 
 const [searchTerm, setSearchTerm] = useState('');
 const [isModalOpen, setIsModalOpen] = useState(false);
 const [errorMsg, setErrorMsg] = useState<string | null>(null);
 
 const [formData, setFormData] = useState({
 customerId: '',
 date: new Date().toISOString().split('T')[0],
 dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
 arAccountId: '',
 revenueAccountId: ''
});

 const isClosed = isPeriodClosed(formData.date);

 const [lines, setLines] = useState([
 { product: '', quantity: 1, price: 0, tax: 0, total: 0}
 ]);

 const filteredInvoices = invoices.filter(invoice => {
 const customer = customers.find(c => c.id === invoice.customerId);
 return customer?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
 invoice.status.toLowerCase().includes(searchTerm.toLowerCase());
});

 const handleAddLine = () => {
 setLines([...lines, { product: '', quantity: 1, price: 0, tax: 0, total: 0}]);
};

 const handleRemoveLine = (index: number) => {
 if (lines.length <= 1) return;
 const newLines = [...lines];
 newLines.splice(index, 1);
 setLines(newLines);
};

 const handleLineChange = (index: number, field: string, value: any) => {
 const newLines = [...lines];
 newLines[index] = { ...newLines[index], [field]: value};
 
 // Recalculate total
 const qty = Number(newLines[index].quantity) || 0;
 const price = Number(newLines[index].price) || 0;
 const tax = Number(newLines[index].tax) || 0;
 newLines[index].total = (qty * price) + tax;
 
 setLines(newLines);
};

 const totalAmount = lines.reduce((sum, line) => sum + (Number(line.total) || 0), 0);

 const handleOpenModal = () => {
 // Auto-select accounts if possible
 // Use financialSettings if available
 const arAccount = financialSettings?.defaultAccounts?.accountsReceivableId || 
 accounts.find(a => a.type === 'Asset' && a.name.toLowerCase().includes('receivable'))?.id || '';
 const revAccount = accounts.find(a => a.type === 'Revenue' && a.name.toLowerCase().includes('sales'))?.id || '';

 setFormData({
 customerId: '',
 date: new Date().toISOString().split('T')[0],
 dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
 arAccountId: arAccount,
 revenueAccountId: revAccount
});
 setLines([
 { product: '', quantity: 1, price: 0, tax: 0, total: 0}
 ]);
 setErrorMsg(null);
 setIsModalOpen(true);
};

 const handleSubmit = async (e: React.FormEvent) => {
 e.preventDefault();
 setErrorMsg(null);

 if (totalAmount <= 0) {
 setErrorMsg('Invoice total must be greater than 0.');
 return;
}

 if (!formData.arAccountId || !formData.revenueAccountId) {
 setErrorMsg('Please select both Accounts Receivable and Sales Revenue accounts.');
 return;
}

 const validLines = lines.filter(l => l.product && l.total > 0);
 if (validLines.length === 0) {
 setErrorMsg('Invoice must have at least one valid line item.');
 return;
}

 try {
 const customerName = customers.find(c => c.id === formData.customerId)?.name || 'Customer';

 // 1. Create Invoice
 const invoiceId = await addInvoice(
 {
 customerId: formData.customerId,
 date: formData.date,
 dueDate: formData.dueDate,
 totalAmount,
 status: 'Sent',
 arAccountId: formData.arAccountId,
 revenueAccountId: formData.revenueAccountId
},
 validLines.map(l => ({
 product: l.product,
 quantity: Number(l.quantity),
 price: Number(l.price),
 tax: Number(l.tax),
 total: Number(l.total)
}))
 );

 // 2. Create Journal Entry
 const journalEntryId = await addJournalEntry(
 {
 date: formData.date,
 reference:`INV-${invoiceId.substring(0, 6).toUpperCase()}`,
 description:`Sales Invoice for ${customerName}`,
 totalDebit: totalAmount,
 totalCredit: totalAmount
},
 [
 { accountId: formData.arAccountId, description:`Accounts Receivable - ${customerName}`, debit: totalAmount, credit: 0},
 { accountId: formData.revenueAccountId, description:`Sales Revenue - ${customerName}`, debit: 0, credit: totalAmount}
 ]
 );

 // 3. Link Journal Entry to Invoice
 await updateInvoice(invoiceId, { journalEntryId});

 setIsModalOpen(false);
} catch (error) {
 console.error('Error saving invoice:', error);
 setErrorMsg('Failed to save invoice. Please try again.');
}
};

 const handleDelete = async (id: string) => {
 if (window.confirm('Are you sure you want to delete this invoice? Note: This will not reverse the journal entry automatically.')) {
 try {
 await deleteInvoice(id);
} catch (error) {
 console.error('Error deleting invoice:', error);
 alert('Failed to delete invoice');
}
}
};

 const formatDate = (dateString: string) => {
 return new Date(dateString).toLocaleDateString('en-US', {
 year: 'numeric',
 month: 'short',
 day: 'numeric'
});
};

 const getStatusColor = (status: string) => {
 switch (status) {
 case 'Paid': return 'bg-emerald-100 text-emerald-700';
 case 'Sent': return 'bg-blue-100 text-blue-700';
 case 'Draft': return 'bg-slate-100 text-slate-700';
 case 'Cancelled': return 'bg-red-100 text-red-700';
 default: return 'bg-slate-100 text-slate-700';
}
};

 return (
 <AccountingLayout>
 <div className="space-y-6">
 <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
 <div>
 <h1 className={`text-2xl font-black uppercase tracking-tight text-slate-900`}>
 Sales Invoices
 </h1>
 <p className={`text-sm text-slate-500`}>
 Create and manage customer invoices
 </p>
 </div>
 <div className="flex gap-2">
 <button 
 onClick={handleOpenModal}
 className={`flex items-center gap-2 px-4 py-2 rounded-md font-bold text-sm uppercase tracking-widest transition-colors ${
 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md'
}`}
 >
 <Plus className="w-4 h-4"/>
 New Invoice
 </button>
 </div>
 </div>

 <div className={`p-6 rounded-2xl border bg-white border-slate-200`}>
 <div className="flex flex-col md:flex-row gap-4 mb-6">
 <div className="relative flex-1 max-w-md">
 <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400`} />
 <input
 type="text"
 placeholder="Search invoices by customer or status..."
 value={searchTerm}
 onChange={(e) => setSearchTerm(e.target.value)}
 className={`w-full pl-10 pr-4 py-2 rounded-xl text-sm transition-all outline-none border ${
 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-indigo-500'
}`}
 />
 </div>
 </div>

 <div className="overflow-x-auto">
 <table className="w-full text-left border-collapse">
 <thead>
 <tr className={`border-b border-slate-200`}>
 <th className={`py-3 px-4 text-xs font-black uppercase tracking-widest text-slate-500`}>Invoice ID</th>
 <th className={`py-3 px-4 text-xs font-black uppercase tracking-widest text-slate-500`}>Customer</th>
 <th className={`py-3 px-4 text-xs font-black uppercase tracking-widest text-slate-500`}>Date</th>
 <th className={`py-3 px-4 text-xs font-black uppercase tracking-widest text-slate-500`}>Due Date</th>
 <th className={`py-3 px-4 text-xs font-black uppercase tracking-widest text-slate-500`}>Status</th>
 <th className={`py-3 px-4 text-xs font-black uppercase tracking-widest text-right text-slate-500`}>Amount</th>
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
 ) : filteredInvoices.length === 0 ? (
 <tr>
 <td colSpan={7} className={`py-8 text-center text-sm text-slate-500`}>
 No invoices found.
 </td>
 </tr>
 ) : (
 filteredInvoices.map((invoice) => {
 const customer = customers.find(c => c.id === invoice.customerId);
 return (
 <tr key={invoice.id} className={`border-b transition-colors border-slate-100 hover:bg-slate-50`}>
 <td className={`py-3 px-4 text-sm font-mono text-slate-900`}>
 INV-{invoice.id.substring(0, 6).toUpperCase()}
 </td>
 <td className={`py-3 px-4 text-sm font-medium text-slate-900`}>
 {customer?.name || 'Unknown Customer'}
 </td>
 <td className={`py-3 px-4 text-sm text-slate-600`}>{formatDate(invoice.date)}</td>
 <td className={`py-3 px-4 text-sm text-slate-600`}>{formatDate(invoice.dueDate)}</td>
 <td className="py-3 px-4">
 <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${getStatusColor(invoice.status)}`}>
 {invoice.status}
 </span>
 </td>
 <td className={`py-3 px-4 text-sm font-mono text-right font-bold text-slate-900`}>
 {formatCurrency(invoice.totalAmount)}
 </td>
 <td className="py-3 px-4 text-right">
 <button 
 onClick={() => handleDelete(invoice.id)}
 className={`p-1.5 rounded-lg transition-colors hover:bg-red-100 text-red-600 hover:text-red-700`}
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

 {/* Add Invoice Modal */}
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
 className={`relative w-full max-w-5xl max-h-[90vh] flex flex-col rounded-2xl shadow-2xl overflow-hidden bg-white`}
 >
 <div className={`p-6 border-b flex items-center justify-between shrink-0 border-slate-200`}>
 <div className="flex items-center gap-3">
 <div className={`p-2 rounded-lg bg-indigo-100 text-indigo-600`}>
 <FileText className="w-5 h-5"/>
 </div>
 <h2 className={`text-xl font-black uppercase tracking-tight text-slate-900`}>
 Create Sales Invoice
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

 <form id="invoice-form"onSubmit={handleSubmit} className="space-y-8">
 {isClosed && (
 <div className={`p-4 rounded-xl flex items-center gap-3 bg-amber-50 border border-amber-200 text-amber-700`}>
 <AlertCircle className="w-5 h-5 shrink-0"/>
 <p className="text-sm font-bold uppercase tracking-tight">This date falls within a closed fiscal period. Transactions are locked.</p>
 </div>
 )}
 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
 <div className="md:col-span-1">
 <label className={`block text-xs font-bold uppercase tracking-widest mb-2 text-slate-500`}>
 Customer *
 </label>
 <select
 required
 value={formData.customerId}
 onChange={(e) => setFormData({...formData, customerId: e.target.value})}
 className={`w-full px-4 py-2.5 rounded-xl text-sm transition-all outline-none border ${
 'bg-slate-50 border-slate-200 text-slate-900 focus:border-indigo-500'
}`}
 >
 <option value="">Select Customer</option>
 {customers.map(c => (
 <option key={c.id} value={c.id}>{c.name}</option>
 ))}
 </select>
 </div>
 <div>
 <label className={`block text-xs font-bold uppercase tracking-widest mb-2 text-slate-500`}>
 Invoice Date *
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

 <div className={`p-4 rounded-xl border bg-slate-50 border-slate-200`}>
 <h3 className={`text-xs font-bold uppercase tracking-widest mb-4 text-slate-500`}>
 Accounting Configuration
 </h3>
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 <div>
 <label className={`block text-xs font-bold uppercase tracking-widest mb-2 text-slate-500`}>
 Accounts Receivable (Debit) *
 </label>
 <select
 required
 value={formData.arAccountId}
 onChange={(e) => setFormData({...formData, arAccountId: e.target.value})}
 className={`w-full px-4 py-2.5 rounded-xl text-sm transition-all outline-none border ${
 'bg-white border-slate-200 text-slate-900 focus:border-indigo-500'
}`}
 >
 <option value="">Select Asset Account</option>
 {accounts.filter(a => a.type === 'Asset').map(a => (
 <option key={a.id} value={a.id}>{a.code} - {a.name}</option>
 ))}
 </select>
 </div>
 <div>
 <label className={`block text-xs font-bold uppercase tracking-widest mb-2 text-slate-500`}>
 Sales Revenue (Credit) *
 </label>
 <select
 required
 value={formData.revenueAccountId}
 onChange={(e) => setFormData({...formData, revenueAccountId: e.target.value})}
 className={`w-full px-4 py-2.5 rounded-xl text-sm transition-all outline-none border ${
 'bg-white border-slate-200 text-slate-900 focus:border-indigo-500'
}`}
 >
 <option value="">Select Revenue Account</option>
 {accounts.filter(a => a.type === 'Revenue').map(a => (
 <option key={a.id} value={a.id}>{a.code} - {a.name}</option>
 ))}
 </select>
 </div>
 </div>
 </div>

 <div>
 <h3 className={`text-sm font-bold uppercase tracking-widest mb-4 text-slate-900`}>
 Invoice Items
 </h3>
 
 <div className="overflow-x-auto">
 <table className="w-full text-left border-collapse min-w-[800px]">
 <thead>
 <tr className={`border-b border-slate-200`}>
 <th className={`py-2 px-2 text-xs font-black uppercase tracking-widest w-2/5 text-slate-500`}>Product / Description</th>
 <th className={`py-2 px-2 text-xs font-black uppercase tracking-widest text-right w-1/6 text-slate-500`}>Quantity</th>
 <th className={`py-2 px-2 text-xs font-black uppercase tracking-widest text-right w-1/6 text-slate-500`}>Price</th>
 <th className={`py-2 px-2 text-xs font-black uppercase tracking-widest text-right w-1/6 text-slate-500`}>Tax</th>
 <th className={`py-2 px-2 text-xs font-black uppercase tracking-widest text-right w-1/6 text-slate-500`}>Total</th>
 <th className="w-10"></th>
 </tr>
 </thead>
 <tbody>
 {lines.map((line, index) => (
 <tr key={index} className={`border-b border-slate-100`}>
 <td className="py-2 px-2">
 <input
 type="text"
 required
 value={line.product}
 onChange={(e) => handleLineChange(index, 'product', e.target.value)}
 placeholder="Item description"
 className={`w-full px-3 py-2 rounded-lg text-sm transition-all outline-none border ${
 'bg-slate-50 border-slate-200 text-slate-900 focus:border-indigo-500'
}`}
 />
 </td>
 <td className="py-2 px-2">
 <input
 type="number"
 min="1"
 step="1"
 required
 value={line.quantity || ''}
 onChange={(e) => handleLineChange(index, 'quantity', parseFloat(e.target.value) || 0)}
 className={`w-full px-3 py-2 rounded-lg text-sm transition-all outline-none border text-right font-mono ${
 'bg-slate-50 border-slate-200 text-slate-900 focus:border-indigo-500'
}`}
 />
 </td>
 <td className="py-2 px-2">
 <input
 type="number"
 min="0"
 step="0.01"
 required
 value={line.price || ''}
 onChange={(e) => handleLineChange(index, 'price', parseFloat(e.target.value) || 0)}
 className={`w-full px-3 py-2 rounded-lg text-sm transition-all outline-none border text-right font-mono ${
 'bg-slate-50 border-slate-200 text-slate-900 focus:border-indigo-500'
}`}
 />
 </td>
 <td className="py-2 px-2">
 <input
 type="number"
 min="0"
 step="0.01"
 value={line.tax || ''}
 onChange={(e) => handleLineChange(index, 'tax', parseFloat(e.target.value) || 0)}
 className={`w-full px-3 py-2 rounded-lg text-sm transition-all outline-none border text-right font-mono ${
 'bg-slate-50 border-slate-200 text-slate-900 focus:border-indigo-500'
}`}
 />
 </td>
 <td className="py-2 px-2 text-right">
 <div className={`px-3 py-2 rounded-lg text-sm font-mono font-bold bg-slate-100 text-slate-900`}>
 {formatCurrency(line.total)}
 </div>
 </td>
 <td className="py-2 px-2 text-center">
 <button
 type="button"
 onClick={() => handleRemoveLine(index)}
 disabled={lines.length <= 1}
 className={`p-1.5 rounded-lg transition-colors disabled:opacity-30 ${
 'hover:bg-red-100 text-red-600'
}`}
 >
 <Trash2 className="w-4 h-4"/>
 </button>
 </td>
 </tr>
 ))}
 </tbody>
 <tfoot>
 <tr>
 <td colSpan={4} className="py-4 px-2">
 <button
 type="button"
 onClick={handleAddLine}
 className={`flex items-center gap-2 text-sm font-bold uppercase tracking-widest transition-colors ${
 'text-indigo-600 hover:text-indigo-700'
}`}
 >
 <Plus className="w-4 h-4"/>
 Add Item
 </button>
 </td>
 <td className={`py-4 px-2 text-right text-lg font-mono font-black text-indigo-600`}>
 {formatCurrency(totalAmount)}
 </td>
 <td></td>
 </tr>
 </tfoot>
 </table>
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
 form="invoice-form"
 disabled={totalAmount <= 0 || isClosed}
 className={`px-6 py-2 rounded-lg font-bold text-sm uppercase tracking-widest transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md'
}`}
 >
 Create Invoice
 </button>
 </div>
 </motion.div>
 </div>
 )}
 </AnimatePresence>
 </AccountingLayout>
 );
}
