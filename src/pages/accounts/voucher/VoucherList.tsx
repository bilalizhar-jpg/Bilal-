import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { FileText, Search, Download, Printer, Calendar, Trash2, Eye, Plus, Upload, Filter, FileSpreadsheet } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCompanyData } from '../../../context/CompanyDataContext';
import { useTheme } from '../../../context/ThemeContext';
import AdminLayout from '../../../components/AdminLayout';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

export default function VoucherList() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const navigate = useNavigate();
  const { type } = useParams<{ type: string }>(); // 'debit', 'credit', 'journal'
  const { vouchers, deleteEntity } = useCompanyData();
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const filteredVouchers = vouchers.filter(v => 
    v.voucherType?.toLowerCase() === type?.toLowerCase() &&
    (v.voucherNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
     v.particular?.toLowerCase().includes(searchTerm.toLowerCase()) ||
     v.description?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this voucher?')) {
      try {
        await deleteEntity('vouchers', id);
      } catch (error) {
        console.error('Error deleting voucher:', error);
      }
    }
  };

  const calculateTotalAmount = (v: any) => {
    if (v.rows && Array.isArray(v.rows)) {
      return v.rows.reduce((sum: number, row: any) => sum + (Number(row.amount) || 0), 0);
    }
    return v.amount || 0;
  };

  const getAccountNames = (v: any) => {
    if (v.rows && Array.isArray(v.rows) && v.rows.length > 0) {
      return v.rows.map((r: any) => r.accountName).join(', ');
    }
    return '-';
  };

  const exportToExcel = () => {
    const data = filteredVouchers.map(v => ({
      'Date': v.date || '-',
      'Account Name': getAccountNames(v),
      'Particular': v.particular || v.description || '-',
      'Payment Gateway': v.paymentGateway || '-',
      'Warehouse': v.warehouse || '-',
      'Mode': v.paymentMode || '-',
      'Cheque No': v.chequeNumber || '-',
      'Amount': calculateTotalAmount(v)
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Vouchers');
    XLSX.writeFile(wb, `${type}_Vouchers.xlsx`);
  };

  const exportToPDF = () => {
    const doc = new jsPDF('landscape');
    doc.text(`${type?.toUpperCase()} Voucher List`, 14, 15);
    const tableData = filteredVouchers.map(v => [
      v.date || '-',
      getAccountNames(v),
      v.particular || v.description || '-',
      v.paymentGateway || '-',
      v.warehouse || '-',
      v.paymentMode || '-',
      v.chequeNumber || '-',
      calculateTotalAmount(v).toString()
    ]);
    (doc as any).autoTable({
      head: [['Date', 'Account Name', 'Particular', 'Payment Gateway', 'Warehouse', 'Mode', 'Cheque No', 'Amount']],
      body: tableData,
      startY: 20
    });
    doc.save(`${type}_Vouchers.pdf`);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>
              {type?.charAt(0).toUpperCase() + type?.slice(1)} Voucher List
            </h1>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-4">
          <button
            onClick={() => navigate(`/accounts/voucher/${type}/create`)}
            className="flex items-center gap-2 px-4 py-2 bg-[#ffc107] text-black rounded-md font-medium hover:bg-[#e0a800] transition-colors"
          >
            <Plus className="w-4 h-4" />
            Create Voucher
          </button>
          <button
            className="flex items-center gap-2 px-4 py-2 bg-[#6f42c1] text-white rounded-md font-medium hover:bg-[#5a32a3] transition-colors"
          >
            <Upload className="w-4 h-4" />
            Import Voucher
          </button>
        </div>

        <div className={`p-6 rounded-md border ${isDark ? 'bg-black/40 border-white/5' : 'bg-white border-slate-200'}`}>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search List"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full pl-10 pr-4 py-2 rounded-md border outline-none transition-all ${
                  isDark ? 'bg-white/5 border-white/10 text-white focus:border-[#6f42c1]' : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-[#6f42c1]'
                }`}
              />
            </div>

            <div className="flex items-center gap-2">
              <div className="relative">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-md border transition-all ${
                    isDark ? 'border-[#6f42c1] text-[#6f42c1] hover:bg-[#6f42c1]/10' : 'border-[#6f42c1] text-[#6f42c1] hover:bg-[#6f42c1]/10'
                  }`}
                >
                  <Filter className="w-4 h-4" />
                  <span className="text-sm font-medium">Filter</span>
                </button>

                <AnimatePresence>
                  {showFilters && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className={`absolute right-0 mt-2 w-64 rounded-lg border shadow-xl z-50 ${
                        isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
                      }`}
                    >
                      <div className="p-4">
                        <div className={`text-sm font-semibold mb-3 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Filter Options</div>
                        <div className="space-y-3">
                          <div>
                            <label className={`block text-xs mb-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Date Range</label>
                            <input type="date" className={`w-full px-2 py-1.5 text-sm rounded border ${isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300'}`} />
                          </div>
                          <button className="w-full py-2 bg-[#6f42c1] text-white text-sm rounded hover:bg-[#5a32a3] transition-colors">
                            Apply Filters
                          </button>
                        </div>
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
                <tr className={`border-b ${isDark ? 'border-white/5' : 'border-slate-100'}`}>
                  <th className="px-4 py-3 text-left">
                    <input type="checkbox" className="rounded border-slate-300 text-[#6f42c1] focus:ring-[#6f42c1]" />
                  </th>
                  <th className={`px-4 py-3 text-left text-sm font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Date</th>
                  <th className={`px-4 py-3 text-left text-sm font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Account Name</th>
                  <th className={`px-4 py-3 text-left text-sm font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Particular</th>
                  <th className={`px-4 py-3 text-left text-sm font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Payment Gateway</th>
                  <th className={`px-4 py-3 text-left text-sm font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Warehouse</th>
                  <th className={`px-4 py-3 text-left text-sm font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Mode</th>
                  <th className={`px-4 py-3 text-left text-sm font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Cheque No</th>
                  <th className={`px-4 py-3 text-left text-sm font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Amount</th>
                  <th className={`px-4 py-3 text-right text-sm font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredVouchers.map((v) => (
                  <tr key={v.id} className={`group transition-colors ${isDark ? 'hover:bg-white/5' : 'hover:bg-slate-50'}`}>
                    <td className="px-4 py-3">
                      <input type="checkbox" className="rounded border-slate-300 text-[#6f42c1] focus:ring-[#6f42c1]" />
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>{v.date || '-'}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>{getAccountNames(v)}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>{v.particular || v.description || '-'}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>{v.paymentGateway || '-'}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>{v.warehouse || '-'}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>{v.paymentMode || '-'}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>{v.chequeNumber || '-'}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-sm font-medium ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>
                        ${calculateTotalAmount(v).toLocaleString()}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className={`p-1.5 rounded-md transition-all ${isDark ? 'hover:bg-white/10 text-slate-400 hover:text-white' : 'hover:bg-slate-200 text-slate-600'}`}>
                          <Eye className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(v.id)}
                          className={`p-1.5 rounded-md transition-all ${isDark ? 'hover:bg-red-500/10 text-red-400' : 'hover:bg-red-50 text-red-600'}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredVouchers.length === 0 && (
                  <tr>
                    <td colSpan={10} className="px-4 py-12 text-center">
                      <div className="flex flex-col items-center gap-3 opacity-50">
                        <FileText className="w-12 h-12" />
                        <p className="text-sm font-medium">No vouchers found</p>
                      </div>
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

