import React, { useState} from 'react';
import EmployeeLayout from '../../components/EmployeeLayout';
import { 
 Plus, 
 Trash2, 
 Save, 
 Edit3, 
 FileText,
 Mail,
 Loader2,
 Briefcase
} from 'lucide-react';
import { useCompanyData} from '../../context/CompanyDataContext';
import { useEmployees} from '../../context/EmployeeContext';
import { useAuth} from '../../context/AuthContext';
import { useNavigate} from 'react-router-dom';

interface RequestItem {
 id: string;
 itemName: string;
 quantity: number;
 description: string;
}

export default function EmployeeProcurement() {
  const { addEntity} = useCompanyData();
 const { employees} = useEmployees();
 const { user} = useAuth();
 const navigate = useNavigate();

 const currentEmployee = employees.find(emp => emp.id === (user?.employeeId || user?.id));
 const hasNewRequestPermission = currentEmployee?.allowedMenus?.includes('New Request');

 const [isEditing, setIsEditing] = useState(true);
 const [isSaving, setIsSaving] = useState(false);

 const [requestData, setRequestData] = useState({
 employeeName: currentEmployee?.name || '',
 employeeId: currentEmployee?.id || '',
 department: currentEmployee?.department || '',
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
} catch (error) {
 console.error("Error saving procurement request:", error);
 alert("Failed to save request");
} finally {
 setIsSaving(false);
}
};

 if (!hasNewRequestPermission) {
 return (
 <EmployeeLayout>
 <div className="min-h-[60vh] flex items-center justify-center p-6">
 <div className={`max-w-md w-full p-10 rounded-3xl border text-center space-y-6 shadow-2xl shadow-indigo-500/10 ${
 'bg-white border-slate-100'
}`}>
 <div className={`mx-auto w-20 h-20 rounded-full flex items-center justify-center border-2 ${
 'bg-rose-50 border-rose-200 text-rose-600'
}`}>
 <Briefcase className="w-10 h-10"/>
 </div>
 <div className="space-y-2">
 <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Access Denied</h2>
 <p className="text-slate-500 leading-relaxed">
 You do not have permission to create new procurement requests. Please contact your department head.
 </p>
 </div>
 </div>
 </div>
 </EmployeeLayout>
 );
}

 return (
 <EmployeeLayout>
 <div className="space-y-8 max-w-5xl mx-auto pb-12">
 <div className="flex flex-col sm:flex-row justify-between items-end gap-4">
 <div className="flex items-center gap-4">
 <div className={`p-3 rounded-2xl bg-indigo-50 text-indigo-600`}>
 <FileText className="w-8 h-8"/>
 </div>
 <div>
 <h1 className="text-3xl font-bold text-slate-900 tracking-tight">New Procurement Request</h1>
 <p className="text-slate-500 mt-1">Submit a new request for equipment or supplies.</p>
 </div>
 </div>
 <button 
 onClick={handleSaveRequest}
 disabled={isSaving}
 className="flex items-center gap-2 bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-500/20 transition-all active:scale-95 disabled:opacity-50"
 >
 {isSaving ? <Loader2 className="w-5 h-5 animate-spin"/> : <Save className="w-5 h-5"/>}
 Submit Request
 </button>
 </div>

 <div className={`p-8 rounded-3xl border shadow-xl bg-white border-slate-100 space-y-10`}>
 <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
 <div className="space-y-6">
 <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
 <h3 className="text-sm font-bold text-indigo-600 uppercase tracking-widest">Employee Information</h3>
 </div>
 <div className="space-y-4">
 <InfoField label="Employee Name"name="employeeName"value={requestData.employeeName} onChange={handleDataChange} isEditing={isEditing}  />
 <InfoField label="Employee ID"name="employeeId"value={requestData.employeeId} onChange={handleDataChange} isEditing={isEditing}  />
 <InfoField label="Department"name="department"value={requestData.department} onChange={handleDataChange} isEditing={isEditing}  />
 </div>
 </div>
 <div className="space-y-6">
 <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
 <h3 className="text-sm font-bold text-indigo-600 uppercase tracking-widest">Request Details</h3>
 </div>
 <div className="space-y-4">
 <InfoField label="Request Date"name="requestDate"value={requestData.requestDate} onChange={handleDataChange} type="date"isEditing={isEditing}  />
 <div>
 <label className="text-[10px] font-bold text-slate-500 uppercase mb-1.5 block tracking-wider">Priority Level</label>
 <select 
 name="priority"
 value={requestData.priority}
 onChange={handleDataChange}
 className={`w-full border rounded-xl px-4 py-2.5 text-sm outline-none transition-all focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-slate-50 border-slate-200 text-slate-900`}
 >
 <option>Low</option>
 <option>Normal</option>
 <option>High</option>
 <option>Urgent</option>
 </select>
 </div>
 </div>
 </div>
 </div>

 <div className="space-y-6">
 <div className="flex justify-between items-center border-b border-slate-100 pb-2">
 <h3 className="text-sm font-bold text-indigo-600 uppercase tracking-widest">Requested Items</h3>
 <button 
 onClick={addItem}
 className="flex items-center gap-2 text-xs font-bold text-indigo-600 hover:text-indigo-700 bg-indigo-50 px-3 py-1.5 rounded-lg transition-colors"
 >
 <Plus className="w-4 h-4"/>
 Add New Item
 </button>
 </div>
 <div className="overflow-hidden border border-slate-100 rounded-2xl">
 <table className="w-full text-left border-collapse">
 <thead>
 <tr className="bg-slate-50 text-[10px] font-bold uppercase tracking-wider text-slate-500">
 <th className="p-4 border-b border-slate-100">Item Name / Category</th>
 <th className="p-4 border-b border-slate-100 w-24">Qty</th>
 <th className="p-4 border-b border-slate-100">Description / Reason</th>
 <th className="p-4 border-b border-slate-100 w-12"></th>
 </tr>
 </thead>
 <tbody className="divide-y divide-slate-100">
 {items.map((item) => (
 <tr key={item.id} className="group hover:bg-slate-50/50 transition-colors">
 <td className="p-4">
 <input 
 type="text"
 value={item.itemName}
 onChange={(e) => updateItem(item.id, 'itemName', e.target.value)}
 placeholder="e.g. Wireless Keyboard"
 className={`w-full border rounded-xl px-3 py-2 text-sm transition-all focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white border-slate-200`}
 />
 </td>
 <td className="p-4">
 <input 
 type="number"
 value={item.quantity}
 onChange={(e) => updateItem(item.id, 'quantity', parseInt(e.target.value))}
 className={`w-full border rounded-xl px-3 py-2 text-sm transition-all focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white border-slate-200`}
 />
 </td>
 <td className="p-4">
 <input 
 type="text"
 value={item.description}
 onChange={(e) => updateItem(item.id, 'description', e.target.value)}
 placeholder="Reason for request..."
 className={`w-full border rounded-xl px-3 py-2 text-sm transition-all focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white border-slate-200`}
 />
 </td>
 <td className="p-4">
 <button 
 onClick={() => removeItem(item.id)}
 className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all"
 >
 <Trash2 className="w-5 h-5"/>
 </button>
 </td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 </div>
 </div>
 </div>
 </EmployeeLayout>
 );
}

function InfoField({ label, name, value, onChange, type = 'text', isEditing, }: any) {
 return (
 <div>
 <label className="text-[10px] font-bold text-slate-500 uppercase mb-1.5 block tracking-wider">{label}</label>
 <input 
 type={type} 
 name={name}
 value={value}
 onChange={onChange}
 className={`w-full border rounded-xl px-4 py-2.5 text-sm outline-none transition-all focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-slate-50 border-slate-200 text-slate-900`}
 />
 </div>
 );
}

