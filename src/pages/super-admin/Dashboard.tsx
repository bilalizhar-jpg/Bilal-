import React from 'react';
import SuperAdminLayout from '../../components/SuperAdminLayout';
import { Building2, Users, UserMinus, AlertTriangle } from 'lucide-react';
import { useSuperAdmin } from '../../context/SuperAdminContext';

export default function SuperAdminDashboard() {
  const { companies } = useSuperAdmin();
  
  const stats = [
    { name: 'Total Companies', value: companies.length, icon: Building2, color: 'bg-indigo-500' },
    { name: 'Active Companies', value: companies.filter(c => c.status === 'active').length, icon: Users, color: 'bg-emerald-500' },
    { name: 'Inactive Companies', value: companies.filter(c => c.status === 'inactive').length, icon: UserMinus, color: 'bg-amber-500' },
    { name: 'License Expired', value: 0, icon: AlertTriangle, color: 'bg-red-500' },
  ];

  return (
    <SuperAdminLayout>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => (
          <div key={stat.name} className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 flex items-center gap-4">
            <div className={`p-3 rounded-lg text-white ${stat.color}`}>
              <stat.icon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">{stat.name}</p>
              <p className="text-2xl font-bold">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>
      
      <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
        <h2 className="text-lg font-bold mb-4">Recently Registered Companies</h2>
        <table className="w-full">
          <thead>
            <tr className="text-left text-sm text-slate-500 border-b border-slate-200 dark:border-slate-700">
              <th className="pb-3">Company Name</th>
              <th className="pb-3">Email</th>
              <th className="pb-3">Status</th>
              <th className="pb-3">Subscription</th>
            </tr>
          </thead>
          <tbody>
            {companies.map(company => (
              <tr key={company.id} className="border-b border-slate-100 dark:border-slate-700">
                <td className="py-3">{company.name}</td>
                <td className="py-3">{company.email}</td>
                <td className="py-3">
                  <span className={`px-2 py-1 rounded-full text-xs ${company.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                    {company.status}
                  </span>
                </td>
                <td className="py-3">{company.subscriptionPlan}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </SuperAdminLayout>
  );
}
