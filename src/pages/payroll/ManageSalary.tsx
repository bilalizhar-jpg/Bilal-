import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
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
  Building2
} from 'lucide-react';
import AdminLayout from '../../components/AdminLayout';
import { useTheme } from '../../context/ThemeContext';

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
}

const initialSalaries: EmployeeSalary[] = [
  { id: '1', employeeName: 'Honorato Imogene Curry Terry', salaryMonth: '2024-04', totalSalary: 550.00, staffId: '#000001', position: 'Manager', contact: '+1(873)591-1817', address: '123 Main St', workingHours: 10, workedHours: 230, recruitmentDate: '2011-04-27' },
  { id: '2', employeeName: 'Maisha Lucy Zamora Gonzales', salaryMonth: '2024-04', totalSalary: -2020.00, staffId: '#000002', position: 'Developer', contact: '+1(873)591-1818', address: '456 Oak Ave', workingHours: 8, workedHours: 160, recruitmentDate: '2015-06-12' },
  { id: '3', employeeName: 'Amy Aphrodite Zamora Peck', salaryMonth: '2024-04', totalSalary: 4000.00, staffId: '#000003', position: 'Designer', contact: '+1(873)591-1819', address: '789 Pine Rd', workingHours: 8, workedHours: 160, recruitmentDate: '2018-09-01' },
  { id: '4', employeeName: 'Honorato Imogene Curry Terry', salaryMonth: '2024-05', totalSalary: 8440.00, staffId: '#000001', position: 'Manager', contact: '+1(873)591-1817', address: '123 Main St', workingHours: 10, workedHours: 230, recruitmentDate: '2011-04-27' },
];

