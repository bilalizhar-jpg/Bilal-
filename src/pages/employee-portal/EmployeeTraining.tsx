import React from 'react';
import { Check } from 'lucide-react';
import AdminLayout from '../../components/AdminLayout';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { useTraining } from '../../context/TrainingContext';

export default function EmployeeTraining() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const { programs, acceptTraining } = useTraining();
  const isDark = theme === 'dark';

  const employeeId = user?.employeeId || user?.id || '';
  const assignedPrograms = programs.filter(p => p.selectedEmployees.includes(employeeId));

  return (
    <AdminLayout>
      <div className="space-y-6">
        <h2 className="text-xl font-bold text-slate-800 dark:text-white">My Training Programs</h2>
        <div className={`rounded-xl border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} shadow-sm overflow-hidden`}>
          <table className="w-full text-sm">
            <thead className={`${isDark ? 'bg-slate-800' : 'bg-slate-50'}`}>
              <tr>
                <th className="px-4 py-3 text-left font-bold text-slate-500">Name</th>
                <th className="px-4 py-3 text-left font-bold text-slate-500">Type</th>
                <th className="px-4 py-3 text-left font-bold text-slate-500">Status</th>
                <th className="px-4 py-3 text-left font-bold text-slate-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {assignedPrograms.map((program) => {
                const isAccepted = program.acceptedEmployees.includes(employeeId);
                return (
                  <tr key={program.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="px-4 py-3 font-medium">{program.name}</td>
                    <td className="px-4 py-3">{program.trainingType}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${isAccepted ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'}`}>
                        {isAccepted ? 'Accepted' : 'Pending'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {!isAccepted && (
                        <button 
                          onClick={() => acceptTraining(program.id, employeeId)}
                          className="bg-emerald-600 text-white px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1 hover:bg-emerald-700"
                        >
                          <Check className="w-3 h-3" />
                          Accept
                        </button>
                      )}
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
