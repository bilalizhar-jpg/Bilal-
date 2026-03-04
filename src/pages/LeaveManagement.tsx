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
  const { leaveRequests, updateLeaveStatus } = useLeaves();
  const activeEmployees = employees.filter(e => e.status === 'Active');
  const isDark = theme === 'dark';
  const [activeTab, setActiveTab] = useState<TabType>('weekly');
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'holiday' | 'type' | 'approval'>('holiday');
  const [editingItem, setEditingItem] = useState<any>(null);

  // Data States
  const [weeklyHolidays, setWeeklyHolidays] = useState<WeeklyHoliday>({
    id: '1',
    days: ['Sunday', 'Monday', 'Wednesday', 'Friday']
  });

  const [holidays, setHolidays] = useState<Holiday[]>([
    { id: '1', name: 'Eid Vacation', fromDate: '2025-09-22', toDate: '2025-09-23', totalDays: 2 },
    { id: '2', name: 'GOOD FRIDAY', fromDate: '2025-04-18', toDate: '2025-04-18', totalDays: 1 },
    { id: '3', name: 'Vacation', fromDate: '2025-04-19', toDate: '2025-04-20', totalDays: 2 },
    { id: '4', name: 'Eid', fromDate: '2025-04-01', toDate: '2025-04-05', totalDays: 5 },
    { id: '5', name: 'Diwali', fromDate: '2024-11-11', toDate: '2024-11-14', totalDays: 4 },
  ]);

  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([
    { id: '1', name: 'Recreational Leave', days: 30 },
    { id: '2', name: 'Half', days: 1 },
    { id: '3', name: 'Medical Leave', days: 6 },
    { id: '4', name: 'MEDICAL LEAVE', days: 12 },
    { id: '5', name: 'EARNED LEAVE', days: 10 },
    { id: '6', name: 'Annual Leave', days: 22 },
  ]);

  const applications = leaveRequests;

  const filteredApplications = applications.filter(app => 
    activeEmployees.some(e => e.name === app.employeeName || e.id === app.employeeId)
  );

  // Form States
  const [holidayForm, setHolidayForm] = useState<Partial<Holiday>>({ name: '', fromDate: '', toDate: '', totalDays: 0 });
  const [typeForm, setTypeForm] = useState<Partial<LeaveType>>({ name: '', days: 0, customFields: [] });
  const [approvalForm, setApprovalForm] = useState<Partial<LeaveRequest>>({ status: 'Pending' });

  const handleSaveHoliday = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingItem) {
      setHolidays(prev => prev.map(h => h.id === editingItem.id ? { ...h, ...holidayForm } as Holiday : h));
    } else {
      setHolidays(prev => [...prev, { ...holidayForm, id: Math.random().toString(36).substr(2, 9) } as Holiday]);
    }
    setIsModalOpen(false);
    setEditingItem(null);
  };

  const handleSaveLeaveType = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingItem) {
      setLeaveTypes(prev => prev.map(t => t.id === editingItem.id ? { ...t, ...typeForm } as LeaveType : t));
    } else {
      setLeaveTypes(prev => [...prev, { ...typeForm, id: Math.random().toString(36).substr(2, 9) } as LeaveType]);
    }
    setIsModalOpen(false);
    setEditingItem(null);
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
              className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
                activeTab === 'weekly' ? 'bg-[#28A745] text-white' : 'bg-[#E9ECEF] text-slate-600 hover:bg-slate-200'
              }`}
            >
              Weekly holiday
            </button>
            <button 
              onClick={() => setActiveTab('holiday')}
              className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
                activeTab === 'holiday' ? 'bg-[#28A745] text-white' : 'bg-[#E9ECEF] text-slate-600 hover:bg-slate-200'
              }`}
            >
              Holiday
            </button>
            <button 
              onClick={() => setActiveTab('type')}
              className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
                activeTab === 'type' ? 'bg-[#28A745] text-white' : 'bg-[#E9ECEF] text-slate-600 hover:bg-slate-200'
              }`}
            >
              Leave type
            </button>
            <button 
              onClick={() => setActiveTab('approval')}
              className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
                activeTab === 'approval' ? 'bg-[#28A745] text-white' : 'bg-[#E9ECEF] text-slate-600 hover:bg-slate-200'
              }`}
            >
              Leave approval
            </button>
            <button 
              onClick={() => setActiveTab('report')}
              className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
                activeTab === 'report' ? 'bg-[#28A745] text-white' : 'bg-[#E9ECEF] text-slate-600 hover:bg-slate-200'
              }`}
            >
              Leave report
            </button>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center">
              <h2 className="font-bold text-slate-800 capitalize">
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
                    className="bg-[#28A745] text-white px-3 py-1.5 rounded text-xs font-bold flex items-center gap-1.5 hover:bg-[#218838]"
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
                    className="bg-[#28A745] text-white px-3 py-1.5 rounded text-xs font-bold flex items-center gap-1.5 hover:bg-[#218838]"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add leave type
                  </button>
                )}
                {activeTab === 'report' && (
                  <button 
                    onClick={handlePrintAllReports}
                    className="bg-[#17A2B8] text-white px-3 py-1.5 rounded text-xs font-bold flex items-center gap-1.5 hover:bg-[#138496]"
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
                      <tr className="bg-slate-50/50 border-b border-slate-100">
                        <th className="px-4 py-3 text-xs font-bold text-slate-600 uppercase tracking-wider border-r border-slate-100">Sl</th>
                        <th className="px-4 py-3 text-xs font-bold text-slate-600 uppercase tracking-wider border-r border-slate-100">Day name</th>
                        <th className="px-4 py-3 text-xs font-bold text-slate-600 uppercase tracking-wider">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-4 py-3 text-sm text-slate-600 border-r border-slate-100">1</td>
                        <td className="px-4 py-3 text-sm text-slate-600 border-r border-slate-100">{weeklyHolidays.days.join(', ')}</td>
                        <td className="px-4 py-3 text-sm text-slate-600">
                          <button className="p-1.5 text-indigo-600 bg-indigo-50 rounded border border-indigo-100 hover:bg-indigo-100">
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
                      <tr className="bg-slate-50/50 border-b border-slate-100">
                        <th className="px-4 py-3 text-xs font-bold text-slate-600 uppercase tracking-wider border-r border-slate-100">Sl</th>
                        <th className="px-4 py-3 text-xs font-bold text-slate-600 uppercase tracking-wider border-r border-slate-100">Holiday name</th>
                        <th className="px-4 py-3 text-xs font-bold text-slate-600 uppercase tracking-wider border-r border-slate-100">From date</th>
                        <th className="px-4 py-3 text-xs font-bold text-slate-600 uppercase tracking-wider border-r border-slate-100">To date</th>
                        <th className="px-4 py-3 text-xs font-bold text-slate-600 uppercase tracking-wider border-r border-slate-100">Total days</th>
                        <th className="px-4 py-3 text-xs font-bold text-slate-600 uppercase tracking-wider">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {holidays.map((h, idx) => (
                        <tr key={h.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-4 py-3 text-sm text-slate-600 border-r border-slate-100">{idx + 1}</td>
                          <td className="px-4 py-3 text-sm text-slate-600 border-r border-slate-100">{h.name}</td>
                          <td className="px-4 py-3 text-sm text-slate-600 border-r border-slate-100">{h.fromDate}</td>
                          <td className="px-4 py-3 text-sm text-slate-600 border-r border-slate-100">{h.toDate}</td>
                          <td className="px-4 py-3 text-sm text-slate-600 border-r border-slate-100">{h.totalDays}</td>
                          <td className="px-4 py-3 text-sm text-slate-600">
                            <div className="flex gap-1">
                              <button 
                                onClick={() => {
                                  setModalType('holiday');
                                  setEditingItem(h);
                                  setHolidayForm(h);
                                  setIsModalOpen(true);
                                }}
                                className="p-1.5 text-indigo-600 bg-indigo-50 rounded border border-indigo-100 hover:bg-indigo-100"
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </button>
                              <button 
                                onClick={() => setHolidays(prev => prev.filter(item => item.id !== h.id))}
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
              )}

              {activeTab === 'type' && (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50/50 border-b border-slate-100">
                        <th className="px-4 py-3 text-xs font-bold text-slate-600 uppercase tracking-wider border-r border-slate-100">Sl</th>
                        <th className="px-4 py-3 text-xs font-bold text-slate-600 uppercase tracking-wider border-r border-slate-100">Leave type</th>
                        <th className="px-4 py-3 text-xs font-bold text-slate-600 uppercase tracking-wider border-r border-slate-100">Days</th>
                        <th className="px-4 py-3 text-xs font-bold text-slate-600 uppercase tracking-wider">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {leaveTypes.map((t, idx) => (
                        <tr key={t.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-4 py-3 text-sm text-slate-600 border-r border-slate-100">{idx + 1}</td>
                          <td className="px-4 py-3 text-sm text-slate-600 border-r border-slate-100">{t.name}</td>
                          <td className="px-4 py-3 text-sm text-slate-600 border-r border-slate-100">{t.days}</td>
                          <td className="px-4 py-3 text-sm text-slate-600">
                            <div className="flex gap-1">
                              <button 
                                onClick={() => {
                                  setModalType('type');
                                  setEditingItem(t);
                                  setTypeForm(t);
                                  setIsModalOpen(true);
                                }}
                                className="p-1.5 text-indigo-600 bg-indigo-50 rounded border border-indigo-100 hover:bg-indigo-100"
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </button>
                              <button 
                                onClick={() => setLeaveTypes(prev => prev.filter(item => item.id !== t.id))}
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
              )}

              {activeTab === 'approval' && (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50/50 border-b border-slate-100">
                        <th className="px-4 py-3 text-[10px] font-bold text-slate-600 uppercase tracking-wider border-r border-slate-100">Sl</th>
                        <th className="px-4 py-3 text-[10px] font-bold text-slate-600 uppercase tracking-wider border-r border-slate-100">Employee name</th>
                        <th className="px-4 py-3 text-[10px] font-bold text-slate-600 uppercase tracking-wider border-r border-slate-100">Type</th>
                        <th className="px-4 py-3 text-[10px] font-bold text-slate-600 uppercase tracking-wider border-r border-slate-100">Apply date</th>
                        <th className="px-4 py-3 text-[10px] font-bold text-slate-600 uppercase tracking-wider border-r border-slate-100">Leave start</th>
                        <th className="px-4 py-3 text-[10px] font-bold text-slate-600 uppercase tracking-wider border-r border-slate-100">Leave end</th>
                        <th className="px-4 py-3 text-[10px] font-bold text-slate-600 uppercase tracking-wider border-r border-slate-100">Days</th>
                        <th className="px-4 py-3 text-[10px] font-bold text-slate-600 uppercase tracking-wider border-r border-slate-100">Reason</th>
                        <th className="px-4 py-3 text-[10px] font-bold text-slate-600 uppercase tracking-wider border-r border-slate-100">Status</th>
                        <th className="px-4 py-3 text-[10px] font-bold text-slate-600 uppercase tracking-wider">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredApplications.map((app, idx) => (
                        <tr key={app.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-4 py-3 text-xs text-slate-600 border-r border-slate-100">{idx + 1}</td>
                          <td className="px-4 py-3 text-xs text-slate-600 border-r border-slate-100">{app.employeeName}</td>
                          <td className="px-4 py-3 text-xs text-slate-600 border-r border-slate-100">{app.type}</td>
                          <td className="px-4 py-3 text-xs text-slate-600 border-r border-slate-100">{app.appliedDate}</td>
                          <td className="px-4 py-3 text-xs text-slate-600 border-r border-slate-100">{app.startDate}</td>
                          <td className="px-4 py-3 text-xs text-slate-600 border-r border-slate-100">{app.endDate}</td>
                          <td className="px-4 py-3 text-xs text-slate-600 border-r border-slate-100">{app.days}</td>
                          <td className="px-4 py-3 text-xs text-slate-600 border-r border-slate-100 truncate max-w-[150px]" title={app.reason}>{app.reason}</td>
                          <td className="px-4 py-3 text-xs border-r border-slate-100">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              app.status === 'Approved' ? 'bg-emerald-50 text-emerald-600' : 
                              app.status === 'Rejected' ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-600'
                            }`}>
                              {app.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-xs text-slate-600">
                            <div className="flex gap-1">
                              {app.status === 'Pending' && (
                                <>
                                  <button 
                                    onClick={() => handleApprove(app.id)}
                                    title="Approve"
                                    className="p-1.5 text-emerald-600 bg-emerald-50 rounded border border-emerald-100 hover:bg-emerald-100"
                                  >
                                    <Check className="w-3.5 h-3.5" />
                                  </button>
                                  <button 
                                    onClick={() => handleReject(app.id)}
                                    title="Reject"
                                    className="p-1.5 text-red-600 bg-red-50 rounded border border-red-100 hover:bg-red-100"
                                  >
                                    <X className="w-3.5 h-3.5" />
                                  </button>
                                </>
                              )}
                              {(app.status === 'Approved' || app.status === 'Rejected') && (
                                <button 
                                  onClick={() => handleRevert(app.id)}
                                  title="Revert to Pending"
                                  className="p-1.5 text-amber-600 bg-amber-50 rounded border border-amber-100 hover:bg-amber-100"
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
                                className="p-1.5 text-indigo-600 bg-indigo-50 rounded border border-indigo-100 hover:bg-indigo-100"
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
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-slate-50 p-4 rounded-lg border border-slate-100">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase">Employee</label>
                      <select className="w-full border border-slate-200 rounded px-3 py-1.5 text-sm outline-none bg-white">
                        <option>All Employees</option>
                        {activeEmployees.map(e => (
                          <option key={e.id} value={e.name}>{e.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase">Leave Type</label>
                      <select className="w-full border border-slate-200 rounded px-3 py-1.5 text-sm outline-none bg-white">
                        <option>All Types</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase">Status</label>
                      <select className="w-full border border-slate-200 rounded px-3 py-1.5 text-sm outline-none bg-white">
                        <option>All Status</option>
                        <option>Approved</option>
                        <option>Pending</option>
                        <option>Rejected</option>
                      </select>
                    </div>
                    <div className="flex items-end">
                      <button className="w-full bg-indigo-600 text-white px-4 py-1.5 rounded text-sm font-bold hover:bg-indigo-700">
                        Filter Report
                      </button>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50/50 border-b border-slate-100">
                          <th className="px-4 py-3 text-xs font-bold text-slate-600 uppercase tracking-wider border-r border-slate-100">Sl</th>
                          <th className="px-4 py-3 text-xs font-bold text-slate-600 uppercase tracking-wider border-r border-slate-100">Employee</th>
                          <th className="px-4 py-3 text-xs font-bold text-slate-600 uppercase tracking-wider border-r border-slate-100">Total Leave</th>
                          <th className="px-4 py-3 text-xs font-bold text-slate-600 uppercase tracking-wider border-r border-slate-100">Used</th>
                          <th className="px-4 py-3 text-xs font-bold text-slate-600 uppercase tracking-wider border-r border-slate-100">Remaining</th>
                          <th className="px-4 py-3 text-xs font-bold text-slate-600 uppercase tracking-wider">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {activeEmployees.map((emp, idx) => (
                          <tr key={emp.id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="px-4 py-3 text-sm text-slate-600 border-r border-slate-100">{idx + 1}</td>
                            <td className="px-4 py-3 text-sm text-slate-600 border-r border-slate-100">{emp.name}</td>
                            <td className="px-4 py-3 text-sm text-slate-600 border-r border-slate-100">30</td>
                            <td className="px-4 py-3 text-sm text-slate-600 border-r border-slate-100">
                              {applications.filter(a => (a.employeeName === emp.name || a.employeeId === emp.id) && a.status === 'Approved').reduce((sum, a) => sum + a.days, 0)}
                            </td>
                            <td className="px-4 py-3 text-sm text-slate-600 border-r border-slate-100">
                              {30 - applications.filter(a => (a.employeeName === emp.name || a.employeeId === emp.id) && a.status === 'Approved').reduce((sum, a) => sum + a.days, 0)}
                            </td>
                            <td className="px-4 py-3 text-sm text-slate-600">
                              <button 
                                onClick={() => handleDownloadReport(emp.name)}
                                className="p-1.5 text-indigo-600 bg-indigo-50 rounded border border-indigo-100 hover:bg-indigo-100"
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
                <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                  <h3 className="font-bold text-slate-800">
                    {modalType === 'holiday' ? (editingItem ? 'Edit Holiday' : 'Add Holiday') : (editingItem ? 'Edit Leave Type' : 'Add Leave Type')}
                  </h3>
                  <button onClick={() => setIsModalOpen(false)} className="p-1 hover:bg-slate-200 rounded-full transition-colors">
                    <X className="w-5 h-5 text-slate-500" />
                  </button>
                </div>
                
                <form onSubmit={modalType === 'holiday' ? handleSaveHoliday : modalType === 'type' ? handleSaveLeaveType : handleSaveApproval} className="p-6 space-y-4">
                  {modalType === 'holiday' ? (
                    <>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Holiday Name</label>
                        <input 
                          required
                          type="text" 
                          value={holidayForm.name}
                          onChange={(e) => setHolidayForm({...holidayForm, name: e.target.value})}
                          className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                          placeholder="Eid Vacation"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">From Date</label>
                          <input 
                            required
                            type="date" 
                            value={holidayForm.fromDate}
                            onChange={(e) => setHolidayForm({...holidayForm, fromDate: e.target.value})}
                            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">To Date</label>
                          <input 
                            required
                            type="date" 
                            value={holidayForm.toDate}
                            onChange={(e) => setHolidayForm({...holidayForm, toDate: e.target.value})}
                            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                          />
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Total Days</label>
                        <input 
                          required
                          type="number" 
                          value={holidayForm.totalDays}
                          onChange={(e) => setHolidayForm({...holidayForm, totalDays: parseInt(e.target.value)})}
                          className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                        />
                      </div>
                    </>
                  ) : modalType === 'type' ? (
                    <>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Leave Type Name</label>
                        <input 
                          required
                          type="text" 
                          value={typeForm.name}
                          onChange={(e) => setTypeForm({...typeForm, name: e.target.value})}
                          className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                          placeholder="Medical Leave"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Days</label>
                        <input 
                          required
                          type="number" 
                          value={typeForm.days}
                          onChange={(e) => setTypeForm({...typeForm, days: parseInt(e.target.value)})}
                          className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                        />
                      </div>
                      
                      {/* Custom Fields */}
                      <div className="pt-4 border-t border-slate-100">
                        <div className="flex items-center justify-between mb-2">
                          <label className="text-[10px] font-bold text-slate-500 uppercase">Custom Fields</label>
                          <button 
                            type="button"
                            onClick={() => setTypeForm(prev => ({ ...prev, customFields: [...(prev.customFields || []), { key: '', value: '' }] }))}
                            className="text-[10px] font-bold text-indigo-600 hover:text-indigo-700"
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
                                className="flex-1 border border-slate-200 rounded px-2 py-1 text-xs outline-none"
                              />
                              <input 
                                placeholder="Value"
                                value={cf.value}
                                onChange={(e) => {
                                  const updated = [...(typeForm.customFields || [])];
                                  updated[idx].value = e.target.value;
                                  setTypeForm({ ...typeForm, customFields: updated });
                                }}
                                className="flex-1 border border-slate-200 rounded px-2 py-1 text-xs outline-none"
                              />
                              <button 
                                type="button"
                                onClick={() => setTypeForm(prev => ({ ...prev, customFields: (prev.customFields || []).filter((_, i) => i !== idx) }))}
                                className="text-red-500 hover:bg-red-50 p-1 rounded"
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
                        <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Employee Name</label>
                        <input 
                          disabled
                          type="text" 
                          value={approvalForm.employeeName || ''}
                          className="w-full border border-slate-200 bg-slate-50 rounded-lg px-3 py-2 text-sm outline-none"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Leave Type</label>
                        <input 
                          disabled
                          type="text" 
                          value={approvalForm.type || ''}
                          className="w-full border border-slate-200 bg-slate-50 rounded-lg px-3 py-2 text-sm outline-none"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Reason</label>
                        <textarea 
                          disabled
                          rows={2}
                          value={(editingItem as any)?.reason || ''}
                          className="w-full border border-slate-200 bg-slate-50 rounded-lg px-3 py-2 text-sm outline-none resize-none"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Status</label>
                        <select 
                          value={approvalForm.status || 'Pending'}
                          onChange={(e) => setApprovalForm({...approvalForm, status: e.target.value as any})}
                          className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
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
                      className="px-4 py-2 rounded-lg text-sm font-bold text-slate-600 hover:bg-slate-100 transition-colors"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit"
                      className="px-4 py-2 rounded-lg text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all"
                    >
                      Save Changes
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
