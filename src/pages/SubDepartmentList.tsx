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

interface SubDepartment {
  id: number;
  name: string;
  parentDept: string;
  status: 'Active' | 'Inactive';
  isDeleted?: boolean;
  deletedAt?: number;
}

export default function SubDepartmentList() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSubDept, setEditingSubDept] = useState<SubDepartment | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentTime, setCurrentTime] = useState(Date.now());

  const [subDepartments, setSubDepartments] = useState<SubDepartment[]>([
    { id: 1, name: 'HR', parentDept: 'Electrical', status: 'Active' },
    { id: 2, name: 'Accounts', parentDept: 'Electrical', status: 'Active' },
    { id: 3, name: 'Finance', parentDept: 'Production', status: 'Active' },
    { id: 4, name: 'Sales', parentDept: 'Production', status: 'Active' },
    { id: 5, name: 'Angelica Goff', parentDept: 'Electrical', status: 'Active' },
  ]);

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingSubDept) {
      setSubDepartments(subDepartments.map(s => s.id === editingSubDept.id ? { ...s, ...formData } : s));
    } else {
      const newSubDept: SubDepartment = {
        id: Math.max(0, ...subDepartments.map(s => s.id)) + 1,
        ...formData
      };
      setSubDepartments([...subDepartments, newSubDept]);
    }
    handleCloseModal();
  };

  const handleDelete = (id: number) => {
    setSubDepartments(subDepartments.map(s => 
      s.id === id ? { ...s, isDeleted: true, deletedAt: Date.now() } : s
    ));
  };

  const handleRecover = (id: number) => {
    setSubDepartments(subDepartments.map(s => 
      s.id === id ? { ...s, isDeleted: false, deletedAt: undefined } : s
    ));
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

  const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { name: 'Attendance', icon: Calendar, hasSub: true, path: '/attendance' },
    { name: 'Award', icon: Award, hasSub: true, path: '/award' },
    { name: 'Department', icon: Building2, active: true, hasSub: true, path: '/department' },
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
            <button className="flex items-center gap-2 px-3 py-1.5 bg-[#F8F9FA] border border-slate-200 rounded text-xs font-medium text-slate-600">
              <RefreshCw className="w-3.5 h-3.5 text-emerald-500" />
              Cache clear
            </button>
          </div>
          <div className="flex items-center gap-6">
            <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-md"><Maximize2 className="w-5 h-5" /></button>
            <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
              <div className="text-right">
                <div className="text-sm font-bold text-slate-800">Admin Admin</div>
                <div className="text-[10px] text-slate-500 uppercase font-bold">Admin</div>
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
                        {sub.name}
                        {sub.isDeleted && <span className="ml-2 text-[10px] font-bold text-red-600 uppercase tracking-wider">(Deleted)</span>}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-600 border-r border-slate-100">{sub.parentDept}</td>
                      <td className="px-4 py-3 text-sm border-r border-slate-100">
                        <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase ${sub.status === 'Active' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>
                          {sub.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <div className="flex items-center gap-2">
                          {!sub.isDeleted ? (
                            <>
                              <button onClick={() => handleOpenModal(sub)} className="p-1.5 text-emerald-600 bg-emerald-50 rounded border border-emerald-100 hover:bg-emerald-100"><Edit className="w-3.5 h-3.5" /></button>
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
        </div>
      </main>

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
                    <option value="Electrical">Electrical</option>
                    <option value="Production">Production</option>
                    <option value="Human Resources">Human Resources</option>
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

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
      `}</style>
    </div>
  );
}
