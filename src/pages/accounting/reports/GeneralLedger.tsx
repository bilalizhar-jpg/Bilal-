import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  FileText, 
  Search, 
  Calendar, 
  Filter, 
  Download, 
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Info
} from 'lucide-react';
import AccountingLayout from '../../../components/accounting/AccountingLayout';
import { useTheme } from '../../../context/ThemeContext';
import { useAccounting } from '../../../context/AccountingContext';

export default function GeneralLedger() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const { accounts, journalEntries, journalLines, loading } = useAccounting();
  
  const [selectedAccountId, setSelectedAccountId] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  // Get all lines for the selected account
  const allAccountLines = useMemo(() => {
    if (!selectedAccountId) return [];
    
    const lines = journalLines.filter(l => l.accountId === selectedAccountId);
    const enrichedLines = lines.map(line => {
      const entry = journalEntries.find(e => e.id === line.journalEntryId);
      return {
        ...line,
        date: entry?.date || '',
        reference: entry?.reference || '',
        entryDescription: entry?.description || '',
      };
    });
    
    // Sort by date then by ID for stability
    return enrichedLines.sort((a, b) => {
      const dateDiff = new Date(a.date).getTime() - new Date(b.date).getTime();
      if (dateDiff !== 0) return dateDiff;
      return a.id.localeCompare(b.id);
    });
  }, [selectedAccountId, journalLines, journalEntries]);

  // Calculate Opening Balance and Filtered Lines
  const { filteredLines, openingBalance, totalDebit, totalCredit, closingBalance } = useMemo(() => {
    if (!selectedAccountId) return { filteredLines: [], openingBalance: 0, totalDebit: 0, totalCredit: 0, closingBalance: 0 };

    const account = accounts.find(a => a.id === selectedAccountId);
    const baseOpeningBalance = account?.openingBalance || 0;
    
    let currentOpeningBalance = baseOpeningBalance;
    const periodLines: any[] = [];
    let periodDebit = 0;
    let periodCredit = 0;

    allAccountLines.forEach(line => {
      const lineDate = new Date(line.date);
      const isBeforeStart = startDate ? lineDate < new Date(startDate) : false;
      const isAfterEnd = endDate ? lineDate > new Date(endDate) : false;
      const matchesSearch = searchTerm 
        ? line.description.toLowerCase().includes(searchTerm.toLowerCase()) || 
          line.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
          line.entryDescription.toLowerCase().includes(searchTerm.toLowerCase())
        : true;

      if (isBeforeStart) {
        // Add to opening balance
        currentOpeningBalance += (line.debit - line.credit);
      } else if (!isAfterEnd && matchesSearch) {
        periodLines.push(line);
        periodDebit += line.debit;
        periodCredit += line.credit;
      }
    });

    // Calculate running balance for the period lines
    let running = currentOpeningBalance;
    const linesWithBalance = periodLines.map(line => {
      running += (line.debit - line.credit);
      return { ...line, runningBalance: running };
    });

    return {
      filteredLines: linesWithBalance,
      openingBalance: currentOpeningBalance,
      totalDebit: periodDebit,
      totalCredit: periodCredit,
      closingBalance: running
    };
  }, [allAccountLines, selectedAccountId, accounts, startDate, endDate, searchTerm]);

  // Pagination
  const totalPages = Math.ceil(filteredLines.length / itemsPerPage);
  const paginatedLines = filteredLines.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency: 'USD',
      minimumFractionDigits: 2 
    }).format(amount || 0);
  };

  return (
    <AccountingLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className={`text-3xl font-black uppercase tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
              General Ledger
            </h1>
            <p className={`text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Detailed transaction history and running balances
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <button className={`p-2 rounded-xl border transition-all ${isDark ? 'bg-[#1E1E2F] border-white/10 text-white hover:bg-white/5' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
              <Download className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Filters Section */}
        <div className={`p-6 rounded-2xl border ${isDark ? 'bg-[#16161D] border-white/5' : 'bg-white border-slate-200 shadow-sm'}`}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="space-y-2">
              <label className={`text-[10px] font-black uppercase tracking-widest ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                Account
              </label>
              <select
                value={selectedAccountId}
                onChange={(e) => {
                  setSelectedAccountId(e.target.value);
                  setCurrentPage(1);
                }}
                className={`w-full px-4 py-2.5 rounded-xl text-sm transition-all outline-none border ${
                  isDark 
                    ? 'bg-[#0F0F12] border-white/10 text-white focus:border-indigo-500' 
                    : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-indigo-500'
                }`}
              >
                <option value="">Select an account...</option>
                {accounts.map(a => (
                  <option key={a.id} value={a.id}>{a.code} - {a.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className={`text-[10px] font-black uppercase tracking-widest ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                Date Range
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => {
                    setStartDate(e.target.value);
                    setCurrentPage(1);
                  }}
                  className={`flex-1 px-4 py-2 rounded-xl text-sm outline-none border ${
                    isDark 
                      ? 'bg-[#0F0F12] border-white/10 text-white focus:border-indigo-500' 
                      : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-indigo-500'
                  }`}
                />
                <span className={isDark ? 'text-slate-600' : 'text-slate-400'}>to</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => {
                    setEndDate(e.target.value);
                    setCurrentPage(1);
                  }}
                  className={`flex-1 px-4 py-2 rounded-xl text-sm outline-none border ${
                    isDark 
                      ? 'bg-[#0F0F12] border-white/10 text-white focus:border-indigo-500' 
                      : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-indigo-500'
                  }`}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className={`text-[10px] font-black uppercase tracking-widest ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                Search
              </label>
              <div className="relative">
                <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
                <input
                  type="text"
                  placeholder="Search description..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-sm transition-all outline-none border ${
                    isDark 
                      ? 'bg-[#0F0F12] border-white/10 text-white focus:border-indigo-500' 
                      : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-indigo-500'
                  }`}
                />
              </div>
            </div>

            <div className="flex items-end">
              <button 
                onClick={() => {
                  setSearchTerm('');
                  setStartDate('');
                  setEndDate('');
                  setSelectedAccountId('');
                }}
                className={`w-full py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${
                  isDark 
                    ? 'border-white/10 text-slate-400 hover:bg-white/5' 
                    : 'border-slate-200 text-slate-500 hover:bg-slate-50'
                }`}
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {/* Ledger Table Section */}
        <div className={`rounded-2xl border overflow-hidden ${isDark ? 'bg-[#16161D] border-white/5' : 'bg-white border-slate-200 shadow-sm'}`}>
          {!selectedAccountId ? (
            <div className="py-24 text-center">
              <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${isDark ? 'bg-white/5' : 'bg-slate-50'}`}>
                <FileText className={`w-8 h-8 ${isDark ? 'text-slate-700' : 'text-slate-300'}`} />
              </div>
              <p className={`text-sm font-bold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Select an account to view the ledger
              </p>
            </div>
          ) : (
            <>
              {/* Summary Bar */}
              <div className={`grid grid-cols-2 md:grid-cols-4 border-b ${isDark ? 'border-white/5 bg-white/2' : 'border-slate-100 bg-slate-50/50'}`}>
                <div className="p-4 border-r border-white/5">
                  <p className={`text-[10px] font-black uppercase tracking-widest mb-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Opening Balance</p>
                  <p className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{formatCurrency(openingBalance)}</p>
                </div>
                <div className="p-4 border-r border-white/5">
                  <p className={`text-[10px] font-black uppercase tracking-widest mb-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Period Debit</p>
                  <p className={`text-sm font-bold text-emerald-500`}>{formatCurrency(totalDebit)}</p>
                </div>
                <div className="p-4 border-r border-white/5">
                  <p className={`text-[10px] font-black uppercase tracking-widest mb-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Period Credit</p>
                  <p className={`text-sm font-bold text-red-500`}>{formatCurrency(totalCredit)}</p>
                </div>
                <div className="p-4">
                  <p className={`text-[10px] font-black uppercase tracking-widest mb-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Closing Balance</p>
                  <p className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{formatCurrency(closingBalance)}</p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[800px]">
                  <thead>
                    <tr className={`border-b ${isDark ? 'border-white/5 bg-white/2' : 'border-slate-100 bg-slate-50/30'}`}>
                      <th className={`py-3 px-6 text-[10px] font-black uppercase tracking-widest ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Date</th>
                      <th className={`py-3 px-6 text-[10px] font-black uppercase tracking-widest ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Reference</th>
                      <th className={`py-3 px-6 text-[10px] font-black uppercase tracking-widest ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Description</th>
                      <th className={`py-3 px-6 text-[10px] font-black uppercase tracking-widest text-right ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Debit</th>
                      <th className={`py-3 px-6 text-[10px] font-black uppercase tracking-widest text-right ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Credit</th>
                      <th className={`py-3 px-6 text-[10px] font-black uppercase tracking-widest text-right ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Balance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* Opening Balance Row */}
                    <tr className={`border-b italic ${isDark ? 'border-white/5 bg-white/2' : 'border-slate-50 bg-slate-50/20'}`}>
                      <td className="py-3 px-6 text-xs text-slate-500">
                        {startDate ? new Date(startDate).toLocaleDateString() : 'Initial'}
                      </td>
                      <td className="py-3 px-6 text-xs text-slate-500">-</td>
                      <td className="py-3 px-6 text-xs font-bold text-slate-500">Opening Balance</td>
                      <td className="py-3 px-6 text-xs text-right text-slate-500">-</td>
                      <td className="py-3 px-6 text-xs text-right text-slate-500">-</td>
                      <td className={`py-3 px-6 text-xs text-right font-bold ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                        {formatCurrency(openingBalance)}
                      </td>
                    </tr>

                    <AnimatePresence mode="popLayout">
                      {paginatedLines.map((line, i) => (
                        <motion.tr
                          key={line.id}
                          initial={{ opacity: 0, y: 4 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.98 }}
                          transition={{ delay: i * 0.02 }}
                          className={`border-b group transition-all ${
                            isDark ? 'border-white/5 hover:bg-white/5' : 'border-slate-50 hover:bg-slate-50'
                          }`}
                        >
                          <td className={`py-4 px-6 text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                            {new Date(line.date).toLocaleDateString()}
                          </td>
                          <td className={`py-4 px-6 text-sm font-mono ${isDark ? 'text-white' : 'text-slate-900'}`}>
                            {line.reference}
                          </td>
                          <td className="py-4 px-6">
                            <p className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{line.description}</p>
                            <p className={`text-[10px] uppercase tracking-wider ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{line.entryDescription}</p>
                          </td>
                          <td className={`py-4 px-6 text-sm text-right font-mono ${line.debit > 0 ? 'text-emerald-500 font-bold' : isDark ? 'text-slate-700' : 'text-slate-300'}`}>
                            {line.debit > 0 ? formatCurrency(line.debit) : '-'}
                          </td>
                          <td className={`py-4 px-6 text-sm text-right font-mono ${line.credit > 0 ? 'text-red-500 font-bold' : isDark ? 'text-slate-700' : 'text-slate-300'}`}>
                            {line.credit > 0 ? formatCurrency(line.credit) : '-'}
                          </td>
                          <td className={`py-4 px-6 text-sm text-right font-mono font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                            {formatCurrency(line.runningBalance)}
                          </td>
                        </motion.tr>
                      ))}
                    </AnimatePresence>

                    {filteredLines.length === 0 && (
                      <tr>
                        <td colSpan={6} className="py-12 text-center">
                          <p className={`text-sm ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>No transactions found for the selected criteria.</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className={`p-4 flex items-center justify-between border-t ${isDark ? 'border-white/5' : 'border-slate-100'}`}>
                  <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                    Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredLines.length)} of {filteredLines.length} entries
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className={`p-2 rounded-lg border transition-all disabled:opacity-30 ${
                        isDark ? 'border-white/10 text-white hover:bg-white/5' : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <div className="flex items-center gap-1">
                      {[...Array(totalPages)].map((_, i) => (
                        <button
                          key={i}
                          onClick={() => setCurrentPage(i + 1)}
                          className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                            currentPage === i + 1
                              ? 'bg-indigo-600 text-white'
                              : isDark ? 'text-slate-400 hover:bg-white/5' : 'text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          {i + 1}
                        </button>
                      ))}
                    </div>
                    <button
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className={`p-2 rounded-lg border transition-all disabled:opacity-30 ${
                        isDark ? 'border-white/10 text-white hover:bg-white/5' : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </AccountingLayout>
  );
}

