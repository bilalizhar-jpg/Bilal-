import React, { useMemo, useState } from 'react';
import AccountingLayout from '../../../components/accounting/AccountingLayout';
import { useTheme } from '../../../context/ThemeContext';
import { useAccounting } from '../../../context/AccountingContext';
import { useSettings } from '../../../context/SettingsContext';
import { 
  Download, 
  FileText, 
  Calendar, 
  ChevronDown, 
  ChevronRight, 
  TrendingUp, 
  TrendingDown,
  PieChart as PieChartIcon,
  BarChart3
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell,
  PieChart,
  Pie
} from 'recharts';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

export default function IncomeStatement() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const { formatCurrency } = useSettings();
  const { accounts, journalLines, journalEntries } = useAccounting();
  
  const [startDate, setStartDate] = useState(new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    revenue: true,
    expense: true
  });

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const report = useMemo(() => {
    const entryDates = new Map(journalEntries.map(e => [e.id, e.date]));

    const getAccountBalance = (accountId: string, type: string) => {
      const account = accounts.find(a => a.id === accountId);
      if (!account) return 0;
      
      let debit = 0;
      let credit = 0;

      // For P&L, we usually only look at activity within the period.
      // However, some businesses include opening balances for the period.
      // Standard P&L is activity-based.
      const linesInRange = journalLines.filter(l => {
        if (l.accountId !== accountId) return false;
        const date = entryDates.get(l.journalEntryId);
        if (!date) return false;
        return date >= startDate && date <= endDate;
      });

      linesInRange.forEach(line => {
        debit += (line.debit || 0);
        credit += (line.credit || 0);
      });

      // Revenue: Credit - Debit
      // Expense: Debit - Credit
      if (type === 'Revenue') {
        return credit - debit;
      } else if (type === 'Expense') {
        return debit - credit;
      }
      return 0;
    };

    const revenues = accounts
      .filter(a => a.type === 'Revenue')
      .map(a => ({ ...a, balance: getAccountBalance(a.id, a.type) }))
      .filter(a => a.balance !== 0);

    const expenses = accounts
      .filter(a => a.type === 'Expense')
      .map(a => ({ ...a, balance: getAccountBalance(a.id, a.type) }))
      .filter(a => a.balance !== 0);

    const totalRevenue = revenues.reduce((sum, a) => sum + a.balance, 0);
    const totalExpense = expenses.reduce((sum, a) => sum + a.balance, 0);
    const netIncome = totalRevenue - totalExpense;

    return { revenues, expenses, totalRevenue, totalExpense, netIncome };
  }, [accounts, journalLines, journalEntries, startDate, endDate]);

  const chartData = [
    { name: 'Revenue', value: report.totalRevenue, color: '#10B981' },
    { name: 'Expenses', value: report.totalExpense, color: '#EF4444' }
  ];

  const expenseBreakdown = report.expenses.map(e => ({
    name: e.name,
    value: e.balance
  })).sort((a, b) => b.value - a.value);

  const exportToCSV = () => {
    const data = [
      { Category: 'REVENUE', Account: '', Amount: '' },
      ...report.revenues.map(r => ({ Category: '', Account: r.name, Amount: r.balance })),
      { Category: 'Total Revenue', Account: '', Amount: report.totalRevenue },
      { Category: '', Account: '', Amount: '' },
      { Category: 'EXPENSES', Account: '', Amount: '' },
      ...report.expenses.map(e => ({ Category: '', Account: e.name, Amount: e.balance })),
      { Category: 'Total Expenses', Account: '', Amount: report.totalExpense },
      { Category: '', Account: '', Amount: '' },
      { Category: 'NET INCOME', Account: '', Amount: report.netIncome }
    ];
    
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Profit and Loss');
    XLSX.writeFile(wb, `Profit_and_Loss_${startDate}_to_${endDate}.xlsx`);
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.text('Profit and Loss Statement', 14, 22);
    doc.setFontSize(11);
    doc.text(`Period: ${startDate} to ${endDate}`, 14, 30);
    
    const revenueRows = report.revenues.map(r => [r.code, r.name, formatCurrency(r.balance)]);
    const expenseRows = report.expenses.map(e => [e.code, e.name, formatCurrency(e.balance)]);

    (doc as any).autoTable({
      startY: 40,
      head: [['Code', 'Revenue Accounts', 'Amount']],
      body: [
        ...revenueRows,
        [{ content: 'Total Revenue', colSpan: 2, styles: { fontStyle: 'bold' } }, { content: formatCurrency(report.totalRevenue), styles: { fontStyle: 'bold' } }]
      ],
      theme: 'striped',
      headStyles: { fillColor: [16, 185, 129] }
    });

    (doc as any).autoTable({
      startY: (doc as any).lastAutoTable.finalY + 10,
      head: [['Code', 'Expense Accounts', 'Amount']],
      body: [
        ...expenseRows,
        [{ content: 'Total Expenses', colSpan: 2, styles: { fontStyle: 'bold' } }, { content: formatCurrency(report.totalExpense), styles: { fontStyle: 'bold' } }]
      ],
      theme: 'striped',
      headStyles: { fillColor: [239, 68, 68] }
    });

    const finalY = (doc as any).lastAutoTable.finalY + 15;
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(`Net Income: ${formatCurrency(report.netIncome)}`, 14, finalY);

    doc.save(`Profit_and_Loss_${startDate}_to_${endDate}.pdf`);
  };

  return (
    <AccountingLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className={`text-2xl font-black uppercase tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Profit & Loss
            </h1>
            <p className={`text-sm ${isDark ? 'text-[#B0B0C3]' : 'text-slate-500'}`}>
              Income Statement for the selected period
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={exportToCSV}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                isDark ? 'bg-white/5 text-white hover:bg-white/10' : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'
              }`}
            >
              <Download className="w-4 h-4" />
              Excel
            </button>
            <button
              onClick={exportToPDF}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold bg-indigo-600 text-white hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/20"
            >
              <FileText className="w-4 h-4" />
              PDF
            </button>
          </div>
        </div>

        {/* Filters & Summary Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className={`lg:col-span-1 p-6 rounded-2xl border ${isDark ? 'bg-[#2A2A3D] border-white/5' : 'bg-white border-slate-200'}`}>
            <h3 className={`text-xs font-black uppercase tracking-widest mb-4 ${isDark ? 'text-[#B0B0C3]' : 'text-slate-500'}`}>
              Period Filter
            </h3>
            <div className="space-y-4">
              <div>
                <label className={`block text-xs font-bold mb-1 ${isDark ? 'text-white/60' : 'text-slate-500'}`}>From</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className={`w-full px-3 py-2 rounded-xl text-sm border outline-none ${
                    isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                  }`}
                />
              </div>
              <div>
                <label className={`block text-xs font-bold mb-1 ${isDark ? 'text-white/60' : 'text-slate-500'}`}>To</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className={`w-full px-3 py-2 rounded-xl text-sm border outline-none ${
                    isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                  }`}
                />
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className={`p-6 rounded-2xl border ${isDark ? 'bg-[#2A2A3D] border-white/5' : 'bg-white border-slate-200'}`}>
              <div className="flex items-center gap-2 text-emerald-500 mb-2">
                <TrendingUp className="w-4 h-4" />
                <span className="text-[10px] font-black uppercase tracking-widest">Total Income</span>
              </div>
              <p className={`text-2xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {formatCurrency(report.totalRevenue)}
              </p>
            </div>
            <div className={`p-6 rounded-2xl border ${isDark ? 'bg-[#2A2A3D] border-white/5' : 'bg-white border-slate-200'}`}>
              <div className="flex items-center gap-2 text-rose-500 mb-2">
                <TrendingDown className="w-4 h-4" />
                <span className="text-[10px] font-black uppercase tracking-widest">Total Expenses</span>
              </div>
              <p className={`text-2xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {formatCurrency(report.totalExpense)}
              </p>
            </div>
            <div className={`p-6 rounded-2xl border ${isDark ? 'bg-indigo-600 border-indigo-500' : 'bg-indigo-50 border-indigo-100'}`}>
              <div className={`flex items-center gap-2 mb-2 ${isDark ? 'text-indigo-200' : 'text-indigo-600'}`}>
                <BarChart3 className="w-4 h-4" />
                <span className="text-[10px] font-black uppercase tracking-widest">Net Profit</span>
              </div>
              <p className={`text-2xl font-black ${isDark ? 'text-white' : 'text-indigo-900'}`}>
                {formatCurrency(report.netIncome)}
              </p>
            </div>
          </div>
        </div>

        {/* Visualizations */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className={`p-6 rounded-2xl border ${isDark ? 'bg-[#2A2A3D] border-white/5' : 'bg-white border-slate-200'}`}>
            <h3 className={`text-xs font-black uppercase tracking-widest mb-6 flex items-center gap-2 ${isDark ? 'text-[#B0B0C3]' : 'text-slate-500'}`}>
              <BarChart3 className="w-4 h-4" />
              Income vs Expenses
            </h3>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#ffffff10' : '#e2e8f0'} vertical={false} />
                  <XAxis dataKey="name" stroke={isDark ? '#ffffff40' : '#64748b'} fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke={isDark ? '#ffffff40' : '#64748b'} fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => formatCurrency(v)} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: isDark ? '#1F1F2E' : '#fff', border: 'none', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                    itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                  />
                  <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className={`p-6 rounded-2xl border ${isDark ? 'bg-[#2A2A3D] border-white/5' : 'bg-white border-slate-200'}`}>
            <h3 className={`text-xs font-black uppercase tracking-widest mb-6 flex items-center gap-2 ${isDark ? 'text-[#B0B0C3]' : 'text-slate-500'}`}>
              <PieChartIcon className="w-4 h-4" />
              Expense Breakdown
            </h3>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={expenseBreakdown}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {expenseBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={`hsl(${index * 45}, 70%, 60%)`} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: isDark ? '#1F1F2E' : '#fff', border: 'none', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Detailed Report Table */}
        <div className={`rounded-3xl border overflow-hidden ${isDark ? 'bg-[#2A2A3D] border-white/5' : 'bg-white border-slate-200'}`}>
          <div className="p-6 border-b border-slate-100 dark:border-white/5 flex items-center justify-between">
            <h2 className={`text-sm font-black uppercase tracking-widest ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Detailed Statement
            </h2>
          </div>
          
          <div className="p-6 space-y-8">
            {/* Income Section */}
            <div>
              <button 
                onClick={() => toggleSection('revenue')}
                className="w-full flex items-center justify-between group mb-4"
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${isDark ? 'bg-emerald-500/10 text-emerald-400' : 'bg-emerald-50 text-emerald-600'}`}>
                    {expandedSections.revenue ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                  </div>
                  <h3 className={`text-base font-black uppercase tracking-widest ${isDark ? 'text-white' : 'text-slate-900'}`}>Income</h3>
                </div>
                <span className={`text-lg font-black ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>
                  {formatCurrency(report.totalRevenue)}
                </span>
              </button>
              
              {expandedSections.revenue && (
                <div className="pl-11 space-y-3">
                  {report.revenues.length === 0 ? (
                    <p className="text-sm text-slate-400 italic">No income recorded for this period.</p>
                  ) : (
                    report.revenues.map(acc => (
                      <div key={acc.id} className="flex justify-between items-center py-2 border-b border-slate-50 dark:border-white/5 last:border-0">
                        <div className="flex flex-col">
                          <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-slate-700'}`}>{acc.name}</span>
                          <span className="text-[10px] font-mono text-slate-400 uppercase">{acc.code}</span>
                        </div>
                        <span className={`text-sm font-mono ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                          {formatCurrency(acc.balance)}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* Expenses Section */}
            <div>
              <button 
                onClick={() => toggleSection('expense')}
                className="w-full flex items-center justify-between group mb-4"
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${isDark ? 'bg-rose-500/10 text-rose-400' : 'bg-rose-50 text-rose-600'}`}>
                    {expandedSections.expense ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                  </div>
                  <h3 className={`text-base font-black uppercase tracking-widest ${isDark ? 'text-white' : 'text-slate-900'}`}>Expenses</h3>
                </div>
                <span className={`text-lg font-black ${isDark ? 'text-rose-400' : 'text-rose-600'}`}>
                  {formatCurrency(report.totalExpense)}
                </span>
              </button>
              
              {expandedSections.expense && (
                <div className="pl-11 space-y-3">
                  {report.expenses.length === 0 ? (
                    <p className="text-sm text-slate-400 italic">No expenses recorded for this period.</p>
                  ) : (
                    report.expenses.map(acc => (
                      <div key={acc.id} className="flex justify-between items-center py-2 border-b border-slate-50 dark:border-white/5 last:border-0">
                        <div className="flex flex-col">
                          <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-slate-700'}`}>{acc.name}</span>
                          <span className="text-[10px] font-mono text-slate-400 uppercase">{acc.code}</span>
                        </div>
                        <span className={`text-sm font-mono ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                          {formatCurrency(acc.balance)}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* Net Profit Footer */}
            <div className={`mt-8 pt-6 border-t-2 ${isDark ? 'border-white/10' : 'border-slate-200'}`}>
              <div className="flex justify-between items-center">
                <div className="flex flex-col">
                  <span className={`text-xs font-black uppercase tracking-[0.2em] ${isDark ? 'text-white/40' : 'text-slate-400'}`}>Summary</span>
                  <span className={`text-xl font-black uppercase tracking-widest ${isDark ? 'text-white' : 'text-slate-900'}`}>Net Profit / Loss</span>
                </div>
                <div className="text-right">
                  <span className={`text-3xl font-black ${report.netIncome >= 0 ? (isDark ? 'text-[#00FFCC]' : 'text-emerald-600') : 'text-rose-500'}`}>
                    {formatCurrency(report.netIncome)}
                  </span>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                    {report.netIncome >= 0 ? 'Surplus' : 'Deficit'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AccountingLayout>
  );
}
