import React, { useState} from 'react';
import { 
 Plus, 
 Trash2, 
 Printer, 
 Download, 
 Save, 
 Edit3, 
 Send,
 FileText,
 Mail,
 Loader2
} from 'lucide-react';
import AdminLayout from '../../components/AdminLayout';
import { useCompanyData} from '../../context/CompanyDataContext';
import { useNavigate} from 'react-router-dom';

interface RequestItem {
 id: string;
 itemName: string;
 quantity: number;
 description: string;
}

export default function ProcurementRequest() {
 const { addEntity} = useCompanyData();
  const navigate = useNavigate();
 const [isEditing, setIsEditing] = useState(true);
 const [isSaving, setIsSaving] = useState(false);

 const [requestData, setRequestData] = useState({
 employeeName: '',
 employeeId: '',
 department: '',
 requestDate: new Date().toISOString().split('T')[0],
 priority: 'Normal',
 status: 'Pending',
 hrEmail: 'hr@company.com',
});

 const [items, setItems] = useState<RequestItem[]>([
 { id: '1', itemName: '', quantity: 1, description: ''},
 ]);

 const handleDataChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
 const { name, value} = e.target;
 setRequestData(prev => ({ ...prev, [name]: value}));
};

 const addItem = () => {
 setItems([...items, { id: Math.random().toString(36).substr(2, 9), itemName: '', quantity: 1, description: ''}]);
};

 const removeItem = (id: string) => {
 setItems(items.filter(item => item.id !== id));
};

 const updateItem = (id: string, field: keyof RequestItem, value: string | number) => {
 setItems(items.map(item => item.id === id ? { ...item, [field]: value} : item));
};

 const handleSaveRequest = async () => {
 if (!requestData.employeeName || items.some(item => !item.itemName)) {
 alert("Please fill in all required fields (Employee Name and Item Names)");
 return;
}

 setIsSaving(true);
 try {
 const payload = {
 ...requestData,
 items,
 createdAt: new Date().toISOString(),
};
 await addEntity('procurementRequests', payload);
 alert("Procurement request saved successfully!");
 setIsEditing(false);
 navigate('/procurement/history');
} catch (error) {
 console.error("Error saving procurement request:", error);
 alert("Failed to save request");
} finally {
 setIsSaving(false);
}
};

 const handleSendRequest = async () => {
 if (!requestData.employeeName || items.some(item => !item.itemName)) {
 alert("Please fill in all required fields before sending");
 return;
}

 setIsSaving(true);
 try {
 const payload = {
 ...requestData,
 items,
 status: 'Sent',
 sentAt: new Date().toISOString(),
};
 await addEntity('procurementRequests', payload);
 alert(`Request sent to HR (${requestData.hrEmail}) successfully!`);
 setIsEditing(false);
 navigate('/procurement/history');
} catch (error) {
 console.error("Error sending procurement request:", error);
 alert("Failed to send request");
} finally {
 setIsSaving(false);
}
};

 return (
 <AdminLayout>
 <div className="space-y-6 pb-12">
 <div className="flex justify-between items-center no-print">
 <div className="flex items-center gap-2">
 <FileText className="w-6 h-6 text-indigo-600"/>
 <h2 className="text-xl font-bold text-slate-800">Procurement Request</h2>
 </div>
 <div className="flex gap-2">
 <button 
 onClick={() => setIsEditing(!isEditing)}
 className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${
 isEditing ? 'bg-amber-500 text-white' : 'bg-indigo-600 text-white hover:bg-indigo-700'
}`}
 >
 {isEditing ? <Save className="w-4 h-4"/> : <Edit3 className="w-4 h-4"/>}
 {isEditing ? 'Save Draft' : 'Edit Request'}
 </button>
 <button 
 onClick={handleSaveRequest}
 disabled={isSaving}
 className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-indigo-700 disabled:opacity-50"
 >
 {isSaving ? <Loader2 className="w-4 h-4 animate-spin"/> : <Save className="w-4 h-4"/>}
 Save Request
 </button>
 <button 
 onClick={handleSendRequest}
 disabled={isSaving}
 className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-emerald-700 disabled:opacity-50"
 >
 {isSaving ? <Loader2 className="w-4 h-4 animate-spin"/> : <Mail className="w-4 h-4"/>}
 Send to HR
 </button>
 </div>
 </div>

 <div className={`max-w-4xl mx-auto p-8 shadow-xl border bg-white border-slate-200 rounded-xl space-y-8`}>
 <div className="text-center border-b border-slate-100 pb-6">
 <h1 className="text-2xl font-bold text-slate-900 uppercase tracking-wider">Stationery & Computer Item Request</h1>
 <p className="text-slate-500 text-sm">Submit your request for office supplies or technical equipment</p>
 </div>

 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
 <div className="space-y-4">
 <h3 className="text-sm font-bold text-indigo-600 uppercase tracking-wider border-b border-indigo-50 pb-1">Employee Information</h3>
 <div className="space-y-3">
 <InfoField label="Employee Name"name="employeeName"value={requestData.employeeName} onChange={handleDataChange} isEditing={isEditing}  />
 <InfoField label="Employee ID"name="employeeId"value={requestData.employeeId} onChange={handleDataChange} isEditing={isEditing}  />
 <InfoField label="Department"name="department"value={requestData.department} onChange={handleDataChange} isEditing={isEditing}  />
 </div>
 </div>
 <div className="space-y-4">
 <h3 className="text-sm font-bold text-indigo-600 uppercase tracking-wider border-b border-indigo-50 pb-1">Request Details</h3>
 <div className="space-y-3">
 <InfoField label="Request Date"name="requestDate"value={requestData.requestDate} onChange={handleDataChange} type="date"isEditing={isEditing}  />
 <div>
 <label className="text-[10px] font-bold text-slate-500 uppercase mb-1 block">Priority</label>
 {isEditing ? (
 <select 
 name="priority"
 value={requestData.priority}
 onChange={handleDataChange}
 className={`w-full border rounded px-3 py-1.5 text-sm outline-none focus:ring-1 focus:ring-indigo-500 bg-white border-slate-200`}
 >
 <option>Low</option>
 <option>Normal</option>
 <option>High</option>
 <option>Urgent</option>
 </select>
 ) : (
 <p className="text-sm font-medium text-slate-800">{requestData.priority}</p>
 )}
 </div>
 <InfoField label="HR Email (Recipient)"name="hrEmail"value={requestData.hrEmail} onChange={handleDataChange} isEditing={isEditing}  />
 </div>
 </div>
 </div>

 <div className="space-y-4">
 <div className="flex justify-between items-center border-b border-slate-100 pb-2">
 <h3 className="text-sm font-bold text-indigo-600 uppercase tracking-wider">Requested Items</h3>
 {isEditing && (
 <button 
 onClick={addItem}
 className="flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-700"
 >
 <Plus className="w-3 h-3"/>
 Add Item
 </button>
 )}
 </div>
 <div className="overflow-x-auto border border-slate-100 rounded-lg">
 <table className="w-full text-left border-collapse">
 <thead>
 <tr className="bg-slate-50 text-[10px] font-bold uppercase">
 <th className="p-3 border-b border-slate-100">Item Name / Category</th>
 <th className="p-3 border-b border-slate-100 w-24">Qty</th>
 <th className="p-3 border-b border-slate-100">Description / Reason</th>
 {isEditing && <th className="p-3 border-b border-slate-100 w-10"></th>}
 </tr>
 </thead>
 <tbody className="divide-y divide-slate-100">
 {items.map((item) => (
 <tr key={item.id} className="text-sm">
 <td className="p-3">
 {isEditing ? (
 <input 
 type="text"
 value={item.itemName}
 onChange={(e) => updateItem(item.id, 'itemName', e.target.value)}
 placeholder="e.g. Wireless Keyboard"
 className={`w-full border rounded px-2 py-1 text-sm bg-white border-slate-200`}
 />
 ) : (
 <span className="font-medium text-slate-800">{item.itemName}</span>
 )}
 </td>
 <td className="p-3">
 {isEditing ? (
 <input 
 type="number"
 value={item.quantity}
 onChange={(e) => updateItem(item.id, 'quantity', parseInt(e.target.value))}
 className={`w-full border rounded px-2 py-1 text-sm bg-white border-slate-200`}
 />
 ) : (
 <span className="text-slate-600">{item.quantity}</span>
 )}
 </td>
 <td className="p-3">
 {isEditing ? (
 <input 
 type="text"
 value={item.description}
 onChange={(e) => updateItem(item.id, 'description', e.target.value)}
 placeholder="Reason for request..."
 className={`w-full border rounded px-2 py-1 text-sm bg-white border-slate-200`}
 />
 ) : (
 <span className="text-slate-600 italic">{item.description}</span>
 )}
 </td>
 {isEditing && (
 <td className="p-3">
 <button 
 onClick={() => removeItem(item.id)}
 className="text-red-400 hover:text-red-600"
 >
 <Trash2 className="w-4 h-4"/>
 </button>
 </td>
 )}
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 </div>

 <div className="pt-6 border-t border-slate-100">
 <p className="text-[10px] text-slate-400 uppercase font-bold mb-2">Status: <span className={`ml-2 px-2 py-0.5 rounded-full ${requestData.status === 'Pending' ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'}`}>{requestData.status}</span></p>
 <p className="text-xs text-slate-500 italic">Note: Once submitted, the HR department will review your request and you will receive an email notification regarding the approval status.</p>
 </div>
 </div>
 </div>
 </AdminLayout>
 );
}

function InfoField({ label, name, value, onChange, type = 'text', isEditing, }: any) {
 return (
 <div>
 <label className="text-[10px] font-bold text-slate-500 uppercase mb-1 block">{label}</label>
 {isEditing ? (
 <input 
 type={type} 
 name={name}
 value={value}
 onChange={onChange}
 className={`w-full border rounded px-3 py-1.5 text-sm outline-none focus:ring-1 focus:ring-indigo-500 bg-white border-slate-200`}
 />
 ) : (
 <p className="text-sm font-medium text-slate-800">{value || 'N/A'}</p>
 )}
 </div>
 );
}
