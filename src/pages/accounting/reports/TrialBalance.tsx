import React, { useMemo, useState} from 'react';
import AccountingLayout from '../../../components/accounting/AccountingLayout';
import { useAccounting} from '../../../context/AccountingContext';
import { useSettings} from '../../../context/SettingsContext';
import { Search, Download, FileText, AlertCircle, Calendar, Filter} from 'lucide-react';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

export default function TrialBalance() {
  const { formatCurrency} = useSettings();
 const { accounts, journalLines, journalEntries} = useAccounting();
 
 const [searchTerm, setSearchTerm] = useState('');
 const [startDate, setStartDate] = useState('');
 const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);

 const trialBalance = useMemo(() => {
 // Map journal entries for quick date lookup
 const entryDates = new Map(journalEntries.map(e => [e.id, e.date]));

 const balances = accounts.map(account => {
 let debit = 0;
 let credit = 0;
 
 // Calculate opening balance effect (everything before startDate)
 if (startDate) {
 const linesBefore = journalLines.filter(l => {
 if (l.accountId !== account.id) return false;
 const date = entryDates.get(l.journalEntryId);
 return date && date < startDate;
});
 
 linesBefore.forEach(line => {
 debit += (line.debit || 0);
 credit += (line.credit || 0);
});
}

 // Add account's initial opening balance
 const isDebitNormal = account.type === 'Asset' || account.type === 'Expense';
 if (isDebitNormal) {
 debit += (account.openingBalance || 0);
} else {
 credit += (account.openingBalance || 0);
}

 // Calculate activity in range
 const linesInRange = journalLines.filter(l => {
 if (l.accountId !== account.id) return false;
 const date = entryDates.get(l.journalEntryId);
 if (!date) return false;
 
 const afterStart = !startDate || date >= startDate;
 const beforeEnd = !endDate || date <= endDate;
 return afterStart && beforeEnd;
});

 linesInRange.forEach(line => {
 debit += (line.debit || 0);
 credit += (line.credit || 0);
});

 // For a standard Trial Balance, we show the NET balance in either Debit or Credit
 const netBalance = debit - credit;
 
 return {
 ...account,
 totalDebit: netBalance > 0 ? netBalance : 0,
 totalCredit: netBalance < 0 ? Math.abs(netBalance) : 0,
 rawDebit: debit, // Keep raw values if needed
 rawCredit: credit
};
}).filter(a => {
 const matchesSearch = a.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
 a.code.toLowerCase().includes(searchTerm.toLowerCase());
 const hasBalance = a.totalDebit > 0 || a.totalCredit > 0;
 return matchesSearch && hasBalance;
});

 balances.sort((a, b) => a.code.localeCompare(b.code));
 return balances;
}, [accounts, journalLines, journalEntries, searchTerm, startDate, endDate]);

 const totalDebit = trialBalance.reduce((sum, a) => sum + a.totalDebit, 0);
 const totalCredit = trialBalance.reduce((sum, a) => sum + a.totalCredit, 0);
 const isBalanced = Math.abs(totalDebit - totalCredit) < 0.01;

 const exportToCSV = () => {
 const data = trialBalance.map(a => ({
 'Account Code': a.code,
 'Account Name': a.name,
 'Debit': a.totalDebit,
 'Credit': a.totalCredit
}));
 
 const ws = XLSX.utils.json_to_sheet(data);
 const wb = XLSX.utils.book_new();
 XLSX.utils.book_append_sheet(wb, ws, 'Trial Balance');
 XLSX.writeFile(wb,`Trial_Balance_${endDate || 'all'}.xlsx`);
};

 const exportToPDF = () => {
 const doc = new jsPDF();
 doc.setFontSize(18);
 doc.text('Trial Balance', 14, 22);
 doc.setFontSize(11);
 doc.text(`Period: ${startDate || 'Beginning'} to ${endDate || 'Present'}`, 14, 30);
 
 const tableData = trialBalance.map(a => [
 a.code,
 a.name,
 formatCurrency(a.totalDebit),
 formatCurrency(a.totalCredit)
 ]);

 (doc as any).autoTable({
 startY: 40,
 head: [['Code', 'Account Name', 'Debit', 'Credit']],
 body: tableData,
 foot: [['', 'Total', formatCurrency(totalDebit), formatCurrency(totalCredit)]],
 theme: 'grid',
 headStyles: { fillColor: [79, 70, 229]},
 footStyles: { fillColor: [243, 244, 246], textColor: [0, 0, 0], fontStyle: 'bold'}
});

 doc.save(`Trial_Balance_${endDate || 'all'}.pdf`);
};

 return (
 <AccountingLayout>
 <div className="space-y-6">
 <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
 <div>
 <h1 className={`text-2xl font-black uppercase tracking-tight text-slate-900`}>
 Trial Balance
 </h1>
 <p className={`text-sm text-slate-500`}>
 Verification of debit and credit equality
 </p>
 </div>
 <div className="flex items-center gap-2">
 <button
 onClick={exportToCSV}
 className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'
}`}
 >
 <Download className="w-4 h-4"/>
 Excel
 </button>
 <button
 onClick={exportToPDF}
 className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold bg-indigo-600 text-white hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/20"
 >
 <FileText className="w-4 h-4"/>
 PDF
 </button>
 </div>
 </div>

 {/* Filters */}
 <div className={`p-4 rounded-2xl border bg-white border-slate-200 flex flex-wrap items-center gap-4`}>
 <div className="flex-1 min-w-[200px] relative">
 <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400`} />
 <input
 type="text"
 placeholder="Search accounts..."
 value={searchTerm}
 onChange={(e) => setSearchTerm(e.target.value)}
 className={`w-full pl-10 pr-4 py-2 rounded-xl text-sm border transition-all outline-none ${
 'bg-slate-50 border-slate-200 text-slate-900 focus:border-indigo-500'
}`}
 />
 </div>
 <div className="flex items-center gap-2">
 <Calendar className={`w-4 h-4 text-slate-400`} />
 <input
 type="date"
 value={startDate}
 onChange={(e) => setStartDate(e.target.value)}
 className={`px-3 py-2 rounded-xl text-sm border outline-none ${
 'bg-slate-50 border-slate-200 text-slate-900'
}`}
 />
 <span className={'text-slate-400'}>to</span>
 <input
 type="date"
 value={endDate}
 onChange={(e) => setEndDate(e.target.value)}
 className={`px-3 py-2 rounded-xl text-sm border outline-none ${
 'bg-slate-50 border-slate-200 text-slate-900'
}`}
 />
 </div>
 </div>

 {!isBalanced && (
 <div className="flex items-center gap-3 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500">
 <AlertCircle className="w-5 h-5 flex-shrink-0"/>
 <div>
 <p className="text-sm font-bold">Trial Balance is not balanced!</p>
 <p className="text-xs opacity-80">Difference: {formatCurrency(Math.abs(totalDebit - totalCredit))}</p>
 </div>
 </div>
 )}

 <div className={`rounded-2xl border overflow-hidden bg-white border-slate-200`}>
 <div className="overflow-x-auto">
 <table className="w-full text-left border-collapse">
 <thead>
 <tr className={`border-b border-slate-200`}>
 <th className={`py-4 px-6 text-xs font-black uppercase tracking-widest text-slate-500`}>Code</th>
 <th className={`py-4 px-6 text-xs font-black uppercase tracking-widest text-slate-500`}>Account Name</th>
 <th className={`py-4 px-6 text-xs font-black uppercase tracking-widest text-right text-slate-500`}>Debit</th>
 <th className={`py-4 px-6 text-xs font-black uppercase tracking-widest text-right text-slate-500`}>Credit</th>
 </tr>
 </thead>
 <tbody>
 {trialBalance.length === 0 ? (
 <tr>
 <td colSpan={4} className={`py-12 text-center text-sm text-slate-500`}>
 No account balances found for the selected criteria.
 </td>
 </tr>
 ) : (
 trialBalance.map((account) => (
 <tr key={account.id} className={`border-b transition-colors border-slate-100 hover:bg-slate-50`}>
 <td className={`py-4 px-6 text-sm font-mono text-slate-900`}>{account.code}</td>
 <td className={`py-4 px-6 text-sm font-medium text-slate-900`}>{account.name}</td>
 <td className={`py-4 px-6 text-sm font-mono text-right text-emerald-600`}>
 {account.totalDebit > 0 ? formatCurrency(account.totalDebit) : '-'}
 </td>
 <td className={`py-4 px-6 text-sm font-mono text-right text-rose-600`}>
 {account.totalCredit > 0 ? formatCurrency(account.totalCredit) : '-'}
 </td>
 </tr>
 ))
 )}
 </tbody>
 <tfoot>
 <tr className={`bg-slate-50/50 bg-slate-50`}>
 <td colSpan={2} className={`py-6 px-6 text-sm font-black uppercase tracking-widest text-right text-slate-900`}>
 Total
 </td>
 <td className={`py-6 px-6 text-sm font-mono font-black text-right text-indigo-600`}>
 {formatCurrency(totalDebit)}
 </td>
 <td className={`py-6 px-6 text-sm font-mono font-black text-right text-indigo-600`}>
 {formatCurrency(totalCredit)}
 </td>
 </tr>
 </tfoot>
 </table>
 </div>
 </div>
 </div>
 </AccountingLayout>
 );
}
