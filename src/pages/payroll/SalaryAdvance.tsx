import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  Search, 
  Download, 
  FileText, 
  Edit, 
  Trash2, 
  X,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import AdminLayout from '../../components/AdminLayout';
import { useTheme } from '../../context/ThemeContext';

interface SalaryAdvanceRecord {
  id: string;
  employeeName: string;
  amount: number;
  releaseAmount: number;
  salaryMonth: string;
  status: 'Active' | 'Inactive';
  approved: boolean;
}

const initialRecords: SalaryAdvanceRecord[] = [
  { id: '1', employeeName: 'Kristen Lillith Stout Rodriquez', amount: 50, releaseAmount: 0, salaryMonth: '2026-03', status: 'Active', approved: true },
  { id: '2', employeeName: 'Honorato Imogene Curry Terry', amount: 5000, releaseAmount: 0, salaryMonth: '2026-02', status: 'Active', approved: true },
  { id: '3', employeeName: 'Maisha Lucy Zamora Gonzales', amount: 100, releaseAmount: 0, salaryMonth: '2026-02', status: 'Active', approved: true },
  { id: '4', employeeName: 'Honorato Imogene Curry Terry', amount: 5000, releaseAmount: 0, salaryMonth: '2026-02', status: 'Active', approved: true },
  { id: '5', employeeName: 'Amy Aphrodite Zamora Peck', amount: 12000, releaseAmount: 0, salaryMonth: '2026-02', status: 'Active', approved: true },
  { id: '6', employeeName: 'Amy Aphrodite Zamora Peck', amount: 999999.99, releaseAmount: 0, salaryMonth: '2026-03', status: 'Active', approved: true },
  { id: '7', employeeName: 'Honorato Imogene Curry Terry', amount: 8674, releaseAmount: 0, salaryMonth: '2026-02', status: 'Active', approved: true },
  { id: '8', employeeName: 'Amy Aphrodite Zamora Peck', amount: 15000, releaseAmount: 0, salaryMonth: '2026-02', status: 'Active', approved: true },
  { id: '9', employeeName: 'Maisha Lucy Zamora Gonzales', amount: 25000, releaseAmount: 0, salaryMonth: '2026-01', status: 'Active', approved: true },
  { id: '10', employeeName: 'Mohmed Afif Akram', amount: 222, releaseAmount: 0, salaryMonth: '2025-07', status: 'Inactive', approved: false },
];

