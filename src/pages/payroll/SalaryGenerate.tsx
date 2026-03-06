import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  List, 
  Edit, 
  Trash2,
  ChevronRight,
  Search,
  Download,
  X,
  Save,
  Printer
} from 'lucide-react';
import { Link } from 'react-router-dom';
import AdminLayout from '../../components/AdminLayout';
import { useTheme } from '../../context/ThemeContext';
import { useSettings } from '../../context/SettingsContext';
import { useEmployees } from '../../context/EmployeeContext';
import { useCompanyData } from '../../context/CompanyDataContext';
import { motion, AnimatePresence } from 'motion/react';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

interface GeneratedSalary {
  id: string;
  salaryName: string;
  generateDate: string;
  generateBy: string;
  status: 'Approved' | 'Pending';
  approvedDate: string;
  approvedBy: string;
}

export default function SalaryGenerate() {
  const { payrollBatches, addEntity, updateEntity, deleteEntity, salaryRecords } = useCompanyData();
  const { employees } = useEmployees();
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [generatedList, setGeneratedList] = useState<GeneratedSalary[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingSalary, setEditingSalary] = useState<GeneratedSalary | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewingSalary, setViewingSalary] = useState<GeneratedSalary | null>(null);
  const { theme } = useTheme();
  const settings = useSettings();
  const activeEmployees = employees.filter(e => e.status === 'Active');
  const isDark = theme === 'dark';

  useEffect(() => {
    setGeneratedList(payrollBatches as unknown as GeneratedSalary[]);
  }, [payrollBatches]);

  const handleGenerate = async () => {
    if (!selectedMonth) {
      alert('Please select a month');
      return;
    }

    // Check if already generated
    const exists = payrollBatches.some(b => b.salaryName === selectedMonth);
    if (exists) {
      alert(`Salary for ${selectedMonth} already generated.`);
      return;
    }

    const batchId = Math.random().toString(36).substr(2, 9);
    const newBatch = {
      id: batchId,
      salaryName: selectedMonth,
      generateDate: new Date().toISOString().split('T')[0],
      generateBy: 'Admin', // Should be current user name
      status: 'Pending',
      approvedDate: '-',
      approvedBy: '-'
    };

    try {
      await addEntity('payrollBatches', newBatch);

      // Generate salary records for all active employees
      const promises = activeEmployees.map(emp => {
        const basicSalary = emp.salary || 0;
        // Default allowances/deductions logic could go here
        const initialPayslip = [
          { id: '1', description: 'Basic salary', amount: basicSalary, rate: 0, value: basicSalary, deduction: 0, type: 'earning' },
          { id: '2', description: 'Transport allowance', amount: 0, rate: 0, value: 0, deduction: 0, type: 'earning' },
          { id: '3', description: 'State income tax', amount: 0, rate: 0, value: 0, deduction: 0, type: 'deduction' },
          { id: '4', description: 'Social security', amount: 0, rate: 0, value: 0, deduction: 0, type: 'deduction' },
          { id: '5', description: 'Loan deduction', amount: 0, rate: 0, value: 0, deduction: 0, type: 'deduction' },
          { id: '6', description: 'Salary advance', amount: 0, rate: 0, value: 0, deduction: 0, type: 'deduction' },
        ];

        return addEntity('salaryRecords', {
          employeeId: emp.id,
          employeeName: emp.name,
          batchId: batchId,
          month: selectedMonth,
          basicSalary: basicSalary,
          totalAllowance: basicSalary, // Initial total
          totalDeduction: 0,
          netSalary: basicSalary,
          status: 'Unpaid',
          payslipData: JSON.stringify(initialPayslip)
        });
      });

      await Promise.all(promises);
      alert(`Salary generation started for ${selectedMonth}`);
    } catch (error) {
      console.error("Error generating salary", error);
      alert("Failed to generate salary");
    }
  };

  const handleApprove = async (id: string) => {
    try {
      await updateEntity('payrollBatches', id, {
        status: 'Approved',
        approvedDate: new Date().toISOString().split('T')[0],
        approvedBy: 'Admin'
      });
    } catch (error) {
      console.error("Error approving salary", error);
    }
  };

  const handleEdit = (salary: GeneratedSalary) => {
    setEditingSalary({ ...salary });
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingSalary) {
      try {
        await updateEntity('payrollBatches', editingSalary.id, {
          salaryName: editingSalary.salaryName,
          status: editingSalary.status
        });
        setIsEditModalOpen(false);
      } catch (error) {
        console.error("Error updating batch", error);
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this salary generation? This will also delete all associated salary records.')) {
      try {
        await deleteEntity('payrollBatches', id);
        // Also delete associated salary records
        // Note: Ideally this should be a cloud function or batch write, but for now we filter client side
        const recordsToDelete = salaryRecords.filter(r => r.batchId === id);
        await Promise.all(recordsToDelete.map(r => deleteEntity('salaryRecords', r.id)));
      } catch (error) {
        console.error("Error deleting batch", error);
      }
    }
  };

  const handleView = (salary: GeneratedSalary) => {
    setViewingSalary(salary);
    setIsViewModalOpen(true);
  };

  const handleDownload = (format: 'CSV' | 'Excel') => {
    const dataToExport = generatedList.map(item => ({
      'Salary Name': item.salaryName,
      'Generate Date': item.generateDate,
      'Generate By': item.generateBy,
      'Status': item.status,
      'Approved Date': item.approvedDate,
      'Approved By': item.approvedBy
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Generated Salaries");
    
    if (format === 'Excel') {
      XLSX.writeFile(workbook, `Generated_Salaries.xlsx`);
    } else {
      XLSX.writeFile(workbook, `Generated_Salaries.csv`);
    }
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
            className="px-4 py-2 rounded text-sm font-medium bg-[#28A745] text-white transition-colors"
          >
            Salary Generate
          </Link>
          <Link 
            to="/payroll/manage-salary"
            className="px-4 py-2 rounded text-sm font-medium bg-[#E9ECEF] dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            Manage employee salary
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Select Month Card */}
          <div className={`rounded-xl border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} shadow-sm overflow-hidden h-fit`}>
            <div className="p-4 border-b border-slate-100 dark:border-slate-800">
              <h2 className="font-bold text-slate-800 dark:text-white">Select salary month</h2>
            </div>
            <div className="p-6 space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Salary month <span className="text-red-500">*</span></label>
                <input 
                  type="month" 
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className={`w-full border rounded px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-indigo-500 ${isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200'}`}
                />
              </div>
              <div className="flex justify-end">
                <button 
                  onClick={handleGenerate}
                  className="bg-[#007BFF] text-white px-6 py-2 rounded text-sm font-bold hover:bg-[#0069D9] transition-colors"
                >
                  Generate
                </button>
              </div>
            </div>
          </div>

          {/* Salary List Card */}
          <div className={`lg:col-span-2 rounded-xl border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} shadow-sm overflow-hidden`}>
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <h2 className="font-bold text-slate-800 dark:text-white">Salary list</h2>
              <div className="flex gap-2">
                <button onClick={() => handleDownload('CSV')} className="bg-[#17A2B8] text-white px-3 py-1.5 rounded text-xs font-bold flex items-center gap-1.5 hover:bg-[#138496]">
                  CSV
                </button>
                <button onClick={() => handleDownload('Excel')} className="bg-[#28A745] text-white px-3 py-1.5 rounded text-xs font-bold flex items-center gap-1.5 hover:bg-[#218838]">
                  Excel
                </button>
              </div>
            </div>
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-end">
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
            <div className="p-6">
              <div className="overflow-x-auto border border-slate-100 dark:border-slate-800 rounded-lg">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className={`${isDark ? 'bg-slate-800/50' : 'bg-slate-50'} border-b border-slate-100 dark:border-slate-800`}>
                      <th className="px-4 py-3 text-xs font-bold text-slate-600 dark:text-slate-400 uppercase">Sl</th>
                      <th className="px-4 py-3 text-xs font-bold text-slate-600 dark:text-slate-400 uppercase">Salary name</th>
                      <th className="px-4 py-3 text-xs font-bold text-slate-600 dark:text-slate-400 uppercase">Generate date</th>
                      <th className="px-4 py-3 text-xs font-bold text-slate-600 dark:text-slate-400 uppercase">Generate by</th>
                      <th className="px-4 py-3 text-xs font-bold text-slate-600 dark:text-slate-400 uppercase">Status</th>
                      <th className="px-4 py-3 text-xs font-bold text-slate-600 dark:text-slate-400 uppercase">Approved date</th>
                      <th className="px-4 py-3 text-xs font-bold text-slate-600 dark:text-slate-400 uppercase">Approved by</th>
                      <th className="px-4 py-3 text-xs font-bold text-slate-600 dark:text-slate-400 uppercase">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {generatedList.filter(item => item.salaryName.toLowerCase().includes(searchTerm.toLowerCase())).map((item, idx) => (
                      <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                        <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400">{idx + 1}</td>
                        <td className="px-4 py-3 text-sm font-medium text-slate-800 dark:text-white">{item.salaryName}</td>
                        <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400">{item.generateDate}</td>
                        <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400">{item.generateBy}</td>
                        <td className="px-4 py-3 text-sm">
                          <span className={`px-2 py-1 rounded text-[10px] font-bold ${
                            item.status === 'Approved' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'
                          }`}>
                            {item.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400">{item.approvedDate}</td>
                        <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400">{item.approvedBy}</td>
                        <td className="px-4 py-3 text-sm">
                          <div className="flex gap-2">
                            {item.status === 'Pending' && (
                              <button onClick={() => handleApprove(item.id)} className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded border border-indigo-100" title="Approve">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                            <button onClick={() => handleView(item)} className="p-1.5 text-slate-600 hover:bg-slate-50 rounded border border-slate-100" title="View Details">
                              <List className="w-3.5 h-3.5" />
                            </button>
                            <button onClick={() => handleEdit(item)} className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded border border-indigo-100" title="Edit">
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button onClick={() => handleDelete(item.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded border border-red-100" title="Delete">
                              <Trash2 className="w-3.5 h-3.5" />
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
      </div>

      {/* Edit Modal */}
      <AnimatePresence>
        {isEditModalOpen && editingSalary && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`rounded-xl shadow-xl w-full max-w-md overflow-hidden ${isDark ? 'bg-slate-900' : 'bg-white'}`}
            >
              <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                <h3 className="font-bold text-slate-800 dark:text-white">Edit Salary Generation</h3>
                <button onClick={() => setIsEditModalOpen(false)} className="p-1 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full">
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>
              
              <form onSubmit={handleSaveEdit} className="p-6 space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Salary Name</label>
                  <input 
                    type="text" 
                    value={editingSalary.salaryName}
                    onChange={(e) => setEditingSalary({...editingSalary, salaryName: e.target.value})}
                    className={`w-full border rounded px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-indigo-500 ${isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200'}`}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Status</label>
                  <select 
                    value={editingSalary.status}
                    onChange={(e) => setEditingSalary({...editingSalary, status: e.target.value as 'Approved' | 'Pending'})}
                    className={`w-full border rounded px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-indigo-500 ${isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200'}`}
                  >
                    <option value="Pending">Pending</option>
                    <option value="Approved">Approved</option>
                  </select>
                </div>
                <div className="flex justify-end gap-2 pt-4">
                  <button 
                    type="button"
                    onClick={() => setIsEditModalOpen(false)}
                    className="px-4 py-2 bg-slate-200 text-slate-700 rounded text-sm font-bold hover:bg-slate-300"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 text-white rounded text-sm font-bold hover:bg-indigo-700"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* View Modal */}
      <AnimatePresence>
        {isViewModalOpen && viewingSalary && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className={`rounded-xl shadow-2xl w-full max-w-4xl overflow-hidden ${isDark ? 'bg-slate-900' : 'bg-white'}`}
            >
              <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
                <h3 className="font-bold text-slate-800 dark:text-white">Salary Details - {viewingSalary.salaryName}</h3>
                <div className="flex gap-2">
                  <button className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-md text-slate-600 dark:text-slate-400">
                    <Printer className="w-5 h-5" />
                  </button>
                  <button onClick={() => setIsViewModalOpen(false)} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-md text-slate-600 dark:text-slate-400">
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
              
              <div className="p-8 space-y-6">
                <div className="grid grid-cols-2 gap-8 text-sm">
                  <div className="space-y-2">
                    <p><span className="font-bold text-slate-500">Generated Date:</span> <span className="text-slate-800 dark:text-white">{viewingSalary.generateDate}</span></p>
                    <p><span className="font-bold text-slate-500">Generated By:</span> <span className="text-slate-800 dark:text-white">{viewingSalary.generateBy}</span></p>
                  </div>
                  <div className="space-y-2 text-right">
                    <p><span className="font-bold text-slate-500">Status:</span> <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${viewingSalary.status === 'Approved' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>{viewingSalary.status}</span></p>
                    <p><span className="font-bold text-slate-500">Approved Date:</span> <span className="text-slate-800 dark:text-white">{viewingSalary.approvedDate}</span></p>
                  </div>
                </div>

                <div className="overflow-hidden border border-slate-100 dark:border-slate-800 rounded-lg">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                        <th className="px-4 py-3 text-xs font-bold text-slate-600 dark:text-slate-400 uppercase">Employee</th>
                        <th className="px-4 py-3 text-xs font-bold text-slate-600 dark:text-slate-400 uppercase">Basic Salary</th>
                        <th className="px-4 py-3 text-xs font-bold text-slate-600 dark:text-slate-400 uppercase">Allowances</th>
                        <th className="px-4 py-3 text-xs font-bold text-slate-600 dark:text-slate-400 uppercase">Deductions</th>
                        <th className="px-4 py-3 text-xs font-bold text-slate-600 dark:text-slate-400 uppercase">Net Salary</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
                      {activeEmployees.slice(0, 5).map((emp) => (
                        <tr key={emp.id}>
                          <td className="px-4 py-3 text-slate-800 dark:text-white">{emp.name}</td>
                          <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{settings.currency.symbol} 5,000.00</td>
                          <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{settings.currency.symbol} 500.00</td>
                          <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{settings.currency.symbol} 0.00</td>
                          <td className="px-4 py-3 font-bold text-slate-800 dark:text-white">{settings.currency.symbol} 5,500.00</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="bg-slate-50 dark:bg-slate-800/50 font-bold">
                        <td className="px-4 py-3 text-slate-800 dark:text-white">Total</td>
                        <td className="px-4 py-3 text-slate-800 dark:text-white">{settings.currency.symbol} 9,500.00</td>
                        <td className="px-4 py-3 text-slate-800 dark:text-white">{settings.currency.symbol} 900.00</td>
                        <td className="px-4 py-3 text-slate-800 dark:text-white">{settings.currency.symbol} 100.00</td>
                        <td className="px-4 py-3 text-indigo-600 dark:text-indigo-400">{settings.currency.symbol} 10,300.00</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <button 
                    onClick={() => handleDownload('Excel')}
                    className="bg-[#28A745] text-white px-4 py-2 rounded text-sm font-bold flex items-center gap-2 hover:bg-[#218838]"
                  >
                    <Download className="w-4 h-4" />
                    Download Excel
                  </button>
                  <button 
                    onClick={() => setIsViewModalOpen(false)}
                    className="bg-indigo-600 text-white px-6 py-2 rounded text-sm font-bold hover:bg-indigo-700"
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </AdminLayout>
  );
}
