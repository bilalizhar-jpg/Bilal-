import React, { useState } from 'react';
import { Shield, Plus, UserPlus } from 'lucide-react';
import AdminLayout from '../../components/AdminLayout';
import { useEmployees } from '../../context/EmployeeContext';
import { ADMIN_MENU_ITEMS } from '../../constants';
import { useTheme } from '../../context/ThemeContext';

export default function Permissions() {
  const { employees, updateEmployee } = useEmployees();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [selectedEmployee, setSelectedEmployee] = useState<string>('');

  const grantAccess = (menuName: string, employeeId: string) => {
    const employee = employees.find(e => e.id === employeeId);
    if (!employee) return;

    const allowedMenus = employee.allowedMenus || [];
    if (!allowedMenus.includes(menuName)) {
      updateEmployee(employeeId, { allowedMenus: [...allowedMenus, menuName] });
    }
  };

  const revokeAccess = (menuName: string, employeeId: string) => {
    const employee = employees.find(e => e.id === employeeId);
    if (!employee) return;

    const allowedMenus = employee.allowedMenus || [];
    updateEmployee(employeeId, { allowedMenus: allowedMenus.filter(m => m !== menuName) });
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <Shield className="w-6 h-6 text-indigo-500" />
            Rules & Permissions
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Manage menu access for employees.</p>
        </div>

        <div className={`rounded-xl border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} shadow-sm overflow-hidden`}>
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-4 py-3 font-semibold text-slate-700 dark:text-slate-300">Menu Name</th>
                <th className="px-4 py-3 font-semibold text-slate-700 dark:text-slate-300">Permission Granted</th>
                <th className="px-4 py-3 font-semibold text-slate-700 dark:text-slate-300">Permission Not Granted</th>
                <th className="px-4 py-3 font-semibold text-slate-700 dark:text-slate-300">Grant Access</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {ADMIN_MENU_ITEMS.map(menu => {
                const granted = employees.filter(e => e.allowedMenus?.includes(menu.name));
                const notGranted = employees.filter(e => !e.allowedMenus?.includes(menu.name));

                return (
                  <tr key={menu.name} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="px-4 py-3 font-medium text-slate-800 dark:text-slate-200">{menu.name}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {granted.map(e => (
                          <span key={e.id} className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 px-2 py-1 rounded text-xs flex items-center gap-1">
                            {e.name}
                            <button onClick={() => revokeAccess(menu.name, e.id)} className="text-emerald-600 hover:text-emerald-900">×</button>
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {notGranted.map(e => (
                          <span key={e.id} className="bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-400 px-2 py-1 rounded text-xs">
                            {e.name}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <select 
                          className={`border rounded px-2 py-1 text-xs ${isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-300'}`}
                          onChange={(e) => setSelectedEmployee(e.target.value)}
                          value={selectedEmployee}
                        >
                          <option value="">Select Employee</option>
                          {notGranted.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                        </select>
                        <button 
                          onClick={() => {
                            if (selectedEmployee) {
                              grantAccess(menu.name, selectedEmployee);
                              setSelectedEmployee('');
                            }
                          }}
                          className="bg-indigo-600 text-white p-1.5 rounded hover:bg-indigo-700"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}
