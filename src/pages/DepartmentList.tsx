import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  Edit, 
  Trash2, 
  X, 
  FileSpreadsheet, 
  FileText as FilePdf, 
  RotateCcw, 
  Search
} from 'lucide-react';
import { Link } from 'react-router-dom';

import AdminLayout from '../components/AdminLayout';
import { useCompanyData } from '../context/CompanyDataContext';

interface Department {
  id: string;
  name: string;
  head: string;
  status: 'Active' | 'Inactive';
  isDeleted?: boolean;
  deletedAt?: number;
}

export default function DepartmentList() {
  const { departments, addEntity, updateEntity, deleteEntity } = useCompanyData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDept, setEditingDept] = useState<Department | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentTime, setCurrentTime] = useState(Date.now());

  const [formData, setFormData] = useState({
    name: '',
    head: '',
    status: 'Active' as 'Active' | 'Inactive'
  });

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleOpenModal = (dept: Department | null = null) => {
    if (dept) {
      setEditingDept(dept);
      setFormData({
        name: dept.name,
        head: dept.head,
        status: dept.status
      });
    } else {
      setEditingDept(null);
      setFormData({
        name: '',
        head: '',
        status: 'Active'
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingDept(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingDept) {
      await updateEntity('departments', editingDept.id, formData);
    } else {
      await addEntity('departments', formData);
    }
    handleCloseModal();
  };

  const handleDelete = async (id: string) => {
    await updateEntity('departments', id, { isDeleted: true, deletedAt: Date.now() });
  };

  const handleRecover = async (id: string) => {
    await updateEntity('departments', id, { isDeleted: false, deletedAt: null });
  };

  const filteredDepartments = departments.filter(d => {
    const matchesSearch = d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         d.head.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (d.isDeleted) {
      const canRecover = currentTime - (d.deletedAt || 0) < 120000; // 2 minutes
      return matchesSearch && canRecover;
    }
    
    return matchesSearch;
  });

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
            <h1 className="text-xl font-bold text-slate-800">Department list</h1>
            <div className="flex gap-2">
              <Link to="/sub-department" className="bg-indigo-600 text-white px-4 py-2 rounded text-sm font-bold flex items-center gap-2 hover:bg-indigo-700 transition-colors">
                Sub departments
              </Link>
              <button onClick={() => handleOpenModal()} className="bg-[#28A745] text-white px-4 py-2 rounded text-sm font-bold flex items-center gap-2 hover:bg-[#218838] transition-colors">
                <Plus className="w-4 h-4" />
                Add new department
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
                    <th className="px-4 py-3 text-xs font-bold text-slate-600 uppercase border-r border-slate-100">Department name</th>
                    <th className="px-4 py-3 text-xs font-bold text-slate-600 uppercase border-r border-slate-100">Head of Department</th>
                    <th className="px-4 py-3 text-xs font-bold text-slate-600 uppercase border-r border-slate-100">Status</th>
                    <th className="px-4 py-3 text-xs font-bold text-slate-600 uppercase">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredDepartments.map((dept, index) => (
                    <tr key={dept.id} className={`transition-colors ${dept.isDeleted ? 'bg-red-50/50' : 'hover:bg-slate-50/50'}`}>
                      <td className="px-4 py-3 text-sm text-slate-600 border-r border-slate-100">{index + 1}</td>
                      <td className="px-4 py-3 text-sm text-slate-600 border-r border-slate-100">
                        {(dept as any).name}
                        {dept.isDeleted && <span className="ml-2 text-[10px] font-bold text-red-600 uppercase tracking-wider">(Deleted)</span>}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-600 border-r border-slate-100">{(dept as any).head}</td>
                      <td className="px-4 py-3 text-sm border-r border-slate-100">
                        <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase ${(dept as any).status === 'Active' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>
                          {(dept as any).status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <div className="flex items-center gap-2">
                          {!dept.isDeleted ? (
                            <>
                              <button onClick={() => handleOpenModal(dept as any)} className="p-1.5 text-emerald-600 bg-emerald-50 rounded border border-emerald-100 hover:bg-emerald-100"><Edit className="w-3.5 h-3.5" /></button>
                              <button onClick={() => handleDelete(dept.id)} className="p-1.5 text-red-600 bg-red-50 rounded border border-red-100 hover:bg-red-100"><Trash2 className="w-3.5 h-3.5" /></button>
                            </>
                          ) : (
                            <button onClick={() => handleRecover(dept.id)} className="flex items-center gap-1.5 px-3 py-1.5 text-indigo-600 bg-indigo-50 rounded border border-indigo-100 hover:bg-indigo-100 text-xs font-bold">
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
                  <h2 className="font-bold text-slate-800">{editingDept ? 'Edit department' : 'Add department'}</h2>
                  <button onClick={handleCloseModal} className="p-1 hover:bg-slate-100 rounded-full"><X className="w-5 h-5 text-slate-400" /></button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Department name <span className="text-red-500">*</span></label>
                    <input type="text" name="name" required value={formData.name} onChange={handleInputChange} className="w-full border border-slate-200 rounded px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-indigo-500" placeholder="e.g. Electrical" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Head of Department <span className="text-red-500">*</span></label>
                    <input type="text" name="head" required value={formData.head} onChange={handleInputChange} className="w-full border border-slate-200 rounded px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-indigo-500" placeholder="e.g. John Doe" />
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
