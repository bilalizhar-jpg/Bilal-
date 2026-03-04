import React, { useState } from 'react';
import SuperAdminLayout from '../../components/SuperAdminLayout';
import { useSuperAdmin, Company } from '../../context/SuperAdminContext';
import { Trash2, Plus, Edit2, Save, X, Upload } from 'lucide-react';

export default function CompanyManagement() {
  const { companies, addCompany, deleteCompany, updateCompany } = useSuperAdmin();
  const [newCompany, setNewCompany] = useState({ 
    name: '', email: '', mobile: '', subscriptionPlan: 'Basic', uniqueCode: '',
    logo: '', subsidiary: '', headOffice: '', factoryLocation: ''
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Company | null>(null);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    addCompany({
      ...newCompany,
      uniqueCode: newCompany.uniqueCode || Math.random().toString(36).substring(2, 9).toUpperCase()
    });
    setNewCompany({ name: '', email: '', mobile: '', subscriptionPlan: 'Basic', uniqueCode: '', logo: '', subsidiary: '', headOffice: '', factoryLocation: '' });
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>, isEdit: boolean) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (isEdit && editForm) {
          setEditForm({...editForm, logo: reader.result as string});
        } else {
          setNewCompany({...newCompany, logo: reader.result as string});
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const startEdit = (company: Company) => {
    setEditingId(company.id);
    setEditForm(company);
  };

  const saveEdit = () => {
    if (editForm) {
      updateCompany(editForm);
      setEditingId(null);
      setEditForm(null);
    }
  };

  return (
    <SuperAdminLayout>
      <h1 className="text-2xl font-bold mb-6">Company Management</h1>
      
      <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 mb-8">
        <h2 className="text-lg font-bold mb-4">Register New Company</h2>
        <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input type="text" placeholder="Company Name" className="p-2 border rounded" value={newCompany.name} onChange={e => setNewCompany({...newCompany, name: e.target.value})} required />
          <input type="email" placeholder="Email" className="p-2 border rounded" value={newCompany.email} onChange={e => setNewCompany({...newCompany, email: e.target.value})} required />
          <input type="text" placeholder="Mobile" className="p-2 border rounded" value={newCompany.mobile} onChange={e => setNewCompany({...newCompany, mobile: e.target.value})} required />
          <input type="text" placeholder="Unique Code (Optional)" className="p-2 border rounded" value={newCompany.uniqueCode} onChange={e => setNewCompany({...newCompany, uniqueCode: e.target.value})} />
          <input type="text" placeholder="Subsidiary" className="p-2 border rounded" value={newCompany.subsidiary} onChange={e => setNewCompany({...newCompany, subsidiary: e.target.value})} />
          <input type="text" placeholder="Head Office Location" className="p-2 border rounded" value={newCompany.headOffice} onChange={e => setNewCompany({...newCompany, headOffice: e.target.value})} />
          <input type="text" placeholder="Factory Location" className="p-2 border rounded" value={newCompany.factoryLocation} onChange={e => setNewCompany({...newCompany, factoryLocation: e.target.value})} />
          <label className="flex items-center gap-2 p-2 border rounded cursor-pointer">
            <Upload className="w-4 h-4" /> Upload Logo
            <input type="file" accept="image/*" className="hidden" onChange={(e) => handleLogoUpload(e, false)} />
          </label>
          <select className="p-2 border rounded" value={newCompany.subscriptionPlan} onChange={e => setNewCompany({...newCompany, subscriptionPlan: e.target.value})}>
            <option value="Basic">Basic</option>
            <option value="Pro">Pro</option>
            <option value="Enterprise">Enterprise</option>
          </select>
          <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded flex items-center gap-2 col-span-full">
            <Plus className="w-4 h-4" /> Register Company
          </button>
        </form>
      </div>

      <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
        <h2 className="text-lg font-bold mb-4">Registered Companies</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-sm text-slate-500 border-b border-slate-200 dark:border-slate-700">
                <th className="pb-3">Logo</th>
                <th className="pb-3">Name</th>
                <th className="pb-3">Unique Code</th>
                <th className="pb-3">Admin Credentials</th>
                <th className="pb-3">Access</th>
                <th className="pb-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {companies.map(company => (
                <tr key={company.id} className="border-b border-slate-100 dark:border-slate-700">
                  {editingId === company.id ? (
                    <>
                      <td className="py-3"><input type="file" accept="image/*" onChange={(e) => handleLogoUpload(e, true)} /></td>
                      <td className="py-3"><input className="p-1 border rounded w-full" value={editForm?.name} onChange={e => setEditForm({...editForm!, name: e.target.value})} /></td>
                      <td className="py-3"><input className="p-1 border rounded w-full" value={editForm?.uniqueCode} onChange={e => setEditForm({...editForm!, uniqueCode: e.target.value})} /></td>
                      <td className="py-3 text-xs">
                        <div>User: {company.adminUsername}</div>
                        <div>Pass: {company.adminPassword}</div>
                      </td>
                      <td className="py-3 text-center">
                        <button 
                          onClick={() => updateCompany({ ...company, isActive: !company.isActive })}
                          className={`px-3 py-1 rounded font-bold text-xs ${company.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}
                        >
                          {company.isActive ? 'Active' : 'Hold'}
                        </button>
                      </td>
                      <td className="py-3 flex gap-2">
                        <button onClick={saveEdit} className="text-emerald-500 hover:text-emerald-700"><Save className="w-5 h-5" /></button>
                        <button onClick={() => setEditingId(null)} className="text-slate-500 hover:text-slate-700"><X className="w-5 h-5" /></button>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="py-3"><img src={company.logo} alt="Logo" className="w-10 h-10 object-contain" referrerPolicy="no-referrer" /></td>
                      <td className="py-3">{company.name}</td>
                      <td className="py-3 font-mono">{company.uniqueCode}</td>
                      <td className="py-3 text-xs text-slate-600">
                        <div>User: {company.adminUsername}</div>
                        <div>Pass: {company.adminPassword}</div>
                      </td>
                      <td className="py-3 text-center">
                        <button 
                          onClick={() => updateCompany({ ...company, isActive: !company.isActive })}
                          className={`px-3 py-1 rounded font-bold text-xs ${company.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}
                        >
                          {company.isActive ? 'Active' : 'Hold'}
                        </button>
                      </td>
                      <td className="py-3 flex gap-2">
                        <button onClick={() => startEdit(company)} className="text-indigo-500 hover:text-indigo-700"><Edit2 className="w-5 h-5" /></button>
                        <button onClick={() => deleteCompany(company.id)} className="text-red-500 hover:text-red-700"><Trash2 className="w-5 h-5" /></button>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </SuperAdminLayout>
  );
}
