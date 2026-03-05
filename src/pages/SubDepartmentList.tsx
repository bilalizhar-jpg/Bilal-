import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Building2, 
  Menu, 
  Maximize2, 
  RefreshCw, 
  Search,
  ChevronRight,
  LayoutDashboard,
  Calendar,
  Award,
  Users,
  UserMinus,
  CreditCard,
  Bell,
  DollarSign,
  Briefcase,
  ClipboardList,
  UserCheck,
  FileText,
  Target,
  Settings,
  MessageSquare,
  Plus,
  Edit,
  Trash2,
  X,
  FileSpreadsheet,
  FileText as FilePdf,
  RotateCcw
} from 'lucide-react';
import { Link } from 'react-router-dom';
import AdminLayout from '../components/AdminLayout';
import { useTheme } from '../context/ThemeContext';
import { useCompanyData } from '../context/CompanyDataContext';

interface SubDepartment {
  id: string;
  name: string;
  parentDept: string;
  status: 'Active' | 'Inactive';
  isDeleted?: boolean;
  deletedAt?: number;
}

export default function SubDepartmentList() {
  const { theme } = useTheme();
  const { subDepartments, departments, addEntity, updateEntity, deleteEntity } = useCompanyData();
  const isDark = theme === 'dark';
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSubDept, setEditingSubDept] = useState<SubDepartment | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentTime, setCurrentTime] = useState(Date.now());

  const [formData, setFormData] = useState({
    name: '',
    parentDept: '',
    status: 'Active' as 'Active' | 'Inactive'
  });

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleOpenModal = (subDept: SubDepartment | null = null) => {
    if (subDept) {
      setEditingSubDept(subDept);
      setFormData({
        name: subDept.name,
        parentDept: subDept.parentDept,
        status: subDept.status
      });
    } else {
      setEditingSubDept(null);
      setFormData({
        name: '',
        parentDept: '',
        status: 'Active'
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingSubDept(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingSubDept) {
      await updateEntity('subDepartments', editingSubDept.id, formData);
    } else {
      await addEntity('subDepartments', formData);
    }
    handleCloseModal();
  };

  const handleDelete = async (id: string) => {
    await updateEntity('subDepartments', id, { isDeleted: true, deletedAt: Date.now() });
  };

  const handleRecover = async (id: string) => {
    await updateEntity('subDepartments', id, { isDeleted: false, deletedAt: null });
  };

  const filteredSubDepartments = subDepartments.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         s.parentDept.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (s.isDeleted) {
      const canRecover = currentTime - (s.deletedAt || 0) < 120000; // 2 minutes
      return matchesSearch && canRecover;
    }
    
    return matchesSearch;
  });

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
            <h1 className="text-xl font-bold text-slate-800">Sub department list</h1>
            <div className="flex gap-2">
              <Link to="/department" className="bg-slate-200 text-slate-700 px-4 py-2 rounded text-sm font-bold flex items-center gap-2 hover:bg-slate-300 transition-colors">
                Departments
              </Link>
              <button onClick={() => handleOpenModal()} className="bg-[#28A745] text-white px-4 py-2 rounded text-sm font-bold flex items-center gap-2 hover:bg-[#218838] transition-colors">
                <Plus className="w-4 h-4" />
                Add sub department
              </button>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex flex-wrap justify-between items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-slate-600">
                Show <select className="border border-slate-200 rounded px-2 py-1 outline-none"><option>10</option></select> entries
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <button className="bg-[#28A745] text-white px-3 py-1.5 rounded text-xs font-bold flex items-center gap-1.5"><FileSpreadsheet className="w-3.5 h-3.5" /> Excel</button>
                  <button className="bg-[#28A745] text-white px-3 py-1.5 rounded text-xs font-bold flex items-center gap-1.5"><FilePdf className="w-3.5 h-3.5" /> PDF</button>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-slate-600">Search:</span>
                  <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="border border-slate-200 rounded px-3 py-1.5 text-sm outline-none focus:ring-1 focus:ring-indigo-500" />
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-100">
                    <th className="px-4 py-3 text-xs font-bold text-slate-600 uppercase border-r border-slate-100">Sl</th>
                    <th className="px-4 py-3 text-xs font-bold text-slate-600 uppercase border-r border-slate-100">Sub department name</th>
                    <th className="px-4 py-3 text-xs font-bold text-slate-600 uppercase border-r border-slate-100">Department name</th>
                    <th className="px-4 py-3 text-xs font-bold text-slate-600 uppercase border-r border-slate-100">Status</th>
                    <th className="px-4 py-3 text-xs font-bold text-slate-600 uppercase">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredSubDepartments.map((sub, index) => (
                    <tr key={sub.id} className={`transition-colors ${sub.isDeleted ? 'bg-red-50/50' : 'hover:bg-slate-50/50'}`}>
                      <td className="px-4 py-3 text-sm text-slate-600 border-r border-slate-100">{index + 1}</td>
                      <td className="px-4 py-3 text-sm text-slate-600 border-r border-slate-100">
                        {(sub as any).name}
                        {sub.isDeleted && <span className="ml-2 text-[10px] font-bold text-red-600 uppercase tracking-wider">(Deleted)</span>}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-600 border-r border-slate-100">{(sub as any).parentDept}</td>
                      <td className="px-4 py-3 text-sm border-r border-slate-100">
                        <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase ${(sub as any).status === 'Active' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>
                          {(sub as any).status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <div className="flex items-center gap-2">
                          {!sub.isDeleted ? (
                            <>
                              <button onClick={() => handleOpenModal(sub as any)} className="p-1.5 text-emerald-600 bg-emerald-50 rounded border border-emerald-100 hover:bg-emerald-100"><Edit className="w-3.5 h-3.5" /></button>
                              <button onClick={() => handleDelete(sub.id)} className="p-1.5 text-red-600 bg-red-50 rounded border border-red-100 hover:bg-red-100"><Trash2 className="w-3.5 h-3.5" /></button>
                            </>
                          ) : (
                            <button onClick={() => handleRecover(sub.id)} className="flex items-center gap-1.5 px-3 py-1.5 text-indigo-600 bg-indigo-50 rounded border border-indigo-100 hover:bg-indigo-100 text-xs font-bold">
                              <RotateCcw className="w-3.5 h-3.5" />
                              Recover
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        
        {/* Modal */}
        <AnimatePresence>
          {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={handleCloseModal} className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative bg-white rounded-lg shadow-xl w-full max-w-lg overflow-hidden">
              <div className="p-4 border-b border-slate-100 flex justify-between items-center">
                <h2 className="font-bold text-slate-800">{editingSubDept ? 'Edit sub department' : 'Add sub department'}</h2>
                <button onClick={handleCloseModal} className="p-1 hover:bg-slate-100 rounded-full"><X className="w-5 h-5 text-slate-400" /></button>
              </div>
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Sub department name <span className="text-red-500">*</span></label>
                  <input type="text" name="name" required value={formData.name} onChange={handleInputChange} className="w-full border border-slate-200 rounded px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-indigo-500" placeholder="e.g. HR" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Department name <span className="text-red-500">*</span></label>
                  <select name="parentDept" required value={formData.parentDept} onChange={handleInputChange} className="w-full border border-slate-200 rounded px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-indigo-500">
                    <option value="">Select Department</option>
                    {departments.map(dept => (
                      <option key={dept.id} value={dept.name}>{dept.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Status</label>
                  <select name="status" value={formData.status} onChange={handleInputChange} className="w-full border border-slate-200 rounded px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-indigo-500">
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
                <div className="flex justify-end gap-2 pt-4">
                  <button type="button" onClick={handleCloseModal} className="px-4 py-2 bg-slate-100 text-slate-600 rounded text-sm font-bold hover:bg-slate-200">Close</button>
                  <button type="submit" className="px-4 py-2 bg-[#28A745] text-white rounded text-sm font-bold hover:bg-[#218838]">Save</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      </div>
    </AdminLayout>
  );
}
