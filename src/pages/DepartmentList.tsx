import React, { useState, useEffect} from 'react';
import { motion, AnimatePresence} from 'motion/react';
import { 
 Plus, 
 Edit, 
 Trash2, 
 X, 
 FileSpreadsheet, 
 FileText as FilePdf, 
 RotateCcw, 
 Search
} from 'lucide-react';
import { Link} from 'react-router-dom';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

import AdminLayout from '../components/AdminLayout';
import { useCompanyData} from '../context/CompanyDataContext';

interface Department {
 id: string;
 name: string;
 head: string;
 status: 'Active' | 'Inactive';
 isDeleted?: boolean;
 deletedAt?: number;
}

export default function DepartmentList() {
 const { departments, addEntity, updateEntity, deleteEntity} = useCompanyData();
 const [isModalOpen, setIsModalOpen] = useState(false);
 const [editingDept, setEditingDept] = useState<Department | null>(null);
 const [searchTerm, setSearchTerm] = useState('');
 const [currentTime, setCurrentTime] = useState(Date.now());

 const [formData, setFormData] = useState({
 name: '',
 head: '',
 status: 'Active' as 'Active' | 'Inactive'
});

 useEffect(() => {
 const timer = setInterval(() => setCurrentTime(Date.now()), 1000);
 return () => clearInterval(timer);
}, []);

 const handleOpenModal = (dept: Department | null = null) => {
 if (dept) {
 setEditingDept(dept);
 setFormData({
 name: dept.name,
 head: dept.head,
 status: dept.status
});
} else {
 setEditingDept(null);
 setFormData({
 name: '',
 head: '',
 status: 'Active'
});
}
 setIsModalOpen(true);
};

 const handleCloseModal = () => {
 setIsModalOpen(false);
 setEditingDept(null);
};

 const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
 const { name, value} = e.target;
 setFormData(prev => ({ ...prev, [name]: value}));
};

 const handleSubmit = async (e: React.FormEvent) => {
 e.preventDefault();
 if (editingDept) {
 await updateEntity('departments', editingDept.id, formData);
} else {
 await addEntity('departments', formData);
}
 handleCloseModal();
};

 const handleDelete = async (id: string) => {
 await updateEntity('departments', id, { isDeleted: true, deletedAt: Date.now()});
};

 const handleRecover = async (id: string) => {
 await updateEntity('departments', id, { isDeleted: false, deletedAt: null});
};

 const handleExportExcel = () => {
 const exportData = filteredDepartments.map((dept, index) => ({
 'Sl': index + 1,
 'Department Name': dept.name,
 'Head of Department': dept.head,
 'Status': dept.status
}));

 const ws = XLSX.utils.json_to_sheet(exportData);
 const wb = XLSX.utils.book_new();
 XLSX.utils.book_append_sheet(wb, ws,"Departments");
 XLSX.writeFile(wb,"Departments_List.xlsx");
};

 const handleExportPDF = () => {
 const doc = new jsPDF();
 
 doc.setFontSize(16);
 doc.text("Departments List", 14, 20);
 
 const tableColumn = ["Sl","Department Name","Head of Department","Status"];
 const tableRows = filteredDepartments.map((dept, index) => [
 index + 1,
 dept.name,
 dept.head,
 dept.status
 ]);

 autoTable(doc, {
 head: [tableColumn],
 body: tableRows,
 startY: 30,
 theme: 'grid',
 styles: { fontSize: 10},
 headStyles: { fillColor: [79, 70, 229]}
});

 doc.save("Departments_List.pdf");
};

 const filteredDepartments = departments.filter(d => {
 const matchesSearch = d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
 d.head.toLowerCase().includes(searchTerm.toLowerCase());
 
 if (d.isDeleted) {
 const canRecover = currentTime - (d.deletedAt || 0) < 120000; // 2 minutes
 return matchesSearch && canRecover;
}
 
 return matchesSearch;
});

 return (
 <AdminLayout>
 <div className="space-y-6">
 <div className="flex justify-between items-center">
 <h1 className="text-xl font-black text-white uppercase tracking-tight">Department list</h1>
 <div className="flex gap-2">
 <Link to="/sub-department"className="bg-transparent border border-[#00FFCC] text-[#00FFCC] px-4 py-2 rounded text-sm font-bold flex items-center gap-2 hover:bg-[#00FFCC] hover:text-[#1E1E2F] transition-colors">
 Sub departments
 </Link>
 <button onClick={() => handleOpenModal()} className="bg-[#00FFCC] text-[#1E1E2F] px-4 py-2 rounded text-sm font-bold flex items-center gap-2 hover:bg-[#00D1FF] transition-colors shadow-[0_0_8px_rgba(0,255,204,0.4)]">
 <Plus className="w-4 h-4"/>
 Add new department
 </button>
 </div>
 </div>

 <div className="bg-[#2A2A3D] rounded-2xl border border-white/5 shadow-[0_4px_20px_rgba(0,255,204,0.05)] overflow-hidden">
 <div className="p-4 border-b border-white/5 flex flex-wrap justify-between items-center gap-4">
 <div className="flex items-center gap-2 text-sm text-[#B0B0C3]">
 Show <select className="bg-[#1E1E2F] border border-white/10 rounded px-2 py-1 outline-none text-white"><option>10</option></select> entries
 </div>
 <div className="flex items-center gap-4">
 <div className="flex items-center gap-1">
 <button onClick={handleExportExcel} className="bg-transparent border border-[#00FFCC] text-[#00FFCC] px-3 py-1.5 rounded text-xs font-bold flex items-center gap-1.5 hover:bg-[#00FFCC] hover:text-[#1E1E2F] transition-colors"><FileSpreadsheet className="w-3.5 h-3.5"/> Excel</button>
 <button onClick={handleExportPDF} className="bg-transparent border border-[#00FFCC] text-[#00FFCC] px-3 py-1.5 rounded text-xs font-bold flex items-center gap-1.5 hover:bg-[#00FFCC] hover:text-[#1E1E2F] transition-colors"><FilePdf className="w-3.5 h-3.5"/> PDF</button>
 </div>
 <div className="flex items-center gap-2">
 <span className="text-sm text-[#B0B0C3]">Search:</span>
 <input type="text"value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="bg-[#1E1E2F] border border-white/10 rounded px-3 py-1.5 text-sm outline-none text-white focus:border-[#00FFCC] focus:ring-1 focus:ring-[#00FFCC]"/>
 </div>
 </div>
 </div>

 <div className="overflow-x-auto">
 <table className="w-full text-left border-collapse">
 <thead>
 <tr className="bg-[#1E1E2F]/50 border-b border-white/5">
 <th className="px-4 py-3 text-xs font-black text-[#B0B0C3] uppercase border-r border-white/5">Sl</th>
 <th className="px-4 py-3 text-xs font-black text-[#B0B0C3] uppercase border-r border-white/5">Department name</th>
 <th className="px-4 py-3 text-xs font-black text-[#B0B0C3] uppercase border-r border-white/5">Head of Department</th>
 <th className="px-4 py-3 text-xs font-black text-[#B0B0C3] uppercase border-r border-white/5">Status</th>
 <th className="px-4 py-3 text-xs font-black text-[#B0B0C3] uppercase">Action</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-white/5">
 {filteredDepartments.map((dept, index) => (
 <tr key={dept.id} className={`transition-colors ${dept.isDeleted ? 'bg-red-900/20' : 'hover:bg-[#1E1E2F]/50'}`}>
 <td className="px-4 py-3 text-sm text-white border-r border-white/5">{index + 1}</td>
 <td className="px-4 py-3 text-sm text-white border-r border-white/5">
 {(dept as any).name}
 {dept.isDeleted && <span className="ml-2 text-[10px] font-black text-red-500 uppercase tracking-wider">(Deleted)</span>}
 </td>
 <td className="px-4 py-3 text-sm text-white border-r border-white/5">{(dept as any).head}</td>
 <td className="px-4 py-3 text-sm border-r border-white/5">
 <span className={`text-[10px] font-black px-2 py-1 rounded-full uppercase ${(dept as any).status === 'Active' ? 'bg-[#00FFCC]/10 text-[#00FFCC]' : 'bg-white/10 text-[#B0B0C3]'}`}>
 {(dept as any).status}
 </span>
 </td>
 <td className="px-4 py-3 text-sm">
 <div className="flex items-center gap-2">
 {!dept.isDeleted ? (
 <>
 <button onClick={() => handleOpenModal(dept as any)} className="p-1.5 text-[#00FFCC] bg-[#00FFCC]/10 rounded border border-[#00FFCC]/20 hover:bg-[#00FFCC]/20"><Edit className="w-3.5 h-3.5"/></button>
 <button onClick={() => handleDelete(dept.id)} className="p-1.5 text-red-500 bg-red-500/10 rounded border border-red-500/20 hover:bg-red-500/20"><Trash2 className="w-3.5 h-3.5"/></button>
 </>
 ) : (
 <button onClick={() => handleRecover(dept.id)} className="flex items-center gap-1.5 px-3 py-1.5 text-[#00FFCC] bg-[#00FFCC]/10 rounded border border-[#00FFCC]/20 hover:bg-[#00FFCC]/20 text-xs font-black">
 <RotateCcw className="w-3.5 h-3.5"/>
 Recover
 </button>
 )}
 </div>
 </td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 </div>

 {/* Modal */}
 <AnimatePresence>
 {isModalOpen && (
 <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
 <motion.div initial={{ opacity: 0}} animate={{ opacity: 1}} exit={{ opacity: 0}} onClick={handleCloseModal} className="absolute inset-0 bg-black/70 backdrop-blur-sm"/>
 <motion.div initial={{ opacity: 0, scale: 0.95, y: 20}} animate={{ opacity: 1, scale: 1, y: 0}} exit={{ opacity: 0, scale: 0.95, y: 20}} className="relative bg-[#2A2A3D] rounded-2xl shadow-xl w-full max-w-lg overflow-hidden border border-white/5">
 <div className="p-4 border-b border-white/5 flex justify-between items-center">
 <h2 className="font-black text-white uppercase tracking-tight">{editingDept ? 'Edit department' : 'Add department'}</h2>
 <button onClick={handleCloseModal} className="p-1 hover:bg-white/10 rounded-full"><X className="w-5 h-5 text-[#B0B0C3]"/></button>
 </div>
 <form onSubmit={handleSubmit} className="p-6 space-y-4">
 <div>
 <label className="block text-sm font-black text-[#B0B0C3] uppercase mb-1">Department name <span className="text-red-500">*</span></label>
 <input type="text"name="name"required value={formData.name} onChange={handleInputChange} className="w-full bg-[#1E1E2F] border border-white/10 rounded px-3 py-2 text-sm outline-none text-white focus:border-[#00FFCC] focus:ring-1 focus:ring-[#00FFCC]"placeholder="e.g. Electrical"/>
 </div>
 <div>
 <label className="block text-sm font-black text-[#B0B0C3] uppercase mb-1">Head of Department <span className="text-red-500">*</span></label>
 <input type="text"name="head"required value={formData.head} onChange={handleInputChange} className="w-full bg-[#1E1E2F] border border-white/10 rounded px-3 py-2 text-sm outline-none text-white focus:border-[#00FFCC] focus:ring-1 focus:ring-[#00FFCC]"placeholder="e.g. John Doe"/>
 </div>
 <div>
 <label className="block text-sm font-black text-[#B0B0C3] uppercase mb-1">Status</label>
 <select name="status"value={formData.status} onChange={handleInputChange} className="w-full bg-[#1E1E2F] border border-white/10 rounded px-3 py-2 text-sm outline-none text-white focus:border-[#00FFCC] focus:ring-1 focus:ring-[#00FFCC]">
 <option value="Active">Active</option>
 <option value="Inactive">Inactive</option>
 </select>
 </div>
 <div className="flex justify-end gap-2 pt-4">
 <button type="button"onClick={handleCloseModal} className="px-4 py-2 bg-white/5 text-[#B0B0C3] rounded text-sm font-black uppercase hover:bg-white/10">Close</button>
 <button type="submit"className="px-4 py-2 bg-[#00FFCC] text-[#1E1E2F] rounded text-sm font-black uppercase hover:bg-[#00D1FF]">Save</button>
 </div>
 </form>
 </motion.div>
 </div>
 )}
 </AnimatePresence>
 </div>
 </AdminLayout>
 );
}
