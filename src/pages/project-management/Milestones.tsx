import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  Download, 
  RefreshCw, 
  Plus, 
  Calendar, 
  MoreVertical, 
  Edit3, 
  Trash2,
  Layout,
  X,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import AdminLayout from '../../components/AdminLayout';
import { useTheme } from '../../context/ThemeContext';
import { useCompanyData } from '../../context/CompanyDataContext';
import { useEmployees } from '../../context/EmployeeContext';
import { motion, AnimatePresence } from 'motion/react';

interface Milestone {
  id: string;
  projectId: string;
  projectName: string;
  milestoneId: string;
  milestoneName: string;
  assignee: string;
  priority: 'High' | 'Medium' | 'Low';
  startDate: string;
  endDate: string;
  dueDate: string; // Keeping for backward compatibility or mapping to endDate
  completion: number;
  status: 'Pending' | 'In Progress' | 'Completed' | 'On Hold';
  notes: string;
}

export default function Milestones() {
  const { theme } = useTheme();
  const { milestones: rawMilestones, projects: rawProjects, addEntity, updateEntity, deleteEntity } = useCompanyData();
  const { employees } = useEmployees();
  const milestones = rawMilestones as unknown as Milestone[];
  const projects = rawProjects as any[];
  const isDark = theme === 'dark';

  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isColumnsOpen, setIsColumnsOpen] = useState(false);
  
  const [filters, setFilters] = useState({
    projectName: '',
    assignee: '',
    status: ''
  });

  const [visibleColumns, setVisibleColumns] = useState({
    projectName: true,
    milestoneId: true,
    milestoneName: true,
    dueDate: true,
    completion: true,
    status: true,
    action: true
  });

  const [editingMilestone, setEditingMilestone] = useState<Milestone | null>(null);
  const [newMilestone, setNewMilestone] = useState<Partial<Milestone>>({
    projectId: '',
    projectName: '',
    milestoneId: '',
    milestoneName: '',
    assignee: '',
    priority: 'Medium',
    startDate: '',
    endDate: '',
    dueDate: '',
    completion: 0,
    status: 'Pending',
    notes: ''
  });

  const handleSave = async () => {
    if (!newMilestone.projectId || !newMilestone.milestoneName || !newMilestone.startDate || !newMilestone.endDate) {
      alert('Please fill in all required fields');
      return;
    }

    const milestoneData = {
      ...newMilestone,
      projectName: projects.find(p => p.id === newMilestone.projectId)?.companyName || 'Unknown Project',
      dueDate: newMilestone.endDate // Sync dueDate with endDate
    };

    if (editingMilestone) {
      await updateEntity('milestones', editingMilestone.id, milestoneData);
    } else {
      await addEntity('milestones', {
        ...milestoneData,
        milestoneId: `MS-${Math.floor(Math.random() * 10000)}`
      });
    }
    setIsModalOpen(false);
    setEditingMilestone(null);
    resetForm();
  };

  const resetForm = () => {
    setNewMilestone({
      projectId: '',
      projectName: '',
      milestoneId: '',
      milestoneName: '',
      assignee: '',
      priority: 'Medium',
      startDate: '',
      endDate: '',
      dueDate: '',
      completion: 0,
      status: 'Pending',
      notes: ''
    });
  };

  const handleEdit = (milestone: Milestone) => {
    setEditingMilestone(milestone);
    setNewMilestone(milestone);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this milestone?')) {
      await deleteEntity('milestones', id);
    }
  };

  const filteredMilestones = milestones.filter(m => {
    const matchesSearch = 
      m.milestoneName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.projectName?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesProject = filters.projectName ? m.projectName === filters.projectName : true;
    const matchesAssignee = filters.assignee ? m.assignee === filters.assignee : true;
    const matchesStatus = filters.status ? m.status === filters.status : true;

    return matchesSearch && matchesProject && matchesAssignee && matchesStatus;
  });

  const toggleColumn = (key: keyof typeof visibleColumns) => {
    setVisibleColumns(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <AdminLayout>
      <div className="space-y-6 relative">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Milestone</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Home &gt; Milestone</p>
          </div>
          <div className="flex gap-2">
            <button className={`px-4 py-2 rounded-lg text-sm font-medium border flex items-center gap-2 ${isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-700'}`}>
              <Download className="w-4 h-4" />
              Export
            </button>
            <button className={`p-2 rounded-lg border ${isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-700'}`}>
              <RefreshCw className="w-4 h-4" />
            </button>
            <div className="relative">
              <button 
                onClick={() => setIsColumnsOpen(!isColumnsOpen)}
                className={`p-2 rounded-lg border ${isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-700'}`}
              >
                <Layout className="w-4 h-4" />
              </button>
              {isColumnsOpen && (
                <div className={`absolute right-0 top-full mt-2 w-56 rounded-xl shadow-xl border z-20 p-4 ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                  <h4 className={`text-sm font-bold mb-3 ${isDark ? 'text-white' : 'text-slate-800'}`}>Columns</h4>
                  <div className="space-y-2">
                    {Object.entries(visibleColumns).map(([key, isVisible]) => (
                      <div key={key} className="flex items-center justify-between">
                        <span className={`text-sm capitalize ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </span>
                        <button 
                          onClick={() => toggleColumn(key as any)}
                          className={`w-10 h-5 rounded-full relative transition-colors ${isVisible ? 'bg-red-500' : 'bg-slate-300 dark:bg-slate-700'}`}
                        >
                          <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-all ${isVisible ? 'left-6' : 'left-1'}`} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className={`p-4 rounded-xl border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} shadow-sm space-y-4`}>
          <div className="flex flex-col md:flex-row justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full pl-10 pr-4 py-2 rounded-lg border text-sm outline-none focus:ring-2 focus:ring-indigo-500 ${isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'}`}
              />
            </div>
            <button 
              onClick={() => {
                setEditingMilestone(null);
                resetForm();
                setIsModalOpen(true);
              }}
              className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-red-700"
            >
              <Plus className="w-4 h-4" />
              Add Milestone
            </button>
          </div>

          <div className="flex flex-wrap gap-2 items-center relative">
            <div className={`px-3 py-1.5 rounded-lg border text-xs font-medium flex items-center gap-2 ${isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-700'}`}>
              Sort By
            </div>
            <div className={`px-3 py-1.5 rounded-lg border text-xs font-medium flex items-center gap-2 ${isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-700'}`}>
              <Calendar className="w-3 h-3" />
              7 Feb 26 - 8 Mar 26
            </div>
            <div className="flex-1" />
            <div className="relative">
              <button 
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className={`px-3 py-1.5 rounded-lg border text-xs font-medium flex items-center gap-2 ${isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-700'}`}
              >
                <Filter className="w-3 h-3" />
                Filter
              </button>
              {isFilterOpen && (
                <div className={`absolute right-0 top-full mt-2 w-64 rounded-xl shadow-xl border z-20 overflow-hidden ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                  <div className={`p-3 border-b flex justify-between items-center ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
                    <h4 className={`font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>Filter</h4>
                    <button onClick={() => setIsFilterOpen(false)} className="text-slate-400 hover:text-slate-600">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="p-4 space-y-4">
                    <div>
                      <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Project Name</label>
                      <select 
                        value={filters.projectName}
                        onChange={(e) => setFilters({...filters, projectName: e.target.value})}
                        className={`w-full border rounded px-3 py-2 text-sm outline-none ${isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200'}`}
                      >
                        <option value="">All Projects</option>
                        {projects.map(p => (
                          <option key={p.id} value={p.companyName}>{p.companyName}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Assignee</label>
                      <select 
                        value={filters.assignee}
                        onChange={(e) => setFilters({...filters, assignee: e.target.value})}
                        className={`w-full border rounded px-3 py-2 text-sm outline-none ${isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200'}`}
                      >
                        <option value="">All Assignees</option>
                        {employees.map(e => (
                          <option key={e.id} value={e.name}>{e.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Status</label>
                      <select 
                        value={filters.status}
                        onChange={(e) => setFilters({...filters, status: e.target.value})}
                        className={`w-full border rounded px-3 py-2 text-sm outline-none ${isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200'}`}
                      >
                        <option value="">All Statuses</option>
                        <option value="Pending">Pending</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Completed">Completed</option>
                        <option value="On Hold">On Hold</option>
                      </select>
                    </div>
                  </div>
                  <div className={`p-3 border-t flex gap-2 ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
                    <button 
                      onClick={() => setFilters({ projectName: '', assignee: '', status: '' })}
                      className={`flex-1 py-2 rounded-lg text-sm font-medium border ${isDark ? 'border-slate-700 text-slate-300' : 'border-slate-200 text-slate-600'}`}
                    >
                      Reset
                    </button>
                    <button 
                      onClick={() => setIsFilterOpen(false)}
                      className="flex-1 py-2 rounded-lg text-sm font-medium bg-red-600 text-white hover:bg-red-700"
                    >
                      Filter
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className={`border-b ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
                  {visibleColumns.projectName && <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase">Project Name</th>}
                  {visibleColumns.milestoneId && <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase">Milestone ID</th>}
                  {visibleColumns.milestoneName && <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase">Milestone Name</th>}
                  {visibleColumns.dueDate && <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase">Due Date</th>}
                  {visibleColumns.completion && <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase">Completion</th>}
                  {visibleColumns.status && <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase">Status</th>}
                  {visibleColumns.action && <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase text-right">Action</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredMilestones.map((milestone) => (
                  <tr key={milestone.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                    {visibleColumns.projectName && <td className={`px-4 py-3 text-sm font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>{milestone.projectName}</td>}
                    {visibleColumns.milestoneId && <td className="px-4 py-3 text-sm text-slate-500">{milestone.milestoneId}</td>}
                    {visibleColumns.milestoneName && <td className={`px-4 py-3 text-sm ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>{milestone.milestoneName}</td>}
                    {visibleColumns.dueDate && <td className="px-4 py-3 text-sm text-slate-500">{milestone.dueDate}</td>}
                    {visibleColumns.completion && (
                      <td className="px-4 py-3 text-sm">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full ${
                                milestone.completion === 100 ? 'bg-emerald-500' : 
                                milestone.completion > 50 ? 'bg-blue-500' : 'bg-amber-500'
                              }`}
                              style={{ width: `${milestone.completion}%` }}
                            />
                          </div>
                          <span className="text-xs text-slate-500">{milestone.completion}%</span>
                        </div>
                      </td>
                    )}
                    {visibleColumns.status && (
                      <td className="px-4 py-3 text-sm">
                        <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                          milestone.status === 'Completed' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400' :
                          milestone.status === 'In Progress' ? 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400' :
                          'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400'
                        }`}>
                          {milestone.status}
                        </span>
                      </td>
                    )}
                    {visibleColumns.action && (
                      <td className="px-4 py-3 text-sm text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => handleEdit(milestone)} className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded transition-colors">
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDelete(milestone.id)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
                {filteredMilestones.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-slate-500 text-sm">
                      No milestones found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Add/Edit Modal */}
        <AnimatePresence>
          {isModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className={`rounded-xl shadow-xl w-full max-w-md overflow-hidden ${isDark ? 'bg-slate-900' : 'bg-white'}`}
              >
                <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-white dark:bg-slate-900">
                  <h3 className="font-bold text-lg text-slate-800 dark:text-white">
                    {editingMilestone ? 'Edit Milestone' : 'Add New Milestone'}
                  </h3>
                  <button onClick={() => setIsModalOpen(false)} className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                  <div>
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 block">
                      Project Name <span className="text-red-500">*</span>
                    </label>
                    <select 
                      value={newMilestone.projectId}
                      onChange={(e) => setNewMilestone({...newMilestone, projectId: e.target.value})}
                      className={`w-full border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500 ${isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200'}`}
                    >
                      <option value="">Select</option>
                      {projects.map(p => (
                        <option key={p.id} value={p.id}>{p.companyName}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 block">
                      Milestone Name <span className="text-red-500">*</span>
                    </label>
                    <input 
                      type="text" 
                      value={newMilestone.milestoneName}
                      onChange={(e) => setNewMilestone({...newMilestone, milestoneName: e.target.value})}
                      className={`w-full border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500 ${isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200'}`}
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 block">
                      Assignee <span className="text-red-500">*</span>
                    </label>
                    <select 
                      value={newMilestone.assignee}
                      onChange={(e) => setNewMilestone({...newMilestone, assignee: e.target.value})}
                      className={`w-full border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500 ${isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200'}`}
                    >
                      <option value="">Select</option>
                      {employees.map(e => (
                        <option key={e.id} value={e.name}>{e.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 block">
                      Priority <span className="text-red-500">*</span>
                    </label>
                    <select 
                      value={newMilestone.priority}
                      onChange={(e) => setNewMilestone({...newMilestone, priority: e.target.value as any})}
                      className={`w-full border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500 ${isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200'}`}
                    >
                      <option value="Select">Select</option>
                      <option value="High">High</option>
                      <option value="Medium">Medium</option>
                      <option value="Low">Low</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 block">
                        Start Date <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <input 
                          type="date" 
                          value={newMilestone.startDate}
                          onChange={(e) => setNewMilestone({...newMilestone, startDate: e.target.value})}
                          className={`w-full border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500 ${isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200'}`}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 block">
                        End Date <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <input 
                          type="date" 
                          value={newMilestone.endDate}
                          onChange={(e) => setNewMilestone({...newMilestone, endDate: e.target.value})}
                          className={`w-full border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500 ${isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200'}`}
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 block">
                      Notes
                    </label>
                    <textarea 
                      rows={4}
                      value={newMilestone.notes}
                      onChange={(e) => setNewMilestone({...newMilestone, notes: e.target.value})}
                      className={`w-full border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500 ${isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200'}`}
                    />
                  </div>
                </div>

                <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2 bg-white dark:bg-slate-900">
                  <button 
                    onClick={() => setIsModalOpen(false)}
                    className={`px-4 py-2 rounded-lg text-sm font-bold ${isDark ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
                  >
                    Cancel
                  </button>
                  <button onClick={handleSave} className="bg-red-600 text-white px-6 py-2 rounded-lg text-sm font-bold hover:bg-red-700">
                    {editingMilestone ? 'Update' : 'Create New'}
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
