import React, { useState} from 'react';
import AccountingLayout from '../../components/accounting/AccountingLayout';
import { motion, AnimatePresence} from 'motion/react';
import { Plus, Search, Edit2, Trash2, X, Mail, Phone, MapPin, FileText} from 'lucide-react';
import { useCustomer, Customer} from '../../context/CustomerContext';

export default function Customers() {
  const { customers, loading, addCustomer, updateCustomer, deleteCustomer} = useCustomer();
 
 const [searchTerm, setSearchTerm] = useState('');
 const [isModalOpen, setIsModalOpen] = useState(false);
 const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
 
 const [formData, setFormData] = useState({
 name: '',
 email: '',
 phone: '',
 address: '',
 taxNumber: ''
});

 const filteredCustomers = customers.filter(customer => 
 customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
 (customer.email && customer.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
 (customer.taxNumber && customer.taxNumber.toLowerCase().includes(searchTerm.toLowerCase()))
 );

 const handleOpenModal = (customer?: Customer) => {
 if (customer) {
 setEditingCustomer(customer);
 setFormData({
 name: customer.name,
 email: customer.email || '',
 phone: customer.phone || '',
 address: customer.address || '',
 taxNumber: customer.taxNumber || ''
});
} else {
 setEditingCustomer(null);
 setFormData({
 name: '',
 email: '',
 phone: '',
 address: '',
 taxNumber: ''
});
}
 setIsModalOpen(true);
};

 const handleSubmit = async (e: React.FormEvent) => {
 e.preventDefault();
 try {
 if (editingCustomer) {
 await updateCustomer(editingCustomer.id, formData);
} else {
 await addCustomer(formData);
}
 setIsModalOpen(false);
} catch (error) {
 console.error('Error saving customer:', error);
 alert('Failed to save customer');
}
};

 const handleDelete = async (id: string) => {
 if (window.confirm('Are you sure you want to delete this customer?')) {
 try {
 await deleteCustomer(id);
} catch (error) {
 console.error('Error deleting customer:', error);
 alert('Failed to delete customer');
}
}
};

 return (
 <AccountingLayout>
 <div className="space-y-6">
 <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
 <div>
 <h1 className={`text-2xl font-black uppercase tracking-tight text-slate-900`}>
 Customers
 </h1>
 <p className={`text-sm text-slate-500`}>
 Manage your customer directory and details
 </p>
 </div>
 <div className="flex gap-2">
 <button 
 onClick={() => handleOpenModal()}
 className={`flex items-center gap-2 px-4 py-2 rounded-md font-bold text-sm uppercase tracking-widest transition-colors ${
 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md'
}`}
 >
 <Plus className="w-4 h-4"/>
 Add Customer
 </button>
 </div>
 </div>

 <div className={`p-6 rounded-2xl border bg-white border-slate-200`}>
 <div className="flex flex-col md:flex-row gap-4 mb-6">
 <div className="relative flex-1 max-w-md">
 <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400`} />
 <input
 type="text"
 placeholder="Search customers by name, email, or tax number..."
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
 <th className={`py-3 px-4 text-xs font-black uppercase tracking-widest text-slate-500`}>Customer Name</th>
 <th className={`py-3 px-4 text-xs font-black uppercase tracking-widest text-slate-500`}>Contact Info</th>
 <th className={`py-3 px-4 text-xs font-black uppercase tracking-widest text-slate-500`}>Address</th>
 <th className={`py-3 px-4 text-xs font-black uppercase tracking-widest text-slate-500`}>Tax Number</th>
 <th className={`py-3 px-4 text-xs font-black uppercase tracking-widest text-right text-slate-500`}>Actions</th>
 </tr>
 </thead>
 <tbody>
 {loading ? (
 <tr>
 <td colSpan={5} className="py-8 text-center">
 <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
 </td>
 </tr>
 ) : filteredCustomers.length === 0 ? (
 <tr>
 <td colSpan={5} className={`py-8 text-center text-sm text-slate-500`}>
 No customers found.
 </td>
 </tr>
 ) : (
 filteredCustomers.map((customer) => (
 <tr key={customer.id} className={`border-b last:border-0 transition-colors border-slate-100 hover:bg-slate-50`}>
 <td className={`py-3 px-4 text-sm font-medium text-slate-900`}>
 {customer.name}
 </td>
 <td className="py-3 px-4">
 <div className="flex flex-col gap-1">
 {customer.email && (
 <div className={`flex items-center gap-1.5 text-xs text-slate-500`}>
 <Mail className="w-3 h-3"/>
 {customer.email}
 </div>
 )}
 {customer.phone && (
 <div className={`flex items-center gap-1.5 text-xs text-slate-500`}>
 <Phone className="w-3 h-3"/>
 {customer.phone}
 </div>
 )}
 {!customer.email && !customer.phone && (
 <span className={`text-xs italic text-slate-400`}>No contact info</span>
 )}
 </div>
 </td>
 <td className="py-3 px-4">
 {customer.address ? (
 <div className={`flex items-start gap-1.5 text-xs text-slate-500`}>
 <MapPin className="w-3 h-3 shrink-0 mt-0.5"/>
 <span className="truncate max-w-[200px]">{customer.address}</span>
 </div>
 ) : (
 <span className={`text-xs italic text-slate-400`}>-</span>
 )}
 </td>
 <td className="py-3 px-4">
 {customer.taxNumber ? (
 <div className={`flex items-center gap-1.5 text-xs font-mono text-slate-500`}>
 <FileText className="w-3 h-3"/>
 {customer.taxNumber}
 </div>
 ) : (
 <span className={`text-xs italic text-slate-400`}>-</span>
 )}
 </td>
 <td className="py-3 px-4 text-right">
 <div className="flex items-center justify-end gap-2">
 <button 
 onClick={() => handleOpenModal(customer)}
 className={`p-1.5 rounded-lg transition-colors hover:bg-slate-200 text-slate-500 hover:text-slate-900`}
 >
 <Edit2 className="w-4 h-4"/>
 </button>
 <button 
 onClick={() => handleDelete(customer.id)}
 className={`p-1.5 rounded-lg transition-colors hover:bg-red-100 text-red-600 hover:text-red-700`}
 >
 <Trash2 className="w-4 h-4"/>
 </button>
 </div>
 </td>
 </tr>
 ))
 )}
 </tbody>
 </table>
 </div>
 </div>
 </div>

 {/* Add/Edit Modal */}
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
 className={`relative w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden bg-white`}
 >
 <div className={`p-6 border-b flex items-center justify-between border-slate-200`}>
 <h2 className={`text-xl font-black uppercase tracking-tight text-slate-900`}>
 {editingCustomer ? 'Edit Customer' : 'Add New Customer'}
 </h2>
 <button 
 onClick={() => setIsModalOpen(false)}
 className={`p-2 rounded-lg transition-colors hover:bg-slate-100 text-slate-500`}
 >
 <X className="w-5 h-5"/>
 </button>
 </div>

 <form onSubmit={handleSubmit} className="p-6 space-y-4">
 <div>
 <label className={`block text-xs font-bold uppercase tracking-widest mb-2 text-slate-500`}>
 Customer Name *
 </label>
 <input
 type="text"
 required
 value={formData.name}
 onChange={(e) => setFormData({...formData, name: e.target.value})}
 className={`w-full px-4 py-2.5 rounded-xl text-sm transition-all outline-none border ${
 'bg-slate-50 border-slate-200 text-slate-900 focus:border-indigo-500'
}`}
 placeholder="e.g. Acme Corp"
 />
 </div>

 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 <div>
 <label className={`block text-xs font-bold uppercase tracking-widest mb-2 text-slate-500`}>
 Email
 </label>
 <input
 type="email"
 value={formData.email}
 onChange={(e) => setFormData({...formData, email: e.target.value})}
 className={`w-full px-4 py-2.5 rounded-xl text-sm transition-all outline-none border ${
 'bg-slate-50 border-slate-200 text-slate-900 focus:border-indigo-500'
}`}
 placeholder="contact@example.com"
 />
 </div>
 <div>
 <label className={`block text-xs font-bold uppercase tracking-widest mb-2 text-slate-500`}>
 Phone
 </label>
 <input
 type="tel"
 value={formData.phone}
 onChange={(e) => setFormData({...formData, phone: e.target.value})}
 className={`w-full px-4 py-2.5 rounded-xl text-sm transition-all outline-none border ${
 'bg-slate-50 border-slate-200 text-slate-900 focus:border-indigo-500'
}`}
 placeholder="+1 (555) 000-0000"
 />
 </div>
 </div>

 <div>
 <label className={`block text-xs font-bold uppercase tracking-widest mb-2 text-slate-500`}>
 Address
 </label>
 <textarea
 value={formData.address}
 onChange={(e) => setFormData({...formData, address: e.target.value})}
 rows={3}
 className={`w-full px-4 py-2.5 rounded-xl text-sm transition-all outline-none border resize-none ${
 'bg-slate-50 border-slate-200 text-slate-900 focus:border-indigo-500'
}`}
 placeholder="Full business address"
 />
 </div>

 <div>
 <label className={`block text-xs font-bold uppercase tracking-widest mb-2 text-slate-500`}>
 Tax Number (VAT/EIN)
 </label>
 <input
 type="text"
 value={formData.taxNumber}
 onChange={(e) => setFormData({...formData, taxNumber: e.target.value})}
 className={`w-full px-4 py-2.5 rounded-xl text-sm transition-all outline-none border ${
 'bg-slate-50 border-slate-200 text-slate-900 focus:border-indigo-500'
}`}
 placeholder="e.g. US123456789"
 />
 </div>

 <div className="pt-4 flex justify-end gap-3">
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
 className={`px-6 py-2 rounded-lg font-bold text-sm uppercase tracking-widest transition-colors ${
 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md'
}`}
 >
 {editingCustomer ? 'Save Changes' : 'Create Customer'}
 </button>
 </div>
 </form>
 </motion.div>
 </div>
 )}
 </AnimatePresence>
 </AccountingLayout>
 );
}
