import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Printer, Edit2, Save } from 'lucide-react';
import AdminLayout from '../../components/AdminLayout';
import { useCompanyData } from '../../context/CompanyDataContext';
import { useTheme } from '../../context/ThemeContext';

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const { products, updateEntity } = useCompanyData();
  const product = products.find((p: any) => p.id === id);

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(product || {});

  if (!product) return <AdminLayout>Product not found</AdminLayout>;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    await updateEntity('products', id!, formData);
    setIsEditing(false);
  };

  const inputClass = `w-full px-2 py-1 rounded border ${isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300'}`;

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <button onClick={() => navigate('/crm/products')} className="flex items-center gap-2 text-slate-500 hover:text-slate-800 dark:hover:text-slate-300">
            <ArrowLeft className="w-4 h-4" /> Back to Products
          </button>
          <div className="flex gap-2">
            <button onClick={() => window.print()} className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-700 rounded-md hover:bg-slate-200 dark:hover:bg-slate-600">
              <Printer className="w-4 h-4" /> Print
            </button>
            {isEditing ? (
              <button onClick={handleSave} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
                <Save className="w-4 h-4" /> Save
              </button>
            ) : (
              <button onClick={() => setIsEditing(true)} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
                <Edit2 className="w-4 h-4" /> Edit
              </button>
            )}
          </div>
        </div>

        <div className={`p-6 rounded-xl border ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
          <h2 className="text-lg font-bold mb-4">Product Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-1">Product Name</label>
              {isEditing ? <input name="name" value={(formData as any).name} onChange={handleChange} className={inputClass} /> : <p className="font-semibold">{(product as any).name}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Status</label>
              <p className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-700 inline-block">{product.status}</p>
            </div>
          </div>

          <h2 className="text-lg font-bold mt-8 mb-4">Other Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { label: 'Product ID', name: 'productId' },
              { label: 'SKU', name: 'sku' },
              { label: 'Cost Price ($)', name: 'costPrice' },
              { label: 'Selling Price ($)', name: 'sellingPrice' },
              { label: 'Tax (%)', name: 'tax' },
            ].map(field => (
              <div key={field.name}>
                <label className="block text-sm font-medium mb-1">{field.label}</label>
                {isEditing ? (
                  <input name={field.name} value={(formData as any)[field.name] || ''} onChange={handleChange} className={inputClass} />
                ) : (
                  <p>{(product as any)[field.name]}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
