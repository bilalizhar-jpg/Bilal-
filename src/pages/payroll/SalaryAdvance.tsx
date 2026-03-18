import React, { useState} from 'react';
import { motion, AnimatePresence} from 'motion/react';
import { Link} from 'react-router-dom';
import { 
 Plus, 
 Search, 
 Download, 
 FileText, 
 Edit, 
 Trash2, 
 X,
 CheckCircle2,
 XCircle
} from 'lucide-react';
import AdminLayout from '../../components/AdminLayout';
import { useSettings} from '../../context/SettingsContext';
import * as XLSX from 'xlsx';

interface SalaryAdvanceRecord {
 id: string;
 employeeName: string;
 amount: number;
 releaseAmount: number;
 salaryMonth: string;
 status: 'Active' | 'Inactive';
 approved: boolean;
}

const initialRecords: SalaryAdvanceRecord[] = [];

export default function SalaryAdvance() {
 const [records, setRecords] = useState<SalaryAdvanceRecord[]>(initialRecords);
 const [isModalOpen, setIsModalOpen] = useState(false);
 const [searchTerm, setSearchTerm] = useState('');
 const settings = useSettings();
 
 const [formData, setFormData] = useState({
 id: '',
 employee: '',
 amount: '',
 salaryMonth: '',
 isActive: 'Active',
 approved: false
});

 const handleAdd = (e: React.FormEvent) => {
 e.preventDefault();
 if (formData.id) {
 setRecords(records.map(r => r.id === formData.id ? {
 ...r,
 employeeName: formData.employee,
 amount: formData.amount ? parseFloat(formData.amount) : 0,
 salaryMonth: formData.salaryMonth,
 status: formData.isActive as 'Active' | 'Inactive',
 approved: formData.approved
} : r));
} else {
 const newRecord: SalaryAdvanceRecord = {
 id: Math.random().toString(36).substr(2, 9),
 employeeName: formData.employee,
 amount: formData.amount ? parseFloat(formData.amount) : 0,
 releaseAmount: 0,
 salaryMonth: formData.salaryMonth,
 status: formData.isActive as 'Active' | 'Inactive',
 approved: formData.approved
};
 setRecords([newRecord, ...records]);
}
 setIsModalOpen(false);
 setFormData({ id: '', employee: '', amount: '', salaryMonth: '', isActive: 'Active', approved: false});
};

 const handleEdit = (record: SalaryAdvanceRecord) => {
 setFormData({
 id: record.id,
 employee: record.employeeName,
 amount: record.amount.toString(),
 salaryMonth: record.salaryMonth,
 isActive: record.status,
 approved: record.approved
});
 setIsModalOpen(true);
};

 const handleDelete = (id: string) => {
 if (window.confirm('Are you sure you want to delete this record?')) {
 setRecords(records.filter(r => r.id !== id));
}
};

 const handleDownload = (format: 'CSV' | 'Excel') => {
 const dataToExport = records.map((r, idx) => ({
 'Sl': idx + 1,
 'Employee Name': r.employeeName,
 'Amount': r.amount,
 'Release Amount': r.releaseAmount,
 'Salary Month': r.salaryMonth,
 'Approved': r.approved ? 'Yes' : 'No',
 'Status': r.status
}));

 const worksheet = XLSX.utils.json_to_sheet(dataToExport);
 const workbook = XLSX.utils.book_new();
 XLSX.utils.book_append_sheet(workbook, worksheet,"Salary Advances");
 XLSX.writeFile(workbook,`Salary_Advances.${format === 'Excel' ? 'xlsx' : 'csv'}`);
};

 return (
 <AdminLayout>
 <div className="space-y-6">
 {/* Tabs */}
 <div className="flex items-center gap-2 mb-6">
 <Link 
 to="/payroll/salary-advance"
 className="px-4 py-2 rounded text-sm font-medium bg-[#28A745] text-white transition-colors"
 >
 Salary Advance
 </Link>
 <Link 
 to="/payroll/salary-generate"
 className="px-4 py-2 rounded text-sm font-medium bg-[#E9ECEF] text-slate-600 hover:bg-slate-200 transition-colors"
 >
 Salary Generate
 </Link>
 <Link 
 to="/payroll/manage-salary"
 className="px-4 py-2 rounded text-sm font-medium bg-[#E9ECEF] text-slate-600 hover:bg-slate-200 transition-colors"
 >
 Manage employee salary
 </Link>
 </div>

 {/* Main Card */}
 <div className={`rounded-xl border bg-white border-slate-200 shadow-sm overflow-hidden`}>
 <div className="p-4 border-b border-slate-100 flex justify-between items-center">
 <h2 className="font-bold text-slate-800">Salary advanced list</h2>
 <button 
 onClick={() => {
 setFormData({ id: '', employee: '', amount: '', salaryMonth: '', isActive: 'Active', approved: false});
 setIsModalOpen(true);
}}
 className="bg-[#28A745] text-white px-4 py-2 rounded text-sm font-bold flex items-center gap-2 hover:bg-[#218838]"
 >
 <Plus className="w-4 h-4"/>
 Add salary advance
 </button>
 </div>

 <div className="p-6 space-y-4">
 <div className="flex flex-wrap items-center justify-between gap-4">
 <div className="flex items-center gap-2">
 <span className="text-sm text-slate-500">Show</span>
 <select className={`border rounded px-2 py-1 text-sm bg-white border-slate-200`}>
 <option>10</option>
 <option>25</option>
 <option>50</option>
 </select>
 <span className="text-sm text-slate-500">entries</span>
 </div>

 <div className="flex items-center gap-4">
 <div className="flex gap-1">
 <button 
 onClick={() => handleDownload('CSV')}
 className="bg-[#17A2B8] text-white px-3 py-1.5 rounded text-xs font-bold flex items-center gap-1.5 hover:bg-[#138496]"
 >
 CSV
 </button>
 <button 
 onClick={() => handleDownload('Excel')}
 className="bg-[#28A745] text-white px-3 py-1.5 rounded text-xs font-bold flex items-center gap-1.5 hover:bg-[#218838]"
 >
 Excel
 </button>
 </div>
 <div className="relative">
 <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"/>
 <input 
 type="text"
 placeholder="Search..."
 value={searchTerm}
 onChange={(e) => setSearchTerm(e.target.value)}
 className={`pl-10 pr-4 py-2 border rounded-md text-sm outline-none focus:ring-1 focus:ring-indigo-500 bg-white border-slate-200`}
 />
 </div>
 </div>
 </div>

 <div className="overflow-x-auto border border-slate-100 rounded-lg">
 <table className="w-full text-left border-collapse">
 <thead>
 <tr className={`bg-slate-50 border-b border-slate-100`}>
 <th className="px-4 py-3 text-xs font-bold text-slate-600 uppercase">Sl</th>
 <th className="px-4 py-3 text-xs font-bold text-slate-600 uppercase">Employee name</th>
 <th className="px-4 py-3 text-xs font-bold text-slate-600 uppercase">Amount</th>
 <th className="px-4 py-3 text-xs font-bold text-slate-600 uppercase">Release amount</th>
 <th className="px-4 py-3 text-xs font-bold text-slate-600 uppercase">Salary month</th>
 <th className="px-4 py-3 text-xs font-bold text-slate-600 uppercase">Approved</th>
 <th className="px-4 py-3 text-xs font-bold text-slate-600 uppercase">Status</th>
 <th className="px-4 py-3 text-xs font-bold text-slate-600 uppercase">Action</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-slate-100">
 {records.filter(r => r.employeeName.toLowerCase().includes(searchTerm.toLowerCase())).map((record, idx) => (
 <tr key={record.id} className="hover:bg-slate-50/50 transition-colors">
 <td className="px-4 py-3 text-sm text-slate-600">{idx + 1}</td>
 <td className="px-4 py-3 text-sm font-medium text-slate-800">{record.employeeName}</td>
 <td className="px-4 py-3 text-sm text-slate-600">{settings.formatCurrency(record.amount)}</td>
 <td className="px-4 py-3 text-sm text-slate-600">{settings.formatCurrency(record.releaseAmount)}</td>
 <td className="px-4 py-3 text-sm text-slate-600">{record.salaryMonth}</td>
 <td className="px-4 py-3 text-sm text-center">
 {record.approved ? (
 <CheckCircle2 className="w-5 h-5 text-emerald-500 mx-auto"/>
 ) : (
 <XCircle className="w-5 h-5 text-red-500 mx-auto"/>
 )}
 </td>
 <td className="px-4 py-3 text-sm">
 <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${
 record.status === 'Active' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'
}`}>
 {record.status}
 </span>
 </td>
 <td className="px-4 py-3 text-sm">
 <div className="flex gap-2">
 <button onClick={() => handleEdit(record)} className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded border border-indigo-100">
 <Edit className="w-3.5 h-3.5"/>
 </button>
 <button onClick={() => handleDelete(record.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded border border-red-100">
 <Trash2 className="w-3.5 h-3.5"/>
 </button>
 </div>
 </td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>

 <div className="flex items-center justify-between pt-4">
 <div className="text-sm text-slate-500">Showing 1 to 10 of 356 entries</div>
 <div className="flex gap-1">
 <button className="px-3 py-1 border rounded text-sm hover:bg-slate-50">Previous</button>
 <button className="px-3 py-1 bg-indigo-600 text-white rounded text-sm">1</button>
 <button className="px-3 py-1 border rounded text-sm hover:bg-slate-50">2</button>
 <button className="px-3 py-1 border rounded text-sm hover:bg-slate-50">3</button>
 <button className="px-3 py-1 border rounded text-sm hover:bg-slate-50">Next</button>
 </div>
 </div>
 </div>
 </div>
 </div>

 {/* Add Modal */}
 <AnimatePresence>
 {isModalOpen && (
 <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
 <motion.div 
 initial={{ opacity: 0, scale: 0.95}}
 animate={{ opacity: 1, scale: 1}}
 exit={{ opacity: 0, scale: 0.95}}
 className={`rounded-xl shadow-xl w-full max-w-lg overflow-hidden bg-white`}
 >
 <div className="p-4 border-b border-slate-100 flex justify-between items-center">
 <h3 className="font-bold text-slate-800">{formData.id ? 'Edit salary advance' : 'Add salary advance'}</h3>
 <button onClick={() => setIsModalOpen(false)} className="p-1 hover:bg-slate-200 rounded-full">
 <X className="w-5 h-5 text-slate-500"/>
 </button>
 </div>
 
 <form onSubmit={handleAdd} className="p-6 space-y-4">
 <div className="grid grid-cols-3 items-center gap-4">
 <label className="text-sm font-bold text-slate-700">Employee <span className="text-red-500">*</span></label>
 <div className="col-span-2">
 <select 
 required
 value={formData.employee}
 onChange={(e) => setFormData({...formData, employee: e.target.value})}
 className={`w-full border rounded px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-indigo-500 bg-white border-slate-200`}
 >
 <option value="">Select employee</option>
 <option>Kristen Lillith Stout Rodriquez</option>
 <option>Honorato Imogene Curry Terry</option>
 <option>Maisha Lucy Zamora Gonzales</option>
 </select>
 </div>
 </div>

 <div className="grid grid-cols-3 items-center gap-4">
 <label className="text-sm font-bold text-slate-700">Amount <span className="text-red-500">*</span></label>
 <div className="col-span-2">
 <input 
 type="number"
 required
 placeholder="Amount"
 value={formData.amount}
 onChange={(e) => setFormData({...formData, amount: e.target.value})}
 className={`w-full border rounded px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-indigo-500 bg-white border-slate-200`}
 />
 </div>
 </div>

 <div className="grid grid-cols-3 items-center gap-4">
 <label className="text-sm font-bold text-slate-700">Salary month <span className="text-red-500">*</span></label>
 <div className="col-span-2">
 <input 
 type="month"
 required
 value={formData.salaryMonth}
 onChange={(e) => setFormData({...formData, salaryMonth: e.target.value})}
 className={`w-full border rounded px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-indigo-500 bg-white border-slate-200`}
 />
 </div>
 </div>

 <div className="grid grid-cols-3 items-center gap-4">
 <label className="text-sm font-bold text-slate-700">Is active <span className="text-red-500">*</span></label>
 <div className="col-span-2 flex gap-4">
 <label className="flex items-center gap-2 cursor-pointer">
 <input 
 type="radio"
 name="isActive"
 value="Active"
 checked={formData.isActive === 'Active'}
 onChange={(e) => setFormData({...formData, isActive: e.target.value})}
 className="text-indigo-600 focus:ring-indigo-500"
 />
 <span className="text-sm text-slate-700">Active</span>
 </label>
 <label className="flex items-center gap-2 cursor-pointer">
 <input 
 type="radio"
 name="isActive"
 value="Inactive"
 checked={formData.isActive === 'Inactive'}
 onChange={(e) => setFormData({...formData, isActive: e.target.value})}
 className="text-indigo-600 focus:ring-indigo-500"
 />
 <span className="text-sm text-slate-700">Inactive</span>
 </label>
 </div>
 </div>

 <div className="grid grid-cols-3 items-center gap-4">
 <label className="text-sm font-bold text-slate-700">Approved</label>
 <div className="col-span-2">
 <input 
 type="checkbox"
 checked={formData.approved}
 onChange={(e) => setFormData({...formData, approved: e.target.checked})}
 className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-slate-300 rounded"
 />
 </div>
 </div>

 <div className="flex justify-end gap-2 pt-4">
 <button 
 type="button"
 onClick={() => setIsModalOpen(false)}
 className="px-4 py-2 bg-red-500 text-white rounded text-sm font-bold hover:bg-red-600"
 >
 Close
 </button>
 <button 
 type="submit"
 className="px-4 py-2 bg-[#28A745] text-white rounded text-sm font-bold hover:bg-[#218838]"
 >
 Save
 </button>
 </div>
 </form>
 </motion.div>
 </div>
 )}
 </AnimatePresence>
 </AdminLayout>
 );
}
