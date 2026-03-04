import React, { useState } from 'react';
import { Shield, Plus, Edit2, Trash2, Check, X, Search, Save } from 'lucide-react';
import AdminLayout from '../../components/AdminLayout';
import { useTheme } from '../../context/ThemeContext';

interface Permission {
  view: boolean;
  create: boolean;
  edit: boolean;
  delete: boolean;
}

interface RolePermissions {
  [module: string]: Permission;
}

interface Role {
  id: string;
  name: string;
  description: string;
  isSystem: boolean; // System roles like Super Admin cannot be deleted
  permissions: RolePermissions;
}

const MODULES = [
  'Dashboard', 'Attendance', 'Award', 'Department', 'Employee', 
  'Leave', 'Loan', 'Notice Board', 'Payroll', 'Performance', 
  'Procurement', 'Assets', 'Project Management', 'Recruitment', 
  'Marketing', 'Reports', 'Settings'
];

const defaultPermissions: RolePermissions = MODULES.reduce((acc, module) => ({
  ...acc,
  [module]: { view: false, create: false, edit: false, delete: false }
}), {});

const allPermissions: RolePermissions = MODULES.reduce((acc, module) => ({
  ...acc,
  [module]: { view: true, create: true, edit: true, delete: true }
}), {});

const initialRoles: Role[] = [
  {
    id: '1',
    name: 'Super Admin',
    description: 'Has full access to all modules and settings.',
    isSystem: true,
    permissions: allPermissions
  },
  {
    id: '2',
    name: 'Admin',
    description: 'Has access to most modules, but cannot manage roles.',
    isSystem: true,
    permissions: {
      ...allPermissions,
      'Settings': { view: true, create: false, edit: false, delete: false }
    }
  },
  {
    id: '3',
    name: 'HR Manager',
    description: 'Manages employees, attendance, and recruitment.',
    isSystem: false,
    permissions: {
      ...defaultPermissions,
      'Dashboard': { view: true, create: false, edit: false, delete: false },
      'Employee': { view: true, create: true, edit: true, delete: false },
      'Attendance': { view: true, create: true, edit: true, delete: false },
      'Recruitment': { view: true, create: true, edit: true, delete: true },
    }
  }
];

