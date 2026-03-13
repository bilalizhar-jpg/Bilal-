import React from 'react';
import { Check } from 'lucide-react';
import EmployeeLayout from '../../components/EmployeeLayout';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { useTraining } from '../../context/TrainingContext';
import { BookOpen } from 'lucide-react';

export default function EmployeeTraining() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const { programs, acceptTraining } = useTraining();
  const isDark = theme === 'dark';

  const employeeId = user?.employeeId || user?.id || '';
  const assignedPrograms = programs.filter(p => p.selectedEmployees.includes(employeeId));

  return (
    <EmployeeLayout>
      <div className="space-y-8 max-w-7xl mx-auto">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">My Training Programs</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 text-lg">Track and complete your assigned professional development courses.</p>
        </div>

        <div className={`rounded-2xl border shadow-sm overflow-hidden ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className={`${isDark ? 'bg-slate-800/50' : 'bg-slate-50'} border-b ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
                  <th className="px-6 py-4 text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Program Name</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider text-right">Action</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isDark ? 'divide-slate-800' : 'divide-slate-100'}`}>
                {assignedPrograms.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-slate-500 dark:text-slate-400">
                      <div className="flex flex-col items-center gap-3">
                        <div className="p-3 rounded-full bg-slate-100 dark:bg-slate-800">
                          <BookOpen className="w-6 h-6 text-slate-400" />
                        </div>
                        <p>No training programs assigned to you yet.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  assignedPrograms.map((program) => {
                    const isAccepted = program.acceptedEmployees.includes(employeeId);
                    return (
                      <tr key={program.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors group">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${isDark ? 'bg-indigo-900/30 text-indigo-400' : 'bg-indigo-50 text-indigo-600'}`}>
                              <BookOpen className="w-4 h-4" />
                            </div>
                            <span className="font-bold text-slate-900 dark:text-white group-hover:text-indigo-500 transition-colors">{program.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400 font-medium">{program.trainingType}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            isAccepted 
                              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' 
                              : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                          }`}>
                            {isAccepted ? 'Accepted' : 'Pending'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          {!isAccepted && (
                            <button 
                              onClick={() => acceptTraining(program.id, employeeId)}
                              className="bg-indigo-600 text-white px-4 py-1.5 rounded-lg text-xs font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-500/20 transition-all active:scale-95"
                            >
                              Accept Program
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </EmployeeLayout>
  );
}
