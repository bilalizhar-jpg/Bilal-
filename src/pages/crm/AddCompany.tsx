import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Home, Upload, X, ChevronDown, Star, Plus } from 'lucide-react';
import AdminLayout from '../../components/AdminLayout';
import { useCompanyData } from '../../context/CompanyDataContext';
import { useTheme } from '../../context/ThemeContext';

export default function AddCompany() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const { addEntity, updateEntity, companies } = useCompanyData();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone1: '',
    phone2: '',
    fax: '',
    website: '',
    reviews: '',
    owner: '',
    tags: '',
    deals: '',
    source: '',
    industry: '',
    contacts: '',
    currency: '',
    description: '',
    streetAddress: '',
    country: '',
    state: '',
    city: '',
    zipcode: '',
    facebook: '',
    skype: '',
    linkedin: '',
    twitter: '',
    whatsapp: '',
    instagram: ''
  });

  const [logo, setLogo] = useState<string | null>(null);

  useEffect(() => {
    if (isEditMode && companies.length > 0) {
      const companyToEdit = companies.find(c => c.id === id);
      if (companyToEdit) {
        setFormData({
          name: companyToEdit.name || '',
          email: companyToEdit.email || '',
          phone1: companyToEdit.phone1 || '',
          phone2: companyToEdit.phone2 || '',
          fax: companyToEdit.fax || '',
          website: companyToEdit.website || '',
          reviews: companyToEdit.reviews || '',
          owner: companyToEdit.owner || '',
          tags: Array.isArray(companyToEdit.tags) ? companyToEdit.tags.join(', ') : companyToEdit.tags || '',
          deals: companyToEdit.deals || '',
          source: companyToEdit.source || '',
          industry: companyToEdit.industry || '',
          contacts: companyToEdit.contacts || '',
          currency: companyToEdit.currency || '',
          description: companyToEdit.description || '',
          streetAddress: companyToEdit.streetAddress || '',
          country: companyToEdit.country || '',
          state: companyToEdit.state || '',
          city: companyToEdit.city || '',
          zipcode: companyToEdit.zipcode || '',
          facebook: companyToEdit.facebook || '',
          skype: companyToEdit.skype || '',
          linkedin: companyToEdit.linkedin || '',
          twitter: companyToEdit.twitter || '',
          whatsapp: companyToEdit.whatsapp || '',
          instagram: companyToEdit.instagram || ''
        });
        if (companyToEdit.logo) {
          setLogo(companyToEdit.logo);
        }
      }
    }
  }, [id, isEditMode, companies]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 800 * 1024) {
        alert('File size must be less than 800KB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogo(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const dataToSave = {
      ...formData,
      logo,
      tags: formData.tags ? formData.tags.split(',').map(t => t.trim()).filter(Boolean) : []
    };
    if (isEditMode && id) {
      await updateEntity('companies', id, dataToSave);
    } else {
      await addEntity('companies', dataToSave);
    }
    navigate('/crm/companies');
  };

  const inputClass = `w-full px-3 py-2 rounded-md border ${isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300'}`;

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>{isEditMode ? 'Edit Company' : 'Add New Company'}</h1>
          <div className="flex gap-2">
            <button onClick={() => navigate(-1)} className="px-4 py-2 bg-slate-200 text-slate-800 rounded-md">Back</button>
            <button onClick={() => navigate('/dashboard')} className="px-4 py-2 bg-slate-200 text-slate-800 rounded-md">Back to Dashboard</button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className={`p-6 rounded-xl border ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
          <div className="space-y-6">
            {/* Basic Info */}
            <div className={`p-4 rounded-lg border ${isDark ? 'bg-slate-900 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
              <h2 className="font-semibold mb-4 flex items-center gap-2"><div className="p-1 bg-red-500 rounded text-white"><Plus size={16}/></div> Basic Info</h2>
              
              <div className="flex gap-4 mb-4">
                <div className="w-24 h-24 border-2 border-dashed border-slate-300 rounded-lg flex items-center justify-center overflow-hidden relative">
                  {logo ? (
                    <img src={logo} alt="Company Logo" className="w-full h-full object-cover" />
                  ) : (
                    <Upload className="text-slate-400" />
                  )}
                  <input 
                    type="file" 
                    accept="image/jpeg, image/png, image/gif" 
                    onChange={handleImageUpload} 
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                </div>
                <div className="flex flex-col justify-center">
                  <button type="button" className="px-4 py-2 bg-red-600 text-white rounded text-sm relative overflow-hidden">
                    Upload file
                    <input 
                      type="file" 
                      accept="image/jpeg, image/png, image/gif" 
                      onChange={handleImageUpload} 
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                  </button>
                  <p className="text-xs text-slate-500 mt-2">JPG, GIF or PNG. Max size of 800K</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium mb-1">Company Name*</label>
                  <input name="name" value={formData.name} onChange={handleChange} className={inputClass} required />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium mb-1">Email*</label>
                  <input name="email" type="email" value={formData.email} onChange={handleChange} className={inputClass} required />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Phone 1</label>
                  <input name="phone1" value={formData.phone1} onChange={handleChange} className={inputClass} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Phone 2</label>
                  <input name="phone2" value={formData.phone2} onChange={handleChange} className={inputClass} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Fax</label>
                  <input name="fax" value={formData.fax} onChange={handleChange} className={inputClass} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Website</label>
                  <input name="website" value={formData.website} onChange={handleChange} className={inputClass} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Reviews</label>
                  <input name="reviews" value={formData.reviews} onChange={handleChange} className={inputClass} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Owner</label>
                  <input name="owner" value={formData.owner} onChange={handleChange} className={inputClass} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Tags</label>
                  <input name="tags" value={formData.tags} onChange={handleChange} className={inputClass} placeholder="Enter value separated by comma" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Deals</label>
                  <input name="deals" value={formData.deals} onChange={handleChange} className={inputClass} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Source</label>
                  <input name="source" value={formData.source} onChange={handleChange} className={inputClass} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Industry</label>
                  <input name="industry" value={formData.industry} onChange={handleChange} className={inputClass} />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium mb-1">Description</label>
                  <textarea name="description" value={formData.description} onChange={handleChange} className={inputClass} rows={4} />
                </div>
              </div>
            </div>

            {/* Address Info */}
            <div className={`p-4 rounded-lg border ${isDark ? 'bg-slate-900 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
              <h2 className="font-semibold mb-4 flex items-center gap-2"><div className="p-1 bg-red-500 rounded text-white"><Plus size={16}/></div> Address Info</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium mb-1">Street Address</label>
                  <input name="streetAddress" value={formData.streetAddress} onChange={handleChange} className={inputClass} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Country</label>
                  <input name="country" value={formData.country} onChange={handleChange} className={inputClass} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">State / Province</label>
                  <input name="state" value={formData.state} onChange={handleChange} className={inputClass} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">City</label>
                  <input name="city" value={formData.city} onChange={handleChange} className={inputClass} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Zipcode</label>
                  <input name="zipcode" value={formData.zipcode} onChange={handleChange} className={inputClass} />
                </div>
              </div>
            </div>

            {/* Social Profile */}
            <div className={`p-4 rounded-lg border ${isDark ? 'bg-slate-900 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
              <h2 className="font-semibold mb-4 flex items-center gap-2"><div className="p-1 bg-red-500 rounded text-white"><Plus size={16}/></div> Social Profile</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Facebook</label>
                  <input name="facebook" value={formData.facebook} onChange={handleChange} className={inputClass} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Skype</label>
                  <input name="skype" value={formData.skype} onChange={handleChange} className={inputClass} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Linkedin</label>
                  <input name="linkedin" value={formData.linkedin} onChange={handleChange} className={inputClass} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Twitter</label>
                  <input name="twitter" value={formData.twitter} onChange={handleChange} className={inputClass} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Whatsapp</label>
                  <input name="whatsapp" value={formData.whatsapp} onChange={handleChange} className={inputClass} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Instagram</label>
                  <input name="instagram" value={formData.instagram} onChange={handleChange} className={inputClass} />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-4">
              <button type="button" onClick={() => navigate(-1)} className="px-6 py-2 bg-slate-200 text-slate-800 rounded-md">Cancel</button>
              <button type="submit" className="px-6 py-2 bg-red-600 text-white rounded-md">{isEditMode ? 'Update Company' : 'Create New'}</button>
            </div>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}