import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Receipt, Search, Download, Printer, Calendar, Trash2 } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import BackButton from '../../../components/BackButton';
import { useCompanyData } from '../../../context/CompanyDataContext';
import { useTheme } from '../../../context/ThemeContext';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

export default function PaymentList() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const navigate = useNavigate();
  const { type } = useParams<{ type: string }>(); // 'voucher' or 'invoice'
  const { accountPayments, deleteEntity } = useCompanyData();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredPayments = accountPayments.filter(p => 
    p.type.toLowerCase() === (type === 'voucher' ? 'voucher' : 'invoice') &&
    (p.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
     p.reference?.toLowerCase().includes(searchTerm.toLowerCase()) ||
     p.description?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

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
      'Category': p.category,
      'Amount': p.amount,
      'Method': p.paymentMethod,
      'Reference': p.reference,
      'Status': p.status
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
      p.category,
      p.amount.toString(),
      p.paymentMethod,
      p.reference || '-',
      p.status
    ]);
    (doc as any).autoTable({
      head: [['Date', 'Category', 'Amount', 'Method', 'Reference', 'Status']],
      body: tableData,
      startY: 20
    });
    doc.save(`${type}_Payments.pdf`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <BackButton />
          <div className={`p-3 rounded-2xl ${isDark ? 'bg-indigo-500/20 text-indigo-400' : 'bg-indigo-100 text-indigo-600'}`}>
            <Receipt className="w-6 h-6" />
          </div>
          <div>
            <h1 className={`text-2xl font-black uppercase tracking-tighter ${isDark ? 'text-white' : 'text-slate-800'}`}>
              {type === 'voucher' ? 'Voucher' : 'Invoice'} Payments
            </h1>
            <p className="text-slate-500 text-xs font-black uppercase tracking-widest">Manage your {type} payment records</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={exportToExcel}
            className={`p-2.5 rounded-xl transition-all ${isDark ? 'bg-white/5 text-slate-400 hover:text-white' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}`}
            title="Export to Excel"
          >
            <Download className="w-4 h-4" />
          </button>
          <button
            onClick={exportToPDF}
            className={`p-2.5 rounded-xl transition-all ${isDark ? 'bg-white/5 text-slate-400 hover:text-white' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}`}
            title="Export to PDF"
          >
            <Printer className="w-4 h-4" />
          </button>
          <button
            onClick={() => navigate(`/accounts/payment/create/${type}`)}
            className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/20"
          >
            Record Payment
          </button>
        </div>
      </div>

      <div className={`p-6 rounded-3xl border ${isDark ? 'bg-black/40 border-white/5 backdrop-blur-xl' : 'bg-white border-slate-200 shadow-sm'}`}>
        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="SEARCH PAYMENTS BY CATEGORY, REFERENCE OR DESCRIPTION..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full pl-12 pr-4 py-3.5 rounded-2xl border outline-none transition-all text-[10px] font-black tracking-widest uppercase ${
              isDark ? 'bg-white/5 border-white/10 text-white focus:border-indigo-500' : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-indigo-500'
            }`}
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className={`border-b ${isDark ? 'border-white/5' : 'border-slate-100'}`}>
                <th className="px-4 py-4 text-left text-[10px] font-black text-slate-500 uppercase tracking-widest">Date</th>
                <th className="px-4 py-4 text-left text-[10px] font-black text-slate-500 uppercase tracking-widest">Category</th>
                <th className="px-4 py-4 text-left text-[10px] font-black text-slate-500 uppercase tracking-widest">Amount</th>
                <th className="px-4 py-4 text-left text-[10px] font-black text-slate-500 uppercase tracking-widest">Method</th>
                <th className="px-4 py-4 text-left text-[10px] font-black text-slate-500 uppercase tracking-widest">Reference</th>
                <th className="px-4 py-4 text-right text-[10px] font-black text-slate-500 uppercase tracking-widest">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredPayments.map((p) => (
                <tr key={p.id} className={`group transition-colors ${isDark ? 'hover:bg-white/5' : 'hover:bg-slate-50'}`}>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-slate-500" />
                      <span className={`text-xs font-bold ${isDark ? 'text-white' : 'text-slate-700'}`}>{p.date}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-xs font-medium text-slate-500">{p.category}</td>
                  <td className="px-4 py-4">
                    <span className={`text-xs font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      ${p.amount?.toLocaleString()}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-xs font-medium text-slate-500">{p.paymentMethod}</td>
                  <td className="px-4 py-4 text-xs font-medium text-slate-500">{p.reference || '-'}</td>
                  <td className="px-4 py-4 text-right">
                    <button 
                      onClick={() => handleDelete(p.id)}
                      className={`p-2 rounded-lg transition-all opacity-0 group-hover:opacity-100 ${isDark ? 'hover:bg-red-500/10 text-red-400' : 'hover:bg-red-50 text-red-600'}`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredPayments.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center">
                    <div className="flex flex-col items-center gap-3 opacity-20">
                      <Receipt className="w-12 h-12" />
                      <p className="text-xs font-black uppercase tracking-widest">No payment records found</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
