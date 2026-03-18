import React, { useState} from 'react';
import { X} from 'lucide-react';
import { useCompanyData} from '../../context/CompanyDataContext';

interface AddTaxModalProps {
 isOpen: boolean;
 onClose: () => void;
}

export default function AddTaxModal({ isOpen, onClose}: AddTaxModalProps) {
 const { addEntity} = useCompanyData();
 const [formData, setFormData] = useState({ name: '', type: 'Sales', amount: 0, account: '', status: 'Active'});

 if (!isOpen) return null;

 const handleSubmit = async (e: React.FormEvent) => {
 e.preventDefault();
 await addEntity('taxes', formData);
 onClose();
 setFormData({ name: '', type: 'Sales', amount: 0, account: '', status: 'Active'});
};

 return (
 <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
 <div className="bg-white p-6 rounded-xl w-full max-w-md">
 <div className="flex justify-between items-center mb-4">
 <h2 className="text-lg font-bold">Add New Tax</h2>
 <button onClick={onClose}><X className="w-5 h-5"/></button>
 </div>
 <form onSubmit={handleSubmit} className="space-y-4">
 <input type="text"placeholder="Tax Name"className="w-full p-2 border rounded"value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
 <select className="w-full p-2 border rounded"value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}>
 <option value="Sales">Sales</option>
 <option value="Purchase">Purchase</option>
 </select>
 <input type="number"placeholder="Amount (%)"className="w-full p-2 border rounded"value={formData.amount} onChange={e => setFormData({...formData, amount: Number(e.target.value)})} required />
 <input type="text"placeholder="Account"className="w-full p-2 border rounded"value={formData.account} onChange={e => setFormData({...formData, account: e.target.value})} required />
 <button type="submit"className="w-full bg-indigo-600 text-white p-2 rounded">Add Tax</button>
 </form>
 </div>
 </div>
 );
}
