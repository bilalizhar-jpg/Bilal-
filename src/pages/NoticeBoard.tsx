import React, { useState } from 'react';
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
  Upload,
  ChevronDown
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface Notice {
  id: string;
  type: string;
  description: string;
  date: string;
  by: string;
  attachment?: string;
}

export default function NoticeBoard() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNotice, setEditingNotice] = useState<Notice | null>(null);

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

  const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { name: 'Attendance', icon: Calendar, hasSub: true, path: '/attendance' },
    { name: 'Award', icon: Award, hasSub: true, path: '/award' },
    { name: 'Department', icon: Building2, hasSub: true, path: '/department' },
    { name: 'Employee', icon: Users, hasSub: true, path: '/employee' },
    { name: 'Leave', icon: UserMinus, hasSub: true, path: '/leave' },
    { name: 'Loan', icon: CreditCard, hasSub: true, path: '/loan' },
    { name: 'Notice board', icon: Bell, active: true, hasSub: true, path: '/notice' },
    { name: 'Payroll', icon: DollarSign, hasSub: true },
    { name: 'Procurement', icon: Briefcase, hasSub: true },
    { name: 'Project management', icon: ClipboardList, hasSub: true },
    { name: 'Recruitment', icon: UserCheck, hasSub: true },
    { name: 'Reports', icon: FileText, hasSub: true },
    { name: 'Reward points', icon: Target, hasSub: true },
    { name: 'Setup rules', icon: Settings, hasSub: true },
    { name: 'Settings', icon: Settings, hasSub: true },
    { name: 'Message', icon: MessageSquare, hasSub: true },
  ];

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
    if (confirm('Are you sure you want to delete this notice?')) {
      setNotices(prev => prev.filter(n => n.id !== id));
    }
  };

  const filteredNotices = notices.filter(n => 
    n.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    n.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    n.by.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#F0F2F5] flex">
      {/* Sidebar */}
      <aside className={`${isSidebarOpen ? 'w-64' : 'w-20'} bg-white border-r border-slate-200 flex flex-col transition-all duration-300 shrink-0`}>
        <div className="p-4 flex items-center gap-2 border-b border-slate-100 h-16">
          <div className="bg-indigo-600 p-1.5 rounded-lg shrink-0">
            <Building2 className="w-6 h-6 text-white" />
          </div>
          {isSidebarOpen && <span className="font-display font-bold text-xl tracking-tight text-slate-800">HRM Pro</span>}
        </div>
        
        <nav className="flex-1 overflow-y-auto px-2 py-4 space-y-1 custom-scrollbar">
          {menuItems.map((item) => (
            <Link
              key={item.name}
              to={item.path || '#'}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                item.active 
                  ? 'bg-[#E8F0FE] text-[#1A73E8]' 
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center gap-3">
                <item.icon className={`w-5 h-5 ${item.active ? 'text-[#1A73E8]' : 'text-slate-500'}`} />
                {isSidebarOpen && <span>{item.name}</span>}
              </div>
              {isSidebarOpen && item.hasSub && <ChevronRight className="w-4 h-4 text-slate-400" />}
            </Link>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 text-slate-500 hover:bg-slate-100 rounded-md">
              <Menu className="w-5 h-5" />
            </button>
            <button className="flex items-center gap-2 px-3 py-1.5 bg-[#F8F9FA] border border-slate-200 rounded text-xs font-medium text-slate-600 hover:bg-slate-100">
              <RefreshCw className="w-3.5 h-3.5 text-emerald-500" />
              Cache clear
            </button>
          </div>
          
          <div className="flex items-center gap-6">
            <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-md">
              <Maximize2 className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
              <div className="text-right">
                <div className="text-sm font-bold text-slate-800">Admin Admin</div>
                <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Admin</div>
              </div>
              <div className="h-9 w-9 rounded-full bg-slate-200 overflow-hidden border border-slate-300">
                <img src="https://picsum.photos/seed/admin/100/100" alt="Admin" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center">
              <h2 className="font-bold text-slate-800">Notice list</h2>
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

            <div className="p-4 flex justify-between items-center bg-slate-50/50 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500">Show</span>
                <select className="border border-slate-200 rounded px-2 py-1 text-xs outline-none bg-white">
                  <option>10</option>
                  <option>25</option>
                  <option>50</option>
                </select>
                <span className="text-xs text-slate-500">entries</span>
              </div>
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Search..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 pr-3 py-1.5 border border-slate-200 rounded text-xs outline-none focus:ring-1 focus:ring-indigo-500 w-48 bg-white"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-100">
                    <th className="px-4 py-3 text-[10px] font-bold text-slate-600 uppercase tracking-wider border-r border-slate-100">Sl</th>
                    <th className="px-4 py-3 text-[10px] font-bold text-slate-600 uppercase tracking-wider border-r border-slate-100">Notice type</th>
                    <th className="px-4 py-3 text-[10px] font-bold text-slate-600 uppercase tracking-wider border-r border-slate-100">Description</th>
                    <th className="px-4 py-3 text-[10px] font-bold text-slate-600 uppercase tracking-wider border-r border-slate-100">Notice date</th>
                    <th className="px-4 py-3 text-[10px] font-bold text-slate-600 uppercase tracking-wider border-r border-slate-100">Notice by</th>
                    <th className="px-4 py-3 text-[10px] font-bold text-slate-600 uppercase tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredNotices.map((notice, idx) => (
                    <tr key={notice.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-4 py-3 text-xs text-slate-600 border-r border-slate-100">{idx + 1}</td>
                      <td className="px-4 py-3 text-xs text-slate-600 border-r border-slate-100 font-medium">{notice.type}</td>
                      <td className="px-4 py-3 text-xs text-slate-600 border-r border-slate-100">{notice.description}</td>
                      <td className="px-4 py-3 text-xs text-slate-600 border-r border-slate-100">{notice.date}</td>
                      <td className="px-4 py-3 text-xs text-slate-600 border-r border-slate-100">{notice.by}</td>
                      <td className="px-4 py-3 text-xs text-slate-600">
                        <div className="flex gap-1">
                          <button 
                            onClick={() => {
                              setEditingNotice(notice);
                              setFormData(notice);
                              setIsModalOpen(true);
                            }}
                            className="p-1.5 text-indigo-600 bg-indigo-50 rounded border border-indigo-100 hover:bg-indigo-100"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button 
                            onClick={() => handleDelete(notice.id)}
                            className="p-1.5 text-red-600 bg-red-50 rounded border border-red-100 hover:bg-red-100"
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

            <div className="p-4 border-t border-slate-100 flex justify-between items-center text-sm text-slate-500">
              <div>Showing 1 to {filteredNotices.length} of {notices.length} entries</div>
              <div className="flex items-center gap-1">
                <button className="px-3 py-1 border border-slate-200 rounded hover:bg-slate-50 disabled:opacity-50">Previous</button>
                <button className="px-3 py-1 bg-[#1A73E8] text-white rounded">1</button>
                <button className="px-3 py-1 border border-slate-200 rounded hover:bg-slate-50 disabled:opacity-50">Next</button>
              </div>
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
                className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden"
              >
                <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                  <h3 className="font-bold text-slate-800">{editingNotice ? 'Edit notice' : 'New notice'}</h3>
                  <button onClick={() => setIsModalOpen(false)} className="p-1 hover:bg-slate-200 rounded-full transition-colors">
                    <X className="w-5 h-5 text-slate-500" />
                  </button>
                </div>
                
                <form onSubmit={handleSave} className="p-6 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-4">
                    <label className="text-sm font-bold text-slate-700">Notice type <span className="text-red-500">*</span></label>
                    <div className="md:col-span-2">
                      <input 
                        required
                        type="text" 
                        value={formData.type}
                        onChange={(e) => setFormData({...formData, type: e.target.value})}
                        className="w-full border border-slate-200 rounded px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-indigo-500"
                        placeholder="Notice type"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-4">
                    <label className="text-sm font-bold text-slate-700">Notice description <span className="text-red-500">*</span></label>
                    <div className="md:col-span-2">
                      <textarea 
                        required
                        value={formData.description}
                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                        className="w-full border border-slate-200 rounded px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-indigo-500 h-24"
                        placeholder="Notice description"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-4">
                    <label className="text-sm font-bold text-slate-700">Notice date <span className="text-red-500">*</span></label>
                    <div className="md:col-span-2">
                      <input 
                        required
                        type="date" 
                        value={formData.date}
                        onChange={(e) => setFormData({...formData, date: e.target.value})}
                        className="w-full border border-slate-200 rounded px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-4">
                    <label className="text-sm font-bold text-slate-700">Notice attachment</label>
                    <div className="md:col-span-2">
                      <div className="flex items-center gap-2">
                        <label className="flex items-center gap-2 px-3 py-2 bg-slate-100 border border-slate-200 rounded text-sm text-slate-600 cursor-pointer hover:bg-slate-200 transition-colors">
                          <Upload className="w-4 h-4" />
                          <span>Choose file</span>
                          <input type="file" className="hidden" />
                        </label>
                        <span className="text-xs text-slate-400">No file chosen</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-4">
                    <label className="text-sm font-bold text-slate-700">Notice by <span className="text-red-500">*</span></label>
                    <div className="md:col-span-2">
                      <input 
                        required
                        type="text" 
                        value={formData.by}
                        onChange={(e) => setFormData({...formData, by: e.target.value})}
                        className="w-full border border-slate-200 rounded px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-indigo-500"
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

        {/* Footer */}
        <footer className="h-12 bg-white border-t border-slate-200 flex items-center justify-between px-6 shrink-0 text-[11px] text-slate-500">
          <div>© 2026 BDTASK. All Rights Reserved.</div>
          <div>Designed by: <span className="text-indigo-600 font-bold">Bdtask</span></div>
        </footer>
      </main>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>
    </div>
  );
}
