import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Building2, 
  Menu, 
  Maximize2, 
  RefreshCw, 
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
  Search,
  Filter,
  Download,
  CheckCircle2,
  Clock,
  XCircle,
  Mail,
  Check
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface Loan {
  id: string;
  employeeName: string;
  permittedBy: string;
  loanNo: string;
  amount: number;
  interestRate: number;
  installmentPeriod: number;
  installmentCleared: number;
  repaymentAmount: number;
  approvedDate: string;
  repaymentFrom: string;
  status: 'Active' | 'Inactive';
  approvalStatus: 'Approved' | 'Under Consideration' | 'Rejected';
  autoReminder: boolean;
}

type TabType = 'loan-list' | 'disburse-report' | 'employee-wise';

export default function LoanManagement() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('loan-list');
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLoan, setEditingLoan] = useState<Loan | null>(null);

  const [loans, setLoans] = useState<Loan[]>([
    { id: '1', employeeName: 'Maisha Lucy Zamora Gonzales', permittedBy: 'Jerome Grace Willis Terry', loanNo: '000115', amount: 48000, interestRate: 0, installmentPeriod: 1000, installmentCleared: 0, repaymentAmount: 48000, approvedDate: '2026-01-28', repaymentFrom: '2026-01-14', status: 'Active', approvalStatus: 'Approved', autoReminder: true },
    { id: '2', employeeName: 'Honorato Imogene Curry Terry', permittedBy: 'Ora Caryn Garcia Cardenas', loanNo: '000114', amount: 1, interestRate: 20, installmentPeriod: 6, installmentCleared: 0, repaymentAmount: 1, approvedDate: '2026-01-21', repaymentFrom: '2026-06-21', status: 'Active', approvalStatus: 'Approved', autoReminder: false },
    { id: '3', employeeName: 'Jonathan Ibrahim Shekh', permittedBy: 'Nell Mohona Lacey Byers Lewis', loanNo: '000113', amount: 50000, interestRate: 5, installmentPeriod: 12, installmentCleared: 6, repaymentAmount: 52500, approvedDate: '2025-12-27', repaymentFrom: '2026-12-30', status: 'Active', approvalStatus: 'Approved', autoReminder: true },
    { id: '4', employeeName: 'Maisha Lucy Zamora Gonzales', permittedBy: 'Arnika Paula Roach Mcmillan', loanNo: '000112', amount: 10000, interestRate: 0, installmentPeriod: 1, installmentCleared: 0, repaymentAmount: 10000, approvedDate: '2025-12-05', repaymentFrom: '2025-12-06', status: 'Active', approvalStatus: 'Approved', autoReminder: false },
  ]);

  const [formData, setFormData] = useState<Partial<Loan>>({
    employeeName: '',
    permittedBy: '',
    amount: 0,
    interestRate: 0,
    installmentPeriod: 0,
    repaymentFrom: '',
    approvedDate: new Date().toISOString().split('T')[0],
    status: 'Active',
    approvalStatus: 'Under Consideration',
    autoReminder: true
  });

  const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { name: 'Attendance', icon: Calendar, hasSub: true, path: '/attendance' },
    { name: 'Award', icon: Award, hasSub: true, path: '/award' },
    { name: 'Department', icon: Building2, hasSub: true, path: '/department' },
    { name: 'Employee', icon: Users, hasSub: true, path: '/employee' },
    { name: 'Leave', icon: UserMinus, hasSub: true, path: '/leave' },
    { name: 'Loan', icon: CreditCard, active: true, hasSub: true, path: '/loan' },
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

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingLoan) {
      setLoans(prev => prev.map(l => l.id === editingLoan.id ? { ...l, ...formData } as Loan : l));
    } else {
      const newLoan = {
        ...formData,
        id: Math.random().toString(36).substr(2, 9),
        loanNo: `000${Math.floor(Math.random() * 900) + 100}`,
        installmentCleared: 0,
        repaymentAmount: (formData.amount || 0) * (1 + (formData.interestRate || 0) / 100)
      } as Loan;
      setLoans(prev => [...prev, newLoan]);
    }
    setIsModalOpen(false);
    setEditingLoan(null);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this loan record?')) {
      setLoans(prev => prev.filter(l => l.id !== id));
    }
  };

  const filteredLoans = loans.filter(l => 
    l.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.loanNo.includes(searchTerm)
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
          {/* Tabs */}
          <div className="flex items-center gap-2 mb-6">
            <button 
              onClick={() => setActiveTab('loan-list')}
              className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
                activeTab === 'loan-list' ? 'bg-[#28A745] text-white' : 'bg-[#E9ECEF] text-slate-600 hover:bg-slate-200'
              }`}
            >
              Loan
            </button>
            <button 
              onClick={() => setActiveTab('disburse-report')}
              className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
                activeTab === 'disburse-report' ? 'bg-[#28A745] text-white' : 'bg-[#E9ECEF] text-slate-600 hover:bg-slate-200'
              }`}
            >
              Loan disburse report
            </button>
            <button 
              onClick={() => setActiveTab('employee-wise')}
              className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
                activeTab === 'employee-wise' ? 'bg-[#28A745] text-white' : 'bg-[#E9ECEF] text-slate-600 hover:bg-slate-200'
              }`}
            >
              Employee wise loan
            </button>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center">
              <h2 className="font-bold text-slate-800">Loan list</h2>
              <div className="flex gap-2">
                <button className="bg-[#17A2B8] text-white px-3 py-1.5 rounded text-xs font-bold flex items-center gap-1.5 hover:bg-[#138496]">
                  <Filter className="w-3.5 h-3.5" />
                  Filter
                </button>
                <button 
                  onClick={() => {
                    setEditingLoan(null);
                    setFormData({
                      employeeName: '',
                      permittedBy: '',
                      amount: 0,
                      interestRate: 0,
                      installmentPeriod: 0,
                      repaymentFrom: '',
                      approvedDate: new Date().toISOString().split('T')[0],
                      status: 'Active',
                      approvalStatus: 'Under Consideration',
                      autoReminder: true
                    });
                    setIsModalOpen(true);
                  }}
                  className="bg-[#28A745] text-white px-3 py-1.5 rounded text-xs font-bold flex items-center gap-1.5 hover:bg-[#218838]"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add loan
                </button>
              </div>
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
              <div className="flex items-center gap-4">
                <div className="flex gap-1">
                  <button className="bg-[#28A745] text-white px-2 py-1 rounded text-[10px] font-bold flex items-center gap-1">
                    <FileText className="w-3 h-3" /> CSV
                  </button>
                  <button className="bg-[#28A745] text-white px-2 py-1 rounded text-[10px] font-bold flex items-center gap-1">
                    <FileText className="w-3 h-3" /> Excel
                  </button>
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
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-100">
                    <th className="px-4 py-3 text-[10px] font-bold text-slate-600 uppercase tracking-wider border-r border-slate-100">Sl</th>
                    <th className="px-4 py-3 text-[10px] font-bold text-slate-600 uppercase tracking-wider border-r border-slate-100">Employee name</th>
                    <th className="px-4 py-3 text-[10px] font-bold text-slate-600 uppercase tracking-wider border-r border-slate-100">Permitted by</th>
                    <th className="px-4 py-3 text-[10px] font-bold text-slate-600 uppercase tracking-wider border-r border-slate-100">Loan no</th>
                    <th className="px-4 py-3 text-[10px] font-bold text-slate-600 uppercase tracking-wider border-r border-slate-100">Amount</th>
                    <th className="px-4 py-3 text-[10px] font-bold text-slate-600 uppercase tracking-wider border-r border-slate-100">Interest rate</th>
                    <th className="px-4 py-3 text-[10px] font-bold text-slate-600 uppercase tracking-wider border-r border-slate-100">Installment period</th>
                    <th className="px-4 py-3 text-[10px] font-bold text-slate-600 uppercase tracking-wider border-r border-slate-100">Installment cleared</th>
                    <th className="px-4 py-3 text-[10px] font-bold text-slate-600 uppercase tracking-wider border-r border-slate-100">Repayment amount</th>
                    <th className="px-4 py-3 text-[10px] font-bold text-slate-600 uppercase tracking-wider border-r border-slate-100">Approved date</th>
                    <th className="px-4 py-3 text-[10px] font-bold text-slate-600 uppercase tracking-wider border-r border-slate-100">Repayment from</th>
                    <th className="px-4 py-3 text-[10px] font-bold text-slate-600 uppercase tracking-wider border-r border-slate-100">Approval Status</th>
                    <th className="px-4 py-3 text-[10px] font-bold text-slate-600 uppercase tracking-wider border-r border-slate-100">Status</th>
                    <th className="px-4 py-3 text-[10px] font-bold text-slate-600 uppercase tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredLoans.map((loan, idx) => (
                    <tr key={loan.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-4 py-3 text-xs text-slate-600 border-r border-slate-100">{idx + 1}</td>
                      <td className="px-4 py-3 text-xs text-slate-600 border-r border-slate-100 font-medium">{loan.employeeName}</td>
                      <td className="px-4 py-3 text-xs text-slate-600 border-r border-slate-100">{loan.permittedBy}</td>
                      <td className="px-4 py-3 text-xs text-slate-600 border-r border-slate-100 font-mono">{loan.loanNo}</td>
                      <td className="px-4 py-3 text-xs text-slate-600 border-r border-slate-100">${loan.amount.toLocaleString()}</td>
                      <td className="px-4 py-3 text-xs text-slate-600 border-r border-slate-100">{loan.interestRate}%</td>
                      <td className="px-4 py-3 text-xs text-slate-600 border-r border-slate-100">{loan.installmentPeriod}</td>
                      <td className="px-4 py-3 text-xs text-slate-600 border-r border-slate-100">{loan.installmentCleared}</td>
                      <td className="px-4 py-3 text-xs text-slate-600 border-r border-slate-100 font-bold text-indigo-600">${loan.repaymentAmount.toLocaleString()}</td>
                      <td className="px-4 py-3 text-xs text-slate-600 border-r border-slate-100">{loan.approvedDate}</td>
                      <td className="px-4 py-3 text-xs text-slate-600 border-r border-slate-100">{loan.repaymentFrom}</td>
                      <td className="px-4 py-3 text-xs border-r border-slate-100">
                        <div className="flex flex-col gap-1">
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider text-center ${
                            loan.approvalStatus === 'Approved' ? 'bg-emerald-50 text-emerald-600' : 
                            loan.approvalStatus === 'Rejected' ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-600'
                          }`}>
                            {loan.approvalStatus}
                          </span>
                          {loan.autoReminder && (
                            <span className="flex items-center gap-1 text-[9px] text-indigo-500 font-bold">
                              <Mail className="w-2.5 h-2.5" /> Reminder On
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs border-r border-slate-100">
                        <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded text-[10px] font-bold">{loan.status}</span>
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-600">
                        <div className="flex gap-1">
                          <button 
                            onClick={() => {
                              setEditingLoan(loan);
                              setFormData(loan);
                              setIsModalOpen(true);
                            }}
                            className="p-1.5 text-indigo-600 bg-indigo-50 rounded border border-indigo-100 hover:bg-indigo-100"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button 
                            onClick={() => handleDelete(loan.id)}
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
              <div>Showing 1 to {filteredLoans.length} of {loans.length} entries</div>
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
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-xl shadow-xl w-full max-w-2xl my-8 overflow-hidden flex flex-col"
              >
                <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                  <h3 className="font-bold text-slate-800">{editingLoan ? 'Edit Loan Record' : 'Add New Loan'}</h3>
                  <button onClick={() => setIsModalOpen(false)} className="p-1 hover:bg-slate-200 rounded-full transition-colors">
                    <X className="w-5 h-5 text-slate-500" />
                  </button>
                </div>
                
                <form onSubmit={handleSave} className="p-6 space-y-6 overflow-y-auto custom-scrollbar max-h-[75vh]">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Employee Name *</label>
                      <select 
                        required
                        value={formData.employeeName}
                        onChange={(e) => setFormData({...formData, employeeName: e.target.value})}
                        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all bg-white"
                      >
                        <option value="">Select employee</option>
                        <option value="Maisha Lucy Zamora Gonzales">Maisha Lucy Zamora Gonzales</option>
                        <option value="Honorato Imogene Curry Terry">Honorato Imogene Curry Terry</option>
                        <option value="Jonathan Ibrahim Shekh">Jonathan Ibrahim Shekh</option>
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Permitted By *</label>
                      <select 
                        required
                        value={formData.permittedBy}
                        onChange={(e) => setFormData({...formData, permittedBy: e.target.value})}
                        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all bg-white"
                      >
                        <option value="">Select supervisor</option>
                        <option value="Jerome Grace Willis Terry">Jerome Grace Willis Terry</option>
                        <option value="Ora Caryn Garcia Cardenas">Ora Caryn Garcia Cardenas</option>
                        <option value="Arnika Paula Roach Mcmillan">Arnika Paula Roach Mcmillan</option>
                      </select>
                    </div>
                    <div className="space-y-1.5 md:col-span-2">
                      <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Loan Details</label>
                      <textarea 
                        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all h-20"
                        placeholder="Enter loan details..."
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Amount *</label>
                      <input 
                        required
                        type="number" 
                        value={formData.amount}
                        onChange={(e) => setFormData({...formData, amount: parseFloat(e.target.value)})}
                        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                        placeholder="Amount"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Approved Date *</label>
                      <input 
                        required
                        type="date" 
                        value={formData.approvedDate}
                        onChange={(e) => setFormData({...formData, approvedDate: e.target.value})}
                        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Repayment From *</label>
                      <input 
                        required
                        type="date" 
                        value={formData.repaymentFrom}
                        onChange={(e) => setFormData({...formData, repaymentFrom: e.target.value})}
                        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Interest Percentage (%) *</label>
                      <input 
                        required
                        type="number" 
                        value={formData.interestRate}
                        onChange={(e) => setFormData({...formData, interestRate: parseFloat(e.target.value)})}
                        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                        placeholder="Interest percentage"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Installment Period *</label>
                      <input 
                        required
                        type="number" 
                        value={formData.installmentPeriod}
                        onChange={(e) => setFormData({...formData, installmentPeriod: parseInt(e.target.value)})}
                        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                        placeholder="Installment period"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Status *</label>
                      <select 
                        required
                        value={formData.status}
                        onChange={(e) => setFormData({...formData, status: e.target.value as any})}
                        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all bg-white"
                      >
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                      </select>
                    </div>
                  </div>

                  {/* Management Approval Section */}
                  <div className="pt-6 border-t border-slate-100">
                    <h4 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      Management Approval
                    </h4>
                    <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-4">
                      <div className="flex flex-wrap gap-6">
                        <label className="flex items-center gap-2 cursor-pointer group">
                          <input 
                            type="radio" 
                            name="approval" 
                            checked={formData.approvalStatus === 'Approved'}
                            onChange={() => setFormData({...formData, approvalStatus: 'Approved'})}
                            className="w-4 h-4 text-emerald-600 focus:ring-emerald-500"
                          />
                          <span className="text-sm text-slate-700 font-medium group-hover:text-emerald-600 transition-colors">Approved</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer group">
                          <input 
                            type="radio" 
                            name="approval" 
                            checked={formData.approvalStatus === 'Under Consideration'}
                            onChange={() => setFormData({...formData, approvalStatus: 'Under Consideration'})}
                            className="w-4 h-4 text-amber-600 focus:ring-amber-500"
                          />
                          <span className="text-sm text-slate-700 font-medium group-hover:text-amber-600 transition-colors">Under Consideration</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer group">
                          <input 
                            type="radio" 
                            name="approval" 
                            checked={formData.approvalStatus === 'Rejected'}
                            onChange={() => setFormData({...formData, approvalStatus: 'Rejected'})}
                            className="w-4 h-4 text-red-600 focus:ring-red-500"
                          />
                          <span className="text-sm text-slate-700 font-medium group-hover:text-red-600 transition-colors">Rejected</span>
                        </label>
                      </div>
                      
                      <div className="flex items-center gap-3 pt-2">
                        <div 
                          onClick={() => setFormData({...formData, autoReminder: !formData.autoReminder})}
                          className={`w-10 h-5 rounded-full p-1 cursor-pointer transition-colors ${formData.autoReminder ? 'bg-indigo-600' : 'bg-slate-300'}`}
                        >
                          <div className={`w-3 h-3 bg-white rounded-full transition-transform ${formData.autoReminder ? 'translate-x-5' : 'translate-x-0'}`} />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-slate-700">Auto Email Reminder</span>
                          <span className="text-[10px] text-slate-500">Notify employee when repayment date is near</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-4">
                    <button 
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="px-6 py-2 rounded-lg text-sm font-bold text-slate-600 hover:bg-slate-100 transition-colors border border-slate-200"
                    >
                      Close
                    </button>
                    <button 
                      type="button"
                      onClick={() => setFormData({
                        employeeName: '',
                        permittedBy: '',
                        amount: 0,
                        interestRate: 0,
                        installmentPeriod: 0,
                        repaymentFrom: '',
                        approvedDate: new Date().toISOString().split('T')[0],
                        status: 'Active',
                        approvalStatus: 'Under Consideration',
                        autoReminder: true
                      })}
                      className="px-6 py-2 rounded-lg text-sm font-bold text-white bg-blue-500 hover:bg-blue-600 transition-all"
                    >
                      Reset
                    </button>
                    <button 
                      type="submit"
                      className="px-6 py-2 rounded-lg text-sm font-bold text-white bg-[#28A745] hover:bg-[#218838] shadow-lg shadow-emerald-100 transition-all"
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
