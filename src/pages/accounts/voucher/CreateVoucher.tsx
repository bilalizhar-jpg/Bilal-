import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate, useParams } from 'react-router-dom';
import { Plus, Filter, FileText, FileSpreadsheet, Printer } from 'lucide-react';
import { useCompanyData } from '../../../context/CompanyDataContext';
import { useTheme } from '../../../context/ThemeContext';
import AdminLayout from '../../../components/AdminLayout';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface VoucherRow {
  id: string;
  accountName: string;
  amount: string;
}

export default function CreateVoucher() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const navigate = useNavigate();
  const { type } = useParams<{ type: string }>(); // 'debit', 'credit', 'journal'
  const { addEntity } = useCompanyData();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    date: '',
    warehouse: '',
    paymentGateway: '',
    paymentMode: '',
    chequeNumber: '',
    reference: '',
    particular: ''
  });

  const [rows, setRows] = useState<VoucherRow[]>([
    { id: '1', accountName: '', amount: '' }
  ]);

  const [showFilter, setShowFilter] = useState(false);

  const handleAddRow = () => {
    setRows([...rows, { id: Math.random().toString(36).substr(2, 9), accountName: '', amount: '' }]);
  };

  const handleClearRow = (id: string) => {
    if (rows.length > 1) {
      setRows(rows.filter(row => row.id !== id));
    } else {
      setRows([{ id: '1', accountName: '', amount: '' }]);
    }
  };

  const handleRowChange = (id: string, field: keyof VoucherRow, value: string) => {
    setRows(rows.map(row => row.id === id ? { ...row, [field]: value } : row));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await addEntity('vouchers', {
        ...formData,
        rows,
        voucherType: type?.charAt(0).toUpperCase() + type?.slice(1) || 'Debit',
        createdAt: new Date().toISOString()
      });
      navigate(`/accounts/voucher/${type}/list`);
    } catch (error) {
      console.error('Error creating voucher:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportToExcel = () => {
    const data = [{
      'Date': formData.date,
      'Warehouse': formData.warehouse,
      'Payment Gateway': formData.paymentGateway,
      'Payment Mode': formData.paymentMode,
      'Cheque Number': formData.chequeNumber,
      'Reference': formData.reference,
      'Particular': formData.particular,
      'Total Amount': rows.reduce((sum, row) => sum + (parseFloat(row.amount) || 0), 0)
    }];
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Voucher');
    XLSX.writeFile(wb, `Create_${type}_Voucher.xlsx`);
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.text(`Create ${type?.toUpperCase()} Voucher`, 14, 15);
    autoTable(doc, {
      head: [['Date', 'Warehouse', 'Gateway', 'Mode', 'Cheque', 'Reference', 'Amount']],
      body: [[
        formData.date,
        formData.warehouse,
        formData.paymentGateway,
        formData.paymentMode,
        formData.chequeNumber,
        formData.reference,
        rows.reduce((sum, row) => sum + (parseFloat(row.amount) || 0), 0).toString()
      ]],
      startY: 20
    });
    doc.save(`Create_${type}_Voucher.pdf`);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>
              Create {type?.charAt(0).toUpperCase() + type?.slice(1)} Voucher
            </h1>
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
                      <div className={`text-xs font-semibold mb-2 px-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Filter Options</div>
                      <div className={`px-2 py-1.5 text-sm ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                        No filters available for create page
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

        <div className={`p-6 rounded-md border ${isDark ? 'bg-black/40 border-white/5' : 'bg-white border-slate-200'}`}>
          <form onSubmit={handleSubmit} className="space-y-8">
            
            {/* Top Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className={`text-sm font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Date</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className={`w-full px-4 py-2.5 rounded-md border outline-none transition-all ${
                    isDark ? 'bg-white/5 border-white/10 text-white focus:border-[#6f42c1]' : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-[#6f42c1]'
                  }`}
                />
              </div>

              <div className="space-y-2">
                <label className={`text-sm font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Warehouse</label>
                <input
                  type="text"
                  value={formData.warehouse}
                  onChange={(e) => setFormData({ ...formData, warehouse: e.target.value })}
                  placeholder="Warehouse 1"
                  className={`w-full px-4 py-2.5 rounded-md border outline-none transition-all ${
                    isDark ? 'bg-white/5 border-white/10 text-white focus:border-[#6f42c1]' : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-[#6f42c1]'
                  }`}
                />
              </div>

              <div className="space-y-2">
                <label className={`text-sm font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Payment Gateway</label>
                <input
                  type="text"
                  value={formData.paymentGateway}
                  onChange={(e) => setFormData({ ...formData, paymentGateway: e.target.value })}
                  placeholder="Central Cashier Bank"
                  className={`w-full px-4 py-2.5 rounded-md border outline-none transition-all ${
                    isDark ? 'bg-white/5 border-white/10 text-white focus:border-[#6f42c1]' : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-[#6f42c1]'
                  }`}
                />
              </div>

              <div className="space-y-2">
                <label className={`text-sm font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Payment Mode</label>
                <input
                  type="text"
                  value={formData.paymentMode}
                  onChange={(e) => setFormData({ ...formData, paymentMode: e.target.value })}
                  placeholder="Cheque"
                  className={`w-full px-4 py-2.5 rounded-md border outline-none transition-all ${
                    isDark ? 'bg-white/5 border-white/10 text-white focus:border-[#6f42c1]' : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-[#6f42c1]'
                  }`}
                />
              </div>

              <div className="space-y-2">
                <label className={`text-sm font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Cheque Number</label>
                <input
                  type="text"
                  value={formData.chequeNumber}
                  onChange={(e) => setFormData({ ...formData, chequeNumber: e.target.value })}
                  placeholder="26546"
                  className={`w-full px-4 py-2.5 rounded-md border outline-none transition-all ${
                    isDark ? 'bg-white/5 border-white/10 text-white focus:border-[#6f42c1]' : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-[#6f42c1]'
                  }`}
                />
              </div>

              <div className="space-y-2">
                <label className={`text-sm font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Reference</label>
                <input
                  type="text"
                  value={formData.reference}
                  onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
                  placeholder="yt-526762"
                  className={`w-full px-4 py-2.5 rounded-md border outline-none transition-all ${
                    isDark ? 'bg-white/5 border-white/10 text-white focus:border-[#6f42c1]' : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-[#6f42c1]'
                  }`}
                />
              </div>
            </div>

            {/* Rows Section */}
            <div className="space-y-4">
              {rows.map((row, index) => (
                <div key={row.id} className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 rounded-md border border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/5">
                  <div className="space-y-2">
                    <label className={`text-sm font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Account Name</label>
                    <select
                      value={row.accountName}
                      onChange={(e) => handleRowChange(row.id, 'accountName', e.target.value)}
                      className={`w-full px-4 py-2.5 rounded-md border outline-none transition-all ${
                        isDark ? 'bg-white/5 border-white/10 text-white focus:border-[#6f42c1]' : 'bg-white border-slate-200 text-slate-900 focus:border-[#6f42c1]'
                      }`}
                    >
                      <option value="">John Bridge Builder</option>
                      <option value="Supplier A">Supplier A</option>
                      <option value="Customer B">Customer B</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className={`text-sm font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Amount</label>
                    <input
                      type="text"
                      value={row.amount}
                      onChange={(e) => handleRowChange(row.id, 'amount', e.target.value)}
                      placeholder="$56,74,655"
                      className={`w-full px-4 py-2.5 rounded-md border outline-none transition-all ${
                        isDark ? 'bg-white/5 border-white/10 text-white focus:border-[#6f42c1]' : 'bg-white border-slate-200 text-slate-900 focus:border-[#6f42c1]'
                      }`}
                    />
                  </div>
                  
                  <div className="col-span-1 md:col-span-2 flex gap-3">
                    <button
                      type="button"
                      onClick={handleAddRow}
                      className="px-4 py-1.5 bg-[#428bca] text-white text-sm rounded hover:bg-[#3071a9] transition-colors"
                    >
                      Add Row
                    </button>
                    <button
                      type="button"
                      onClick={() => handleClearRow(row.id)}
                      className="px-4 py-1.5 bg-[#d9534f] text-white text-sm rounded hover:bg-[#c9302c] transition-colors"
                    >
                      Clear Row
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Particular Section */}
            <div className="space-y-2">
              <label className={`text-sm font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Particular</label>
              <input
                type="text"
                value={formData.particular}
                onChange={(e) => setFormData({ ...formData, particular: e.target.value })}
                placeholder="Write a particular note......."
                className={`w-full px-4 py-2.5 rounded-md border outline-none transition-all ${
                  isDark ? 'bg-white/5 border-white/10 text-white focus:border-[#6f42c1]' : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-[#6f42c1]'
                }`}
              />
            </div>

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 bg-[#6f42c1] text-white rounded-md font-medium hover:bg-[#5a32a3] transition-colors disabled:opacity-50"
              >
                {loading ? 'Creating...' : 'Create Now'}
              </button>
            </div>

          </form>
        </div>
      </div>
    </AdminLayout>
  );
}
