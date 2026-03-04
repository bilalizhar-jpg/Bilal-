import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Search, X, Send, Save, Trash2, Mail } from 'lucide-react';
import AdminLayout from '../../components/AdminLayout';
import { useTheme } from '../../context/ThemeContext';
import { useEmployees } from '../../context/EmployeeContext';
import { useLetters } from '../../context/LetterContext';
import { useLocation } from 'react-router-dom';

export default function LetterManagement() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const location = useLocation();
  const { employees } = useEmployees();
  const { letters, templates, addLetter, updateLetterStatus, deleteLetter, addTemplate, deleteTemplate } = useLetters();

  // Determine category and type from URL
  const pathParts = location.pathname.split('/').filter(Boolean);
  const categorySlug = pathParts[0] || '';
  const typeSlug = pathParts[1] || '';
  
  const category = categorySlug === 'onboarding' ? 'Onboarding' : 'Offboarding';
  const typeName = typeSlug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'details' | 'template'>('details');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Form State
  const [isManualUser, setIsManualUser] = useState(false);
  const [formData, setFormData] = useState({
    userId: '',
    customName: '',
    customEmail: '',
    title: '',
    date: new Date().toISOString().slice(0, 16),
    description: '',
  });

  const [templateContent, setTemplateContent] = useState('');
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [newTemplateName, setNewTemplateName] = useState('');

  const filteredLetters = letters.filter(l => 
    l.category === category && 
    l.type === typeName &&
    (l.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
     (l.customName || '').toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleSave = (status: 'Saved' | 'Sent') => {
    addLetter({
      category,
      type: typeName,
      userId: isManualUser ? undefined : formData.userId,
      customName: isManualUser ? formData.customName : undefined,
      customEmail: isManualUser ? formData.customEmail : undefined,
      title: formData.title,
      date: formData.date,
      description: formData.description,
      status
    });
    
    setIsModalOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      userId: '',
      customName: '',
      customEmail: '',
      title: '',
      date: new Date().toISOString().slice(0, 16),
      description: '',
    });
    setIsManualUser(false);
    setActiveTab('details');
    setTemplateContent('');
    setSelectedTemplateId('');
    setNewTemplateName('');
  };

  const handleTemplateSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    setSelectedTemplateId(id);
    const template = templates.find(t => t.id === id);
    if (template) {
      setTemplateContent(template.content);
      setFormData(prev => ({ ...prev, description: template.content }));
    } else {
      setTemplateContent('');
    }
  };

  const handleSaveTemplate = () => {
    if (!newTemplateName || !templateContent) {
      alert('Please enter a template name and content.');
      return;
    }
    addTemplate({
      name: newTemplateName,
      content: templateContent
    });
    setNewTemplateName('');
    alert('Template saved successfully!');
  };

  const getUserName = (letter: any) => {
    if (letter.customName) return letter.customName;
    const emp = employees.find(e => e.id === letter.userId);
    return emp ? emp.name : 'Unknown User';
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{typeName}s</h1>
            <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Dashboard - {category} - {typeName}</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors w-full sm:w-auto"
          >
            <Plus className="w-4 h-4" />
            Add New {typeName}
          </button>

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

        <div className={`rounded-xl border overflow-hidden ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className={`border-b ${isDark ? 'border-slate-800 bg-slate-800/50' : 'border-slate-100 bg-slate-50/50'}`}>
                  <th className="px-4 py-3 w-12">
                    <input type="checkbox" className="rounded border-slate-300" />
                  </th>
                  <th className={`px-4 py-3 text-sm font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Title</th>
                  <th className={`px-4 py-3 text-sm font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>User</th>
                  <th className={`px-4 py-3 text-sm font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Date</th>
                  <th className={`px-4 py-3 text-sm font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Status</th>
                  <th className={`px-4 py-3 text-sm font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Action</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isDark ? 'divide-slate-800' : 'divide-slate-100'}`}>
                {filteredLetters.map((letter) => (
                  <tr key={letter.id} className={`hover:${isDark ? 'bg-slate-800/50' : 'bg-slate-50'} transition-colors`}>
                    <td className="px-4 py-3">
                      <input type="checkbox" className="rounded border-slate-300" />
                    </td>
                    <td className={`px-4 py-3 text-sm ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                      {letter.title}
                    </td>
                    <td className={`px-4 py-3 text-sm ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                      {getUserName(letter)}
                    </td>
                    <td className={`px-4 py-3 text-sm ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                      {new Date(letter.date).toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        letter.status === 'Sent' 
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' 
                          : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                      }`}>
                        {letter.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {letter.status === 'Saved' && (
                          <button 
                            onClick={() => updateLetterStatus(letter.id, 'Sent')}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                            title="Send Now"
                          >
                            <Send className="w-4 h-4" />
                          </button>
                        )}
                        <button 
                          onClick={() => deleteLetter(letter.id)}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredLetters.length === 0 && (
                  <tr>
                    <td colSpan={6} className={`px-4 py-12 text-center text-sm ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                      <div className="flex flex-col items-center justify-center">
                        <Mail className="w-12 h-12 mb-3 opacity-20" />
                        <p>No data</p>
                      </div>
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
                    Add New {typeName}
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

                <div className={`flex border-b px-6 ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
                  <button
                    onClick={() => setActiveTab('details')}
                    className={`py-3 px-4 text-sm font-medium border-b-2 transition-colors ${
                      activeTab === 'details' 
                        ? 'border-blue-500 text-blue-600 dark:text-blue-400' 
                        : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                    }`}
                  >
                    {typeName} Details
                  </button>
                  <button
                    onClick={() => setActiveTab('template')}
                    className={`py-3 px-4 text-sm font-medium border-b-2 transition-colors ${
                      activeTab === 'template' 
                        ? 'border-blue-500 text-blue-600 dark:text-blue-400' 
                        : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                    }`}
                  >
                    Letterhead Template
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6">
                  {activeTab === 'details' ? (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className={`text-sm font-medium flex items-center gap-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                            <span className="text-red-500">*</span> User
                          </label>
                          <div className="flex items-center gap-2">
                            {!isManualUser ? (
                              <select 
                                value={formData.userId}
                                onChange={(e) => setFormData({...formData, userId: e.target.value})}
                                className={`flex-1 px-3 py-2 rounded-lg border outline-none transition-all ${
                                  isDark 
                                    ? 'bg-slate-800 border-slate-700 text-white focus:border-blue-500' 
                                    : 'bg-white border-slate-200 text-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
                                }`}
                              >
                                <option value="">Select User...</option>
                                {employees.map(emp => (
                                  <option key={emp.id} value={emp.id}>{emp.name}</option>
                                ))}
                              </select>
                            ) : (
                              <div className="flex-1 flex flex-col gap-2">
                                <input 
                                  type="text"
                                  placeholder="Name"
                                  value={formData.customName}
                                  onChange={(e) => setFormData({...formData, customName: e.target.value})}
                                  className={`w-full px-3 py-2 rounded-lg border outline-none transition-all ${
                                    isDark 
                                      ? 'bg-slate-800 border-slate-700 text-white focus:border-blue-500' 
                                      : 'bg-white border-slate-200 text-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
                                  }`}
                                />
                                <input 
                                  type="email"
                                  placeholder="Email ID"
                                  value={formData.customEmail}
                                  onChange={(e) => setFormData({...formData, customEmail: e.target.value})}
                                  className={`w-full px-3 py-2 rounded-lg border outline-none transition-all ${
                                    isDark 
                                      ? 'bg-slate-800 border-slate-700 text-white focus:border-blue-500' 
                                      : 'bg-white border-slate-200 text-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
                                  }`}
                                />
                              </div>
                            )}
                            <button 
                              type="button"
                              onClick={() => setIsManualUser(!isManualUser)}
                              className={`p-2 rounded-full border border-blue-500 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors shrink-0 ${isManualUser ? 'bg-blue-50 dark:bg-blue-900/30' : ''}`}
                              title={isManualUser ? "Select from existing users" : "Add custom user"}
                            >
                              <Plus className={`w-5 h-5 transition-transform ${isManualUser ? 'rotate-45' : ''}`} />
                            </button>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label className={`text-sm font-medium flex items-center gap-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                            <span className="text-red-500">*</span> Title
                          </label>
                          <input 
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
                          <span className="text-red-500">*</span> {typeName} Date
                        </label>
                        <input 
                          type="datetime-local"
                          value={formData.date}
                          onChange={(e) => setFormData({...formData, date: e.target.value})}
                          className={`w-full px-3 py-2 rounded-lg border outline-none transition-all ${
                            isDark 
                              ? 'bg-slate-800 border-slate-700 text-white focus:border-blue-500' 
                              : 'bg-white border-slate-200 text-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
                          }`}
                        />
                      </div>

                      <div className="space-y-2">
                        <label className={`text-sm font-medium flex items-center gap-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                          Description
                        </label>
                        <textarea 
                          rows={10}
                          placeholder="Please Enter Description"
                          value={formData.description}
                          onChange={(e) => setFormData({...formData, description: e.target.value})}
                          className={`w-full px-3 py-2 rounded-lg border outline-none transition-all resize-none font-mono text-sm ${
                            isDark 
                              ? 'bg-slate-800 border-slate-700 text-white focus:border-blue-500' 
                              : 'bg-white border-slate-200 text-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
                          }`}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <label className={`text-sm font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                          Select Existing Template
                        </label>
                        <select 
                          value={selectedTemplateId}
                          onChange={handleTemplateSelect}
                          className={`w-full px-3 py-2 rounded-lg border outline-none transition-all ${
                            isDark 
                              ? 'bg-slate-800 border-slate-700 text-white focus:border-blue-500' 
                              : 'bg-white border-slate-200 text-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
                          }`}
                        >
                          <option value="">-- Select Template --</option>
                          {templates.map(t => (
                            <option key={t.id} value={t.id}>{t.name}</option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-2">
                        <label className={`text-sm font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                          Template Content
                        </label>
                        <textarea 
                          rows={10}
                          value={templateContent}
                          onChange={(e) => {
                            setTemplateContent(e.target.value);
                            setFormData(prev => ({ ...prev, description: e.target.value }));
                          }}
                          placeholder="Write or paste your template content here..."
                          className={`w-full px-3 py-2 rounded-lg border outline-none transition-all resize-none font-mono text-sm ${
                            isDark 
                              ? 'bg-slate-800 border-slate-700 text-white focus:border-blue-500' 
                              : 'bg-white border-slate-200 text-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
                          }`}
                        />
                      </div>

                      <div className="space-y-2 pt-4 border-t border-slate-200 dark:border-slate-800">
                        <label className={`text-sm font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                          Save as New Template
                        </label>
                        <div className="flex gap-2">
                          <input 
                            type="text"
                            placeholder="New Template Name"
                            value={newTemplateName}
                            onChange={(e) => setNewTemplateName(e.target.value)}
                            className={`flex-1 px-3 py-2 rounded-lg border outline-none transition-all ${
                              isDark 
                                ? 'bg-slate-800 border-slate-700 text-white focus:border-blue-500' 
                                : 'bg-white border-slate-200 text-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
                            }`}
                          />
                          <button 
                            type="button"
                            onClick={handleSaveTemplate}
                            className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                          >
                            Save Template
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className={`p-6 border-t flex justify-end gap-3 ${isDark ? 'border-slate-800 bg-slate-900' : 'border-slate-100 bg-white'}`}>
                  <button 
                    type="button"
                    onClick={() => handleSave('Saved')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors ${
                      isDark 
                        ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' 
                        : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <Save className="w-4 h-4" />
                    Save
                  </button>
                  <button 
                    type="button"
                    onClick={() => handleSave('Sent')}
                    className="px-4 py-2 rounded-lg text-sm font-medium bg-blue-500 hover:bg-blue-600 text-white flex items-center gap-2 transition-colors"
                  >
                    <Send className="w-4 h-4" />
                    Send Now
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
