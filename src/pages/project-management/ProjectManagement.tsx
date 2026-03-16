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
  MoreVertical,
  GripVertical,
  X
} from 'lucide-react';
import AdminLayout from '../../components/AdminLayout';
import { useTheme } from '../../context/ThemeContext';
import { useSettings } from '../../context/SettingsContext';
import { useCompanyData } from '../../context/CompanyDataContext';
import { motion, AnimatePresence } from 'motion/react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';

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
  const settings = useSettings();
  const { projects: rawProjects, tasks: rawTasks, sales: rawSales, addEntity, updateEntity, deleteEntity } = useCompanyData();
  const projects = rawProjects as unknown as Project[];
  const tasks = rawTasks as unknown as Task[];
  const sales = rawSales as unknown as Sale[];
  const isDark = theme === 'dark';
  const [activeTab, setActiveTab] = useState<'projects' | 'tasks' | 'sales'>('projects');

  const [isAddingProject, setIsAddingProject] = useState(false);
  const [newProject, setNewProject] = useState<Partial<Project>>({
    companyName: '', hrPersonDetails: '', contactPersonDetails: '', projectType: '', duration: '', startDate: '', endDate: '', timeline: '', assignedTo: '', status: 'Onboarding'
  });

  const [editingProject, setEditingProject] = useState<Project | null>(null);

  const handleSaveProject = async () => {
    if (editingProject) {
      await updateEntity('projects', editingProject.id, newProject);
    } else {
      await addEntity('projects', newProject);
    }
    setIsAddingProject(false);
    setEditingProject(null);
    setNewProject({ companyName: '', hrPersonDetails: '', contactPersonDetails: '', projectType: '', duration: '', startDate: '', endDate: '', timeline: '', assignedTo: '', status: 'Onboarding' });
  };

  const handleEditProject = (project: Project) => {
    setEditingProject(project);
    setNewProject(project);
    setIsAddingProject(true);
  };

  const handleDeleteProject = async (projectId: string) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      await deleteEntity('projects', projectId);
    }
  };

  const updateTaskStatus = async (taskId: string, newStatus: Task['status']) => {
    await updateEntity('tasks', taskId, { status: newStatus });
  };

  const addSale = async () => {
    const newSale = {
      sellerName: 'New Seller',
      productName: '',
      saleAmount: 0,
      commissionPercentage: 0,
      commissionAmount: 0,
      payViaPayroll: true,
      date: new Date().toISOString().split('T')[0]
    };
    await addEntity('sales', newSale);
  };

  const updateSale = async (id: string, field: keyof Sale, value: any) => {
    const sale = sales.find(s => s.id === id);
    if (!sale) return;

    const updatedSale = { ...sale, [field]: value };
    if (field === 'saleAmount' || field === 'commissionPercentage') {
      updatedSale.commissionAmount = (updatedSale.saleAmount * updatedSale.commissionPercentage) / 100;
    }
    await updateEntity('sales', id, updatedSale);
  };

  const onDragEnd = async (result: DropResult) => {
    if (!result.destination) return;
    
    const { source, destination, draggableId } = result;
    
    if (source.droppableId !== destination.droppableId) {
      const newStatus = destination.droppableId as Task['status'];
      await updateEntity('tasks', draggableId, { status: newStatus });
    }
  };

  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setIsTaskModalOpen(true);
  };

  const handleDeleteTask = async (taskId: string) => {
    await deleteEntity('tasks', taskId);
  };

  const handleSaveTask = async () => {
    if (editingTask) {
      if (editingTask.id && tasks.find(t => t.id === editingTask.id)) {
        await updateEntity('tasks', editingTask.id, editingTask);
      } else {
        await addEntity('tasks', editingTask);
      }
      setIsTaskModalOpen(false);
      setEditingTask(null);
    }
  };

  const handleCreateTask = () => {
    setEditingTask({
      id: '',
      projectId: projects[0]?.id || '',
      title: 'New Task',
      description: '',
      assignee: 'Unassigned',
      priority: 'Medium',
      status: 'To Do'
    });
    setIsTaskModalOpen(true);
  };

  return (
    <AdminLayout>
      <div className="space-y-8 pb-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-3xl font-black text-white uppercase tracking-tighter">Operations Hub</h2>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mt-1">Business Development & Project Management</p>
          </div>
          <div className="flex gap-3">
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="bg-white/5 border border-white/10 text-white px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-white/10 transition-all"
            >
              <Printer className="w-4 h-4" />
              Export Report
            </motion.button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 p-1 bg-white/5 border border-white/10 rounded-2xl w-fit">
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
                  onClick={() => {
                    setIsAddingProject(true);
                    setEditingProject(null);
                    setNewProject({ companyName: '', hrPersonDetails: '', contactPersonDetails: '', projectType: '', duration: '', startDate: '', endDate: '', timeline: '', assignedTo: '', status: 'Onboarding' });
                  }}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-indigo-700"
                >
                  <Plus className="w-4 h-4" />
                  New Project
                </button>
              </div>

              {isAddingProject && (
                <div className={`p-6 rounded-xl border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} shadow-lg space-y-4`}>
                  <h4 className="font-bold text-indigo-600 uppercase text-xs tracking-widest">{editingProject ? 'Edit Project Details' : 'Add New Project Details'}</h4>
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
                    <button onClick={handleSaveProject} className="bg-indigo-600 text-white px-6 py-2 rounded-lg text-sm font-bold hover:bg-indigo-700">{editingProject ? 'Update Project' : 'Add Project'}</button>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 gap-6">
                {projects.map(project => (
                  <motion.div 
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    key={project.id} 
                    className="glass-card p-8 border border-white/5 relative group overflow-hidden"
                  >
                    <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500/50" />
                    <div className="absolute top-6 right-6 flex gap-2 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                      <button onClick={() => handleEditProject(project)} className="p-2 bg-white/10 text-white rounded-xl hover:bg-amber-500/20 transition-colors border border-white/10"><Edit3 className="w-4 h-4" /></button>
                      <button onClick={() => handleDeleteProject(project.id)} className="p-2 bg-white/10 text-white rounded-xl hover:bg-red-500/20 transition-colors border border-white/10"><Trash2 className="w-4 h-4" /></button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                      <div className="md:col-span-2 space-y-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-indigo-500/10 rounded-xl border border-indigo-500/20">
                            <Briefcase className="w-6 h-6 text-indigo-400" />
                          </div>
                          <div>
                            <h4 className="text-xl font-black text-white uppercase tracking-tight">{project.companyName}</h4>
                            <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">{project.projectType}</p>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-6 pt-4">
                          <div className="space-y-1">
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">HR Node</p>
                            <p className="text-sm text-slate-300 font-medium">{project.hrPersonDetails}</p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Contact Point</p>
                            <p className="text-sm text-slate-300 font-medium">{project.contactPersonDetails}</p>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-4 flex flex-col justify-center">
                        <div className="flex items-center gap-3 group/item">
                          <div className="p-1.5 bg-white/5 rounded-lg border border-white/10">
                            <Calendar className="w-4 h-4 text-slate-400" />
                          </div>
                          <span className="text-xs font-medium text-slate-400">{project.startDate} — {project.endDate}</span>
                        </div>
                        <div className="flex items-center gap-3 group/item">
                          <div className="p-1.5 bg-white/5 rounded-lg border border-white/10">
                            <Clock className="w-4 h-4 text-slate-400" />
                          </div>
                          <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Duration: {project.duration}</span>
                        </div>
                        <div className="flex items-center gap-3 group/item">
                          <div className="p-1.5 bg-white/5 rounded-lg border border-white/10">
                            <User className="w-4 h-4 text-slate-400" />
                          </div>
                          <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Assigned: {project.assignedTo}</span>
                        </div>
                      </div>
                      <div className="flex flex-col justify-center items-end">
                        <div className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                          project.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                          project.status === 'In Progress' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                          project.status === 'Onboarding' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                          'bg-slate-500/10 text-slate-400 border-slate-500/20'
                        }`}>
                          {project.status}
                        </div>
                        <div className="mt-4 w-full bg-white/5 h-1 rounded-full overflow-hidden border border-white/5">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: project.status === 'Completed' ? '100%' : project.status === 'In Progress' ? '65%' : '15%' }}
                            className={`h-full ${
                              project.status === 'Completed' ? 'bg-emerald-500' :
                              project.status === 'In Progress' ? 'bg-blue-500' :
                              'bg-amber-500'
                            }`}
                          />
                        </div>
                      </div>
                    </div>
                  </motion.div>
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
                <button onClick={handleCreateTask} className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-indigo-700">
                  <PlusCircle className="w-4 h-4" />
                  Add Task
                </button>
              </div>

              <DragDropContext onDragEnd={onDragEnd}>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 h-[calc(100vh-300px)] min-h-[500px]">
                  <TaskColumn title="To Do" status="To Do" tasks={tasks.filter(t => t.status === 'To Do')} onStatusChange={updateTaskStatus} isDark={isDark} onEdit={handleEditTask} onDelete={handleDeleteTask} />
                  <TaskColumn title="In Progress" status="In Progress" tasks={tasks.filter(t => t.status === 'In Progress')} onStatusChange={updateTaskStatus} isDark={isDark} onEdit={handleEditTask} onDelete={handleDeleteTask} />
                  <TaskColumn title="Review" status="Review" tasks={tasks.filter(t => t.status === 'Review')} onStatusChange={updateTaskStatus} isDark={isDark} onEdit={handleEditTask} onDelete={handleDeleteTask} />
                  <TaskColumn title="Done" status="Done" tasks={tasks.filter(t => t.status === 'Done')} onStatusChange={updateTaskStatus} isDark={isDark} onEdit={handleEditTask} onDelete={handleDeleteTask} />
                </div>
              </DragDropContext>
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
                        <th className="px-4 py-3 text-xs font-bold text-slate-600 dark:text-slate-400 uppercase">Sale Amount ({settings.currency.symbol})</th>
                        <th className="px-4 py-3 text-xs font-bold text-slate-600 dark:text-slate-400 uppercase">Comm. %</th>
                        <th className="px-4 py-3 text-xs font-bold text-slate-600 dark:text-slate-400 uppercase">Comm. Amount ({settings.currency.symbol})</th>
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
                              value={sale.saleAmount || ''}
                              onChange={(e) => updateSale(sale.id, 'saleAmount', e.target.value ? parseFloat(e.target.value) : 0)}
                              className={`w-full bg-transparent border-none outline-none font-bold text-indigo-600`}
                            />
                          </td>
                          <td className="px-4 py-3 text-sm">
                            <div className="flex items-center gap-1">
                              <input 
                                type="number" 
                                value={sale.commissionPercentage || ''}
                                onChange={(e) => updateSale(sale.id, 'commissionPercentage', e.target.value ? parseFloat(e.target.value) : 0)}
                                className={`w-12 bg-transparent border-none outline-none text-center`}
                              />
                              <Percent className="w-3 h-3 text-slate-400" />
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm">
                            <div className="flex items-center gap-1 font-bold text-emerald-600">
                              <Calculator className="w-3 h-3" />
                              {settings.formatCurrency(sale.commissionAmount || 0)}
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
                              onClick={() => deleteEntity('sales', sale.id)}
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

        {/* Task Edit Modal */}
        <AnimatePresence>
          {isTaskModalOpen && editingTask && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className={`rounded-xl shadow-xl w-full max-w-md overflow-hidden ${isDark ? 'bg-slate-900' : 'bg-white'}`}
              >
                <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
                  <h3 className="font-bold text-slate-800 dark:text-white">{editingTask.id ? 'Edit Task' : 'New Task'}</h3>
                  <button onClick={() => setIsTaskModalOpen(false)} className="p-1 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full">
                    <X className="w-5 h-5 text-slate-500" />
                  </button>
                </div>
                
                <div className="p-6 space-y-4">
                  <InputField label="Task Title" value={editingTask.title} onChange={(v) => setEditingTask({...editingTask, title: v})} isDark={isDark} />
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase mb-1 block">Description</label>
                    <textarea 
                      value={editingTask.description}
                      onChange={(e) => setEditingTask({...editingTask, description: e.target.value})}
                      className={`w-full border rounded px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-indigo-500 ${isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200'}`}
                      rows={3}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase mb-1 block">Assignee</label>
                      <input 
                        type="text" 
                        value={editingTask.assignee}
                        onChange={(e) => setEditingTask({...editingTask, assignee: e.target.value})}
                        className={`w-full border rounded px-3 py-1.5 text-sm outline-none focus:ring-1 focus:ring-indigo-500 ${isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200'}`}
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase mb-1 block">Priority</label>
                      <select 
                        value={editingTask.priority}
                        onChange={(e) => setEditingTask({...editingTask, priority: e.target.value as any})}
                        className={`w-full border rounded px-3 py-1.5 text-sm outline-none focus:ring-1 focus:ring-indigo-500 ${isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200'}`}
                      >
                        <option value="Low">Low</option>
                        <option value="Medium">Medium</option>
                        <option value="High">High</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase mb-1 block">Status</label>
                    <select 
                      value={editingTask.status}
                      onChange={(e) => setEditingTask({...editingTask, status: e.target.value as any})}
                      className={`w-full border rounded px-3 py-1.5 text-sm outline-none focus:ring-1 focus:ring-indigo-500 ${isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200'}`}
                    >
                      <option value="To Do">To Do</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Review">Review</option>
                      <option value="Done">Done</option>
                    </select>
                  </div>
                </div>

                <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2 bg-slate-50 dark:bg-slate-800/50">
                  <button 
                    onClick={() => setIsTaskModalOpen(false)}
                    className="px-4 py-2 text-slate-600 dark:text-slate-400 font-bold text-sm"
                  >
                    Cancel
                  </button>
                  <button onClick={handleSaveTask} className="bg-indigo-600 text-white px-6 py-2 rounded-lg text-sm font-bold hover:bg-indigo-700">
                    Save Task
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </AdminLayout>
  );
}

function TabButton({ active, onClick, label, icon }: any) {
  return (
    <button 
      onClick={onClick}
      className={`flex items-center gap-2 px-6 py-2.5 text-[10px] font-black uppercase tracking-widest transition-all relative rounded-xl ${
        active 
          ? 'text-white bg-white/10' 
          : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'
      }`}
    >
      {icon}
      {label}
      {active && (
        <motion.div 
          layoutId="activeTab" 
          className="absolute inset-0 border border-white/20 rounded-xl"
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

function TaskColumn({ title, status, tasks, isDark, onStatusChange, onEdit, onDelete }: any) {
  return (
    <div className={`flex flex-col h-full rounded-xl border ${isDark ? 'bg-slate-900/50 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
      <div className="p-3 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest">{title}</h4>
        <span className="bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[10px] px-2 py-0.5 rounded-full">{tasks.length}</span>
      </div>
      <Droppable droppableId={status}>
        {(provided, snapshot) => (
          <div 
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar ${snapshot.isDraggingOver ? (isDark ? 'bg-slate-800/30' : 'bg-slate-100/50') : ''}`}
          >
            {tasks.map((task: any, index: number) => (
              // @ts-ignore
              <Draggable key={task.id} draggableId={task.id} index={index}>
                {(provided, snapshot) => (
                  <div 
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    className={`p-3 rounded-lg border ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'} shadow-sm hover:shadow-md transition-shadow group ${snapshot.isDragging ? 'shadow-lg ring-2 ring-indigo-500 ring-opacity-50' : ''}`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        <div {...provided.dragHandleProps} className="text-slate-400 hover:text-slate-600 cursor-grab active:cursor-grabbing">
                          <GripVertical className="w-4 h-4" />
                        </div>
                        <span className={`text-[8px] font-bold uppercase px-1.5 py-0.5 rounded ${
                          task.priority === 'High' ? 'bg-red-100 text-red-700' :
                          task.priority === 'Medium' ? 'bg-amber-100 text-amber-700' :
                          'bg-blue-100 text-blue-700'
                        }`}>
                          {task.priority}
                        </span>
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => onEdit(task)} className="text-slate-400 hover:text-indigo-600 p-1">
                          <Edit3 className="w-3 h-3" />
                        </button>
                        <button onClick={() => onDelete(task.id)} className="text-slate-400 hover:text-red-600 p-1">
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
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
                      {status !== 'Done' && (
                        <div className="flex gap-1">
                          <button onClick={() => onStatusChange(task.id, 'Done')} className="text-slate-300 hover:text-emerald-600" title="Mark as Done">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
}
