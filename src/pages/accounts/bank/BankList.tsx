import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, FolderPlus, Search, SlidersHorizontal, FileText, FileSpreadsheet, Printer, Edit2, Trash2, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCompanyData } from '../../../context/CompanyDataContext';
import { useTheme } from '../../../context/ThemeContext';
import AdminLayout from '../../../components/AdminLayout';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function BankList() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const navigate = useNavigate();
  const { bankAccounts, deleteEntity } = useCompanyData();
  const [searchTerm, setSearchTerm] = useState('');
  
  // Filter states
  const [showFilter, setShowFilter] = useState(false);
  const [statusFilter, setStatusFilter] = useState('All');

  const filteredBanks = bankAccounts.filter(bank => {
    const matchesSearch = 
      bank.bankName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bank.accountNo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bank.accountName?.toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesStatus = statusFilter === 'All' || bank.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this bank account?')) {
      try {
        await deleteEntity('bankAccounts', id);
      } catch (error) {
        console.error('Error deleting bank:', error);
      }
    }
  };

  const exportToExcel = () => {
    const data = filteredBanks.map(bank => ({
      'Bank Name': bank.bankName,
      'Branch': bank.branch,
      'Account No': bank.accountNo,
      'Account Name': bank.accountName,
      'Phone': bank.phone,
      'Initial Balance': bank.initialBalance,
      'Status': bank.status
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Banks');
    XLSX.writeFile(wb, 'Bank_List.xlsx');
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.text('Bank Account List', 14, 15);
    const tableData = filteredBanks.map(bank => [
      bank.bankName || '',
      bank.branch || '',
      bank.accountNo || '',
      bank.accountName || '',
      bank.phone || '',
      (bank.initialBalance || 0).toString(),
      bank.status || ''
    ]);
    autoTable(doc, {
      head: [['Bank Name', 'Branch', 'Account No', 'Account Name', 'Phone', 'Initial Balance', 'Status']],
      body: tableData,
      startY: 20
    });
    doc.save('Bank_List.pdf');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>Bank List</h1>
          </div>
          
          {/* Top Buttons */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/accounts/bank/add')}
              className="flex items-center gap-2 px-6 py-2.5 bg-[#ffc107] text-black rounded-md font-medium hover:bg-[#e0a800] transition-all"
            >
              <Plus className="w-4 h-4" />
              Add Bank
            </button>
            <button
              className="flex items-center gap-2 px-6 py-2.5 bg-[#6f42c1] text-white rounded-md font-medium hover:bg-[#5a32a3] transition-all"
            >
              <FolderPlus className="w-4 h-4" />
              Import Product
            </button>
          </div>
        </div>

        {/* Search and Actions Row */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Search */}
          <div className="relative flex-1 max-w-xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search List"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pl-10 pr-4 py-2.5 rounded-md border outline-none transition-all ${
                isDark ? 'bg-black/40 border-white/10 text-white focus:border-[#6f42c1]' : 'bg-white border-slate-200 text-slate-900 focus:border-[#6f42c1]'
              }`}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 relative">
            <button 
              onClick={() => setShowFilter(!showFilter)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-md border border-[#6f42c1] text-[#6f42c1] hover:bg-[#6f42c1]/10 transition-all ${isDark ? 'bg-black/40' : 'bg-white'}`}
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filter
            </button>
            
            <AnimatePresence>
              {showFilter && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className={`absolute top-full right-0 mt-2 w-64 p-4 rounded-xl border shadow-xl z-50 ${
                    isDark ? 'bg-[#1e1e2d] border-white/10' : 'bg-white border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className={`font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>Filter Options</h3>
                    <button onClick={() => setShowFilter(false)} className="text-slate-400 hover:text-slate-600">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className={`block text-xs font-medium mb-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Status</label>
                      <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className={`w-full px-3 py-2 rounded-lg border outline-none ${
                          isDark ? 'bg-black/40 border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                        }`}
                      >
                        <option value="All">All Statuses</option>
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                      </select>
                    </div>
                    
                    <button 
                      onClick={() => setShowFilter(false)}
                      className="w-full py-2 bg-[#6f42c1] text-white rounded-lg font-medium hover:bg-[#5a32a3] transition-colors"
                    >
                      Apply Filters
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <button 
              onClick={exportToPDF} 
              title="Export to PDF"
              className={`p-2.5 rounded-md border border-[#fd7e14] text-[#fd7e14] hover:bg-[#fd7e14]/10 transition-all ${isDark ? 'bg-black/40' : 'bg-white'}`}
            >
              <FileText className="w-4 h-4" />
            </button>
            <button 
              onClick={exportToExcel} 
              title="Export to Excel"
              className={`p-2.5 rounded-md border border-[#20c997] text-[#20c997] hover:bg-[#20c997]/10 transition-all ${isDark ? 'bg-black/40' : 'bg-white'}`}
            >
              <FileSpreadsheet className="w-4 h-4" />
            </button>
            <button 
              onClick={handlePrint} 
              title="Print"
              className={`p-2.5 rounded-md border border-[#6f42c1] text-[#6f42c1] hover:bg-[#6f42c1]/10 transition-all ${isDark ? 'bg-black/40' : 'bg-white'}`}
            >
              <Printer className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Table */}
        <div className={`rounded-md border ${isDark ? 'bg-black/40 border-white/5' : 'bg-white border-slate-200'}`}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className={`border-b ${isDark ? 'border-white/5' : 'border-slate-100'}`}>
                  <th className="px-4 py-4 text-left w-12">
                    <input type="checkbox" className="rounded border-slate-300" />
                  </th>
                  <th className="px-4 py-4 text-left text-sm font-medium text-slate-600">Bank Name</th>
                  <th className="px-4 py-4 text-left text-sm font-medium text-slate-600">Branch</th>
                  <th className="px-4 py-4 text-left text-sm font-medium text-slate-600">Account No</th>
                  <th className="px-4 py-4 text-left text-sm font-medium text-slate-600">Account Name</th>
                  <th className="px-4 py-4 text-left text-sm font-medium text-slate-600">Phone</th>
                  <th className="px-4 py-4 text-left text-sm font-medium text-slate-600">Initial Balance</th>
                  <th className="px-4 py-4 text-left text-sm font-medium text-slate-600">Status</th>
                  <th className="px-4 py-4 text-right text-sm font-medium text-slate-600">Action</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isDark ? 'divide-white/5' : 'divide-slate-100'}`}>
                {filteredBanks.map((bank) => (
                  <tr key={bank.id} className={`group transition-colors ${isDark ? 'hover:bg-white/5' : 'hover:bg-slate-50'}`}>
                    <td className="px-4 py-4">
                      <input type="checkbox" className="rounded border-slate-300" />
                    </td>
                    <td className={`px-4 py-4 text-sm ${isDark ? 'text-white' : 'text-slate-700'}`}>{bank.bankName}</td>
                    <td className={`px-4 py-4 text-sm ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>{bank.branch}</td>
                    <td className={`px-4 py-4 text-sm ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>{bank.accountNo}</td>
                    <td className={`px-4 py-4 text-sm ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>{bank.accountName}</td>
                    <td className={`px-4 py-4 text-sm ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>{bank.phone}</td>
                    <td className={`px-4 py-4 text-sm ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                      ${bank.initialBalance?.toLocaleString()}
                    </td>
                    <td className="px-4 py-4">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        bank.status === 'Active'
                          ? (isDark ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-emerald-50 text-emerald-600 border border-emerald-200')
                          : (isDark ? 'bg-slate-500/10 text-slate-400 border border-slate-500/20' : 'bg-slate-50 text-slate-600 border border-slate-200')
                      }`}>
                        {bank.status || 'Active'}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button className={`p-1.5 rounded transition-all ${isDark ? 'hover:bg-white/10 text-slate-400 hover:text-white' : 'hover:bg-slate-200 text-slate-600'}`}>
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(bank.id)}
                          className={`p-1.5 rounded transition-all ${isDark ? 'hover:bg-red-500/10 text-red-400' : 'hover:bg-red-50 text-red-600'}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredBanks.length === 0 && (
                  <tr>
                    <td colSpan={9} className="px-4 py-12 text-center text-sm text-slate-500">
                      No bank accounts found matching your criteria
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
