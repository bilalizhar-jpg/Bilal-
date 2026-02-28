import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Building2, 
  Menu, 
  Maximize2, 
  RefreshCw, 
  Search,
  ChevronRight,
  LayoutDashboard,
  Calendar,
  Award,
  Users,
  UserMinus,
  CreditCard,
  Bell,
  DollarSign,
  Briefcase,
  ClipboardList,
  UserCheck,
  FileText,
  Target,
  Settings,
  MessageSquare,
  Plus,
  Edit,
  Trash2,
  X,
  FileSpreadsheet,
  FileText as FileCsv,
  Eye,
  Filter,
  RotateCcw,
  UserX
} from 'lucide-react';
import { Link } from 'react-router-dom';

import AdminLayout from '../components/AdminLayout';

interface CustomField {
  key: string;
  value: string;
}

interface Employee {
  id: string;
  employeeId: string;
  name: string;
  email: string;
  mobile: string;
  dob: string;
  designation: string;
  joiningDate: string;
  status: 'Active' | 'Inactive' | 'Terminated' | 'Resigned';
  bloodGroup: string;
  nationalId: string;
  department: string;
  employeeType: string;
  country: string;
  gender: string;
  maritalStatus: string;
  customFields?: CustomField[];
}

type TabType = 'active' | 'positions' | 'inactive';