export default function ManageSalary() {
  const [salaries] = useState<EmployeeSalary[]>(initialSalaries);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('February 2026');
  const [isPayslipModalOpen, setIsPayslipModalOpen] = useState(false);
  const [selectedSalary, setSelectedSalary] = useState<EmployeeSalary | null>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const handleDownload = (format: string) => {
    alert(`Downloading salary list as ${format}`);
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
          <button className="px-4 py-2 rounded text-sm font-medium bg-[#E9ECEF] dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700">
            Salary Advance
          </button>
          <button className="px-4 py-2 rounded text-sm font-medium bg-[#E9ECEF] dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700">
            Salary Generate
          </button>
          <button className="px-4 py-2 rounded text-sm font-medium bg-[#28A745] text-white">
            Manage employee salary
          </button>
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
                type="text" 
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className={`w-full border rounded px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-indigo-500 ${isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200'}`}
              />
            </div>
            <button className="bg-[#28A745] text-white px-6 py-2 rounded text-sm font-bold hover:bg-[#218838]">
              Find
            </button>
            <button className="bg-[#DC3545] text-white px-6 py-2 rounded text-sm font-bold hover:bg-[#C82333]">
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
                  {salaries.filter(s => s.employeeName.toLowerCase().includes(searchTerm.toLowerCase())).map((salary, idx) => (
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
                          <button className="bg-[#28A745] text-white px-3 py-1 rounded text-xs font-bold flex items-center gap-1.5 hover:bg-[#218838]">
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

              <div className="p-8 space-y-8 print:p-0">
                {/* Payslip Header */}
                <div className="text-center space-y-2">
                  <div className="flex justify-center mb-4">
                    <div className="bg-indigo-600 p-2 rounded-xl">
                      <Building2 className="w-8 h-8 text-white" />
                    </div>
                  </div>
                  <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Bdtask HRM (PAYSLIP)</h2>
                </div>

                {/* Employee Info Grid */}
                <div className="grid grid-cols-2 gap-x-12 gap-y-4 text-sm border-t border-b border-slate-100 dark:border-slate-800 py-6">
                  <div className="space-y-3">
                    <div className="flex justify-between border-b border-slate-50 dark:border-slate-800/50 pb-1">
                      <span className="font-bold text-slate-500">Employee name</span>
                      <span className="text-slate-800 dark:text-white">{selectedSalary.employeeName}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-50 dark:border-slate-800/50 pb-1">
                      <span className="font-bold text-slate-500">Position</span>
                      <span className="text-slate-800 dark:text-white">{selectedSalary.position}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-50 dark:border-slate-800/50 pb-1">
                      <span className="font-bold text-slate-500">Contact</span>
                      <span className="text-slate-800 dark:text-white">{selectedSalary.contact}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-50 dark:border-slate-800/50 pb-1">
                      <span className="font-bold text-slate-500">Address</span>
                      <span className="text-slate-800 dark:text-white">{selectedSalary.address}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-50 dark:border-slate-800/50 pb-1">
                      <span className="font-bold text-slate-500">Total working hours</span>
                      <span className="text-slate-800 dark:text-white">{selectedSalary.workingHours}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-50 dark:border-slate-800/50 pb-1">
                      <span className="font-bold text-slate-500">Staff id</span>
                      <span className="text-slate-800 dark:text-white">{selectedSalary.staffId}</span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between border-b border-slate-50 dark:border-slate-800/50 pb-1">
                      <span className="font-bold text-slate-500">Month</span>
                      <span className="text-slate-800 dark:text-white">{selectedSalary.salaryMonth}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-50 dark:border-slate-800/50 pb-1">
                      <span className="font-bold text-slate-500">From</span>
                      <span className="text-slate-800 dark:text-white">2024-05-01</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-50 dark:border-slate-800/50 pb-1">
                      <span className="font-bold text-slate-500">To</span>
                      <span className="text-slate-800 dark:text-white">2024-05-31</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-50 dark:border-slate-800/50 pb-1">
                      <span className="font-bold text-slate-500">Recruitment date</span>
                      <span className="text-slate-800 dark:text-white">{selectedSalary.recruitmentDate}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-50 dark:border-slate-800/50 pb-1">
                      <span className="font-bold text-slate-500">Worked hours</span>
                      <span className="text-slate-800 dark:text-white">{selectedSalary.workedHours}</span>
                    </div>
                  </div>
                </div>

                {/* Salary Table */}
                <div className="overflow-hidden border border-slate-100 dark:border-slate-800 rounded-lg">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-amber-50 dark:bg-amber-900/20 border-b border-slate-100 dark:border-slate-800">
                        <th className="px-4 py-3 text-xs font-bold text-slate-600 dark:text-slate-400 uppercase">Description</th>
                        <th className="px-4 py-3 text-xs font-bold text-slate-600 dark:text-slate-400 uppercase">Amount (৳)</th>
                        <th className="px-4 py-3 text-xs font-bold text-slate-600 dark:text-slate-400 uppercase">Rate (৳)</th>
                        <th className="px-4 py-3 text-xs font-bold text-slate-600 dark:text-slate-400 uppercase">#Value (৳)</th>
                        <th className="px-4 py-3 text-xs font-bold text-slate-600 dark:text-slate-400 uppercase">Deduction (৳)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
                      <tr>
                        <td className="px-4 py-3 text-slate-700 dark:text-slate-300">Basic salary</td>
                        <td className="px-4 py-3 text-slate-700 dark:text-slate-300">6,400.00</td>
                        <td className="px-4 py-3 text-slate-700 dark:text-slate-300"></td>
                        <td className="px-4 py-3 text-slate-700 dark:text-slate-300">6,400.00</td>
                        <td className="px-4 py-3 text-slate-700 dark:text-slate-300"></td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 text-slate-700 dark:text-slate-300">Transport allowance</td>
                        <td className="px-4 py-3 text-slate-700 dark:text-slate-300">470.00</td>
                        <td className="px-4 py-3 text-slate-700 dark:text-slate-300"></td>
                        <td className="px-4 py-3 text-slate-700 dark:text-slate-300">470.00</td>
                        <td className="px-4 py-3 text-slate-700 dark:text-slate-300"></td>
                      </tr>
                      <tr className="bg-slate-50 dark:bg-slate-800/50 font-bold">
                        <td className="px-4 py-3 text-slate-800 dark:text-white">Total benefit</td>
                        <td className="px-4 py-3"></td>
                        <td className="px-4 py-3"></td>
                        <td className="px-4 py-3 text-slate-800 dark:text-white">1,570.00</td>
                        <td className="px-4 py-3"></td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 text-slate-700 dark:text-slate-300">Overtime</td>
                        <td className="px-4 py-3"></td>
                        <td className="px-4 py-3"></td>
                        <td className="px-4 py-3"></td>
                        <td className="px-4 py-3"></td>
                      </tr>
                      <tr className="bg-slate-50 dark:bg-slate-800/50 font-bold">
                        <td className="px-4 py-3 text-slate-800 dark:text-white uppercase tracking-wider">Gross salary</td>
                        <td className="px-4 py-3"></td>
                        <td className="px-4 py-3"></td>
                        <td className="px-4 py-3 text-slate-800 dark:text-white">8,440.00</td>
                        <td className="px-4 py-3"></td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 text-slate-700 dark:text-slate-300">State income tax</td>
                        <td className="px-4 py-3"></td>
                        <td className="px-4 py-3"></td>
                        <td className="px-4 py-3"></td>
                        <td className="px-4 py-3 text-slate-700 dark:text-slate-300">0.00</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 text-slate-700 dark:text-slate-300">Social security</td>
                        <td className="px-4 py-3"></td>
                        <td className="px-4 py-3 text-slate-700 dark:text-slate-300">0 %</td>
                        <td className="px-4 py-3"></td>
                        <td className="px-4 py-3 text-slate-700 dark:text-slate-300">0.00</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 text-slate-700 dark:text-slate-300">Loan deduction</td>
                        <td className="px-4 py-3"></td>
                        <td className="px-4 py-3"></td>
                        <td className="px-4 py-3"></td>
                        <td className="px-4 py-3 text-slate-700 dark:text-slate-300">0.00</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 text-slate-700 dark:text-slate-300">Salary advance</td>
                        <td className="px-4 py-3"></td>
                        <td className="px-4 py-3"></td>
                        <td className="px-4 py-3"></td>
                        <td className="px-4 py-3 text-slate-700 dark:text-slate-300">0.00</td>
                      </tr>
                      <tr className="bg-slate-50 dark:bg-slate-800/50 font-bold">
                        <td className="px-4 py-3 text-slate-800 dark:text-white uppercase tracking-wider">Total deductions</td>
                        <td className="px-4 py-3"></td>
                        <td className="px-4 py-3"></td>
                        <td className="px-4 py-3"></td>
                        <td className="px-4 py-3 text-slate-800 dark:text-white">0.00</td>
                      </tr>
                      <tr className="bg-amber-50 dark:bg-amber-900/20 font-bold text-lg">
                        <td className="px-4 py-4 text-slate-800 dark:text-white uppercase tracking-wider">Net salary</td>
                        <td className="px-4 py-4"></td>
                        <td className="px-4 py-4"></td>
                        <td className="px-4 py-4"></td>
                        <td className="px-4 py-4 text-slate-800 dark:text-white">8,440.00</td>
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
                  <button className="bg-amber-400 text-white px-4 py-2 rounded text-sm font-bold flex items-center gap-2 hover:bg-amber-500">
                    <Printer className="w-4 h-4" />
                    Print
                  </button>
                  <button className="bg-[#28A745] text-white px-4 py-2 rounded text-sm font-bold flex items-center gap-2 hover:bg-[#218838]">
                    <Download className="w-4 h-4" />
                    Download as pdf
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
