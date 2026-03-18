import React, { useState} from 'react';
import { Plus, Edit3, Trash2, X, Search, PlusCircle} from 'lucide-react';
import { motion, AnimatePresence} from 'motion/react';
import AdminLayout from '../../components/AdminLayout';
import { useCompanyData} from '../../context/CompanyDataContext';
import { useAuth} from '../../context/AuthContext';
import { useEmployees} from '../../context/EmployeeContext';

interface CustomField {
 id: string;
 name: string;
 value: string;
}

interface CallLog {
 id: string;
 date: string;
 employeeName: string;
 campaignProduct: string;
 company: string;
 shift: string;
 country: string;
 callLogId: string; // Incoming, Outgoing, Missed
 callSource: string; // Phone, Whatsapp, Web, Email, Social platform
 callPurpose: string;
 callNote: string;
 callOutcome: string;
 followUpRequired: string; // Yes / No
 followUpDate: string;
 followUpTime: string;
 assignedTo: string;
 status: string; // Open, In Progress, Closed
 remarks: string;
 customFields: CustomField[];
}

export default function CallLogs() {
  const { callLogs: rawCallLogs, companies, addEntity, updateEntity, deleteEntity} = useCompanyData();
 const { user} = useAuth();
 const { employees} = useEmployees();
 const callLogs = rawCallLogs as unknown as CallLog[];

 const [isAdding, setIsAdding] = useState(false);
 const [editingLog, setEditingLog] = useState<CallLog | null>(null);
 const [searchQuery, setSearchQuery] = useState('');

 const initialFormState: Partial<CallLog> = {
 date: new Date().toISOString().split('T')[0],
 employeeName: user?.name || '',
 campaignProduct: '',
 company: '',
 shift: 'Day',
 country: '',
 callLogId: 'Incoming',
 callSource: 'Phone',
 callPurpose: '',
 callNote: '',
 callOutcome: '',
 followUpRequired: 'No',
 followUpDate: '',
 followUpTime: '',
 assignedTo: '',
 status: 'Open',
 remarks: '',
 customFields: []
};

 const [formData, setFormData] = useState<Partial<CallLog>>(initialFormState);

 const handleSave = async () => {
 if (editingLog) {
 await updateEntity('callLogs', editingLog.id, formData);
} else {
 await addEntity('callLogs', formData);
}
 closeModal();
};

 const handleEdit = (log: CallLog) => {
 setEditingLog(log);
 setFormData({ ...log, customFields: log.customFields || []});
 setIsAdding(true);
};

 const handleDelete = async (id: string) => {
 if (window.confirm('Are you sure you want to delete this call log?')) {
 await deleteEntity('callLogs', id);
}
};

 const closeModal = () => {
 setIsAdding(false);
 setEditingLog(null);
 setFormData(initialFormState);
};

 const addCustomField = () => {
 setFormData({
 ...formData,
 customFields: [
 ...(formData.customFields || []),
 { id: Math.random().toString(36).substr(2, 9), name: '', value: ''}
 ]
});
};

 const updateCustomField = (id: string, field: 'name' | 'value', value: string) => {
 setFormData({
 ...formData,
 customFields: formData.customFields?.map(cf => 
 cf.id === id ? { ...cf, [field]: value} : cf
 )
});
};

 const removeCustomField = (id: string) => {
 setFormData({
 ...formData,
 customFields: formData.customFields?.filter(cf => cf.id !== id)
});
};

 const filteredLogs = callLogs.filter(log => 
 log.company?.toLowerCase().includes(searchQuery.toLowerCase()) ||
 log.employeeName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
 log.callPurpose?.toLowerCase().includes(searchQuery.toLowerCase())
 );

 return (
 <AdminLayout>
 <div className="p-6 max-w-7xl mx-auto">
 <div className="flex items-center justify-between mb-8">
 <div>
 <h1 className={`text-2xl font-bold text-slate-900`}>Call Logs</h1>
 <p className="text-xs text-slate-500 mt-1">CRM &gt; Call Logs</p>
 </div>
 <div className="flex items-center gap-4">
 <div className="relative">
 <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"/>
 <input
 type="text"
 placeholder="Search logs..."
 value={searchQuery}
 onChange={(e) => setSearchQuery(e.target.value)}
 className={`pl-10 pr-4 py-2 rounded-xl text-sm outline-none transition-all ${
 'bg-white text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 border border-slate-200'
}`}
 />
 </div>
 <button
 onClick={() => setIsAdding(true)}
 className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors text-sm font-medium"
 >
 <Plus className="w-4 h-4"/>
 Add Call Log
 </button>
 </div>
 </div>

 <div className={`rounded-2xl border overflow-hidden bg-white border-slate-200`}>
 <div className="overflow-x-auto">
 <table className="w-full text-left text-sm whitespace-nowrap">
 <thead className={`text-xs uppercase tracking-wider bg-slate-50 text-slate-500`}>
 <tr>
 <th className="px-4 py-3 font-medium">Date</th>
 <th className="px-4 py-3 font-medium">Employee</th>
 <th className="px-4 py-3 font-medium">Campaign/Product</th>
 <th className="px-4 py-3 font-medium">Company</th>
 <th className="px-4 py-3 font-medium">Shift</th>
 <th className="px-4 py-3 font-medium">Country</th>
 <th className="px-4 py-3 font-medium">Call Log ID</th>
 <th className="px-4 py-3 font-medium">Call Source</th>
 <th className="px-4 py-3 font-medium">Call Purpose</th>
 <th className="px-4 py-3 font-medium">Call Note</th>
 <th className="px-4 py-3 font-medium">Call Outcome</th>
 <th className="px-4 py-3 font-medium">Follow Up Req</th>
 <th className="px-4 py-3 font-medium">Follow Up Date</th>
 <th className="px-4 py-3 font-medium">Follow Up Time</th>
 <th className="px-4 py-3 font-medium">Assigned To</th>
 <th className="px-4 py-3 font-medium">Status</th>
 <th className="px-4 py-3 font-medium">Remarks</th>
 <th className="px-4 py-3 font-medium text-right sticky right-0 z-10 bg-inherit">Actions</th>
 </tr>
 </thead>
 <tbody className={`divide-y divide-slate-100`}>
 {filteredLogs.map((log) => (
 <tr key={log.id} className={`hover:bg-slate-50 transition-colors`}>
 <td className={`px-4 py-3 text-slate-700`}>{log.date}</td>
 <td className={`px-4 py-3 font-medium text-indigo-600`}>{log.employeeName}</td>
 <td className={`px-4 py-3 text-slate-700`}>{log.campaignProduct}</td>
 <td className={`px-4 py-3 text-slate-700`}>{log.company}</td>
 <td className={`px-4 py-3 text-slate-700`}>{log.shift}</td>
 <td className={`px-4 py-3 text-slate-700`}>{log.country}</td>
 <td className={`px-4 py-3 text-slate-700`}>{log.callLogId}</td>
 <td className={`px-4 py-3 text-slate-700`}>{log.callSource}</td>
 <td className={`px-4 py-3 text-slate-700`}>{log.callPurpose}</td>
 <td className={`px-4 py-3 text-slate-700 max-w-[200px] truncate`} title={log.callNote}>{log.callNote}</td>
 <td className={`px-4 py-3 text-slate-700`}>{log.callOutcome}</td>
 <td className={`px-4 py-3 text-slate-700`}>{log.followUpRequired}</td>
 <td className={`px-4 py-3 text-slate-700`}>{log.followUpDate}</td>
 <td className={`px-4 py-3 text-slate-700`}>{log.followUpTime}</td>
 <td className={`px-4 py-3 text-slate-700`}>{log.assignedTo}</td>
 <td className="px-4 py-3">
 <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
 log.status === 'Open' ? 'bg-emerald-100 text-emerald-700 ' :
 log.status === 'In Progress' ? 'bg-amber-100 text-amber-700 ' :
 'bg-slate-100 text-slate-700 '
}`}>
 {log.status}
 </span>
 </td>
 <td className={`px-4 py-3 text-slate-700 max-w-[200px] truncate`} title={log.remarks}>{log.remarks}</td>
 <td className={`px-4 py-3 sticky right-0 z-10 bg-white`}>
 <div className="flex items-center justify-end gap-2">
 <button onClick={() => handleEdit(log)} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
 <Edit3 className="w-3.5 h-3.5"/>
 Edit
 </button>
 <button onClick={() => handleDelete(log.id)} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors">
 <Trash2 className="w-3.5 h-3.5"/>
 Delete
 </button>
 </div>
 </td>
 </tr>
 ))}
 {filteredLogs.length === 0 && (
 <tr>
 <td colSpan={18} className={`px-4 py-8 text-center text-sm text-slate-400`}>
 No call logs found
 </td>
 </tr>
 )}
 </tbody>
 </table>
 </div>
 </div>

 {/* Add/Edit Modal */}
 <AnimatePresence>
 {isAdding && (
 <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
 <motion.div
 initial={{ opacity: 0, scale: 0.95}}
 animate={{ opacity: 1, scale: 1}}
 exit={{ opacity: 0, scale: 0.95}}
 className={`w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-xl bg-white`}
 >
 <div className={`sticky top-0 z-10 flex items-center justify-between p-6 border-b bg-white border-slate-100`}>
 <h2 className={`text-lg font-bold text-slate-900`}>
 {editingLog ? 'Edit Call Log' : 'Add New Call Log'}
 </h2>
 <button onClick={closeModal} className="text-slate-400 hover:text-slate-500">
 <X className="w-5 h-5"/>
 </button>
 </div>

 <div className="p-6 space-y-6">
 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
 <div>
 <label className={`block text-xs font-bold uppercase tracking-widest mb-2 text-slate-500`}>Date</label>
 <input
 type="date"
 value={formData.date || ''}
 onChange={(e) => setFormData({ ...formData, date: e.target.value})}
 className={`w-full px-4 py-2.5 rounded-xl text-sm outline-none transition-all ${
 'bg-slate-50 text-slate-900 focus:ring-2 focus:ring-indigo-500 border border-slate-200'
}`}
 />
 </div>
 <div>
 <label className={`block text-xs font-bold uppercase tracking-widest mb-2 text-slate-500`}>Employee</label>
 <select
 value={formData.employeeName || ''}
 onChange={(e) => setFormData({ ...formData, employeeName: e.target.value})}
 className={`w-full px-4 py-2.5 rounded-xl text-sm outline-none transition-all ${
 'bg-slate-50 text-slate-900 focus:ring-2 focus:ring-indigo-500 border border-slate-200'
}`}
 >
 <option value="">Select Employee</option>
 {employees.map((emp) => (
 <option key={emp.id} value={emp.name}>
 {emp.name}
 </option>
 ))}
 </select>
 </div>
 <div>
 <label className={`block text-xs font-bold uppercase tracking-widest mb-2 text-slate-500`}>Campaign / Product</label>
 <input
 type="text"
 value={formData.campaignProduct || ''}
 onChange={(e) => setFormData({ ...formData, campaignProduct: e.target.value})}
 className={`w-full px-4 py-2.5 rounded-xl text-sm outline-none transition-all ${
 'bg-slate-50 text-slate-900 focus:ring-2 focus:ring-indigo-500 border border-slate-200'
}`}
 />
 </div>
 <div>
 <label className={`block text-xs font-bold uppercase tracking-widest mb-2 text-slate-500`}>Company</label>
 <select
 value={formData.company || ''}
 onChange={(e) => setFormData({ ...formData, company: e.target.value})}
 className={`w-full px-4 py-2.5 rounded-xl text-sm outline-none transition-all ${
 'bg-slate-50 text-slate-900 focus:ring-2 focus:ring-indigo-500 border border-slate-200'
}`}
 >
 <option value="">Select Company</option>
 {companies.map((comp: any) => (
 <option key={comp.id} value={comp.name}>
 {comp.name}
 </option>
 ))}
 </select>
 </div>
 <div>
 <label className={`block text-xs font-bold uppercase tracking-widest mb-2 text-slate-500`}>Shift</label>
 <select
 value={formData.shift || 'Day'}
 onChange={(e) => setFormData({ ...formData, shift: e.target.value})}
 className={`w-full px-4 py-2.5 rounded-xl text-sm outline-none transition-all ${
 'bg-slate-50 text-slate-900 focus:ring-2 focus:ring-indigo-500 border border-slate-200'
}`}
 >
 <option value="Day">Day</option>
 <option value="After Noon">After Noon</option>
 <option value="Night">Night</option>
 </select>
 </div>
 <div>
 <label className={`block text-xs font-bold uppercase tracking-widest mb-2 text-slate-500`}>Country</label>
 <input
 type="text"
 value={formData.country || ''}
 onChange={(e) => setFormData({ ...formData, country: e.target.value})}
 className={`w-full px-4 py-2.5 rounded-xl text-sm outline-none transition-all ${
 'bg-slate-50 text-slate-900 focus:ring-2 focus:ring-indigo-500 border border-slate-200'
}`}
 />
 </div>
 <div>
 <label className={`block text-xs font-bold uppercase tracking-widest mb-2 text-slate-500`}>Call Log ID</label>
 <select
 value={formData.callLogId || 'Incoming'}
 onChange={(e) => setFormData({ ...formData, callLogId: e.target.value})}
 className={`w-full px-4 py-2.5 rounded-xl text-sm outline-none transition-all ${
 'bg-slate-50 text-slate-900 focus:ring-2 focus:ring-indigo-500 border border-slate-200'
}`}
 >
 <option value="Incoming">Incoming</option>
 <option value="Outgoing">Outgoing</option>
 <option value="Missed">Missed</option>
 </select>
 </div>
 <div>
 <label className={`block text-xs font-bold uppercase tracking-widest mb-2 text-slate-500`}>Call Source</label>
 <select
 value={formData.callSource || 'Phone'}
 onChange={(e) => setFormData({ ...formData, callSource: e.target.value})}
 className={`w-full px-4 py-2.5 rounded-xl text-sm outline-none transition-all ${
 'bg-slate-50 text-slate-900 focus:ring-2 focus:ring-indigo-500 border border-slate-200'
}`}
 >
 <option value="Phone">Phone</option>
 <option value="Whatsapp">Whatsapp</option>
 <option value="Web">Web</option>
 <option value="Email">Email</option>
 <option value="Social platform">Social platform</option>
 </select>
 </div>
 <div>
 <label className={`block text-xs font-bold uppercase tracking-widest mb-2 text-slate-500`}>Call Purpose</label>
 <input
 type="text"
 value={formData.callPurpose || ''}
 onChange={(e) => setFormData({ ...formData, callPurpose: e.target.value})}
 className={`w-full px-4 py-2.5 rounded-xl text-sm outline-none transition-all ${
 'bg-slate-50 text-slate-900 focus:ring-2 focus:ring-indigo-500 border border-slate-200'
}`}
 />
 </div>
 <div className="md:col-span-3">
 <label className={`block text-xs font-bold uppercase tracking-widest mb-2 text-slate-500`}>Call Note</label>
 <textarea
 value={formData.callNote || ''}
 onChange={(e) => setFormData({ ...formData, callNote: e.target.value})}
 rows={3}
 className={`w-full px-4 py-2.5 rounded-xl text-sm outline-none transition-all resize-none ${
 'bg-slate-50 text-slate-900 focus:ring-2 focus:ring-indigo-500 border border-slate-200'
}`}
 />
 </div>
 <div>
 <label className={`block text-xs font-bold uppercase tracking-widest mb-2 text-slate-500`}>Call Outcome</label>
 <input
 type="text"
 value={formData.callOutcome || ''}
 onChange={(e) => setFormData({ ...formData, callOutcome: e.target.value})}
 className={`w-full px-4 py-2.5 rounded-xl text-sm outline-none transition-all ${
 'bg-slate-50 text-slate-900 focus:ring-2 focus:ring-indigo-500 border border-slate-200'
}`}
 />
 </div>
 <div>
 <label className={`block text-xs font-bold uppercase tracking-widest mb-2 text-slate-500`}>Follow-Up Required</label>
 <select
 value={formData.followUpRequired || 'No'}
 onChange={(e) => setFormData({ ...formData, followUpRequired: e.target.value})}
 className={`w-full px-4 py-2.5 rounded-xl text-sm outline-none transition-all ${
 'bg-slate-50 text-slate-900 focus:ring-2 focus:ring-indigo-500 border border-slate-200'
}`}
 >
 <option value="Yes">Yes</option>
 <option value="No">No</option>
 </select>
 </div>
 {formData.followUpRequired === 'Yes' && (
 <>
 <div>
 <label className={`block text-xs font-bold uppercase tracking-widest mb-2 text-slate-500`}>Follow-Up Date</label>
 <input
 type="date"
 value={formData.followUpDate || ''}
 onChange={(e) => setFormData({ ...formData, followUpDate: e.target.value})}
 className={`w-full px-4 py-2.5 rounded-xl text-sm outline-none transition-all ${
 'bg-slate-50 text-slate-900 focus:ring-2 focus:ring-indigo-500 border border-slate-200'
}`}
 />
 </div>
 <div>
 <label className={`block text-xs font-bold uppercase tracking-widest mb-2 text-slate-500`}>Follow-Up Time</label>
 <input
 type="time"
 value={formData.followUpTime || ''}
 onChange={(e) => setFormData({ ...formData, followUpTime: e.target.value})}
 className={`w-full px-4 py-2.5 rounded-xl text-sm outline-none transition-all ${
 'bg-slate-50 text-slate-900 focus:ring-2 focus:ring-indigo-500 border border-slate-200'
}`}
 />
 </div>
 <div>
 <label className={`block text-xs font-bold uppercase tracking-widest mb-2 text-slate-500`}>Assigned To</label>
 <select
 value={formData.assignedTo || ''}
 onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value})}
 className={`w-full px-4 py-2.5 rounded-xl text-sm outline-none transition-all ${
 'bg-slate-50 text-slate-900 focus:ring-2 focus:ring-indigo-500 border border-slate-200'
}`}
 >
 <option value="">Select Employee</option>
 {employees.map((emp) => (
 <option key={emp.id} value={emp.name}>
 {emp.name}
 </option>
 ))}
 </select>
 </div>
 </>
 )}
 <div>
 <label className={`block text-xs font-bold uppercase tracking-widest mb-2 text-slate-500`}>Status</label>
 <select
 value={formData.status || 'Open'}
 onChange={(e) => setFormData({ ...formData, status: e.target.value})}
 className={`w-full px-4 py-2.5 rounded-xl text-sm outline-none transition-all ${
 'bg-slate-50 text-slate-900 focus:ring-2 focus:ring-indigo-500 border border-slate-200'
}`}
 >
 <option value="Open">Open</option>
 <option value="In Progress">In Progress</option>
 <option value="Closed">Closed</option>
 </select>
 </div>
 <div className="md:col-span-3">
 <label className={`block text-xs font-bold uppercase tracking-widest mb-2 text-slate-500`}>Remarks</label>
 <textarea
 value={formData.remarks || ''}
 onChange={(e) => setFormData({ ...formData, remarks: e.target.value})}
 rows={2}
 className={`w-full px-4 py-2.5 rounded-xl text-sm outline-none transition-all resize-none ${
 'bg-slate-50 text-slate-900 focus:ring-2 focus:ring-indigo-500 border border-slate-200'
}`}
 />
 </div>
 </div>

 {/* Custom Fields Section */}
 <div className="pt-6 border-t border-slate-200">
 <div className="flex items-center justify-between mb-4">
 <h3 className={`text-sm font-bold uppercase tracking-widest text-slate-500`}>Custom Fields</h3>
 <button
 type="button"
 onClick={addCustomField}
 className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
 >
 <PlusCircle className="w-4 h-4"/>
 Add Field
 </button>
 </div>
 
 <div className="space-y-3">
 {formData.customFields?.map((field) => (
 <div key={field.id} className="flex items-center gap-3">
 <input
 type="text"
 placeholder="Field Name"
 value={field.name}
 onChange={(e) => updateCustomField(field.id, 'name', e.target.value)}
 className={`flex-1 px-4 py-2.5 rounded-xl text-sm outline-none transition-all ${
 'bg-slate-50 text-slate-900 focus:ring-2 focus:ring-indigo-500 border border-slate-200'
}`}
 />
 <input
 type="text"
 placeholder="Field Value"
 value={field.value}
 onChange={(e) => updateCustomField(field.id, 'value', e.target.value)}
 className={`flex-1 px-4 py-2.5 rounded-xl text-sm outline-none transition-all ${
 'bg-slate-50 text-slate-900 focus:ring-2 focus:ring-indigo-500 border border-slate-200'
}`}
 />
 <button
 type="button"
 onClick={() => removeCustomField(field.id)}
 className="p-2 text-slate-400 hover:text-rose-500 rounded-lg transition-colors"
 >
 <Trash2 className="w-4 h-4"/>
 </button>
 </div>
 ))}
 {(!formData.customFields || formData.customFields.length === 0) && (
 <p className={`text-sm italic text-slate-400`}>No custom fields added.</p>
 )}
 </div>
 </div>
 </div>

 <div className={`p-6 border-t flex justify-end gap-3 bg-slate-50 border-slate-100`}>
 <button
 onClick={closeModal}
 className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
 'text-slate-600 hover:bg-slate-200'
}`}
 >
 Cancel
 </button>
 <button
 onClick={handleSave}
 className="px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors text-sm font-medium"
 >
 {editingLog ? 'Save Changes' : 'Add Call Log'}
 </button>
 </div>
 </motion.div>
 </div>
 )}
 </AnimatePresence>
 </div>
 </AdminLayout>
 );
}
