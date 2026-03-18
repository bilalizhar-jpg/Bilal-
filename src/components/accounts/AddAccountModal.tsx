import React, { useState} from 'react';
import { X} from 'lucide-react';
import { useCompanyData} from '../../context/CompanyDataContext';

interface AddAccountModalProps {
 isOpen: boolean;
 onClose: () => void;
}

export default function AddAccountModal({ isOpen, onClose}: AddAccountModalProps) {
 const { addEntity} = useCompanyData();
 const [formData, setFormData] = useState({ code: '', name: '', type: 'Asset', balance: 0});

 if (!isOpen) return null;

 const handleSubmit = async (e: React.FormEvent) => {
 e.preventDefault();
 await addEntity('ledgers', formData);
 onClose();
 setFormData({ code: '', name: '', type: 'Asset', balance: 0});
};

 return (
 <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
 <div className="bg-white p-6 rounded-xl w-full max-w-md">
 <div className="flex justify-between items-center mb-4">
 <h2 className="text-lg font-bold">Add New Account</h2>
 <button onClick={onClose}><X className="w-5 h-5"/></button>
 </div>
 <form onSubmit={handleSubmit} className="space-y-4">
 <input type="text"placeholder="Code"className="w-full p-2 border rounded"value={formData.code} onChange={e => setFormData({...formData, code: e.target.value})} required />
 <input type="text"placeholder="Account Name"className="w-full p-2 border rounded"value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
 <select className="w-full p-2 border rounded"value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}>
 <option value="Asset">Asset</option>
 <option value="Liability">Liability</option>
 <option value="Equity">Equity</option>
 <option value="Income">Income</option>
 <option value="Expense">Expense</option>
 </select>
 <input type="number"placeholder="Balance"className="w-full p-2 border rounded"value={formData.balance} onChange={e => setFormData({...formData, balance: Number(e.target.value)})} required />
 <button type="submit"className="w-full bg-indigo-600 text-white p-2 rounded">Add Account</button>
 </form>
 </div>
 </div>
 );
}
