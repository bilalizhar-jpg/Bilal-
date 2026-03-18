import React, { useState} from 'react';
import { useNavigate} from 'react-router-dom';
import { Plus, Edit3, Trash2, X, Search} from 'lucide-react';
import { motion, AnimatePresence} from 'motion/react';
import AdminLayout from '../../components/AdminLayout';
import { useCompanyData} from '../../context/CompanyDataContext';
import { useAuth} from '../../context/AuthContext';
import { useEmployees} from '../../context/EmployeeContext';

interface Ticket {
 id: string;
 ticketId: string;
 dateCreated: string;
 timeCreated: string;
 category: string;
 priority: 'Low' | 'Medium' | 'High' | 'Urgent';
 requesterName: string;
 department: string;
 email: string;
 contactNumber: string;
 issueDescription: string;
 attachmentLink: string;
 assignedTo: string;
 dateAssigned: string;
 status: 'Open' | 'In Progress' | 'Pending' | 'Resolved' | 'Closed';
}

export default function Ticketing() {
 const navigate = useNavigate();
  const { tickets: rawTickets, addEntity, updateEntity, deleteEntity, companies, departments} = useCompanyData();
 const { user} = useAuth();
 const { employees} = useEmployees();
 const tickets = rawTickets as unknown as Ticket[];

 const [isAdding, setIsAdding] = useState(false);
 const [editingTicket, setEditingTicket] = useState<Ticket | null>(null);
 const [searchQuery, setSearchQuery] = useState('');

 const initialFormState: Partial<Ticket> = {
 ticketId:`TKT-${Math.random().toString(36).substr(2, 5).toUpperCase()}`,
 dateCreated: new Date().toISOString().split('T')[0],
 timeCreated: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit'}),
 category: '',
 priority: 'Low',
 requesterName: '',
 department: '',
 email: '',
 contactNumber: '',
 issueDescription: '',
 attachmentLink: '',
 assignedTo: '',
 dateAssigned: '',
 status: 'Open',
};

 const [formData, setFormData] = useState<Partial<Ticket>>(initialFormState);

 const handleSave = async () => {
 // Ensure all required fields are present
 const ticketToSave = {
 ...formData,
 ticketId: formData.ticketId ||`TKT-${Math.random().toString(36).substr(2, 5).toUpperCase()}`,
 dateCreated: formData.dateCreated || new Date().toISOString().split('T')[0],
 timeCreated: formData.timeCreated || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit'}),
 status: formData.status || 'Open',
};

 if (editingTicket) {
 await updateEntity('tickets', editingTicket.id, ticketToSave);
} else {
 await addEntity('tickets', ticketToSave);
 // Redirect to assigned employee's dashboard
 const assignedEmployee = employees.find(e => e.name === ticketToSave.assignedTo);
 console.log("Assigned employee found:", assignedEmployee);
 if (assignedEmployee) {
 navigate(`/employees/${assignedEmployee.id}/dashboard`);
} else {
 console.warn("Assigned employee not found for:", ticketToSave.assignedTo);
}
}
 closeModal();
};

 const handleEdit = (ticket: Ticket) => {
 setEditingTicket(ticket);
 setFormData(ticket);
 setIsAdding(true);
};

 const handleDelete = async (id: string) => {
 console.log("Attempting to delete ticket with ID:", id);
 if (window.confirm('Are you sure you want to delete this ticket?')) {
 try {
 await deleteEntity('tickets', id);
 console.log("Ticket deleted successfully");
} catch (error) {
 console.error("Error deleting ticket:", error);
}
}
};

 const closeModal = () => {
 setIsAdding(false);
 setEditingTicket(null);
 setFormData(initialFormState);
};

 const activeTickets = tickets.filter(t => t.status !== 'Resolved' && t.status !== 'Closed');
 const historyTickets = tickets.filter(t => t.status === 'Resolved' || t.status === 'Closed');

 const filteredActiveTickets = activeTickets.filter(t => 
 t.requesterName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
 t.ticketId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
 t.issueDescription?.toLowerCase().includes(searchQuery.toLowerCase())
 );

 const filteredHistoryTickets = historyTickets.filter(t => 
 t.requesterName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
 t.ticketId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
 t.issueDescription?.toLowerCase().includes(searchQuery.toLowerCase())
 );

 return (
 <AdminLayout>
 <div className="p-6 max-w-7xl mx-auto">
 <div className="flex items-center justify-between mb-8">
 <div>
 <h1 className={`text-2xl font-bold text-slate-900`}>Ticketing System</h1>
 <p className="text-xs text-slate-500 mt-1">CRM &gt; Ticketing System</p>
 </div>
 <button
 onClick={() => setIsAdding(true)}
 className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors text-sm font-medium"
 >
 <Plus className="w-4 h-4"/>
 Add Ticket
 </button>
 </div>

 <div className="mb-12">
 <h2 className={`text-xl font-bold mb-4 text-slate-900`}>Active Tickets</h2>
 <div className={`rounded-2xl border overflow-hidden bg-white border-slate-200`}>
 <div className="overflow-x-auto">
 <table className="w-full text-left text-sm whitespace-nowrap">
 <thead className={`text-xs uppercase tracking-wider bg-slate-50 text-slate-500`}>
 <tr>
 <th className="px-4 py-3 font-medium">Ticket ID</th>
 <th className="px-4 py-3 font-medium">Date/Time</th>
 <th className="px-4 py-3 font-medium">Requester</th>
 <th className="px-4 py-3 font-medium">Priority</th>
 <th className="px-4 py-3 font-medium">Status</th>
 <th className="px-4 py-3 font-medium text-right">Actions</th>
 </tr>
 </thead>
 <tbody className={`divide-y divide-slate-100`}>
 {filteredActiveTickets.map((ticket) => (
 <tr key={ticket.id} className={`hover:bg-slate-50 transition-colors`}>
 <td className={`px-4 py-3 text-slate-700`}>{ticket.ticketId}</td>
 <td className={`px-4 py-3 text-slate-700`}>{ticket.dateCreated} {ticket.timeCreated}</td>
 <td className={`px-4 py-3 font-medium text-indigo-600`}>{ticket.requesterName}</td>
 <td className={`px-4 py-3 text-slate-700`}>{ticket.priority}</td>
 <td className="px-4 py-3">
 <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
 ticket.status === 'Open' ? 'bg-emerald-100 text-emerald-700' :
 ticket.status === 'In Progress' ? 'bg-amber-100 text-amber-700' :
 'bg-slate-100 text-slate-700'
}`}>
 {ticket.status}
 </span>
 </td>
 <td className="px-4 py-3 text-right">
 <div className="flex items-center justify-end gap-2">
 <button onClick={() => handleEdit(ticket)} className="p-2 text-slate-400 hover:text-indigo-600">
 <Edit3 className="w-4 h-4"/>
 </button>
 <button onClick={() => handleDelete(ticket.id)} className="p-2 text-slate-400 hover:text-rose-600">
 <Trash2 className="w-4 h-4"/>
 </button>
 </div>
 </td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 </div>
 </div>

 <div>
 <h2 className={`text-xl font-bold mb-4 text-slate-900`}>Ticketing History</h2>
 <div className={`rounded-2xl border overflow-hidden bg-white border-slate-200`}>
 <div className="overflow-x-auto">
 <table className="w-full text-left text-sm whitespace-nowrap">
 <thead className={`text-xs uppercase tracking-wider bg-slate-50 text-slate-500`}>
 <tr>
 <th className="px-4 py-3 font-medium">Ticket ID</th>
 <th className="px-4 py-3 font-medium">Date/Time</th>
 <th className="px-4 py-3 font-medium">Requester</th>
 <th className="px-4 py-3 font-medium">Priority</th>
 <th className="px-4 py-3 font-medium">Status</th>
 </tr>
 </thead>
 <tbody className={`divide-y divide-slate-100`}>
 {filteredHistoryTickets.map((ticket) => (
 <tr key={ticket.id} className={`hover:bg-slate-50 transition-colors`}>
 <td className={`px-4 py-3 text-slate-700`}>{ticket.ticketId}</td>
 <td className={`px-4 py-3 text-slate-700`}>{ticket.dateCreated} {ticket.timeCreated}</td>
 <td className={`px-4 py-3 font-medium text-indigo-600`}>{ticket.requesterName}</td>
 <td className={`px-4 py-3 text-slate-700`}>{ticket.priority}</td>
 <td className="px-4 py-3">
 <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
 ticket.status === 'Resolved' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-700'
}`}>
 {ticket.status}
 </span>
 </td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
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
 className={`w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-xl bg-white`}
 >
 <div className={`sticky top-0 z-10 flex items-center justify-between p-6 border-b bg-white border-slate-100`}>
 <h2 className={`text-lg font-bold text-slate-900`}>
 {editingTicket ? 'Edit Ticket' : 'Add New Ticket'}
 </h2>
 <button onClick={closeModal} className="text-slate-400 hover:text-slate-500">
 <X className="w-5 h-5"/>
 </button>
 </div>

 <div className="p-6 space-y-4">
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 <div>
 <label className="block text-xs font-bold uppercase tracking-widest mb-2">Ticket Category</label>
 <input type="text"value={formData.category || ''} onChange={(e) => setFormData({ ...formData, category: e.target.value})} className="w-full px-4 py-2 rounded-xl border border-slate-300 bg-transparent"/>
 </div>
 <div>
 <label className="block text-xs font-bold uppercase tracking-widest mb-2">Priority</label>
 <select value={formData.priority || 'Low'} onChange={(e) => setFormData({ ...formData, priority: e.target.value as any})} className="w-full px-4 py-2 rounded-xl border border-slate-300 bg-transparent">
 <option value="Low">Low</option>
 <option value="Medium">Medium</option>
 <option value="High">High</option>
 <option value="Urgent">Urgent</option>
 </select>
 </div>
 <div>
 <label className="block text-xs font-bold uppercase tracking-widest mb-2">Requester Name</label>
 <select value={formData.requesterName || ''} onChange={(e) => setFormData({ ...formData, requesterName: e.target.value})} className="w-full px-4 py-2 rounded-xl border border-slate-300 bg-transparent">
 <option value="">Select Company</option>
 {companies.map(comp => <option key={comp.id} value={comp.name}>{comp.name}</option>)}
 </select>
 </div>
 <div>
 <label className="block text-xs font-bold uppercase tracking-widest mb-2">Department</label>
 <select value={formData.department || ''} onChange={(e) => setFormData({ ...formData, department: e.target.value})} className="w-full px-4 py-2 rounded-xl border border-slate-300 bg-transparent">
 <option value="">Select Department</option>
 {departments.map(dept => <option key={dept.id} value={dept.name}>{dept.name}</option>)}
 </select>
 </div>
 <div>
 <label className="block text-xs font-bold uppercase tracking-widest mb-2">Email</label>
 <input type="email"value={formData.email || ''} onChange={(e) => setFormData({ ...formData, email: e.target.value})} className="w-full px-4 py-2 rounded-xl border border-slate-300 bg-transparent"/>
 </div>
 <div>
 <label className="block text-xs font-bold uppercase tracking-widest mb-2">Contact Number</label>
 <input type="text"value={formData.contactNumber || ''} onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value})} className="w-full px-4 py-2 rounded-xl border border-slate-300 bg-transparent"/>
 </div>
 <div className="md:col-span-2">
 <label className="block text-xs font-bold uppercase tracking-widest mb-2">Issue Description</label>
 <textarea value={formData.issueDescription || ''} onChange={(e) => setFormData({ ...formData, issueDescription: e.target.value})} rows={3} className="w-full px-4 py-2 rounded-xl border border-slate-300 bg-transparent"/>
 </div>
 <div>
 <label className="block text-xs font-bold uppercase tracking-widest mb-2">Attachment Link</label>
 <input type="text"value={formData.attachmentLink || ''} onChange={(e) => setFormData({ ...formData, attachmentLink: e.target.value})} className="w-full px-4 py-2 rounded-xl border border-slate-300 bg-transparent"/>
 </div>
 <div>
 <label className="block text-xs font-bold uppercase tracking-widest mb-2">Assigned To</label>
 <select value={formData.assignedTo || ''} onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value})} className="w-full px-4 py-2 rounded-xl border border-slate-300 bg-transparent">
 <option value="">Select Employee</option>
 {employees.map(emp => <option key={emp.id} value={emp.name}>{emp.name}</option>)}
 </select>
 </div>
 <div>
 <label className="block text-xs font-bold uppercase tracking-widest mb-2">Date Assigned</label>
 <input type="date"value={formData.dateAssigned || ''} onChange={(e) => setFormData({ ...formData, dateAssigned: e.target.value})} className="w-full px-4 py-2 rounded-xl border border-slate-300 bg-transparent"/>
 </div>
 <div>
 <label className="block text-xs font-bold uppercase tracking-widest mb-2">Status</label>
 <select value={formData.status || 'Open'} onChange={(e) => setFormData({ ...formData, status: e.target.value as any})} className="w-full px-4 py-2 rounded-xl border border-slate-300 bg-transparent">
 <option value="Open">Open</option>
 <option value="In Progress">In Progress</option>
 <option value="Pending">Pending</option>
 <option value="Resolved">Resolved</option>
 <option value="Closed">Closed</option>
 </select>
 </div>
 </div>
 </div>

 <div className={`p-6 border-t flex justify-end gap-3 bg-slate-50 border-slate-100`}>
 <button onClick={closeModal} className="px-4 py-2 rounded-xl text-sm font-medium">Cancel</button>
 <button onClick={handleSave} className="px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors text-sm font-medium">
 {editingTicket ? 'Save Changes' : 'Add Ticket'}
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
