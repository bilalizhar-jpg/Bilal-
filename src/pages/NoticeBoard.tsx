import React, { useState} from 'react';
import { motion, AnimatePresence} from 'motion/react';
import { 
 Search,
 Plus, 
 Edit, 
 Trash2, 
 X, 
 Upload
} from 'lucide-react';
import AdminLayout from '../components/AdminLayout';
import { useCompanyData} from '../context/CompanyDataContext';
import { useChat} from '../context/ChatContext';
import { useWhatsApp} from '../hooks/useWhatsApp';
import { useEmployees} from '../context/EmployeeContext';

interface Notice {
 id: string;
 type: string;
 description: string;
 date: string;
 by: string;
 attachment?: string;
}

export default function NoticeBoard() {
 const { notices, addEntity, updateEntity, deleteEntity} = useCompanyData();
 const { invitations} = useChat();
 const { sendWhatsAppMessage} = useWhatsApp();
 const { employees} = useEmployees();
 const [searchTerm, setSearchTerm] = useState('');
 const [isModalOpen, setIsModalOpen] = useState(false);
 const [editingNotice, setEditingNotice] = useState<Notice | null>(null);
 const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

 const [formData, setFormData] = useState<Partial<Notice>>({
 type: '',
 description: '',
 date: new Date().toISOString().split('T')[0],
 by: 'Admin'
});

 const handleSave = async (e: React.FormEvent) => {
 e.preventDefault();
 if (editingNotice) {
 await updateEntity('notices', editingNotice.id, formData);
} else {
 await addEntity('notices', formData);
 
 // Send WhatsApp notification to all active employees
 const activeEmployees = employees.filter(emp => emp.status === 'Active' && emp.mobile);
 if (activeEmployees.length > 0) {
 const message =`ERP Notice: ${formData.type}\n\n${formData.description}\n\nBy: ${formData.by}`;
 activeEmployees.forEach(emp => {
 if (emp.mobile) {
 sendWhatsAppMessage(emp.mobile, message);
}
});
}
}
 setIsModalOpen(false);
 setEditingNotice(null);
};

 const handleDelete = (id: string) => {
 setDeleteConfirmId(id);
};

 const confirmDelete = async () => {
 if (deleteConfirmId) {
 await deleteEntity('notices', deleteConfirmId);
 setDeleteConfirmId(null);
}
};

 const isNear = (date: Date) => {
 const now = new Date();
 const diff = date.getTime() - now.getTime();
 return diff > 0 && diff < 15 * 60 * 1000; // 15 minutes
};

 const videoCallNotices = invitations
 .filter(inv => inv.type === 'videoCall' && inv.scheduledTime)
 .map(inv => ({
 id: inv.id,
 type: 'Video Call',
 description:`Video call scheduled for ${new Date(inv.scheduledTime.toDate()).toLocaleString()}`,
 date: new Date(inv.scheduledTime.toDate()).toISOString().split('T')[0],
 by: inv.fromUserId,
 isScheduled: true
}));

 const allNotices = [...notices, ...videoCallNotices];

 const filteredNotices = allNotices.filter(n => 
 n.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
 n.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
 n.by.toLowerCase().includes(searchTerm.toLowerCase())
 );

 return (
 <AdminLayout>
 <div className="space-y-6">
 <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
 <div className="p-4 border-b border-slate-100 flex justify-between items-center">
 <h2 className="font-bold text-slate-800">Notice list</h2>
 <button 
 onClick={() => {
 setEditingNotice(null);
 setFormData({
 type: '',
 description: '',
 date: new Date().toISOString().split('T')[0],
 by: 'Admin'
});
 setIsModalOpen(true);
}}
 className="bg-[#28A745] text-white px-3 py-1.5 rounded text-xs font-bold flex items-center gap-1.5 hover:bg-[#218838]"
 >
 <Plus className="w-3.5 h-3.5"/>
 Add notice
 </button>
 </div>

 <div className="p-4 flex justify-between items-center bg-slate-50/50 border-b border-slate-100">
 <div className="flex items-center gap-2">
 <span className="text-xs text-slate-500">Show</span>
 <select className="border border-slate-200 rounded px-2 py-1 text-xs outline-none">
 <option>10</option>
 <option>25</option>
 <option>50</option>
 </select>
 <span className="text-xs text-slate-500">entries</span>
 </div>
 <div className="relative">
 <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400"/>
 <input 
 type="text"
 placeholder="Search..."
 value={searchTerm}
 onChange={(e) => setSearchTerm(e.target.value)}
 className="pl-8 pr-3 py-1.5 border border-slate-200 rounded text-xs outline-none focus:ring-1 focus:ring-indigo-500 w-48"
 />
 </div>
 </div>

 <div className="overflow-x-auto">
 <table className="w-full text-left border-collapse">
 <thead>
 <tr className="bg-slate-50/50 border-b border-slate-100">
 <th className="px-4 py-3 text-[10px] font-bold text-slate-600 uppercase tracking-wider border-r border-slate-100">Sl</th>
 <th className="px-4 py-3 text-[10px] font-bold text-slate-600 uppercase tracking-wider border-r border-slate-100">Notice type</th>
 <th className="px-4 py-3 text-[10px] font-bold text-slate-600 uppercase tracking-wider border-r border-slate-100">Description</th>
 <th className="px-4 py-3 text-[10px] font-bold text-slate-600 uppercase tracking-wider border-r border-slate-100">Notice date</th>
 <th className="px-4 py-3 text-[10px] font-bold text-slate-600 uppercase tracking-wider border-r border-slate-100">Notice by</th>
 <th className="px-4 py-3 text-[10px] font-bold text-slate-600 uppercase tracking-wider">Action</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-slate-100">
 {filteredNotices.map((notice, idx) => (
 <tr key={notice.id} className={`hover:bg-slate-50/50 transition-colors ${(notice as any).isScheduled && isNear(new Date((notice as any).date)) ? 'animate-pulse bg-red-100 ' : ''}`}>
 <td className="px-4 py-3 text-xs text-slate-600 border-r border-slate-100">{idx + 1}</td>
 <td className="px-4 py-3 text-xs text-slate-600 border-r border-slate-100 font-medium">{(notice as any).type}</td>
 <td className="px-4 py-3 text-xs text-slate-600 border-r border-slate-100">{(notice as any).description}</td>
 <td className="px-4 py-3 text-xs text-slate-600 border-r border-slate-100">{(notice as any).date}</td>
 <td className="px-4 py-3 text-xs text-slate-600 border-r border-slate-100">{(notice as any).by}</td>
 <td className="px-4 py-3 text-xs text-slate-600">
 <div className="flex gap-1">
 {! (notice as any).isScheduled && (
 <>
 <button 
 onClick={() => {
 setEditingNotice(notice as any);
 setFormData(notice as any);
 setIsModalOpen(true);
}}
 className="p-1.5 text-indigo-600 bg-indigo-50 rounded border border-indigo-100 hover:bg-indigo-100"
 >
 <Edit className="w-3.5 h-3.5"/>
 </button>
 <button 
 onClick={() => handleDelete(notice.id)}
 className="p-1.5 text-red-600 bg-red-50 rounded border border-red-100 hover:bg-red-100"
 >
 <Trash2 className="w-3.5 h-3.5"/>
 </button>
 </>
 )}
 </div>
 </td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>

 <div className="p-4 border-t border-slate-100 flex justify-between items-center text-sm text-slate-500">
 <div>Showing 1 to {filteredNotices.length} of {notices.length} entries</div>
 <div className="flex items-center gap-1">
 <button className="px-3 py-1 border border-slate-200 rounded hover:bg-slate-50 disabled:opacity-50">Previous</button>
 <button className="px-3 py-1 bg-[#1A73E8] text-white rounded">1</button>
 <button className="px-3 py-1 border border-slate-200 rounded hover:bg-slate-50 disabled:opacity-50">Next</button>
 </div>
 </div>
 </div>

 {/* Modal */}
 <AnimatePresence>
 {isModalOpen && (
 <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
 <motion.div 
 initial={{ opacity: 0, scale: 0.95}}
 animate={{ opacity: 1, scale: 1}}
 exit={{ opacity: 0, scale: 0.95}}
 className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden"
 >
 <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
 <h3 className="font-bold text-slate-800">{editingNotice ? 'Edit notice' : 'New notice'}</h3>
 <button onClick={() => setIsModalOpen(false)} className="p-1 hover:bg-slate-200 rounded-full transition-colors">
 <X className="w-5 h-5 text-slate-500"/>
 </button>
 </div>
 
 <form onSubmit={handleSave} className="p-6 space-y-4">
 <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-4">
 <label className="text-sm font-bold text-slate-700">Notice type <span className="text-red-500">*</span></label>
 <div className="md:col-span-2">
 <input 
 required
 type="text"
 value={formData.type}
 onChange={(e) => setFormData({...formData, type: e.target.value})}
 className="w-full border border-slate-200 rounded px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-indigo-500"
 placeholder="Notice type"
 />
 </div>
 </div>

 <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-4">
 <label className="text-sm font-bold text-slate-700">Notice description <span className="text-red-500">*</span></label>
 <div className="md:col-span-2">
 <textarea 
 required
 value={formData.description}
 onChange={(e) => setFormData({...formData, description: e.target.value})}
 className="w-full border border-slate-200 rounded px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-indigo-500 h-24"
 placeholder="Notice description"
 />
 </div>
 </div>

 <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-4">
 <label className="text-sm font-bold text-slate-700">Notice date <span className="text-red-500">*</span></label>
 <div className="md:col-span-2">
 <input 
 required
 type="date"
 value={formData.date}
 onChange={(e) => setFormData({...formData, date: e.target.value})}
 className="w-full border border-slate-200 rounded px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-indigo-500"
 />
 </div>
 </div>

 <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-4">
 <label className="text-sm font-bold text-slate-700">Notice attachment</label>
 <div className="md:col-span-2">
 <div className="flex items-center gap-2">
 <label className="flex items-center gap-2 px-3 py-2 bg-slate-100 border border-slate-200 rounded text-sm text-slate-600 cursor-pointer hover:bg-slate-200 transition-colors">
 <Upload className="w-4 h-4"/>
 <span>Choose file</span>
 <input type="file"className="hidden"/>
 </label>
 <span className="text-xs text-slate-400">No file chosen</span>
 </div>
 </div>
 </div>

 <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-4">
 <label className="text-sm font-bold text-slate-700">Notice by <span className="text-red-500">*</span></label>
 <div className="md:col-span-2">
 <input 
 required
 type="text"
 value={formData.by}
 onChange={(e) => setFormData({...formData, by: e.target.value})}
 className="w-full border border-slate-200 rounded px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-indigo-500"
 placeholder="Notice by"
 />
 </div>
 </div>

 <div className="flex justify-end gap-2 pt-4">
 <button 
 type="button"
 onClick={() => setIsModalOpen(false)}
 className="px-4 py-2 bg-[#DC3545] text-white rounded text-sm font-bold hover:bg-[#C82333]"
 >
 Close
 </button>
 <button 
 type="submit"
 className="px-4 py-2 bg-[#007BFF] text-white rounded text-sm font-bold hover:bg-[#0069D9]"
 >
 Save
 </button>
 </div>
 </form>
 </motion.div>
 </div>
 )}
 </AnimatePresence>

 {/* Delete Confirmation Modal */}
 <AnimatePresence>
 {deleteConfirmId && (
 <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
 <motion.div 
 initial={{ opacity: 0, scale: 0.95}}
 animate={{ opacity: 1, scale: 1}}
 exit={{ opacity: 0, scale: 0.95}}
 className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden"
 >
 <div className="p-6 text-center">
 <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
 <Trash2 className="w-8 h-8 text-red-600"/>
 </div>
 <h3 className="text-xl font-bold text-slate-800 mb-2">Delete Notice</h3>
 <p className="text-slate-500 mb-6">Are you sure you want to delete this notice? This action cannot be undone.</p>
 <div className="flex justify-center gap-3">
 <button 
 onClick={() => setDeleteConfirmId(null)}
 className="px-6 py-2 bg-slate-100 text-slate-700 rounded-lg font-medium hover:bg-slate-200 transition-colors"
 >
 Cancel
 </button>
 <button 
 onClick={confirmDelete}
 className="px-6 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
 >
 Delete
 </button>
 </div>
 </div>
 </motion.div>
 </div>
 )}
 </AnimatePresence>
 </div>
 </AdminLayout>
 );
}
