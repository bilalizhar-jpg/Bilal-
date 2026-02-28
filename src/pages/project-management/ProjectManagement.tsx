import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Trash2, 
  Printer, 
  Download, 
  Save, 
  Edit3, 
  Search,
  Calendar,
  Clock,
  Briefcase,
  User,
  CheckCircle2,
  AlertCircle,
  Layout,
  DollarSign,
  Percent,
  Calculator,
  PlusCircle,
  MoreVertical
} from 'lucide-react';
import AdminLayout from '../../components/AdminLayout';
import { useTheme } from '../../context/ThemeContext';
import { motion, AnimatePresence } from 'motion/react';

interface Project {
  id: string;
  companyName: string;
  hrPersonDetails: string;
  contactPersonDetails: string;
  projectType: string;
  duration: string;
  startDate: string;
  endDate: string;
  timeline: string;
  assignedTo: string;
  status: 'Onboarding' | 'In Progress' | 'Completed' | 'On Hold';
}

interface Task {
  id: string;
  projectId: string;
  title: string;
  description: string;
  assignee: string;
  priority: 'Low' | 'Medium' | 'High';
  status: 'To Do' | 'In Progress' | 'Review' | 'Done';
}

interface Sale {
  id: string;
  sellerName: string;
  productName: string;
  saleAmount: number;
  commissionPercentage: number;
  commissionAmount: number;
  payViaPayroll: boolean;
  date: string;
}

