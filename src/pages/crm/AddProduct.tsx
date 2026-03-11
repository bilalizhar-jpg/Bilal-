import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X } from 'lucide-react';
import AdminLayout from '../../components/AdminLayout';
import { useCompanyData } from '../../context/CompanyDataContext';
import { useTheme } from '../../context/ThemeContext';

export default function AddProduct() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const { addEntity } = useCompanyData();

  const [formData, setFormData] = useState({
    name: '',
    category: '',
    description: '',
    sku: '',
    costPrice: '',
    sellingPrice: '',
    tax: '',
    status: 'Active',
    productId: Math.random().toString(36).substr(2, 9).toUpperCase(),
    customFields: [] as { label: string; value: string }[]
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCustomFieldChange = (index: number, field: 'label' | 'value', value: string) => {
    const newCustomFields = [...formData.customFields];
    newCustomFields[index][field] = value;
    setFormData({ ...formData, customFields: newCustomFields });
  };

  const addCustomField = () => {
    setFormData({ ...formData, customFields: [...formData.customFields, { label: '', value: '' }] });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await addEntity('products', formData);
    navigate('/crm/products');
  };

  const inputClass = `w-full px-3 py-2 rounded-md border ${isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300'}`;

  return (
    <AdminLayout>
      <div className="max-w-2xl mx-auto">
        <div className={`p-6 rounded-xl border ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
          <div className="flex items-center justify-between mb-6">
            <h1 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>Create New Product</h1>
            <button onClick={() => navigate('/crm/products')} className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full">
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Product Name *</label>
              <input name="name" value={formData.name} onChange={handleChange} className={inputClass} required />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Category *</label>
              <input name="category" value={formData.category} onChange={handleChange} className={inputClass} required />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea name="description" value={formData.description} onChange={handleChange} className={inputClass} rows={4} />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">SKU *</label>
              <input name="sku" value={formData.sku} onChange={handleChange} className={inputClass} required />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Cost Price *</label>
                <input name="costPrice" type="number" value={formData.costPrice} onChange={handleChange} className={inputClass} required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Selling Price *</label>
                <input name="sellingPrice" type="number" value={formData.sellingPrice} onChange={handleChange} className={inputClass} required />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Tax % *</label>
              <input name="tax" type="number" value={formData.tax} onChange={handleChange} className={inputClass} required />
            </div>

            {/* Custom Fields */}
            <div className="space-y-2">
              <label className="block text-sm font-medium">Custom Fields</label>
              {formData.customFields.map((field, index) => (
                <div key={index} className="grid grid-cols-2 gap-2">
                  <input placeholder="Label" value={field.label} onChange={(e) => handleCustomFieldChange(index, 'label', e.target.value)} className={inputClass} />
                  <input placeholder="Value" value={field.value} onChange={(e) => handleCustomFieldChange(index, 'value', e.target.value)} className={inputClass} />
                </div>
              ))}
              <button type="button" onClick={addCustomField} className="text-sm text-indigo-600 hover:text-indigo-800">+ Add Custom Field</button>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <button type="button" onClick={() => navigate('/crm/products')} className="px-6 py-2 bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-white rounded-md hover:bg-slate-200 dark:hover:bg-slate-600">Cancel</button>
              <button type="submit" className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700">Create New</button>
            </div>
          </form>
        </div>
      </div>
    </AdminLayout>
  );
}
