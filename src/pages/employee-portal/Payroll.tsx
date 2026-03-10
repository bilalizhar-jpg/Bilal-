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
  const { payrolls, loans } = useCompanyData();
  const { companies } = useSuperAdmin(); // Added this
  const isDark = theme === 'dark';
  const [activeTab, setActiveTab] = useState<'slips' | 'advance' | 'loan'>('slips');
  const [isPayslipModalOpen, setIsPayslipModalOpen] = useState(false);
  const [selectedSlip, setSelectedSlip] = useState<any>(null);
  const [payslipRows, setPayslipRows] = useState<PayslipRow[]>([]);
  const [editableEmployeeInfo, setEditableEmployeeInfo] = useState<{label: string, value: string}[]>([]);

  const currentEmployee = employees.find(emp => emp.id === user?.id);
  const company = companies.find(c => c.id === currentEmployee?.companyId);

  useEffect(() => {
    console.log("Payroll Debug:", { 
      currentEmployeeId: user?.id,
      currentEmployee, 
      companyId: currentEmployee?.companyId,
      company, 
      allCompanies: companies 
    });
  }, [currentEmployee, company, companies]);

  const salarySlips = payrolls
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
      // TODO: Fetch real breakdown from payroll record if available
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
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Payroll & Finance</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Manage your salary slips, advance requests, and loans.</p>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 bg-slate-100 dark:bg-slate-900/50 p-1 rounded-lg w-fit">
          <button
            onClick={() => setActiveTab('slips')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              activeTab === 'slips' 
                ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-sm' 
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            Salary Slips
          </button>
          <button
            onClick={() => setActiveTab('advance')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              activeTab === 'advance' 
                ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-sm' 
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            Advance Salary
          </button>
          <button
            onClick={() => setActiveTab('loan')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              activeTab === 'loan' 
                ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-sm' 
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            Loan Requests
          </button>
        </div>

        {/* Content Area */}
        <div className={`rounded-xl border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} shadow-sm overflow-hidden`}>
          
          {/* Salary Slips Tab */}
          {activeTab === 'slips' && (
            <div>
              <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/20">
                <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                  <FileText className="w-5 h-5 text-emerald-500" />
                  Monthly Salary Slips
                </h3>
              </div>
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {salarySlips.map((slip) => (
                  <div key={slip.id} className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                        <Calendar className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-800 dark:text-white text-lg">{slip.month}</h4>
                        <div className="flex items-center gap-3 mt-1 text-sm text-slate-500 dark:text-slate-400">
                          <span className="flex items-center gap-1"><DollarSign className="w-4 h-4" /> {slip.amount}</span>
                          <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600"></span>
                          <span>Paid on {slip.date}</span>
                        </div>
                        {slip.note && <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1 font-medium">{slip.note}</p>}
                      </div>
                    </div>
                    <div className="flex items-center gap-3 sm:ml-auto">
                      <span className="px-3 py-1 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 text-xs font-bold rounded-full">
                        {slip.status}
                      </span>
                      <button 
                        onClick={() => {
                          setSelectedSlip(slip);
                          setIsPayslipModalOpen(true);
                        }}
                        className="flex items-center gap-2 px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                        View Slip
                      </button>
                      <button 
                        onClick={() => {
                          setSelectedSlip(slip);
                          downloadPayslipPDF();
                        }}
                        className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-bold hover:bg-emerald-700 transition-colors"
                      >
                        <Download className="w-4 h-4" />
                        Download PDF
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Advance Salary Tab */}
          {activeTab === 'advance' && (
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-emerald-500" />
                  Advance Salary Requests
                </h3>
                <button className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-emerald-700 transition-colors">
                  Request Advance
                </button>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className={`bg-slate-50 dark:bg-slate-800/50 border-b ${isDark ? 'border-slate-800 text-slate-400' : 'border-slate-200 text-slate-500'}`}>
                    <tr>
                      <th className="px-6 py-4 font-medium">Date Requested</th>
                      <th className="px-6 py-4 font-medium">Amount</th>
                      <th className="px-6 py-4 font-medium">Reason</th>
                      <th className="px-6 py-4 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${isDark ? 'divide-slate-800' : 'divide-slate-100'}`}>
                    {advanceRequests.map((req) => (
                      <tr key={req.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                        <td className="px-6 py-4 text-slate-900 dark:text-white font-medium">{req.date}</td>
                        <td className="px-6 py-4 text-slate-900 dark:text-white font-bold">{req.amount}</td>
                        <td className="px-6 py-4 text-slate-500 dark:text-slate-400">{req.reason}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                            req.status === 'Approved' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                            'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                          }`}>
                            {req.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Loan Requests Tab */}
          {activeTab === 'loan' && (
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-emerald-500" />
                  Loan Requests
                </h3>
                <button className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-emerald-700 transition-colors">
                  Apply for Loan
                </button>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className={`bg-slate-50 dark:bg-slate-800/50 border-b ${isDark ? 'border-slate-800 text-slate-400' : 'border-slate-200 text-slate-500'}`}>
                    <tr>
                      <th className="px-6 py-4 font-medium">Date Applied</th>
                      <th className="px-6 py-4 font-medium">Total Amount</th>
                      <th className="px-6 py-4 font-medium">EMI Deduction</th>
                      <th className="px-6 py-4 font-medium">Remaining Balance</th>
                      <th className="px-6 py-4 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${isDark ? 'divide-slate-800' : 'divide-slate-100'}`}>
                    {loanRequests.map((req) => (
                      <tr key={req.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                        <td className="px-6 py-4 text-slate-900 dark:text-white font-medium">{req.date}</td>
                        <td className="px-6 py-4 text-slate-900 dark:text-white font-bold">{req.amount}</td>
                        <td className="px-6 py-4 text-slate-500 dark:text-slate-400">{req.emi}</td>
                        <td className="px-6 py-4 text-slate-900 dark:text-white font-medium">{req.remaining}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                            req.status === 'Active' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                            'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400'
                          }`}>
                            {req.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Payslip Modal */}
        <AnimatePresence>
          {isPayslipModalOpen && selectedSlip && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className={`rounded-xl shadow-2xl w-full max-w-4xl my-8 overflow-hidden ${isDark ? 'bg-slate-900' : 'bg-white'}`}
              >
                <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center sticky top-0 bg-inherit z-10">
                  <h3 className="font-bold text-slate-800 dark:text-white">Your Salary Slip</h3>
                  <div className="flex gap-2">
                    <button onClick={() => window.print()} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md text-slate-600 dark:text-slate-400">
                      <Printer className="w-5 h-5" />
                    </button>
                    <button onClick={() => setIsPayslipModalOpen(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md text-slate-600 dark:text-slate-400">
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <div className="p-8 space-y-8 print:p-0" id="payslip-content">
                  {/* Payslip Header */}
                  <div className="text-center space-y-2">
                    <div className="flex justify-center mb-4">
                      <div className="bg-emerald-600 p-2 rounded-xl w-16 h-16 flex items-center justify-center overflow-hidden">
                        {company?.logo ? (
                          <img src={company.logo} alt={company.name} className="w-full h-full object-cover" />
                        ) : (
                          <Building2 className="w-8 h-8 text-white" />
                        )}
                      </div>
                    </div>
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-white">{company?.name || 'Bdtask HRM (PAYSLIP)'}</h2>
                  </div>

                  {/* Employee Info Grid */}
                  <div className="border-t border-b border-slate-100 dark:border-slate-800 py-6">
                    <div className="grid grid-cols-2 gap-x-12 gap-y-4 text-sm">
                      {editableEmployeeInfo.map((info, idx) => (
                        <div key={idx} className="flex justify-between border-b border-slate-50 dark:border-slate-800/50 pb-1 items-center">
                          <span className="font-bold text-slate-500">{info.label}</span>
                          <span className="text-right text-slate-800 dark:text-white">{info.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Salary Table */}
                  <div className="overflow-hidden border border-slate-100 dark:border-slate-800 rounded-lg">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-emerald-50 dark:bg-emerald-900/20 border-b border-slate-100 dark:border-slate-800">
                          <th className="px-4 py-3 text-xs font-bold text-slate-600 dark:text-slate-400 uppercase">Description</th>
                          <th className="px-4 py-3 text-xs font-bold text-slate-600 dark:text-slate-400 uppercase">Amount ({settings.currency.symbol})</th>
                          <th className="px-4 py-3 text-xs font-bold text-slate-600 dark:text-slate-400 uppercase">Rate ({settings.currency.symbol})</th>
                          <th className="px-4 py-3 text-xs font-bold text-slate-600 dark:text-slate-400 uppercase">#Value ({settings.currency.symbol})</th>
                          <th className="px-4 py-3 text-xs font-bold text-slate-600 dark:text-slate-400 uppercase">Deduction ({settings.currency.symbol})</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
                        {/* Earnings */}
                        {payslipRows.filter(r => r.type === 'earning').map(row => (
                          <tr key={row.id}>
                            <td className="px-4 py-2 text-slate-700 dark:text-slate-300">{row.description}</td>
                            <td className="px-4 py-2 text-slate-700 dark:text-slate-300">{row.amount}</td>
                            <td className="px-4 py-2 text-slate-700 dark:text-slate-300">{row.rate}</td>
                            <td className="px-4 py-2 text-slate-700 dark:text-slate-300">{row.value}</td>
                            <td className="px-4 py-2"></td>
                          </tr>
                        ))}
                        <tr className="bg-slate-50 dark:bg-slate-800/50 font-bold">
                          <td className="px-4 py-3 text-slate-800 dark:text-white">Total benefit</td>
                          <td className="px-4 py-3"></td>
                          <td className="px-4 py-3"></td>
                          <td className="px-4 py-3 text-slate-800 dark:text-white">{totalEarnings.toFixed(2)}</td>
                          <td className="px-4 py-3"></td>
                        </tr>
                        <tr className="bg-slate-50 dark:bg-slate-800/50 font-bold">
                          <td className="px-4 py-3 text-slate-800 dark:text-white uppercase tracking-wider">Gross salary</td>
                          <td className="px-4 py-3"></td>
                          <td className="px-4 py-3"></td>
                          <td className="px-4 py-3 text-slate-800 dark:text-white">{totalEarnings.toFixed(2)}</td>
                          <td className="px-4 py-3"></td>
                        </tr>

                        {/* Deductions */}
                        {payslipRows.filter(r => r.type === 'deduction').map(row => (
                          <tr key={row.id}>
                            <td className="px-4 py-2 text-slate-700 dark:text-slate-300">{row.description}</td>
                            <td className="px-4 py-2"></td>
                            <td className="px-4 py-2 text-slate-700 dark:text-slate-300">{row.rate}</td>
                            <td className="px-4 py-2"></td>
                            <td className="px-4 py-2 text-slate-700 dark:text-slate-300">{row.deduction}</td>
                          </tr>
                        ))}
                        <tr className="bg-slate-50 dark:bg-slate-800/50 font-bold">
                          <td className="px-4 py-3 text-slate-800 dark:text-white uppercase tracking-wider">Total deductions</td>
                          <td className="px-4 py-3"></td>
                          <td className="px-4 py-3"></td>
                          <td className="px-4 py-3"></td>
                          <td className="px-4 py-3 text-slate-800 dark:text-white">{totalDeductions.toFixed(2)}</td>
                        </tr>
                        <tr className="bg-emerald-50 dark:bg-emerald-900/20 font-bold text-lg">
                          <td className="px-4 py-4 text-slate-800 dark:text-white uppercase tracking-wider">Net salary</td>
                          <td className="px-4 py-4"></td>
                          <td className="px-4 py-4"></td>
                          <td className="px-4 py-4"></td>
                          <td className="px-4 py-4 text-slate-800 dark:text-white">{netSalary.toFixed(2)}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* Signatures */}
                  <div className="grid grid-cols-3 gap-8 pt-12 text-center text-xs font-bold text-slate-500 uppercase">
                    <div className="border-t border-slate-200 dark:border-slate-800 pt-2">
                      Prepared by: <span className="text-slate-800 dark:text-white">Admin</span>
                    </div>
                    <div className="border-t border-slate-200 dark:border-slate-800 pt-2">
                      Checked by
                    </div>
                    <div className="border-t border-slate-200 dark:border-slate-800 pt-2">
                      Authorized by
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-8 no-print">
                    <button onClick={() => window.print()} className="bg-amber-400 text-white px-4 py-2 rounded text-sm font-bold flex items-center gap-2 hover:bg-amber-500">
                      <Printer className="w-4 h-4" />
                      Print
                    </button>
                    <button onClick={downloadPayslipPDF} className="bg-emerald-600 text-white px-4 py-2 rounded text-sm font-bold flex items-center gap-2 hover:bg-emerald-700">
                      <Download className="w-4 h-4" />
                      Download as pdf
                    </button>
                    <button onClick={() => setIsPayslipModalOpen(false)} className="bg-slate-600 text-white px-4 py-2 rounded text-sm font-bold flex items-center gap-2 hover:bg-slate-700">
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
