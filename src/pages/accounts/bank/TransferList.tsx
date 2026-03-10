import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowRightLeft, Search, Download, Printer, Calendar, Landmark } from 'lucide-react';
import { useCompanyData } from '../../../context/CompanyDataContext';
import { useTheme } from '../../../context/ThemeContext';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

export default function TransferList() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const { bankTransfers, bankAccounts } = useCompanyData();
  const [searchTerm, setSearchTerm] = useState('');

  const getBankName = (id: string) => {
    const bank = bankAccounts.find(b => b.id === id);
    return bank ? `${bank.bankName} (${bank.accountNumber})` : 'Unknown Bank';
  };

  const filteredTransfers = bankTransfers.filter(transfer => 
    getBankName(transfer.fromAccountId).toLowerCase().includes(searchTerm.toLowerCase()) ||
    getBankName(transfer.toAccountId).toLowerCase().includes(searchTerm.toLowerCase()) ||
    transfer.reference?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const exportToExcel = () => {
    const data = filteredTransfers.map(t => ({
      'Date': t.date,
      'From Account': getBankName(t.fromAccountId),
      'To Account': getBankName(t.toAccountId),
      'Amount': t.amount,
      'Reference': t.reference,
      'Description': t.description
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Transfers');
    XLSX.writeFile(wb, 'Bank_Transfers.xlsx');
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.text('Bank Transfer History', 14, 15);
    const tableData = filteredTransfers.map(t => [
      t.date,
      getBankName(t.fromAccountId),
      getBankName(t.toAccountId),
      t.amount.toString(),
      t.reference || '-'
    ]);
    (doc as any).autoTable({
      head: [['Date', 'From Account', 'To Account', 'Amount', 'Reference']],
      body: tableData,
      startY: 20
    });
    doc.save('Bank_Transfers.pdf');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className={`p-3 rounded-2xl ${isDark ? 'bg-indigo-500/20 text-indigo-400' : 'bg-indigo-100 text-indigo-600'}`}>
            <ArrowRightLeft className="w-6 h-6" />
          </div>
          <div>
            <h1 className={`text-2xl font-black uppercase tracking-tighter ${isDark ? 'text-white' : 'text-slate-800'}`}>Transfer History</h1>
            <p className="text-slate-500 text-xs font-black uppercase tracking-widest">View all inter-bank fund transfers</p>
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
        </div>
      </div>

      <div className={`p-6 rounded-3xl border ${isDark ? 'bg-black/40 border-white/5 backdrop-blur-xl' : 'bg-white border-slate-200 shadow-sm'}`}>
        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="SEARCH TRANSFERS BY BANK OR REFERENCE..."
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
                <th className="px-4 py-4 text-left text-[10px] font-black text-slate-500 uppercase tracking-widest">From Account</th>
                <th className="px-4 py-4 text-left text-[10px] font-black text-slate-500 uppercase tracking-widest">To Account</th>
                <th className="px-4 py-4 text-left text-[10px] font-black text-slate-500 uppercase tracking-widest">Amount</th>
                <th className="px-4 py-4 text-left text-[10px] font-black text-slate-500 uppercase tracking-widest">Reference</th>
                <th className="px-4 py-4 text-right text-[10px] font-black text-slate-500 uppercase tracking-widest">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredTransfers.map((t) => (
                <tr key={t.id} className={`group transition-colors ${isDark ? 'hover:bg-white/5' : 'hover:bg-slate-50'}`}>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-slate-500" />
                      <span className={`text-xs font-bold ${isDark ? 'text-white' : 'text-slate-700'}`}>{t.date}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <Landmark className="w-3.5 h-3.5 text-red-400" />
                      <span className="text-xs font-medium text-slate-500">{getBankName(t.fromAccountId)}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <Landmark className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-xs font-medium text-slate-500">{getBankName(t.toAccountId)}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <span className={`text-xs font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      ${t.amount?.toLocaleString()}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-xs font-medium text-slate-500">{t.reference || '-'}</td>
                  <td className="px-4 py-4 text-right">
                    <span className={`px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${
                      isDark ? 'bg-emerald-500/10 text-emerald-400' : 'bg-emerald-100 text-emerald-700'
                    }`}>
                      Completed
                    </span>
                  </td>
                </tr>
              ))}
              {filteredTransfers.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center">
                    <div className="flex flex-col items-center gap-3 opacity-20">
                      <ArrowRightLeft className="w-12 h-12" />
                      <p className="text-xs font-black uppercase tracking-widest">No transfer records found</p>
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
