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
  Download,
  TrendingUp,
  TrendingDown,
  Wallet,
  Table as TableIcon,
  BarChart as BarChartIcon,
  PieChart as PieChartIcon
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
  Legend
} from 'recharts';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function CashFlow() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const { formatCurrency } = useSettings();
  const { accounts, journalEntries, journalLines } = useAccounting();
  
  const [startDate, setStartDate] = useState(new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    operating: true,
    investing: true,
    financing: true
  });

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const report = useMemo(() => {
    // 1. Identify Cash Accounts
    const cashAccounts = accounts.filter(a => 
      a.type === 'Asset' && 
      (a.name.toLowerCase().includes('cash') || a.name.toLowerCase().includes('bank'))
    );
    const cashAccountIds = new Set(cashAccounts.map(a => a.id));

    // 2. Calculate Opening Balance
    const preEntries = journalEntries.filter(e => e.date < startDate);
    const preEntryIds = new Set(preEntries.map(e => e.id));
    const preLines = journalLines.filter(l => preEntryIds.has(l.journalEntryId) && cashAccountIds.has(l.accountId));
    
    let openingBalance = cashAccounts.reduce((sum, a) => sum + (a.openingBalance || 0), 0);
    preLines.forEach(l => {
      openingBalance += (l.debit - l.credit);
    });

    // 3. Process Transactions in Range
    const rangeEntries = journalEntries.filter(e => e.date >= startDate && e.date <= endDate);
    const rangeEntryIds = new Set(rangeEntries.map(e => e.id));
    
    const categories = {
      operating: { inflows: 0, outflows: 0, items: [] as any[] },
      investing: { inflows: 0, outflows: 0, items: [] as any[] },
      financing: { inflows: 0, outflows: 0, items: [] as any[] }
    };

    rangeEntries.forEach(entry => {
      const entryLines = journalLines.filter(l => l.journalEntryId === entry.id);
      const cashLine = entryLines.find(l => cashAccountIds.has(l.accountId));
      
      if (!cashLine) return;

      const amount = cashLine.debit - cashLine.credit;
      if (amount === 0) return;

      // Find the "other side" to categorize
      const otherLine = entryLines.find(l => !cashAccountIds.has(l.accountId));
      const otherAccount = otherLine ? accounts.find(a => a.id === otherLine.accountId) : null;
      
      let category: 'operating' | 'investing' | 'financing' = 'operating';
      
      if (otherAccount) {
        const code = parseInt(otherAccount.code);
        if (otherAccount.type === 'Revenue' || otherAccount.type === 'Expense') {
          category = 'operating';
        } else if (otherAccount.type === 'Asset' && code >= 1500) {
          category = 'investing';
        } else if (otherAccount.type === 'Liability' && code >= 2500) {
          category = 'financing';
        } else if (otherAccount.type === 'Equity') {
          category = 'financing';
        }
      }

      const item = {
        date: entry.date,
        description: entry.description || cashLine.description,
        amount: Math.abs(amount),
        type: amount > 0 ? 'Inflow' : 'Outflow'
      };

      if (amount > 0) {
        categories[category].inflows += amount;
      } else {
        categories[category].outflows += Math.abs(amount);
      }
      categories[category].items.push(item);
    });

    const totalInflows = categories.operating.inflows + categories.investing.inflows + categories.financing.inflows;
    const totalOutflows = categories.operating.outflows + categories.investing.outflows + categories.financing.outflows;
    const netCashFlow = totalInflows - totalOutflows;
    const closingBalance = openingBalance + netCashFlow;

    const chartData = [
      { name: 'Operating', inflow: categories.operating.inflows, outflow: categories.operating.outflows },
      { name: 'Investing', inflow: categories.investing.inflows, outflow: categories.investing.outflows },
      { name: 'Financing', inflow: categories.financing.inflows, outflow: categories.financing.outflows }
    ];

    return { 
      openingBalance, 
      categories, 
      totalInflows, 
      totalOutflows, 
      netCashFlow, 
      closingBalance,
      chartData
    };
  }, [accounts, journalEntries, journalLines, startDate, endDate]);

  const exportToCSV = () => {
    const data: any[] = [];
    data.push(['Statement of Cash Flows', '', `${startDate} to ${endDate}`]);
    data.push([]);
    data.push(['Opening Cash Balance', '', report.openingBalance]);
    data.push([]);

    ['operating', 'investing', 'financing'].forEach(cat => {
      data.push([cat.toUpperCase() + ' ACTIVITIES']);
      report.categories[cat as keyof typeof report.categories].items.forEach(item => {
        data.push(['', item.date, item.description, item.type === 'Inflow' ? item.amount : -item.amount]);
      });
      data.push(['', `Net Cash from ${cat}`, report.categories[cat as keyof typeof report.categories].inflows - report.categories[cat as keyof typeof report.categories].outflows]);
      data.push([]);
    });

    data.push(['NET CASH FLOW', '', report.netCashFlow]);
    data.push(['CLOSING CASH BALANCE', '', report.closingBalance]);

    const ws = XLSX.utils.aoa_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Cash Flow');
    XLSX.writeFile(wb, `Cash_Flow_${startDate}_${endDate}.xlsx`);
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    doc.setFontSize(20);
    doc.text('Statement of Cash Flows', pageWidth / 2, 20, { align: 'center' });
    doc.setFontSize(12);
    doc.text(`${startDate} to ${endDate}`, pageWidth / 2, 30, { align: 'center' });

    const tableData: any[] = [];
    tableData.push([{ content: 'Opening Cash Balance', styles: { fontStyle: 'bold' } }, formatCurrency(report.openingBalance)]);

    ['operating', 'investing', 'financing'].forEach(cat => {
      tableData.push([{ content: `${cat.toUpperCase()} ACTIVITIES`, colSpan: 2, styles: { fillColor: [240, 240, 240], fontStyle: 'bold' } }]);
      report.categories[cat as keyof typeof report.categories].items.forEach(item => {
        tableData.push([
          { content: `${item.date} - ${item.description}`, styles: { indent: 5 } }, 
          item.type === 'Inflow' ? formatCurrency(item.amount) : `(${formatCurrency(item.amount)})`
        ]);
      });
      const net = report.categories[cat as keyof typeof report.categories].inflows - report.categories[cat as keyof typeof report.categories].outflows;
      tableData.push([{ content: `Net Cash from ${cat}`, styles: { fontStyle: 'bold', indent: 5 } }, formatCurrency(net)]);
    });

    tableData.push([{ content: 'NET CASH FLOW', styles: { fontStyle: 'bold', fillColor: [230, 230, 230] } }, formatCurrency(report.netCashFlow)]);
    tableData.push([{ content: 'CLOSING CASH BALANCE', styles: { fontStyle: 'bold', fillColor: [220, 220, 220] } }, formatCurrency(report.closingBalance)]);

    autoTable(doc, {
      head: [['Description', 'Amount']],
      body: tableData,
      startY: 40,
      theme: 'plain',
      styles: { fontSize: 9 },
      columnStyles: { 1: { halign: 'right' } }
    });

    doc.save(`Cash_Flow_${startDate}_${endDate}.pdf`);
  };

  const SummaryCard = ({ title, amount, icon: Icon, colorClass }: any) => (
    <div className={`p-6 rounded-2xl border shadow-sm ${isDark ? 'bg-[#2A2A3D] border-white/5' : 'bg-white border-slate-200'}`}>
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-xl ${colorClass} bg-opacity-10`}>
          <Icon size={24} className={colorClass.replace('bg-', 'text-')} />
        </div>
      </div>
      <p className={`text-xs font-black uppercase tracking-widest ${isDark ? 'text-[#B0B0C3]' : 'text-slate-500'}`}>
        {title}
      </p>
      <h3 className={`text-2xl font-mono font-black mt-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>
        {formatCurrency(amount)}
      </h3>
    </div>
  );

  return (
    <AccountingLayout>
      <div className="space-y-6 max-w-6xl mx-auto pb-12">
        {/* Header & Filters */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className={`text-3xl font-black uppercase tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Cash Flow Statement
            </h1>
            <p className={`text-sm mt-1 ${isDark ? 'text-[#B0B0C3]' : 'text-slate-500'}`}>
              Tracking liquidity and cash movements
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className={`flex items-center gap-2 px-3 py-2 rounded-xl border ${
              isDark ? 'bg-[#2A2A3D] border-white/10' : 'bg-white border-slate-200'
            }`}>
              <Calendar size={16} className={isDark ? 'text-[#00FFCC]' : 'text-indigo-600'} />
              <div className="flex items-center gap-2 text-sm">
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className={`bg-transparent border-none focus:ring-0 p-0 w-32 ${isDark ? 'text-white' : 'text-slate-900'}`}
                />
                <span className="opacity-30">to</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className={`bg-transparent border-none focus:ring-0 p-0 w-32 ${isDark ? 'text-white' : 'text-slate-900'}`}
                />
              </div>
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

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <SummaryCard 
            title="Opening Cash" 
            amount={report.openingBalance} 
            icon={Wallet} 
            colorClass="text-indigo-500 bg-indigo-500" 
          />
          <SummaryCard 
            title="Total Inflows" 
            amount={report.totalInflows} 
            icon={TrendingUp} 
            colorClass="text-emerald-500 bg-emerald-500" 
          />
          <SummaryCard 
            title="Total Outflows" 
            amount={report.totalOutflows} 
            icon={TrendingDown} 
            colorClass="text-rose-500 bg-rose-500" 
          />
          <SummaryCard 
            title="Closing Cash" 
            amount={report.closingBalance} 
            icon={Wallet} 
            colorClass="text-[#00FFCC] bg-[#00FFCC]" 
          />
        </div>

        {/* Charts Section */}
        <div className={`p-6 rounded-2xl border shadow-sm ${isDark ? 'bg-[#2A2A3D] border-white/5' : 'bg-white border-slate-200'}`}>
          <div className="flex items-center gap-2 mb-6">
            <BarChartIcon size={20} className={isDark ? 'text-[#00FFCC]' : 'text-indigo-600'} />
            <h2 className={`text-lg font-black uppercase tracking-widest ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Cash Flow Analysis
            </h2>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={report.chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#ffffff10' : '#00000010'} vertical={false} />
                <XAxis 
                  dataKey="name" 
                  stroke={isDark ? '#B0B0C3' : '#64748b'} 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false}
                />
                <YAxis 
                  stroke={isDark ? '#B0B0C3' : '#64748b'} 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false}
                  tickFormatter={(value) => formatCurrency(value)}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: isDark ? '#1F1F2E' : '#ffffff',
                    borderColor: isDark ? '#ffffff10' : '#e2e8f0',
                    borderRadius: '12px',
                    color: isDark ? '#ffffff' : '#000000'
                  }}
                />
                <Legend />
                <Bar dataKey="inflow" name="Inflow" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="outflow" name="Outflow" fill="#f43f5e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Detailed Breakdown */}
        <div className={`rounded-2xl border overflow-hidden shadow-sm ${isDark ? 'bg-[#2A2A3D] border-white/5' : 'bg-white border-slate-200'}`}>
          {['operating', 'investing', 'financing'].map((cat) => (
            <div key={cat} className="border-b border-white/5 last:border-none">
              <div 
                onClick={() => toggleSection(cat)}
                className={`flex justify-between items-center p-4 cursor-pointer transition-colors ${
                  isDark ? 'hover:bg-white/5' : 'hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  {expandedSections[cat] ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                  <h3 className={`text-sm font-black uppercase tracking-widest ${
                    cat === 'operating' ? (isDark ? 'text-emerald-400' : 'text-emerald-600') :
                    cat === 'investing' ? (isDark ? 'text-amber-400' : 'text-amber-600') :
                    (isDark ? 'text-indigo-400' : 'text-indigo-600')
                  }`}>
                    {cat} Activities
                  </h3>
                </div>
                <span className={`text-sm font-mono font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  {formatCurrency(report.categories[cat as keyof typeof report.categories].inflows - report.categories[cat as keyof typeof report.categories].outflows)}
                </span>
              </div>

              {expandedSections[cat] && (
                <div className={`pb-4 ${isDark ? 'bg-white/2' : 'bg-slate-50/50'}`}>
                  {report.categories[cat as keyof typeof report.categories].items.length === 0 ? (
                    <p className="px-12 py-4 text-xs italic opacity-50">No transactions in this category.</p>
                  ) : (
                    <div className="space-y-1">
                      {report.categories[cat as keyof typeof report.categories].items.map((item, i) => (
                        <div key={i} className="flex justify-between items-center py-2 px-12">
                          <div className="flex flex-col">
                            <span className={`text-sm ${isDark ? 'text-white' : 'text-slate-700'}`}>{item.description}</span>
                            <span className="text-[10px] uppercase tracking-tighter opacity-40">{item.date}</span>
                          </div>
                          <span className={`text-sm font-mono ${item.type === 'Inflow' ? 'text-emerald-500' : 'text-rose-500'}`}>
                            {item.type === 'Inflow' ? '+' : '-'}{formatCurrency(item.amount)}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}

          {/* Final Summary Row */}
          <div className={`p-6 flex flex-col md:flex-row justify-between items-center gap-4 ${isDark ? 'bg-white/5' : 'bg-slate-50'}`}>
            <div className="text-center md:text-left">
              <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Net Cash Flow</p>
              <p className={`text-2xl font-mono font-black ${report.netCashFlow >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                {formatCurrency(report.netCashFlow)}
              </p>
            </div>
            <div className="text-center md:text-right">
              <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Closing Balance</p>
              <p className={`text-2xl font-mono font-black ${isDark ? 'text-[#00FFCC]' : 'text-indigo-600'}`}>
                {formatCurrency(report.closingBalance)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </AccountingLayout>
  );
}
