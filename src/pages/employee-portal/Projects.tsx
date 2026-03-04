import React from 'react';
import EmployeeLayout from '../../components/EmployeeLayout';
import { ClipboardList, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export default function EmployeeProjects() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const projects = [
    { id: 1, name: 'Website Redesign', role: 'Frontend Developer', status: 'In Progress', progress: 65, deadline: 'Apr 15, 2026' },
    { id: 2, name: 'Mobile App Launch', role: 'UI/UX Designer', status: 'Planning', progress: 20, deadline: 'Jun 01, 2026' },
    { id: 3, name: 'Q1 Marketing Campaign', role: 'Contributor', status: 'Completed', progress: 100, deadline: 'Mar 01, 2026' },
  ];

  return (
    <EmployeeLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">My Projects</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">View and manage the projects you are currently assigned to.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <div key={project.id} className={`p-6 rounded-xl border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} shadow-sm flex flex-col`}>
              <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-lg ${
                  project.status === 'Completed' ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400' :
                  project.status === 'In Progress' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' :
                  'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400'
                }`}>
                  <ClipboardList className="w-6 h-6" />
                </div>
                <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                  project.status === 'Completed' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                  project.status === 'In Progress' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                  'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                }`}>
                  {project.status}
                </span>
              </div>
              
              <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-1">{project.name}</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Role: {project.role}</p>
              
              <div className="mt-auto">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-600 dark:text-slate-300 font-medium">Progress</span>
                  <span className="text-slate-800 dark:text-white font-bold">{project.progress}%</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 mb-4">
                  <div 
                    className={`h-2 rounded-full ${
                      project.progress === 100 ? 'bg-emerald-500' : 'bg-blue-500'
                    }`} 
                    style={{ width: `${project.progress}%` }}
                  ></div>
                </div>
                
                <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800 pt-4">
                  <Clock className="w-4 h-4" />
                  <span>Deadline: {project.deadline}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </EmployeeLayout>
  );
}