export default function SalaryAdvance() {
  const [records, setRecords] = useState<SalaryAdvanceRecord[]>(initialRecords);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [formData, setFormData] = useState({
    employee: '',
    amount: '',
    salaryMonth: '',
    isActive: 'Active',
    approved: false
  });

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const newRecord: SalaryAdvanceRecord = {
      id: Math.random().toString(36).substr(2, 9),
      employeeName: formData.employee,
      amount: parseFloat(formData.amount),
      releaseAmount: 0,
      salaryMonth: formData.salaryMonth,
      status: formData.isActive as 'Active' | 'Inactive',
      approved: formData.approved
    };
    setRecords([newRecord, ...records]);
    setIsModalOpen(false);
    setFormData({ employee: '', amount: '', salaryMonth: '', isActive: 'Active', approved: false });
  };

  const handleDownload = (format: 'CSV' | 'Excel') => {
    alert(`Downloading Salary Advance list in ${format} format...`);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Tabs */}
        <div className="flex items-center gap-2 mb-6">
          <button className="px-4 py-2 rounded text-sm font-medium bg-[#28A745] text-white">
            Salary Advance
          </button>
          <button className="px-4 py-2 rounded text-sm font-medium bg-[#E9ECEF] dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700">
            Salary Generate
          </button>
          <button className="px-4 py-2 rounded text-sm font-medium bg-[#E9ECEF] dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700">
            Manage employee salary
          </button>
        </div>

        {/* Main Card */}
        <div className={`rounded-xl border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} shadow-sm overflow-hidden`}>
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
            <h2 className="font-bold text-slate-800 dark:text-white">Salary advanced list</h2>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="bg-[#28A745] text-white px-4 py-2 rounded text-sm font-bold flex items-center gap-2 hover:bg-[#218838]"
            >
              <Plus className="w-4 h-4" />
              Add salary advance
            </button>
          </div>

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
                  <button 
                    onClick={() => handleDownload('CSV')}
                    className="bg-[#17A2B8] text-white px-3 py-1.5 rounded text-xs font-bold flex items-center gap-1.5 hover:bg-[#138496]"
                  >
                    CSV
                  </button>
                  <button 
                    onClick={() => handleDownload('Excel')}
                    className="bg-[#28A745] text-white px-3 py-1.5 rounded text-xs font-bold flex items-center gap-1.5 hover:bg-[#218838]"
                  >
                    Excel
                  </button>
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
                    <th className="px-4 py-3 text-xs font-bold text-slate-600 dark:text-slate-400 uppercase">Amount</th>
                    <th className="px-4 py-3 text-xs font-bold text-slate-600 dark:text-slate-400 uppercase">Release amount</th>
                    <th className="px-4 py-3 text-xs font-bold text-slate-600 dark:text-slate-400 uppercase">Salary month</th>
                    <th className="px-4 py-3 text-xs font-bold text-slate-600 dark:text-slate-400 uppercase">Approved</th>
                    <th className="px-4 py-3 text-xs font-bold text-slate-600 dark:text-slate-400 uppercase">Status</th>
                    <th className="px-4 py-3 text-xs font-bold text-slate-600 dark:text-slate-400 uppercase">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {records.filter(r => r.employeeName.toLowerCase().includes(searchTerm.toLowerCase())).map((record, idx) => (
                    <tr key={record.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400">{idx + 1}</td>
                      <td className="px-4 py-3 text-sm font-medium text-slate-800 dark:text-white">{record.employeeName}</td>
                      <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400">{record.amount.toLocaleString()}</td>
                      <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400">{record.releaseAmount}</td>
                      <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400">{record.salaryMonth}</td>
                      <td className="px-4 py-3 text-sm text-center">
                        {record.approved ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-500 mx-auto" />
                        ) : (
                          <XCircle className="w-5 h-5 text-red-500 mx-auto" />
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${
                          record.status === 'Active' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'
                        }`}>
                          {record.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <div className="flex gap-2">
                          <button className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded border border-indigo-100">
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button className="p-1.5 text-red-600 hover:bg-red-50 rounded border border-red-100">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between pt-4">
              <div className="text-sm text-slate-500">Showing 1 to 10 of 356 entries</div>
              <div className="flex gap-1">
                <button className="px-3 py-1 border rounded text-sm hover:bg-slate-50 dark:hover:bg-slate-800">Previous</button>
                <button className="px-3 py-1 bg-indigo-600 text-white rounded text-sm">1</button>
                <button className="px-3 py-1 border rounded text-sm hover:bg-slate-50 dark:hover:bg-slate-800">2</button>
                <button className="px-3 py-1 border rounded text-sm hover:bg-slate-50 dark:hover:bg-slate-800">3</button>
                <button className="px-3 py-1 border rounded text-sm hover:bg-slate-50 dark:hover:bg-slate-800">Next</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`rounded-xl shadow-xl w-full max-w-lg overflow-hidden ${isDark ? 'bg-slate-900' : 'bg-white'}`}
            >
              <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                <h3 className="font-bold text-slate-800 dark:text-white">Add salary advance</h3>
                <button onClick={() => setIsModalOpen(false)} className="p-1 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full">
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>
              
              <form onSubmit={handleAdd} className="p-6 space-y-4">
                <div className="grid grid-cols-3 items-center gap-4">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Employee <span className="text-red-500">*</span></label>
                  <div className="col-span-2">
                    <select 
                      required
                      value={formData.employee}
                      onChange={(e) => setFormData({...formData, employee: e.target.value})}
                      className={`w-full border rounded px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-indigo-500 ${isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200'}`}
                    >
                      <option value="">Select employee</option>
                      <option>Kristen Lillith Stout Rodriquez</option>
                      <option>Honorato Imogene Curry Terry</option>
                      <option>Maisha Lucy Zamora Gonzales</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-3 items-center gap-4">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Amount <span className="text-red-500">*</span></label>
                  <div className="col-span-2">
                    <input 
                      type="number" 
                      required
                      placeholder="Amount"
                      value={formData.amount}
                      onChange={(e) => setFormData({...formData, amount: e.target.value})}
                      className={`w-full border rounded px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-indigo-500 ${isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200'}`}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 items-center gap-4">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Salary month <span className="text-red-500">*</span></label>
                  <div className="col-span-2">
                    <input 
                      type="month" 
                      required
                      value={formData.salaryMonth}
                      onChange={(e) => setFormData({...formData, salaryMonth: e.target.value})}
                      className={`w-full border rounded px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-indigo-500 ${isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200'}`}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 items-center gap-4">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Is active <span className="text-red-500">*</span></label>
                  <div className="col-span-2 flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="radio" 
                        name="isActive" 
                        value="Active" 
                        checked={formData.isActive === 'Active'}
                        onChange={(e) => setFormData({...formData, isActive: e.target.value})}
                        className="text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className="text-sm text-slate-700 dark:text-slate-300">Active</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="radio" 
                        name="isActive" 
                        value="Inactive"
                        checked={formData.isActive === 'Inactive'}
                        onChange={(e) => setFormData({...formData, isActive: e.target.value})}
                        className="text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className="text-sm text-slate-700 dark:text-slate-300">Inactive</span>
                    </label>
                  </div>
                </div>

                <div className="grid grid-cols-3 items-center gap-4">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Approved</label>
                  <div className="col-span-2">
                    <input 
                      type="checkbox" 
                      checked={formData.approved}
                      onChange={(e) => setFormData({...formData, approved: e.target.checked})}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-slate-300 rounded"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <button 
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 bg-red-500 text-white rounded text-sm font-bold hover:bg-red-600"
                  >
                    Close
                  </button>
                  <button 
                    type="submit"
                    className="px-4 py-2 bg-[#28A745] text-white rounded text-sm font-bold hover:bg-[#218838]"
                  >
                    Save
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </AdminLayout>
  );
}