export default function ProjectManagement() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [activeTab, setActiveTab] = useState<'projects' | 'tasks' | 'sales'>('projects');

  // Projects State
  const [projects, setProjects] = useState<Project[]>([
    { 
      id: 'p1', 
      companyName: 'TechCorp Solutions', 
      hrPersonDetails: 'Sarah Miller (hr@techcorp.com)', 
      contactPersonDetails: 'Mike Ross (+1 555-0123)', 
      projectType: 'Software Development', 
      duration: '6 Months', 
      startDate: '2024-03-01', 
      endDate: '2024-09-01', 
      timeline: 'Phase 1: Planning, Phase 2: Dev', 
      assignedTo: 'Engineering Team A',
      status: 'In Progress'
    }
  ]);

  // Tasks State
  const [tasks, setTasks] = useState<Task[]>([
    { id: 't1', projectId: 'p1', title: 'Initial Client Meeting', description: 'Discuss project requirements and scope.', assignee: 'John Doe', priority: 'High', status: 'Done' },
    { id: 't2', projectId: 'p1', title: 'Architecture Design', description: 'Create system architecture diagrams.', assignee: 'Jane Smith', priority: 'High', status: 'In Progress' },
    { id: 't3', projectId: 'p1', title: 'Setup Dev Environment', description: 'Configure servers and CI/CD pipelines.', assignee: 'Bob Wilson', priority: 'Medium', status: 'To Do' },
  ]);

  // Sales State
  const [sales, setSales] = useState<Sale[]>([
    { id: 's1', sellerName: 'Alice Green', productName: 'Enterprise ERP', saleAmount: 50000, commissionPercentage: 5, commissionAmount: 2500, payViaPayroll: true, date: '2024-02-25' }
  ]);

  const [isAddingProject, setIsAddingProject] = useState(false);
  const [newProject, setNewProject] = useState<Partial<Project>>({
    companyName: '', hrPersonDetails: '', contactPersonDetails: '', projectType: '', duration: '', startDate: '', endDate: '', timeline: '', assignedTo: '', status: 'Onboarding'
  });

  const handleAddProject = () => {
    const project: Project = {
      id: Math.random().toString(36).substr(2, 9),
      ...newProject as Project
    };
    setProjects([...projects, project]);
    setIsAddingProject(false);
    setNewProject({ companyName: '', hrPersonDetails: '', contactPersonDetails: '', projectType: '', duration: '', startDate: '', endDate: '', timeline: '', assignedTo: '', status: 'Onboarding' });
  };

  const updateTaskStatus = (taskId: string, newStatus: Task['status']) => {
    setTasks(tasks.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
  };

  const addSale = () => {
    const newSale: Sale = {
      id: Math.random().toString(36).substr(2, 9),
      sellerName: 'New Seller',
      productName: '',
      saleAmount: 0,
      commissionPercentage: 0,
      commissionAmount: 0,
      payViaPayroll: true,
      date: new Date().toISOString().split('T')[0]
    };
    setSales([...sales, newSale]);
  };

  const updateSale = (id: string, field: keyof Sale, value: any) => {
    setSales(sales.map(s => {
      if (s.id === id) {
        const updatedSale = { ...s, [field]: value };
        if (field === 'saleAmount' || field === 'commissionPercentage') {
          updatedSale.commissionAmount = (updatedSale.saleAmount * updatedSale.commissionPercentage) / 100;
        }
        return updatedSale;
      }
      return s;
    }));
  };

  return (
    <AdminLayout>
      <div className="space-y-6 pb-12">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-slate-800 dark:text-white">Business Development & Project Management</h2>
          <div className="flex gap-2">
            <button className="bg-slate-600 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-slate-700">
              <Printer className="w-4 h-4" />
              Print Report
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-200 dark:border-slate-800">
          <TabButton active={activeTab === 'projects'} onClick={() => setActiveTab('projects')} label="Projects" icon={<Briefcase className="w-4 h-4" />} isDark={isDark} />
          <TabButton active={activeTab === 'tasks'} onClick={() => setActiveTab('tasks')} label="Task Board" icon={<Layout className="w-4 h-4" />} isDark={isDark} />
          <TabButton active={activeTab === 'sales'} onClick={() => setActiveTab('sales')} label="Sales & Commission" icon={<DollarSign className="w-4 h-4" />} isDark={isDark} />
        </div>

        <AnimatePresence mode="wait">
          {activeTab === 'projects' && (
            <motion.div 
              key="projects" 
              initial={{ opacity: 0, y: 10 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold text-slate-800 dark:text-white">Project Portfolio</h3>
                <button 
                  onClick={() => setIsAddingProject(true)}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-indigo-700"
                >
                  <Plus className="w-4 h-4" />
                  New Project
                </button>
              </div>

              {isAddingProject && (
                <div className={`p-6 rounded-xl border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} shadow-lg space-y-4`}>
                  <h4 className="font-bold text-indigo-600 uppercase text-xs tracking-widest">Add New Project Details</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <InputField label="Company Name" value={newProject.companyName} onChange={(v) => setNewProject({...newProject, companyName: v})} isDark={isDark} />
                    <InputField label="HR Person Details" value={newProject.hrPersonDetails} onChange={(v) => setNewProject({...newProject, hrPersonDetails: v})} isDark={isDark} />
                    <InputField label="Contact Person Details" value={newProject.contactPersonDetails} onChange={(v) => setNewProject({...newProject, contactPersonDetails: v})} isDark={isDark} />
                    <InputField label="Type of Project" value={newProject.projectType} onChange={(v) => setNewProject({...newProject, projectType: v})} isDark={isDark} />
                    <InputField label="Duration" value={newProject.duration} onChange={(v) => setNewProject({...newProject, duration: v})} isDark={isDark} />
                    <InputField label="Assigned To" value={newProject.assignedTo} onChange={(v) => setNewProject({...newProject, assignedTo: v})} isDark={isDark} />
                    <InputField label="Starting Date" type="date" value={newProject.startDate} onChange={(v) => setNewProject({...newProject, startDate: v})} isDark={isDark} />
                    <InputField label="Ending Date" type="date" value={newProject.endDate} onChange={(v) => setNewProject({...newProject, endDate: v})} isDark={isDark} />
                    <div className="md:col-span-3">
                      <label className="text-[10px] font-bold text-slate-500 uppercase mb-1 block">Timeline / Milestones</label>
                      <textarea 
                        value={newProject.timeline}
                        onChange={(e) => setNewProject({...newProject, timeline: e.target.value})}
                        className={`w-full border rounded px-3 py-2 text-sm ${isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200'}`}
                        placeholder="e.g. Phase 1: Planning (Month 1), Phase 2: Design (Month 2)..."
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <button onClick={() => setIsAddingProject(false)} className="px-4 py-2 text-sm font-bold text-slate-500 hover:text-slate-700">Cancel</button>
                    <button onClick={handleAddProject} className="bg-indigo-600 text-white px-6 py-2 rounded-lg text-sm font-bold hover:bg-indigo-700">Add Project</button>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 gap-4">
                {projects.map(project => (
                  <div key={project.id} className={`p-6 rounded-xl border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} shadow-sm hover:shadow-md transition-shadow relative group`}>
                    <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-1.5 bg-amber-400 text-white rounded hover:bg-amber-500"><Edit3 className="w-4 h-4" /></button>
                      <button className="p-1.5 bg-red-500 text-white rounded hover:bg-red-600"><Trash2 className="w-4 h-4" /></button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                      <div className="md:col-span-2 space-y-2">
                        <div className="flex items-center gap-2">
                          <Briefcase className="w-5 h-5 text-indigo-600" />
                          <h4 className="text-xl font-bold text-slate-800 dark:text-white">{project.companyName}</h4>
                        </div>
                        <p className="text-sm text-slate-500 font-medium">{project.projectType}</p>
                        <div className="grid grid-cols-2 gap-4 mt-4">
                          <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase">HR Contact</p>
                            <p className="text-xs text-slate-700 dark:text-slate-300">{project.hrPersonDetails}</p>
                          </div>
                          <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase">Contact Person</p>
                            <p className="text-xs text-slate-700 dark:text-slate-300">{project.contactPersonDetails}</p>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-slate-400" />
                          <span className="text-xs font-medium text-slate-600 dark:text-slate-400">{project.startDate} to {project.endDate}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-slate-400" />
                          <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Duration: {project.duration}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-slate-400" />
                          <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Assigned: {project.assignedTo}</span>
                        </div>
                      </div>
                      <div className="flex flex-col justify-between items-end">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${
                          project.status === 'In Progress' ? 'bg-blue-100 text-blue-700' :
                          project.status === 'Completed' ? 'bg-green-100 text-green-700' :
                          'bg-amber-100 text-amber-700'
                        }`}>
                          {project.status}
                        </span>
                        <div className="w-full mt-4">
                          <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Timeline Progress</p>
                          <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                            <div className="h-full bg-indigo-600 rounded-full" style={{ width: '45%' }}></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'tasks' && (
            <motion.div 
              key="tasks" 
              initial={{ opacity: 0, x: 20 }} 
              animate={{ opacity: 1, x: 0 }} 
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold text-slate-800 dark:text-white">Daily Task Report & Board</h3>
                <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-indigo-700">
                  <PlusCircle className="w-4 h-4" />
                  Add Task
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 h-[calc(100vh-300px)] min-h-[500px]">
                <TaskColumn title="To Do" status="To Do" tasks={tasks.filter(t => t.status === 'To Do')} onStatusChange={updateTaskStatus} isDark={isDark} />
                <TaskColumn title="In Progress" status="In Progress" tasks={tasks.filter(t => t.status === 'In Progress')} onStatusChange={updateStatus => updateTaskStatus} isDark={isDark} />
                <TaskColumn title="Review" status="Review" tasks={tasks.filter(t => t.status === 'Review')} onStatusChange={updateTaskStatus} isDark={isDark} />
                <TaskColumn title="Done" status="Done" tasks={tasks.filter(t => t.status === 'Done')} onStatusChange={updateTaskStatus} isDark={isDark} />
              </div>
            </motion.div>
          )}

          {activeTab === 'sales' && (
            <motion.div 
              key="sales" 
              initial={{ opacity: 0, y: 10 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold text-slate-800 dark:text-white">Sales Commission Tracker</h3>
                <button 
                  onClick={addSale}
                  className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-emerald-700"
                >
                  <Plus className="w-4 h-4" />
                  Add New Sale
                </button>
              </div>

              <div className={`rounded-xl border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} shadow-sm overflow-hidden`}>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className={`${isDark ? 'bg-slate-800/50' : 'bg-slate-50'} border-b border-slate-100 dark:border-slate-800`}>
                        <th className="px-4 py-3 text-xs font-bold text-slate-600 dark:text-slate-400 uppercase">Seller Name</th>
                        <th className="px-4 py-3 text-xs font-bold text-slate-600 dark:text-slate-400 uppercase">Product</th>
                        <th className="px-4 py-3 text-xs font-bold text-slate-600 dark:text-slate-400 uppercase">Sale Amount ($)</th>
                        <th className="px-4 py-3 text-xs font-bold text-slate-600 dark:text-slate-400 uppercase">Comm. %</th>
                        <th className="px-4 py-3 text-xs font-bold text-slate-600 dark:text-slate-400 uppercase">Comm. Amount ($)</th>
                        <th className="px-4 py-3 text-xs font-bold text-slate-600 dark:text-slate-400 uppercase">Pay via Payroll</th>
                        <th className="px-4 py-3 text-xs font-bold text-slate-600 dark:text-slate-400 uppercase text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {sales.map((sale) => (
                        <tr key={sale.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                          <td className="px-4 py-3 text-sm">
                            <input 
                              type="text" 
                              value={sale.sellerName}
                              onChange={(e) => updateSale(sale.id, 'sellerName', e.target.value)}
                              className={`w-full bg-transparent border-none outline-none font-medium ${isDark ? 'text-white' : 'text-slate-800'}`}
                            />
                          </td>
                          <td className="px-4 py-3 text-sm">
                            <input 
                              type="text" 
                              value={sale.productName}
                              onChange={(e) => updateSale(sale.id, 'productName', e.target.value)}
                              className={`w-full bg-transparent border-none outline-none ${isDark ? 'text-slate-300' : 'text-slate-600'}`}
                            />
                          </td>
                          <td className="px-4 py-3 text-sm">
                            <input 
                              type="number" 
                              value={sale.saleAmount}
                              onChange={(e) => updateSale(sale.id, 'saleAmount', parseFloat(e.target.value))}
                              className={`w-full bg-transparent border-none outline-none font-bold text-indigo-600`}
                            />
                          </td>
                          <td className="px-4 py-3 text-sm">
                            <div className="flex items-center gap-1">
                              <input 
                                type="number" 
                                value={sale.commissionPercentage}
                                onChange={(e) => updateSale(sale.id, 'commissionPercentage', parseFloat(e.target.value))}
                                className={`w-12 bg-transparent border-none outline-none text-center`}
                              />
                              <Percent className="w-3 h-3 text-slate-400" />
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm">
                            <div className="flex items-center gap-1 font-bold text-emerald-600">
                              <Calculator className="w-3 h-3" />
                              {sale.commissionAmount.toLocaleString()}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm text-center">
                            <input 
                              type="checkbox" 
                              checked={sale.payViaPayroll}
                              onChange={(e) => updateSale(sale.id, 'payViaPayroll', e.target.checked)}
                              className="w-4 h-4 text-indigo-600 rounded"
                            />
                          </td>
                          <td className="px-4 py-3 text-sm text-right">
                            <button 
                              onClick={() => setSales(sales.filter(s => s.id !== sale.id))}
                              className="p-1.5 text-red-500 hover:bg-red-50 rounded"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg border border-indigo-100 dark:border-indigo-800">
                <p className="text-xs text-indigo-600 dark:text-indigo-400 italic">
                  * Commission amounts are automatically calculated based on Sale Amount and Commission Percentage.
                  If "Pay via Payroll" is checked, this amount will be automatically reflected in the employee's next salary generation.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AdminLayout>
  );
}

function TabButton({ active, onClick, label, icon, isDark }: any) {
  return (
    <button 
      onClick={onClick}
      className={`flex items-center gap-2 px-6 py-3 text-sm font-bold transition-all relative ${
        active 
          ? 'text-indigo-600' 
          : 'text-slate-500 hover:text-slate-700'
      }`}
    >
      {icon}
      {label}
      {active && (
        <motion.div 
          layoutId="activeTab" 
          className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600"
        />
      )}
    </button>
  );
}

function InputField({ label, value, onChange, type = 'text', isDark }: any) {
  return (
    <div>
      <label className="text-[10px] font-bold text-slate-500 uppercase mb-1 block">{label}</label>
      <input 
        type={type} 
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full border rounded px-3 py-1.5 text-sm outline-none focus:ring-1 focus:ring-indigo-500 ${isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200'}`}
      />
    </div>
  );
}

function TaskColumn({ title, tasks, isDark, onStatusChange }: any) {
  return (
    <div className={`flex flex-col h-full rounded-xl border ${isDark ? 'bg-slate-900/50 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
      <div className="p-3 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest">{title}</h4>
        <span className="bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[10px] px-2 py-0.5 rounded-full">{tasks.length}</span>
      </div>
      <div className="flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar">
        {tasks.map((task: any) => (
          <div key={task.id} className={`p-3 rounded-lg border ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'} shadow-sm hover:shadow-md transition-shadow group`}>
            <div className="flex justify-between items-start mb-2">
              <span className={`text-[8px] font-bold uppercase px-1.5 py-0.5 rounded ${
                task.priority === 'High' ? 'bg-red-100 text-red-700' :
                task.priority === 'Medium' ? 'bg-amber-100 text-amber-700' :
                'bg-blue-100 text-blue-700'
              }`}>
                {task.priority}
              </span>
              <button className="text-slate-400 hover:text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity">
                <MoreVertical className="w-3 h-3" />
              </button>
            </div>
            <h5 className="text-sm font-bold text-slate-800 dark:text-white mb-1">{task.title}</h5>
            <p className="text-xs text-slate-500 line-clamp-2 mb-3">{task.description}</p>
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-1">
                <div className="w-5 h-5 rounded-full bg-indigo-100 flex items-center justify-center text-[10px] font-bold text-indigo-600">
                  {task.assignee.charAt(0)}
                </div>
                <span className="text-[10px] text-slate-400">{task.assignee}</span>
              </div>
              <div className="flex gap-1">
                <button className="text-slate-300 hover:text-indigo-600"><CheckCircle2 className="w-3.5 h-3.5" /></button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
