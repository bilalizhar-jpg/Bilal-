import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { useTheme } from '../../context/ThemeContext';
import { Search, Plus, Filter, MoreVertical, ArrowUpDown, Download, RefreshCw, Columns } from 'lucide-react';
import AdminLayout from '../../components/AdminLayout';
import { useCompanyData } from '../../context/CompanyDataContext';

export default function Opportunities() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const { sales } = useCompanyData();

  const filteredOpportunities = sales.filter((opp: any) =>
    opp.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>
              Opportunities <span className="text-sm font-normal text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">{filteredOpportunities.length}</span>
            </h1>
            <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Home / Opportunities</p>
          </div>
          <div className="flex gap-2">
            <button className="flex items-center gap-2 px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-md hover:bg-slate-50 dark:hover:bg-slate-800 text-sm font-medium">
              <Download className="w-4 h-4" /> Export
            </button>
            <button className="p-2 border border-slate-300 dark:border-slate-600 rounded-md hover:bg-slate-50 dark:hover:bg-slate-800">
              <RefreshCw className="w-4 h-4" />
            </button>
            <button className="p-2 border border-slate-300 dark:border-slate-600 rounded-md hover:bg-slate-50 dark:hover:bg-slate-800">
              <Columns className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pl-10 pr-4 py-2 rounded-md border ${isDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-300'}`}
            />
          </div>
          <button onClick={() => navigate('/crm/opportunities/add')} className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm font-medium">
            <Plus className="w-4 h-4" /> Add Opportunity
          </button>
        </div>

        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-md hover:bg-slate-50 dark:hover:bg-slate-800 text-sm font-medium">
            <ArrowUpDown className="w-4 h-4" /> Sort By
          </button>
          <button className="flex items-center gap-2 px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-md hover:bg-slate-50 dark:hover:bg-slate-800 text-sm font-medium">
            10 Feb 26 - 11 Mar 26
          </button>
          <button className="ml-auto flex items-center gap-2 px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-md hover:bg-slate-50 dark:hover:bg-slate-800 text-sm font-medium">
            <Filter className="w-4 h-4" /> Filter
          </button>
          <button className="flex items-center gap-2 px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-md hover:bg-slate-50 dark:hover:bg-slate-800 text-sm font-medium">
            <Columns className="w-4 h-4" /> Manage Columns
          </button>
        </div>

        <div className={`rounded-xl border overflow-hidden ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
          <table className="w-full text-sm text-left">
            <thead className={`text-xs uppercase ${isDark ? 'bg-slate-900 text-slate-400' : 'bg-slate-50 text-slate-500'}`}>
              <tr>
                <th className="py-3 px-4">Opportunity ID</th>
                <th className="py-3 px-4">Opportunity Name</th>
                <th className="py-3 px-4">Account</th>
                <th className="py-3 px-4">Expected Value</th>
                <th className="py-3 px-4">Stage</th>
                <th className="py-3 px-4">Expected Close Date</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Action</th>
              </tr>
            </thead>
            <tbody className={isDark ? 'text-slate-300' : 'text-slate-700'}>
              {filteredOpportunities.map((opp: any) => (
                <tr key={opp.id} className="border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-900/50">
                  <td className="py-3 px-4">{opp.id}</td>
                  <td className="py-3 px-4 font-medium">{opp.name}</td>
                  <td className="py-3 px-4">{opp.account}</td>
                  <td className="py-3 px-4">${opp.value}</td>
                  <td className="py-3 px-4">{opp.stage}</td>
                  <td className="py-3 px-4">{opp.closeDate}</td>
                  <td className="py-3 px-4">{opp.status}</td>
                  <td className="py-3 px-4"><MoreVertical className="w-4 h-4" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}
