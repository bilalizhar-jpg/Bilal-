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
      <h1 className="text-2xl font-bold mb-6 text-white">Company Management</h1>
      
      {error && (
        <div className="bg-red-900/20 border border-red-500/50 text-red-200 px-4 py-3 rounded-2xl mb-6" role="alert">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      )}
      
      <div className="bg-[#2A2A3D] p-6 border border-white/5 rounded-2xl shadow-[0_4px_20px_rgba(0,255,204,0.05)] mb-8">
        <h2 className="text-lg font-black text-white uppercase tracking-tight mb-6">Register New Company</h2>
        <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input type="text" placeholder="Company Name" className="p-3 bg-[#1E1E2F] border border-white/10 rounded-xl text-white placeholder-[#B0B0C3] focus:border-[#00FFCC] focus:ring-1 focus:ring-[#00FFCC] outline-none" value={newCompany.name} onChange={e => setNewCompany({...newCompany, name: e.target.value})} required />
          <input type="email" placeholder="Email" className="p-3 bg-[#1E1E2F] border border-white/10 rounded-xl text-white placeholder-[#B0B0C3] focus:border-[#00FFCC] focus:ring-1 focus:ring-[#00FFCC] outline-none" value={newCompany.email} onChange={e => setNewCompany({...newCompany, email: e.target.value})} required />
          <input type="text" placeholder="Mobile" className="p-3 bg-[#1E1E2F] border border-white/10 rounded-xl text-white placeholder-[#B0B0C3] focus:border-[#00FFCC] focus:ring-1 focus:ring-[#00FFCC] outline-none" value={newCompany.mobile} onChange={e => setNewCompany({...newCompany, mobile: e.target.value})} required />
          <input type="text" placeholder="Unique Code (Optional)" className="p-3 bg-[#1E1E2F] border border-white/10 rounded-xl text-white placeholder-[#B0B0C3] focus:border-[#00FFCC] focus:ring-1 focus:ring-[#00FFCC] outline-none" value={newCompany.uniqueCode} onChange={e => setNewCompany({...newCompany, uniqueCode: e.target.value})} />
          <input type="text" placeholder="Subsidiary" className="p-3 bg-[#1E1E2F] border border-white/10 rounded-xl text-white placeholder-[#B0B0C3] focus:border-[#00FFCC] focus:ring-1 focus:ring-[#00FFCC] outline-none" value={newCompany.subsidiary} onChange={e => setNewCompany({...newCompany, subsidiary: e.target.value})} />
          <input type="text" placeholder="Head Office Location" className="p-3 bg-[#1E1E2F] border border-white/10 rounded-xl text-white placeholder-[#B0B0C3] focus:border-[#00FFCC] focus:ring-1 focus:ring-[#00FFCC] outline-none" value={newCompany.headOffice} onChange={e => setNewCompany({...newCompany, headOffice: e.target.value})} />
          <input type="text" placeholder="Factory Location" className="p-3 bg-[#1E1E2F] border border-white/10 rounded-xl text-white placeholder-[#B0B0C3] focus:border-[#00FFCC] focus:ring-1 focus:ring-[#00FFCC] outline-none" value={newCompany.factoryLocation} onChange={e => setNewCompany({...newCompany, factoryLocation: e.target.value})} />
          <input type="text" placeholder="Admin Username" className="p-3 bg-[#1E1E2F] border border-white/10 rounded-xl text-white placeholder-[#B0B0C3] focus:border-[#00FFCC] focus:ring-1 focus:ring-[#00FFCC] outline-none" value={newCompany.adminUsername} onChange={e => setNewCompany({...newCompany, adminUsername: e.target.value})} required />
          <input type="password" placeholder="Admin Password" className="p-3 bg-[#1E1E2F] border border-white/10 rounded-xl text-white placeholder-[#B0B0C3] focus:border-[#00FFCC] focus:ring-1 focus:ring-[#00FFCC] outline-none" value={newCompany.adminPassword} onChange={e => setNewCompany({...newCompany, adminPassword: e.target.value})} required />
          <label className="flex items-center gap-2 p-3 bg-[#1E1E2F] border border-white/10 rounded-xl cursor-pointer text-[#B0B0C3] hover:text-white transition-colors">
            <Upload className="w-4 h-4" /> Upload Logo
            <input type="file" accept="image/*" className="hidden" onChange={(e) => handleLogoUpload(e, false)} />
          </label>
          <select className="p-3 bg-[#1E1E2F] border border-white/10 rounded-xl text-white outline-none" value={newCompany.subscriptionPlan} onChange={e => setNewCompany({...newCompany, subscriptionPlan: e.target.value})}>
            <option value="Basic">Basic</option>
            <option value="Pro">Pro</option>
            <option value="Enterprise">Enterprise</option>
          </select>
          <button type="submit" className="bg-[#00FFCC] hover:opacity-80 text-[#1E1E2F] px-4 py-3 rounded-xl flex items-center justify-center gap-2 col-span-full font-black uppercase tracking-widest transition-all shadow-[0_0_8px_#00FFCC]">
            <Plus className="w-4 h-4" /> Register Company
          </button>
        </form>
      </div>

      <div className="bg-[#2A2A3D] p-8 border border-white/5 rounded-2xl shadow-[0_4px_20px_rgba(0,255,204,0.05)]">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <h2 className="text-xl font-black text-white uppercase tracking-tight">Registered Companies</h2>
          <div className="w-full sm:w-64">
            <label className="block text-[10px] text-[#B0B0C3] mb-1 font-black uppercase tracking-widest">Select Company to Manage</label>
            <select 
              className="w-full text-xs p-3 rounded-xl border bg-[#1E1E2F] border-white/10 text-white outline-none"
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
              <tr className="text-left text-[10px] font-black text-[#B0B0C3] uppercase tracking-widest border-b border-white/5">
                <th className="pb-4">Logo</th>
                <th className="pb-4">Name</th>
                <th className="pb-4">Unique Code</th>
                <th className="pb-4">Admin Credentials</th>
                <th className="pb-4 text-center">Status</th>
                <th className="pb-4 text-center">Edit Company</th>
                <th className="pb-4 text-center">Menu Access</th>
                <th className="pb-4">Action</th>
              </tr>
            </thead>
            <tbody className="text-sm text-[#B0B0C3]">
              {companies.map(company => (
                <tr key={company.id} className="border-b border-white/5 hover:bg-[#1E1E2F] transition-colors">
                  {editingId === company.id ? (
                    <>
                      <td className="py-4"><input type="file" accept="image/*" onChange={(e) => handleLogoUpload(e, true)} /></td>
                      <td className="py-4"><input className="p-2 bg-[#1E1E2F] border border-white/10 rounded-lg w-full text-white" value={editForm?.name} onChange={e => setEditForm({...editForm!, name: e.target.value})} /></td>
                      <td className="py-4"><input className="p-2 bg-[#1E1E2F] border border-white/10 rounded-lg w-full text-white" value={editForm?.uniqueCode} onChange={e => setEditForm({...editForm!, uniqueCode: e.target.value})} /></td>
                      <td className="py-4 text-xs">
                        <div>User: {company.adminUsername}</div>
                        <div>Pass: {company.adminPassword}</div>
                      </td>
                      <td className="py-4 text-center">
                         <span className="text-xs text-[#B0B0C3]">Save to edit status</span>
                      </td>
                      <td className="py-4 text-center">
                         <span className="text-xs text-[#B0B0C3]">Save to edit access</span>
                      </td>
                      <td className="py-4 flex gap-2">
                        <button onClick={saveEdit} className="text-[#00FFCC] hover:opacity-80"><Save className="w-5 h-5" /></button>
                        <button onClick={() => setEditingId(null)} className="text-[#B0B0C3] hover:text-white"><X className="w-5 h-5" /></button>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="py-4"><img src={company.logo} alt="Logo" className="w-10 h-10 object-contain rounded-lg bg-[#1E1E2F] p-1" referrerPolicy="no-referrer" /></td>
                      <td className="py-4 font-bold text-white">{company.name}</td>
                      <td className="py-4 font-mono text-[#00FFCC]">{company.uniqueCode}</td>
                      <td className="py-4 text-xs text-[#B0B0C3]">
                        <div>User: {company.adminUsername}</div>
                        <div>Pass: {company.adminPassword}</div>
                      </td>
                      <td className="py-4 text-center">
                        <button 
                          onClick={() => updateCompanyStatus(company.id, company.isActive ? 'inactive' : 'active')}
                          className={`px-3 py-1 rounded-lg font-black text-[10px] uppercase tracking-widest flex items-center gap-1 mx-auto ${
                            company.isActive 
                              ? 'bg-[#00FFCC]/10 text-[#00FFCC] border border-[#00FFCC]/20 hover:bg-[#00FFCC]/20' 
                              : 'bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20'
                          }`}
                        >
                          {company.isActive ? 'Active' : 'Inactive'}
                        </button>
                      </td>
                      <td className="py-4 text-center">
                        <button 
                          onClick={() => startEdit(company)}
                          className="px-3 py-1 rounded-lg bg-[#00FFCC]/10 text-[#00FFCC] border border-[#00FFCC]/20 font-black text-[10px] uppercase tracking-widest hover:bg-[#00FFCC]/20 flex items-center gap-1 mx-auto"
                        >
                          <Edit2 className="w-3 h-3" /> Edit
                        </button>
                      </td>
                      <td className="py-4 text-center">
                        <button 
                          onClick={() => openAccessModal(company)}
                          className="px-3 py-1 rounded-lg bg-[#00FFCC]/10 text-[#00FFCC] border border-[#00FFCC]/20 font-black text-[10px] uppercase tracking-widest hover:bg-[#00FFCC]/20 flex items-center gap-1 mx-auto"
                        >
                          <Shield className="w-3 h-3" /> Access
                        </button>
                      </td>
                      <td className="py-4 flex gap-2">
                        <button onClick={() => deleteCompany(company.id)} className="text-red-400 hover:text-red-300"><Trash2 className="w-5 h-5" /></button>
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
              className="bg-[#2A2A3D] rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto custom-scrollbar"
            >
              <div className="p-6 border-b border-white/5 flex justify-between items-center sticky top-0 bg-[#2A2A3D] z-10">
                <h2 className="text-xl font-bold text-white">Edit Company Details</h2>
                <button onClick={() => setEditModalOpen(false)} className="p-2 hover:bg-[#1E1E2F] rounded-full transition-colors">
                  <XIcon className="w-6 h-6 text-[#B0B0C3]" />
                </button>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-[#B0B0C3] mb-1">Company Name</label>
                    <input type="text" className="w-full p-2 border rounded bg-[#1E1E2F] border-white/10 text-white" value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#B0B0C3] mb-1">Email</label>
                    <input type="email" className="w-full p-2 border rounded bg-[#1E1E2F] border-white/10 text-white" value={editForm.email} onChange={e => setEditForm({...editForm, email: e.target.value})} required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#B0B0C3] mb-1">Mobile</label>
                    <input type="text" className="w-full p-2 border rounded bg-[#1E1E2F] border-white/10 text-white" value={editForm.mobile} onChange={e => setEditForm({...editForm, mobile: e.target.value})} required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#B0B0C3] mb-1">Unique Code</label>
                    <input type="text" className="w-full p-2 border rounded bg-[#1E1E2F] border-white/10 text-white" value={editForm.uniqueCode} onChange={e => setEditForm({...editForm, uniqueCode: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#B0B0C3] mb-1">Subsidiary</label>
                    <input type="text" className="w-full p-2 border rounded bg-[#1E1E2F] border-white/10 text-white" value={editForm.subsidiary || ''} onChange={e => setEditForm({...editForm, subsidiary: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#B0B0C3] mb-1">Head Office Location</label>
                    <input type="text" className="w-full p-2 border rounded bg-[#1E1E2F] border-white/10 text-white" value={editForm.headOffice || ''} onChange={e => setEditForm({...editForm, headOffice: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#B0B0C3] mb-1">Factory Location</label>
                    <input type="text" className="w-full p-2 border rounded bg-[#1E1E2F] border-white/10 text-white" value={editForm.factoryLocation || ''} onChange={e => setEditForm({...editForm, factoryLocation: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#B0B0C3] mb-1">Admin Username</label>
                    <input type="text" className="w-full p-2 border rounded bg-[#1E1E2F] border-white/10 text-white" value={editForm.adminUsername || ''} onChange={e => setEditForm({...editForm, adminUsername: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#B0B0C3] mb-1">Admin Password</label>
                    <input type="text" className="w-full p-2 border rounded bg-[#1E1E2F] border-white/10 text-white" value={editForm.adminPassword || ''} onChange={e => setEditForm({...editForm, adminPassword: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#B0B0C3] mb-1">Subscription Plan</label>
                    <select className="w-full p-2 border rounded bg-[#1E1E2F] border-white/10 text-white" value={editForm.subscriptionPlan} onChange={e => setEditForm({...editForm, subscriptionPlan: e.target.value as any})}>
                      <option value="Basic">Basic</option>
                      <option value="Pro">Pro</option>
                      <option value="Enterprise">Enterprise</option>
                    </select>
                  </div>
                  <div className="col-span-full">
                    <label className="block text-sm font-medium text-[#B0B0C3] mb-1">Upload New Logo</label>
                    <div className="flex items-center gap-4">
                      {editForm.logo && <img src={editForm.logo} alt="Current Logo" className="w-12 h-12 object-contain border rounded p-1" />}
                      <label className="flex items-center gap-2 p-2 border rounded cursor-pointer hover:bg-[#1E1E2F] transition-colors">
                        <Upload className="w-4 h-4" /> Choose File
                        <input type="file" accept="image/*" className="hidden" onChange={(e) => handleLogoUpload(e, true)} />
                      </label>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="p-6 border-t border-white/5 flex justify-end gap-3 sticky bottom-0 bg-[#2A2A3D] z-10">
                <button onClick={() => setEditModalOpen(false)} className="px-4 py-2 border rounded text-[#B0B0C3] hover:bg-[#1E1E2F]">Cancel</button>
                <button onClick={saveEdit} className="px-4 py-2 bg-[#00FFCC] text-[#1E1E2F] rounded hover:opacity-80 flex items-center gap-2">
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
              className="bg-[#2A2A3D] rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
            >
              <div className="p-6 border-b border-white/5 flex justify-between items-center bg-[#1E1E2F]">
                <div>
                  <h2 className="text-xl font-bold text-white">All Menu Access Control</h2>
                  <p className="text-sm text-[#B0B0C3]">Manage menu visibility for <span className="font-bold text-[#00FFCC]">{selectedCompany.name}</span></p>
                </div>
                <button onClick={() => setAccessModalOpen(false)} className="p-2 hover:bg-[#2A2A3D] rounded-full transition-colors">
                  <XIcon className="w-6 h-6 text-[#B0B0C3]" />
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
                            ? 'border-[#00FFCC] bg-[#00FFCC]/10' 
                            : 'border-white/10 bg-[#1E1E2F] hover:border-white/20'
                          }
                        `}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`
                            w-5 h-5 rounded flex items-center justify-center border
                            ${isAllowed ? 'bg-[#00FFCC] border-[#00FFCC]' : 'bg-[#1E1E2F] border-white/20'}
                          `}>
                            {isAllowed && <Check className="w-3 h-3 text-[#1E1E2F]" />}
                          </div>
                          <span className={`font-medium ${isAllowed ? 'text-[#00FFCC]' : 'text-[#B0B0C3]'}`}>
                            {menu}
                          </span>
                        </div>
                        {isAllowed ? (
                          <span className="text-xs font-bold text-[#00FFCC] bg-[#00FFCC]/10 px-2 py-1 rounded-full">Allowed</span>
                        ) : (
                          <span className="text-xs font-bold text-[#B0B0C3] bg-[#1E1E2F] px-2 py-1 rounded-full">Blocked</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="p-6 border-t border-white/5 bg-[#1E1E2F] flex justify-end">
                <button 
                  onClick={() => setAccessModalOpen(false)}
                  className="px-6 py-2 bg-[#00FFCC] text-[#1E1E2F] rounded-lg font-medium hover:opacity-80 transition-colors shadow-[0_0_8px_#00FFCC]"
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
