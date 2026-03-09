import React, { useState } from 'react';
import { X, Upload } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useEmployees } from '../../context/EmployeeContext';

interface TrainingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
}

export default function TrainingModal({ isOpen, onClose, onSave }: TrainingModalProps) {
  const { theme } = useTheme();
  const { employees } = useEmployees();
  const isDark = theme === 'dark';
  const [formData, setFormData] = useState({
    name: '',
    trainingType: '',
    description: '',
    duration: '',
    cost: '',
    capacity: '',
    status: '',
    materials: null,
    prerequisites: '',
    isMandatory: false,
    allowSelfEnrollment: false,
    selectedEmployees: [] as string[],
  });

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      setFormData(prev => ({ ...prev, [name]: (e.target as HTMLInputElement).checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const toggleEmployee = (employeeId: string) => {
    setFormData(prev => {
      const selected = prev.selectedEmployees.includes(employeeId)
        ? prev.selectedEmployees.filter(id => id !== employeeId)
        : [...prev.selectedEmployees, employeeId];
      return { ...prev, selectedEmployees: selected };
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className={`w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden ${isDark ? 'bg-slate-900 text-white' : 'bg-white text-slate-800'}`}>
        <div className={`flex justify-between items-center p-6 border-b ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
          <h2 className="text-xl font-bold">Add New Training Program</h2>
          <button onClick={onClose} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          <div>
            <label className="block text-sm font-medium mb-1">Name *</label>
            <input type="text" name="name" value={formData.name} onChange={handleChange} className={`w-full p-2 rounded-lg border ${isDark ? 'bg-slate-800 border-slate-700' : 'border-slate-200'}`} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Training Type *</label>
            <input type="text" name="trainingType" value={formData.trainingType} onChange={handleChange} className={`w-full p-2 rounded-lg border ${isDark ? 'bg-slate-800 border-slate-700' : 'border-slate-200'}`} placeholder="Enter training type" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Select Employees</label>
            <div className={`w-full p-2 rounded-lg border max-h-32 overflow-y-auto ${isDark ? 'bg-slate-800 border-slate-700' : 'border-slate-200'}`}>
              {employees.map(emp => (
                <div key={emp.id} className="flex items-center gap-2 py-1">
                  <input type="checkbox" checked={formData.selectedEmployees.includes(emp.id)} onChange={() => toggleEmployee(emp.id)} />
                  <span className="text-sm">{emp.name}</span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea name="description" value={formData.description} onChange={handleChange} className={`w-full p-2 rounded-lg border ${isDark ? 'bg-slate-800 border-slate-700' : 'border-slate-200'}`} rows={3} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Duration (hours)</label>
              <input type="number" name="duration" value={formData.duration} onChange={handleChange} className={`w-full p-2 rounded-lg border ${isDark ? 'bg-slate-800 border-slate-700' : 'border-slate-200'}`} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Cost</label>
              <input type="number" name="cost" value={formData.cost} onChange={handleChange} className={`w-full p-2 rounded-lg border ${isDark ? 'bg-slate-800 border-slate-700' : 'border-slate-200'}`} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Capacity</label>
            <input type="number" name="capacity" value={formData.capacity} onChange={handleChange} className={`w-full p-2 rounded-lg border ${isDark ? 'bg-slate-800 border-slate-700' : 'border-slate-200'}`} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Status *</label>
            <select name="status" value={formData.status} onChange={handleChange} className={`w-full p-2 rounded-lg border ${isDark ? 'bg-slate-800 border-slate-700' : 'border-slate-200'}`}>
              <option value="">Select Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Materials</label>
            <div className="flex items-center gap-2">
              <input type="text" readOnly placeholder="Select materials file..." className={`flex-1 p-2 rounded-lg border ${isDark ? 'bg-slate-800 border-slate-700' : 'border-slate-200'}`} />
              <button className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-sm font-bold">
                <Upload className="w-4 h-4" /> Browse
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Prerequisites</label>
            <textarea name="prerequisites" value={formData.prerequisites} onChange={handleChange} className={`w-full p-2 rounded-lg border ${isDark ? 'bg-slate-800 border-slate-700' : 'border-slate-200'}`} rows={3} />
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" name="isMandatory" checked={formData.isMandatory} onChange={handleChange} className="w-4 h-4" />
            <label className="text-sm">Mandatory Training</label>
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" name="allowSelfEnrollment" checked={formData.allowSelfEnrollment} onChange={handleChange} className="w-4 h-4" />
            <label className="text-sm">Allow Self-Enrollment</label>
          </div>
        </div>
        <div className={`flex justify-end gap-3 p-6 border-t ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
          <button onClick={onClose} className="px-4 py-2 rounded-lg text-sm font-bold hover:bg-slate-100 dark:hover:bg-slate-800">Cancel</button>
          <button onClick={() => onSave(formData)} className="px-4 py-2 rounded-lg text-sm font-bold bg-emerald-600 text-white hover:bg-emerald-700">Save</button>
        </div>
      </div>
    </div>
  );
}
