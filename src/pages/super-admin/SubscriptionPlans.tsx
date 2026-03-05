import React, { useState } from 'react';
import SuperAdminLayout from '../../components/SuperAdminLayout';
import { useSuperAdmin, ALL_MENU_ITEMS } from '../../context/SuperAdminContext';
import { Search } from 'lucide-react';

export default function SubscriptionPlans() {
  const { companies, toggleMenuAccess, updateCompany, updateCompanyStatus } = useSuperAdmin();
  const [search, setSearch] = useState('');

  const filteredCompanies = companies.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <SuperAdminLayout>
      <h1 className="text-2xl font-bold mb-6">Subscription Plans & Menu Access</h1>
      
      <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input 
            type="text" 
            placeholder="Search company filter..." 
            className="w-full pl-10 pr-4 py-2 border rounded-lg"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-x-auto">
        <h2 className="text-lg font-bold mb-4">Manage Menu Access</h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-slate-500 border-b">
              <th className="pb-3 min-w-[150px]">Company Name</th>
              <th className="pb-3 min-w-[150px]">Admin Credentials</th>
              <th className="pb-3 min-w-[100px]">Access</th>
              {ALL_MENU_ITEMS.map(menu => <th key={menu} className="pb-3 px-2 text-center min-w-[100px]">{menu}</th>)}
            </tr>
          </thead>
          <tbody>
            {filteredCompanies.map(company => (
              <tr key={company.id} className="border-b">
                <td className="py-3 font-medium">{company.name}</td>
                <td className="py-3 text-xs text-slate-600">
                  <div>User: {company.adminUsername}</div>
                  <div>Pass: {company.adminPassword}</div>
                </td>
                <td className="py-3 text-center">
                  <button 
                    onClick={() => {
                      const newStatus = company.isActive ? 'inactive' : 'active';
                      updateCompanyStatus(company.id, newStatus);
                    }}
                    className={`px-3 py-1 rounded font-bold text-xs ${company.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}
                  >
                    {company.isActive ? 'Active' : 'Hold'}
                  </button>
                </td>
                {ALL_MENU_ITEMS.map(menu => {
                  const isBlocked = company.blockedMenus.includes(menu);
                  return (
                    <td key={menu} className="py-3 px-2 text-center">
                      <button 
                        onClick={() => toggleMenuAccess(company.id, menu)}
                        className={`px-3 py-1 rounded font-bold text-xs ${isBlocked ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'}`}
                      >
                        {isBlocked ? 'No' : 'Yes'}
                      </button>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </SuperAdminLayout>
  );
}
