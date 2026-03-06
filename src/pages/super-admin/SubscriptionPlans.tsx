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
      <h1 className="text-2xl font-bold mb-6">Subscription Plans</h1>
      
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

      <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
        <h2 className="text-lg font-bold mb-4">Subscription Plans</h2>
        <p className="text-slate-500 text-sm">Subscription plan management features will be implemented here.</p>
      </div>
    </SuperAdminLayout>
  );
}
