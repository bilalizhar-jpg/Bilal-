import React, { useState, useEffect } from 'react';
import EmployeeLayout from '../../components/EmployeeLayout';
import { 
  DollarSign, 
  Download, 
  FileText, 
  Calendar, 
  CreditCard, 
  ChevronRight,
  Eye,
  X,
  Printer,
  Building2,
  Trash2,
  Plus
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useSettings } from '../../context/SettingsContext';
import { useAuth } from '../../context/AuthContext';
import { useEmployees } from '../../context/EmployeeContext';
import { useCompanyData } from '../../context/CompanyDataContext';
import { useSuperAdmin } from '../../context/SuperAdminContext';
import { motion, AnimatePresence } from 'motion/react';
import { toPng } from 'html-to-image';
import jsPDF from 'jspdf';

interface PayslipRow {
  id: string;
  description: string;
  amount: number;
  rate: number;
  value: number;
  deduction: number;
  type: 'earning' | 'deduction';
}

export default function EmployeePayroll() {
  const { theme } = useTheme();
  const settings = useSettings();
  const { user } = useAuth();
  const { employees } = useEmployees();
  const { salaryRecords, loans } = useCompanyData();
  const { companies } = useSuperAdmin();
  const isDark = theme === 'dark';
  const [activeTab, setActiveTab] = useState<'slips' | 'advance' | 'loan'>('slips');
  const [isPayslipModalOpen, setIsPayslipModalOpen] = useState(false);
  const [selectedSlip, setSelectedSlip] = useState<any>(null);
  const [payslipRows, setPayslipRows] = useState<PayslipRow[]>([]);
  const [editableEmployeeInfo, setEditableEmployeeInfo] = useState<{label: string, value: string}[]>([]);

  const currentEmployee = employees.find(emp => emp.id === user?.id);
  const company = companies.find(c => c.id === currentEmployee?.companyId);

  const salarySlips = salaryRecords
    .filter(p => p.employeeId === currentEmployee?.id)
    .map(p => ({
      id: p.id,
      month: p.month,
      amount: `${settings.currency.symbol}${p.netSalary}`,
      status: p.status,
      date: p.paymentDate || '-',
      staffId: currentEmployee?.employeeId || '',
      position: currentEmployee?.designation || '',
      contact: currentEmployee?.mobile || '',
      address: currentEmployee?.location || '',
      workingHours: p.workingHours || 0,
      workedHours: p.workedHours || 0,
      recruitmentDate: currentEmployee?.joiningDate || '',
      note: p.note || ''
    }));

  const advanceRequests = loans
    .filter(l => l.employeeId === currentEmployee?.id && l.type === 'Advance')
    .map(l => ({
      id: l.id,
      date: l.requestDate,
      amount: `${settings.currency.symbol}${l.amount}`,
      reason: l.reason,
      status: l.status
    }));

  const loanRequests = loans
    .filter(l => l.employeeId === currentEmployee?.id && l.type !== 'Advance')
    .map(l => ({
      id: l.id,
      date: l.requestDate,
      amount: `${settings.currency.symbol}${l.amount}`,
      reason: l.reason,
      emi: `${settings.currency.symbol}${l.installmentAmount}/mo`,
      status: l.status,
      remaining: `${settings.currency.symbol}${l.remainingAmount}`
    }));

  useEffect(() => {
    if (selectedSlip && currentEmployee) {
      setEditableEmployeeInfo([
        { label: 'Employee name', value: currentEmployee.name },
        { label: 'Position', value: currentEmployee.designation },
        { label: 'Contact', value: currentEmployee.mobile },
        { label: 'Address', value: currentEmployee.location },
        { label: 'Total working hours', value: selectedSlip.workingHours.toString() },
        { label: 'Staff id', value: currentEmployee.employeeId },
        { label: 'Month', value: selectedSlip.month },
        { label: 'Recruitment date', value: currentEmployee.joiningDate },
        { label: 'Worked hours', value: selectedSlip.workedHours.toString() },
      ]);
      setPayslipRows([
        { id: '1', description: 'Basic salary', amount: currentEmployee.salary || 0, rate: 0, value: currentEmployee.salary || 0, deduction: 0, type: 'earning' },
        { id: '2', description: 'Transport allowance', amount: 0, rate: 0, value: 0, deduction: 0, type: 'earning' },
        { id: '3', description: 'State income tax', amount: 0, rate: 0, value: 0, deduction: currentEmployee.taxDeduction || 0, type: 'deduction' },
        { id: '4', description: 'Social security', amount: 0, rate: 0, value: 0, deduction: 0, type: 'deduction' },
      ]);
    }
  }, [selectedSlip, currentEmployee]);

  const totalEarnings = payslipRows.filter(r => r.type === 'earning').reduce((sum, r) => sum + Number(r.value || 0), 0);
  const totalDeductions = payslipRows.filter(r => r.type === 'deduction').reduce((sum, r) => sum + Number(r.deduction || 0), 0);
  const netSalary = totalEarnings - totalDeductions;

  const downloadPayslipPDF = async () => {
    let element = document.getElementById('payslip-content');
    if (!element) {
      setIsPayslipModalOpen(true);
      await new Promise(resolve => setTimeout(resolve, 500));
      element = document.getElementById('payslip-content');
    }
    if (!element) return;

    const buttons = element.querySelector('.no-print');
    if (buttons) (buttons as HTMLElement).style.display = 'none';

    try {
      const dataUrl = await toPng(element, {
        backgroundColor: isDark ? '#0f172a' : '#ffffff',
        pixelRatio: 2,
      });
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgProps = pdf.getImageProperties(dataUrl);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      pdf.addImage(dataUrl, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Payslip_${selectedSlip?.month || 'Month'}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
    } finally {
      if (buttons) (buttons as HTMLElement).style.display = 'flex';
    }
  };

  return (
    <EmployeeLayout>
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className={`text-3xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>Payroll & Finance</h1>
            <p className="text-slate-500 font-medium mt-1">Manage your salary slips, advance requests, and loans.</p>
          </div>
          
          {/* Tabs */}
          <div className={`flex p-1 rounded-2xl border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-slate-100 border-slate-200'}`}>
            <button
              onClick={() => setActiveTab('slips')}
              className={`px-6 py-2.5 text-sm font-bold rounded-xl transition-all ${
                activeTab === 'slips' 
                  ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm' 
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              Salary Slips
            </button>
            <button
              onClick={() => setActiveTab('advance')}
              className={`px-6 py-2.5 text-sm font-bold rounded-xl transition-all ${
                activeTab === 'advance' 
                  ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm' 
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              Advance
            </button>
            <button
              onClick={() => setActiveTab('loan')}
              className={`px-6 py-2.5 text-sm font-bold rounded-xl transition-all ${
                activeTab === 'loan' 
                  ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm' 
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              Loans
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className={`rounded-3xl border overflow-hidden shadow-xl ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
          
          {/* Salary Slips Tab */}
          {activeTab === 'slips' && (
            <div>
              <div className={`p-8 border-b ${isDark ? 'border-slate-800' : 'border-slate-50'} bg-slate-50/50 dark:bg-slate-800/20`}>
                <h3 className={`text-xl font-bold flex items-center gap-3 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-500">
                    <FileText className="w-5 h-5" />
                  </div>
                  Monthly Salary Slips
                </h3>
              </div>
              <div className={`divide-y ${isDark ? 'divide-slate-800' : 'divide-slate-50'}`}>
                {salarySlips.map((slip) => (
                  <div key={slip.id} className="p-8 flex flex-col lg:flex-row lg:items-center justify-between gap-6 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-all group">
                    <div className="flex items-center gap-6">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110 ${isDark ? 'bg-slate-800 text-indigo-400' : 'bg-indigo-50 text-indigo-600'}`}>
                        <Calendar className="w-7 h-7" />
                      </div>
                      <div>
                        <h4 className={`font-bold text-xl tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>{slip.month}</h4>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1.5 text-sm font-medium text-slate-500">
                          <span className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400 font-bold">
                            <DollarSign className="w-4 h-4" /> {slip.amount}
                          </span>
                          <span className="w-1 h-1 rounded-full bg-slate-300" />
                          <span className="flex items-center gap-1.5">
                            <Calendar className="w-4 h-4" /> Paid on {slip.date}
                          </span>
                        </div>
                        {slip.note && <p className="text-xs text-indigo-500 mt-2 font-bold uppercase tracking-wider">{slip.note}</p>}
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                      <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest ${
                        slip.status === 'Paid' 
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' 
                          : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                      }`}>
                        {slip.status}
                      </span>
                      <button 
                        onClick={() => {
                          setSelectedSlip(slip);
                          setIsPayslipModalOpen(true);
                        }}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${isDark ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 shadow-sm'}`}
                      >
                        <Eye className="w-4 h-4" />
                        View
                      </button>
                      <button 
                        onClick={() => {
                          setSelectedSlip(slip);
                          downloadPayslipPDF();
                        }}
                        className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-500/20 transition-all active:scale-95"
                      >
                        <Download className="w-4 h-4" />
                        PDF
                      </button>
                    </div>
                  </div>
                ))}
                {salarySlips.length === 0 && (
                  <div className="p-20 text-center">
                    <div className="w-16 h-16 rounded-3xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-4 opacity-50">
                      <FileText className="w-8 h-8" />
                    </div>
                    <p className="text-slate-500 font-medium">No salary slips found for your account.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Advance Salary Tab */}
          {activeTab === 'advance' && (
            <div className="p-8">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                <h3 className={`text-xl font-bold flex items-center gap-3 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-500">
                    <DollarSign className="w-5 h-5" />
                  </div>
                  Advance Requests
                </h3>
                <button className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-500/20 transition-all active:scale-95 flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  Request Advance
                </button>
              </div>
              
              <div className="overflow-x-auto custom-scrollbar">
                <table className="w-full text-left">
                  <thead>
                    <tr className={`border-b ${isDark ? 'border-slate-800 text-slate-400' : 'border-slate-100 text-slate-500'}`}>
                      <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest">Date Requested</th>
                      <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest">Amount</th>
                      <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest">Reason</th>
                      <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest">Status</th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${isDark ? 'divide-slate-800' : 'divide-slate-50'}`}>
                    {advanceRequests.map((req) => (
                      <tr key={req.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                        <td className={`px-6 py-5 text-sm font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{req.date}</td>
                        <td className="px-6 py-5 text-sm font-bold text-indigo-600 dark:text-indigo-400">{req.amount}</td>
                        <td className="px-6 py-5 text-sm text-slate-500 font-medium">{req.reason}</td>
                        <td className="px-6 py-5">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            req.status === 'Approved' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' :
                            'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                          }`}>
                            {req.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {advanceRequests.length === 0 && (
                      <tr>
                        <td colSpan={4} className="px-6 py-12 text-center text-slate-500 font-medium italic">
                          No advance salary requests found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Loan Requests Tab */}
          {activeTab === 'loan' && (
            <div className="p-8">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                <h3 className={`text-xl font-bold flex items-center gap-3 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-500">
                    <CreditCard className="w-5 h-5" />
                  </div>
                  Loan Management
                </h3>
                <button className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-500/20 transition-all active:scale-95 flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  Apply for Loan
                </button>
              </div>
              
              <div className="overflow-x-auto custom-scrollbar">
                <table className="w-full text-left">
                  <thead>
                    <tr className={`border-b ${isDark ? 'border-slate-800 text-slate-400' : 'border-slate-100 text-slate-500'}`}>
                      <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest">Date Applied</th>
                      <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest">Total Amount</th>
                      <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest">EMI Deduction</th>
                      <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest">Remaining</th>
                      <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest">Status</th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${isDark ? 'divide-slate-800' : 'divide-slate-50'}`}>
                    {loanRequests.map((req) => (
                      <tr key={req.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                        <td className={`px-6 py-5 text-sm font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{req.date}</td>
                        <td className="px-6 py-5 text-sm font-bold text-indigo-600 dark:text-indigo-400">{req.amount}</td>
                        <td className="px-6 py-5 text-sm text-slate-500 font-medium">{req.emi}</td>
                        <td className={`px-6 py-5 text-sm font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{req.remaining}</td>
                        <td className="px-6 py-5">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            req.status === 'Active' ? 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400' :
                            'bg-slate-500/10 text-slate-600 dark:text-slate-400'
                          }`}>
                            {req.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {loanRequests.length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-6 py-12 text-center text-slate-500 font-medium italic">
                          No active loans or loan requests found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Payslip Modal */}
        <AnimatePresence>
          {isPayslipModalOpen && selectedSlip && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm overflow-y-auto">
              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className={`rounded-3xl shadow-2xl w-full max-w-4xl my-8 overflow-hidden ${isDark ? 'bg-slate-900 border border-slate-800' : 'bg-white'}`}
              >
                <div className={`p-6 border-b ${isDark ? 'border-slate-800' : 'border-slate-100'} flex justify-between items-center sticky top-0 bg-inherit z-10 backdrop-blur-md`}>
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-500">
                      <FileText className="w-5 h-5" />
                    </div>
                    <h3 className={`font-bold text-lg tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>Salary Statement - {selectedSlip.month}</h3>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => window.print()} className={`p-2.5 rounded-xl transition-all hover:scale-110 ${isDark ? 'bg-slate-800 text-slate-400 hover:text-indigo-400' : 'bg-slate-100 text-slate-500 hover:text-indigo-600'}`}>
                      <Printer className="w-5 h-5" />
                    </button>
                    <button onClick={() => setIsPayslipModalOpen(false)} className={`p-2.5 rounded-xl transition-all hover:scale-110 ${isDark ? 'bg-slate-800 text-slate-400 hover:text-rose-400' : 'bg-slate-100 text-slate-500 hover:text-rose-600'}`}>
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <div className="p-10 space-y-10 print:p-0" id="payslip-content">
                  {/* Payslip Header */}
                  <div className="flex flex-col md:flex-row justify-between items-start gap-8">
                    <div className="space-y-4">
                      <div className="flex items-center gap-4">
                        <div className="bg-indigo-600 p-3 rounded-2xl w-16 h-16 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                          {company?.logo ? (
                            <img src={company.logo} alt={company.name} className="w-full h-full object-cover rounded-lg" />
                          ) : (
                            <Building2 className="w-8 h-8 text-white" />
                          )}
                        </div>
                        <div>
                          <h2 className={`text-2xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>{company?.name || 'Corporate HRM'}</h2>
                          <p className="text-sm text-slate-500 font-medium">Official Salary Statement</p>
                        </div>
                      </div>
                    </div>
                    <div className="text-right space-y-1">
                      <p className={`text-3xl font-bold tracking-tighter ${isDark ? 'text-white' : 'text-slate-900'}`}>PAYSLIP</p>
                      <p className="text-sm font-bold text-indigo-600 uppercase tracking-widest">{selectedSlip.month}</p>
                    </div>
                  </div>

                  {/* Employee Info Grid */}
                  <div className={`grid grid-cols-1 md:grid-cols-2 gap-8 p-8 rounded-3xl border ${isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50/50 border-slate-100'}`}>
                    <div className="space-y-4">
                      {editableEmployeeInfo.slice(0, 5).map((info, idx) => (
                        <div key={idx} className="flex justify-between items-center group">
                          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{info.label}</span>
                          <span className={`text-sm font-bold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>{info.value}</span>
                        </div>
                      ))}
                    </div>
                    <div className="space-y-4">
                      {editableEmployeeInfo.slice(5).map((info, idx) => (
                        <div key={idx} className="flex justify-between items-center group">
                          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{info.label}</span>
                          <span className={`text-sm font-bold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>{info.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Salary Table */}
                  <div className={`overflow-hidden border rounded-3xl ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className={`${isDark ? 'bg-slate-800' : 'bg-slate-50'} border-b ${isDark ? 'border-slate-700' : 'border-slate-100'}`}>
                          <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Description</th>
                          <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Amount</th>
                          <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Rate</th>
                          <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Value</th>
                          <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Deduction</th>
                        </tr>
                      </thead>
                      <tbody className={`divide-y ${isDark ? 'divide-slate-800' : 'divide-slate-50'}`}>
                        {/* Earnings */}
                        {payslipRows.filter(r => r.type === 'earning').map(row => (
                          <tr key={row.id} className="hover:bg-slate-50/30 dark:hover:bg-slate-800/30">
                            <td className={`px-6 py-4 text-sm font-bold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{row.description}</td>
                            <td className="px-6 py-4 text-sm font-medium text-slate-500">{row.amount || '-'}</td>
                            <td className="px-6 py-4 text-sm font-medium text-slate-500">{row.rate || '-'}</td>
                            <td className={`px-6 py-4 text-sm font-bold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>{row.value}</td>
                            <td className="px-6 py-4"></td>
                          </tr>
                        ))}
                        <tr className={`${isDark ? 'bg-slate-800/30' : 'bg-slate-50/30'} font-bold`}>
                          <td className="px-6 py-4 text-sm text-slate-500 uppercase tracking-widest">Total Benefits</td>
                          <td colSpan={2}></td>
                          <td className={`px-6 py-4 text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>{settings.currency.symbol}{totalEarnings.toFixed(2)}</td>
                          <td></td>
                        </tr>
                        <tr className={`${isDark ? 'bg-slate-800/50' : 'bg-slate-50/50'} font-bold`}>
                          <td className="px-6 py-4 text-sm text-indigo-600 uppercase tracking-widest">Gross Salary</td>
                          <td colSpan={2}></td>
                          <td className="px-6 py-4 text-sm text-indigo-600">{settings.currency.symbol}{totalEarnings.toFixed(2)}</td>
                          <td></td>
                        </tr>

                        {/* Deductions */}
                        {payslipRows.filter(r => r.type === 'deduction').map(row => (
                          <tr key={row.id} className="hover:bg-slate-50/30 dark:hover:bg-slate-800/30">
                            <td className={`px-6 py-4 text-sm font-bold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{row.description}</td>
                            <td></td>
                            <td className="px-6 py-4 text-sm font-medium text-slate-500">{row.rate || '-'}</td>
                            <td></td>
                            <td className="px-6 py-4 text-sm font-bold text-rose-500">{row.deduction}</td>
                          </tr>
                        ))}
                        <tr className={`${isDark ? 'bg-slate-800/30' : 'bg-slate-50/30'} font-bold`}>
                          <td className="px-6 py-4 text-sm text-slate-500 uppercase tracking-widest">Total Deductions</td>
                          <td colSpan={3}></td>
                          <td className="px-6 py-4 text-sm text-rose-500">{settings.currency.symbol}{totalDeductions.toFixed(2)}</td>
                        </tr>
                        <tr className={`bg-indigo-600 text-white font-bold text-xl`}>
                          <td className="px-6 py-6 uppercase tracking-tighter">Net Salary</td>
                          <td colSpan={3}></td>
                          <td className="px-6 py-6">{settings.currency.symbol}{netSalary.toFixed(2)}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* Signatures */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-12 pt-16 text-center">
                    <div className="space-y-4">
                      <div className={`h-px ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`} />
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Prepared by: Admin</p>
                    </div>
                    <div className="space-y-4">
                      <div className={`h-px ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`} />
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Checked by</p>
                    </div>
                    <div className="space-y-4">
                      <div className={`h-px ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`} />
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Authorized by</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap justify-end gap-3 pt-10 no-print">
                    <button onClick={() => window.print()} className="bg-amber-500 text-white px-6 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-amber-600 shadow-lg shadow-amber-500/20 transition-all active:scale-95">
                      <Printer className="w-4 h-4" />
                      Print
                    </button>
                    <button onClick={downloadPayslipPDF} className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-indigo-700 shadow-lg shadow-indigo-500/20 transition-all active:scale-95">
                      <Download className="w-4 h-4" />
                      Download PDF
                    </button>
                    <button onClick={() => setIsPayslipModalOpen(false)} className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${isDark ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                      Close
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </EmployeeLayout>
  );
}
