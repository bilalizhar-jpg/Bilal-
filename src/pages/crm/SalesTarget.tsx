import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { useTheme } from '../../context/ThemeContext';
import { 
  Search, Plus, Filter, MoreVertical, ArrowUpDown, 
  Download, RefreshCw, Columns, ChevronLeft, ChevronRight,
  ChevronDown, Calendar, X
} from 'lucide-react';
import AdminLayout from '../../components/AdminLayout';
import { useEmployees } from '../../context/EmployeeContext';

const salesTargets: any[] = [];

export default function SalesTarget() {
  const { theme } = useTheme();
  const { employees } = useEmployees();
  const isDark = theme === 'dark';
  const [activeTab, setActiveTab] = useState('User');
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Achieved': return 'bg-[#22C55E] text-white';
      case 'At Risk': return 'bg-[#EF4444] text-white';
      case 'Inprogress': return 'bg-[#F59E0B] text-white';
      default: return 'bg-slate-500 text-white';
    }
  };

  const getAchievedColor = (status: string) => {
    switch (status) {
      case 'Achieved': return 'text-green-600';
      case 'At Risk': return 'text-red-600';
      case 'Inprogress': return 'text-red-600';
      default: return '';
    }
  };

  const inputClass = `w-full px-3 py-2 text-sm rounded-md border ${isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-200 shadow-sm'}`;

  return (
    <AdminLayout>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Sales Target</h1>
            </div>
            <p className="text-[11px] text-slate-500">Home &nbsp; &gt; &nbsp; <span className="font-medium text-slate-900 dark:text-slate-300">Sales Target</span></p>
          </div>
          <div className="flex gap-2">
            <button className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 dark:border-slate-700 rounded bg-white dark:bg-slate-800 text-xs font-medium shadow-sm">
              <Download className="w-3.5 h-3.5" /> Export <ChevronDown className="w-3.5 h-3.5" />
            </button>
            <button className="p-1.5 border border-slate-200 dark:border-slate-700 rounded bg-white dark:bg-slate-800 shadow-sm">
              <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
            </button>
            <button className="p-1.5 border border-slate-200 dark:border-slate-700 rounded bg-white dark:bg-slate-800 shadow-sm">
              <Columns className="w-3.5 h-3.5 text-slate-500" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-slate-200 dark:border-slate-700 mt-2">
          <div className="flex gap-6">
            {['User', 'Teams'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-2 text-xs font-bold transition-colors relative px-2 ${
                  activeTab === tab 
                    ? 'text-red-600' 
                    : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'
                }`}
              >
                {tab}
                {activeTab === tab && (
                  <motion.div 
                    layoutId="activeTab"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-600"
                  />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Search and Add */}
        <div className="flex items-center justify-between py-2">
          <div className="relative w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pl-9 pr-4 py-2 text-xs rounded-md border ${isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-200'}`}
            />
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="text-red-600 font-bold text-sm hover:text-red-700"
          >
            Add Sales Target
          </button>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 dark:border-slate-700 rounded bg-white dark:bg-slate-800 text-xs font-medium shadow-sm">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" /> Sort By <ChevronDown className="w-3.5 h-3.5" />
          </button>
          <button className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 dark:border-slate-700 rounded bg-white dark:bg-slate-800 text-xs font-medium shadow-sm">
            <Calendar className="w-3.5 h-3.5 text-slate-400" /> 11 Feb 26 - 12 Mar 26
          </button>
          <div className="flex-1" />
          <button className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 dark:border-slate-700 rounded bg-white dark:bg-slate-800 text-xs font-medium shadow-sm">
            <Filter className="w-3.5 h-3.5 text-slate-400" /> Filter <ChevronDown className="w-3.5 h-3.5" />
          </button>
          <button className="flex items-center gap-1.5 px-3 py-1.5 bg-[#EEF2FF] text-[#4F46E5] border border-[#E0E7FF] rounded text-xs font-medium">
            <Columns className="w-3.5 h-3.5" /> Manage Columns
          </button>
        </div>

        {/* Table */}
        <div className={`rounded-lg border overflow-hidden ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead className={`${isDark ? 'bg-slate-900 text-slate-400' : 'bg-slate-50 text-slate-600'} border-b border-slate-200 dark:border-slate-700`}>
                <tr>
                  <th className="py-3 px-4 font-bold">Target ID</th>
                  <th className="py-3 px-4 font-bold">
                    <div className="flex items-center gap-1"><ArrowUpDown className="w-3 h-3" /> Employees</div>
                  </th>
                  <th className="py-3 px-4 font-bold">
                    <div className="flex items-center gap-1"><ArrowUpDown className="w-3 h-3" /> Period</div>
                  </th>
                  <th className="py-3 px-4 font-bold">
                    <div className="flex items-center gap-1"><ArrowUpDown className="w-3 h-3" /> Target Amount</div>
                  </th>
                  <th className="py-3 px-4 font-bold">
                    <div className="flex items-center gap-1"><ArrowUpDown className="w-3 h-3" /> Achieved Sales</div>
                  </th>
                  <th className="py-3 px-4 font-bold">
                    <div className="flex items-center gap-1"><ArrowUpDown className="w-3 h-3" /> Achievement %</div>
                  </th>
                  <th className="py-3 px-4 font-bold">
                    <div className="flex items-center gap-1"><ArrowUpDown className="w-3 h-3" /> Status</div>
                  </th>
                  <th className="py-3 px-4 font-bold text-center">Action</th>
                </tr>
              </thead>
              <tbody className={isDark ? 'text-slate-300' : 'text-slate-800'}>
                {salesTargets.length > 0 ? salesTargets.map((target, idx) => (
                  <tr key={idx} className="border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                    <td className="py-4 px-4 font-medium">{target.id}</td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <img src={target.avatar} alt="" className="w-7 h-7 rounded-full object-cover" />
                        <span className="font-medium">{target.employee}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4">{target.period}</td>
                    <td className="py-4 px-4 font-medium">{target.target}</td>
                    <td className={`py-4 px-4 font-bold ${getAchievedColor(target.status)}`}>{target.achieved}</td>
                    <td className="py-4 px-4 font-medium">{target.percentage}</td>
                    <td className="py-4 px-4">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${getStatusColor(target.status)}`}>
                        {target.status}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5 text-xs text-slate-900 dark:text-slate-300">
                        <button className="hover:text-red-600 font-medium">Edit</button>
                        <span className="text-slate-300">|</span>
                        <button className="hover:text-red-600 font-medium">Delete</button>
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-slate-500">No sales targets found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-2">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span>Show</span>
            <select className={`px-1.5 py-1 border rounded ${isDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'}`}>
              <option>10</option>
              <option>25</option>
              <option>50</option>
            </select>
            <span>entries</span>
          </div>
          <div className="flex items-center gap-1">
            <button className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30" disabled>
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button className="w-6 h-6 flex items-center justify-center rounded bg-red-600 text-white text-xs font-bold shadow-sm">1</button>
            <button className="w-6 h-6 flex items-center justify-center rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-xs">2</button>
            <button className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800">
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Add Sales Target Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`w-full max-w-lg rounded-lg shadow-xl overflow-hidden ${isDark ? 'bg-slate-800' : 'bg-white'}`}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-700">
              <h2 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Add Sales Target</h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-full hover:bg-red-50 text-red-400 hover:text-red-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              <div>
                <label className={`block text-sm font-bold mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-900'}`}>
                  Employee <span className="text-red-500">*</span>
                </label>
                <select className={inputClass}>
                  <option value="">Select Employee</option>
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.id}>{emp.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className={`block text-sm font-bold mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-900'}`}>
                  Period <span className="text-red-500">*</span>
                </label>
                <input type="date" className={inputClass} />
              </div>

              <div>
                <label className={`block text-sm font-bold mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-900'}`}>
                  Target Amount
                </label>
                <input type="text" className={inputClass} />
              </div>

              <div>
                <label className={`block text-sm font-bold mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-900'}`}>
                  Achieved Sales
                </label>
                <input type="text" className={inputClass} />
              </div>

              <div>
                <label className={`block text-sm font-bold mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-900'}`}>
                  Achievement %
                </label>
                <input type="text" className={inputClass} />
              </div>

              <div>
                <label className={`block text-sm font-bold mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-900'}`}>
                  Status
                </label>
                <input type="text" className={inputClass} />
              </div>
            </div>

            <div className="flex justify-end gap-3 p-6 border-t border-slate-100 dark:border-slate-700">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="px-6 py-2 text-sm font-medium bg-slate-50 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors"
              >
                Cancel
              </button>
              <button className="px-6 py-2 text-sm font-bold bg-[#E11D48] text-white rounded hover:bg-red-700 transition-colors shadow-sm">
                Create New
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AdminLayout>
  );
}
