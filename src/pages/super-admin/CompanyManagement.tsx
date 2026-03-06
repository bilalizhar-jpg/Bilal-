import React, { useState } from 'react';
import SuperAdminLayout from '../../components/SuperAdminLayout';
import { useSuperAdmin, Company, ALL_MENU_ITEMS } from '../../context/SuperAdminContext';
import { useAuth } from '../../context/AuthContext';
import { Trash2, Plus, Edit2, Save, X, Upload, Shield, Check, X as XIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function CompanyManagement() {
  const { companies, addCompany, deleteCompany, updateCompany, toggleMenuAccess, updateCompanyStatus, error } = useSuperAdmin();
  const { user, impersonateCompany } = useAuth();
  const [newCompany, setNewCompany] = useState({ 
    name: '', email: '', mobile: '', subscriptionPlan: 'Basic', uniqueCode: '',
    logo: '', subsidiary: '', headOffice: '', factoryLocation: '',
    adminUsername: '', adminPassword: ''
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Company | null>(null);
  const [accessModalOpen, setAccessModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);

  // Sync editForm with latest company data if it changes while editing
  React.useEffect(() => {
    if (editingId && editForm) {
      const latestCompany = companies.find(c => c.id === editingId);
      if (latestCompany && (latestCompany.status !== editForm.status || latestCompany.isActive !== editForm.isActive)) {
        setEditForm({
          ...editForm,
          status: latestCompany.status,
          isActive: latestCompany.isActive
        });
      }
    }
  }, [companies, editingId, editForm]);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    addCompany({
      ...newCompany,
      uniqueCode: newCompany.uniqueCode || Math.random().toString(36).substring(2, 9).toUpperCase()
    });
    setNewCompany({ 
      name: '', email: '', mobile: '', subscriptionPlan: 'Basic', uniqueCode: '', 
      logo: '', subsidiary: '', headOffice: '', factoryLocation: '',
      adminUsername: '', adminPassword: '' 
    });
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>, isEdit: boolean) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (isEdit && editForm) {
          setEditForm({...editForm, logo: reader.result as string});
        } else {
          setNewCompany({...newCompany, logo: reader.result as string});
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const startEdit = (company: Company) => {
    setEditingId(company.id);
    setEditForm(company);
    setEditModalOpen(true);
  };

  const saveEdit = () => {
    if (editForm) {
      updateCompany(editForm);
      setEditingId(null);
      setEditForm(null);
      setEditModalOpen(false);
    }
  };

  const openAccessModal = (company: Company) => {
    setSelectedCompany(company);
    setAccessModalOpen(true);
  };

  return (
    <SuperAdminLayout>
      <h1 className="text-2xl font-bold mb-6">Company Management</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6" role="alert">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      )}
      
      <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 mb-8">
        <h2 className="text-lg font-bold mb-4">Register New Company</h2>
        <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input type="text" placeholder="Company Name" className="p-2 border rounded" value={newCompany.name} onChange={e => setNewCompany({...newCompany, name: e.target.value})} required />
          <input type="email" placeholder="Email" className="p-2 border rounded" value={newCompany.email} onChange={e => setNewCompany({...newCompany, email: e.target.value})} required />
          <input type="text" placeholder="Mobile" className="p-2 border rounded" value={newCompany.mobile} onChange={e => setNewCompany({...newCompany, mobile: e.target.value})} required />
          <input type="text" placeholder="Unique Code (Optional)" className="p-2 border rounded" value={newCompany.uniqueCode} onChange={e => setNewCompany({...newCompany, uniqueCode: e.target.value})} />
          <input type="text" placeholder="Subsidiary" className="p-2 border rounded" value={newCompany.subsidiary} onChange={e => setNewCompany({...newCompany, subsidiary: e.target.value})} />
          <input type="text" placeholder="Head Office Location" className="p-2 border rounded" value={newCompany.headOffice} onChange={e => setNewCompany({...newCompany, headOffice: e.target.value})} />
          <input type="text" placeholder="Factory Location" className="p-2 border rounded" value={newCompany.factoryLocation} onChange={e => setNewCompany({...newCompany, factoryLocation: e.target.value})} />
          <input type="text" placeholder="Admin Username" className="p-2 border rounded" value={newCompany.adminUsername} onChange={e => setNewCompany({...newCompany, adminUsername: e.target.value})} required />
          <input type="password" placeholder="Admin Password" className="p-2 border rounded" value={newCompany.adminPassword} onChange={e => setNewCompany({...newCompany, adminPassword: e.target.value})} required />
          <label className="flex items-center gap-2 p-2 border rounded cursor-pointer">
            <Upload className="w-4 h-4" /> Upload Logo
            <input type="file" accept="image/*" className="hidden" onChange={(e) => handleLogoUpload(e, false)} />
          </label>
          <select className="p-2 border rounded" value={newCompany.subscriptionPlan} onChange={e => setNewCompany({...newCompany, subscriptionPlan: e.target.value})}>
            <option value="Basic">Basic</option>
            <option value="Pro">Pro</option>
            <option value="Enterprise">Enterprise</option>
          </select>
          <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded flex items-center gap-2 col-span-full">
            <Plus className="w-4 h-4" /> Register Company
          </button>
        </form>
      </div>

      <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <h2 className="text-lg font-bold">Registered Companies</h2>
          <div className="w-full sm:w-64">
            <label className="block text-[10px] text-slate-500 mb-1 font-bold">Select Company to Manage</label>
            <select 
              className="w-full text-xs p-1.5 rounded border bg-slate-50 border-slate-200 text-slate-900 dark:bg-slate-800 dark:border-slate-700 dark:text-white"
              value={user?.companyId || ''}
              onChange={(e) => impersonateCompany(e.target.value || null)}
            >
              <option value="">-- Select Company --</option>
              {companies.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-sm text-slate-500 border-b border-slate-200 dark:border-slate-700">
                <th className="pb-3">Logo</th>
                <th className="pb-3">Name</th>
                <th className="pb-3">Unique Code</th>
                <th className="pb-3">Admin Credentials</th>
                <th className="pb-3 text-center">Status</th>
                <th className="pb-3 text-center">Edit Company</th>
                <th className="pb-3 text-center">Menu Access</th>
                <th className="pb-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {companies.map(company => (
                <tr key={company.id} className="border-b border-slate-100 dark:border-slate-700">
                  {editingId === company.id ? (
                    <>
                      <td className="py-3"><input type="file" accept="image/*" onChange={(e) => handleLogoUpload(e, true)} /></td>
                      <td className="py-3"><input className="p-1 border rounded w-full" value={editForm?.name} onChange={e => setEditForm({...editForm!, name: e.target.value})} /></td>
                      <td className="py-3"><input className="p-1 border rounded w-full" value={editForm?.uniqueCode} onChange={e => setEditForm({...editForm!, uniqueCode: e.target.value})} /></td>
                      <td className="py-3 text-xs">
                        <div>User: {company.adminUsername}</div>
                        <div>Pass: {company.adminPassword}</div>
                      </td>
                      <td className="py-3 text-center">
                         <span className="text-xs text-slate-400">Save to edit status</span>
                      </td>
                      <td className="py-3 text-center">
                         <span className="text-xs text-slate-400">Save to edit access</span>
                      </td>
                      <td className="py-3 flex gap-2">
                        <button onClick={saveEdit} className="text-emerald-500 hover:text-emerald-700"><Save className="w-5 h-5" /></button>
                        <button onClick={() => setEditingId(null)} className="text-slate-500 hover:text-slate-700"><X className="w-5 h-5" /></button>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="py-3"><img src={company.logo} alt="Logo" className="w-10 h-10 object-contain" referrerPolicy="no-referrer" /></td>
                      <td className="py-3">{company.name}</td>
                      <td className="py-3 font-mono">{company.uniqueCode}</td>
                      <td className="py-3 text-xs text-slate-600">
                        <div>User: {company.adminUsername}</div>
                        <div>Pass: {company.adminPassword}</div>
                      </td>
                      <td className="py-3 text-center">
                        <button 
                          onClick={() => updateCompanyStatus(company.id, company.isActive ? 'inactive' : 'active')}
                          className={`px-3 py-1 rounded font-bold text-xs flex items-center gap-1 mx-auto ${
                            company.isActive 
                              ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200' 
                              : 'bg-red-100 text-red-700 hover:bg-red-200'
                          }`}
                        >
                          {company.isActive ? 'Active' : 'Inactive'}
                        </button>
                      </td>
                      <td className="py-3 text-center">
                        <button 
                          onClick={() => startEdit(company)}
                          className="px-3 py-1 rounded bg-amber-100 text-amber-700 font-bold text-xs hover:bg-amber-200 flex items-center gap-1 mx-auto"
                        >
                          <Edit2 className="w-3 h-3" /> Edit Company
                        </button>
                      </td>
                      <td className="py-3 text-center">
                        <button 
                          onClick={() => openAccessModal(company)}
                          className="px-3 py-1 rounded bg-indigo-100 text-indigo-700 font-bold text-xs hover:bg-indigo-200 flex items-center gap-1 mx-auto"
                        >
                          <Shield className="w-3 h-3" /> Manage Access
                        </button>
                      </td>
                      <td className="py-3 flex gap-2">
                        <button onClick={() => deleteCompany(company.id)} className="text-red-500 hover:text-red-700"><Trash2 className="w-5 h-5" /></button>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Company Modal */}
      <AnimatePresence>
        {editModalOpen && editForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto custom-scrollbar"
            >
              <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center sticky top-0 bg-white dark:bg-slate-800 z-10">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Edit Company Details</h2>
                <button onClick={() => setEditModalOpen(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors">
                  <XIcon className="w-6 h-6 text-slate-500" />
                </button>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Company Name</label>
                    <input type="text" className="w-full p-2 border rounded dark:bg-slate-900 dark:border-slate-700" value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email</label>
                    <input type="email" className="w-full p-2 border rounded dark:bg-slate-900 dark:border-slate-700" value={editForm.email} onChange={e => setEditForm({...editForm, email: e.target.value})} required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Mobile</label>
                    <input type="text" className="w-full p-2 border rounded dark:bg-slate-900 dark:border-slate-700" value={editForm.mobile} onChange={e => setEditForm({...editForm, mobile: e.target.value})} required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Unique Code</label>
                    <input type="text" className="w-full p-2 border rounded dark:bg-slate-900 dark:border-slate-700" value={editForm.uniqueCode} onChange={e => setEditForm({...editForm, uniqueCode: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Subsidiary</label>
                    <input type="text" className="w-full p-2 border rounded dark:bg-slate-900 dark:border-slate-700" value={editForm.subsidiary || ''} onChange={e => setEditForm({...editForm, subsidiary: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Head Office Location</label>
                    <input type="text" className="w-full p-2 border rounded dark:bg-slate-900 dark:border-slate-700" value={editForm.headOffice || ''} onChange={e => setEditForm({...editForm, headOffice: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Factory Location</label>
                    <input type="text" className="w-full p-2 border rounded dark:bg-slate-900 dark:border-slate-700" value={editForm.factoryLocation || ''} onChange={e => setEditForm({...editForm, factoryLocation: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Admin Username</label>
                    <input type="text" className="w-full p-2 border rounded dark:bg-slate-900 dark:border-slate-700" value={editForm.adminUsername || ''} onChange={e => setEditForm({...editForm, adminUsername: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Admin Password</label>
                    <input type="text" className="w-full p-2 border rounded dark:bg-slate-900 dark:border-slate-700" value={editForm.adminPassword || ''} onChange={e => setEditForm({...editForm, adminPassword: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Subscription Plan</label>
                    <select className="w-full p-2 border rounded dark:bg-slate-900 dark:border-slate-700" value={editForm.subscriptionPlan} onChange={e => setEditForm({...editForm, subscriptionPlan: e.target.value as any})}>
                      <option value="Basic">Basic</option>
                      <option value="Pro">Pro</option>
                      <option value="Enterprise">Enterprise</option>
                    </select>
                  </div>
                  <div className="col-span-full">
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Upload New Logo</label>
                    <div className="flex items-center gap-4">
                      {editForm.logo && <img src={editForm.logo} alt="Current Logo" className="w-12 h-12 object-contain border rounded p-1" />}
                      <label className="flex items-center gap-2 p-2 border rounded cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                        <Upload className="w-4 h-4" /> Choose File
                        <input type="file" accept="image/*" className="hidden" onChange={(e) => handleLogoUpload(e, true)} />
                      </label>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="p-6 border-t border-slate-200 dark:border-slate-700 flex justify-end gap-3 sticky bottom-0 bg-white dark:bg-slate-800 z-10">
                <button onClick={() => setEditModalOpen(false)} className="px-4 py-2 border rounded text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:border-slate-600 dark:hover:bg-slate-700">Cancel</button>
                <button onClick={saveEdit} className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 flex items-center gap-2">
                  <Save className="w-4 h-4" /> Save Changes
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Access Management Modal */}
      <AnimatePresence>
        {accessModalOpen && selectedCompany && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
            >
              <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-900">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">All Menu Access Control</h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Manage menu visibility for <span className="font-bold text-indigo-600">{selectedCompany.name}</span></p>
                </div>
                <button onClick={() => setAccessModalOpen(false)} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors">
                  <XIcon className="w-6 h-6 text-slate-500" />
                </button>
              </div>
              
              <div className="p-6 overflow-y-auto custom-scrollbar">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {ALL_MENU_ITEMS.map((menu) => {
                    const isAllowed = !selectedCompany.blockedMenus.includes(menu);
                    return (
                      <div 
                        key={menu}
                        onClick={() => toggleMenuAccess(selectedCompany.id, menu)}
                        className={`
                          cursor-pointer p-4 rounded-lg border-2 transition-all duration-200 flex items-center justify-between
                          ${isAllowed 
                            ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20' 
                            : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-slate-300'
                          }
                        `}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`
                            w-5 h-5 rounded flex items-center justify-center border
                            ${isAllowed ? 'bg-emerald-500 border-emerald-500' : 'bg-white border-slate-300'}
                          `}>
                            {isAllowed && <Check className="w-3 h-3 text-white" />}
                          </div>
                          <span className={`font-medium ${isAllowed ? 'text-emerald-900 dark:text-emerald-100' : 'text-slate-600 dark:text-slate-300'}`}>
                            {menu}
                          </span>
                        </div>
                        {isAllowed ? (
                          <span className="text-xs font-bold text-emerald-600 bg-emerald-100 px-2 py-1 rounded-full">Allowed</span>
                        ) : (
                          <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded-full">Blocked</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="p-6 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 flex justify-end">
                <button 
                  onClick={() => setAccessModalOpen(false)}
                  className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors shadow-sm"
                >
                  Done
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </SuperAdminLayout>
  );
}
