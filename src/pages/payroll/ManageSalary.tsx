import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';
import { 
  Search, 
  Download, 
  FileText, 
  Eye, 
  Printer, 
  FileSpreadsheet, 
  Image as ImageIcon,
  Upload,
  Plus,
  Trash2,
  X,
  Filter,
  ArrowLeft,
  Building2,
  Save
} from 'lucide-react';
import AdminLayout from '../../components/AdminLayout';
import { useTheme } from '../../context/ThemeContext';
import { useSettings } from '../../context/SettingsContext';
import { useEmployees } from '../../context/EmployeeContext';
import { useCompanyData } from '../../context/CompanyDataContext';
import { useSuperAdmin } from '../../context/SuperAdminContext';
import { useAuth } from '../../context/AuthContext';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import html2canvas from 'html2canvas';

interface EmployeeSalary {
  id: string;
  employeeName: string;
  salaryMonth: string;
  totalSalary: number;
  staffId: string;
  position: string;
  contact: string;
  address: string;
  workingHours: number;
  workedHours: number;
  recruitmentDate: string;
  payslipData?: string;
}

interface PayslipRow {
  id: string;
  description: string;
  amount: number;
  rate: number;
  value: number;
  deduction: number;
  type: 'earning' | 'deduction';
}

export default function ManageSalary() {
  const { salaryRecords, updateEntity } = useCompanyData();
  const { employees } = useEmployees();
  const { companies } = useSuperAdmin();
  const { user } = useAuth();
  const currentCompany = companies.find(c => c.id === user?.companyId);
  const [salaries, setSalaries] = useState<EmployeeSalary[]>([]);
  const [filteredSalaries, setFilteredSalaries] = useState<EmployeeSalary[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('');
  const [isPayslipModalOpen, setIsPayslipModalOpen] = useState(false);
  const [selectedSalary, setSelectedSalary] = useState<EmployeeSalary | null>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const { theme } = useTheme();
  const settings = useSettings();
  const activeEmployees = employees.filter(e => e.status === 'Active');
  const isDark = theme === 'dark';

  const [payslipRows, setPayslipRows] = useState<PayslipRow[]>([]);
  const [editableEmployeeInfo, setEditableEmployeeInfo] = useState<{label: string, value: string}[]>([]);

  useEffect(() => {
    // Map salaryRecords to EmployeeSalary
    const mappedSalaries: EmployeeSalary[] = salaryRecords.map((record: any) => {
      const employee = employees.find(e => e.id === record.employeeId);
      return {
        id: record.id,
        employeeName: record.employeeName || employee?.name || 'Unknown',
        salaryMonth: record.month,
        totalSalary: record.netSalary,
        staffId: employee?.employeeId || '-',
        position: employee?.designation || '-',
        contact: employee?.mobile || '-',
        address: employee?.location || '-', // Using location as address placeholder
        workingHours: 160, // Default or fetch from somewhere
        workedHours: 160, // Default or fetch from somewhere
        recruitmentDate: employee?.joiningDate || '-',
        payslipData: record.payslipData
      };
    });
    setSalaries(mappedSalaries);
  }, [salaryRecords, employees]);

  useEffect(() => {
    let result = salaries;
    if (selectedMonth) {
      result = result.filter(s => s.salaryMonth === selectedMonth);
    }
    if (searchTerm) {
      result = result.filter(s => 
        s.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.staffId.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    setFilteredSalaries(result);
  }, [salaries, searchTerm, selectedMonth]);

  useEffect(() => {
    if (selectedSalary) {
      setEditableEmployeeInfo([
        { label: 'Employee name', value: selectedSalary.employeeName },
        { label: 'Position', value: selectedSalary.position },
        { label: 'Contact', value: selectedSalary.contact },
        { label: 'Address', value: selectedSalary.address },
        { label: 'Total working hours', value: selectedSalary.workingHours.toString() },
        { label: 'Staff id', value: selectedSalary.staffId },
        { label: 'Month', value: selectedSalary.salaryMonth },
        { label: 'Recruitment date', value: selectedSalary.recruitmentDate },
        { label: 'Worked hours', value: selectedSalary.workedHours.toString() },
      ]);

      if (selectedSalary.payslipData) {
        try {
          setPayslipRows(JSON.parse(selectedSalary.payslipData));
        } catch (e) {
          console.error("Error parsing payslip data", e);
          setDefaultPayslipRows();
        }
      } else {
        setDefaultPayslipRows();
      }
    }
  }, [selectedSalary]);

  const setDefaultPayslipRows = () => {
    setPayslipRows([
      { id: '1', description: 'Basic salary', amount: 0, rate: 0, value: 0, deduction: 0, type: 'earning' },
      { id: '2', description: 'Transport allowance', amount: 0, rate: 0, value: 0, deduction: 0, type: 'earning' },
      { id: '3', description: 'State income tax', amount: 0, rate: 0, value: 0, deduction: 0, type: 'deduction' },
      { id: '4', description: 'Social security', amount: 0, rate: 0, value: 0, deduction: 0, type: 'deduction' },
      { id: '5', description: 'Loan deduction', amount: 0, rate: 0, value: 0, deduction: 0, type: 'deduction' },
      { id: '6', description: 'Salary advance', amount: 0, rate: 0, value: 0, deduction: 0, type: 'deduction' },
    ]);
  };

  const handleRowChange = (id: string, field: keyof PayslipRow, value: string | number) => {
    setPayslipRows(rows => rows.map(r => r.id === id ? { ...r, [field]: value } : r));
  };

  const addRow = (type: 'earning' | 'deduction') => {
    setPayslipRows([...payslipRows, {
      id: Date.now().toString(),
      description: 'New Item',
      amount: 0,
      rate: 0,
      value: 0,
      deduction: 0,
      type
    }]);
  };

  const removeRow = (id: string) => {
    setPayslipRows(rows => rows.filter(r => r.id !== id));
  };

  const totalEarnings = payslipRows.filter(r => r.type === 'earning').reduce((sum, r) => sum + Number(r.value || 0), 0);
  const totalDeductions = payslipRows.filter(r => r.type === 'deduction').reduce((sum, r) => sum + Number(r.deduction || 0), 0);
  const netSalary = totalEarnings - totalDeductions;

  const handleSavePayslip = async () => {
    if (!selectedSalary) return;
    
    try {
      await updateEntity('salaryRecords', selectedSalary.id, {
        payslipData: JSON.stringify(payslipRows),
        netSalary: netSalary,
        totalAllowance: totalEarnings, // Assuming total earnings includes basic + allowances
        totalDeduction: totalDeductions
      });
      setIsPayslipModalOpen(false);
      alert('Payslip updated successfully');
    } catch (error) {
      console.error("Error updating payslip", error);
      alert('Failed to update payslip');
    }
  };

  const handleFind = () => {
    let result = salaries;
    if (selectedMonth) {
      result = result.filter(s => s.salaryMonth === selectedMonth);
    }
    if (searchTerm) {
      result = result.filter(s => 
        s.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.staffId.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    setFilteredSalaries(result);
  };

  const handleReset = () => {
    setSelectedMonth('');
    setSearchTerm('');
    setFilteredSalaries(salaries);
  };

  const handleDownload = (format: string) => {
    const dataToExport = filteredSalaries.map((s, idx) => ({
      'Sl': idx + 1,
      'Employee Name': s.employeeName,
      'Salary Month': s.salaryMonth,
      'Total Salary': s.totalSalary.toFixed(2),
      'Staff ID': s.staffId,
      'Position': s.position
    }));

    if (format === 'Excel' || format === 'CSV') {
      const worksheet = XLSX.utils.json_to_sheet(dataToExport);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Salaries");
      XLSX.writeFile(workbook, `Employee_Salaries_${selectedMonth || 'All'}.${format === 'Excel' ? 'xlsx' : 'csv'}`);
    } else if (format === 'PDF') {
      const doc = new jsPDF();
      doc.text("Employee Salaries", 14, 15);
      (doc as any).autoTable({
        startY: 20,
        head: [['Sl', 'Employee Name', 'Salary Month', 'Total Salary', 'Staff ID']],
        body: filteredSalaries.map((s, idx) => [idx + 1, s.employeeName, s.salaryMonth, s.totalSalary.toFixed(2), s.staffId]),
      });
      doc.save(`Employee_Salaries_${selectedMonth || 'All'}.pdf`);
    } else if (format === 'Copy') {
      const text = dataToExport.map(row => Object.values(row).join('\t')).join('\n');
      navigator.clipboard.writeText(text);
      alert('Copied to clipboard');
    }
  };

  const downloadPayslipPDF = async () => {
    let element = document.getElementById('payslip-content');
    if (!element) {
      setIsPayslipModalOpen(true);
      await new Promise(resolve => setTimeout(resolve, 500));
      element = document.getElementById('payslip-content');
    }
    if (!element) return;

    // Hide buttons for capture
    const buttons = element.querySelector('.no-print');
    if (buttons) (buttons as HTMLElement).style.display = 'none';

    try {
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: isDark ? '#0f172a' : '#ffffff'
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Payslip_${selectedSalary?.employeeName || 'Employee'}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
    } finally {
      if (buttons) (buttons as HTMLElement).style.display = 'flex';
    }
  };

  const openPayslip = (salary: EmployeeSalary) => {
    setSelectedSalary(salary);
    setIsPayslipModalOpen(true);
  };

  const downloadExcelDemo = () => {
    const csvContent = "data:text/csv;charset=utf-8,"
      + "EmployeeID,FullName,Department,Month,Year,BasicSalary,Allowances,Deductions\n"
      + "EMP001,John Doe,Engineering,2,2026,50000,5000,2000\n"
      + "EMP002,Jane Smith,Design,2,2026,45000,4000,1500\n";
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "salary_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Tabs */}
        <div className="flex items-center gap-2 mb-6">
          <Link 
            to="/payroll/salary-advance"
            className="px-4 py-2 rounded text-sm font-medium bg-[#E9ECEF] dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            Salary Advance
          </Link>
          <Link 
            to="/payroll/salary-generate"
            className="px-4 py-2 rounded text-sm font-medium bg-[#E9ECEF] dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            Salary Generate
          </Link>
          <Link 
            to="/payroll/manage-salary"
            className="px-4 py-2 rounded text-sm font-medium bg-[#28A745] text-white transition-colors"
          >
            Manage employee salary
          </Link>
        </div>

        {/* Filter Card */}
        <div className={`rounded-xl border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} shadow-sm overflow-hidden`}>
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
            <h2 className="font-bold text-slate-800 dark:text-white">Employee salary</h2>
            <button className="bg-[#28A745] text-white px-3 py-1.5 rounded text-xs font-bold flex items-center gap-1.5 hover:bg-[#218838]">
              <Filter className="w-3.5 h-3.5" />
              Filter
            </button>
          </div>
          <div className="p-6 flex items-center gap-4">
            <div className="flex-1 max-w-sm">
              <input 
                type="month" 
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className={`w-full border rounded px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-indigo-500 ${isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200'}`}
              />
            </div>
            <button 
              onClick={handleFind}
              className="bg-[#28A745] text-white px-6 py-2 rounded text-sm font-bold hover:bg-[#218838]"
            >
              Find
            </button>
            <button 
              onClick={handleReset}
              className="bg-[#DC3545] text-white px-6 py-2 rounded text-sm font-bold hover:bg-[#C82333]"
            >
              Reset
            </button>
            <button 
              onClick={() => setIsUploadModalOpen(true)}
              className="ml-auto bg-indigo-600 text-white px-6 py-2 rounded text-sm font-bold hover:bg-indigo-700 flex items-center gap-2"
            >
              <Upload className="w-4 h-4" />
              Upload Excel
            </button>
          </div>
        </div>

        {/* Table Card */}
        <div className={`rounded-xl border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} shadow-sm overflow-hidden`}>
          <div className="p-6 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-500">Show</span>
                <select className={`border rounded px-2 py-1 text-sm ${isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200'}`}>
                  <option>10</option>
                  <option>25</option>
                  <option>50</option>
                </select>
                <span className="text-sm text-slate-500">entries</span>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex gap-1">
                  <button onClick={() => handleDownload('Copy')} className="bg-slate-600 text-white px-3 py-1.5 rounded text-xs font-bold flex items-center gap-1.5 hover:bg-slate-700">Copy</button>
                  <button onClick={() => handleDownload('CSV')} className="bg-[#28A745] text-white px-3 py-1.5 rounded text-xs font-bold flex items-center gap-1.5 hover:bg-[#218838]">CSV</button>
                  <button onClick={() => handleDownload('Excel')} className="bg-[#28A745] text-white px-3 py-1.5 rounded text-xs font-bold flex items-center gap-1.5 hover:bg-[#218838]">Excel</button>
                  <button onClick={() => handleDownload('PDF')} className="bg-red-600 text-white px-3 py-1.5 rounded text-xs font-bold flex items-center gap-1.5 hover:bg-red-700">PDF</button>
                  <button onClick={() => window.print()} className="bg-slate-600 text-white px-3 py-1.5 rounded text-xs font-bold flex items-center gap-1.5 hover:bg-slate-700">Print</button>
                </div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    type="text" 
                    placeholder="Search..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={`pl-10 pr-4 py-2 border rounded-md text-sm outline-none focus:ring-1 focus:ring-indigo-500 ${isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200'}`}
                  />
                </div>
              </div>
            </div>

            <div className="overflow-x-auto border border-slate-100 dark:border-slate-800 rounded-lg">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className={`${isDark ? 'bg-slate-800/50' : 'bg-slate-50'} border-b border-slate-100 dark:border-slate-800`}>
                    <th className="px-4 py-3 text-xs font-bold text-slate-600 dark:text-slate-400 uppercase">Sl</th>
                    <th className="px-4 py-3 text-xs font-bold text-slate-600 dark:text-slate-400 uppercase">Employee name</th>
                    <th className="px-4 py-3 text-xs font-bold text-slate-600 dark:text-slate-400 uppercase">Salary month</th>
                    <th className="px-4 py-3 text-xs font-bold text-slate-600 dark:text-slate-400 uppercase">Total salary</th>
                    <th className="px-4 py-3 text-xs font-bold text-slate-600 dark:text-slate-400 uppercase">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredSalaries.map((salary, idx) => (
                    <tr key={salary.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400">{idx + 1}</td>
                      <td className="px-4 py-3 text-sm font-medium text-slate-800 dark:text-white">{salary.employeeName}</td>
                      <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400">{salary.salaryMonth}</td>
                      <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400">{salary.totalSalary.toFixed(2)}</td>
                      <td className="px-4 py-3 text-sm">
                        <div className="flex gap-2">
                          <button 
                            onClick={() => openPayslip(salary)}
                            className="bg-amber-400 text-white px-3 py-1 rounded text-xs font-bold flex items-center gap-1.5 hover:bg-amber-500"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            Payslip
                          </button>
                          <button 
                            onClick={() => openPayslip(salary)}
                            className="bg-blue-500 text-white px-3 py-1 rounded text-xs font-bold flex items-center gap-1.5 hover:bg-blue-600"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            View Slip
                          </button>
                          <button 
                            onClick={() => {
                              setSelectedSalary(salary);
                              downloadPayslipPDF();
                            }}
                            className="bg-[#28A745] text-white px-3 py-1 rounded text-xs font-bold flex items-center gap-1.5 hover:bg-[#218838]"
                          >
                            <Download className="w-3.5 h-3.5" />
                            Download pay slip
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Payslip Modal */}
      <AnimatePresence>
        {isPayslipModalOpen && selectedSalary && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className={`rounded-xl shadow-2xl w-full max-w-4xl my-8 overflow-hidden ${isDark ? 'bg-slate-900' : 'bg-white'}`}
            >
              <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center sticky top-0 bg-inherit z-10">
                <h3 className="font-bold text-slate-800 dark:text-white">Employee Payslip</h3>
                <div className="flex gap-2">
                  <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md text-slate-600 dark:text-slate-400">
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
                    <div className="bg-indigo-600 p-2 rounded-xl">
                      {currentCompany?.logo ? (
                        <img src={currentCompany.logo} alt="Logo" className="w-8 h-8 object-contain" />
                      ) : (
                        <Building2 className="w-8 h-8 text-white" />
                      )}
                    </div>
                  </div>
                  <h2 className="text-2xl font-bold text-slate-800 dark:text-white">{currentCompany?.name || 'Bdtask HRM (PAYSLIP)'}</h2>
                </div>

                {/* Employee Info Grid */}
                <div className="border-t border-b border-slate-100 dark:border-slate-800 py-6">
                  <div className="grid grid-cols-2 gap-x-12 gap-y-4 text-sm">
                    {editableEmployeeInfo.map((info, idx) => (
                      <div key={idx} className="flex justify-between border-b border-slate-50 dark:border-slate-800/50 pb-1 items-center group">
                        <input 
                          type="text" 
                          value={info.label} 
                          onChange={(e) => {
                            const newInfo = [...editableEmployeeInfo];
                            newInfo[idx].label = e.target.value;
                            setEditableEmployeeInfo(newInfo);
                          }} 
                          className="font-bold text-slate-500 bg-transparent border-none outline-none w-1/2" 
                        />
                        <div className="flex items-center gap-2">
                          <input 
                            type="text" 
                            value={info.value} 
                            onChange={(e) => {
                              const newInfo = [...editableEmployeeInfo];
                              newInfo[idx].value = e.target.value;
                              setEditableEmployeeInfo(newInfo);
                            }} 
                            className="text-right bg-transparent border-b border-transparent hover:border-slate-300 focus:border-indigo-500 outline-none text-slate-800 dark:text-white" 
                          />
                          <button 
                            onClick={() => {
                              const newInfo = editableEmployeeInfo.filter((_, i) => i !== idx);
                              setEditableEmployeeInfo(newInfo);
                            }}
                            className="text-red-500 opacity-0 group-hover:opacity-100 transition-opacity no-print"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <button 
                    onClick={() => setEditableEmployeeInfo([...editableEmployeeInfo, { label: 'New Field', value: '' }])}
                    className="mt-4 text-indigo-600 hover:text-indigo-800 text-xs font-bold flex items-center gap-1 no-print"
                  >
                    <Plus className="w-3 h-3" /> Add Info Field
                  </button>
                </div>

                {/* Salary Table */}
                <div className="overflow-hidden border border-slate-100 dark:border-slate-800 rounded-lg">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-amber-50 dark:bg-amber-900/20 border-b border-slate-100 dark:border-slate-800">
                        <th className="px-4 py-3 text-xs font-bold text-slate-600 dark:text-slate-400 uppercase">Description</th>
                        <th className="px-4 py-3 text-xs font-bold text-slate-600 dark:text-slate-400 uppercase">Amount ({settings.currency.symbol})</th>
                        <th className="px-4 py-3 text-xs font-bold text-slate-600 dark:text-slate-400 uppercase">Rate ({settings.currency.symbol})</th>
                        <th className="px-4 py-3 text-xs font-bold text-slate-600 dark:text-slate-400 uppercase">#Value ({settings.currency.symbol})</th>
                        <th className="px-4 py-3 text-xs font-bold text-slate-600 dark:text-slate-400 uppercase">Deduction ({settings.currency.symbol})</th>
                        <th className="px-4 py-3 text-xs font-bold text-slate-600 dark:text-slate-400 uppercase w-10 no-print"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
                      {/* Earnings */}
                      {payslipRows.filter(r => r.type === 'earning').map(row => (
                        <tr key={row.id}>
                          <td className="px-4 py-2">
                            <input type="text" value={row.description} onChange={(e) => handleRowChange(row.id, 'description', e.target.value)} className="w-full bg-transparent border-b border-transparent hover:border-slate-300 focus:border-indigo-500 outline-none text-slate-700 dark:text-slate-300" />
                          </td>
                          <td className="px-4 py-2">
                            <input type="number" value={row.amount} onChange={(e) => handleRowChange(row.id, 'amount', Number(e.target.value))} className="w-24 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-indigo-500 outline-none text-slate-700 dark:text-slate-300" />
                          </td>
                          <td className="px-4 py-2">
                            <input type="number" value={row.rate} onChange={(e) => handleRowChange(row.id, 'rate', Number(e.target.value))} className="w-24 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-indigo-500 outline-none text-slate-700 dark:text-slate-300" />
                          </td>
                          <td className="px-4 py-2">
                            <input type="number" value={row.value} onChange={(e) => handleRowChange(row.id, 'value', Number(e.target.value))} className="w-24 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-indigo-500 outline-none text-slate-700 dark:text-slate-300" />
                          </td>
                          <td className="px-4 py-2"></td>
                          <td className="px-4 py-2 no-print">
                            <button onClick={() => removeRow(row.id)} className="text-red-500 hover:text-red-700 p-1"><Trash2 className="w-4 h-4" /></button>
                          </td>
                        </tr>
                      ))}
                      <tr className="no-print">
                        <td colSpan={6} className="px-4 py-2">
                          <button onClick={() => addRow('earning')} className="text-indigo-600 hover:text-indigo-800 text-xs font-bold flex items-center gap-1"><Plus className="w-3 h-3" /> Add Earning</button>
                        </td>
                      </tr>
                      <tr className="bg-slate-50 dark:bg-slate-800/50 font-bold">
                        <td className="px-4 py-3 text-slate-800 dark:text-white">Total benefit</td>
                        <td className="px-4 py-3"></td>
                        <td className="px-4 py-3"></td>
                        <td className="px-4 py-3 text-slate-800 dark:text-white">{totalEarnings.toFixed(2)}</td>
                        <td className="px-4 py-3"></td>
                        <td className="px-4 py-3 no-print"></td>
                      </tr>
                      <tr className="bg-slate-50 dark:bg-slate-800/50 font-bold">
                        <td className="px-4 py-3 text-slate-800 dark:text-white uppercase tracking-wider">Gross salary</td>
                        <td className="px-4 py-3"></td>
                        <td className="px-4 py-3"></td>
                        <td className="px-4 py-3 text-slate-800 dark:text-white">{totalEarnings.toFixed(2)}</td>
                        <td className="px-4 py-3"></td>
                        <td className="px-4 py-3 no-print"></td>
                      </tr>

                      {/* Deductions */}
                      {payslipRows.filter(r => r.type === 'deduction').map(row => (
                        <tr key={row.id}>
                          <td className="px-4 py-2">
                            <input type="text" value={row.description} onChange={(e) => handleRowChange(row.id, 'description', e.target.value)} className="w-full bg-transparent border-b border-transparent hover:border-slate-300 focus:border-indigo-500 outline-none text-slate-700 dark:text-slate-300" />
                          </td>
                          <td className="px-4 py-2"></td>
                          <td className="px-4 py-2">
                            <input type="number" value={row.rate} onChange={(e) => handleRowChange(row.id, 'rate', Number(e.target.value))} className="w-24 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-indigo-500 outline-none text-slate-700 dark:text-slate-300" />
                          </td>
                          <td className="px-4 py-2"></td>
                          <td className="px-4 py-2">
                            <input type="number" value={row.deduction} onChange={(e) => handleRowChange(row.id, 'deduction', Number(e.target.value))} className="w-24 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-indigo-500 outline-none text-slate-700 dark:text-slate-300" />
                          </td>
                          <td className="px-4 py-2 no-print">
                            <button onClick={() => removeRow(row.id)} className="text-red-500 hover:text-red-700 p-1"><Trash2 className="w-4 h-4" /></button>
                          </td>
                        </tr>
                      ))}
                      <tr className="no-print">
                        <td colSpan={6} className="px-4 py-2">
                          <button onClick={() => addRow('deduction')} className="text-indigo-600 hover:text-indigo-800 text-xs font-bold flex items-center gap-1"><Plus className="w-3 h-3" /> Add Deduction</button>
                        </td>
                      </tr>
                      <tr className="bg-slate-50 dark:bg-slate-800/50 font-bold">
                        <td className="px-4 py-3 text-slate-800 dark:text-white uppercase tracking-wider">Total deductions</td>
                        <td className="px-4 py-3"></td>
                        <td className="px-4 py-3"></td>
                        <td className="px-4 py-3"></td>
                        <td className="px-4 py-3 text-slate-800 dark:text-white">{totalDeductions.toFixed(2)}</td>
                        <td className="px-4 py-3 no-print"></td>
                      </tr>
                      <tr className="bg-amber-50 dark:bg-amber-900/20 font-bold text-lg">
                        <td className="px-4 py-4 text-slate-800 dark:text-white uppercase tracking-wider">Net salary</td>
                        <td className="px-4 py-4"></td>
                        <td className="px-4 py-4"></td>
                        <td className="px-4 py-4"></td>
                        <td className="px-4 py-4 text-slate-800 dark:text-white">{netSalary.toFixed(2)}</td>
                        <td className="px-4 py-4 no-print"></td>
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
                  <button onClick={downloadPayslipPDF} className="bg-[#28A745] text-white px-4 py-2 rounded text-sm font-bold flex items-center gap-2 hover:bg-[#218838]">
                    <Download className="w-4 h-4" />
                    Download as pdf
                  </button>
                  <button onClick={handleSavePayslip} className="bg-indigo-600 text-white px-4 py-2 rounded text-sm font-bold flex items-center gap-2 hover:bg-indigo-700">
                    <Save className="w-4 h-4" />
                    Save Changes
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Upload Modal */}
      <AnimatePresence>
        {isUploadModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`rounded-xl shadow-xl w-full max-w-md overflow-hidden ${isDark ? 'bg-slate-900' : 'bg-white'}`}
            >
              <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
                <h3 className="font-bold text-slate-800 dark:text-white">Upload Salary Data</h3>
                <button onClick={() => setIsUploadModalOpen(false)} className="p-1 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full">
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>
              
              <div className="p-6 space-y-6">
                <div className="text-center space-y-4">
                  <div className="bg-indigo-50 dark:bg-indigo-900/20 p-8 rounded-2xl border-2 border-dashed border-indigo-200 dark:border-indigo-800">
                    <Upload className="w-12 h-12 text-indigo-500 mx-auto mb-4" />
                    <p className="text-sm text-slate-600 dark:text-slate-400">Drag and drop your Excel file here or click to browse</p>
                    <input type="file" className="hidden" id="excel-upload" accept=".xlsx, .xls" />
                    <label htmlFor="excel-upload" className="mt-4 inline-block bg-indigo-600 text-white px-6 py-2 rounded-lg text-sm font-bold hover:bg-indigo-700 cursor-pointer">
                      Browse Files
                    </label>
                  </div>
                  
                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                    <p className="text-xs text-slate-500 mb-3">Don't have the format? Download the demo file below.</p>
                    <button 
                      onClick={downloadExcelDemo}
                      className="flex items-center gap-2 mx-auto text-indigo-600 hover:text-indigo-700 font-bold text-sm"
                    >
                      <FileSpreadsheet className="w-4 h-4" />
                      Download Excel Demo
                    </button>
                  </div>
                </div>
              </div>

              <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2 bg-slate-50 dark:bg-slate-800/50">
                <button 
                  onClick={() => setIsUploadModalOpen(false)}
                  className="px-4 py-2 text-slate-600 dark:text-slate-400 font-bold text-sm"
                >
                  Cancel
                </button>
                <button className="bg-indigo-600 text-white px-6 py-2 rounded-lg text-sm font-bold hover:bg-indigo-700">
                  Upload & Process
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; }
          .print\:p-0 { padding: 0 !important; }
        }
      `}</style>
    </AdminLayout>
  );
}
