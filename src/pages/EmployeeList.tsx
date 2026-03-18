import React, { useState} from 'react';
import { motion, AnimatePresence} from 'motion/react';
import * as XLSX from 'xlsx';
import { 
 Search,
 Plus, 
 Edit, 
 Trash2, 
 X, 
 FileSpreadsheet, 
 FileText as FileCsv, 
 Filter, 
 RotateCcw,
 RefreshCw,
 Eye,
 Settings,
 Key,
 Shield,
 AlertCircle,
 Upload,
 User
} from 'lucide-react';

import AdminLayout from '../components/AdminLayout';
import { useEmployees, Employee, CustomField} from '../context/EmployeeContext';
import { useCompanyData} from '../context/CompanyDataContext';

type TabType = 'active' | 'positions' | 'inactive';

export default function EmployeeList() {
  const { employees, addEmployee, addEmployees, updateEmployee, deleteEmployee, regenerateCredentials} = useEmployees();
 const { departments, designations, addEntity} = useCompanyData();
 const [activeTab, setActiveTab] = useState<TabType>('active');
 const [showFilters, setShowFilters] = useState(true);
 const [searchTerm, setSearchTerm] = useState('');
 const [isModalOpen, setIsModalOpen] = useState(false);
 const [isCredentialsModalOpen, setIsCredentialsModalOpen] = useState(false);
 const [isReportModalOpen, setIsReportModalOpen] = useState(false);
 const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
 const [selectedEmployeeForCredentials, setSelectedEmployeeForCredentials] = useState<Employee | null>(null);
 const [employeeToDelete, setEmployeeToDelete] = useState<string | null>(null);
 const fileInputRef = React.useRef<HTMLInputElement>(null);
 
 const [filters, setFilters] = useState<Record<string, string>>({
 employeeName: '',
 employeeId: '',
 employeeType: '',
 department: '',
 designation: '',
 bloodGroup: '',
 location: '',
 city: ''
});

 const [isViewOnly, setIsViewOnly] = useState(false);
 const [formData, setFormData] = useState<Partial<Employee>>({
 name: '',
 employeeId: '',
 email: '',
 mobile: '',
 dob: '',
 designation: '',
 joiningDate: '',
 status: 'Active',
 bloodGroup: '',
 nationalId: '',
 department: '',
 employeeType: 'Full Time',
 location: '',
 city: '',
 customFields: [],
 salary: 0,
 taxDeduction: 0,
 bankName: '',
 bankAccountNo: '',
 modeOfPayment: ''
});

 const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
 const { name, value} = e.target;
 setFilters(prev => ({ ...prev, [name]: value}));
};

 const resetFilters = () => {
 setFilters({
 employeeName: '',
 employeeId: '',
 employeeType: '',
 department: '',
 designation: '',
 bloodGroup: '',
 location: '',
 city: ''
});
 setSearchTerm('');
};

 const handleSave = async (e: React.FormEvent) => {
 e.preventDefault();
 if (isViewOnly) {
 setIsModalOpen(false);
 return;
}

 // Check if designation is new and add it to master list
 if (formData.designation) {
 const exists = designations.some(d => d.name.toLowerCase() === formData.designation.toLowerCase());
 if (!exists) {
 await addEntity('designations', {
 name: formData.designation,
 status: 'Active'
});
}
}

 if (editingEmployee) {
 updateEmployee(editingEmployee.id, formData);
} else {
 const newEmployee = {
 ...formData,
 id: Math.random().toString(36).substr(2, 9),
} as Employee;
 addEmployee(newEmployee);
 // Open report modal to show credentials
 setTimeout(() => setIsReportModalOpen(true), 500);
}
 setIsModalOpen(false);
 setEditingEmployee(null);
 resetFormData();
};

 const resetFormData = () => {
 setFormData({
 name: '',
 employeeId: '',
 email: '',
 mobile: '',
 dob: '',
 designation: '',
 joiningDate: '',
 status: 'Active',
 bloodGroup: '',
 nationalId: '',
 department: '',
 employeeType: 'Full Time',
 location: '',
 city: '',
 customFields: [],
 salary: 0,
 taxDeduction: 0,
 bankName: '',
 bankAccountNo: '',
 modeOfPayment: ''
});
};

 const handleDelete = (id: string) => {
 setEmployeeToDelete(id);
};

 const handleRefresh = (id: string) => {
 // Simulate refresh
 alert(`Refreshed data for employee ID: ${id}`);
};

 const openEditModal = (emp: Employee) => {
 setEditingEmployee(emp);
 setFormData(emp);
 setIsViewOnly(false);
 setIsModalOpen(true);
};

 const openViewModal = (emp: Employee) => {
 setEditingEmployee(emp);
 setFormData(emp);
 setIsViewOnly(true);
 setIsModalOpen(true);
};

 const openAddModal = () => {
 setEditingEmployee(null);
 resetFormData();
 setIsViewOnly(false);
 setIsModalOpen(true);
};

 const openCredentialsModal = (emp: Employee) => {
 setSelectedEmployeeForCredentials(emp);
 setIsCredentialsModalOpen(true);
};

 const handleRegenerateCredentials = () => {
 if (selectedEmployeeForCredentials) {
 if (window.confirm('Are you sure you want to regenerate credentials? The old password will stop working.')) {
 regenerateCredentials(selectedEmployeeForCredentials.id);
 setIsCredentialsModalOpen(false);
 alert('Credentials regenerated successfully.');
}
}
};

 const addCustomField = () => {
 setFormData(prev => ({
 ...prev,
 customFields: [...(prev.customFields || []), { key: '', value: ''}]
}));
};

 const updateCustomField = (index: number, field: 'key' | 'value', value: string) => {
 const updatedFields = [...(formData.customFields || [])];
 updatedFields[index][field] = value;
 setFormData(prev => ({ ...prev, customFields: updatedFields}));
};

 const removeCustomField = (index: number) => {
 setFormData(prev => ({
 ...prev,
 customFields: (prev.customFields || []).filter((_, i) => i !== index)
}));
};

 const handleImportClick = () => {
 fileInputRef.current?.click();
};

 const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
 const file = e.target.files?.[0];
 if (file) {
 const reader = new FileReader();
 reader.onload = (evt) => {
 try {
 const bstr = evt.target?.result;
 const wb = XLSX.read(bstr, { type: 'binary'});
 const wsname = wb.SheetNames[0];
 const ws = wb.Sheets[wsname];
 const data = XLSX.utils.sheet_to_json(ws);
 if (data && data.length > 0) {
 const newEmployees = data.map((row: any) => ({
 id: Math.random().toString(36).substr(2, 9),
 name: row['Employee Name'] || '',
 employeeId: row['Employee ID'] || '',
 email: row['Email'] || '',
 mobile: row['Mobile'] || '',
 dob: row['Date of Birth'] || '',
 designation: row['Designation'] || '',
 joiningDate: row['Joining Date'] || '',
 status: row['Status'] || 'Active',
 bloodGroup: row['Blood Group'] || '',
 nationalId: row['National ID'] || '',
 department: row['Department'] || '',
 employeeType: row['Employee Type'] || 'Full Time',
 location: row['Location'] || '',
 city: row['City'] || '',
 customFields: []
})) as unknown as Employee[];

 addEmployees(newEmployees);
 alert(`Successfully imported ${newEmployees.length} employees.`);
 // Open report modal to show credentials
 setTimeout(() => setIsReportModalOpen(true), 500);
}
} catch (error) {
 console.error("Error parsing file:", error);
 alert("Error parsing file. Please make sure it's a valid Excel or CSV file matching the demo pattern.");
}
};
 reader.readAsBinaryString(file);

 if (fileInputRef.current) {
 fileInputRef.current.value = '';
}
}
};

 const handleDownloadDemo = () => {
 const demoData = [
 {
 'Employee Name': 'John Doe',
 'Employee ID': '000045',
 'Email': 'john@example.com',
 'Mobile': '+1234567890',
 'Date of Birth': '1990-01-01',
 'Designation': 'Developer',
 'Joining Date': '2023-01-01',
 'Status': 'Active',
 'Blood Group': 'O+',
 'National ID': '123456789',
 'Department': 'Production',
 'Employee Type': 'Full Time',
 'Country': 'USA'
}
 ];
 
 const ws = XLSX.utils.json_to_sheet(demoData);
 const wb = XLSX.utils.book_new();
 XLSX.utils.book_append_sheet(wb, ws,"Employees");
 XLSX.writeFile(wb,"demo_employee_import.xlsx");
};

 const tabEmployees = employees.filter(emp => 
 activeTab === 'active' ? emp.status === 'Active' : 
 activeTab === 'inactive' ? emp.status !== 'Active' : true
 );

 const filteredEmployees = tabEmployees.filter(emp => {
 // Global search
 const matchesGlobalSearch = emp.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
 emp.employeeId.includes(searchTerm);
 
 // Detailed filters
 const matchesName = !filters.employeeName || emp.name === filters.employeeName;
 const matchesId = !filters.employeeId || emp.employeeId === filters.employeeId;
 const matchesType = !filters.employeeType || emp.employeeType === filters.employeeType;
 const matchesDept = !filters.department || emp.department === filters.department;
 const matchesDesig = !filters.designation || emp.designation === filters.designation;
 const matchesBlood = !filters.bloodGroup || emp.bloodGroup === filters.bloodGroup;
 const matchesLocation = !filters.location || emp.location === filters.location;
 const matchesCity = !filters.city || emp.city === filters.city;

 // Custom fields filtering
 const matchesCustomFields = Object.keys(filters).every(key => {
 if (['employeeName', 'employeeId', 'employeeType', 'department', 'designation', 'bloodGroup', 'location', 'city'].includes(key)) return true;
 if (!filters[key]) return true;
 const field = emp.customFields?.find(f => f.key === key);
 return field?.value === filters[key];
});

 return matchesGlobalSearch && matchesName && matchesId && 
 matchesType && matchesDept && matchesDesig && matchesBlood && 
 matchesLocation && matchesCity && matchesCustomFields;
});

 const uniqueDesignations = Array.from(new Set(employees.map(emp => emp.designation).filter(Boolean)));
 const allCustomFieldKeys = Array.from(new Set(employees.flatMap(e => e.customFields?.map(f => f.key) || [])));

 return (
 <AdminLayout>
 <div className="space-y-6">
 {/* Tabs */}
 <div className="flex items-center gap-2 mb-6">
 <button 
 onClick={() => setActiveTab('active')}
 className={`px-4 py-2 rounded text-sm font-black uppercase tracking-tight transition-colors ${
 activeTab === 'active' ? 'bg-[#00FFCC] text-[#1E1E2F]' : 'bg-[#2A2A3D] text-[#B0B0C3] hover:bg-[#3A3A5D]'
}`}
 >
 Employee
 </button>
 <button 
 onClick={() => setActiveTab('positions')}
 className={`px-4 py-2 rounded text-sm font-black uppercase tracking-tight transition-colors ${
 activeTab === 'positions' ? 'bg-[#00FFCC] text-[#1E1E2F]' : 'bg-[#2A2A3D] text-[#B0B0C3] hover:bg-[#3A3A5D]'
}`}
 >
 Positions
 </button>
 <button 
 onClick={() => setActiveTab('inactive')}
 className={`px-4 py-2 rounded text-sm font-black uppercase tracking-tight transition-colors ${
 activeTab === 'inactive' ? 'bg-[#00FFCC] text-[#1E1E2F]' : 'bg-[#2A2A3D] text-[#B0B0C3] hover:bg-[#3A3A5D]'
}`}
 >
 Inactive employees list
 </button>
 </div>

 <div className="bg-[#2A2A3D] rounded-2xl border border-white/5 shadow-[0_4px_20px_rgba(0,255,204,0.05)] overflow-hidden">
 <div className="p-4 border-b border-white/5 flex justify-between items-center">
 <h2 className="font-black text-white uppercase tracking-tight">Employee list</h2>
 <div className="flex gap-2 items-center">
 <button 
 onClick={handleDownloadDemo}
 className="text-xs font-black text-[#00FFCC] hover:text-[#00D1FF] underline mr-2"
 >
 Download Demo File
 </button>
 <input 
 type="file"
 ref={fileInputRef} 
 onChange={handleFileUpload} 
 accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
 className="hidden"
 />
 <button 
 onClick={handleImportClick}
 className="bg-transparent border border-[#00FFCC] text-[#00FFCC] px-3 py-1.5 rounded text-xs font-black uppercase hover:bg-[#00FFCC] hover:text-[#1E1E2F] flex items-center gap-1.5"
 >
 <FileSpreadsheet className="w-3.5 h-3.5"/>
 Import Employee List
 </button>
 <button 
 onClick={() => setIsReportModalOpen(true)}
 className="bg-transparent border border-[#00D1FF] text-[#00D1FF] px-3 py-1.5 rounded text-xs font-black uppercase hover:bg-[#00D1FF] hover:text-[#1E1E2F] flex items-center gap-1.5"
 >
 <Shield className="w-3.5 h-3.5"/>
 Credentials Report
 </button>
 <button 
 onClick={() => setShowFilters(!showFilters)}
 className="bg-transparent border border-[#00FFCC] text-[#00FFCC] px-3 py-1.5 rounded text-xs font-black uppercase hover:bg-[#00FFCC] hover:text-[#1E1E2F] flex items-center gap-1.5"
 >
 <Filter className="w-3.5 h-3.5"/>
 Filter
 </button>
 <button 
 onClick={openAddModal}
 className="bg-[#00FFCC] text-[#1E1E2F] px-3 py-1.5 rounded text-xs font-black uppercase hover:bg-[#00D1FF] flex items-center gap-1.5 shadow-[0_0_8px_rgba(0,255,204,0.4)]"
 >
 <Plus className="w-3.5 h-3.5"/>
 Add employee
 </button>
 </div>
 </div>

 {/* Filter Section */}
 <AnimatePresence>
 {showFilters && (
 <motion.div 
 initial={{ height: 0, opacity: 0}}
 animate={{ height: 'auto', opacity: 1}}
 exit={{ height: 0, opacity: 0}}
 className="p-4 bg-[#1E1E2F] border-b border-white/5 overflow-hidden"
 >
 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
 <select 
 name="employeeName"
 value={filters.employeeName}
 onChange={handleFilterChange}
 className="bg-[#2A2A3D] border border-white/10 rounded px-3 py-2 text-sm outline-none text-white focus:border-[#00FFCC] focus:ring-1 focus:ring-[#00FFCC]"
 >
 <option value="">Select employee</option>
 {Array.from(new Set(tabEmployees.map(e => e.name))).map(name => (
 <option key={name} value={name}>{name}</option>
 ))}
 </select>
 <select 
 name="employeeId"
 value={filters.employeeId}
 onChange={handleFilterChange}
 className="bg-[#2A2A3D] border border-white/10 rounded px-3 py-2 text-sm outline-none text-white focus:border-[#00FFCC] focus:ring-1 focus:ring-[#00FFCC]"
 >
 <option value="">Select employee id</option>
 {Array.from(new Set(tabEmployees.map(e => e.employeeId))).map(id => (
 <option key={id} value={id}>{id}</option>
 ))}
 </select>
 <select 
 name="employeeType"
 value={filters.employeeType}
 onChange={handleFilterChange}
 className="bg-[#2A2A3D] border border-white/10 rounded px-3 py-2 text-sm outline-none text-white focus:border-[#00FFCC] focus:ring-1 focus:ring-[#00FFCC]"
 >
 <option value="">All employee type</option>
 {Array.from(new Set(employees.map(e => e.employeeType).filter(Boolean))).map(type => (
 <option key={type} value={type}>{type}</option>
 ))}
 </select>
 <select 
 name="department"
 value={filters.department}
 onChange={handleFilterChange}
 className="bg-[#2A2A3D] border border-white/10 rounded px-3 py-2 text-sm outline-none text-white focus:border-[#00FFCC] focus:ring-1 focus:ring-[#00FFCC]"
 >
 <option value="">All department</option>
 {Array.from(new Set([
 ...departments.map(d => d.name),
 ...employees.map(e => e.department)
 ].filter(Boolean))).map(dept => (
 <option key={dept} value={dept}>{dept}</option>
 ))}
 </select>
 <select 
 name="designation"
 value={filters.designation}
 onChange={handleFilterChange}
 className="bg-[#2A2A3D] border border-white/10 rounded px-3 py-2 text-sm outline-none text-white focus:border-[#00FFCC] focus:ring-1 focus:ring-[#00FFCC]"
 >
 <option value="">All designation</option>
 {Array.from(new Set(employees.map(e => e.designation).filter(Boolean))).map(desig => (
 <option key={desig} value={desig}>{desig}</option>
 ))}
 </select>
 <select 
 name="bloodGroup"
 value={filters.bloodGroup}
 onChange={handleFilterChange}
 className="bg-[#2A2A3D] border border-white/10 rounded px-3 py-2 text-sm outline-none text-white focus:border-[#00FFCC] focus:ring-1 focus:ring-[#00FFCC]"
 >
 <option value="">All blood group</option>
 {Array.from(new Set(employees.map(e => e.bloodGroup).filter(Boolean))).map(bg => (
 <option key={bg} value={bg}>{bg}</option>
 ))}
 </select>
 <select 
 name="location"
 value={filters.location}
 onChange={handleFilterChange}
 className="bg-[#2A2A3D] border border-white/10 rounded px-3 py-2 text-sm outline-none text-white focus:border-[#00FFCC] focus:ring-1 focus:ring-[#00FFCC]"
 >
 <option value="">All location</option>
 {Array.from(new Set(employees.map(e => e.location).filter(Boolean))).map(loc => (
 <option key={loc} value={loc}>{loc}</option>
 ))}
 </select>
 <select 
 name="city"
 value={filters.city}
 onChange={handleFilterChange}
 className="bg-[#2A2A3D] border border-white/10 rounded px-3 py-2 text-sm outline-none text-white focus:border-[#00FFCC] focus:ring-1 focus:ring-[#00FFCC]"
 >
 <option value="">All city</option>
 {Array.from(new Set(employees.map(e => e.city).filter(Boolean))).map(city => (
 <option key={city} value={city}>{city}</option>
 ))}
 </select>
 {allCustomFieldKeys.map(key => (
 <select 
 key={key}
 name={key}
 value={filters[key] || ''}
 onChange={handleFilterChange}
 className="bg-[#2A2A3D] border border-white/10 rounded px-3 py-2 text-sm outline-none text-white focus:border-[#00FFCC] focus:ring-1 focus:ring-[#00FFCC]"
 >
 <option value="">All {key}</option>
 {Array.from(new Set(employees.flatMap(e => e.customFields?.filter(f => f.key === key).map(f => f.value) || []).filter(Boolean))).map(val => (
 <option key={val} value={val}>{val}</option>
 ))}
 </select>
 ))}
 <div className="flex gap-2">
 <button className="bg-[#00FFCC] text-[#1E1E2F] px-4 py-2 rounded text-sm font-black uppercase hover:bg-[#00D1FF]">Find</button>
 <button 
 type="button"
 onClick={resetFilters}
 className="bg-white/5 text-[#B0B0C3] px-4 py-2 rounded text-sm font-black uppercase hover:bg-white/10"
 >
 Reset
 </button>
 </div>
 </div>
 </motion.div>
 )}
 </AnimatePresence>

 <div className="p-4 flex flex-wrap justify-between items-center gap-4 border-t border-white/5">
 <div className="flex items-center gap-2 text-sm text-[#B0B0C3]">
 Show 
 <select className="bg-[#1E1E2F] border border-white/10 rounded px-2 py-1 outline-none text-white">
 <option>10</option>
 <option>25</option>
 <option>50</option>
 </select>
 entries
 </div>
 
 <div className="flex items-center gap-4">
 <div className="flex items-center gap-1">
 <button className="bg-transparent border border-[#00FFCC] text-[#00FFCC] px-3 py-1.5 rounded text-xs font-black uppercase hover:bg-[#00FFCC] hover:text-[#1E1E2F] flex items-center gap-1.5">
 <FileCsv className="w-3.5 h-3.5"/>
 CSV
 </button>
 <button className="bg-transparent border border-[#00FFCC] text-[#00FFCC] px-3 py-1.5 rounded text-xs font-black uppercase hover:bg-[#00FFCC] hover:text-[#1E1E2F] flex items-center gap-1.5">
 <FileSpreadsheet className="w-3.5 h-3.5"/>
 Excel
 </button>
 </div>
 
 <div className="flex items-center gap-2">
 <span className="text-sm text-[#B0B0C3]">Search:</span>
 <input 
 type="text"
 value={searchTerm}
 onChange={(e) => setSearchTerm(e.target.value)}
 className="bg-[#1E1E2F] border border-white/10 rounded px-3 py-1.5 text-sm outline-none text-white focus:border-[#00FFCC] focus:ring-1 focus:ring-[#00FFCC]"
 />
 </div>
 </div>
 </div>

 <div className="overflow-x-auto">
 <table className="w-full text-left border-collapse">
 <thead>
 <tr className="bg-[#1E1E2F]/50 border-b border-white/5">
 <th className="px-4 py-3 text-xs font-black text-[#B0B0C3] uppercase tracking-wider border-r border-white/5">Sl</th>
 <th className="px-4 py-3 text-xs font-black text-[#B0B0C3] uppercase tracking-wider border-r border-white/5">Employee id</th>
 <th className="px-4 py-3 text-xs font-black text-[#B0B0C3] uppercase tracking-wider border-r border-white/5">Name of employee</th>
 <th className="px-4 py-3 text-xs font-black text-[#B0B0C3] uppercase tracking-wider border-r border-white/5">Email</th>
 <th className="px-4 py-3 text-xs font-black text-[#B0B0C3] uppercase tracking-wider border-r border-white/5">Mobile no</th>
 <th className="px-4 py-3 text-xs font-black text-[#B0B0C3] uppercase tracking-wider border-r border-white/5">Date of birth</th>
 <th className="px-4 py-3 text-xs font-black text-[#B0B0C3] uppercase tracking-wider border-r border-white/5">Designation</th>
 <th className="px-4 py-3 text-xs font-black text-[#B0B0C3] uppercase tracking-wider border-r border-white/5">Joining date</th>
 <th className="px-4 py-3 text-xs font-black text-[#B0B0C3] uppercase tracking-wider border-r border-white/5">Status</th>
 <th className="px-4 py-3 text-xs font-black text-[#B0B0C3] uppercase tracking-wider">Action</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-white/5">
 {filteredEmployees.map((emp, index) => (
 <tr key={emp.id} className="hover:bg-[#1E1E2F]/50 transition-colors">
 <td className="px-4 py-3 text-sm text-white border-r border-white/5">{index + 1}</td>
 <td className="px-4 py-3 text-sm text-white border-r border-white/5">{emp.employeeId}</td>
 <td className="px-4 py-3 text-sm text-white border-r border-white/5">{emp.name}</td>
 <td className="px-4 py-3 text-sm text-white border-r border-white/5">{emp.email}</td>
 <td className="px-4 py-3 text-sm text-white border-r border-white/5">{emp.mobile}</td>
 <td className="px-4 py-3 text-sm text-white border-r border-white/5">{emp.dob}</td>
 <td className="px-4 py-3 text-sm text-white border-r border-white/5">{emp.designation}</td>
 <td className="px-4 py-3 text-sm text-white border-r border-white/5">{emp.joiningDate}</td>
 <td className="px-4 py-3 text-sm border-r border-white/5">
 <span className={`text-[10px] font-black px-2 py-1 rounded-full uppercase tracking-wider ${
 emp.status === 'Active' ? 'bg-[#00FFCC]/10 text-[#00FFCC]' : 
 emp.status === 'Inactive' ? 'bg-white/10 text-[#B0B0C3]' :
 emp.status === 'Terminated' ? 'bg-red-500/10 text-red-500' : 'bg-amber-500/10 text-amber-500'
}`}>
 {emp.status}
 </span>
 </td>
 <td className="px-4 py-3 text-sm text-white">
 <div className="flex items-center gap-1">
 <button 
 onClick={() => handleRefresh(emp.id)}
 className="p-1.5 text-red-500 bg-red-500/10 rounded border border-red-500/20 hover:bg-red-500/20"
 title="Refresh"
 >
 <RefreshCw className="w-3.5 h-3.5"/>
 </button>
 <button 
 onClick={() => openViewModal(emp)}
 className="p-1.5 text-[#00FFCC] bg-[#00FFCC]/10 rounded border border-[#00FFCC]/20 hover:bg-[#00FFCC]/20"
 title="View Details"
 >
 <Eye className="w-3.5 h-3.5"/>
 </button>
 <button 
 onClick={() => openEditModal(emp)}
 className="p-1.5 text-[#00FFCC] bg-[#00FFCC]/10 rounded border border-[#00FFCC]/20 hover:bg-[#00FFCC]/20"
 title="Edit"
 >
 <Edit className="w-3.5 h-3.5"/>
 </button>
 <button 
 onClick={() => openCredentialsModal(emp)}
 className="p-1.5 text-amber-500 bg-amber-500/10 rounded border border-amber-500/20 hover:bg-amber-500/20"
 title="Credentials"
 >
 <Key className="w-3.5 h-3.5"/>
 </button>
 <button 
 onClick={() => handleDelete(emp.id)}
 className="p-1.5 text-red-500 bg-red-500/10 rounded border border-red-500/20 hover:bg-red-500/20"
 >
 <Trash2 className="w-3.5 h-3.5"/>
 </button>
 </div>
 </td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>

 <div className="p-4 border-t border-white/5 flex justify-between items-center text-sm text-[#B0B0C3]">
 <div>Showing 1 to {filteredEmployees.length} of {employees.length} entries</div>
 <div className="flex items-center gap-1">
 <button className="px-3 py-1 border border-white/10 rounded hover:bg-white/5 disabled:opacity-50">Previous</button>
 <button className="px-3 py-1 bg-[#00FFCC] text-[#1E1E2F] rounded font-black">1</button>
 <button className="px-3 py-1 border border-white/10 rounded hover:bg-white/5 disabled:opacity-50">Next</button>
 </div>
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
 className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
 >
 <div className="p-4 border-b border-white/5 flex justify-between items-center bg-[#2A2A3D]">
 <h3 className="font-black text-white uppercase tracking-tight">
 {isViewOnly ? 'View Employee' : editingEmployee ? 'Edit Employee' : 'Add New Employee'}
 </h3>
 <button onClick={() => setIsModalOpen(false)} className="p-1 hover:bg-white/10 rounded-full transition-colors">
 <X className="w-5 h-5 text-[#B0B0C3]"/>
 </button>
 </div>
 
 <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 custom-scrollbar bg-[#1E1E2F]">
 <div className="mb-6 flex items-center gap-4">
 <div className="relative w-24 h-24 rounded-full border-2 border-white/10 overflow-hidden bg-[#1E1E2F] flex items-center justify-center shrink-0">
 {formData.avatar ? (
 <img src={formData.avatar} alt="Avatar"className="w-full h-full object-cover"referrerPolicy="no-referrer"/>
 ) : (
 <User className="w-10 h-10 text-[#B0B0C3]"/>
 )}
 {!isViewOnly && (
 <label className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 cursor-pointer transition-opacity">
 <Upload className="w-6 h-6 text-white"/>
 <input 
 type="file"
 accept="image/*"
 className="hidden"
 onChange={(e) => {
 const file = e.target.files?.[0];
 if (file) {
 const reader = new FileReader();
 reader.onloadend = () => {
 setFormData({ ...formData, avatar: reader.result as string});
};
 reader.readAsDataURL(file);
}
}} 
 />
 </label>
 )}
 </div>
 <div>
 <h4 className="text-sm font-black text-white uppercase tracking-tight">Profile Picture</h4>
 <p className="text-xs text-[#B0B0C3] mt-1">Upload a professional photo. Recommended size 256x256px.</p>
 </div>
 </div>

 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
 <div className="space-y-1.5">
 <label className="text-xs font-black text-[#B0B0C3] uppercase tracking-wider">Employee Name</label>
 <input 
 required
 disabled={isViewOnly}
 type="text"
 value={formData.name}
 onChange={(e) => setFormData({...formData, name: e.target.value})}
 className="w-full bg-[#1E1E2F] border border-white/10 rounded-lg px-3 py-2 text-sm outline-none text-white focus:border-[#00FFCC] focus:ring-1 focus:ring-[#00FFCC] transition-all disabled:bg-[#2A2A3D] disabled:text-[#B0B0C3]"
 placeholder="Enter name"
 />
 </div>
 <div className="space-y-1.5">
 <label className="text-xs font-black text-[#B0B0C3] uppercase tracking-wider">Employee ID</label>
 <input 
 required
 disabled={isViewOnly}
 type="text"
 value={formData.employeeId}
 onChange={(e) => setFormData({...formData, employeeId: e.target.value})}
 className="w-full bg-[#1E1E2F] border border-white/10 rounded-lg px-3 py-2 text-sm outline-none text-white focus:border-[#00FFCC] focus:ring-1 focus:ring-[#00FFCC] transition-all disabled:bg-[#2A2A3D] disabled:text-[#B0B0C3]"
 placeholder="e.g. 000032"
 />
 </div>
 <div className="space-y-1.5">
 <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Email</label>
 <input 
 required
 disabled={isViewOnly}
 type="email"
 value={formData.email}
 onChange={(e) => setFormData({...formData, email: e.target.value})}
 className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all disabled:bg-slate-50 disabled:text-slate-500"
 placeholder="email@example.com"
 />
 </div>
 <div className="space-y-1.5">
 <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Mobile</label>
 <input 
 required
 disabled={isViewOnly}
 type="text"
 value={formData.mobile}
 onChange={(e) => setFormData({...formData, mobile: e.target.value})}
 className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all disabled:bg-slate-50 disabled:text-slate-500"
 placeholder="+1234567890"
 />
 </div>
 <div className="space-y-1.5">
 <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Designation</label>
 <input 
 required
 disabled={isViewOnly}
 list="designations-list"
 type="text"
 value={formData.designation}
 onChange={(e) => setFormData({...formData, designation: e.target.value})}
 className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all bg-white disabled:bg-slate-50 disabled:text-slate-500"
 placeholder="Enter or select designation"
 />
 <datalist id="designations-list">
 {designations.filter(desig => !desig.isDeleted).map(desig => (
 <option key={desig.id} value={desig.name} />
 ))}
 </datalist>
 </div>
 <div className="space-y-1.5">
 <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Department</label>
 <select 
 required
 disabled={isViewOnly}
 value={formData.department}
 onChange={(e) => setFormData({...formData, department: e.target.value})}
 className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all bg-white disabled:bg-slate-50 disabled:text-slate-500"
 >
 <option value="">Select department</option>
 {departments.filter(dept => !dept.isDeleted).map(dept => (
 <option key={dept.id} value={dept.name}>{dept.name}</option>
 ))}
 </select>
 </div>
 <div className="space-y-1.5">
 <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Status</label>
 <select 
 required
 disabled={isViewOnly}
 value={formData.status}
 onChange={(e) => setFormData({...formData, status: e.target.value as any})}
 className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all bg-white disabled:bg-slate-50 disabled:text-slate-500"
 >
 <option value="Active">Active</option>
 <option value="Inactive">Inactive</option>
 <option value="Terminated">Terminated</option>
 <option value="Resigned">Resigned</option>
 </select>
 </div>
 <div className="space-y-1.5">
 <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Joining Date</label>
 <input 
 required
 disabled={isViewOnly}
 type="date"
 value={formData.joiningDate}
 onChange={(e) => setFormData({...formData, joiningDate: e.target.value})}
 className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all disabled:bg-slate-50 disabled:text-slate-500"
 />
 </div>
 <div className="space-y-1.5">
 <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Date of Birth</label>
 <input 
 required
 disabled={isViewOnly}
 type="date"
 value={formData.dob}
 onChange={(e) => setFormData({...formData, dob: e.target.value})}
 className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all disabled:bg-slate-50 disabled:text-slate-500"
 />
 </div>
 <div className="space-y-1.5">
 <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Blood Group</label>
 <select 
 disabled={isViewOnly}
 value={formData.bloodGroup}
 onChange={(e) => setFormData({...formData, bloodGroup: e.target.value})}
 className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all bg-white disabled:bg-slate-50 disabled:text-slate-500"
 >
 <option value="">Select Blood Group</option>
 <option value="A+">A+</option>
 <option value="B+">B+</option>
 <option value="O+">O+</option>
 <option value="AB+">AB+</option>
 <option value="A-">A-</option>
 <option value="B-">B-</option>
 </select>
 </div>
 <div className="space-y-1.5">
 <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">National ID</label>
 <input 
 disabled={isViewOnly}
 type="text"
 value={formData.nationalId}
 onChange={(e) => setFormData({...formData, nationalId: e.target.value})}
 className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all disabled:bg-slate-50 disabled:text-slate-500"
 placeholder="ID Number"
 />
 </div>
 <div className="space-y-1.5">
 <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Location</label>
 <input 
 disabled={isViewOnly}
 type="text"
 value={formData.location || ''}
 onChange={(e) => setFormData({...formData, location: e.target.value})}
 className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all disabled:bg-slate-50 disabled:text-slate-500"
 placeholder="Location"
 />
 </div>
 <div className="space-y-1.5">
 <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">City</label>
 <input 
 disabled={isViewOnly}
 type="text"
 value={formData.city || ''}
 onChange={(e) => setFormData({...formData, city: e.target.value})}
 className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all disabled:bg-slate-50 disabled:text-slate-500"
 placeholder="City"
 />
 </div>
 </div>

 {/* Financial Details Section */}
 <div className="mt-6 pt-6 border-t border-slate-100">
 <h4 className="text-sm font-bold text-slate-800 mb-4">Financial Details</h4>
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
 <div className="space-y-1.5">
 <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Salary</label>
 <input 
 disabled={isViewOnly}
 type="number"
 value={formData.salary || ''}
 onChange={(e) => setFormData({...formData, salary: e.target.value ? parseFloat(e.target.value) : 0})}
 className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all disabled:bg-slate-50 disabled:text-slate-500"
 placeholder="0.00"
 />
 </div>
 <div className="space-y-1.5">
 <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Tax Deduction (%)</label>
 <input 
 disabled={isViewOnly}
 type="number"
 value={formData.taxDeduction || ''}
 onChange={(e) => setFormData({...formData, taxDeduction: e.target.value ? parseFloat(e.target.value) : 0})}
 className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all disabled:bg-slate-50 disabled:text-slate-500"
 placeholder="0"
 />
 </div>
 <div className="space-y-1.5">
 <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Bank Name</label>
 <input 
 disabled={isViewOnly}
 type="text"
 value={formData.bankName || ''}
 onChange={(e) => setFormData({...formData, bankName: e.target.value})}
 className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all disabled:bg-slate-50 disabled:text-slate-500"
 placeholder="Bank Name"
 />
 </div>
 <div className="space-y-1.5">
 <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Bank Account No</label>
 <input 
 disabled={isViewOnly}
 type="text"
 value={formData.bankAccountNo || ''}
 onChange={(e) => setFormData({...formData, bankAccountNo: e.target.value})}
 className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all disabled:bg-slate-50 disabled:text-slate-500"
 placeholder="Account Number"
 />
 </div>
 <div className="space-y-1.5">
 <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Mode of Payment</label>
 <select 
 disabled={isViewOnly}
 value={formData.modeOfPayment || ''}
 onChange={(e) => setFormData({...formData, modeOfPayment: e.target.value})}
 className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all bg-white disabled:bg-slate-50 disabled:text-slate-500"
 >
 <option value="">Select Mode</option>
 <option value="Bank Transfer">Bank Transfer</option>
 <option value="Cheque">Cheque</option>
 <option value="Cash">Cash</option>
 </select>
 </div>
 </div>
 </div>

 {/* Login Credentials Section */}
 <div className="mt-6 pt-6 border-t border-slate-100">
 <h4 className="text-sm font-bold text-slate-800 mb-4">Login Credentials</h4>
 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
 <div className="space-y-1.5">
 <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Username</label>
 <input 
 disabled={isViewOnly}
 type="text"
 value={formData.username || ''}
 onChange={(e) => setFormData({...formData, username: e.target.value})}
 className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all disabled:bg-slate-50 disabled:text-slate-500 font-mono"
 placeholder="Auto-generated if empty"
 />
 </div>
 <div className="space-y-1.5">
 <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Password</label>
 <input 
 disabled={isViewOnly}
 type="text"
 value={formData.password || ''}
 onChange={(e) => setFormData({...formData, password: e.target.value})}
 className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all disabled:bg-slate-50 disabled:text-slate-500 font-mono"
 placeholder="Auto-generated if empty"
 />
 </div>
 </div>
 </div>

 {/* Custom Fields Section */}
 <div className="mt-8 pt-6 border-t border-slate-100">
 <div className="flex items-center justify-between mb-4">
 <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
 <Settings className="w-4 h-4 text-indigo-500"/>
 Custom Fields
 </h4>
 {!isViewOnly && (
 <button 
 type="button"
 onClick={addCustomField}
 className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
 >
 <Plus className="w-3 h-3"/>
 Add Custom Field
 </button>
 )}
 </div>
 
 <div className="space-y-3">
 {formData.customFields?.map((field, index) => (
 <div key={index} className="flex gap-3 items-start animate-in fade-in slide-in-from-top-2 duration-200">
 <div className="flex-1">
 <input 
 disabled={isViewOnly}
 type="text"
 placeholder="Field Name (e.g. LinkedIn)"
 value={field.key}
 onChange={(e) => updateCustomField(index, 'key', e.target.value)}
 className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all disabled:bg-slate-50 disabled:text-slate-500"
 />
 </div>
 <div className="flex-1">
 <input 
 disabled={isViewOnly}
 type="text"
 placeholder="Field Value"
 value={field.value}
 onChange={(e) => updateCustomField(index, 'value', e.target.value)}
 className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all disabled:bg-slate-50 disabled:text-slate-500"
 />
 </div>
 {!isViewOnly && (
 <button 
 type="button"
 onClick={() => removeCustomField(index)}
 className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors mt-0.5"
 >
 <Trash2 className="w-4 h-4"/>
 </button>
 )}
 </div>
 ))}
 {(!formData.customFields || formData.customFields.length === 0) && (
 <div className="text-center py-4 text-xs text-slate-400 italic">
 No custom fields added yet.
 </div>
 )}
 </div>
 </div>

 <div className="mt-8 flex justify-between items-center">
 {editingEmployee && !isViewOnly ? (
 <button
 type="button"
 onClick={() => {
 setEmployeeToDelete(editingEmployee.id);
}}
 className="px-4 py-2 rounded-lg text-sm font-bold text-red-600 bg-red-50 hover:bg-red-100 transition-colors flex items-center gap-2"
 >
 <Trash2 className="w-4 h-4"/>
 Delete Employee
 </button>
 ) : <div></div>}
 <div className="flex gap-3">
 <button 
 type="button"
 onClick={() => setIsModalOpen(false)}
 className="px-6 py-2 rounded-lg text-sm font-bold text-slate-600 hover:bg-slate-100 transition-colors"
 >
 {isViewOnly ? 'Close' : 'Cancel'}
 </button>
 {!isViewOnly && (
 <button 
 type="submit"
 className="px-6 py-2 rounded-lg text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all"
 >
 {editingEmployee ? 'Update Employee' : 'Save Employee'}
 </button>
 )}
 </div>
 </div>
 </form>
 </motion.div>
 </div>
 )}
 </AnimatePresence>

 {/* Credentials Modal */}
 <AnimatePresence>
 {isCredentialsModalOpen && selectedEmployeeForCredentials && (
 <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
 <motion.div 
 initial={{ opacity: 0, scale: 0.95}}
 animate={{ opacity: 1, scale: 1}}
 exit={{ opacity: 0, scale: 0.95}}
 className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden"
 >
 <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
 <h3 className="font-bold text-slate-800 flex items-center gap-2">
 <Key className="w-4 h-4 text-amber-500"/>
 Employee Credentials
 </h3>
 <button onClick={() => setIsCredentialsModalOpen(false)} className="p-1 hover:bg-slate-200 rounded-full transition-colors">
 <X className="w-5 h-5 text-slate-500"/>
 </button>
 </div>
 
 <div className="p-6 space-y-4">
 <div className="flex items-center gap-3 mb-4">
 <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-xl">
 {selectedEmployeeForCredentials.name.charAt(0)}
 </div>
 <div>
 <h4 className="font-bold text-slate-800">{selectedEmployeeForCredentials.name}</h4>
 <p className="text-xs text-slate-500">{selectedEmployeeForCredentials.designation}</p>
 </div>
 </div>

 <div className="space-y-3">
 <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
 <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Username</label>
 <div className="font-mono text-slate-800 font-medium select-all">
 {selectedEmployeeForCredentials.username || 'Not generated'}
 </div>
 </div>
 <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
 <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Password</label>
 <div className="font-mono text-slate-800 font-medium select-all">
 {selectedEmployeeForCredentials.password || 'Not generated'}
 </div>
 </div>
 </div>

 <div className="pt-4 flex justify-end">
 <button 
 onClick={handleRegenerateCredentials}
 className="w-full bg-amber-500 text-white px-4 py-2 rounded-lg font-bold hover:bg-amber-600 transition-colors flex items-center justify-center gap-2"
 >
 <RefreshCw className="w-4 h-4"/>
 Regenerate Credentials
 </button>
 </div>
 </div>
 </motion.div>
 </div>
 )}
 </AnimatePresence>

 {/* Credentials Report Modal */}
 <AnimatePresence>
 {isReportModalOpen && (
 <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
 <motion.div 
 initial={{ opacity: 0, scale: 0.95}}
 animate={{ opacity: 1, scale: 1}}
 exit={{ opacity: 0, scale: 0.95}}
 className="bg-white rounded-xl shadow-xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col"
 >
 <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
 <h3 className="font-bold text-slate-800 flex items-center gap-2">
 <Shield className="w-5 h-5 text-indigo-600"/>
 Employee Credentials Report
 </h3>
 <button onClick={() => setIsReportModalOpen(false)} className="p-1 hover:bg-slate-200 rounded-full transition-colors">
 <X className="w-5 h-5 text-slate-500"/>
 </button>
 </div>
 
 <div className="flex-1 overflow-auto p-0">
 <table className="w-full text-left border-collapse">
 <thead className="sticky top-0 bg-slate-50 z-10 shadow-sm">
 <tr>
 <th className="px-4 py-3 text-xs font-bold text-slate-600 uppercase tracking-wider border-r border-slate-100">Employee ID</th>
 <th className="px-4 py-3 text-xs font-bold text-slate-600 uppercase tracking-wider border-r border-slate-100">Name</th>
 <th className="px-4 py-3 text-xs font-bold text-slate-600 uppercase tracking-wider border-r border-slate-100">Department</th>
 <th className="px-4 py-3 text-xs font-bold text-slate-600 uppercase tracking-wider border-r border-slate-100">Username</th>
 <th className="px-4 py-3 text-xs font-bold text-slate-600 uppercase tracking-wider border-r border-slate-100">Password</th>
 <th className="px-4 py-3 text-xs font-bold text-slate-600 uppercase tracking-wider">Action</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-slate-100">
 {employees.map((emp) => (
 <tr key={emp.id} className="hover:bg-slate-50/50 transition-colors">
 <td className="px-4 py-3 text-sm text-slate-600 border-r border-slate-100 font-mono">{emp.employeeId}</td>
 <td className="px-4 py-3 text-sm text-slate-800 border-r border-slate-100 font-medium">{emp.name}</td>
 <td className="px-4 py-3 text-sm text-slate-600 border-r border-slate-100">{emp.department}</td>
 <td className="px-4 py-3 text-sm text-slate-600 border-r border-slate-100 font-mono select-all bg-slate-50/50">{emp.username}</td>
 <td className="px-4 py-3 text-sm text-slate-600 border-r border-slate-100 font-mono select-all bg-slate-50/50">{emp.password}</td>
 <td className="px-4 py-3 text-sm">
 <button 
 onClick={() => {
 setIsReportModalOpen(false);
 openCredentialsModal(emp);
}}
 className="text-indigo-600 hover:text-indigo-800 font-medium text-xs flex items-center gap-1"
 >
 <Edit className="w-3 h-3"/>
 Manage
 </button>
 </td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>

 <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
 <button 
 onClick={() => setIsReportModalOpen(false)}
 className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 shadow-sm"
 >
 Close Report
 </button>
 </div>
 </motion.div>
 </div>
 )}
 </AnimatePresence>
 {/* Delete Confirmation Modal */}
 <AnimatePresence>
 {employeeToDelete && (
 <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
 <motion.div
 initial={{ opacity: 0, scale: 0.95}}
 animate={{ opacity: 1, scale: 1}}
 exit={{ opacity: 0, scale: 0.95}}
 className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden"
 >
 <div className="p-6 text-center">
 <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
 <AlertCircle className="w-8 h-8 text-red-600"/>
 </div>
 <h3 className="text-xl font-bold text-slate-800 mb-2">Delete Employee</h3>
 <p className="text-slate-500 mb-6">Are you sure you want to delete this employee? This action cannot be undone.</p>
 <div className="flex gap-3 justify-center">
 <button
 onClick={() => setEmployeeToDelete(null)}
 className="px-6 py-2 rounded-lg text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
 >
 Cancel
 </button>
 <button
 onClick={() => {
 if (employeeToDelete) {
 deleteEmployee(employeeToDelete);
 setEmployeeToDelete(null);
 setIsModalOpen(false);
}
}}
 className="px-6 py-2 rounded-lg text-sm font-bold text-white bg-red-600 hover:bg-red-700 transition-colors"
 >
 Delete
 </button>
 </div>
 </div>
 </motion.div>
 </div>
 )}
 </AnimatePresence>
 </AdminLayout>
 );
}
