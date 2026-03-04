import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  Edit, 
  Trash2, 
  X, 
  FileSpreadsheet, 
  FileText as FileCsv
} from 'lucide-react';
import * as XLSX from 'xlsx';
import AdminLayout from '../components/AdminLayout';
import { useEmployees } from '../context/EmployeeContext';

interface Award {
  id: number;
  awardName: string;
  description: string;
  giftItem: string;
  date: string;
  employeeName: string;
  awardBy: string;
}

export default function AwardList() {
  const { employees } = useEmployees();
  const activeEmployees = employees.filter(e => e.status === 'Active');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAward, setEditingAward] = useState<Award | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [awards, setAwards] = useState<Award[]>([
    { id: 1, awardName: 'xyz', description: 'xyz', giftItem: 'xyz', date: '2026-02-04', employeeName: 'Scarlet Melvin Reese Rogers', awardBy: 'x-xyz' },
    { id: 2, awardName: 'xyz', description: 'xyz', giftItem: 'xyz', date: '2026-02-04', employeeName: 'Scarlet Melvin Reese Rogers', awardBy: 'x-xyz' },
    { id: 3, awardName: 'Employee of the month', description: 'Watch', giftItem: '1', date: '2025-09-18', employeeName: 'Honorato Imogene Curry Terry', awardBy: 'usamaDev' },
  ]);

  const [formData, setFormData] = useState({
    awardName: '',
    description: '',
    giftItem: '',
    date: '',
    employeeName: '',
    awardBy: ''
  });

  const filteredAwards = awards.filter(a => {
    const matchesSearch = a.awardName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.employeeName.toLowerCase().includes(searchTerm.toLowerCase());
    const employeeExists = activeEmployees.some(e => e.name === a.employeeName);
    return matchesSearch && employeeExists;
  });

  const handleExport = (format: 'csv' | 'excel') => {
    const dataToExport = filteredAwards.map(a => ({
      'Award Name': a.awardName,
      'Description': a.description,
      'Gift Item': a.giftItem,
      'Date': a.date,
      'Employee Name': a.employeeName,
      'Award By': a.awardBy
    }));

    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Awards");
    
    if (format === 'csv') {
      XLSX.writeFile(wb, 'awards_list.csv');
    } else {
      XLSX.writeFile(wb, 'awards_list.xlsx');
    }
  };

  const handleOpenModal = (award: Award | null = null) => {
    if (award) {
      setEditingAward(award);
      setFormData({
        awardName: award.awardName,
        description: award.description,
        giftItem: award.giftItem,
        date: award.date,
        employeeName: award.employeeName,
        awardBy: award.awardBy
      });
    } else {
      setEditingAward(null);
      setFormData({
        awardName: '',
        description: '',
        giftItem: '',
        date: '',
        employeeName: '',
        awardBy: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingAward(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingAward) {
      setAwards(awards.map(a => a.id === editingAward.id ? { ...a, ...formData } : a));
    } else {
      const newId = awards.length > 0 ? Math.max(...awards.map(a => a.id)) + 1 : 1;
      const newAward = {
        id: newId,
        ...formData
      };
      setAwards([...awards, newAward]);
    }
    handleCloseModal();
  };

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this award?')) {
      setAwards(awards.filter(a => a.id !== id));
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-bold text-slate-800 dark:text-white">Award list</h1>
          <button 
            onClick={() => handleOpenModal()}
            className="bg-[#28A745] text-white px-4 py-2 rounded text-sm font-bold flex items-center gap-2 hover:bg-[#218838] transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add new award
          </button>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex flex-wrap justify-between items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
              Show 
              <select className="border border-slate-200 dark:border-slate-700 dark:bg-slate-800 rounded px-2 py-1 outline-none">
                <option>10</option>
                <option>25</option>
                <option>50</option>
              </select>
              entries
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <button 
                  onClick={() => handleExport('csv')}
                  className="bg-[#28A745] text-white px-3 py-1.5 rounded text-xs font-bold flex items-center gap-1.5 hover:bg-[#218838]"
                >
                  <FileCsv className="w-3.5 h-3.5" />
                  CSV
                </button>
                <button 
                  onClick={() => handleExport('excel')}
                  className="bg-[#28A745] text-white px-3 py-1.5 rounded text-xs font-bold flex items-center gap-1.5 hover:bg-[#218838]"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                  Excel
                </button>
              </div>
              
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-600 dark:text-slate-400">Search:</span>
                <input 
                  type="text" 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded px-3 py-1.5 text-sm outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                  <th className="px-4 py-3 text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider border-r border-slate-100 dark:border-slate-800">Sl</th>
                  <th className="px-4 py-3 text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider border-r border-slate-100 dark:border-slate-800">Award name</th>
                  <th className="px-4 py-3 text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider border-r border-slate-100 dark:border-slate-800">Award description</th>
                  <th className="px-4 py-3 text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider border-r border-slate-100 dark:border-slate-800">Gift item</th>
                  <th className="px-4 py-3 text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider border-r border-slate-100 dark:border-slate-800">Date</th>
                  <th className="px-4 py-3 text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider border-r border-slate-100 dark:border-slate-800">Employee name</th>
                  <th className="px-4 py-3 text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider border-r border-slate-100 dark:border-slate-800">Award by</th>
                  <th className="px-4 py-3 text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredAwards.map((award, index) => (
                  <tr key={award.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400 border-r border-slate-100 dark:border-slate-800">{index + 1}</td>
                    <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400 border-r border-slate-100 dark:border-slate-800">{award.awardName}</td>
                    <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400 border-r border-slate-100 dark:border-slate-800">{award.description}</td>
                    <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400 border-r border-slate-100 dark:border-slate-800">{award.giftItem}</td>
                    <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400 border-r border-slate-100 dark:border-slate-800">{award.date}</td>
                    <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400 border-r border-slate-100 dark:border-slate-800">{award.employeeName}</td>
                    <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400 border-r border-slate-100 dark:border-slate-800">{award.awardBy}</td>
                    <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400">
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => handleOpenModal(award)}
                          className="p-1.5 text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 rounded border border-emerald-100 dark:border-emerald-800 hover:bg-emerald-100 transition-colors"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button 
                          onClick={() => handleDelete(award.id)}
                          className="p-1.5 text-red-600 bg-red-50 dark:bg-red-900/20 rounded border border-red-100 dark:border-red-800 hover:bg-red-100 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-sm text-slate-500">
            <div>Showing 1 to {filteredAwards.length} of {awards.length} entries</div>
            <div className="flex items-center gap-1">
              <button className="px-3 py-1 border border-slate-200 dark:border-slate-700 rounded hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50">Previous</button>
              <button className="px-3 py-1 bg-[#1A73E8] text-white rounded">1</button>
              <button className="px-3 py-1 border border-slate-200 dark:border-slate-700 rounded hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50">Next</button>
            </div>
          </div>
        </div>

        {/* Award Form Modal */}
        <AnimatePresence>
          {isModalOpen && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={handleCloseModal}
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              />
              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative bg-white dark:bg-slate-900 rounded-lg shadow-xl w-full max-w-2xl overflow-hidden"
              >
                <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-white dark:bg-slate-900">
                  <h2 className="font-bold text-slate-800 dark:text-white">Award form</h2>
                  <button onClick={handleCloseModal} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
                    <X className="w-5 h-5 text-slate-400" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-4">
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300">
                      Award name <span className="text-red-500">*</span>
                    </label>
                    <div className="md:col-span-2">
                      <input 
                        type="text" 
                        name="awardName"
                        required
                        value={formData.awardName}
                        onChange={handleInputChange}
                        placeholder="Award name"
                        className="w-full border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 items-start gap-4">
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300 pt-2">
                      Award description
                    </label>
                    <div className="md:col-span-2">
                      <textarea 
                        name="description"
                        rows={3}
                        value={formData.description}
                        onChange={handleInputChange}
                        placeholder="Award description"
                        className="w-full border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-indigo-500 resize-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-4">
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300">
                      Gift item <span className="text-red-500">*</span>
                    </label>
                    <div className="md:col-span-2">
                      <input 
                        type="text" 
                        name="giftItem"
                        required
                        value={formData.giftItem}
                        onChange={handleInputChange}
                        placeholder="Gift item"
                        className="w-full border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-4">
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300">
                      Date <span className="text-red-500">*</span>
                    </label>
                    <div className="md:col-span-2">
                      <input 
                        type="date" 
                        name="date"
                        required
                        value={formData.date}
                        onChange={handleInputChange}
                        className="w-full border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-4">
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300">
                      Employee name <span className="text-red-500">*</span>
                    </label>
                    <div className="md:col-span-2">
                      <select 
                        name="employeeName"
                        required
                        value={formData.employeeName}
                        onChange={(e) => setFormData(prev => ({ ...prev, employeeName: e.target.value }))}
                        className="w-full border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-indigo-500"
                      >
                        <option value="">Select Employee</option>
                        {activeEmployees.map(e => (
                          <option key={e.id} value={e.name}>{e.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-4">
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300">
                      Award by <span className="text-red-500">*</span>
                    </label>
                    <div className="md:col-span-2">
                      <input 
                        type="text" 
                        name="awardBy"
                        required
                        value={formData.awardBy}
                        onChange={handleInputChange}
                        placeholder="Award by"
                        className="w-full border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
                    <button 
                      type="button"
                      onClick={handleCloseModal}
                      className="px-4 py-2 bg-[#F8D7DA] text-[#721C24] rounded text-sm font-bold hover:bg-[#F5C6CB] transition-colors"
                    >
                      Close
                    </button>
                    <button 
                      type="submit"
                      className="px-4 py-2 bg-[#28A745] text-white rounded text-sm font-bold hover:bg-[#218838] transition-colors"
                    >
                      Save
                    </button>
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
