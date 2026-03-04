import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Search, MoreVertical, X, Upload, FileText } from 'lucide-react';
import AdminLayout from '../components/AdminLayout';
import { useTheme } from '../context/ThemeContext';
import { usePolicies } from '../context/PolicyContext';
import jsPDF from 'jspdf';

export default function CompanyPolicies() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const { policies, addPolicy, deletePolicy } = usePolicies();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  
  const [formData, setFormData] = useState({
    location: '',
    title: '',
    description: '',
    methodType: 'upload' as 'upload' | 'create',
    content: '',
    fileName: ''
  });

  const locations = ['Head Office', 'Branch Office 1', 'Branch Office 2'];

  const filteredPolicies = policies.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          p.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLocation = locationFilter ? p.location === locationFilter : true;
    return matchesSearch && matchesLocation;
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    addPolicy({
      location: formData.location,
      title: formData.title,
      description: formData.description,
      methodType: formData.methodType,
      content: formData.content,
      fileName: formData.fileName
    });
    setIsModalOpen(false);
    setFormData({
      location: '',
      title: '',
      description: '',
      methodType: 'upload',
      content: '',
      fileName: ''
    });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData({ ...formData, fileName: file.name });
      // In a real app, we would upload the file to a server or convert to base64
      // For this demo, we'll just store the name to simulate upload
    }
  };

  const handleViewPdf = (policy: any) => {
    if (policy.methodType === 'create' && policy.content) {
      const doc = new jsPDF();
      doc.setFontSize(18);
      doc.text(policy.title, 14, 22);
      
      doc.setFontSize(12);
      doc.text(`Location: ${policy.location}`, 14, 32);
      doc.text(`Date Added: ${policy.dateAdded}`, 14, 40);
      
      doc.setFontSize(10);
      const splitText = doc.splitTextToSize(policy.content, 180);
      doc.text(splitText, 14, 55);
      
      doc.save(`${policy.title.replace(/\s+/g, '_')}.pdf`);
    } else {
      alert(`This would download the uploaded file: ${policy.fileName}`);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Company Policies</h1>
            <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Dashboard - Company Policies</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors w-full sm:w-auto"
          >
            <Plus className="w-4 h-4" />
            Add New Company Policy
          </button>

          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <select
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              className={`px-3 py-2 rounded-lg border text-sm outline-none w-full sm:w-48 ${
                isDark 
                  ? 'bg-slate-800 border-slate-700 text-white' 
                  : 'bg-white border-slate-200 text-slate-700'
              }`}
            >
              <option value="">Select Location...</option>
              {locations.map(loc => (
                <option key={loc} value={loc}>{loc}</option>
              ))}
            </select>
            
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text"
                placeholder="Search By Title"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full pl-9 pr-4 py-2 rounded-lg border text-sm outline-none ${
                  isDark 
                    ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500' 
                    : 'bg-white border-slate-200 text-slate-700 placeholder-slate-400'
                }`}
              />
            </div>
          </div>
        </div>

        <div className={`rounded-xl border overflow-hidden ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className={`border-b ${isDark ? 'border-slate-800 bg-slate-800/50' : 'border-slate-100 bg-slate-50/50'}`}>
                  <th className="px-4 py-3 w-12">
                    <input type="checkbox" className="rounded border-slate-300" />
                  </th>
                  <th className={`px-4 py-3 text-sm font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Location</th>
                  <th className={`px-4 py-3 text-sm font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Title</th>
                  <th className={`px-4 py-3 text-sm font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Description</th>
                  <th className={`px-4 py-3 text-sm font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Action</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isDark ? 'divide-slate-800' : 'divide-slate-100'}`}>
                {filteredPolicies.map((policy) => (
                  <tr key={policy.id} className={`hover:${isDark ? 'bg-slate-800/50' : 'bg-slate-50'} transition-colors`}>
                    <td className="px-4 py-3">
                      <input type="checkbox" className="rounded border-slate-300" />
                    </td>
                    <td className={`px-4 py-3 text-sm ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                      {policy.location}
                    </td>
                    <td className={`px-4 py-3 text-sm ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                      {policy.title}
                    </td>
                    <td className={`px-4 py-3 text-sm ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                      {policy.description}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => handleViewPdf(policy)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                          title="View PDF"
                        >
                          <FileText className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => deletePolicy(policy.id)}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                          title="Delete"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredPolicies.length === 0 && (
                  <tr>
                    <td colSpan={5} className={`px-4 py-8 text-center text-sm ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                      No company policies found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Slide-over Modal */}
        <AnimatePresence>
          {isModalOpen && (
            <>
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsModalOpen(false)}
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
              />
              <motion.div 
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className={`fixed inset-y-0 right-0 w-full max-w-2xl shadow-2xl z-50 flex flex-col ${
                  isDark ? 'bg-slate-900' : 'bg-white'
                }`}
              >
                <div className={`flex items-center justify-between p-6 border-b ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
                  <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-slate-800'}`}>
                    Add New Company Policy
                  </h2>
                  <button 
                    onClick={() => setIsModalOpen(false)}
                    className={`p-2 rounded-full transition-colors ${
                      isDark ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-100 text-slate-500'
                    }`}
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6">
                  <form id="policy-form" onSubmit={handleSave} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className={`text-sm font-medium flex items-center gap-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                          <span className="text-red-500">*</span> Location
                        </label>
                        <select 
                          required
                          value={formData.location}
                          onChange={(e) => setFormData({...formData, location: e.target.value})}
                          className={`w-full px-3 py-2 rounded-lg border outline-none transition-all ${
                            isDark 
                              ? 'bg-slate-800 border-slate-700 text-white focus:border-blue-500' 
                              : 'bg-white border-slate-200 text-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
                          }`}
                        >
                          <option value="">Select Location...</option>
                          {locations.map(loc => (
                            <option key={loc} value={loc}>{loc}</option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-2">
                        <label className={`text-sm font-medium flex items-center gap-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                          <span className="text-red-500">*</span> Title
                        </label>
                        <input 
                          required
                          type="text"
                          placeholder="Please Enter Title"
                          value={formData.title}
                          onChange={(e) => setFormData({...formData, title: e.target.value})}
                          className={`w-full px-3 py-2 rounded-lg border outline-none transition-all ${
                            isDark 
                              ? 'bg-slate-800 border-slate-700 text-white focus:border-blue-500' 
                              : 'bg-white border-slate-200 text-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
                          }`}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className={`text-sm font-medium flex items-center gap-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                        <span className="text-red-500">*</span> Description
                      </label>
                      <textarea 
                        required
                        rows={4}
                        placeholder="Please Enter Description"
                        value={formData.description}
                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                        className={`w-full px-3 py-2 rounded-lg border outline-none transition-all resize-none ${
                          isDark 
                            ? 'bg-slate-800 border-slate-700 text-white focus:border-blue-500' 
                            : 'bg-white border-slate-200 text-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
                        }`}
                      />
                    </div>

                    <div className="space-y-3">
                      <label className={`text-sm font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                        Method Type
                      </label>
                      <div className="flex items-center gap-6">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input 
                            type="radio" 
                            name="methodType" 
                            value="upload"
                            checked={formData.methodType === 'upload'}
                            onChange={() => setFormData({...formData, methodType: 'upload'})}
                            className="w-4 h-4 text-blue-600 border-slate-300 focus:ring-blue-500"
                          />
                          <span className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Upload File</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input 
                            type="radio" 
                            name="methodType" 
                            value="create"
                            checked={formData.methodType === 'create'}
                            onChange={() => setFormData({...formData, methodType: 'create'})}
                            className="w-4 h-4 text-blue-600 border-slate-300 focus:ring-blue-500"
                          />
                          <span className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Create File</span>
                        </label>
                      </div>
                    </div>

                    {formData.methodType === 'upload' ? (
                      <div className="space-y-2">
                        <label className={`text-sm font-medium flex items-center gap-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                          <span className="text-red-500">*</span> Policy Document
                        </label>
                        <div className="flex items-center gap-4">
                          <label className={`cursor-pointer flex items-center gap-2 px-4 py-2 border rounded-lg text-sm font-medium transition-colors ${
                            isDark 
                              ? 'border-slate-700 hover:bg-slate-800 text-slate-300' 
                              : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                          }`}>
                            <Upload className="w-4 h-4" />
                            Upload
                            <input 
                              type="file" 
                              className="hidden" 
                              onChange={handleFileUpload}
                              accept=".pdf,.doc,.docx"
                            />
                          </label>
                          {formData.fileName && (
                            <span className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                              {formData.fileName}
                            </span>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <label className={`text-sm font-medium flex items-center gap-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                          <span className="text-red-500">*</span> Policy Content
                        </label>
                        <textarea 
                          required={formData.methodType === 'create'}
                          rows={10}
                          placeholder="Enter policy content here..."
                          value={formData.content}
                          onChange={(e) => setFormData({...formData, content: e.target.value})}
                          className={`w-full px-3 py-2 rounded-lg border outline-none transition-all resize-none font-mono text-sm ${
                            isDark 
                              ? 'bg-slate-800 border-slate-700 text-white focus:border-blue-500' 
                              : 'bg-white border-slate-200 text-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
                          }`}
                        />
                      </div>
                    )}
                  </form>
                </div>

                <div className={`p-6 border-t flex justify-end gap-3 ${isDark ? 'border-slate-800 bg-slate-900' : 'border-slate-100 bg-white'}`}>
                  <button 
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isDark 
                        ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' 
                        : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    form="policy-form"
                    className="px-4 py-2 rounded-lg text-sm font-medium bg-blue-500 hover:bg-blue-600 text-white transition-colors"
                  >
                    Create
                  </button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </AdminLayout>
  );
}
