import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Receipt, Search, Download, Printer, Trash2, Plus, Upload, Filter, FileText, FileSpreadsheet, Edit2 } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import AdminLayout from '../../../components/AdminLayout';
import { useCompanyData } from '../../../context/CompanyDataContext';
import { useTheme } from '../../../context/ThemeContext';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function PaymentList() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const navigate = useNavigate();
  const { type } = useParams<{ type: string }>(); // 'voucher' or 'invoice'
  const { accountPayments, deleteEntity, bankAccounts } = useCompanyData();
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilter, setShowFilter] = useState(false);
  const [filterGroup, setFilterGroup] = useState('All');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getBankName = (id: string) => {
    const bank = bankAccounts.find(b => b.id === id);
    return bank ? bank.bankName : id;
  };

  const filteredPayments = accountPayments.filter(p => {
    const matchesType = p.type?.toLowerCase() === (type === 'voucher' ? 'voucher' : 'invoice');
    const matchesSearch = 
      (p.reference?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (p.group?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (p.voucherNumber?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    const matchesGroup = filterGroup === 'All' || p.group === filterGroup;
    
    return matchesType && matchesSearch && matchesGroup;
  });

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this payment record?')) {
      try {
        await deleteEntity('accountPayments', id);
      } catch (error) {
        console.error('Error deleting payment:', error);
      }
    }
  };

  const exportToExcel = () => {
    const data = filteredPayments.map(p => ({
      'Date': p.date,
      'Name': p.reference || '-',
      'Group Name': p.group || '-',
      'Voucher': p.voucherNumber || '-',
      'Account': getBankName(p.accountId),
      'Payment Type': p.paymentType || '-',
      'Amount': p.amount || 0
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Payments');
    XLSX.writeFile(wb, `${type}_Payments.xlsx`);
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.text(`${type?.toUpperCase()} Payment List`, 14, 15);
    const tableData = filteredPayments.map(p => [
      p.date,
      p.reference || '-',
      p.group || '-',
      p.voucherNumber || '-',
      getBankName(p.accountId),
      p.paymentType || '-',
      p.amount?.toString() || '0'
    ]);
    autoTable(doc, {
      head: [['Date', 'Name', 'Group Name', 'Voucher', 'Account', 'Payment Type', 'Amount']],
      body: tableData,
      startY: 20
    });
    doc.save(`${type}_Payments.pdf`);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Handle file import logic here
      console.log('Importing file:', file.name);
      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>
            Payment List
          </h1>
        </div>

        <div className={`p-6 rounded-md border ${isDark ? 'bg-black/40 border-white/5' : 'bg-white border-slate-200'}`}>
          <div className="mb-6">
            <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>
              {type === 'voucher' ? 'Voucher' : 'Invoice'}
            </h2>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate(`/accounts/payment/create/${type}`)}
                className="flex items-center gap-2 px-4 py-2 bg-[#ffc107] text-slate-900 rounded-md font-medium hover:bg-[#e0a800] transition-all"
              >
                <Plus className="w-4 h-4" />
                Create Payment
              </button>
              <button
                onClick={handleImportClick}
                className="flex items-center gap-2 px-4 py-2 bg-[#6f42c1] text-white rounded-md font-medium hover:bg-[#5a32a3] transition-all"
              >
                <Upload className="w-4 h-4" />
                Import List
              </button>
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept=".xlsx,.xls,.csv" 
                onChange={handleFileChange} 
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search List"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full pl-10 pr-4 py-2 rounded-md border outline-none transition-all ${
                  isDark ? 'bg-white/5 border-white/10 text-white focus:border-[#6f42c1]' : 'bg-white border-slate-200 text-slate-900 focus:border-[#6f42c1]'
                }`}
              />
            </div>
            
            <div className="flex items-center gap-2">
              <div className="relative">
                <button
                  onClick={() => setShowFilter(!showFilter)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-md border transition-all ${
                    isDark ? 'border-[#6f42c1] text-[#6f42c1] hover:bg-[#6f42c1]/10' : 'border-[#6f42c1] text-[#6f42c1] hover:bg-[#6f42c1]/10'
                  }`}
                >
                  <Filter className="w-4 h-4" />
                  <span>Filter</span>
                </button>
                
                <AnimatePresence>
                  {showFilter && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className={`absolute right-0 mt-2 w-48 rounded-md border shadow-lg z-10 ${
                        isDark ? 'bg-slate-800 border-white/10' : 'bg-white border-slate-200'
                      }`}
                    >
                      <div className="p-2">
                        <div className={`text-xs font-semibold mb-2 px-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Filter by Group</div>
                        {['All', 'Supplier', 'Customer'].map(group => (
                          <button
                            key={group}
                            onClick={() => {
                              setFilterGroup(group);
                              setShowFilter(false);
                            }}
                            className={`w-full text-left px-2 py-1.5 rounded text-sm ${
                              filterGroup === group 
                                ? (isDark ? 'bg-[#6f42c1]/20 text-[#6f42c1]' : 'bg-[#6f42c1]/10 text-[#6f42c1]') 
                                : (isDark ? 'text-slate-300 hover:bg-white/5' : 'text-slate-700 hover:bg-slate-50')
                            }`}
                          >
                            {group}
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              
              <button
                onClick={exportToPDF}
                className={`p-2 rounded-md border transition-all ${
                  isDark ? 'border-[#fd7e14] text-[#fd7e14] hover:bg-[#fd7e14]/10' : 'border-[#fd7e14] text-[#fd7e14] hover:bg-[#fd7e14]/10'
                }`}
                title="Export to PDF"
              >
                <FileText className="w-4 h-4" />
              </button>
              <button
                onClick={exportToExcel}
                className={`p-2 rounded-md border transition-all ${
                  isDark ? 'border-[#28a745] text-[#28a745] hover:bg-[#28a745]/10' : 'border-[#28a745] text-[#28a745] hover:bg-[#28a745]/10'
                }`}
                title="Export to Excel"
              >
                <FileSpreadsheet className="w-4 h-4" />
              </button>
              <button
                onClick={handlePrint}
                className={`p-2 rounded-md border transition-all ${
                  isDark ? 'border-[#007bff] text-[#007bff] hover:bg-[#007bff]/10' : 'border-[#007bff] text-[#007bff] hover:bg-[#007bff]/10'
                }`}
                title="Print"
              >
                <Printer className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className={`border-b ${isDark ? 'border-white/5' : 'border-slate-200'}`}>
                  <th className="px-4 py-3 text-left">
                    <input type="checkbox" className="rounded border-slate-300" />
                  </th>
                  <th className={`px-4 py-3 text-left text-sm font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Date</th>
                  <th className={`px-4 py-3 text-left text-sm font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Name</th>
                  <th className={`px-4 py-3 text-left text-sm font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Group Name</th>
                  <th className={`px-4 py-3 text-left text-sm font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    {type === 'voucher' ? 'Voucher' : 'Invoice'}
                  </th>
                  <th className={`px-4 py-3 text-left text-sm font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Account</th>
                  <th className={`px-4 py-3 text-left text-sm font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Payment Type</th>
                  <th className={`px-4 py-3 text-left text-sm font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Amount</th>
                  <th className={`px-4 py-3 text-right text-sm font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                {filteredPayments.map((p) => (
                  <tr key={p.id} className={`transition-colors ${isDark ? 'hover:bg-white/5' : 'hover:bg-slate-50'}`}>
                    <td className="px-4 py-3">
                      <input type="checkbox" className="rounded border-slate-300" />
                    </td>
                    <td className={`px-4 py-3 text-sm ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>{p.date}</td>
                    <td className={`px-4 py-3 text-sm ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>{p.reference || '-'}</td>
                    <td className={`px-4 py-3 text-sm ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>{p.group || '-'}</td>
                    <td className={`px-4 py-3 text-sm ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>{p.voucherNumber || '-'}</td>
                    <td className={`px-4 py-3 text-sm ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>{getBankName(p.accountId)}</td>
                    <td className={`px-4 py-3 text-sm ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>{p.paymentType || '-'}</td>
                    <td className={`px-4 py-3 text-sm ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                      ${p.amount?.toLocaleString() || '0'}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button className={`p-1.5 rounded-md transition-all ${isDark ? 'hover:bg-white/10 text-slate-400 hover:text-white' : 'hover:bg-slate-200 text-slate-600'}`}>
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(p.id)}
                          className={`p-1.5 rounded-md transition-all ${isDark ? 'hover:bg-red-500/10 text-red-400' : 'hover:bg-red-50 text-red-600'}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredPayments.length === 0 && (
                  <tr>
                    <td colSpan={9} className="px-4 py-8 text-center text-sm text-slate-500">
                      No payment records found
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
