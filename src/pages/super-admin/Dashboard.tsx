import React from 'react';
import SuperAdminLayout from '../../components/SuperAdminLayout';
import { Building2, Users, UserMinus, AlertTriangle } from 'lucide-react';
import { useSuperAdmin } from '../../context/SuperAdminContext';

export default function SuperAdminDashboard() {
  const { companies } = useSuperAdmin();
  
  const stats = [
    { name: 'Total Companies', value: companies.length, icon: Building2, color: 'bg-indigo-500' },
    { name: 'Active Companies', value: companies.filter(c => c.status === 'active').length, icon: Users, color: 'bg-emerald-500' },
    { name: 'License Expired', value: 0, icon: AlertTriangle, color: 'bg-red-500' },
  ];

  return (
    <SuperAdminLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-black text-white uppercase tracking-tighter">Command Center</h1>
        <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mt-1">Super Admin Overview</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
        {stats.map((stat) => (
          <div key={stat.name} className="glass-card p-6 border border-white/5 flex items-center gap-5 group hover:border-white/10 transition-all">
            <div className={`p-4 rounded-2xl text-white shadow-lg ${stat.color} bg-opacity-20 border border-white/10 group-hover:scale-110 transition-transform`}>
              <stat.icon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{stat.name}</p>
              <p className="text-3xl font-black text-white tracking-tighter">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>
      
      <div className="glass-card p-8 border border-white/5">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-xl font-black text-white uppercase tracking-tight">Recent Deployments</h2>
          <div className="px-3 py-1 bg-white/5 border border-white/10 rounded-lg text-[10px] font-black text-slate-400 uppercase tracking-widest">
            Live Feed
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-white/5">
                <th className="pb-4 px-4">Entity</th>
                <th className="pb-4 px-4">Node</th>
                <th className="pb-4 px-4 text-center">Status</th>
                <th className="pb-4 px-4 text-right">Protocol</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.02]">
              {companies.map(company => (
                <tr key={company.id} className="group hover:bg-white/[0.02] transition-colors">
                  <td className="py-5 px-4">
                    <div className="font-bold text-white uppercase tracking-tight">{company.name}</div>
                  </td>
                  <td className="py-5 px-4 text-sm text-slate-400">{company.email}</td>
                  <td className="py-5 px-4 text-center">
                    <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      Active
                    </span>
                  </td>
                  <td className="py-5 px-4 text-right text-sm text-slate-400 font-mono">
                    {company.subscriptionPlan.toUpperCase()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </SuperAdminLayout>
  );
}
