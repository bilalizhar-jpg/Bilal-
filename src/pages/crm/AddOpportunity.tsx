import React, { useState, useEffect} from 'react';
import { useNavigate, useParams} from 'react-router-dom';
import { X} from 'lucide-react';
import AdminLayout from '../../components/AdminLayout';
import { useCompanyData} from '../../context/CompanyDataContext';
import { useEmployees} from '../../context/EmployeeContext';

export default function AddOpportunity() {
 const navigate = useNavigate();
 const { id} = useParams();
 const isEditMode = Boolean(id);
  const { addEntity, updateEntity, sales, products, companies} = useCompanyData();
 const { employees} = useEmployees();

 const [formData, setFormData] = useState({
 name: '',
 account: '',
 expectedValue: '',
 stage: '',
 probability: '',
 owner: '',
 expectedCloseDate: '',
 status: 'open',
 customFields: [] as { label: string; value: string}[]
});

 useEffect(() => {
 if (isEditMode && sales.length > 0) {
 const oppToEdit = sales.find(s => s.id === id);
 if (oppToEdit) {
 setFormData({
 name: oppToEdit.name || '',
 account: oppToEdit.account || '',
 expectedValue: oppToEdit.value || '',
 stage: oppToEdit.stage || '',
 probability: oppToEdit.probability || '',
 owner: oppToEdit.owner || '',
 expectedCloseDate: oppToEdit.closeDate || '',
 status: oppToEdit.status || 'open',
 customFields: oppToEdit.customFields || []
});
}
}
}, [id, isEditMode, sales]);

 const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
 const { name, value} = e.target;
 let updatedData = { ...formData, [name]: value};
 
 // Auto-fill Expected Value when Product is selected
 if (name === 'name') {
 const selectedProduct = products.find(p => p.name === value);
 if (selectedProduct) {
 updatedData.expectedValue = String(selectedProduct.sellingPrice || '');
}
}
 setFormData(updatedData);
};

 const handleCustomFieldChange = (index: number, field: 'label' | 'value', value: string) => {
 const newCustomFields = [...formData.customFields];
 newCustomFields[index][field] = value;
 setFormData({ ...formData, customFields: newCustomFields});
};

 const addCustomField = () => {
 setFormData({ ...formData, customFields: [...formData.customFields, { label: '', value: ''}]});
};

 const handleSubmit = async (e: React.FormEvent) => {
 e.preventDefault();
 const dataToSave = {
 ...formData,
 value: formData.expectedValue,
 closeDate: formData.expectedCloseDate,
};
 if (isEditMode && id) {
 await updateEntity('sales', id, dataToSave);
} else {
 await addEntity('sales', dataToSave);
}
 navigate('/crm/opportunities');
};

 const inputClass =`w-full px-3 py-2 rounded-md border bg-white border-slate-300`;

 return (
 <AdminLayout>
 <div className="max-w-2xl mx-auto">
 <div className={`p-6 rounded-xl border bg-white border-slate-200`}>
 <div className="flex items-center justify-between mb-6">
 <h1 className={`text-xl font-bold text-slate-800`}>{isEditMode ? 'Edit Opportunity' : 'Add Opportunity'}</h1>
 <button onClick={() => navigate('/crm/opportunities')} className="p-1 hover:bg-slate-200 rounded-full">
 <X className="w-5 h-5"/>
 </button>
 </div>

 <form onSubmit={handleSubmit} className="space-y-4">
 <div>
 <label className="block text-sm font-medium mb-1">Product Name *</label>
 <select name="name"value={formData.name} onChange={handleChange} className={inputClass} required>
 <option value="">Select Product</option>
 {products.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
 </select>
 </div>

 <div>
 <label className="block text-sm font-medium mb-1">Company *</label>
 <select name="account"value={formData.account} onChange={handleChange} className={inputClass} required>
 <option value="">Select Company</option>
 {companies.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
 </select>
 </div>

 <div>
 <label className="block text-sm font-medium mb-1">Expected Value *</label>
 <input name="expectedValue"value={formData.expectedValue} onChange={handleChange} className={inputClass} required readOnly />
 </div>

 <div>
 <label className="block text-sm font-medium mb-1">Stage *</label>
 <select name="stage"value={formData.stage} onChange={handleChange} className={inputClass} required>
 <option value="">Select Stage</option>
 {['Negotiation', 'Lost', 'Proposal Send', 'Closed', 'Pending', 'Not Intrested', 'Win'].map(s => <option key={s} value={s}>{s}</option>)}
 </select>
 </div>

 <div>
 <label className="block text-sm font-medium mb-1">Probability *</label>
 <select name="probability"value={formData.probability} onChange={handleChange} className={inputClass} required>
 <option value="">Select Probability</option>
 {['10%', '25%', '50%', '75%', '100%'].map(p => <option key={p} value={p}>{p}</option>)}
 </select>
 </div>

 <div>
 <label className="block text-sm font-medium mb-1">Owner *</label>
 <select name="owner"value={formData.owner} onChange={handleChange} className={inputClass} required>
 <option value="">Select Employee</option>
 {employees.map(e => <option key={e.id} value={e.name}>{e.name}</option>)}
 </select>
 </div>

 <div>
 <label className="block text-sm font-medium mb-1">Expected Close Date *</label>
 <input name="expectedCloseDate"type="date"value={formData.expectedCloseDate} onChange={handleChange} className={inputClass} required />
 </div>

 <div>
 <label className="block text-sm font-medium mb-1">Status *</label>
 <select name="status"value={formData.status} onChange={handleChange} className={inputClass} required>
 <option value="open">Open</option>
 <option value="close">Close</option>
 </select>
 </div>

 {/* Custom Fields */}
 <div className="space-y-2">
 <label className="block text-sm font-medium">Custom Fields</label>
 {formData.customFields.map((field, index) => (
 <div key={index} className="grid grid-cols-2 gap-2">
 <input placeholder="Label"value={field.label} onChange={(e) => handleCustomFieldChange(index, 'label', e.target.value)} className={inputClass} />
 <input placeholder="Value"value={field.value} onChange={(e) => handleCustomFieldChange(index, 'value', e.target.value)} className={inputClass} />
 </div>
 ))}
 <button type="button"onClick={addCustomField} className="text-sm text-red-600 hover:text-red-800">+ Add Custom Field</button>
 </div>

 <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 mt-6">
 <button type="button"onClick={() => navigate('/crm/opportunities')} className="px-6 py-2 bg-slate-100 text-slate-800 rounded-md hover:bg-slate-200">Cancel</button>
 <button type="submit"className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700">{isEditMode ? 'Update Opportunity' : 'Create New'}</button>
 </div>
 </form>
 </div>
 </div>
 </AdminLayout>
 );
}
