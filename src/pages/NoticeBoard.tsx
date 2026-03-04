import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search,
  Plus, 
  Edit, 
  Trash2, 
  X, 
  Upload
} from 'lucide-react';
import AdminLayout from '../components/AdminLayout';

interface Notice {
  id: string;
  type: string;
  description: string;
  date: string;
  by: string;
  attachment?: string;
}

export default function NoticeBoard() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNotice, setEditingNotice] = useState<Notice | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const [notices, setNotices] = useState<Notice[]>([
    { id: '1', type: 'Govt special', description: 'Eid', date: '2026-01-31', by: 'sfsdf' },
    { id: '2', type: 'Test Warning', description: 'Warning for all', date: '2025-04-20', by: 'Admin' },
    { id: '3', type: 'General Meeting', description: 'Meeting with nurses at 10 hrs', date: '2025-04-06', by: 'HR' },
    { id: '4', type: 'Policy', description: 'dededed', date: '2025-01-16', by: 'admin' },
  ]);

  const [formData, setFormData] = useState<Partial<Notice>>({
    type: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    by: 'Admin'
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingNotice) {
      setNotices(prev => prev.map(n => n.id === editingNotice.id ? { ...n, ...formData } as Notice : n));
    } else {
      const newNotice = {
        ...formData,
        id: Math.random().toString(36).substr(2, 9),
      } as Notice;
      setNotices(prev => [...prev, newNotice]);
    }
    setIsModalOpen(false);
    setEditingNotice(null);
  };

  const handleDelete = (id: string) => {
    setDeleteConfirmId(id);
  };

  const confirmDelete = () => {
    if (deleteConfirmId) {
      setNotices(prev => prev.filter(n => n.id !== deleteConfirmId));
      setDeleteConfirmId(null);
    }
  };

  const filteredNotices = notices.filter(n => 
    n.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    n.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    n.by.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
            <h2 className="font-bold text-slate-800 dark:text-white">Notice list</h2>
            <button 
              onClick={() => {
                setEditingNotice(null);
                setFormData({
                  type: '',
                  description: '',
                  date: new Date().toISOString().split('T')[0],
                  by: 'Admin'
                });
                setIsModalOpen(true);
              }}
              className="bg-[#28A745] text-white px-3 py-1.5 rounded text-xs font-bold flex items-center gap-1.5 hover:bg-[#218838]"
            >
              <Plus className="w-3.5 h-3.5" />
              Add notice
            </button>
          </div>

          <div className="p-4 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 dark:text-slate-400">Show</span>
              <select className="border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded px-2 py-1 text-xs outline-none">
                <option>10</option>
                <option>25</option>
                <option>50</option>
              </select>
              <span className="text-xs text-slate-500 dark:text-slate-400">entries</span>
            </div>
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 pr-3 py-1.5 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded text-xs outline-none focus:ring-1 focus:ring-indigo-500 w-48"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                  <th className="px-4 py-3 text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider border-r border-slate-100 dark:border-slate-800">Sl</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider border-r border-slate-100 dark:border-slate-800">Notice type</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider border-r border-slate-100 dark:border-slate-800">Description</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider border-r border-slate-100 dark:border-slate-800">Notice date</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider border-r border-slate-100 dark:border-slate-800">Notice by</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredNotices.map((notice, idx) => (
                  <tr key={notice.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-4 py-3 text-xs text-slate-600 dark:text-slate-400 border-r border-slate-100 dark:border-slate-800">{idx + 1}</td>
                    <td className="px-4 py-3 text-xs text-slate-600 dark:text-slate-400 border-r border-slate-100 dark:border-slate-800 font-medium">{notice.type}</td>
                    <td className="px-4 py-3 text-xs text-slate-600 dark:text-slate-400 border-r border-slate-100 dark:border-slate-800">{notice.description}</td>
                    <td className="px-4 py-3 text-xs text-slate-600 dark:text-slate-400 border-r border-slate-100 dark:border-slate-800">{notice.date}</td>
                    <td className="px-4 py-3 text-xs text-slate-600 dark:text-slate-400 border-r border-slate-100 dark:border-slate-800">{notice.by}</td>
                    <td className="px-4 py-3 text-xs text-slate-600 dark:text-slate-400">
                      <div className="flex gap-1">
                        <button 
                          onClick={() => {
                            setEditingNotice(notice);
                            setFormData(notice);
                            setIsModalOpen(true);
                          }}
                          className="p-1.5 text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 rounded border border-indigo-100 dark:border-indigo-800 hover:bg-indigo-100"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button 
                          onClick={() => handleDelete(notice.id)}
                          className="p-1.5 text-red-600 bg-red-50 dark:bg-red-900/20 rounded border border-red-100 dark:border-red-800 hover:bg-red-100"
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

          <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-sm text-slate-500 dark:text-slate-400">
            <div>Showing 1 to {filteredNotices.length} of {notices.length} entries</div>
            <div className="flex items-center gap-1">
              <button className="px-3 py-1 border border-slate-200 dark:border-slate-700 rounded hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50">Previous</button>
              <button className="px-3 py-1 bg-[#1A73E8] text-white rounded">1</button>
              <button className="px-3 py-1 border border-slate-200 dark:border-slate-700 rounded hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50">Next</button>
            </div>
          </div>
        </div>

        {/* Modal */}
        <AnimatePresence>
          {isModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white dark:bg-slate-900 rounded-xl shadow-xl w-full max-w-lg overflow-hidden"
              >
                <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
                  <h3 className="font-bold text-slate-800 dark:text-white">{editingNotice ? 'Edit notice' : 'New notice'}</h3>
                  <button onClick={() => setIsModalOpen(false)} className="p-1 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full transition-colors">
                    <X className="w-5 h-5 text-slate-500" />
                  </button>
                </div>
                
                <form onSubmit={handleSave} className="p-6 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-4">
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Notice type <span className="text-red-500">*</span></label>
                    <div className="md:col-span-2">
                      <input 
                        required
                        type="text" 
                        value={formData.type}
                        onChange={(e) => setFormData({...formData, type: e.target.value})}
                        className="w-full border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-indigo-500"
                        placeholder="Notice type"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-4">
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Notice description <span className="text-red-500">*</span></label>
                    <div className="md:col-span-2">
                      <textarea 
                        required
                        value={formData.description}
                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                        className="w-full border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-indigo-500 h-24"
                        placeholder="Notice description"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-4">
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Notice date <span className="text-red-500">*</span></label>
                    <div className="md:col-span-2">
                      <input 
                        required
                        type="date" 
                        value={formData.date}
                        onChange={(e) => setFormData({...formData, date: e.target.value})}
                        className="w-full border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-4">
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Notice attachment</label>
                    <div className="md:col-span-2">
                      <div className="flex items-center gap-2">
                        <label className="flex items-center gap-2 px-3 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-sm text-slate-600 dark:text-slate-400 cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                          <Upload className="w-4 h-4" />
                          <span>Choose file</span>
                          <input type="file" className="hidden" />
                        </label>
                        <span className="text-xs text-slate-400 dark:text-slate-500">No file chosen</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-4">
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Notice by <span className="text-red-500">*</span></label>
                    <div className="md:col-span-2">
                      <input 
                        required
                        type="text" 
                        value={formData.by}
                        onChange={(e) => setFormData({...formData, by: e.target.value})}
                        className="w-full border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-indigo-500"
                        placeholder="Notice by"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-4">
                    <button 
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="px-4 py-2 bg-[#DC3545] text-white rounded text-sm font-bold hover:bg-[#C82333]"
                    >
                      Close
                    </button>
                    <button 
                      type="submit"
                      className="px-4 py-2 bg-[#007BFF] text-white rounded text-sm font-bold hover:bg-[#0069D9]"
                    >
                      Save
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Delete Confirmation Modal */}
        <AnimatePresence>
          {deleteConfirmId && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white dark:bg-slate-900 rounded-xl shadow-xl w-full max-w-md overflow-hidden"
              >
                <div className="p-6 text-center">
                  <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Trash2 className="w-8 h-8 text-red-600" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">Delete Notice</h3>
                  <p className="text-slate-500 dark:text-slate-400 mb-6">Are you sure you want to delete this notice? This action cannot be undone.</p>
                  <div className="flex justify-center gap-3">
                    <button 
                      onClick={() => setDeleteConfirmId(null)}
                      className="px-6 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={confirmDelete}
                      className="px-6 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </AdminLayout>
  );
}
