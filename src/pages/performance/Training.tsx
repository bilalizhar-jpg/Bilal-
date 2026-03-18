import React, { useState} from 'react';
import { Plus, Search, Filter, Trash2, Edit3} from 'lucide-react';
import AdminLayout from '../../components/AdminLayout';
import { useEmployees} from '../../context/EmployeeContext';
import { useTraining, TrainingProgram} from '../../context/TrainingContext';
import TrainingModal from '../../components/performance/TrainingModal';

export default function Training() {
 const { employees, updateEmployee} = useEmployees();
 const { programs, addProgram} = useTraining();
  const [isModalOpen, setIsModalOpen] = useState(false);
 
 const handleSave = (data: any) => {
 console.log('New program:', data);
 addProgram({
 name: data.name,
 trainingType: data.trainingType,
 description: data.description,
 duration: data.duration,
 cost: Number(data.cost),
 capacity: Number(data.capacity),
 status: data.status === 'active' ? 'Active' : 'Inactive',
 materials: data.materials,
 prerequisites: data.prerequisites,
 isMandatory: data.isMandatory,
 allowSelfEnrollment: data.allowSelfEnrollment,
 selectedEmployees: data.selectedEmployees,
 acceptedEmployees: [],
});

 // Send notifications to selected employees
 data.selectedEmployees.forEach((empId: string) => {
 const emp = employees.find(e => e.id === empId);
 if (emp) {
 const currentNotifications = emp.notifications || [];
 updateEmployee(emp.id, { notifications: [...currentNotifications,`You have been assigned to: ${data.name}`]});
}
});
 setIsModalOpen(false);
};

 return (
 <AdminLayout>
 <div className="space-y-6">
 <div className="flex justify-between items-center">
 <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
 Training Programs
 </h2>
 <button 
 onClick={() => setIsModalOpen(true)}
 className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-emerald-700"
 >
 <Plus className="w-4 h-4"/>
 Add Training Program
 </button>
 </div>

 <TrainingModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSave} />

 <div className={`rounded-xl border bg-white border-slate-200 shadow-sm p-4 flex items-center justify-between`}>
 <div className="flex items-center gap-2">
 <div className="relative">
 <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"/>
 <input 
 type="text"
 placeholder="Search..."
 className={`pl-10 pr-4 py-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500 bg-white border-slate-200`}
 />
 </div>
 <button className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-emerald-700">
 <Search className="w-4 h-4"/>
 Search
 </button>
 <button className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 border border-slate-200 text-slate-600 hover:bg-slate-50`}>
 <Filter className="w-4 h-4"/>
 Filters
 </button>
 </div>
 <div className="flex items-center gap-2 text-sm text-slate-500">
 <span>Per Page:</span>
 <select className={`border rounded-lg px-2 py-1 outline-none bg-white border-slate-200`}>
 <option>10</option>
 <option>25</option>
 <option>50</option>
 </select>
 </div>
 </div>

 <div className={`rounded-xl border bg-white border-slate-200 shadow-sm overflow-hidden`}>
 <table className="w-full text-sm">
 <thead className={`bg-slate-50`}>
 <tr>
 <th className="px-4 py-3 text-left font-bold text-slate-500">#</th>
 <th className="px-4 py-3 text-left font-bold text-slate-500">Name</th>
 <th className="px-4 py-3 text-left font-bold text-slate-500">Status</th>
 <th className="px-4 py-3 text-left font-bold text-slate-500">Duration</th>
 <th className="px-4 py-3 text-left font-bold text-slate-500">Cost</th>
 <th className="px-4 py-3 text-left font-bold text-slate-500">Capacity</th>
 <th className="px-4 py-3 text-left font-bold text-slate-500">Type</th>
 <th className="px-4 py-3 text-left font-bold text-slate-500">Employees (Assigned/Accepted)</th>
 <th className="px-4 py-3 text-left font-bold text-slate-500">Actions</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-slate-100">
 {programs.map((program, idx) => (
 <tr key={program.id} className="hover:bg-slate-50">
 <td className="px-4 py-3">{idx + 1}</td>
 <td className="px-4 py-3 font-medium">{program.name}</td>
 <td className="px-4 py-3">
 <span className={`px-2 py-1 rounded-full text-xs font-bold ${program.status === 'Active' ? 'bg-emerald-100 text-emerald-700 ' : 'bg-slate-100 text-slate-700 '}`}>
 {program.status}
 </span>
 </td>
 <td className="px-4 py-3">{program.duration}</td>
 <td className="px-4 py-3">${program.cost}</td>
 <td className="px-4 py-3">{program.capacity}</td>
 <td className="px-4 py-3">{program.trainingType}</td>
 <td className="px-4 py-3">{program.selectedEmployees.length} / {program.acceptedEmployees.length}</td>
 <td className="px-4 py-3">
 <div className="flex gap-2">
 <button className="p-1 text-indigo-600 hover:bg-indigo-50 rounded"><Edit3 className="w-4 h-4"/></button>
 <button className="p-1 text-red-600 hover:bg-red-50 rounded"><Trash2 className="w-4 h-4"/></button>
 </div>
 </td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 </div>
 </AdminLayout>
 );
}
