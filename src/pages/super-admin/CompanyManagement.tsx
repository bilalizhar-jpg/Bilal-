import React, { useState } from 'react';
import SuperAdminLayout from '../../components/SuperAdminLayout';
import { useSuperAdmin } from '../../context/SuperAdminContext';
import { Trash2, Plus } from 'lucide-react';

export default function CompanyManagement() {
  const { companies, addCompany, deleteCompany } = useSuperAdmin();
  const [newCompany, setNewCompany] = useState({ name: '', email: '', mobile: '', subscriptionPlan: 'Basic' });

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    addCompany(newCompany);
    setNewCompany({ name: '', email: '', mobile: '', subscriptionPlan: 'Basic' });
  };

  return (
    <SuperAdminLayout>
      <h1 className="text-2xl font-bold mb-6">Company Management</h1>
      
      <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 mb-8">
        <h2 className="text-lg font-bold mb-4">Register New Company</h2>
        <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input type="text" placeholder="Company Name" className="p-2 border rounded" value={newCompany.name} onChange={e => setNewCompany({...newCompany, name: e.target.value})} required />
          <input type="email" placeholder="Email" className="p-2 border rounded" value={newCompany.email} onChange={e => setNewCompany({...newCompany, email: e.target.value})} required />
          <input type="text" placeholder="Mobile" className="p-2 border rounded" value={newCompany.mobile} onChange={e => setNewCompany({...newCompany, mobile: e.target.value})} required />
          <select className="p-2 border rounded" value={newCompany.subscriptionPlan} onChange={e => setNewCompany({...newCompany, subscriptionPlan: e.target.value})}>
            <option value="Basic">Basic</option>
            <option value="Pro">Pro</option>
            <option value="Enterprise">Enterprise</option>
          </select>
          <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded flex items-center gap-2">
            <Plus className="w-4 h-4" /> Register Company
          </button>
        </form>
      </div>

      <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
        <h2 className="text-lg font-bold mb-4">Registered Companies</h2>
        <table className="w-full">
          <thead>
            <tr className="text-left text-sm text-slate-500 border-b border-slate-200 dark:border-slate-700">
              <th className="pb-3">Company Name</th>
              <th className="pb-3">Email</th>
              <th className="pb-3">Mobile</th>
              <th className="pb-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {companies.map(company => (
              <tr key={company.id} className="border-b border-slate-100 dark:border-slate-700">
                <td className="py-3">{company.name}</td>
                <td className="py-3">{company.email}</td>
                <td className="py-3">{company.mobile}</td>
                <td className="py-3">
                  <button onClick={() => deleteCompany(company.id)} className="text-red-500 hover:text-red-700">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </SuperAdminLayout>
  );
}
