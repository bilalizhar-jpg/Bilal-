import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { useTheme } from '../../context/ThemeContext';
import { Save, Building2, Globe, Mail, Phone, MapPin, Plus, Trash2, Info } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useSuperAdmin, CompanyAddress } from '../../context/SuperAdminContext';
import { useSettings } from '../../context/SettingsContext';

export default function GeneralSettings() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const { user } = useAuth();
  const { companies, updateCompany } = useSuperAdmin();
  const settings = useSettings();

  const [formData, setFormData] = useState({
    name: '',
    website: '',
    email: '',
    phone: '',
    address: '',
    logo: '',
    aboutUs: '',
    addresses: [] as CompanyAddress[]
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    if (user?.companyId) {
      const currentCompany = companies.find(c => c.id === user.companyId);
      if (currentCompany) {
        setFormData({
          name: currentCompany.name || '',
          website: currentCompany.website || '',
          email: currentCompany.email || '',
          phone: currentCompany.phone || '',
          address: currentCompany.address || '',
          logo: currentCompany.logo || '',
          aboutUs: currentCompany.aboutUs || '',
          addresses: currentCompany.addresses || []
        });
      }
    }
  }, [user, companies]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddAddress = () => {
    const newAddress: CompanyAddress = {
      id: Date.now().toString(),
      label: '',
      address: ''
    };
    setFormData(prev => ({
      ...prev,
      addresses: [...prev.addresses, newAddress]
    }));
  };

  const handleRemoveAddress = (id: string) => {
    setFormData(prev => ({
      ...prev,
      addresses: prev.addresses.filter(a => a.id !== id)
    }));
  };

  const handleUpdateAddress = (id: string, field: 'label' | 'address', value: string) => {
    setFormData(prev => ({
      ...prev,
      addresses: prev.addresses.map(a => a.id === id ? { ...a, [field]: value } : a)
    }));
  };

  const handleSave = async () => {
    if (!user?.companyId) return;
    
    setLoading(true);
    setMessage(null);

    try {
      const currentCompany = companies.find(c => c.id === user.companyId);
      if (currentCompany) {
        await updateCompany({ ...currentCompany, ...formData });
        setMessage({ type: 'success', text: 'Settings updated successfully!' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to update settings.' });
    } finally {
      setLoading(false);
    }
  };

  const handleLogoChange = () => {
    const newLogo = prompt("Enter logo URL:", formData.logo);
    if (newLogo !== null) {
      setFormData(prev => ({ ...prev, logo: newLogo }));
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className={`rounded-xl border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} shadow-sm overflow-hidden`}>
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-indigo-600" />
            <h2 className="font-bold text-slate-800 dark:text-white">Company Profile</h2>
          </div>
          
          <div className="p-6 space-y-6">
            {message && (
              <div className={`p-4 rounded-lg text-sm font-medium ${message.type === 'success' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                {message.text}
              </div>
            )}

            <div className="flex items-center gap-6 pb-6 border-b border-slate-100 dark:border-slate-800">
              <div className="w-24 h-24 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center border-2 border-dashed border-slate-200 dark:border-slate-700 overflow-hidden relative">
                {formData.logo ? (
                  <img src={formData.logo} alt="Company Logo" className="w-full h-full object-cover" />
                ) : (
                  <Building2 className="w-8 h-8 text-slate-400" />
                )}
              </div>
              <div>
                <button 
                  onClick={handleLogoChange}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-indigo-700"
                >
                  Change Logo
                </button>
                <p className="text-xs text-slate-500 mt-2">Recommended size: 200x200px. Max 2MB.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-slate-400" /> Company Name
                </label>
                <input 
                  type="text" 
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={`w-full border rounded px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-indigo-500 ${isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200'}`}
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  <Globe className="w-4 h-4 text-slate-400" /> Website
                </label>
                <input 
                  type="url" 
                  name="website"
                  value={formData.website}
                  onChange={handleChange}
                  className={`w-full border rounded px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-indigo-500 ${isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200'}`}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  <Mail className="w-4 h-4 text-slate-400" /> Official Email
                </label>
                <input 
                  type="email" 
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full border rounded px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-indigo-500 ${isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200'}`}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  <Phone className="w-4 h-4 text-slate-400" /> Phone Number
                </label>
                <input 
                  type="tel" 
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className={`w-full border rounded px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-indigo-500 ${isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200'}`}
                />
              </div>

              <div className="md:col-span-2 space-y-2">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  <Info className="w-4 h-4 text-slate-400" /> About Us
                </label>
                <textarea 
                  name="aboutUs"
                  value={formData.aboutUs}
                  onChange={handleChange}
                  placeholder="Tell us about your company..."
                  className={`w-full border rounded px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-indigo-500 h-32 ${isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200'}`}
                />
              </div>

              <div className="md:col-span-2 space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-slate-400" /> Company Addresses (Branches, Factories, etc.)
                  </label>
                  <button 
                    onClick={handleAddAddress}
                    className="flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-700"
                  >
                    <Plus className="w-3 h-3" /> Add Address
                  </button>
                </div>

                <div className="space-y-4">
                  {formData.addresses.map((addr, index) => (
                    <div key={addr.id} className={`p-4 rounded-lg border ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'} space-y-3`}>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Address #{index + 1}</span>
                        <button 
                          onClick={() => handleRemoveAddress(addr.id)}
                          className="text-red-500 hover:text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="md:col-span-1 space-y-1">
                          <label className="text-[10px] font-bold text-slate-500 uppercase">Label</label>
                          <input 
                            type="text"
                            placeholder="e.g. Head Office"
                            value={addr.label}
                            onChange={(e) => handleUpdateAddress(addr.id, 'label', e.target.value)}
                            className={`w-full border rounded px-3 py-1.5 text-xs outline-none focus:ring-1 focus:ring-indigo-500 ${isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-200'}`}
                          />
                        </div>
                        <div className="md:col-span-3 space-y-1">
                          <label className="text-[10px] font-bold text-slate-500 uppercase">Full Address</label>
                          <input 
                            type="text"
                            placeholder="Enter full address"
                            value={addr.address}
                            onChange={(e) => handleUpdateAddress(addr.id, 'address', e.target.value)}
                            className={`w-full border rounded px-3 py-1.5 text-xs outline-none focus:ring-1 focus:ring-indigo-500 ${isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-200'}`}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                  {formData.addresses.length === 0 && (
                    <div className="text-center py-8 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                      <MapPin className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                      <p className="text-sm text-slate-500">No additional addresses added yet.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-800 mt-6">
              <button 
                onClick={handleSave}
                disabled={loading}
                className="bg-indigo-600 text-white px-6 py-2 rounded text-sm font-bold hover:bg-indigo-700 flex items-center gap-2 disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {loading ? 'Saving...' : 'Save Company Profile'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
