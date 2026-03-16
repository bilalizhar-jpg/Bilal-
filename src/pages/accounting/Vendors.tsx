import React, { useState } from 'react';
import AccountingLayout from '../../components/accounting/AccountingLayout';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Search, X, AlertCircle, Trash2, UserPlus, Mail, Phone, MapPin } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useVendor } from '../../context/VendorContext';

export default function Vendors() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const { vendors, loading, addVendor, updateVendor, deleteVendor } = useVendor();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVendor, setEditingVendor] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    companyName: '',
    email: '',
    phone: '',
    address: '',
    taxNumber: '',
    paymentTerms: 'Net 30'
  });

  const filteredVendors = vendors.filter(vendor => 
    vendor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vendor.companyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vendor.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenModal = (vendor?: any) => {
    if (vendor) {
      setEditingVendor(vendor);
      setFormData({
        name: vendor.name,
        companyName: vendor.companyName || '',
        email: vendor.email || '',
        phone: vendor.phone || '',
        address: vendor.address || '',
        taxNumber: vendor.taxNumber || '',
        paymentTerms: vendor.paymentTerms || 'Net 30'
      });
    } else {
      setEditingVendor(null);
      setFormData({
        name: '',
        companyName: '',
        email: '',
        phone: '',
        address: '',
        taxNumber: '',
        paymentTerms: 'Net 30'
      });
    }
    setErrorMsg(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    try {
      if (editingVendor) {
        await updateVendor(editingVendor.id, formData);
      } else {
        await addVendor(formData);
      }
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error saving vendor:', error);
      setErrorMsg('Failed to save vendor. Please try again.');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this vendor?')) {
      try {
        await deleteVendor(id);
      } catch (error) {
        console.error('Error deleting vendor:', error);
        alert('Failed to delete vendor');
      }
    }
  };

  return (
    <AccountingLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className={`text-2xl font-black uppercase tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Vendors & Suppliers
            </h1>
            <p className={`text-sm ${isDark ? 'text-[#B0B0C3]' : 'text-slate-500'}`}>
              Manage your business suppliers and service providers
            </p>
          </div>
          <button 
            onClick={() => handleOpenModal()}
            className={`flex items-center gap-2 px-4 py-2 rounded-md font-bold text-sm uppercase tracking-widest transition-colors ${
              isDark 
                ? 'bg-[#00FFCC] text-[#1E1E2F] hover:bg-[#00D1FF] shadow-[0_0_8px_rgba(0,255,204,0.4)]' 
                : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md'
            }`}
          >
            <UserPlus className="w-4 h-4" />
            Add Vendor
          </button>
        </div>

        <div className={`p-6 rounded-2xl border ${isDark ? 'bg-[#2A2A3D] border-white/5' : 'bg-white border-slate-200'}`}>
          <div className="relative mb-6 max-w-md">
            <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${isDark ? 'text-[#B0B0C3]' : 'text-slate-400'}`} />
            <input
              type="text"
              placeholder="Search vendors by name, company, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pl-10 pr-4 py-2 rounded-xl text-sm transition-all outline-none border ${
                isDark 
                  ? 'bg-[#1E1E2F] border-white/10 text-white placeholder-[#B0B0C3] focus:border-[#00FFCC]' 
                  : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-indigo-500'
              }`}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading ? (
              <div className="col-span-full py-12 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
              </div>
            ) : filteredVendors.length === 0 ? (
              <div className="col-span-full py-12 text-center text-sm text-slate-500">
                No vendors found.
              </div>
            ) : (
              filteredVendors.map((vendor) => (
                <motion.div
                  layout
                  key={vendor.id}
                  className={`p-5 rounded-2xl border transition-all group ${
                    isDark ? 'bg-[#1E1E2F] border-white/5 hover:border-[#00FFCC]/30' : 'bg-slate-50 border-slate-100 hover:border-indigo-200'
                  }`}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className={`font-bold text-lg ${isDark ? 'text-white' : 'text-slate-900'}`}>{vendor.name}</h3>
                      {vendor.companyName && (
                        <p className={`text-xs font-bold uppercase tracking-widest ${isDark ? 'text-[#00FFCC]' : 'text-indigo-600'}`}>
                          {vendor.companyName}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => handleOpenModal(vendor)}
                        className={`p-1.5 rounded-lg transition-colors ${isDark ? 'hover:bg-white/10 text-[#B0B0C3]' : 'hover:bg-white text-slate-500'}`}
                      >
                        <Search className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(vendor.id)}
                        className={`p-1.5 rounded-lg transition-colors ${isDark ? 'hover:bg-red-500/20 text-red-400' : 'hover:bg-red-50 text-red-600'}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {vendor.email && (
                      <div className="flex items-center gap-2 text-sm text-slate-500">
                        <Mail className="w-4 h-4 shrink-0" />
                        <span className="truncate">{vendor.email}</span>
                      </div>
                    )}
                    {vendor.phone && (
                      <div className="flex items-center gap-2 text-sm text-slate-500">
                        <Phone className="w-4 h-4 shrink-0" />
                        <span>{vendor.phone}</span>
                      </div>
                    )}
                    {vendor.address && (
                      <div className="flex items-center gap-2 text-sm text-slate-500">
                        <MapPin className="w-4 h-4 shrink-0" />
                        <span className="truncate">{vendor.address}</span>
                      </div>
                    )}
                  </div>

                  <div className={`mt-4 pt-4 border-t flex items-center justify-between ${isDark ? 'border-white/5' : 'border-slate-200'}`}>
                    <span className={`text-[10px] font-black uppercase tracking-widest ${isDark ? 'text-[#B0B0C3]' : 'text-slate-400'}`}>
                      Terms: {vendor.paymentTerms}
                    </span>
                    {vendor.taxNumber && (
                      <span className={`text-[10px] font-black uppercase tracking-widest ${isDark ? 'text-[#B0B0C3]' : 'text-slate-400'}`}>
                        Tax: {vendor.taxNumber}
                      </span>
                    )}
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Add/Edit Vendor Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setIsModalOpen(false)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20}}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className={`relative w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden ${isDark ? 'bg-[#1E1E2F] border border-white/10' : 'bg-white'}`}
            >
              <div className={`p-6 border-b flex items-center justify-between ${isDark ? 'border-white/10' : 'border-slate-200'}`}>
                <h2 className={`text-xl font-black uppercase tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  {editingVendor ? 'Edit Vendor' : 'Add New Vendor'}
                </h2>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-white/10 text-[#B0B0C3]' : 'hover:bg-slate-100 text-slate-500'}`}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {errorMsg && (
                  <div className={`p-4 rounded-xl flex items-start gap-3 ${isDark ? 'bg-red-500/10 border border-red-500/20 text-red-400' : 'bg-red-50 border border-red-200 text-red-700'}`}>
                    <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                    <p className="text-sm">{errorMsg}</p>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className={`block text-xs font-bold uppercase tracking-widest mb-2 ${isDark ? 'text-[#B0B0C3]' : 'text-slate-500'}`}>
                      Vendor Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      placeholder="e.g. John Smith"
                      className={`w-full px-4 py-2.5 rounded-xl text-sm transition-all outline-none border ${
                        isDark 
                          ? 'bg-[#2A2A3D] border-white/10 text-white focus:border-[#00FFCC]' 
                          : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-indigo-500'
                      }`}
                    />
                  </div>

                  <div>
                    <label className={`block text-xs font-bold uppercase tracking-widest mb-2 ${isDark ? 'text-[#B0B0C3]' : 'text-slate-500'}`}>
                      Company Name
                    </label>
                    <input
                      type="text"
                      value={formData.companyName}
                      onChange={(e) => setFormData({...formData, companyName: e.target.value})}
                      placeholder="e.g. Acme Corp"
                      className={`w-full px-4 py-2.5 rounded-xl text-sm transition-all outline-none border ${
                        isDark 
                          ? 'bg-[#2A2A3D] border-white/10 text-white focus:border-[#00FFCC]' 
                          : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-indigo-500'
                      }`}
                    />
                  </div>

                  <div>
                    <label className={`block text-xs font-bold uppercase tracking-widest mb-2 ${isDark ? 'text-[#B0B0C3]' : 'text-slate-500'}`}>
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      placeholder="vendor@example.com"
                      className={`w-full px-4 py-2.5 rounded-xl text-sm transition-all outline-none border ${
                        isDark 
                          ? 'bg-[#2A2A3D] border-white/10 text-white focus:border-[#00FFCC]' 
                          : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-indigo-500'
                      }`}
                    />
                  </div>

                  <div>
                    <label className={`block text-xs font-bold uppercase tracking-widest mb-2 ${isDark ? 'text-[#B0B0C3]' : 'text-slate-500'}`}>
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      placeholder="+1 (555) 000-0000"
                      className={`w-full px-4 py-2.5 rounded-xl text-sm transition-all outline-none border ${
                        isDark 
                          ? 'bg-[#2A2A3D] border-white/10 text-white focus:border-[#00FFCC]' 
                          : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-indigo-500'
                      }`}
                    />
                  </div>

                  <div>
                    <label className={`block text-xs font-bold uppercase tracking-widest mb-2 ${isDark ? 'text-[#B0B0C3]' : 'text-slate-500'}`}>
                      Tax Number / VAT
                    </label>
                    <input
                      type="text"
                      value={formData.taxNumber}
                      onChange={(e) => setFormData({...formData, taxNumber: e.target.value})}
                      placeholder="e.g. TAX-123456"
                      className={`w-full px-4 py-2.5 rounded-xl text-sm transition-all outline-none border ${
                        isDark 
                          ? 'bg-[#2A2A3D] border-white/10 text-white focus:border-[#00FFCC]' 
                          : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-indigo-500'
                      }`}
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className={`block text-xs font-bold uppercase tracking-widest mb-2 ${isDark ? 'text-[#B0B0C3]' : 'text-slate-500'}`}>
                      Address
                    </label>
                    <textarea
                      value={formData.address}
                      onChange={(e) => setFormData({...formData, address: e.target.value})}
                      placeholder="Street, City, Country, Zip"
                      rows={2}
                      className={`w-full px-4 py-2.5 rounded-xl text-sm transition-all outline-none border resize-none ${
                        isDark 
                          ? 'bg-[#2A2A3D] border-white/10 text-white focus:border-[#00FFCC]' 
                          : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-indigo-500'
                      }`}
                    />
                  </div>

                  <div>
                    <label className={`block text-xs font-bold uppercase tracking-widest mb-2 ${isDark ? 'text-[#B0B0C3]' : 'text-slate-500'}`}>
                      Payment Terms
                    </label>
                    <select
                      value={formData.paymentTerms}
                      onChange={(e) => setFormData({...formData, paymentTerms: e.target.value})}
                      className={`w-full px-4 py-2.5 rounded-xl text-sm transition-all outline-none border ${
                        isDark 
                          ? 'bg-[#2A2A3D] border-white/10 text-white focus:border-[#00FFCC]' 
                          : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-indigo-500'
                      }`}
                    >
                      <option value="Due on Receipt">Due on Receipt</option>
                      <option value="Net 15">Net 15</option>
                      <option value="Net 30">Net 30</option>
                      <option value="Net 60">Net 60</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className={`px-4 py-2 rounded-lg font-bold text-sm uppercase tracking-widest transition-colors ${
                      isDark ? 'hover:bg-white/10 text-white' : 'hover:bg-slate-100 text-slate-900'
                    }`}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className={`px-6 py-2 rounded-lg font-bold text-sm uppercase tracking-widest transition-colors ${
                      isDark 
                        ? 'bg-[#00FFCC] text-[#1E1E2F] hover:bg-[#00D1FF] shadow-[0_0_8px_rgba(0,255,204,0.4)]' 
                        : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md'
                    }`}
                  >
                    {editingVendor ? 'Update Vendor' : 'Save Vendor'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </AccountingLayout>
  );
}
