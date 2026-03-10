import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Landmark, Search, Plus, Trash2, Edit2, Download, Printer } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCompanyData } from '../../../context/CompanyDataContext';
import { useTheme } from '../../../context/ThemeContext';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

export default function BankList() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const navigate = useNavigate();
  const { bankAccounts, deleteEntity } = useCompanyData();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredBanks = bankAccounts.filter(bank => 
    bank.bankName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    bank.accountNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    bank.accountTitle.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
      'Account Title': bank.accountTitle,
      'Account Number': bank.accountNumber,
      'Branch Code': bank.branchCode,
      'Balance': bank.currentBalance,
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
      bank.bankName,
      bank.accountTitle,
      bank.accountNumber,
      bank.branchCode,
      bank.currentBalance.toString(),
      bank.status
    ]);
    (doc as any).autoTable({
      head: [['Bank Name', 'Account Title', 'Account Number', 'Branch Code', 'Balance', 'Status']],
      body: tableData,
      startY: 20
    });
    doc.save('Bank_List.pdf');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className={`p-3 rounded-2xl ${isDark ? 'bg-indigo-500/20 text-indigo-400' : 'bg-indigo-100 text-indigo-600'}`}>
            <Landmark className="w-6 h-6" />
          </div>
          <div>
            <h1 className={`text-2xl font-black uppercase tracking-tighter ${isDark ? 'text-white' : 'text-slate-800'}`}>Bank List</h1>
            <p className="text-slate-500 text-xs font-black uppercase tracking-widest">Manage your registered bank accounts</p>
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
            onClick={() => navigate('/accounts/bank/add')}
            className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/20"
          >
            <Plus className="w-4 h-4" />
            Add Bank
          </button>
        </div>
      </div>

      <div className={`p-6 rounded-3xl border ${isDark ? 'bg-black/40 border-white/5 backdrop-blur-xl' : 'bg-white border-slate-200 shadow-sm'}`}>
        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="SEARCH BANKS BY NAME, ACCOUNT OR TITLE..."
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
                <th className="px-4 py-4 text-left text-[10px] font-black text-slate-500 uppercase tracking-widest">Bank Name</th>
                <th className="px-4 py-4 text-left text-[10px] font-black text-slate-500 uppercase tracking-widest">Account Title</th>
                <th className="px-4 py-4 text-left text-[10px] font-black text-slate-500 uppercase tracking-widest">Account Number</th>
                <th className="px-4 py-4 text-left text-[10px] font-black text-slate-500 uppercase tracking-widest">Balance</th>
                <th className="px-4 py-4 text-left text-[10px] font-black text-slate-500 uppercase tracking-widest">Status</th>
                <th className="px-4 py-4 text-right text-[10px] font-black text-slate-500 uppercase tracking-widest">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredBanks.map((bank) => (
                <tr key={bank.id} className={`group transition-colors ${isDark ? 'hover:bg-white/5' : 'hover:bg-slate-50'}`}>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isDark ? 'bg-indigo-500/10 text-indigo-400' : 'bg-indigo-50 text-indigo-600'}`}>
                        <Landmark className="w-4 h-4" />
                      </div>
                      <span className={`text-xs font-bold ${isDark ? 'text-white' : 'text-slate-700'}`}>{bank.bankName}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-xs font-medium text-slate-500">{bank.accountTitle}</td>
                  <td className="px-4 py-4 text-xs font-mono text-slate-500">{bank.accountNumber}</td>
                  <td className="px-4 py-4">
                    <span className={`text-xs font-black ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>
                      ${bank.currentBalance?.toLocaleString()}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <span className={`px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${
                      bank.status === 'Active' 
                        ? (isDark ? 'bg-emerald-500/10 text-emerald-400' : 'bg-emerald-100 text-emerald-700')
                        : (isDark ? 'bg-red-500/10 text-red-400' : 'bg-red-100 text-red-700')
                    }`}>
                      {bank.status}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className={`p-2 rounded-lg transition-all ${isDark ? 'hover:bg-white/10 text-slate-400 hover:text-white' : 'hover:bg-slate-200 text-slate-600'}`}>
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button 
                        onClick={() => handleDelete(bank.id)}
                        className={`p-2 rounded-lg transition-all ${isDark ? 'hover:bg-red-500/10 text-red-400' : 'hover:bg-red-50 text-red-600'}`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredBanks.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center">
                    <div className="flex flex-col items-center gap-3 opacity-20">
                      <Landmark className="w-12 h-12" />
                      <p className="text-xs font-black uppercase tracking-widest">No bank accounts found</p>
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
