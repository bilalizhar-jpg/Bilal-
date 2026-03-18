import React, { useState} from 'react';
import SuperAdminLayout from '../../components/SuperAdminLayout';
import { useSuperAdmin, ALL_MENU_ITEMS} from '../../context/SuperAdminContext';
import { Search} from 'lucide-react';

export default function SubscriptionPlans() {
 const { companies, toggleMenuAccess, updateCompany, updateCompanyStatus} = useSuperAdmin();
 const [search, setSearch] = useState('');

 const filteredCompanies = companies.filter(c => 
 c.name.toLowerCase().includes(search.toLowerCase())
 );

 return (
 <SuperAdminLayout>
 <h1 className="text-2xl font-black text-white uppercase tracking-tight mb-8">Subscription Plans</h1>
 
 <div className="bg-[#2A2A3D] p-6 border border-white/5 rounded-2xl shadow-[0_4px_20px_rgba(0,255,204,0.05)] mb-8">
 <div className="relative">
 <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#B0B0C3] w-5 h-5"/>
 <input 
 type="text"
 placeholder="Search company filter..."
 className="w-full pl-12 pr-4 py-3 bg-[#1E1E2F] border border-white/10 rounded-xl text-white placeholder-[#B0B0C3] focus:border-[#00FFCC] focus:ring-1 focus:ring-[#00FFCC] outline-none"
 value={search}
 onChange={e => setSearch(e.target.value)}
 />
 </div>
 </div>

 <div className="bg-[#2A2A3D] p-8 border border-white/5 rounded-2xl shadow-[0_4px_20px_rgba(0,255,204,0.05)]">
 <h2 className="text-xl font-black text-white uppercase tracking-tight mb-4">Subscription Plans</h2>
 <p className="text-[#B0B0C3] text-sm font-medium">Subscription plan management features will be implemented here.</p>
 </div>
 </SuperAdminLayout>
 );
}
