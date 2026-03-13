import React, { useState, useEffect } from 'react';
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
  FileSpreadsheet,
  FileText as FileCsv,
  Check,
  Search,
  Filter,
  Download,
  AlertCircle
} from 'lucide-react';
import AdminLayout from '../components/AdminLayout';
import { useTheme } from '../context/ThemeContext';
import { useEmployees } from '../context/EmployeeContext';
import { useLeaves, LeaveRequest } from '../context/LeaveContext';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface WeeklyHoliday {
  id: string;
  days: string[];
}

interface Holiday {
  id: string;
  name: string;
  fromDate: string;
  toDate: string;
  totalDays: number;
}

interface LeaveType {
  id: string;
  name: string;
  days: number;
  customFields?: { key: string; value: string }[];
}

type TabType = 'weekly' | 'holiday' | 'type' | 'approval' | 'report';

export default function LeaveManagement() {
  const { theme } = useTheme();
  const { employees } = useEmployees();
  const { 
    leaveRequests, 
    updateLeaveStatus,
    holidays,
    weeklyHolidays,
    leaveTypes,
    addHoliday,
    updateHoliday,
    deleteHoliday,
    updateWeeklyHoliday,
    addLeaveType,
    updateLeaveType,
    deleteLeaveType
  } = useLeaves();
  const activeEmployees = employees.filter(e => e.status === 'Active');
  const isDark = theme === 'dark';
  const [activeTab, setActiveTab] = useState<TabType>('weekly');
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'holiday' | 'type' | 'approval' | 'weekly'>('holiday');
  const [editingItem, setEditingItem] = useState<any>(null);

  // Form States
  const [holidayForm, setHolidayForm] = useState<Partial<Holiday>>({ name: '', fromDate: '', toDate: '', totalDays: 0 });
  const [typeForm, setTypeForm] = useState<Partial<LeaveType>>({ name: '', days: 0, customFields: [] });
  const [approvalForm, setApprovalForm] = useState<Partial<LeaveRequest>>({ status: 'Pending' });
  const [weeklyForm, setWeeklyForm] = useState<string[]>([]);

  const applications = leaveRequests;

  const filteredApplications = applications.filter(app => 
    activeEmployees.some(e => e.name === app.employeeName || e.id === app.employeeId)
  );

  const handleSaveHoliday = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingItem) {
      updateHoliday(editingItem.id, holidayForm);
    } else {
      addHoliday(holidayForm as Omit<Holiday, 'id'>);
    }
    setIsModalOpen(false);
    setEditingItem(null);
  };

  const handleSaveLeaveType = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingItem) {
      updateLeaveType(editingItem.id, typeForm);
    } else {
      addLeaveType(typeForm as Omit<LeaveType, 'id'>);
    }
    setIsModalOpen(false);
    setEditingItem(null);
  };

  const handleSaveWeeklyHoliday = (e: React.FormEvent) => {
    e.preventDefault();
    updateWeeklyHoliday(weeklyForm);
    setIsModalOpen(false);
  };

  const handleSaveApproval = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingItem && approvalForm.status) {
      updateLeaveStatus(editingItem.id, approvalForm.status);
    }
    setIsModalOpen(false);
    setEditingItem(null);
  };

  const handleApprove = (id: string) => {
    updateLeaveStatus(id, 'Approved');
  };

  const handleReject = (id: string) => {
    updateLeaveStatus(id, 'Rejected');
  };

  const handleRevert = (id: string) => {
    updateLeaveStatus(id, 'Pending');
  };

  const handleDownloadReport = (empName: string) => {
    const doc = new jsPDF();
    doc.text(`Leave Report - ${empName}`, 14, 15);
    
    const used = applications.filter(a => (a.employeeName === empName || a.employeeId === empName) && a.status === 'Approved').reduce((sum, a) => sum + a.days, 0);
    const remaining = 30 - used;

    autoTable(doc, {
      head: [['Employee', 'Total Leave', 'Used', 'Remaining']],
      body: [
        [empName, '30', used.toString(), remaining.toString()]
      ],
      startY: 20,
    });
    
    doc.save(`leave_report_${empName.replace(/\s+/g, '_')}.pdf`);
  };

  const handlePrintAllReports = () => {
    const doc = new jsPDF();
    doc.text(`All Leave Reports`, 14, 15);
    
    const body = activeEmployees.map(emp => {
      const used = applications.filter(a => (a.employeeName === emp.name || a.employeeId === emp.id) && a.status === 'Approved').reduce((sum, a) => sum + a.days, 0);
      return [emp.name, '30', used.toString(), (30 - used).toString()];
    });

    autoTable(doc, {
      head: [['Employee', 'Total Leave', 'Used', 'Remaining']],
      body: body,
      startY: 20,
    });
    
    doc.save(`all_leave_reports.pdf`);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Tabs */}
        <div className="flex items-center gap-2 mb-6">
            <button 
              onClick={() => setActiveTab('weekly')}
              className={`px-4 py-2 rounded text-sm font-black uppercase tracking-tight transition-colors ${
                activeTab === 'weekly' ? 'bg-[#00FFCC] text-[#1E1E2F]' : 'bg-[#2A2A3D] text-[#B0B0C3] hover:bg-[#3A3A5D]'
              }`}
            >
              Weekly holiday
            </button>
            <button 
              onClick={() => setActiveTab('holiday')}
              className={`px-4 py-2 rounded text-sm font-black uppercase tracking-tight transition-colors ${
                activeTab === 'holiday' ? 'bg-[#00FFCC] text-[#1E1E2F]' : 'bg-[#2A2A3D] text-[#B0B0C3] hover:bg-[#3A3A5D]'
              }`}
            >
              Holiday
            </button>
            <button 
              onClick={() => setActiveTab('type')}
              className={`px-4 py-2 rounded text-sm font-black uppercase tracking-tight transition-colors ${
                activeTab === 'type' ? 'bg-[#00FFCC] text-[#1E1E2F]' : 'bg-[#2A2A3D] text-[#B0B0C3] hover:bg-[#3A3A5D]'
              }`}
            >
              Leave type
            </button>
            <button 
              onClick={() => setActiveTab('approval')}
              className={`px-4 py-2 rounded text-sm font-black uppercase tracking-tight transition-colors ${
                activeTab === 'approval' ? 'bg-[#00FFCC] text-[#1E1E2F]' : 'bg-[#2A2A3D] text-[#B0B0C3] hover:bg-[#3A3A5D]'
              }`}
            >
              Leave approval
            </button>
            <button 
              onClick={() => setActiveTab('report')}
              className={`px-4 py-2 rounded text-sm font-black uppercase tracking-tight transition-colors ${
                activeTab === 'report' ? 'bg-[#00FFCC] text-[#1E1E2F]' : 'bg-[#2A2A3D] text-[#B0B0C3] hover:bg-[#3A3A5D]'
              }`}
            >
              Leave report
            </button>
          </div>

          <div className="bg-[#2A2A3D] rounded-2xl border border-white/5 shadow-[0_4px_20px_rgba(0,255,204,0.05)] overflow-hidden">
            <div className="p-4 border-b border-white/5 flex justify-between items-center bg-[#1E1E2F]/50">
              <h2 className="font-black text-white uppercase tracking-tight">
                {activeTab === 'weekly' && 'Weekly holiday'}
                {activeTab === 'holiday' && 'Holiday list'}
                {activeTab === 'type' && 'Leave type list'}
                {activeTab === 'approval' && 'Leave approval list'}
                {activeTab === 'report' && 'Leave status report'}
              </h2>
              <div className="flex gap-2">
                {activeTab === 'holiday' && (
                  <button 
                    onClick={() => {
                      setModalType('holiday');
                      setEditingItem(null);
                      setHolidayForm({ name: '', fromDate: '', toDate: '', totalDays: 0 });
                      setIsModalOpen(true);
                    }}
                    className="bg-[#00FFCC] text-[#1E1E2F] px-3 py-1.5 rounded text-xs font-black uppercase hover:bg-[#00D1FF] flex items-center gap-1.5 shadow-[0_0_8px_rgba(0,255,204,0.4)]"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add holiday
                  </button>
                )}
                {activeTab === 'type' && (
                  <button 
                    onClick={() => {
                      setModalType('type');
                      setEditingItem(null);
                      setTypeForm({ name: '', days: 0, customFields: [] });
                      setIsModalOpen(true);
                    }}
                    className="bg-[#00FFCC] text-[#1E1E2F] px-3 py-1.5 rounded text-xs font-black uppercase hover:bg-[#00D1FF] flex items-center gap-1.5 shadow-[0_0_8px_rgba(0,255,204,0.4)]"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add leave type
                  </button>
                )}
                {activeTab === 'report' && (
                  <button 
                    onClick={handlePrintAllReports}
                    className="bg-transparent border border-[#00D1FF] text-[#00D1FF] px-3 py-1.5 rounded text-xs font-black uppercase hover:bg-[#00D1FF] hover:text-[#1E1E2F] flex items-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Print as PDF
                  </button>
                )}
              </div>
            </div>

            {/* Content based on Tab */}
            <div className="p-4">
              {activeTab === 'weekly' && (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-[#1E1E2F]/50 border-b border-white/5">
                        <th className="px-4 py-3 text-[10px] font-black text-[#B0B0C3] uppercase tracking-wider border-r border-white/5">Sl</th>
                        <th className="px-4 py-3 text-[10px] font-black text-[#B0B0C3] uppercase tracking-wider border-r border-white/5">Day name</th>
                        <th className="px-4 py-3 text-[10px] font-black text-[#B0B0C3] uppercase tracking-wider">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="hover:bg-[#3A3A5D]/50 transition-colors border-b border-white/5">
                        <td className="px-4 py-3 text-xs text-white border-r border-white/5">1</td>
                        <td className="px-4 py-3 text-xs text-white border-r border-white/5">{weeklyHolidays?.days.join(', ') || 'None'}</td>
                        <td className="px-4 py-3 text-xs text-white">
                          <button 
                            onClick={() => {
                              setModalType('weekly');
                              setWeeklyForm(weeklyHolidays?.days || []);
                              setIsModalOpen(true);
                            }}
                            className="p-1.5 text-[#00FFCC] bg-[#2A2A3D] rounded border border-[#00FFCC]/20 hover:bg-[#3A3A5D]"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}

              {activeTab === 'holiday' && (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-[#1E1E2F]/50 border-b border-white/5">
                        <th className="px-4 py-3 text-[10px] font-black text-[#B0B0C3] uppercase tracking-wider border-r border-white/5">Sl</th>
                        <th className="px-4 py-3 text-[10px] font-black text-[#B0B0C3] uppercase tracking-wider border-r border-white/5">Holiday name</th>
                        <th className="px-4 py-3 text-[10px] font-black text-[#B0B0C3] uppercase tracking-wider border-r border-white/5">From date</th>
                        <th className="px-4 py-3 text-[10px] font-black text-[#B0B0C3] uppercase tracking-wider border-r border-white/5">To date</th>
                        <th className="px-4 py-3 text-[10px] font-black text-[#B0B0C3] uppercase tracking-wider border-r border-white/5">Total days</th>
                        <th className="px-4 py-3 text-[10px] font-black text-[#B0B0C3] uppercase tracking-wider">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {holidays.map((h, idx) => (
                        <tr key={h.id} className="hover:bg-[#3A3A5D]/50 transition-colors">
                          <td className="px-4 py-3 text-xs text-white border-r border-white/5">{idx + 1}</td>
                          <td className="px-4 py-3 text-xs text-white border-r border-white/5">{h.name}</td>
                          <td className="px-4 py-3 text-xs text-white border-r border-white/5">{h.fromDate}</td>
                          <td className="px-4 py-3 text-xs text-white border-r border-white/5">{h.toDate}</td>
                          <td className="px-4 py-3 text-xs text-white border-r border-white/5">{h.totalDays}</td>
                          <td className="px-4 py-3 text-xs text-white">
                            <div className="flex gap-1">
                              <button 
                                onClick={() => {
                                  setModalType('holiday');
                                  setEditingItem(h);
                                  setHolidayForm(h);
                                  setIsModalOpen(true);
                                }}
                                className="p-1.5 text-[#00FFCC] bg-[#2A2A3D] rounded border border-[#00FFCC]/20 hover:bg-[#3A3A5D]"
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </button>
                              <button 
                                onClick={() => deleteHoliday(h.id)}
                                className="p-1.5 text-red-400 bg-[#2A2A3D] rounded border border-red-400/20 hover:bg-[#3A3A5D]"
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
              )}

              {activeTab === 'type' && (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-[#1E1E2F]/50 border-b border-white/5">
                        <th className="px-4 py-3 text-[10px] font-black text-[#B0B0C3] uppercase tracking-wider border-r border-white/5">Sl</th>
                        <th className="px-4 py-3 text-[10px] font-black text-[#B0B0C3] uppercase tracking-wider border-r border-white/5">Leave type</th>
                        <th className="px-4 py-3 text-[10px] font-black text-[#B0B0C3] uppercase tracking-wider border-r border-white/5">Days</th>
                        <th className="px-4 py-3 text-[10px] font-black text-[#B0B0C3] uppercase tracking-wider">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {leaveTypes.map((t, idx) => (
                        <tr key={t.id} className="hover:bg-[#3A3A5D]/50 transition-colors">
                          <td className="px-4 py-3 text-xs text-white border-r border-white/5">{idx + 1}</td>
                          <td className="px-4 py-3 text-xs text-white border-r border-white/5">{t.name}</td>
                          <td className="px-4 py-3 text-xs text-white border-r border-white/5">{t.days}</td>
                          <td className="px-4 py-3 text-xs text-white">
                            <div className="flex gap-1">
                              <button 
                                onClick={() => {
                                  setModalType('type');
                                  setEditingItem(t);
                                  setTypeForm(t);
                                  setIsModalOpen(true);
                                }}
                                className="p-1.5 text-[#00FFCC] bg-[#2A2A3D] rounded border border-[#00FFCC]/20 hover:bg-[#3A3A5D]"
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </button>
                              <button 
                                onClick={() => deleteLeaveType(t.id)}
                                className="p-1.5 text-red-400 bg-[#2A2A3D] rounded border border-red-400/20 hover:bg-[#3A3A5D]"
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
              )}

              {activeTab === 'approval' && (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-[#1E1E2F]/50 border-b border-white/5">
                        <th className="px-4 py-3 text-[10px] font-black text-[#B0B0C3] uppercase tracking-wider border-r border-white/5">Sl</th>
                        <th className="px-4 py-3 text-[10px] font-black text-[#B0B0C3] uppercase tracking-wider border-r border-white/5">Employee name</th>
                        <th className="px-4 py-3 text-[10px] font-black text-[#B0B0C3] uppercase tracking-wider border-r border-white/5">Type</th>
                        <th className="px-4 py-3 text-[10px] font-black text-[#B0B0C3] uppercase tracking-wider border-r border-white/5">Apply date</th>
                        <th className="px-4 py-3 text-[10px] font-black text-[#B0B0C3] uppercase tracking-wider border-r border-white/5">Leave start</th>
                        <th className="px-4 py-3 text-[10px] font-black text-[#B0B0C3] uppercase tracking-wider border-r border-white/5">Leave end</th>
                        <th className="px-4 py-3 text-[10px] font-black text-[#B0B0C3] uppercase tracking-wider border-r border-white/5">Days</th>
                        <th className="px-4 py-3 text-[10px] font-black text-[#B0B0C3] uppercase tracking-wider border-r border-white/5">Reason</th>
                        <th className="px-4 py-3 text-[10px] font-black text-[#B0B0C3] uppercase tracking-wider border-r border-white/5">Status</th>
                        <th className="px-4 py-3 text-[10px] font-black text-[#B0B0C3] uppercase tracking-wider">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {filteredApplications.map((app, idx) => (
                        <tr key={app.id} className="hover:bg-[#3A3A5D]/50 transition-colors">
                          <td className="px-4 py-3 text-xs text-white border-r border-white/5">{idx + 1}</td>
                          <td className="px-4 py-3 text-xs text-white border-r border-white/5">{app.employeeName}</td>
                          <td className="px-4 py-3 text-xs text-white border-r border-white/5">{app.type}</td>
                          <td className="px-4 py-3 text-xs text-white border-r border-white/5">{app.appliedDate}</td>
                          <td className="px-4 py-3 text-xs text-white border-r border-white/5">{app.startDate}</td>
                          <td className="px-4 py-3 text-xs text-white border-r border-white/5">{app.endDate}</td>
                          <td className="px-4 py-3 text-xs text-white border-r border-white/5">{app.days}</td>
                          <td className="px-4 py-3 text-xs text-white border-r border-white/5 truncate max-w-[150px]" title={app.reason}>{app.reason}</td>
                          <td className="px-4 py-3 text-xs border-r border-white/5">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                              app.status === 'Approved' ? 'bg-[#00FFCC]/20 text-[#00FFCC]' : 
                              app.status === 'Rejected' ? 'bg-red-400/20 text-red-400' : 'bg-amber-400/20 text-amber-400'
                            }`}>
                              {app.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-xs text-white">
                            <div className="flex gap-1">
                              {app.status === 'Pending' && (
                                <>
                                  <button 
                                    onClick={() => handleApprove(app.id)}
                                    title="Approve"
                                    className="p-1.5 text-[#00FFCC] bg-[#2A2A3D] rounded border border-[#00FFCC]/20 hover:bg-[#3A3A5D]"
                                  >
                                    <Check className="w-3.5 h-3.5" />
                                  </button>
                                  <button 
                                    onClick={() => handleReject(app.id)}
                                    title="Reject"
                                    className="p-1.5 text-red-400 bg-[#2A2A3D] rounded border border-red-400/20 hover:bg-[#3A3A5D]"
                                  >
                                    <X className="w-3.5 h-3.5" />
                                  </button>
                                </>
                              )}
                              {(app.status === 'Approved' || app.status === 'Rejected') && (
                                <button 
                                  onClick={() => handleRevert(app.id)}
                                  title="Revert to Pending"
                                  className="p-1.5 text-amber-400 bg-[#2A2A3D] rounded border border-amber-400/20 hover:bg-[#3A3A5D]"
                                >
                                  <RefreshCw className="w-3.5 h-3.5" />
                                </button>
                              )}
                              <button 
                                onClick={() => {
                                  setModalType('approval');
                                  setEditingItem(app);
                                  setApprovalForm(app);
                                  setIsModalOpen(true);
                                }}
                                className="p-1.5 text-[#00FFCC] bg-[#2A2A3D] rounded border border-[#00FFCC]/20 hover:bg-[#3A3A5D]"
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {activeTab === 'report' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-[#1E1E2F] p-4 rounded-2xl border border-white/5">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-[#B0B0C3] uppercase tracking-wider">Employee</label>
                      <select className="w-full border border-white/10 rounded-lg px-3 py-2 text-sm outline-none bg-[#2A2A3D] text-white focus:border-[#00FFCC] transition-colors">
                        <option>All Employees</option>
                        {activeEmployees.map(e => (
                          <option key={e.id} value={e.name}>{e.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-[#B0B0C3] uppercase tracking-wider">Leave Type</label>
                      <select className="w-full border border-white/10 rounded-lg px-3 py-2 text-sm outline-none bg-[#2A2A3D] text-white focus:border-[#00FFCC] transition-colors">
                        <option>All Types</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-[#B0B0C3] uppercase tracking-wider">Status</label>
                      <select className="w-full border border-white/10 rounded-lg px-3 py-2 text-sm outline-none bg-[#2A2A3D] text-white focus:border-[#00FFCC] transition-colors">
                        <option>All Status</option>
                        <option>Approved</option>
                        <option>Pending</option>
                        <option>Rejected</option>
                      </select>
                    </div>
                    <div className="flex items-end">
                      <button className="w-full bg-[#00FFCC] text-[#1E1E2F] px-4 py-2 rounded-lg text-sm font-black uppercase hover:bg-[#00D1FF] shadow-[0_0_8px_rgba(0,255,204,0.4)]">
                        Filter Report
                      </button>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-[#1E1E2F]/50 border-b border-white/5">
                          <th className="px-4 py-3 text-[10px] font-black text-[#B0B0C3] uppercase tracking-wider border-r border-white/5">Sl</th>
                          <th className="px-4 py-3 text-[10px] font-black text-[#B0B0C3] uppercase tracking-wider border-r border-white/5">Employee</th>
                          <th className="px-4 py-3 text-[10px] font-black text-[#B0B0C3] uppercase tracking-wider border-r border-white/5">Total Leave</th>
                          <th className="px-4 py-3 text-[10px] font-black text-[#B0B0C3] uppercase tracking-wider border-r border-white/5">Used</th>
                          <th className="px-4 py-3 text-[10px] font-black text-[#B0B0C3] uppercase tracking-wider border-r border-white/5">Remaining</th>
                          <th className="px-4 py-3 text-[10px] font-black text-[#B0B0C3] uppercase tracking-wider">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {activeEmployees.map((emp, idx) => (
                          <tr key={emp.id} className="hover:bg-[#3A3A5D]/50 transition-colors">
                            <td className="px-4 py-3 text-xs text-white border-r border-white/5">{idx + 1}</td>
                            <td className="px-4 py-3 text-xs text-white border-r border-white/5">{emp.name}</td>
                            <td className="px-4 py-3 text-xs text-white border-r border-white/5">30</td>
                            <td className="px-4 py-3 text-xs text-white border-r border-white/5">
                              {applications.filter(a => (a.employeeName === emp.name || a.employeeId === emp.id) && a.status === 'Approved').reduce((sum, a) => sum + a.days, 0)}
                            </td>
                            <td className="px-4 py-3 text-xs text-white border-r border-white/5">
                              {30 - applications.filter(a => (a.employeeName === emp.name || a.employeeId === emp.id) && a.status === 'Approved').reduce((sum, a) => sum + a.days, 0)}
                            </td>
                            <td className="px-4 py-3 text-xs text-white">
                              <button 
                                onClick={() => handleDownloadReport(emp.name)}
                                className="p-1.5 text-[#00FFCC] bg-[#2A2A3D] rounded border border-[#00FFCC]/20 hover:bg-[#3A3A5D]"
                              >
                                <Download className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
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
                className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden flex flex-col"
              >
                <div className="p-4 border-b border-white/5 flex justify-between items-center bg-[#1E1E2F]">
                  <h3 className="font-black text-white uppercase tracking-tight">
                    {modalType === 'holiday' ? (editingItem ? 'Edit Holiday' : 'Add Holiday') : (editingItem ? 'Edit Leave Type' : 'Add Leave Type')}
                  </h3>
                  <button onClick={() => setIsModalOpen(false)} className="p-1 hover:bg-[#3A3A5D] rounded-full transition-colors">
                    <X className="w-5 h-5 text-[#B0B0C3]" />
                  </button>
                </div>
                
                <form onSubmit={
                  modalType === 'holiday' ? handleSaveHoliday : 
                  modalType === 'type' ? handleSaveLeaveType : 
                  modalType === 'weekly' ? handleSaveWeeklyHoliday :
                  handleSaveApproval
                } className="p-6 space-y-4 bg-[#2A2A3D]">
                  {modalType === 'weekly' ? (
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-[#B0B0C3] uppercase tracking-wider">Select Days</label>
                      <div className="grid grid-cols-2 gap-2">
                        {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map(day => (
                          <label key={day} className="flex items-center gap-2 cursor-pointer">
                            <input 
                              type="checkbox"
                              checked={weeklyForm.includes(day)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setWeeklyForm([...weeklyForm, day]);
                                } else {
                                  setWeeklyForm(weeklyForm.filter(d => d !== day));
                                }
                              }}
                              className="rounded border-white/10 bg-[#1E1E2F] text-[#00FFCC] focus:ring-[#00FFCC]"
                            />
                            <span className="text-sm text-white">{day}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  ) : modalType === 'holiday' ? (
                    <>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-[#B0B0C3] uppercase tracking-wider">Holiday Name</label>
                        <input 
                          required
                          type="text" 
                          value={holidayForm.name}
                          onChange={(e) => setHolidayForm({...holidayForm, name: e.target.value})}
                          className="w-full border border-white/10 bg-[#1E1E2F] text-white rounded-lg px-3 py-2 text-sm outline-none focus:border-[#00FFCC] transition-all"
                          placeholder="Eid Vacation"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-black text-[#B0B0C3] uppercase tracking-wider">From Date</label>
                          <input 
                            required
                            type="date" 
                            value={holidayForm.fromDate}
                            onChange={(e) => setHolidayForm({...holidayForm, fromDate: e.target.value})}
                            className="w-full border border-white/10 bg-[#1E1E2F] text-white rounded-lg px-3 py-2 text-sm outline-none focus:border-[#00FFCC] transition-all"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-black text-[#B0B0C3] uppercase tracking-wider">To Date</label>
                          <input 
                            required
                            type="date" 
                            value={holidayForm.toDate}
                            onChange={(e) => setHolidayForm({...holidayForm, toDate: e.target.value})}
                            className="w-full border border-white/10 bg-[#1E1E2F] text-white rounded-lg px-3 py-2 text-sm outline-none focus:border-[#00FFCC] transition-all"
                          />
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-[#B0B0C3] uppercase tracking-wider">Total Days</label>
                        <input 
                          required
                          type="number" 
                          value={holidayForm.totalDays ?? ''}
                          onChange={(e) => {
                            const val = e.target.value;
                            const num = parseInt(val);
                            setHolidayForm({...holidayForm, totalDays: isNaN(num) ? 0 : num});
                          }}
                          className="w-full border border-white/10 bg-[#1E1E2F] text-white rounded-lg px-3 py-2 text-sm outline-none focus:border-[#00FFCC] transition-all"
                        />
                      </div>
                    </>
                  ) : modalType === 'type' ? (
                    <>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-[#B0B0C3] uppercase tracking-wider">Leave Type Name</label>
                        <input 
                          required
                          type="text" 
                          value={typeForm.name}
                          onChange={(e) => setTypeForm({...typeForm, name: e.target.value})}
                          className="w-full border border-white/10 bg-[#1E1E2F] text-white rounded-lg px-3 py-2 text-sm outline-none focus:border-[#00FFCC] transition-all"
                          placeholder="Medical Leave"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-[#B0B0C3] uppercase tracking-wider">Days</label>
                        <input 
                          required
                          type="number" 
                          value={typeForm.days ?? ''}
                          onChange={(e) => {
                            const val = e.target.value;
                            const num = parseInt(val);
                            setTypeForm({...typeForm, days: isNaN(num) ? 0 : num});
                          }}
                          className="w-full border border-white/10 bg-[#1E1E2F] text-white rounded-lg px-3 py-2 text-sm outline-none focus:border-[#00FFCC] transition-all"
                        />
                      </div>
                      
                      {/* Custom Fields */}
                      <div className="pt-4 border-t border-white/5">
                        <div className="flex items-center justify-between mb-2">
                          <label className="text-[10px] font-black text-[#B0B0C3] uppercase tracking-wider">Custom Fields</label>
                          <button 
                            type="button"
                            onClick={() => setTypeForm(prev => ({ ...prev, customFields: [...(prev.customFields || []), { key: '', value: '' }] }))}
                            className="text-[10px] font-black text-[#00FFCC] hover:text-[#00D1FF]"
                          >
                            + Add Field
                          </button>
                        </div>
                        <div className="space-y-2">
                          {typeForm.customFields?.map((cf, idx) => (
                            <div key={idx} className="flex gap-2">
                              <input 
                                placeholder="Key"
                                value={cf.key}
                                onChange={(e) => {
                                  const updated = [...(typeForm.customFields || [])];
                                  updated[idx].key = e.target.value;
                                  setTypeForm({ ...typeForm, customFields: updated });
                                }}
                                className="flex-1 border border-white/10 bg-[#1E1E2F] text-white rounded px-2 py-1 text-xs outline-none"
                              />
                              <input 
                                placeholder="Value"
                                value={cf.value}
                                onChange={(e) => {
                                  const updated = [...(typeForm.customFields || [])];
                                  updated[idx].value = e.target.value;
                                  setTypeForm({ ...typeForm, customFields: updated });
                                }}
                                className="flex-1 border border-white/10 bg-[#1E1E2F] text-white rounded px-2 py-1 text-xs outline-none"
                              />
                              <button 
                                type="button"
                                onClick={() => setTypeForm(prev => ({ ...prev, customFields: (prev.customFields || []).filter((_, i) => i !== idx) }))}
                                className="text-red-400 hover:bg-[#3A3A5D] p-1 rounded"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-[#B0B0C3] uppercase tracking-wider">Employee Name</label>
                        <input 
                          disabled
                          type="text" 
                          value={approvalForm.employeeName || ''}
                          className="w-full border border-white/10 bg-[#1E1E2F]/50 text-white rounded-lg px-3 py-2 text-sm outline-none"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-[#B0B0C3] uppercase tracking-wider">Leave Type</label>
                        <input 
                          disabled
                          type="text" 
                          value={approvalForm.type || ''}
                          className="w-full border border-white/10 bg-[#1E1E2F]/50 text-white rounded-lg px-3 py-2 text-sm outline-none"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-[#B0B0C3] uppercase tracking-wider">Reason</label>
                        <textarea 
                          disabled
                          rows={2}
                          value={(editingItem as any)?.reason || ''}
                          className="w-full border border-white/10 bg-[#1E1E2F]/50 text-white rounded-lg px-3 py-2 text-sm outline-none resize-none"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-[#B0B0C3] uppercase tracking-wider">Status</label>
                        <select 
                          value={approvalForm.status || 'Pending'}
                          onChange={(e) => setApprovalForm({...approvalForm, status: e.target.value as any})}
                          className="w-full border border-white/10 bg-[#1E1E2F] text-white rounded-lg px-3 py-2 text-sm outline-none focus:border-[#00FFCC] transition-all"
                        >
                          <option value="Pending">Pending</option>
                          <option value="Approved">Approved</option>
                          <option value="Rejected">Rejected</option>
                        </select>
                      </div>
                    </>
                  )}

                  <div className="mt-6 flex justify-end gap-3">
                    <button 
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="px-4 py-2 rounded-lg text-sm font-black text-[#B0B0C3] hover:bg-[#3A3A5D] transition-colors"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit"
                      className="px-4 py-2 rounded-lg text-sm font-black text-[#1E1E2F] bg-[#00FFCC] hover:bg-[#00D1FF] shadow-[0_0_8px_rgba(0,255,204,0.4)] transition-all"
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
