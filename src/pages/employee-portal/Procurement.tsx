import React, { useState } from 'react';
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
import { useTheme } from '../../context/ThemeContext';
import { useCompanyData } from '../../context/CompanyDataContext';
import { useEmployees } from '../../context/EmployeeContext';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

interface RequestItem {
  id: string;
  itemName: string;
  quantity: number;
  description: string;
}

export default function EmployeeProcurement() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const { addEntity } = useCompanyData();
  const { employees } = useEmployees();
  const { user } = useAuth();
  const navigate = useNavigate();

  const currentEmployee = employees.find(emp => emp.id === user?.id);
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
    { id: '1', itemName: '', quantity: 1, description: '' },
  ]);

  const handleDataChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setRequestData(prev => ({ ...prev, [name]: value }));
  };

  const addItem = () => {
    setItems([...items, { id: Math.random().toString(36).substr(2, 9), itemName: '', quantity: 1, description: '' }]);
  };

  const removeItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  const updateItem = (id: string, field: keyof RequestItem, value: string | number) => {
    setItems(items.map(item => item.id === id ? { ...item, [field]: value } : item));
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
      // Assuming we want to stay on the page or navigate somewhere
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
        <div className="p-6 text-center">
          <h2 className="text-xl font-bold text-slate-800 dark:text-white">Access Denied</h2>
          <p className="text-slate-500">You do not have permission to create new procurement requests.</p>
        </div>
      </EmployeeLayout>
    );
  }

  return (
    <EmployeeLayout>
      <div className="space-y-6 pb-12">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <FileText className="w-6 h-6 text-indigo-600" />
            <h2 className="text-xl font-bold text-slate-800 dark:text-white">New Procurement Request</h2>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={handleSaveRequest}
              disabled={isSaving}
              className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-indigo-700 disabled:opacity-50"
            >
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Submit Request
            </button>
          </div>
        </div>

        <div className={`max-w-4xl mx-auto p-8 shadow-xl border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} rounded-xl space-y-8`}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-indigo-600 uppercase tracking-wider border-b border-indigo-50 dark:border-indigo-900/30 pb-1">Employee Information</h3>
              <div className="space-y-3">
                <InfoField label="Employee Name" name="employeeName" value={requestData.employeeName} onChange={handleDataChange} isEditing={isEditing} isDark={isDark} />
                <InfoField label="Employee ID" name="employeeId" value={requestData.employeeId} onChange={handleDataChange} isEditing={isEditing} isDark={isDark} />
                <InfoField label="Department" name="department" value={requestData.department} onChange={handleDataChange} isEditing={isEditing} isDark={isDark} />
              </div>
            </div>
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-indigo-600 uppercase tracking-wider border-b border-indigo-50 dark:border-indigo-900/30 pb-1">Request Details</h3>
              <div className="space-y-3">
                <InfoField label="Request Date" name="requestDate" value={requestData.requestDate} onChange={handleDataChange} type="date" isEditing={isEditing} isDark={isDark} />
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase mb-1 block">Priority</label>
                  <select 
                      name="priority"
                      value={requestData.priority}
                      onChange={handleDataChange}
                      className={`w-full border rounded px-3 py-1.5 text-sm outline-none focus:ring-1 focus:ring-indigo-500 ${isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200'}`}
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

          <div className="space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-2">
              <h3 className="text-sm font-bold text-indigo-600 uppercase tracking-wider">Requested Items</h3>
              <button 
                  onClick={addItem}
                  className="flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-700"
                >
                  <Plus className="w-3 h-3" />
                  Add Item
                </button>
            </div>
            <div className="overflow-x-auto border border-slate-100 dark:border-slate-800 rounded-lg">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/50 text-[10px] font-bold uppercase">
                    <th className="p-3 border-b border-slate-100 dark:border-slate-800">Item Name / Category</th>
                    <th className="p-3 border-b border-slate-100 dark:border-slate-800 w-24">Qty</th>
                    <th className="p-3 border-b border-slate-100 dark:border-slate-800">Description / Reason</th>
                    <th className="p-3 border-b border-slate-100 dark:border-slate-800 w-10"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {items.map((item) => (
                    <tr key={item.id} className="text-sm">
                      <td className="p-3">
                        <input 
                          type="text" 
                          value={item.itemName}
                          onChange={(e) => updateItem(item.id, 'itemName', e.target.value)}
                          placeholder="e.g. Wireless Keyboard"
                          className={`w-full border rounded px-2 py-1 text-sm ${isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200'}`}
                        />
                      </td>
                      <td className="p-3">
                        <input 
                          type="number" 
                          value={item.quantity}
                          onChange={(e) => updateItem(item.id, 'quantity', parseInt(e.target.value))}
                          className={`w-full border rounded px-2 py-1 text-sm ${isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200'}`}
                        />
                      </td>
                      <td className="p-3">
                        <input 
                          type="text" 
                          value={item.description}
                          onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                          placeholder="Reason for request..."
                          className={`w-full border rounded px-2 py-1 text-sm ${isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200'}`}
                        />
                      </td>
                      <td className="p-3">
                        <button 
                          onClick={() => removeItem(item.id)}
                          className="text-red-400 hover:text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
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

function InfoField({ label, name, value, onChange, type = 'text', isEditing, isDark }: any) {
  return (
    <div>
      <label className="text-[10px] font-bold text-slate-500 uppercase mb-1 block">{label}</label>
      <input 
        type={type} 
        name={name}
        value={value}
        onChange={onChange}
        className={`w-full border rounded px-3 py-1.5 text-sm outline-none focus:ring-1 focus:ring-indigo-500 ${isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200'}`}
      />
    </div>
  );
}

