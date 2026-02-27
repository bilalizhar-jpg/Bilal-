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
  Award as AwardIcon,
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
  FileText as FileCsv
} from 'lucide-react';
import { Link } from 'react-router-dom';

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
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
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
      const newAward = {
        id: awards.length + 1,
        ...formData
      };
      setAwards([...awards, newAward]);
    }
    handleCloseModal();
  };

  const handleDelete = (id: number) => {
    if (window.confirm('Are you sure you want to delete this award?')) {
      setAwards(awards.filter(a => a.id !== id));
    }
  };

  const filteredAwards = awards.filter(a => 
    a.awardName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.employeeName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { name: 'Attendance', icon: Calendar, hasSub: true, path: '/attendance' },
    { name: 'Award', icon: AwardIcon, active: true, hasSub: true, path: '/award' },
    { name: 'Department', icon: Building2, hasSub: true },
    { name: 'Employee', icon: Users, hasSub: true },
    { name: 'Leave', icon: UserMinus, hasSub: true },
    { name: 'Loan', icon: CreditCard, hasSub: true },
    { name: 'Notice board', icon: Bell, hasSub: true, path: '/notice' },
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
        
        <div className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder={isSidebarOpen ? "Menu Search..." : ""} 
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-md text-sm focus:ring-1 focus:ring-indigo-500 outline-none"
            />
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto px-2 space-y-1 custom-scrollbar">
          {menuItems.map((item) => (
            <Link
              key={item.name}
              to={item.name === 'Dashboard' ? '/dashboard' : item.name === 'Attendance' ? '/attendance' : item.name === 'Award' ? '/award' : item.name === 'Department' ? '/department' : item.name === 'Employee' ? '/employee' : item.name === 'Leave' ? '/leave' : item.name === 'Loan' ? '/loan' : item.name === 'Notice board' ? '/notice' : '#'}
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
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 text-slate-500 hover:bg-slate-100 rounded-md"
            >
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
          <div className="flex justify-between items-center">
            <h1 className="text-xl font-bold text-slate-800">Award list</h1>
            <button 
              onClick={() => handleOpenModal()}
              className="bg-[#28A745] text-white px-4 py-2 rounded text-sm font-bold flex items-center gap-2 hover:bg-[#218838] transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add new award
            </button>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex flex-wrap justify-between items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-slate-600">
                Show 
                <select className="border border-slate-200 rounded px-2 py-1 outline-none">
                  <option>10</option>
                  <option>25</option>
                  <option>50</option>
                </select>
                entries
              </div>
              
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <button className="bg-[#28A745] text-white px-3 py-1.5 rounded text-xs font-bold flex items-center gap-1.5 hover:bg-[#218838]">
                    <FileCsv className="w-3.5 h-3.5" />
                    CSV
                  </button>
                  <button className="bg-[#28A745] text-white px-3 py-1.5 rounded text-xs font-bold flex items-center gap-1.5 hover:bg-[#218838]">
                    <FileSpreadsheet className="w-3.5 h-3.5" />
                    Excel
                  </button>
                </div>
                
                <div className="flex items-center gap-2">
                  <span className="text-sm text-slate-600">Search:</span>
                  <input 
                    type="text" 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="border border-slate-200 rounded px-3 py-1.5 text-sm outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-100">
                    <th className="px-4 py-3 text-xs font-bold text-slate-600 uppercase tracking-wider border-r border-slate-100">Sl</th>
                    <th className="px-4 py-3 text-xs font-bold text-slate-600 uppercase tracking-wider border-r border-slate-100">Award name</th>
                    <th className="px-4 py-3 text-xs font-bold text-slate-600 uppercase tracking-wider border-r border-slate-100">Award description</th>
                    <th className="px-4 py-3 text-xs font-bold text-slate-600 uppercase tracking-wider border-r border-slate-100">Gift item</th>
                    <th className="px-4 py-3 text-xs font-bold text-slate-600 uppercase tracking-wider border-r border-slate-100">Date</th>
                    <th className="px-4 py-3 text-xs font-bold text-slate-600 uppercase tracking-wider border-r border-slate-100">Employee name</th>
                    <th className="px-4 py-3 text-xs font-bold text-slate-600 uppercase tracking-wider border-r border-slate-100">Award by</th>
                    <th className="px-4 py-3 text-xs font-bold text-slate-600 uppercase tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredAwards.map((award, index) => (
                    <tr key={award.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-4 py-3 text-sm text-slate-600 border-r border-slate-100">{index + 1}</td>
                      <td className="px-4 py-3 text-sm text-slate-600 border-r border-slate-100">{award.awardName}</td>
                      <td className="px-4 py-3 text-sm text-slate-600 border-r border-slate-100">{award.description}</td>
                      <td className="px-4 py-3 text-sm text-slate-600 border-r border-slate-100">{award.giftItem}</td>
                      <td className="px-4 py-3 text-sm text-slate-600 border-r border-slate-100">{award.date}</td>
                      <td className="px-4 py-3 text-sm text-slate-600 border-r border-slate-100">{award.employeeName}</td>
                      <td className="px-4 py-3 text-sm text-slate-600 border-r border-slate-100">{award.awardBy}</td>
                      <td className="px-4 py-3 text-sm text-slate-600">
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => handleOpenModal(award)}
                            className="p-1.5 text-emerald-600 bg-emerald-50 rounded border border-emerald-100 hover:bg-emerald-100 transition-colors"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button 
                            onClick={() => handleDelete(award.id)}
                            className="p-1.5 text-red-600 bg-red-50 rounded border border-red-100 hover:bg-red-100 transition-colors"
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
              <div>Showing 1 to {filteredAwards.length} of {awards.length} entries</div>
              <div className="flex items-center gap-1">
                <button className="px-3 py-1 border border-slate-200 rounded hover:bg-slate-50 disabled:opacity-50">Previous</button>
                <button className="px-3 py-1 bg-[#1A73E8] text-white rounded">1</button>
                <button className="px-3 py-1 border border-slate-200 rounded hover:bg-slate-50 disabled:opacity-50">Next</button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="h-12 bg-white border-t border-slate-200 flex items-center justify-between px-6 shrink-0 text-[11px] text-slate-500">
          <div>© 2026 BDTASK. All Rights Reserved.</div>
          <div>Designed by: <span className="text-indigo-600 font-bold">Bdtask</span></div>
        </footer>
      </main>

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
              className="relative bg-white rounded-lg shadow-xl w-full max-w-2xl overflow-hidden"
            >
              <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-white">
                <h2 className="font-bold text-slate-800">Award form</h2>
                <button onClick={handleCloseModal} className="p-1 hover:bg-slate-100 rounded-full transition-colors">
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-4">
                  <label className="text-sm font-bold text-slate-700">
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
                      className="w-full border border-slate-200 rounded px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 items-start gap-4">
                  <label className="text-sm font-bold text-slate-700 pt-2">
                    Award description
                  </label>
                  <div className="md:col-span-2">
                    <textarea 
                      name="description"
                      rows={3}
                      value={formData.description}
                      onChange={handleInputChange}
                      placeholder="Award description"
                      className="w-full border border-slate-200 rounded px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-indigo-500 resize-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-4">
                  <label className="text-sm font-bold text-slate-700">
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
                      className="w-full border border-slate-200 rounded px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-4">
                  <label className="text-sm font-bold text-slate-700">
                    Date <span className="text-red-500">*</span>
                  </label>
                  <div className="md:col-span-2">
                    <input 
                      type="date" 
                      name="date"
                      required
                      value={formData.date}
                      onChange={handleInputChange}
                      className="w-full border border-slate-200 rounded px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-4">
                  <label className="text-sm font-bold text-slate-700">
                    Employee name <span className="text-red-500">*</span>
                  </label>
                  <div className="md:col-span-2">
                    <input 
                      type="text" 
                      name="employeeName"
                      required
                      value={formData.employeeName}
                      onChange={handleInputChange}
                      placeholder="Employee name"
                      className="w-full border border-slate-200 rounded px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-4">
                  <label className="text-sm font-bold text-slate-700">
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
                      className="w-full border border-slate-200 rounded px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
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
