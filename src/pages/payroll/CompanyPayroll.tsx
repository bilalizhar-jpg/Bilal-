import React, { useState, useEffect} from 'react';
import { Search, Download, FileText, Printer, Filter} from 'lucide-react';
import AdminLayout from '../../components/AdminLayout';
import { useSettings} from '../../context/SettingsContext';
import { useCompanyData} from '../../context/CompanyDataContext';
import { useEmployees} from '../../context/EmployeeContext';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

interface CompanyPayrollRecord {
 id: string;
 month: string;
 department: string;
 totalAmount: number;
 status: 'Paid' | 'Pending';
 generatedDate: string;
}

export default function CompanyPayroll() {
 const { payrollBatches, salaryRecords, departments} = useCompanyData();
 const { employees} = useEmployees();
 const [filteredPayrolls, setFilteredPayrolls] = useState<CompanyPayrollRecord[]>([]);
 const [startDate, setStartDate] = useState('2026-01-01');
 const [endDate, setEndDate] = useState('2026-12-31');
 const [selectedDepartment, setSelectedDepartment] = useState('All');
 const settings = useSettings();
 
 const [allPayrolls, setAllPayrolls] = useState<CompanyPayrollRecord[]>([]);

 useEffect(() => {
 // Aggregate salary records by month and department
 const aggregated: { [key: string]: CompanyPayrollRecord} = {};

 salaryRecords.forEach((record: any) => {
 const employee = employees.find(e => e.id === record.employeeId);
 const department = employee?.department || 'Unassigned';
 const batch = payrollBatches.find((b: any) => b.id === record.batchId);
 
 if (!batch) return;

 const key =`${batch.salaryName}-${department}`;

 if (!aggregated[key]) {
 aggregated[key] = {
 id: key,
 month: batch.salaryName,
 department: department,
 totalAmount: 0,
 status: batch.status === 'Approved' ? 'Paid' : 'Pending', // Simplified status mapping
 generatedDate: batch.generateDate
};
}

 aggregated[key].totalAmount += (record.netSalary || 0);
});

 const result = Object.values(aggregated);
 setAllPayrolls(result);
 setFilteredPayrolls(result);
}, [salaryRecords, payrollBatches, employees]);

 const handleFind = () => {
 let result = allPayrolls;
 if (selectedDepartment !== 'All') {
 result = result.filter(p => p.department === selectedDepartment);
}
 // Simple date filtering (assuming generatedDate is YYYY-MM-DD)
 result = result.filter(p => p.generatedDate >= startDate && p.generatedDate <= endDate);
 setFilteredPayrolls(result);
};

 const handleDownload = (format: string) => {
 if (format === 'Excel') {
 const worksheet = XLSX.utils.json_to_sheet(filteredPayrolls.map(p => ({
 Month: p.month,
 Department: p.department,
 'Total Amount': p.totalAmount,
 Status: p.status,
 'Generated Date': p.generatedDate
})));
 const workbook = XLSX.utils.book_new();
 XLSX.utils.book_append_sheet(workbook, worksheet,"Payroll");
 XLSX.writeFile(workbook,`Company_Payroll_${startDate}_to_${endDate}.xlsx`);
} else if (format === 'PDF') {
 const doc = new jsPDF();
 doc.text('Company Payroll Report', 14, 15);
 doc.setFontSize(10);
 doc.text(`Date Range: ${startDate} to ${endDate}`, 14, 22);
 doc.text(`Department: ${selectedDepartment}`, 14, 28);
 
 const tableColumn = ["Month","Department","Total Amount","Status","Generated Date"];
 const tableRows = filteredPayrolls.map(p => [
 p.month,
 p.department,
 settings.formatCurrency(p.totalAmount),
 p.status,
 p.generatedDate
 ]);

 (doc as any).autoTable({
 head: [tableColumn],
 body: tableRows,
 startY: 35,
});
 
 doc.save(`Company_Payroll_${startDate}_to_${endDate}.pdf`);
}
};

 return (
 <AdminLayout>
 <div className="space-y-6">
 {/* Filter Card */}
 <div className={`rounded-xl border bg-white border-slate-200 shadow-sm overflow-hidden`}>
 <div className="p-4 border-b border-slate-100 flex justify-between items-center">
 <h2 className="font-bold text-slate-800">Company Payroll Report</h2>
 <button 
 onClick={handleFind}
 className="bg-[#28A745] text-white px-3 py-1.5 rounded text-xs font-bold flex items-center gap-1.5 hover:bg-[#218838]"
 >
 <Filter className="w-3.5 h-3.5"/>
 Filter
 </button>
 </div>
 <div className="p-6 grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
 <div>
 <label className="text-xs font-bold text-slate-500">Start Date</label>
 <input 
 type="date"
 value={startDate}
 onChange={(e) => setStartDate(e.target.value)}
 className={`mt-1 w-full border rounded px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-indigo-500 bg-white border-slate-200`}
 />
 </div>
 <div>
 <label className="text-xs font-bold text-slate-500">End Date</label>
 <input 
 type="date"
 value={endDate}
 onChange={(e) => setEndDate(e.target.value)}
 className={`mt-1 w-full border rounded px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-indigo-500 bg-white border-slate-200`}
 />
 </div>
 <div>
 <label className="text-xs font-bold text-slate-500">Department</label>
 <select 
 value={selectedDepartment}
 onChange={(e) => setSelectedDepartment(e.target.value)}
 className={`mt-1 w-full border rounded px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-indigo-500 bg-white border-slate-200`}
 >
 <option value="All">All</option>
 {departments.map(dep => <option key={dep.id} value={dep.name}>{dep.name}</option>)}
 </select>
 </div>
 <button 
 onClick={handleFind}
 className="bg-indigo-600 text-white px-6 py-2 rounded text-sm font-bold hover:bg-indigo-700 h-10"
 >
 Find
 </button>
 </div>
 </div>

 {/* Table Card */}
 <div className={`rounded-xl border bg-white border-slate-200 shadow-sm overflow-hidden`}>
 <div className="p-4 border-b border-slate-100 flex justify-between items-center">
 <h3 className="font-bold text-slate-700">Payroll List</h3>
 <div className="flex gap-2">
 <button onClick={() => handleDownload('Excel')} className="bg-[#28A745] text-white px-3 py-1.5 rounded text-xs font-bold flex items-center gap-1.5 hover:bg-[#218838]">
 <Download className="w-3.5 h-3.5"/>
 Excel
 </button>
 <button onClick={() => handleDownload('PDF')} className="bg-red-600 text-white px-3 py-1.5 rounded text-xs font-bold flex items-center gap-1.5 hover:bg-red-700">
 <FileText className="w-3.5 h-3.5"/>
 PDF
 </button>
 <button onClick={() => window.print()} className="bg-slate-600 text-white px-3 py-1.5 rounded text-xs font-bold flex items-center gap-1.5 hover:bg-slate-700">
 <Printer className="w-3.5 h-3.5"/>
 Print
 </button>
 </div>
 </div>
 <div className="p-6">
 <div className="overflow-x-auto border border-slate-100 rounded-lg">
 <table className="w-full text-left border-collapse">
 <thead>
 <tr className={`bg-slate-50 border-b border-slate-100`}>
 <th className="px-4 py-3 text-xs font-bold text-slate-600 uppercase">Month</th>
 <th className="px-4 py-3 text-xs font-bold text-slate-600 uppercase">Department</th>
 <th className="px-4 py-3 text-xs font-bold text-slate-600 uppercase">Total Amount</th>
 <th className="px-4 py-3 text-xs font-bold text-slate-600 uppercase">Status</th>
 <th className="px-4 py-3 text-xs font-bold text-slate-600 uppercase">Generated Date</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-slate-100">
 {filteredPayrolls.map((payroll) => (
 <tr key={payroll.id} className="hover:bg-slate-50/50 transition-colors">
 <td className="px-4 py-3 text-sm font-medium text-slate-800">{payroll.month}</td>
 <td className="px-4 py-3 text-sm text-slate-600">{payroll.department}</td>
 <td className="px-4 py-3 text-sm text-slate-600 font-mono">{settings.formatCurrency(payroll.totalAmount)}</td>
 <td className="px-4 py-3 text-sm">
 <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${
 payroll.status === 'Paid' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'
}`}>
 {payroll.status}
 </span>
 </td>
 <td className="px-4 py-3 text-sm text-slate-600">{payroll.generatedDate}</td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 </div>
 </div>
 </div>
 </AdminLayout>
 );
}
