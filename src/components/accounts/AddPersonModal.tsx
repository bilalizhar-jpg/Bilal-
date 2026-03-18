import React, { useState} from 'react';
import { motion, AnimatePresence} from 'motion/react';
import { X} from 'lucide-react';
import { useCompanyData} from '../../context/CompanyDataContext';

interface AddPersonModalProps {
 isOpen: boolean;
 onClose: () => void;
 type: 'Customer' | 'Vendor';
}

export default function AddPersonModal({ isOpen, onClose, type}: AddPersonModalProps) {
  const { addEntity} = useCompanyData();

 const [formData, setFormData] = useState({
 name: '',
 email: '',
 phone: '',
 city: '',
 address: '',
 status: 'Active',
 balance: 0
});

 const handleSubmit = async (e: React.FormEvent) => {
 e.preventDefault();
 try {
 await addEntity('accountPeople', {
 ...formData,
 type,
 createdAt: new Date().toISOString()
});
 onClose();
 setFormData({
 name: '',
 email: '',
 phone: '',
 city: '',
 address: '',
 status: 'Active',
 balance: 0
});
} catch (error) {
 console.error(`Error adding ${type}:`, error);
}
};

 const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
 const { name, value} = e.target;
 setFormData(prev => ({
 ...prev,
 [name]: name === 'balance' ? parseFloat(value) || 0 : value
}));
};

 if (!isOpen) return null;

 return (
 <AnimatePresence>
 <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
 <motion.div
 initial={{ opacity: 0, scale: 0.95}}
 animate={{ opacity: 1, scale: 1}}
 exit={{ opacity: 0, scale: 0.95}}
 className={`w-full max-w-md rounded-2xl shadow-xl overflow-hidden ${
 'bg-white'
}`}
 >
 <div className={`flex items-center justify-between p-6 border-b ${
 'border-slate-100'
}`}>
 <h2 className={`text-xl font-semibold text-slate-900`}>
 Add New {type}
 </h2>
 <button
 onClick={onClose}
 className={`p-2 rounded-lg transition-colors ${
 'hover:bg-slate-100 text-slate-500'
}`}
 >
 <X className="w-5 h-5"/>
 </button>
 </div>

 <form onSubmit={handleSubmit} className="p-6 space-y-4">
 <div>
 <label className={`block text-sm font-medium mb-1 text-slate-700`}>
 Name *
 </label>
 <input
 type="text"
 name="name"
 required
 value={formData.name}
 onChange={handleChange}
 className={`w-full px-3 py-2 rounded-lg border outline-none transition-colors ${
 'bg-white border-slate-300 text-slate-900 focus:border-indigo-500'
}`}
 />
 </div>

 <div className="grid grid-cols-2 gap-4">
 <div>
 <label className={`block text-sm font-medium mb-1 text-slate-700`}>
 Email
 </label>
 <input
 type="email"
 name="email"
 value={formData.email}
 onChange={handleChange}
 className={`w-full px-3 py-2 rounded-lg border outline-none transition-colors ${
 'bg-white border-slate-300 text-slate-900 focus:border-indigo-500'
}`}
 />
 </div>
 <div>
 <label className={`block text-sm font-medium mb-1 text-slate-700`}>
 Phone
 </label>
 <input
 type="tel"
 name="phone"
 value={formData.phone}
 onChange={handleChange}
 className={`w-full px-3 py-2 rounded-lg border outline-none transition-colors ${
 'bg-white border-slate-300 text-slate-900 focus:border-indigo-500'
}`}
 />
 </div>
 </div>

 <div className="grid grid-cols-2 gap-4">
 <div>
 <label className={`block text-sm font-medium mb-1 text-slate-700`}>
 City
 </label>
 <input
 type="text"
 name="city"
 value={formData.city}
 onChange={handleChange}
 className={`w-full px-3 py-2 rounded-lg border outline-none transition-colors ${
 'bg-white border-slate-300 text-slate-900 focus:border-indigo-500'
}`}
 />
 </div>
 <div>
 <label className={`block text-sm font-medium mb-1 text-slate-700`}>
 Opening Balance
 </label>
 <input
 type="number"
 name="balance"
 step="0.01"
 value={formData.balance}
 onChange={handleChange}
 className={`w-full px-3 py-2 rounded-lg border outline-none transition-colors ${
 'bg-white border-slate-300 text-slate-900 focus:border-indigo-500'
}`}
 />
 </div>
 </div>

 <div>
 <label className={`block text-sm font-medium mb-1 text-slate-700`}>
 Address
 </label>
 <textarea
 name="address"
 rows={2}
 value={formData.address}
 onChange={handleChange}
 className={`w-full px-3 py-2 rounded-lg border outline-none transition-colors resize-none ${
 'bg-white border-slate-300 text-slate-900 focus:border-indigo-500'
}`}
 />
 </div>

 <div className="flex justify-end gap-3 mt-6">
 <button
 type="button"
 onClick={onClose}
 className={`px-4 py-2 rounded-lg font-medium transition-colors ${
 'bg-slate-100 text-slate-700 hover:bg-slate-200'
}`}
 >
 Cancel
 </button>
 <button
 type="submit"
 className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
 >
 Save {type}
 </button>
 </div>
 </form>
 </motion.div>
 </div>
 </AnimatePresence>
 );
}