export default function EmployeeList() {
  const [activeTab, setActiveTab] = useState<TabType>('active');
  const [showFilters, setShowFilters] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  
  const [filters, setFilters] = useState({
    employeeName: '',
    employeeId: '',
    employeeType: '',
    department: '',
    designation: '',
    bloodGroup: '',
    country: '',
    gender: '',
    maritalStatus: ''
  });

  const [employees, setEmployees] = useState<Employee[]>([
    { id: '1', employeeId: '000031', name: 'Babara Patel', email: 'babara@gmail.com', mobile: '+25670268239', dob: '1990-05-15', designation: 'Manager', joiningDate: '2023-01-10', status: 'Active', bloodGroup: 'A+', nationalId: '123456789', department: 'Electrical', employeeType: 'Full Time', country: 'USA', gender: 'Female', maritalStatus: 'Single', customFields: [] },
    { id: '2', employeeId: '000030', name: 'Test Candidate', email: 'test@test.com', mobile: '12365489985', dob: '1995-08-20', designation: 'Developer', joiningDate: '2023-02-15', status: 'Active', bloodGroup: 'B+', nationalId: '987654321', department: 'Production', employeeType: 'Contract', country: 'UK', gender: 'Male', maritalStatus: 'Married', customFields: [] },
    { id: '3', employeeId: '000029', name: 'Ch. Monalisa Subudhi', email: 'monalisasubudhi091@gmail.com', mobile: '7787890451', dob: '1992-11-30', designation: 'Designer', joiningDate: '2023-03-01', status: 'Active', bloodGroup: 'O+', nationalId: '456789123', department: 'Electrical', employeeType: 'Full Time', country: 'India', gender: 'Female', maritalStatus: 'Single', customFields: [] },
    { id: '4', employeeId: '000028', name: 'Mohmed Afif Akram', email: 'mohaafif@gmail.com', mobile: '26523333', dob: '1988-03-12', designation: 'Lead', joiningDate: '2023-01-05', status: 'Active', bloodGroup: 'AB+', nationalId: '789123456', department: 'Production', employeeType: 'Full Time', country: 'UAE', gender: 'Male', maritalStatus: 'Married', customFields: [] },
    { id: '5', employeeId: '000027', name: 'Uma Stafford', email: 'nocunocu@mailinator.com', mobile: '+1(617)434-2319', dob: '1993-07-25', designation: 'Analyst', joiningDate: '2023-04-10', status: 'Active', bloodGroup: 'A-', nationalId: '321654987', department: 'Electrical', employeeType: 'Part Time', country: 'Canada', gender: 'Female', maritalStatus: 'Single', customFields: [] },
    { id: '6', employeeId: '000026', name: 'Khubaib Ahmed', email: 'khubaib@gmail.com', mobile: '0300-1234567', dob: '1991-09-18', designation: 'Engineer', joiningDate: '2023-05-20', status: 'Inactive', bloodGroup: 'B-', nationalId: '654987321', department: 'Electrical', employeeType: 'Full Time', country: 'Pakistan', gender: 'Male', maritalStatus: 'Married', customFields: [] },
  ]);

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
    country: '',
    gender: '',
    maritalStatus: '',
    customFields: []
  });

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const resetFilters = () => {
    setFilters({
      employeeName: '',
      employeeId: '',
      employeeType: '',
      department: '',
      designation: '',
      bloodGroup: '',
      country: '',
      gender: '',
      maritalStatus: ''
    });
    setSearchTerm('');
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingEmployee) {
      setEmployees(prev => prev.map(emp => emp.id === editingEmployee.id ? { ...emp, ...formData } as Employee : emp));
    } else {
      const newEmployee = {
        ...formData,
        id: Math.random().toString(36).substr(2, 9),
      } as Employee;
      setEmployees(prev => [...prev, newEmployee]);
    }
    setIsModalOpen(false);
    setEditingEmployee(null);
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
      country: '',
      gender: '',
      maritalStatus: '',
      customFields: []
    });
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this employee?')) {
      setEmployees(prev => prev.filter(emp => emp.id !== id));
    }
  };

  const openEditModal = (emp: Employee) => {
    setEditingEmployee(emp);
    setFormData(emp);
    setIsModalOpen(true);
  };

  const addCustomField = () => {
    setFormData(prev => ({
      ...prev,
      customFields: [...(prev.customFields || []), { key: '', value: '' }]
    }));
  };

  const updateCustomField = (index: number, field: 'key' | 'value', value: string) => {
    const updatedFields = [...(formData.customFields || [])];
    updatedFields[index][field] = value;
    setFormData(prev => ({ ...prev, customFields: updatedFields }));
  };

  const removeCustomField = (index: number) => {
    setFormData(prev => ({
      ...prev,
      customFields: (prev.customFields || []).filter((_, i) => i !== index)
    }));
  };

  const filteredEmployees = employees.filter(emp => {
    // Global search
    const matchesGlobalSearch = emp.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                               emp.employeeId.includes(searchTerm);
    
    // Tab filtering
    const matchesTab = activeTab === 'active' ? emp.status === 'Active' : 
                      activeTab === 'inactive' ? emp.status !== 'Active' : true;

    // Detailed filters
    const matchesName = !filters.employeeName || emp.name === filters.employeeName;
    const matchesId = !filters.employeeId || emp.employeeId === filters.employeeId;
    const matchesType = !filters.employeeType || emp.employeeType === filters.employeeType;
    const matchesDept = !filters.department || emp.department === filters.department;
    const matchesDesig = !filters.designation || emp.designation === filters.designation;
    const matchesBlood = !filters.bloodGroup || emp.bloodGroup === filters.bloodGroup;
    const matchesCountry = !filters.country || emp.country === filters.country;
    const matchesGender = !filters.gender || emp.gender === filters.gender;
    const matchesMarital = !filters.maritalStatus || emp.maritalStatus === filters.maritalStatus;

    return matchesGlobalSearch && matchesTab && matchesName && matchesId && 
           matchesType && matchesDept && matchesDesig && matchesBlood && 
           matchesCountry && matchesGender && matchesMarital;
  });

  const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { name: 'Attendance', icon: Calendar, hasSub: true, path: '/attendance' },
    { name: 'Award', icon: Award, hasSub: true, path: '/award' },
    { name: 'Department', icon: Building2, hasSub: true, path: '/department' },
    { name: 'Employee', icon: Users, active: true, hasSub: true, path: '/employee' },
    { name: 'Leave', icon: UserMinus, hasSub: true },
    { name: 'Loan', icon: CreditCard, hasSub: true },
    { name: 'Notice board', icon: Bell, hasSub: true, path: '/notice' },
    { name: 'Payroll', icon: DollarSign, hasSub: true },
    { name: 'Procurement', icon: Briefcase, hasSub: true },
    { name: 'Project management', icon: ClipboardList, hasSub: true },
    { name: 'Recruitment', icon: UserCheck, hasSub: true },
    { name: 'Reports', icon: FileText, hasSub: true },
    { name: 'Reward points', icon: Target, hasSub: true },
    { name: 'Setup rules', icon: Settings, hasSub: true },
    { name: 'Settings', icon: Settings, hasSub: true },
    { name: 'Message', icon: MessageSquare, hasSub: true },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Tabs */}
        <div className="flex items-center gap-2 mb-6">
            <button 
              onClick={() => setActiveTab('active')}
              className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
                activeTab === 'active' ? 'bg-[#28A745] text-white' : 'bg-[#E9ECEF] text-slate-600 hover:bg-slate-200'
              }`}
            >
              Employee
            </button>
            <button 
              onClick={() => setActiveTab('positions')}
              className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
                activeTab === 'positions' ? 'bg-[#28A745] text-white' : 'bg-[#E9ECEF] text-slate-600 hover:bg-slate-200'
              }`}
            >
              Positions
            </button>
            <button 
              onClick={() => setActiveTab('inactive')}
              className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
                activeTab === 'inactive' ? 'bg-[#28A745] text-white' : 'bg-[#E9ECEF] text-slate-600 hover:bg-slate-200'
              }`}
            >
              Inactive employees list
            </button>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center">
              <h2 className="font-bold text-slate-800">Employee list</h2>
              <div className="flex gap-2">
                <button 
                  onClick={() => setShowFilters(!showFilters)}
                  className="bg-[#17A2B8] text-white px-3 py-1.5 rounded text-xs font-bold flex items-center gap-1.5 hover:bg-[#138496]"
                >
                  <Filter className="w-3.5 h-3.5" />
                  Filter
                </button>
                <button 
                  onClick={() => {
                    setEditingEmployee(null);
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
                      country: '',
                      gender: '',
                      maritalStatus: '',
                      customFields: []
                    });
                    setIsModalOpen(true);
                  }}
                  className="bg-[#28A745] text-white px-3 py-1.5 rounded text-xs font-bold flex items-center gap-1.5 hover:bg-[#218838]"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add employee
                </button>
              </div>
            </div>

            {/* Filter Section */}
            <AnimatePresence>
              {showFilters && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="p-4 bg-slate-50 border-b border-slate-100 overflow-hidden"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    <select 
                      name="employeeName"
                      value={filters.employeeName}
                      onChange={handleFilterChange}
                      className="border border-slate-200 rounded px-3 py-2 text-sm outline-none bg-white"
                    >
                      <option value="">Select employee</option>
                      {Array.from(new Set(employees.map(e => e.name))).map(name => (
                        <option key={name} value={name}>{name}</option>
                      ))}
                    </select>
                    <select 
                      name="employeeId"
                      value={filters.employeeId}
                      onChange={handleFilterChange}
                      className="border border-slate-200 rounded px-3 py-2 text-sm outline-none bg-white"
                    >
                      <option value="">Select employee id</option>
                      {Array.from(new Set(employees.map(e => e.employeeId))).map(id => (
                        <option key={id} value={id}>{id}</option>
                      ))}
                    </select>
                    <select 
                      name="employeeType"
                      value={filters.employeeType}
                      onChange={handleFilterChange}
                      className="border border-slate-200 rounded px-3 py-2 text-sm outline-none bg-white"
                    >
                      <option value="">Select employee type</option>
                      <option value="Full Time">Full Time</option>
                      <option value="Part Time">Part Time</option>
                      <option value="Contract">Contract</option>
                    </select>
                    <select 
                      name="department"
                      value={filters.department}
                      onChange={handleFilterChange}
                      className="border border-slate-200 rounded px-3 py-2 text-sm outline-none bg-white"
                    >
                      <option value="">All department</option>
                      <option value="Electrical">Electrical</option>
                      <option value="Production">Production</option>
                    </select>
                    <select 
                      name="designation"
                      value={filters.designation}
                      onChange={handleFilterChange}
                      className="border border-slate-200 rounded px-3 py-2 text-sm outline-none bg-white"
                    >
                      <option value="">All designation</option>
                      <option value="Manager">Manager</option>
                      <option value="Developer">Developer</option>
                      <option value="Designer">Designer</option>
                      <option value="Lead">Lead</option>
                      <option value="Analyst">Analyst</option>
                      <option value="Engineer">Engineer</option>
                    </select>
                    <select 
                      name="bloodGroup"
                      value={filters.bloodGroup}
                      onChange={handleFilterChange}
                      className="border border-slate-200 rounded px-3 py-2 text-sm outline-none bg-white"
                    >
                      <option value="">All blood group</option>
                      <option value="A+">A+</option>
                      <option value="B+">B+</option>
                      <option value="O+">O+</option>
                      <option value="AB+">AB+</option>
                      <option value="A-">A-</option>
                      <option value="B-">B-</option>
                    </select>
                    <select 
                      name="country"
                      value={filters.country}
                      onChange={handleFilterChange}
                      className="border border-slate-200 rounded px-3 py-2 text-sm outline-none bg-white"
                    >
                      <option value="">All country</option>
                      <option value="USA">USA</option>
                      <option value="UK">UK</option>
                      <option value="India">India</option>
                      <option value="UAE">UAE</option>
                      <option value="Canada">Canada</option>
                      <option value="Pakistan">Pakistan</option>
                    </select>
                    <select 
                      name="gender"
                      value={filters.gender}
                      onChange={handleFilterChange}
                      className="border border-slate-200 rounded px-3 py-2 text-sm outline-none bg-white"
                    >
                      <option value="">All gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </select>
                    <select 
                      name="maritalStatus"
                      value={filters.maritalStatus}
                      onChange={handleFilterChange}
                      className="border border-slate-200 rounded px-3 py-2 text-sm outline-none bg-white"
                    >
                      <option value="">All marital status</option>
                      <option value="Single">Single</option>
                      <option value="Married">Married</option>
                    </select>
                    <div className="flex gap-2">
                      <button className="bg-[#28A745] text-white px-4 py-2 rounded text-sm font-bold hover:bg-[#218838]">Find</button>
                      <button 
                        type="button"
                        onClick={resetFilters}
                        className="bg-[#DC3545] text-white px-4 py-2 rounded text-sm font-bold hover:bg-[#C82333]"
                      >
                        Reset
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="p-4 flex flex-wrap justify-between items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-slate-600">
                Show 
                <select className="border border-slate-200 rounded px-2 py-1 outline-none">
                  <option>10</option>
                  <option>25</option>
                  <option>50</option>
                </select>
                entries
              </div>
              
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <button className="bg-[#28A745] text-white px-3 py-1.5 rounded text-xs font-bold flex items-center gap-1.5 hover:bg-[#218838]">
                    <FileCsv className="w-3.5 h-3.5" />
                    CSV
                  </button>
                  <button className="bg-[#28A745] text-white px-3 py-1.5 rounded text-xs font-bold flex items-center gap-1.5 hover:bg-[#218838]">
                    <FileSpreadsheet className="w-3.5 h-3.5" />
                    Excel
                  </button>
                </div>
                
                <div className="flex items-center gap-2">
                  <span className="text-sm text-slate-600">Search:</span>
                  <input 
                    type="text" 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="border border-slate-200 rounded px-3 py-1.5 text-sm outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-100">
                    <th className="px-4 py-3 text-xs font-bold text-slate-600 uppercase tracking-wider border-r border-slate-100">Sl</th>
                    <th className="px-4 py-3 text-xs font-bold text-slate-600 uppercase tracking-wider border-r border-slate-100">Employee id</th>
                    <th className="px-4 py-3 text-xs font-bold text-slate-600 uppercase tracking-wider border-r border-slate-100">Name of employee</th>
                    <th className="px-4 py-3 text-xs font-bold text-slate-600 uppercase tracking-wider border-r border-slate-100">Email</th>
                    <th className="px-4 py-3 text-xs font-bold text-slate-600 uppercase tracking-wider border-r border-slate-100">Mobile no</th>
                    <th className="px-4 py-3 text-xs font-bold text-slate-600 uppercase tracking-wider border-r border-slate-100">Date of birth</th>
                    <th className="px-4 py-3 text-xs font-bold text-slate-600 uppercase tracking-wider border-r border-slate-100">Designation</th>
                    <th className="px-4 py-3 text-xs font-bold text-slate-600 uppercase tracking-wider border-r border-slate-100">Joining date</th>
                    <th className="px-4 py-3 text-xs font-bold text-slate-600 uppercase tracking-wider border-r border-slate-100">Status</th>
                    <th className="px-4 py-3 text-xs font-bold text-slate-600 uppercase tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredEmployees.map((emp, index) => (
                    <tr key={emp.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-4 py-3 text-sm text-slate-600 border-r border-slate-100">{index + 1}</td>
                      <td className="px-4 py-3 text-sm text-slate-600 border-r border-slate-100">{emp.employeeId}</td>
                      <td className="px-4 py-3 text-sm text-slate-600 border-r border-slate-100">{emp.name}</td>
                      <td className="px-4 py-3 text-sm text-slate-600 border-r border-slate-100">{emp.email}</td>
                      <td className="px-4 py-3 text-sm text-slate-600 border-r border-slate-100">{emp.mobile}</td>
                      <td className="px-4 py-3 text-sm text-slate-600 border-r border-slate-100">{emp.dob}</td>
                      <td className="px-4 py-3 text-sm text-slate-600 border-r border-slate-100">{emp.designation}</td>
                      <td className="px-4 py-3 text-sm text-slate-600 border-r border-slate-100">{emp.joiningDate}</td>
                      <td className="px-4 py-3 text-sm border-r border-slate-100">
                        <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider ${
                          emp.status === 'Active' ? 'bg-emerald-50 text-emerald-600' : 
                          emp.status === 'Inactive' ? 'bg-slate-100 text-slate-500' :
                          emp.status === 'Terminated' ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-600'
                        }`}>
                          {emp.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-600">
                        <div className="flex items-center gap-1">
                          <button className="p-1.5 text-red-600 bg-red-50 rounded border border-red-100 hover:bg-red-100">
                            <RefreshCw className="w-3.5 h-3.5" />
                          </button>
                          <button className="p-1.5 text-indigo-600 bg-indigo-50 rounded border border-indigo-100 hover:bg-indigo-100">
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button 
                            onClick={() => openEditModal(emp)}
                            className="p-1.5 text-emerald-600 bg-emerald-50 rounded border border-emerald-100 hover:bg-emerald-100"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button 
                            onClick={() => handleDelete(emp.id)}
                            className="p-1.5 text-red-600 bg-red-50 rounded border border-red-100 hover:bg-red-100"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="p-4 border-t border-slate-100 flex justify-between items-center text-sm text-slate-500">
              <div>Showing 1 to {filteredEmployees.length} of {employees.length} entries</div>
              <div className="flex items-center gap-1">
                <button className="px-3 py-1 border border-slate-200 rounded hover:bg-slate-50 disabled:opacity-50">Previous</button>
                <button className="px-3 py-1 bg-[#1A73E8] text-white rounded">1</button>
                <button className="px-3 py-1 border border-slate-200 rounded hover:bg-slate-50 disabled:opacity-50">Next</button>
              </div>
            </div>
          </div>
        </div>

        {/* Modal */}
        <AnimatePresence>
          {isModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
              >
                <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                  <h3 className="font-bold text-slate-800">{editingEmployee ? 'Edit Employee' : 'Add New Employee'}</h3>
                  <button onClick={() => setIsModalOpen(false)} className="p-1 hover:bg-slate-200 rounded-full transition-colors">
                    <X className="w-5 h-5 text-slate-500" />
                  </button>
                </div>
                
                <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Employee Name</label>
                      <input 
                        required
                        type="text" 
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                        placeholder="Enter name"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Employee ID</label>
                      <input 
                        required
                        type="text" 
                        value={formData.employeeId}
                        onChange={(e) => setFormData({...formData, employeeId: e.target.value})}
                        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                        placeholder="e.g. 000032"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Email</label>
                      <input 
                        required
                        type="email" 
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                        placeholder="email@example.com"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Mobile</label>
                      <input 
                        required
                        type="text" 
                        value={formData.mobile}
                        onChange={(e) => setFormData({...formData, mobile: e.target.value})}
                        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                        placeholder="+1234567890"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Designation</label>
                      <select 
                        required
                        value={formData.designation}
                        onChange={(e) => setFormData({...formData, designation: e.target.value})}
                        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all bg-white"
                      >
                        <option value="">Select Designation</option>
                        <option value="Manager">Manager</option>
                        <option value="Developer">Developer</option>
                        <option value="Designer">Designer</option>
                        <option value="Lead">Lead</option>
                        <option value="Analyst">Analyst</option>
                        <option value="Engineer">Engineer</option>
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Department</label>
                      <select 
                        required
                        value={formData.department}
                        onChange={(e) => setFormData({...formData, department: e.target.value})}
                        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all bg-white"
                      >
                        <option value="">Select Department</option>
                        <option value="Electrical">Electrical</option>
                        <option value="Production">Production</option>
                        <option value="HR">HR</option>
                        <option value="Finance">Finance</option>
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Status</label>
                      <select 
                        required
                        value={formData.status}
                        onChange={(e) => setFormData({...formData, status: e.target.value as any})}
                        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all bg-white"
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
                        type="date" 
                        value={formData.joiningDate}
                        onChange={(e) => setFormData({...formData, joiningDate: e.target.value})}
                        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Date of Birth</label>
                      <input 
                        required
                        type="date" 
                        value={formData.dob}
                        onChange={(e) => setFormData({...formData, dob: e.target.value})}
                        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Blood Group</label>
                      <select 
                        value={formData.bloodGroup}
                        onChange={(e) => setFormData({...formData, bloodGroup: e.target.value})}
                        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all bg-white"
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
                        type="text" 
                        value={formData.nationalId}
                        onChange={(e) => setFormData({...formData, nationalId: e.target.value})}
                        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                        placeholder="ID Number"
                      />
                    </div>
                  </div>

                  {/* Custom Fields Section */}
                  <div className="mt-8 pt-6 border-t border-slate-100">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                        <Settings className="w-4 h-4 text-indigo-500" />
                        Custom Fields
                      </h4>
                      <button 
                        type="button"
                        onClick={addCustomField}
                        className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
                      >
                        <Plus className="w-3 h-3" />
                        Add Custom Field
                      </button>
                    </div>
                    
                    <div className="space-y-3">
                      {formData.customFields?.map((field, index) => (
                        <div key={index} className="flex gap-3 items-start animate-in fade-in slide-in-from-top-2 duration-200">
                          <div className="flex-1">
                            <input 
                              type="text" 
                              placeholder="Field Name (e.g. LinkedIn)"
                              value={field.key}
                              onChange={(e) => updateCustomField(index, 'key', e.target.value)}
                              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                            />
                          </div>
                          <div className="flex-1">
                            <input 
                              type="text" 
                              placeholder="Field Value"
                              value={field.value}
                              onChange={(e) => updateCustomField(index, 'value', e.target.value)}
                              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                            />
                          </div>
                          <button 
                            type="button"
                            onClick={() => removeCustomField(index)}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors mt-0.5"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                      {(!formData.customFields || formData.customFields.length === 0) && (
                        <div className="text-center py-4 text-xs text-slate-400 italic">
                          No custom fields added yet.
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mt-8 flex justify-end gap-3">
                    <button 
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="px-6 py-2 rounded-lg text-sm font-bold text-slate-600 hover:bg-slate-100 transition-colors"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit"
                      className="px-6 py-2 rounded-lg text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all"
                    >
                      {editingEmployee ? 'Update Employee' : 'Save Employee'}
                    </button>
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
