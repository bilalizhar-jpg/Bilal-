import React from 'react';
import EmployeeLayout from '../../components/EmployeeLayout';
import { ClipboardList, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useCompanyData } from '../../context/CompanyDataContext';
import { useAuth } from '../../context/AuthContext';

export default function EmployeeProjects() {
  const { theme } = useTheme();
  const { projects: allProjects } = useCompanyData();
  const { user } = useAuth();
  const isDark = theme === 'dark';

  const projects = allProjects
    .filter(p => 
      (p.assignedTo && (p.assignedTo.includes(user?.name || '') || p.assignedTo.includes(user?.id || '') || p.assignedTo.includes(user?.employeeId || '')))
    )
    .map(p => ({
      id: p.id,
      name: p.companyName,
      role: 'Member',
      status: p.status,
      progress: 0,
      deadline: p.endDate
    }));

  return (
    <EmployeeLayout>
      <div className="space-y-8 max-w-6xl mx-auto">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">My Projects</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 text-lg">View and manage the projects you are currently assigned to.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {projects.map((project) => (
            <div 
              key={project.id} 
              className={`group p-8 rounded-3xl border transition-all hover:shadow-2xl hover:-translate-y-1 ${
                isDark 
                  ? 'bg-slate-900 border-slate-800 hover:border-indigo-500/30' 
                  : 'bg-white border-slate-100 hover:border-indigo-500/30'
              }`}
            >
              <div className="flex justify-between items-start mb-6">
                <div className={`p-4 rounded-2xl transition-colors ${
                  project.status === 'Completed' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400' :
                  project.status === 'In Progress' ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400' :
                  'bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400'
                }`}>
                  <ClipboardList className="w-8 h-8" />
                </div>
                <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                  project.status === 'Completed' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                  project.status === 'In Progress' ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400' :
                  'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                }`}>
                  {project.status}
                </span>
              </div>
              
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 group-hover:text-indigo-500 transition-colors">{project.name}</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm mb-8 font-medium">Role: {project.role}</p>
              
              <div className="space-y-6">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest text-[10px]">Progress</span>
                    <span className="text-slate-900 dark:text-white font-bold">{project.progress}%</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2.5 overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-1000 ${
                        project.progress === 100 ? 'bg-emerald-500' : 'bg-indigo-600'
                      }`} 
                      style={{ width: `${project.progress}%` }}
                    ></div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800 pt-6">
                  <Clock className="w-4 h-4" />
                  <span className="font-medium">Deadline: {project.deadline}</span>
                </div>
              </div>
            </div>
          ))}
          
          {projects.length === 0 && (
            <div className={`col-span-full py-20 text-center rounded-3xl border-2 border-dashed ${
              isDark ? 'border-slate-800 text-slate-500' : 'border-slate-200 text-slate-400'
            }`}>
              <div className="inline-flex p-6 rounded-full bg-slate-100 dark:bg-slate-800 mb-6">
                <ClipboardList className="w-12 h-12 opacity-50" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white">No projects assigned</h3>
              <p className="mt-2">You don't have any active projects at the moment.</p>
            </div>
          )}
        </div>
      </div>
    </EmployeeLayout>
  );
}
