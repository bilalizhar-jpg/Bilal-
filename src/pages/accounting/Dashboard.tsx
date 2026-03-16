import React, { useMemo } from 'react';
import AccountingLayout from '../../components/accounting/AccountingLayout';
import { motion } from 'motion/react';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  ArrowUpRight, 
  ArrowDownRight,
  Wallet,
  FileText,
  CreditCard,
  BarChart3,
  PieChart as PieChartIcon,
  Calendar
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useAccounting } from '../../context/AccountingContext';
import { useInvoice } from '../../context/InvoiceContext';
import { useExpense } from '../../context/ExpenseContext';
import { usePayment } from '../../context/PaymentContext';
import { useSettings } from '../../context/SettingsContext';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  Legend
} from 'recharts';

export default function AccountingDashboard() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const { formatCurrency } = useSettings();
  const { accounts, journalLines, journalEntries } = useAccounting();
  const { invoices } = useInvoice();
  const { expenses } = useExpense();
  const { payments } = usePayment();

  const stats = useMemo(() => {
    const totalRevenue = accounts
      .filter(a => a.type === 'Revenue')
      .reduce((sum, a) => sum + a.currentBalance, 0);

    const totalExpenses = accounts
      .filter(a => a.type === 'Expense')
      .reduce((sum, a) => sum + a.currentBalance, 0);

    const netProfit = totalRevenue - totalExpenses;

    const cashBalance = accounts
      .filter(a => a.type === 'Asset' && (a.name.toLowerCase().includes('cash') || a.name.toLowerCase().includes('bank')))
      .reduce((sum, a) => sum + a.currentBalance, 0);

    const accountsReceivable = accounts
      .filter(a => a.type === 'Asset' && (a.name.toLowerCase().includes('receivable') || a.code.startsWith('1200')))
      .reduce((sum, a) => sum + a.currentBalance, 0);

    const accountsPayable = accounts
      .filter(a => a.type === 'Liability' && (a.name.toLowerCase().includes('payable') || a.code.startsWith('2100')))
      .reduce((sum, a) => sum + a.currentBalance, 0);

    return {
      totalRevenue,
      totalExpenses,
      netProfit,
      cashBalance,
      accountsReceivable,
      accountsPayable
    };
  }, [accounts]);

  const chartData = useMemo(() => {
    // Group by month for the last 6 months
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      months.push(d.toLocaleString('default', { month: 'short' }));
    }

    const revenueVsExpenses = months.map(month => ({
      name: month,
      revenue: 0,
      expenses: 0
    }));

    const cashFlow = months.map(month => ({
      name: month,
      inflow: 0,
      outflow: 0,
      net: 0
    }));

    const monthlySales = months.map(month => ({
      name: month,
      sales: 0
    }));

    // Process Journal Lines for Revenue vs Expenses and Cash Flow
    journalEntries.forEach(entry => {
      const entryDate = new Date(entry.date);
      const monthName = entryDate.toLocaleString('default', { month: 'short' });
      const monthIdx = months.indexOf(monthName);
      
      if (monthIdx !== -1) {
        const lines = journalLines.filter(l => l.journalEntryId === entry.id);
        lines.forEach(line => {
          const account = accounts.find(a => a.id === line.accountId);
          if (!account) return;

          if (account.type === 'Revenue') {
            revenueVsExpenses[monthIdx].revenue += (line.credit - line.debit);
          } else if (account.type === 'Expense') {
            revenueVsExpenses[monthIdx].expenses += (line.debit - line.credit);
          }

          if (account.type === 'Asset' && (account.name.toLowerCase().includes('cash') || account.name.toLowerCase().includes('bank'))) {
            if (line.debit > 0) cashFlow[monthIdx].inflow += line.debit;
            if (line.credit > 0) cashFlow[monthIdx].outflow += line.credit;
            cashFlow[monthIdx].net += (line.debit - line.credit);
          }
        });
      }
    });

    // Process Invoices for Monthly Sales
    invoices.forEach(inv => {
      const invDate = new Date(inv.date);
      const monthName = invDate.toLocaleString('default', { month: 'short' });
      const monthIdx = months.indexOf(monthName);
      if (monthIdx !== -1) {
        monthlySales[monthIdx].sales += inv.totalAmount;
      }
    });

    return { revenueVsExpenses, cashFlow, monthlySales };
  }, [journalEntries, journalLines, accounts, invoices]);

  const metrics = [
    { title: 'Total Revenue', amount: formatCurrency(stats.totalRevenue), icon: TrendingUp, color: 'text-emerald-500', bgColor: 'bg-emerald-500/10' },
    { title: 'Total Expenses', amount: formatCurrency(stats.totalExpenses), icon: TrendingDown, color: 'text-rose-500', bgColor: 'bg-rose-500/10' },
    { title: 'Net Profit', amount: formatCurrency(stats.netProfit), icon: DollarSign, color: 'text-[#00FFCC]', bgColor: 'bg-[#00FFCC]/10' },
    { title: 'Cash Balance', amount: formatCurrency(stats.cashBalance), icon: Wallet, color: 'text-indigo-500', bgColor: 'bg-indigo-500/10' },
    { title: 'Accounts Receivable', amount: formatCurrency(stats.accountsReceivable), icon: FileText, color: 'text-amber-500', bgColor: 'bg-amber-500/10' },
    { title: 'Accounts Payable', amount: formatCurrency(stats.accountsPayable), icon: CreditCard, color: 'text-purple-500', bgColor: 'bg-purple-500/10' },
  ];

  return (
    <AccountingLayout>
      <div className="space-y-6 max-w-7xl mx-auto pb-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className={`text-3xl font-black uppercase tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Financial Dashboard
            </h1>
            <p className={`text-sm ${isDark ? 'text-[#B0B0C3]' : 'text-slate-500'}`}>
              Real-time financial performance overview
            </p>
          </div>
          <div className="flex gap-2">
            <button className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm uppercase tracking-widest transition-all ${
              isDark 
                ? 'bg-[#00FFCC] text-[#1E1E2F] hover:bg-[#00E6B8]' 
                : 'bg-indigo-600 text-white hover:bg-indigo-700'
            }`}>
              <Calendar size={16} />
              Last 6 Months
            </button>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {metrics.map((metric, index) => {
            const Icon = metric.icon;
            return (
              <motion.div
                key={metric.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`p-5 rounded-2xl border ${
                  isDark 
                    ? 'bg-[#2A2A3D] border-white/5 shadow-sm' 
                    : 'bg-white border-slate-200 shadow-sm'
                }`}
              >
                <div className={`p-2 w-fit rounded-lg mb-3 ${metric.bgColor}`}>
                  <Icon className={`w-5 h-5 ${metric.color}`} />
                </div>
                <h3 className={`text-[10px] font-black uppercase tracking-widest mb-1 ${isDark ? 'text-[#B0B0C3]' : 'text-slate-500'}`}>
                  {metric.title}
                </h3>
                <p className={`text-lg font-black font-mono ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  {metric.amount}
                </p>
              </motion.div>
            );
          })}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Revenue vs Expenses */}
          <div className={`p-6 rounded-2xl border ${isDark ? 'bg-[#2A2A3D] border-white/5' : 'bg-white border-slate-200'}`}>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <BarChart3 size={18} className={isDark ? 'text-[#00FFCC]' : 'text-indigo-600'} />
                <h2 className={`text-sm font-black uppercase tracking-widest ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Revenue vs Expenses
                </h2>
              </div>
            </div>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData.revenueVsExpenses}>
                  <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#ffffff10' : '#00000010'} vertical={false} />
                  <XAxis dataKey="name" stroke={isDark ? '#B0B0C3' : '#64748b'} fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke={isDark ? '#B0B0C3' : '#64748b'} fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => formatCurrency(v)} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: isDark ? '#1F1F2E' : '#fff', borderColor: isDark ? '#ffffff10' : '#e2e8f0', borderRadius: '12px' }}
                    itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                  />
                  <Legend />
                  <Bar dataKey="revenue" name="Revenue" fill="#10b981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="expenses" name="Expenses" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Cash Flow */}
          <div className={`p-6 rounded-2xl border ${isDark ? 'bg-[#2A2A3D] border-white/5' : 'bg-white border-slate-200'}`}>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Activity size={18} className={isDark ? 'text-[#00FFCC]' : 'text-indigo-600'} />
                <h2 className={`text-sm font-black uppercase tracking-widest ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Net Cash Flow
                </h2>
              </div>
            </div>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData.cashFlow}>
                  <defs>
                    <linearGradient id="colorNet" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#ffffff10' : '#00000010'} vertical={false} />
                  <XAxis dataKey="name" stroke={isDark ? '#B0B0C3' : '#64748b'} fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke={isDark ? '#B0B0C3' : '#64748b'} fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => formatCurrency(v)} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: isDark ? '#1F1F2E' : '#fff', borderColor: isDark ? '#ffffff10' : '#e2e8f0', borderRadius: '12px' }}
                  />
                  <Area type="monotone" dataKey="net" name="Net Cash" stroke="#6366f1" fillOpacity={1} fill="url(#colorNet)" strokeWidth={3} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Monthly Sales */}
          <div className={`p-6 rounded-2xl border lg:col-span-2 ${isDark ? 'bg-[#2A2A3D] border-white/5' : 'bg-white border-slate-200'}`}>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <TrendingUp size={18} className={isDark ? 'text-[#00FFCC]' : 'text-indigo-600'} />
                <h2 className={`text-sm font-black uppercase tracking-widest ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Monthly Sales (Invoiced)
                </h2>
              </div>
            </div>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData.monthlySales}>
                  <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#ffffff10' : '#00000010'} vertical={false} />
                  <XAxis dataKey="name" stroke={isDark ? '#B0B0C3' : '#64748b'} fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke={isDark ? '#B0B0C3' : '#64748b'} fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => formatCurrency(v)} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: isDark ? '#1F1F2E' : '#fff', borderColor: isDark ? '#ffffff10' : '#e2e8f0', borderRadius: '12px' }}
                  />
                  <Line type="stepAfter" dataKey="sales" name="Sales Volume" stroke="#00FFCC" strokeWidth={4} dot={{ r: 6, fill: '#00FFCC', strokeWidth: 2, stroke: isDark ? '#1F1F2E' : '#fff' }} activeDot={{ r: 8 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </AccountingLayout>
  );
}
