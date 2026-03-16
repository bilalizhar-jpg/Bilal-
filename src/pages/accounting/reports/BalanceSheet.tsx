import React, { useState, useMemo } from 'react';
import AccountingLayout from '../../../components/accounting/AccountingLayout';
import { useTheme } from '../../../context/ThemeContext';
import { useAccounting } from '../../../context/AccountingContext';
import { useSettings } from '../../../context/SettingsContext';
import { 
  Calendar, 
  FileText, 
  ChevronDown, 
  ChevronRight, 
  AlertCircle,
  CheckCircle2,
  Table as TableIcon
} from 'lucide-react';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function BalanceSheet() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const { formatCurrency } = useSettings();
  const { accounts, journalEntries, journalLines } = useAccounting();
  const [asOfDate, setAsOfDate] = useState(new Date().toISOString().split('T')[0]);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    assets: true,
    currentAssets: true,
    fixedAssets: true,
    liabilities: true,
    currentLiabilities: true,
    longTermLiabilities: true,
    equity: true,
    ownerCapital: true,
    retainedEarnings: true
  });

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const report = useMemo(() => {
    // 1. Filter entries up to asOfDate
    const validEntries = journalEntries.filter(entry => entry.date <= asOfDate);
    const validEntryIds = new Set(validEntries.map(e => e.id));
    const filteredLines = journalLines.filter(line => validEntryIds.has(line.journalEntryId));

    // 2. Helper to get balance
    const getAccountBalance = (accountId: string, type: string) => {
      const account = accounts.find(a => a.id === accountId);
      if (!account) return 0;
      
      let debit = 0;
      let credit = 0;
      const lines = filteredLines.filter(l => l.accountId === accountId);
      lines.forEach(line => {
        debit += line.debit;
        credit += line.credit;
      });

      const isDebitNormal = type === 'Asset' || type === 'Expense';
      if (isDebitNormal) {
        return (account.openingBalance || 0) + debit - credit;
      } else {
        return (account.openingBalance || 0) + credit - debit;
      }
    };

    // 3. Categorize accounts
    const categorized = {
      assets: {
        current: [] as any[],
        fixed: [] as any[],
        total: 0
      },
      liabilities: {
        current: [] as any[],
        longTerm: [] as any[],
        total: 0
      },
      equity: {
        ownerCapital: [] as any[],
        retainedEarnings: [] as any[],
        total: 0
      }
    };

    accounts.forEach(account => {
      const balance = getAccountBalance(account.id, account.type);
      if (balance === 0 && account.openingBalance === 0) return;

      const accountWithBalance = { ...account, balance };
      const code = parseInt(account.code);

      if (account.type === 'Asset') {
        if (code < 1500) categorized.assets.current.push(accountWithBalance);
        else categorized.assets.fixed.push(accountWithBalance);
        categorized.assets.total += balance;
      } else if (account.type === 'Liability') {
        if (code < 2500) categorized.liabilities.current.push(accountWithBalance);
        else categorized.liabilities.longTerm.push(accountWithBalance);
        categorized.liabilities.total += balance;
      } else if (account.type === 'Equity') {
        if (code < 3500) categorized.equity.ownerCapital.push(accountWithBalance);
        else categorized.equity.retainedEarnings.push(accountWithBalance);
        categorized.equity.total += balance;
      }
    });

    // 4. Calculate Net Income for Retained Earnings
    const revenues = accounts
      .filter(a => a.type === 'Revenue')
      .reduce((sum, a) => sum + getAccountBalance(a.id, a.type), 0);

    const expenses = accounts
      .filter(a => a.type === 'Expense')
      .reduce((sum, a) => sum + getAccountBalance(a.id, a.type), 0);

    const netIncome = revenues - expenses;
    
    // Add Net Income to Retained Earnings total
    const totalEquity = categorized.equity.total + netIncome;
    const totalLiabilitiesAndEquity = categorized.liabilities.total + totalEquity;

    return { 
      ...categorized, 
      netIncome, 
      totalEquity, 
      totalLiabilitiesAndEquity,
      isBalanced: Math.abs(categorized.assets.total - totalLiabilitiesAndEquity) < 0.01
    };
  }, [accounts, journalEntries, journalLines, asOfDate]);

  const exportToCSV = () => {
    const data: any[] = [];
    data.push(['Balance Sheet', '', 'As of: ' + asOfDate]);
    data.push([]);

    // Assets
    data.push(['ASSETS']);
    data.push(['Current Assets']);
    report.assets.current.forEach(a => data.push(['', a.name, a.balance]));
    data.push(['', 'Total Current Assets', report.assets.current.reduce((sum, a) => sum + a.balance, 0)]);
    data.push(['Fixed Assets']);
    report.assets.fixed.forEach(a => data.push(['', a.name, a.balance]));
    data.push(['', 'Total Fixed Assets', report.assets.fixed.reduce((sum, a) => sum + a.balance, 0)]);
    data.push(['TOTAL ASSETS', '', report.assets.total]);
    data.push([]);

    // Liabilities
    data.push(['LIABILITIES']);
    data.push(['Current Liabilities']);
    report.liabilities.current.forEach(a => data.push(['', a.name, a.balance]));
    data.push(['', 'Total Current Liabilities', report.liabilities.current.reduce((sum, a) => sum + a.balance, 0)]);
    data.push(['Long Term Liabilities']);
    report.liabilities.longTerm.forEach(a => data.push(['', a.name, a.balance]));
    data.push(['', 'Total Long Term Liabilities', report.liabilities.longTerm.reduce((sum, a) => sum + a.balance, 0)]);
    data.push(['TOTAL LIABILITIES', '', report.liabilities.total]);
    data.push([]);

    // Equity
    data.push(['EQUITY']);
    report.equity.ownerCapital.forEach(a => data.push(['', a.name, a.balance]));
    report.equity.retainedEarnings.forEach(a => data.push(['', a.name, a.balance]));
    data.push(['', 'Current Year Earnings', report.netIncome]);
    data.push(['TOTAL EQUITY', '', report.totalEquity]);
    data.push([]);
    data.push(['TOTAL LIABILITIES & EQUITY', '', report.totalLiabilitiesAndEquity]);

    const ws = XLSX.utils.aoa_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Balance Sheet');
    XLSX.writeFile(wb, `Balance_Sheet_${asOfDate}.xlsx`);
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    doc.setFontSize(20);
    doc.text('Balance Sheet', pageWidth / 2, 20, { align: 'center' });
    doc.setFontSize(12);
    doc.text(`As of: ${asOfDate}`, pageWidth / 2, 30, { align: 'center' });

    const tableData: any[] = [];

    // Assets Section
    tableData.push([{ content: 'ASSETS', colSpan: 2, styles: { fillColor: [240, 240, 240], fontStyle: 'bold' } }]);
    tableData.push([{ content: 'Current Assets', colSpan: 2, styles: { fontStyle: 'italic', indent: 5 } }]);
    report.assets.current.forEach(a => tableData.push([{ content: a.name, styles: { indent: 10 } }, formatCurrency(a.balance)]));
    tableData.push([{ content: 'Total Current Assets', styles: { fontStyle: 'bold', indent: 5 } }, formatCurrency(report.assets.current.reduce((sum, a) => sum + a.balance, 0))]);
    
    tableData.push([{ content: 'Fixed Assets', colSpan: 2, styles: { fontStyle: 'italic', indent: 5 } }]);
    report.assets.fixed.forEach(a => tableData.push([{ content: a.name, styles: { indent: 10 } }, formatCurrency(a.balance)]));
    tableData.push([{ content: 'Total Fixed Assets', styles: { fontStyle: 'bold', indent: 5 } }, formatCurrency(report.assets.fixed.reduce((sum, a) => sum + a.balance, 0))]);
    
    tableData.push([{ content: 'TOTAL ASSETS', styles: { fontStyle: 'bold' } }, { content: formatCurrency(report.assets.total), styles: { fontStyle: 'bold' } }]);

    // Liabilities Section
    tableData.push([{ content: 'LIABILITIES', colSpan: 2, styles: { fillColor: [240, 240, 240], fontStyle: 'bold' } }]);
    tableData.push([{ content: 'Current Liabilities', colSpan: 2, styles: { fontStyle: 'italic', indent: 5 } }]);
    report.liabilities.current.forEach(a => tableData.push([{ content: a.name, styles: { indent: 10 } }, formatCurrency(a.balance)]));
    tableData.push([{ content: 'Total Current Liabilities', styles: { fontStyle: 'bold', indent: 5 } }, formatCurrency(report.liabilities.current.reduce((sum, a) => sum + a.balance, 0))]);
    
    tableData.push([{ content: 'Long Term Liabilities', colSpan: 2, styles: { fontStyle: 'italic', indent: 5 } }]);
    report.liabilities.longTerm.forEach(a => tableData.push([{ content: a.name, styles: { indent: 10 } }, formatCurrency(a.balance)]));
    tableData.push([{ content: 'Total Long Term Liabilities', styles: { fontStyle: 'bold', indent: 5 } }, formatCurrency(report.liabilities.longTerm.reduce((sum, a) => sum + a.balance, 0))]);
    
    tableData.push([{ content: 'TOTAL LIABILITIES', styles: { fontStyle: 'bold' } }, { content: formatCurrency(report.liabilities.total), styles: { fontStyle: 'bold' } }]);

    // Equity Section
    tableData.push([{ content: 'EQUITY', colSpan: 2, styles: { fillColor: [240, 240, 240], fontStyle: 'bold' } }]);
    report.equity.ownerCapital.forEach(a => tableData.push([{ content: a.name, styles: { indent: 10 } }, formatCurrency(a.balance)]));
    report.equity.retainedEarnings.forEach(a => tableData.push([{ content: a.name, styles: { indent: 10 } }, formatCurrency(a.balance)]));
    tableData.push([{ content: 'Current Year Earnings', styles: { indent: 10 } }, formatCurrency(report.netIncome)]);
    tableData.push([{ content: 'TOTAL EQUITY', styles: { fontStyle: 'bold' } }, { content: formatCurrency(report.totalEquity), styles: { fontStyle: 'bold' } }]);

    tableData.push([{ content: 'TOTAL LIABILITIES & EQUITY', styles: { fontStyle: 'bold', fillColor: [220, 220, 220] } }, { content: formatCurrency(report.totalLiabilitiesAndEquity), styles: { fontStyle: 'bold', fillColor: [220, 220, 220] } }]);

    autoTable(doc, {
      head: [['Account', 'Balance']],
      body: tableData,
      startY: 40,
      theme: 'plain',
      styles: { fontSize: 10 },
      columnStyles: { 1: { halign: 'right' } }
    });

    doc.save(`Balance_Sheet_${asOfDate}.pdf`);
  };

  const SectionHeader = ({ title, amount, isExpanded, onToggle, colorClass }: any) => (
    <div 
      onClick={onToggle}
      className={`flex justify-between items-center p-4 cursor-pointer transition-colors ${
        isDark ? 'hover:bg-white/5' : 'hover:bg-slate-50'
      }`}
    >
      <div className="flex items-center gap-3">
        {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
        <h3 className={`text-sm font-black uppercase tracking-widest ${colorClass}`}>
          {title}
        </h3>
      </div>
      <span className={`text-sm font-mono font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
        {formatCurrency(amount)}
      </span>
    </div>
  );

  const AccountRow = ({ name, code, balance, indent = false }: any) => (
    <div className={`flex justify-between items-center py-2 px-4 ${indent ? 'pl-12' : 'pl-8'}`}>
      <div className="flex flex-col">
        <span className={`text-sm ${isDark ? 'text-white' : 'text-slate-700'}`}>{name}</span>
        <span className={`text-[10px] uppercase tracking-tighter ${isDark ? 'text-[#B0B0C3]' : 'text-slate-400'}`}>{code}</span>
      </div>
      <span className={`text-sm font-mono ${isDark ? 'text-[#B0B0C3]' : 'text-slate-600'}`}>
        {formatCurrency(balance)}
      </span>
    </div>
  );

  return (
    <AccountingLayout>
      <div className="space-y-6 max-w-5xl mx-auto pb-12">
        {/* Header & Controls */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className={`text-3xl font-black uppercase tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Balance Sheet
            </h1>
            <p className={`text-sm mt-1 ${isDark ? 'text-[#B0B0C3]' : 'text-slate-500'}`}>
              Financial Position as of {new Date(asOfDate).toLocaleDateString()}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className={`flex items-center gap-2 px-3 py-2 rounded-xl border ${
              isDark ? 'bg-[#2A2A3D] border-white/10' : 'bg-white border-slate-200'
            }`}>
              <Calendar size={16} className={isDark ? 'text-[#00FFCC]' : 'text-indigo-600'} />
              <input
                type="date"
                value={asOfDate}
                onChange={(e) => setAsOfDate(e.target.value)}
                className={`text-sm bg-transparent border-none focus:ring-0 ${isDark ? 'text-white' : 'text-slate-900'}`}
              />
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={exportToCSV}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                  isDark 
                    ? 'bg-white/5 text-white hover:bg-white/10' 
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <TableIcon size={16} />
                CSV
              </button>
              <button
                onClick={exportToPDF}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                  isDark 
                    ? 'bg-[#00FFCC] text-black hover:bg-[#00E6B8]' 
                    : 'bg-indigo-600 text-white hover:bg-indigo-700'
                }`}
              >
                <FileText size={16} />
                PDF
              </button>
            </div>
          </div>
        </div>

        {/* Validation Alert */}
        <div className={`p-4 rounded-2xl border flex items-center justify-between ${
          report.isBalanced 
            ? (isDark ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-emerald-50 border-emerald-200 text-emerald-700')
            : (isDark ? 'bg-rose-500/10 border-rose-500/20 text-rose-400' : 'bg-rose-50 border-rose-200 text-rose-700')
        }`}>
          <div className="flex items-center gap-3">
            {report.isBalanced ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
            <div>
              <p className="text-sm font-bold uppercase tracking-wider">
                {report.isBalanced ? 'Balance Sheet is Balanced' : 'Balance Sheet is Out of Balance'}
              </p>
              <p className="text-xs opacity-80">
                Assets ({formatCurrency(report.assets.total)}) {report.isBalanced ? '=' : '≠'} Liabilities + Equity ({formatCurrency(report.totalLiabilitiesAndEquity)})
              </p>
            </div>
          </div>
          {!report.isBalanced && (
            <span className="text-xs font-mono font-bold">
              Diff: {formatCurrency(Math.abs(report.assets.total - report.totalLiabilitiesAndEquity))}
            </span>
          )}
        </div>

        {/* Report Content */}
        <div className={`rounded-2xl border overflow-hidden shadow-sm ${
          isDark ? 'bg-[#2A2A3D] border-white/5' : 'bg-white border-slate-200'
        }`}>
          {/* ASSETS SECTION */}
          <div className="border-b border-white/5">
            <SectionHeader 
              title="Assets" 
              amount={report.assets.total} 
              isExpanded={expandedSections.assets}
              onToggle={() => toggleSection('assets')}
              colorClass={isDark ? 'text-[#00FFCC]' : 'text-indigo-600'}
            />
            
            {expandedSections.assets && (
              <div className={`pb-4 ${isDark ? 'bg-white/2' : 'bg-slate-50/50'}`}>
                {/* Current Assets */}
                <div className="mt-2">
                  <div 
                    onClick={() => toggleSection('currentAssets')}
                    className="flex justify-between items-center px-8 py-2 cursor-pointer hover:opacity-80"
                  >
                    <div className="flex items-center gap-2">
                      {expandedSections.currentAssets ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                      <span className="text-xs font-bold uppercase tracking-widest opacity-60">Current Assets</span>
                    </div>
                    <span className="text-xs font-mono font-bold opacity-60">
                      {formatCurrency(report.assets.current.reduce((sum, a) => sum + a.balance, 0))}
                    </span>
                  </div>
                  {expandedSections.currentAssets && (
                    <div className="space-y-1 mt-1">
                      {report.assets.current.map(a => (
                        <AccountRow key={a.id} name={a.name} code={a.code} balance={a.balance} indent />
                      ))}
                    </div>
                  )}
                </div>

                {/* Fixed Assets */}
                <div className="mt-4">
                  <div 
                    onClick={() => toggleSection('fixedAssets')}
                    className="flex justify-between items-center px-8 py-2 cursor-pointer hover:opacity-80"
                  >
                    <div className="flex items-center gap-2">
                      {expandedSections.fixedAssets ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                      <span className="text-xs font-bold uppercase tracking-widest opacity-60">Fixed Assets</span>
                    </div>
                    <span className="text-xs font-mono font-bold opacity-60">
                      {formatCurrency(report.assets.fixed.reduce((sum, a) => sum + a.balance, 0))}
                    </span>
                  </div>
                  {expandedSections.fixedAssets && (
                    <div className="space-y-1 mt-1">
                      {report.assets.fixed.map(a => (
                        <AccountRow key={a.id} name={a.name} code={a.code} balance={a.balance} indent />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* LIABILITIES SECTION */}
          <div className="border-b border-white/5">
            <SectionHeader 
              title="Liabilities" 
              amount={report.liabilities.total} 
              isExpanded={expandedSections.liabilities}
              onToggle={() => toggleSection('liabilities')}
              colorClass={isDark ? 'text-amber-400' : 'text-amber-600'}
            />
            
            {expandedSections.liabilities && (
              <div className={`pb-4 ${isDark ? 'bg-white/2' : 'bg-slate-50/50'}`}>
                {/* Current Liabilities */}
                <div className="mt-2">
                  <div 
                    onClick={() => toggleSection('currentLiabilities')}
                    className="flex justify-between items-center px-8 py-2 cursor-pointer hover:opacity-80"
                  >
                    <div className="flex items-center gap-2">
                      {expandedSections.currentLiabilities ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                      <span className="text-xs font-bold uppercase tracking-widest opacity-60">Current Liabilities</span>
                    </div>
                    <span className="text-xs font-mono font-bold opacity-60">
                      {formatCurrency(report.liabilities.current.reduce((sum, a) => sum + a.balance, 0))}
                    </span>
                  </div>
                  {expandedSections.currentLiabilities && (
                    <div className="space-y-1 mt-1">
                      {report.liabilities.current.map(a => (
                        <AccountRow key={a.id} name={a.name} code={a.code} balance={a.balance} indent />
                      ))}
                    </div>
                  )}
                </div>

                {/* Long Term Liabilities */}
                <div className="mt-4">
                  <div 
                    onClick={() => toggleSection('longTermLiabilities')}
                    className="flex justify-between items-center px-8 py-2 cursor-pointer hover:opacity-80"
                  >
                    <div className="flex items-center gap-2">
                      {expandedSections.longTermLiabilities ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                      <span className="text-xs font-bold uppercase tracking-widest opacity-60">Long Term Liabilities</span>
                    </div>
                    <span className="text-xs font-mono font-bold opacity-60">
                      {formatCurrency(report.liabilities.longTerm.reduce((sum, a) => sum + a.balance, 0))}
                    </span>
                  </div>
                  {expandedSections.longTermLiabilities && (
                    <div className="space-y-1 mt-1">
                      {report.liabilities.longTerm.map(a => (
                        <AccountRow key={a.id} name={a.name} code={a.code} balance={a.balance} indent />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* EQUITY SECTION */}
          <div className="border-b border-white/5">
            <SectionHeader 
              title="Equity" 
              amount={report.totalEquity} 
              isExpanded={expandedSections.equity}
              onToggle={() => toggleSection('equity')}
              colorClass={isDark ? 'text-emerald-400' : 'text-emerald-600'}
            />
            
            {expandedSections.equity && (
              <div className={`pb-4 ${isDark ? 'bg-white/2' : 'bg-slate-50/50'}`}>
                {/* Owner Capital */}
                <div className="mt-2">
                  <div 
                    onClick={() => toggleSection('ownerCapital')}
                    className="flex justify-between items-center px-8 py-2 cursor-pointer hover:opacity-80"
                  >
                    <div className="flex items-center gap-2">
                      {expandedSections.ownerCapital ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                      <span className="text-xs font-bold uppercase tracking-widest opacity-60">Owner Capital</span>
                    </div>
                    <span className="text-xs font-mono font-bold opacity-60">
                      {formatCurrency(report.equity.ownerCapital.reduce((sum, a) => sum + a.balance, 0))}
                    </span>
                  </div>
                  {expandedSections.ownerCapital && (
                    <div className="space-y-1 mt-1">
                      {report.equity.ownerCapital.map(a => (
                        <AccountRow key={a.id} name={a.name} code={a.code} balance={a.balance} indent />
                      ))}
                    </div>
                  )}
                </div>

                {/* Retained Earnings */}
                <div className="mt-4">
                  <div 
                    onClick={() => toggleSection('retainedEarnings')}
                    className="flex justify-between items-center px-8 py-2 cursor-pointer hover:opacity-80"
                  >
                    <div className="flex items-center gap-2">
                      {expandedSections.retainedEarnings ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                      <span className="text-xs font-bold uppercase tracking-widest opacity-60">Retained Earnings</span>
                    </div>
                    <span className="text-xs font-mono font-bold opacity-60">
                      {formatCurrency(report.equity.retainedEarnings.reduce((sum, a) => sum + a.balance, 0) + report.netIncome)}
                    </span>
                  </div>
                  {expandedSections.retainedEarnings && (
                    <div className="space-y-1 mt-1">
                      {report.equity.retainedEarnings.map(a => (
                        <AccountRow key={a.id} name={a.name} code={a.code} balance={a.balance} indent />
                      ))}
                      <AccountRow 
                        name="Current Year Earnings (Net Income)" 
                        code="SYSTEM" 
                        balance={report.netIncome} 
                        indent 
                      />
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* FINAL TOTALS */}
          <div className={`p-6 flex flex-col md:flex-row justify-between items-center gap-4 ${
            isDark ? 'bg-white/5' : 'bg-slate-50'
          }`}>
            <div className="flex flex-col items-center md:items-start">
              <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${isDark ? 'text-[#B0B0C3]' : 'text-slate-400'}`}>
                Total Assets
              </span>
              <span className={`text-2xl font-mono font-black ${isDark ? 'text-[#00FFCC]' : 'text-indigo-600'}`}>
                {formatCurrency(report.assets.total)}
              </span>
            </div>

            <div className={`hidden md:block w-px h-12 ${isDark ? 'bg-white/10' : 'bg-slate-200'}`} />

            <div className="flex flex-col items-center md:items-end">
              <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${isDark ? 'text-[#B0B0C3]' : 'text-slate-400'}`}>
                Total Liabilities & Equity
              </span>
              <span className={`text-2xl font-mono font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {formatCurrency(report.totalLiabilitiesAndEquity)}
              </span>
            </div>
          </div>
        </div>

        {/* Footer Info */}
        <div className="flex justify-center gap-8 py-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#00FFCC]" />
            <span className={`text-[10px] uppercase tracking-widest font-bold ${isDark ? 'text-[#B0B0C3]' : 'text-slate-500'}`}>
              Assets
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-amber-400" />
            <span className={`text-[10px] uppercase tracking-widest font-bold ${isDark ? 'text-[#B0B0C3]' : 'text-slate-500'}`}>
              Liabilities
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-emerald-400" />
            <span className={`text-[10px] uppercase tracking-widest font-bold ${isDark ? 'text-[#B0B0C3]' : 'text-slate-500'}`}>
              Equity
            </span>
          </div>
        </div>
      </div>
    </AccountingLayout>
  );
}
