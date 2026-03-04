import React from 'react';
import SuperAdminLayout from '../../components/SuperAdminLayout';
import { useSuperAdmin } from '../../context/SuperAdminContext';
import { Lock, Unlock } from 'lucide-react';

export default function SubscriptionPlans() {
  const { companies, toggleMenuAccess } = useSuperAdmin();

  const menus = ['Dashboard', 'Attendance', 'Payroll', 'Recruitment', 'Marketing', 'Procurement'];

  return (
    <SuperAdminLayout>
      <h1 className="text-2xl font-bold mb-6">Subscription Plans & Menu Access</h1>
      
      <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
        <h2 className="text-lg font-bold mb-4">Manage Menu Access</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-sm text-slate-500 border-b border-slate-200 dark:border-slate-700">
                <th className="pb-3">Company</th>
                {menus.map(menu => <th key={menu} className="pb-3 text-center">{menu}</th>)}
              </tr>
            </thead>
            <tbody>
              {companies.map(company => (
                <tr key={company.id} className="border-b border-slate-100 dark:border-slate-700">
                  <td className="py-3 font-medium">{company.name}</td>
                  {menus.map(menu => {
                    const isBlocked = company.blockedMenus.includes(menu);
                    return (
                      <td key={menu} className="py-3 text-center">
                        <button onClick={() => toggleMenuAccess(company.id, menu)} className={isBlocked ? 'text-red-500' : 'text-emerald-500'}>
                          {isBlocked ? <Lock className="w-5 h-5" /> : <Unlock className="w-5 h-5" />}
                        </button>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </SuperAdminLayout>
  );
}
