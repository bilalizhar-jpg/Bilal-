import React, { useState } from 'react';
import { 
  CheckCircle2, 
  List, 
  Edit, 
  Trash2,
  ChevronRight
} from 'lucide-react';
import AdminLayout from '../../components/AdminLayout';
import { useTheme } from '../../context/ThemeContext';

interface GeneratedSalary {
  id: string;
  salaryName: string;
  generateDate: string;
  generateBy: string;
  status: 'Approved' | 'Pending';
  approvedDate: string;
  approvedBy: string;
}

const initialGenerated: GeneratedSalary[] = [
  { id: '1', salaryName: '2050-02', generateDate: '2026-02-12', generateBy: 'Admin', status: 'Approved', approvedDate: '2026-02-15', approvedBy: 'Admin' },
  { id: '2', salaryName: '2039-06', generateDate: '2026-01-29', generateBy: 'Admin', status: 'Approved', approvedDate: '2026-02-02', approvedBy: 'Admin' },
  { id: '3', salaryName: '2032-02', generateDate: '2026-01-28', generateBy: 'Admin', status: 'Approved', approvedDate: '2026-01-28', approvedBy: 'Admin' },
  { id: '4', salaryName: '2028-07', generateDate: '2026-01-22', generateBy: 'Admin', status: 'Approved', approvedDate: '2026-01-22', approvedBy: 'Admin' },
  { id: '5', salaryName: '2028-10', generateDate: '2026-01-22', generateBy: 'Admin', status: 'Approved', approvedDate: '2026-01-22', approvedBy: 'Admin' },
  { id: '6', salaryName: '1234-12', generateDate: '2025-12-29', generateBy: 'Admin', status: 'Approved', approvedDate: '2026-01-19', approvedBy: 'Admin' },
  { id: '7', salaryName: '8888-12', generateDate: '2025-12-24', generateBy: 'Admin', status: 'Approved', approvedDate: '2025-12-24', approvedBy: 'Admin' },
  { id: '8', salaryName: '2020-12', generateDate: '2025-10-31', generateBy: 'Admin', status: 'Approved', approvedDate: '2025-11-03', approvedBy: 'Admin' },
];

export default function SalaryGenerate() {
  const [selectedMonth, setSelectedMonth] = useState('2026-02');
  const [generatedList, setGeneratedList] = useState<GeneratedSalary[]>(initialGenerated);
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const handleGenerate = () => {
    const newGen: GeneratedSalary = {
      id: Math.random().toString(36).substr(2, 9),
      salaryName: selectedMonth,
      generateDate: new Date().toISOString().split('T')[0],
      generateBy: 'Admin',
      status: 'Pending',
      approvedDate: '-',
      approvedBy: '-'
    };
    setGeneratedList([newGen, ...generatedList]);
    alert(`Salary generation started for ${selectedMonth}`);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Tabs */}
        <div className="flex items-center gap-2 mb-6">
          <button className="px-4 py-2 rounded text-sm font-medium bg-[#E9ECEF] dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700">
            Salary Advance
          </button>
          <button className="px-4 py-2 rounded text-sm font-medium bg-[#28A745] text-white">
            Salary Generate
          </button>
          <button className="px-4 py-2 rounded text-sm font-medium bg-[#E9ECEF] dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700">
            Manage employee salary
          </button>
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
            <div className="p-4 border-b border-slate-100 dark:border-slate-800">
              <h2 className="font-bold text-slate-800 dark:text-white">Salary list</h2>
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
                    {generatedList.map((item, idx) => (
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
                            <button className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded border border-indigo-100">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                            </button>
                            <button className="p-1.5 text-slate-600 hover:bg-slate-50 rounded border border-slate-100">
                              <List className="w-3.5 h-3.5" />
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
    </AdminLayout>
  );
}
