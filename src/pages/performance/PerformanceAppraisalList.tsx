import React, { useState } from 'react';
import { 
  Search, 
  Plus, 
  Printer, 
  Download, 
  Eye, 
  Edit3, 
  Trash2,
  Filter,
  FileText
} from 'lucide-react';
import AdminLayout from '../../components/AdminLayout';
import { useTheme } from '../../context/ThemeContext';
import { Link } from 'react-router-dom';

interface AppraisalRecord {
  id: string;
  employeeName: string;
  employeeId: string;
  department: string;
  appraisalDate: string;
  period: string;
  score: number;
  status: 'Draft' | 'Completed';
}

const initialRecords: AppraisalRecord[] = [
  { id: '1', employeeName: 'John Doe', employeeId: 'EMP001', department: 'Engineering', appraisalDate: '2026-02-20', period: 'Annual 2025', score: 85, status: 'Completed' },
  { id: '2', employeeName: 'Jane Smith', employeeId: 'EMP002', department: 'Design', appraisalDate: '2026-02-25', period: 'Annual 2025', score: 92, status: 'Completed' },
  { id: '3', employeeName: 'Robert Johnson', employeeId: 'EMP003', department: 'Marketing', appraisalDate: '2026-02-27', period: 'Annual 2025', score: 78, status: 'Draft' },
];

export default function PerformanceAppraisalList() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [searchTerm, setSearchTerm] = useState('');
  const [records, setRecords] = useState<AppraisalRecord[]>(initialRecords);

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this appraisal record?')) {
      setRecords(records.filter(r => r.id !== id));
    }
  };

  const handleDownload = (format: string) => {
    alert(`Downloading appraisal list as ${format}`);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-slate-800 dark:text-white">Performance Appraisal List</h2>
          <Link 
            to="/performance/appraisal-report"
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-indigo-700"
          >
            <Plus className="w-4 h-4" />
            New Appraisal
          </Link>
        </div>

        {/* Filter Card */}
        <div className={`rounded-xl border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} shadow-sm overflow-hidden`}>
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
            <h2 className="font-bold text-slate-800 dark:text-white">Filter Appraisals</h2>
            <button className="bg-[#28A745] text-white px-3 py-1.5 rounded text-xs font-bold flex items-center gap-1.5 hover:bg-[#218838]">
              <Filter className="w-3.5 h-3.5" />
              Filter
            </button>
          </div>
          <div className="p-6 flex items-center gap-4">
            <div className="flex-1 max-w-sm relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search by employee name or ID..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full pl-10 pr-4 py-2 border rounded-md text-sm outline-none focus:ring-1 focus:ring-indigo-500 ${isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200'}`}
              />
            </div>
            <button className="bg-[#28A745] text-white px-6 py-2 rounded text-sm font-bold hover:bg-[#218838]">
              Find
            </button>
            <button className="bg-[#DC3545] text-white px-6 py-2 rounded text-sm font-bold hover:bg-[#C82333]">
              Reset
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

              <div className="flex items-center gap-2">
                <button onClick={() => handleDownload('CSV')} className="bg-[#28A745] text-white px-3 py-1.5 rounded text-xs font-bold flex items-center gap-1.5 hover:bg-[#218838]">CSV</button>
                <button onClick={() => handleDownload('Excel')} className="bg-[#28A745] text-white px-3 py-1.5 rounded text-xs font-bold flex items-center gap-1.5 hover:bg-[#218838]">Excel</button>
                <button onClick={() => handleDownload('PDF')} className="bg-red-600 text-white px-3 py-1.5 rounded text-xs font-bold flex items-center gap-1.5 hover:bg-red-700">PDF</button>
                <button onClick={() => window.print()} className="bg-slate-600 text-white px-3 py-1.5 rounded text-xs font-bold flex items-center gap-1.5 hover:bg-slate-700">Print</button>
              </div>
            </div>

            <div className="overflow-x-auto border border-slate-100 dark:border-slate-800 rounded-lg">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className={`${isDark ? 'bg-slate-800/50' : 'bg-slate-50'} border-b border-slate-100 dark:border-slate-800`}>
                    <th className="px-4 py-3 text-xs font-bold text-slate-600 dark:text-slate-400 uppercase">Sl</th>
                    <th className="px-4 py-3 text-xs font-bold text-slate-600 dark:text-slate-400 uppercase">Employee Name</th>
                    <th className="px-4 py-3 text-xs font-bold text-slate-600 dark:text-slate-400 uppercase">Employee ID</th>
                    <th className="px-4 py-3 text-xs font-bold text-slate-600 dark:text-slate-400 uppercase">Department</th>
                    <th className="px-4 py-3 text-xs font-bold text-slate-600 dark:text-slate-400 uppercase">Appraisal Date</th>
                    <th className="px-4 py-3 text-xs font-bold text-slate-600 dark:text-slate-400 uppercase">Period</th>
                    <th className="px-4 py-3 text-xs font-bold text-slate-600 dark:text-slate-400 uppercase">Score</th>
                    <th className="px-4 py-3 text-xs font-bold text-slate-600 dark:text-slate-400 uppercase">Status</th>
                    <th className="px-4 py-3 text-xs font-bold text-slate-600 dark:text-slate-400 uppercase">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {records.filter(r => r.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) || r.employeeId.toLowerCase().includes(searchTerm.toLowerCase())).map((record, idx) => (
                    <tr key={record.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400">{idx + 1}</td>
                      <td className="px-4 py-3 text-sm font-medium text-slate-800 dark:text-white">{record.employeeName}</td>
                      <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400">{record.employeeId}</td>
                      <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400">{record.department}</td>
                      <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400">{record.appraisalDate}</td>
                      <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400">{record.period}</td>
                      <td className="px-4 py-3 text-sm">
                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                          record.score >= 90 ? 'bg-green-100 text-green-700' :
                          record.score >= 80 ? 'bg-blue-100 text-blue-700' :
                          record.score >= 70 ? 'bg-amber-100 text-amber-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {record.score}%
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                          record.status === 'Completed' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-700'
                        }`}>
                          {record.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <div className="flex gap-2">
                          <Link 
                            to={`/performance/appraisal-report?id=${record.id}`}
                            className="p-1.5 bg-amber-400 text-white rounded hover:bg-amber-500 transition-colors"
                            title="View/Edit"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                          <button 
                            onClick={() => handleDelete(record.id)}
                            className="p-1.5 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
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
    </AdminLayout>
  );
}
