import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Search, Plus, FolderPlus, SlidersHorizontal, FileText, Edit2, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCompanyData } from '../../../context/CompanyDataContext';
import { useTheme } from '../../../context/ThemeContext';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

export default function TransferList() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const navigate = useNavigate();
  const { bankTransfers, bankAccounts, deleteEntity, updateEntity } = useCompanyData();
  const [searchTerm, setSearchTerm] = useState('');

  const getBankName = (id: string) => {
    const bank = bankAccounts.find(b => b.id === id);
    return bank ? `${bank.bankName} (${bank.accountNumber || bank.accountNo})` : 'Unknown Bank';
  };

  const filteredTransfers = bankTransfers.filter(transfer => 
    getBankName(transfer.fromAccountId).toLowerCase().includes(searchTerm.toLowerCase()) ||
    getBankName(transfer.toAccountId).toLowerCase().includes(searchTerm.toLowerCase()) ||
    transfer.reference?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    transfer.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = async (transfer: any) => {
    if (window.confirm('Are you sure you want to delete this transfer?')) {
      try {
        // Revert balances
        const fromAccount = bankAccounts.find(a => a.id === transfer.fromAccountId);
        if (fromAccount) {
          await updateEntity('bankAccounts', fromAccount.id, {
            initialBalance: (fromAccount.initialBalance || 0) + transfer.amount
          });
        }

        const toAccount = bankAccounts.find(a => a.id === transfer.toAccountId);
        if (toAccount) {
          await updateEntity('bankAccounts', toAccount.id, {
            initialBalance: (toAccount.initialBalance || 0) - transfer.amount
          });
        }

        await deleteEntity('bankTransfers', transfer.id);
      } catch (error) {
        console.error('Error deleting transfer:', error);
      }
    }
  };

  const exportToExcel = () => {
    const data = filteredTransfers.map(t => ({
      'Reference Number': t.reference || t.id.slice(0, 8),
      'From Account': getBankName(t.fromAccountId),
      'To Account': getBankName(t.toAccountId),
      'Initial Balance': t.amount
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Transfers');
    XLSX.writeFile(wb, 'Transfer_List.xlsx');
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.text('Transfer List', 14, 15);
    const tableData = filteredTransfers.map(t => [
      t.reference || t.id.slice(0, 8),
      getBankName(t.fromAccountId),
      getBankName(t.toAccountId),
      (t.amount || 0).toString()
    ]);
    (doc as any).autoTable({
      head: [['Reference Number', 'From Account', 'To Account', 'Initial Balance']],
      body: tableData,
      startY: 20
    });
    doc.save('Transfer_List.pdf');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>Transfer List</h1>
      </div>

      {/* Top Buttons */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/accounts/bank/transfer/new')}
          className="flex items-center gap-2 px-6 py-2.5 bg-[#ffc107] text-black rounded-md font-medium hover:bg-[#e0a800] transition-all"
        >
          <Plus className="w-4 h-4" />
          Create Transfer
        </button>
        <button
          className="flex items-center gap-2 px-6 py-2.5 bg-[#6f42c1] text-white rounded-md font-medium hover:bg-[#5a32a3] transition-all"
        >
          <FolderPlus className="w-4 h-4" />
          Import Transfer
        </button>
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
            className={`w-full pl-11 pr-4 py-2.5 rounded-md border outline-none transition-all ${
              isDark 
                ? 'bg-white/5 border-white/10 text-white focus:border-[#6f42c1]' 
                : 'bg-white border-slate-200 text-slate-900 focus:border-[#6f42c1]'
            }`}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button className={`flex items-center gap-2 px-4 py-2.5 rounded-md border transition-all ${
            isDark ? 'border-[#6f42c1]/50 text-[#6f42c1] hover:bg-[#6f42c1]/10' : 'border-[#6f42c1] text-[#6f42c1] hover:bg-[#6f42c1]/5'
          }`}>
            <SlidersHorizontal className="w-4 h-4" />
            Filter
          </button>
          <button 
            onClick={exportToPDF}
            className={`flex items-center justify-center w-11 h-11 rounded-md border transition-all ${
              isDark ? 'border-orange-500/50 text-orange-500 hover:bg-orange-500/10' : 'border-orange-400 text-orange-500 hover:bg-orange-50'
            }`}
            title="Export to PDF"
          >
            <FileText className="w-4 h-4" />
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
                  <input type="checkbox" className={`rounded ${isDark ? 'bg-white/5 border-white/10' : 'border-slate-300'}`} />
                </th>
                <th className={`px-4 py-4 text-left text-sm font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Reference Number</th>
                <th className={`px-4 py-4 text-left text-sm font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>From Account</th>
                <th className={`px-4 py-4 text-left text-sm font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>To Account</th>
                <th className={`px-4 py-4 text-left text-sm font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Initial Balance</th>
                <th className={`px-4 py-4 text-right text-sm font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Action</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${isDark ? 'divide-white/5' : 'divide-slate-100'}`}>
              {filteredTransfers.map((t) => (
                <tr key={t.id} className={`group transition-colors ${isDark ? 'hover:bg-white/5' : 'hover:bg-slate-50'}`}>
                  <td className="px-4 py-4">
                    <input type="checkbox" className={`rounded ${isDark ? 'bg-white/5 border-white/10' : 'border-slate-300'}`} />
                  </td>
                  <td className={`px-4 py-4 text-sm ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                    {t.reference || t.id.slice(0, 8)}
                  </td>
                  <td className={`px-4 py-4 text-sm ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                    {getBankName(t.fromAccountId)}
                  </td>
                  <td className={`px-4 py-4 text-sm ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                    {getBankName(t.toAccountId)}
                  </td>
                  <td className={`px-4 py-4 text-sm ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                    {t.amount?.toLocaleString()}
                  </td>
                  <td className="px-4 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => navigate(`/accounts/bank/transfer/${t.id}/edit`)}
                        className={`p-1.5 rounded-md transition-colors ${isDark ? 'text-slate-400 hover:bg-white/10 hover:text-white' : 'text-slate-400 hover:bg-slate-100 hover:text-slate-700'}`}
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(t)}
                        className={`p-1.5 rounded-md transition-colors ${isDark ? 'text-slate-400 hover:bg-red-500/10 hover:text-red-400' : 'text-slate-400 hover:bg-red-50 hover:text-red-600'}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredTransfers.length === 0 && (
                <tr>
                  <td colSpan={6} className={`px-4 py-8 text-center text-sm ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>
                    No transfer records found
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