export default function RoleManagement() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [roles, setRoles] = useState<Role[]>(initialRoles);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const [editFormData, setEditFormData] = useState<Role | null>(null);

  const handleEditRole = (role: Role) => {
    setSelectedRole(role);
    setEditFormData(JSON.parse(JSON.stringify(role))); // Deep copy
    setIsEditing(true);
  };

  const handleCreateRole = () => {
    const newRole: Role = {
      id: Date.now().toString(),
      name: 'New Role',
      description: '',
      isSystem: false,
      permissions: JSON.parse(JSON.stringify(defaultPermissions))
    };
    setSelectedRole(newRole);
    setEditFormData(newRole);
    setIsEditing(true);
  };

  const handleDeleteRole = (id: string) => {
    if (window.confirm('Are you sure you want to delete this role?')) {
      setRoles(roles.filter(r => r.id !== id));
      if (selectedRole?.id === id) {
        setSelectedRole(null);
        setIsEditing(false);
      }
    }
  };

  const handleSaveRole = () => {
    if (!editFormData) return;
    
    // Check if it's a new role or existing
    const exists = roles.find(r => r.id === editFormData.id);
    if (exists) {
      setRoles(roles.map(r => r.id === editFormData.id ? editFormData : r));
    } else {
      setRoles([...roles, editFormData]);
    }
    
    setSelectedRole(editFormData);
    setIsEditing(false);
  };

  const togglePermission = (module: string, action: keyof Permission) => {
    if (!editFormData || editFormData.isSystem && editFormData.name === 'Super Admin') return; // Cannot edit Super Admin permissions
    
    setEditFormData({
      ...editFormData,
      permissions: {
        ...editFormData.permissions,
        [module]: {
          ...editFormData.permissions[module],
          [action]: !editFormData.permissions[module][action]
        }
      }
    });
  };

  const toggleAllModulePermissions = (module: string, value: boolean) => {
    if (!editFormData || editFormData.isSystem && editFormData.name === 'Super Admin') return;
    
    setEditFormData({
      ...editFormData,
      permissions: {
        ...editFormData.permissions,
        [module]: { view: value, create: value, edit: value, delete: value }
      }
    });
  };

  const filteredRoles = roles.filter(r => r.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <Shield className="w-6 h-6 text-indigo-500" />
              Roles & Permissions
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Manage user roles and their access levels across the application.</p>
          </div>
          <button 
            onClick={handleCreateRole}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-indigo-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Create Role
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Roles List */}
          <div className={`lg:col-span-1 rounded-xl border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} shadow-sm overflow-hidden flex flex-col h-[calc(100vh-12rem)]`}>
            <div className="p-4 border-b border-slate-100 dark:border-slate-800">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Search roles..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`w-full pl-9 pr-4 py-2 border rounded-md text-sm outline-none focus:ring-1 focus:ring-indigo-500 ${isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200'}`}
                />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
              {filteredRoles.map(role => (
                <div 
                  key={role.id}
                  onClick={() => {
                    setSelectedRole(role);
                    setIsEditing(false);
                  }}
                  className={`p-3 rounded-lg cursor-pointer transition-colors flex justify-between items-center group ${
                    selectedRole?.id === role.id 
                      ? (isDark ? 'bg-indigo-900/40 border border-indigo-500/50' : 'bg-indigo-50 border border-indigo-200') 
                      : (isDark ? 'hover:bg-slate-800 border border-transparent' : 'hover:bg-slate-50 border border-transparent')
                  }`}
                >
                  <div>
                    <h3 className={`font-semibold text-sm ${selectedRole?.id === role.id ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-800 dark:text-white'}`}>
                      {role.name}
                      {role.isSystem && <span className="ml-2 text-[10px] uppercase tracking-wider bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-1.5 py-0.5 rounded">System</span>}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-1">{role.description}</p>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleEditRole(role); }}
                      className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-white dark:hover:bg-slate-700 rounded"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    {!role.isSystem && (
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleDeleteRole(role.id); }}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-white dark:hover:bg-slate-700 rounded"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Role Details / Edit */}
          <div className={`lg:col-span-2 rounded-xl border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} shadow-sm overflow-hidden flex flex-col h-[calc(100vh-12rem)]`}>
            {selectedRole ? (
              <>
                <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/20">
                  <div>
                    {isEditing ? (
                      <input 
                        type="text"
                        value={editFormData?.name || ''}
                        onChange={(e) => setEditFormData(prev => prev ? {...prev, name: e.target.value} : null)}
                        className={`text-xl font-bold border-b-2 border-indigo-500 bg-transparent outline-none px-1 py-0.5 ${isDark ? 'text-white' : 'text-slate-800'}`}
                        placeholder="Role Name"
                        disabled={editFormData?.isSystem}
                      />
                    ) : (
                      <h3 className="text-xl font-bold text-slate-800 dark:text-white">{selectedRole.name}</h3>
                    )}
                    
                    {isEditing ? (
                      <input 
                        type="text"
                        value={editFormData?.description || ''}
                        onChange={(e) => setEditFormData(prev => prev ? {...prev, description: e.target.value} : null)}
                        className={`w-full mt-2 text-sm border rounded px-2 py-1 outline-none ${isDark ? 'bg-slate-800 border-slate-700 text-slate-300' : 'bg-white border-slate-300 text-slate-600'}`}
                        placeholder="Role Description"
                      />
                    ) : (
                      <p className="text-sm text-slate-500 mt-1">{selectedRole.description}</p>
                    )}
                  </div>
                  
                  <div className="flex gap-2">
                    {isEditing ? (
                      <>
                        <button 
                          onClick={() => {
                            setIsEditing(false);
                            if (!roles.find(r => r.id === selectedRole.id)) {
                              setSelectedRole(null); // Cancel creating new role
                            }
                          }}
                          className="px-4 py-2 rounded-lg text-sm font-bold border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                        >
                          Cancel
                        </button>
                        <button 
                          onClick={handleSaveRole}
                          className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-emerald-700"
                        >
                          <Save className="w-4 h-4" />
                          Save Role
                        </button>
                      </>
                    ) : (
                      <button 
                        onClick={() => handleEditRole(selectedRole)}
                        className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-indigo-700"
                      >
                        <Edit2 className="w-4 h-4" />
                        Edit Permissions
                      </button>
                    )}
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                  <div className="mb-4 flex justify-between items-center">
                    <h4 className="font-bold text-slate-800 dark:text-white">Module Permissions</h4>
                    {isEditing && editFormData?.name !== 'Super Admin' && (
                      <div className="text-xs text-slate-500 flex items-center gap-2">
                        <span className="flex items-center gap-1"><Check className="w-3 h-3 text-emerald-500" /> Granted</span>
                        <span className="flex items-center gap-1"><X className="w-3 h-3 text-slate-300" /> Denied</span>
                      </div>
                    )}
                  </div>

                  <div className="border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                        <tr>
                          <th className="px-4 py-3 font-semibold text-slate-700 dark:text-slate-300">Module</th>
                          <th className="px-4 py-3 font-semibold text-slate-700 dark:text-slate-300 text-center">View</th>
                          <th className="px-4 py-3 font-semibold text-slate-700 dark:text-slate-300 text-center">Create</th>
                          <th className="px-4 py-3 font-semibold text-slate-700 dark:text-slate-300 text-center">Edit</th>
                          <th className="px-4 py-3 font-semibold text-slate-700 dark:text-slate-300 text-center">Delete</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {MODULES.map(module => {
                          const perms = isEditing ? editFormData?.permissions[module] : selectedRole.permissions[module];
                          const isSuperAdmin = (isEditing ? editFormData?.name : selectedRole.name) === 'Super Admin';
                          
                          if (!perms) return null;

                          const allGranted = perms.view && perms.create && perms.edit && perms.delete;

                          return (
                            <tr key={module} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                              <td className="px-4 py-3 font-medium text-slate-800 dark:text-slate-200 flex items-center justify-between">
                                {module}
                                {isEditing && !isSuperAdmin && (
                                  <button 
                                    onClick={() => toggleAllModulePermissions(module, !allGranted)}
                                    className={`text-[10px] px-2 py-0.5 rounded-full border ${allGranted ? 'bg-indigo-50 border-indigo-200 text-indigo-600 dark:bg-indigo-900/30 dark:border-indigo-800 dark:text-indigo-400' : 'bg-slate-50 border-slate-200 text-slate-500 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400'}`}
                                  >
                                    {allGranted ? 'Unselect All' : 'Select All'}
                                  </button>
                                )}
                              </td>
                              {(['view', 'create', 'edit', 'delete'] as const).map(action => (
                                <td key={action} className="px-4 py-3 text-center">
                                  {isEditing && !isSuperAdmin ? (
                                    <button 
                                      onClick={() => togglePermission(module, action)}
                                      className={`w-6 h-6 rounded flex items-center justify-center mx-auto transition-colors ${
                                        perms[action] 
                                          ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400' 
                                          : 'bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700'
                                      }`}
                                    >
                                      {perms[action] ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                                    </button>
                                  ) : (
                                    <div className="flex justify-center">
                                      {perms[action] ? (
                                        <Check className="w-4 h-4 text-emerald-500" />
                                      ) : (
                                        <X className="w-4 h-4 text-slate-300 dark:text-slate-600" />
                                      )}
                                    </div>
                                  )}
                                </td>
                              ))}
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-500 dark:text-slate-400 p-8 text-center">
                <Shield className="w-16 h-16 text-slate-300 dark:text-slate-600 mb-4" />
                <h3 className="text-xl font-bold text-slate-700 dark:text-slate-300 mb-2">Select a Role</h3>
                <p className="max-w-md">Choose a role from the list to view or edit its permissions, or create a new role to define custom access levels.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
