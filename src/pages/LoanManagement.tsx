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
import AdminLayout from '../components/AdminLayout';
import { useTheme } from '../context/ThemeContext';
import { useSettings } from '../context/SettingsContext';
import { useCompanyData } from '../context/CompanyDataContext';
import * as XLSX from 'xlsx';

interface Loan {
  id: string;
  companyId: string;
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
  notifyEmployee?: boolean;
}

type TabType = 'loan-list' | 'disburse-report' | 'employee-wise';

export default function LoanManagement() {
  const { theme } = useTheme();
  const { formatCurrency } = useSettings();
  const isDark = theme === 'dark';
  const { loans, addEntity, updateEntity, deleteEntity } = useCompanyData();
  const [activeTab, setActiveTab] = useState<TabType>('loan-list');
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLoan, setEditingLoan] = useState<Loan | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filterEmployee, setFilterEmployee] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

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
    autoReminder: true,
    notifyEmployee: false
  });

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingLoan) {
      await updateEntity('loans', editingLoan.id, formData);
      if (formData.approvalStatus === 'Approved' && editingLoan.approvalStatus !== 'Approved') {
        alert(`Notification sent to Accounts Department and CEO: Loan for ${formData.employeeName} has been approved.`);
        if (formData.notifyEmployee) {
          alert(`Notification sent to ${formData.employeeName}'s dashboard: Your loan has been approved.`);
        }
      }
    } else {
      const newLoan = {
        ...formData,
        loanNo: `000${Math.floor(Math.random() * 900) + 100}`,
        installmentCleared: 0,
        repaymentAmount: (formData.amount || 0) * (1 + (formData.interestRate || 0) / 100)
      };
      await addEntity('loans', newLoan);
      if (formData.approvalStatus === 'Approved') {
        alert(`Notification sent to Accounts Department and CEO: Loan for ${formData.employeeName} has been approved.`);
        if (formData.notifyEmployee) {
          alert(`Notification sent to ${formData.employeeName}'s dashboard: Your loan has been approved.`);
        }
      }
    }
    setIsModalOpen(false);
    setEditingLoan(null);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this loan record?')) {
      await deleteEntity('loans', id);
    }
  };

  const filteredLoans = (loans as Loan[]).filter(l => {
    const matchesSearch = l.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) || l.loanNo.includes(searchTerm);
    const matchesEmployee = !filterEmployee || l.employeeName === filterEmployee;
    const matchesStatus = !filterStatus || l.status === filterStatus;
    return matchesSearch && matchesEmployee && matchesStatus;
  });

  const handleExport = (format: 'csv' | 'excel') => {
    const dataToExport = filteredLoans.map(l => ({
      'Employee Name': l.employeeName,
      'Permitted By': l.permittedBy,
      'Loan No': l.loanNo,
      'Amount': l.amount,
      'Interest Rate': `${l.interestRate}%`,
      'Installment Period': l.installmentPeriod,
      'Installment Cleared': l.installmentCleared,
      'Repayment Amount': l.repaymentAmount,
      'Approved Date': l.approvedDate,
      'Repayment From': l.repaymentFrom,
      'Approval Status': l.approvalStatus,
      'Status': l.status
    }));

    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Loans");
    
    if (format === 'csv') {
      XLSX.writeFile(wb, 'loan_list.csv');
    } else {
      XLSX.writeFile(wb, 'loan_list.xlsx');
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
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
                <button 
                  onClick={() => setShowFilters(!showFilters)}
                  className="bg-[#17A2B8] text-white px-3 py-1.5 rounded text-xs font-bold flex items-center gap-1.5 hover:bg-[#138496]"
                >
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
                      autoReminder: true,
                      notifyEmployee: false
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

            <AnimatePresence>
              {showFilters && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="p-4 bg-slate-50 border-b border-slate-100 overflow-hidden"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <select 
                      value={filterEmployee}
                      onChange={(e) => setFilterEmployee(e.target.value)}
                      className="border border-slate-200 rounded px-3 py-2 text-sm outline-none bg-white"
                    >
                      <option value="">All Employees</option>
                      {Array.from(new Set(loans.map(l => l.employeeName))).map(name => (
                        <option key={name} value={name}>{name}</option>
                      ))}
                    </select>
                    <select 
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                      className="border border-slate-200 rounded px-3 py-2 text-sm outline-none bg-white"
                    >
                      <option value="">All Status</option>
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => { setFilterEmployee(''); setFilterStatus(''); setSearchTerm(''); }}
                        className="bg-[#DC3545] text-white px-4 py-2 rounded text-sm font-bold hover:bg-[#C82333]"
                      >
                        Reset
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

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
                  <button 
                    onClick={() => handleExport('csv')}
                    className="bg-[#28A745] text-white px-2 py-1 rounded text-[10px] font-bold flex items-center gap-1"
                  >
                    <FileText className="w-3 h-3" /> CSV
                  </button>
                  <button 
                    onClick={() => handleExport('excel')}
                    className="bg-[#28A745] text-white px-2 py-1 rounded text-[10px] font-bold flex items-center gap-1"
                  >
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
                      <td className="px-4 py-3 text-xs text-slate-600 border-r border-slate-100">{formatCurrency(loan.amount || 0)}</td>
                      <td className="px-4 py-3 text-xs text-slate-600 border-r border-slate-100">{loan.interestRate}%</td>
                      <td className="px-4 py-3 text-xs text-slate-600 border-r border-slate-100">{loan.installmentPeriod}</td>
                      <td className="px-4 py-3 text-xs text-slate-600 border-r border-slate-100">{loan.installmentCleared}</td>
                      <td className="px-4 py-3 text-xs text-slate-600 border-r border-slate-100 font-bold text-indigo-600">{formatCurrency(loan.repaymentAmount || 0)}</td>
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
                        value={formData.amount || ''}
                        onChange={(e) => setFormData({...formData, amount: e.target.value ? parseFloat(e.target.value) : 0})}
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
                        value={formData.interestRate || ''}
                        onChange={(e) => setFormData({...formData, interestRate: e.target.value ? parseFloat(e.target.value) : 0})}
                        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                        placeholder="Interest percentage"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Installment Period *</label>
                      <input 
                        required
                        type="number" 
                        value={formData.installmentPeriod || ''}
                        onChange={(e) => setFormData({...formData, installmentPeriod: e.target.value ? parseInt(e.target.value) : 0})}
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
      </div>
    </AdminLayout>
  );
}
